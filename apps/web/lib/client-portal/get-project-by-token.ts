import type { ClientPortalProject } from "@constructa/types";
import { computePaymentBalance } from "@/lib/payments/balance";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getProjectByClientToken(
  token: string,
): Promise<ClientPortalProject | null> {
  const supabase = createAdminClient();

  const { data: project } = await supabase
    .from("projects")
    .select(
      "id, name, description, address, municipality, department, status, start_date, planned_end_date, total_budget, client_advance, client_can_see_costs",
    )
    .eq("client_token", token)
    .is("deleted_at", null)
    .single();

  if (!project) return null;

  const { data: stages } = await supabase
    .from("stages")
    .select("id, name, progress_pct, status")
    .eq("project_id", project.id)
    .order("order_index", { ascending: true });

  const stagesList = stages ?? [];
  const progress_pct =
    stagesList.length > 0
      ? Math.round(
          stagesList.reduce((sum, s) => sum + (s.progress_pct ?? 0), 0) /
            stagesList.length,
        )
      : 0;

  const { data: payments } = await supabase
    .from("payments")
    .select("amount")
    .eq("project_id", project.id)
    .is("deleted_at", null);

  const balance = computePaymentBalance(
    project.total_budget,
    project.client_advance,
    payments ?? [],
  );

  return {
    ...project,
    progress_pct,
    stages: stagesList,
    balance,
  };
}
