import { buildMaterialWeekContext } from "@/lib/ai/material-context";
import type { OrganizationPlan } from "@constructa/types";
import { fetchOrgFinancialData } from "@/lib/finance/fetch-org-financial-data";
import { buildFinanceDashboard, buildProjectFinancialSummary } from "@/lib/finance/summary";
import { buildMaterialSummary } from "@/lib/materials/summary";
import { enrichStageWithDelay, isStageCriticallyDelayed } from "@/lib/schedule/delay";
import { createClient } from "@/lib/supabase/server";

export interface OrganizationContext {
  orgName: string;
  plan: OrganizationPlan;
  activeProjectCount: number;
  currentProject?: { id: string; name: string };
  dataContext: string;
}

export async function buildOrganizationContext(
  organizationId: string,
  orgName: string,
  plan: OrganizationPlan,
  projectId?: string | null,
): Promise<OrganizationContext> {
  const data = await fetchOrgFinancialData(organizationId);
  const dashboard = buildFinanceDashboard(
    organizationId,
    data.projects,
    data.payments,
    data.expenses,
    data.materials,
    data.attendance,
    data.stages,
  );

  const activeProjectCount = data.projects.filter(
    (p) => p.status === "active",
  ).length;

  const contextPayload: Record<string, unknown> = {
    totales: dashboard.totals,
    alertas: dashboard.alerts,
    proyectos: dashboard.projects.map((p) => ({
      id: p.project_id,
      nombre: p.project_name,
      estado: p.status,
      presupuesto: p.total_budget,
      gastado: p.total_spent,
      recibido: p.total_received,
      avance_pct: p.progress_pct,
      presupuesto_usado_pct: p.budget_used_pct,
      desglose: p.breakdown,
      alerta: p.alert?.message ?? null,
    })),
  };

  let currentProject: { id: string; name: string } | undefined;

  if (projectId) {
    const supabase = await createClient();

    const [
      { data: project },
      { data: stagesRaw },
      { data: budgets },
      { data: entries },
      { data: payments },
      { data: expenses },
      { data: attendance },
    ] = await Promise.all([
      supabase
        .from("projects")
        .select("id, name, status, total_budget, client_advance, client:clients(name)")
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
        .select("*, material:material_catalog(name, unit), stage:stages(name)")
        .eq("project_id", projectId)
        .eq("organization_id", organizationId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("payments")
        .select("amount, payment_date, description")
        .eq("project_id", projectId)
        .eq("organization_id", organizationId)
        .is("deleted_at", null)
        .order("payment_date", { ascending: false })
        .limit(10),
      supabase
        .from("expenses")
        .select("category, description, amount, expense_date")
        .eq("project_id", projectId)
        .eq("organization_id", organizationId)
        .is("deleted_at", null)
        .order("expense_date", { ascending: false })
        .limit(10),
      supabase
        .from("worker_attendance")
        .select("work_date, hours_worked, amount_paid, worker:workers(name)")
        .eq("project_id", projectId)
        .eq("organization_id", organizationId)
        .order("work_date", { ascending: false })
        .limit(14),
    ]);

    if (project) {
      currentProject = { id: project.id, name: project.name };

      const stages = (stagesRaw ?? []).map((s) => enrichStageWithDelay(s));
      const materialSummary = buildMaterialSummary(
        projectId,
        budgets ?? [],
        entries ?? [],
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
        (entries ?? []).map((e) => ({
          project_id: projectId,
          total_cost: e.total_cost,
          created_at: e.created_at,
        })),
        (attendance ?? []).map((a) => ({
          project_id: projectId,
          amount_paid: a.amount_paid,
          work_date: a.work_date,
        })),
        (stagesRaw ?? []).map((s) => ({
          project_id: projectId,
          progress_pct: s.progress_pct,
        })),
      );

      const materialWeekContext = buildMaterialWeekContext(entries ?? []);

      contextPayload.proyecto_detalle = {
        id: project.id,
        nombre: project.name,
        cliente:
          project.client &&
          !Array.isArray(project.client) &&
          "name" in project.client
            ? (project.client as { name: string }).name
            : null,
        financiero: financial,
        materiales: materialSummary,
        materiales_por_semana: materialWeekContext,
        cronograma: {
          etapas: stages.map((s) => ({
            nombre: s.name,
            estado: s.status,
            avance_pct: s.progress_pct,
            retraso_dias: s.delay_days ?? 0,
            retrasada: isStageCriticallyDelayed(s),
          })),
        },
        pagos_recientes: payments ?? [],
        gastos_recientes: expenses ?? [],
        asistencia_reciente: attendance ?? [],
      };
    }
  }

  return {
    orgName,
    plan,
    activeProjectCount,
    currentProject,
    dataContext: JSON.stringify(contextPayload, null, 2),
  };
}

export { serializeContextForPrompt } from "@/lib/ai/serialize-context";
