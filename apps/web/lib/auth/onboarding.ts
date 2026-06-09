import { slugify } from "@constructa/utils";
import { createAdminClient } from "@/lib/supabase/admin";

interface OnboardingInput {
  organizationName: string;
  email?: string;
}

export async function createOrganizationForUser(
  userId: string,
  input: OnboardingInput,
): Promise<{ organizationId: string; error: string | null }> {
  const supabase = createAdminClient();

  const baseSlug = slugify(input.organizationName) || "empresa";
  let slug = baseSlug;
  let attempt = 0;

  while (attempt < 5) {
    const { data: existing } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!existing) break;
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name: input.organizationName,
      slug,
      email: input.email ?? null,
    })
    .select("id")
    .single();

  if (orgError || !organization) {
    return {
      organizationId: "",
      error: orgError?.message ?? "No se pudo crear la organización",
    };
  }

  const { error: memberError } = await supabase
    .from("user_organizations")
    .insert({
      user_id: userId,
      organization_id: organization.id,
      role: "constructor",
    });

  if (memberError) {
    return { organizationId: "", error: memberError.message };
  }

  return { organizationId: organization.id, error: null };
}
