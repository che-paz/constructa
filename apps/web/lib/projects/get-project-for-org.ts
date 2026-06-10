import { createClient } from "@/lib/supabase/server";

export async function getProjectForOrg(
  projectId: string,
  organizationId: string,
) {
  const supabase = await createClient();
  return supabase
    .from("projects")
    .select("id, organization_id")
    .eq("id", projectId)
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .single();
}
