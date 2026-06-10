import { redirect } from "next/navigation";
import type {
  MaterialAlert,
  MaterialCatalog,
  MaterialSummary,
  Project,
  ProjectSummary,
  ScheduleSummary,
  Stage,
} from "@constructa/types";
import { getAuthContext } from "@/lib/auth/get-organization";
import { attachInvoiceUrls } from "@/lib/materials/invoice-url";
import { buildMaterialAlerts, buildMaterialSummary } from "@/lib/materials/summary";
import { computePaymentBalance } from "@/lib/payments/balance";
import { attachReceiptUrls } from "@/lib/payments/receipt-url";
import { enrichStageWithDelay, isStageCriticallyDelayed } from "@/lib/schedule/delay";
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

  const [paymentsWithUrls, entriesWithUrls] = await Promise.all([
    attachReceiptUrls(payments ?? []),
    attachInvoiceUrls(materialEntries ?? []),
  ]);

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
    <ProjectDashboard
      project={project as Project}
      summary={summary}
      schedule={schedule}
      balance={balance}
      payments={paymentsWithUrls}
      catalog={(catalog ?? []) as MaterialCatalog[]}
      materialEntries={entriesWithUrls}
      materialSummary={materialSummary}
      materialAlerts={materialAlerts}
      clientPortalUrl={clientPortalUrl}
    />
  );
}
