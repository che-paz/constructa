import type { ReportDataSnapshot } from "@constructa/types";
import { getWeekEnd, getWeekStart } from "@constructa/utils";
import { buildProjectFinancialSummary } from "@/lib/finance/summary";
import { buildMaterialSummary } from "@/lib/materials/summary";
import { enrichStageWithDelay, isStageCriticallyDelayed } from "@/lib/schedule/delay";
import { buildPayrollSummary } from "@/lib/workers/payroll";
import { createClient } from "@/lib/supabase/server";

export interface ReportPeriod {
  start: string;
  end: string;
}

export function resolveReportPeriod(
  reportType: "weekly" | "monthly" | "milestone",
  periodStart?: string,
  periodEnd?: string,
): ReportPeriod {
  if (periodStart && periodEnd) {
    return { start: periodStart, end: periodEnd };
  }

  if (reportType === "weekly") {
    const start = getWeekStart();
    return { start, end: getWeekEnd(start) };
  }

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function inPeriod(date: string, period: ReportPeriod): boolean {
  return date >= period.start && date <= period.end;
}

export async function collectReportData(
  organizationId: string,
  projectId: string,
  period: ReportPeriod,
): Promise<ReportDataSnapshot> {
  const supabase = await createClient();

  const [
    { data: project, error: projectError },
    { data: stagesRaw },
    { data: budgets },
    { data: entries },
    { data: payments },
    { data: expenses },
    { data: attendance },
    { data: workers },
    { data: advances },
    { data: allMaterials },
    { data: allAttendance },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("*, client:clients(name)")
      .eq("id", projectId)
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .single(),
    supabase
      .from("stages")
      .select("*")
      .eq("project_id", projectId)
      .eq("organization_id", organizationId)
      .order("order_index", { ascending: true }),
    supabase
      .from("stage_material_budgets")
      .select("*, stage:stages(name), material:material_catalog(name, unit)")
      .eq("project_id", projectId)
      .eq("organization_id", organizationId),
    supabase
      .from("material_entries")
      .select("*, material:material_catalog(name, unit)")
      .eq("project_id", projectId)
      .eq("organization_id", organizationId)
      .is("deleted_at", null),
    supabase
      .from("payments")
      .select("amount, payment_date")
      .eq("project_id", projectId)
      .eq("organization_id", organizationId)
      .is("deleted_at", null),
    supabase
      .from("expenses")
      .select("amount, expense_date")
      .eq("project_id", projectId)
      .eq("organization_id", organizationId)
      .is("deleted_at", null),
    supabase
      .from("worker_attendance")
      .select("*, worker:workers(*)")
      .eq("project_id", projectId)
      .eq("organization_id", organizationId),
    supabase
      .from("workers")
      .select("*")
      .eq("organization_id", organizationId)
      .is("deleted_at", null),
    supabase
      .from("worker_advances")
      .select("*")
      .eq("project_id", projectId)
      .eq("organization_id", organizationId),
    supabase
      .from("material_entries")
      .select("project_id, total_cost, created_at")
      .eq("project_id", projectId)
      .eq("organization_id", organizationId)
      .is("deleted_at", null),
    supabase
      .from("worker_attendance")
      .select("project_id, amount_paid, work_date")
      .eq("project_id", projectId)
      .eq("organization_id", organizationId),
  ]);

  if (projectError || !project) {
    throw projectError ?? new Error("Project not found");
  }

  const stages = (stagesRaw ?? []).map((s) => enrichStageWithDelay(s));
  const progress_pct =
    stages.length > 0
      ? Math.round(
          stages.reduce((sum, s) => sum + (s.progress_pct ?? 0), 0) /
            stages.length,
        )
      : 0;

  const periodEntries = (entries ?? []).filter((e) =>
    inPeriod(e.created_at.slice(0, 10), period),
  );

  const materialSummary = buildMaterialSummary(
    projectId,
    budgets ?? [],
    periodEntries.length > 0 ? periodEntries : (entries ?? []),
  );

  const financial = buildProjectFinancialSummary(
    {
      id: project.id,
      name: project.name,
      status: project.status,
      total_budget: project.total_budget,
      client_advance: project.client_advance,
    },
    (payments ?? []).map((p) => ({
      project_id: projectId,
      amount: p.amount,
      payment_date: p.payment_date,
    })),
    (expenses ?? []).map((e) => ({
      project_id: projectId,
      amount: e.amount,
      expense_date: e.expense_date,
    })),
    allMaterials ?? [],
    allAttendance ?? [],
    (stagesRaw ?? []).map((s) => ({
      project_id: projectId,
      progress_pct: s.progress_pct,
    })),
  );

  const periodAttendance = (attendance ?? []).filter((a) =>
    inPeriod(a.work_date, period),
  );

  const payroll = buildPayrollSummary(
    projectId,
    workers ?? [],
    periodAttendance,
    period.start,
    advances ?? [],
  );

  const paymentsInPeriod = (payments ?? [])
    .filter((p) => inPeriod(p.payment_date, period))
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const expensesInPeriod = (expenses ?? [])
    .filter((e) => inPeriod(e.expense_date, period))
    .reduce((sum, e) => sum + Number(e.amount), 0);

  return {
    project: {
      id: project.id,
      name: project.name,
      client_name:
        project.client &&
        !Array.isArray(project.client) &&
        "name" in project.client
          ? (project.client as { name: string }).name
          : null,
      status: project.status,
      progress_pct,
    },
    period,
    financial,
    schedule: {
      total_stages: stages.length,
      completed_stages: stages.filter((s) => s.status === "completed").length,
      delayed_stages: stages.filter((s) => isStageCriticallyDelayed(s)).length,
      stages: stages.map((s) => ({
        name: s.name,
        status: s.status,
        progress_pct: s.progress_pct ?? 0,
        delay_days: s.delay_days ?? 0,
      })),
    },
    materials: materialSummary,
    payroll: {
      week_start: payroll.week_start,
      total_amount: payroll.total_amount,
      workers_count: payroll.workers_count,
      total_hours: payroll.total_hours,
    },
    payments_in_period: paymentsInPeriod,
    expenses_in_period: expensesInPeriod,
  };
}
