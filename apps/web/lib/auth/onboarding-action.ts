"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createOrganizationForUser } from "@/lib/auth/onboarding";

const OnboardingSchema = z.object({
  organizationName: z.string().min(2).max(100),
});

export async function onboardingAction(formData: FormData) {
  const parsed = OnboardingSchema.safeParse({
    organizationName: formData.get("organizationName"),
  });

  if (!parsed.success) {
    redirect(
      `/onboarding?error=${encodeURIComponent("Nombre de empresa inválido")}`,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await createOrganizationForUser(user.id, {
    organizationName: parsed.data.organizationName,
    email: user.email,
  });

  if (error) {
    redirect(`/onboarding?error=${encodeURIComponent(error)}`);
  }

  redirect("/projects");
}
