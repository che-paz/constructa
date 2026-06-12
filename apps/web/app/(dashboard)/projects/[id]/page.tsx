import { Suspense } from "react";
import { redirect } from "next/navigation";
import type {
  Expense,
  MaterialAlert,
  MaterialCatalog,
  MaterialSummary,
  Payment,
  PayrollSummary,
  Project,
  ProjectFinancialSummary,
  ProjectSummary,
  ScheduleSummary,
  Stage,
  Worker,
  WorkerAdvance,
  WorkerAttendance,
} from "@constructa/types";
import { getAuthContext } from "@/lib/auth/get-organization";
import { buildProjectFinancialSummary } from "@/lib/finance/summary";
import { buildMaterialAlerts, buildMaterialSummary } from "@/lib/materials/summary";
import { computePaymentBalance } from "@/lib/payments/balance";
import { enrichStageWithDelay, isStageCriticallyDelayed } from "@/lib/schedule/delay";
import { buildPayrollSummary } from "@/lib/workers/payroll";
import { createClient } from "@/lib/supabase/server";
import { ProjectDashboard } from "@/components/modules/projects/project-dashboard";

interface Props {
  params: { id: string };
}

export default async function ProjectDetailPage({ params }: Props) {
  const auth = await getAuthContext();
  if (!auth) redirect("/onboarding");

  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", params.id)
    .eq("organization_id", auth.organization.id)
    .is("deleted_at", null)
    .single();

  if (!project) redirect("/projects");

  const [
    { data: stagesRaw },
    { data: payments },
    { data: catalog },
    { data: materialEntries },
    { data: budgets },
    { data: workers },
    { data: attendance },
    { data: advances },
    { data: expenseRows },
    { data: allAttendance },
    { data: allMaterials },
    { data: reports },
  ] = await Promise.all([
    supabase
      .from("stages")
      .select("*")
      .eq("project_id", params.id)
      .eq("organization_id", auth.organization.id)
      .order("order_index", { ascending: true }),
    supabase
      .from("payments")
      .select("*")
      .eq("project_id", params.id)
      .eq("organization_id", auth.organization.id)
      .is("deleted_at", null)
      .order("payment_date", { ascending: false }),
    supabase
      .from("material_catalog")
      .select("*")
      .eq("organization_id", auth.organization.id)
      .order("name", { ascending: true }),
    supabase
      .from("material_entries")
      .select("*, material:material_catalog(*)")
      .eq("project_id", params.id)
      .eq("organization_id", auth.organization.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("stage_material_budgets")
      .select("*, stage:stages(name), material:material_catalog(name, unit)")
      .eq("project_id", params.id)
      .eq("organization_id", auth.organization.id),
    supabase
      .from("workers")
      .select("*")
      .eq("organization_id", auth.organization.id)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    supabase
      .from("worker_attendance")
      .select("*, worker:workers(*)")
      .eq("project_id", params.id)
      .eq("organization_id", auth.organization.id)
      .order("work_date", { ascending: false }),
    supabase
      .from("worker_advances")
      .select("*")
      .eq("project_id", params.id)
      .eq("organization_id", auth.organization.id),
    supabase
      .from("expenses")
      .select("*")
      .eq("project_id", params.id)
      .eq("organization_id", auth.organization.id)
      .is("deleted_at", null)
      .order("expense_date", { ascending: false }),
    supabase
      .from("worker_attendance")
      .select("project_id, amount_paid, work_date")
      .eq("project_id", params.id)
      .eq("organization_id", auth.organization.id),
    supabase
      .from("material_entries")
      .select("project_id, total_cost, created_at")
      .eq("project_id", params.id)
      .eq("organization_id", auth.organization.id)
      .is("deleted_at", null),
    supabase
      .from("reports")
      .select(
        "id, report_type, period_start, period_end, ai_narrative, created_at",
      )
      .eq("project_id", params.id)
      .eq("organization_id", auth.organization.id)
      .order("created_at", { ascending: false }),
  ]);

  const stages = ((stagesRaw ?? []) as Stage[]).map((s) =>
    enrichStageWithDelay(s),
  );

  const progress_pct =
    stages.length > 0
      ? Math.round(
          stages.reduce((sum, s) => sum + (s.progress_pct ?? 0), 0) /
            stages.length,
        )
      : 0;

  const schedule: ScheduleSummary = {
    project_id: params.id,
    total_stages: stages.length,
    completed_stages: stages.filter((s) => s.status === "completed").length,
    delayed_stages: stages.filter((s) => isStageCriticallyDelayed(s)).length,
    total_delay_days: stages.reduce((sum, s) => sum + (s.delay_days ?? 0), 0),
    progress_pct,
    stages,
  };

  const materialSummary: MaterialSummary = buildMaterialSummary(
    params.id,
    budgets ?? [],
    materialEntries ?? [],
  );
  const materialAlerts: MaterialAlert[] = buildMaterialAlerts(materialSummary);

  const balance = computePaymentBalance(
    project.total_budget,
    project.client_advance,
    payments ?? [],
  );

  const payroll: PayrollSummary = buildPayrollSummary(
    params.id,
    (workers ?? []) as Worker[],
    (attendance ?? []) as WorkerAttendance[],
    undefined,
    (advances ?? []) as WorkerAdvance[],
  );

  const financialSummary: ProjectFinancialSummary = buildProjectFinancialSummary(
    {
      id: project.id,
      name: project.name,
      status: project.status,
      total_budget: project.total_budget,
      client_advance: project.client_advance,
    },
    (payments ?? []).map((p) => ({
      project_id: p.project_id,
      amount: p.amount,
      payment_date: p.payment_date,
    })),
    (expenseRows ?? []).map((e) => ({
      project_id: e.project_id,
      amount: e.amount,
      expense_date: e.expense_date,
    })),
    allMaterials ?? [],
    allAttendance ?? [],
    (stagesRaw ?? []).map((s) => ({
      project_id: s.project_id,
      progress_pct: s.progress_pct,
    })),
  );

  const summary: ProjectSummary = {
    id: project.id,
    name: project.name,
    status: project.status,
    total_budget: project.total_budget,
    client_advance: project.client_advance,
    progress_pct,
    stages_count: stages.length,
  };

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
  const clientPortalUrl = project.client_token
    ? `${appUrl}/client/${project.client_token}`
    : null;

  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-sm text-muted-foreground">
          Cargando proyecto…
        </div>
      }
    >
      <ProjectDashboard
        project={project as Project}
        summary={summary}
        schedule={schedule}
        balance={balance}
        payments={(payments ?? []) as Payment[]}
        catalog={(catalog ?? []) as MaterialCatalog[]}
        materialEntries={materialEntries ?? []}
        materialSummary={materialSummary}
        materialAlerts={materialAlerts}
        workers={(workers ?? []) as Worker[]}
        attendance={(attendance ?? []) as WorkerAttendance[]}
        advances={(advances ?? []) as WorkerAdvance[]}
        payroll={payroll}
        financialSummary={financialSummary}
        expenses={(expenseRows ?? []) as Expense[]}
        reports={reports ?? []}
        clientPortalUrl={clientPortalUrl}
      />
    </Suspense>
  );
}
