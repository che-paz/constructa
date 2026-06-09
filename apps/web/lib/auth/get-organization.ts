import { createClient } from "@/lib/supabase/server";
import type { Organization, UserOrganization } from "@constructa/types";

export interface AuthContext {
  userId: string;
  membership: UserOrganization;
  organization: Organization;
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: membership } = await supabase
    .from("user_organizations")
    .select("*, organization:organizations(*)")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!membership?.organization) return null;

  const org = membership.organization as Organization;

  return {
    userId: user.id,
    membership: {
      id: membership.id,
      user_id: membership.user_id,
      organization_id: membership.organization_id,
      role: membership.role,
      is_active: membership.is_active,
    },
    organization: org,
  };
}
