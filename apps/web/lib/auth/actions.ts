"use server";

import { redirect } from "next/navigation";
import { LoginSchema, SignupSchema } from "@constructa/schemas";
import { createClient } from "@/lib/supabase/server";
import { createOrganizationForUser } from "@/lib/auth/onboarding";

function signupError(message: string): never {
  redirect(`/signup?error=${encodeURIComponent(message)}`);
}

function loginError(message: string, redirectTo?: string): never {
  const params = new URLSearchParams({ error: message });
  if (redirectTo) params.set("redirect", redirectTo);
  redirect(`/login?${params.toString()}`);
}

export async function signupAction(formData: FormData) {
  const parsed = SignupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    organizationName: formData.get("organizationName"),
  });

  if (!parsed.success) {
    signupError(parsed.error.errors[0]?.message ?? "Datos inválidos");
  }

  const supabase = await createClient();

  const { data, error: authError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        organization_name: parsed.data.organizationName,
      },
    },
  });

  if (authError) signupError(authError.message);
  if (!data.user) signupError("No se pudo crear la cuenta");

  if (!data.session) {
    redirect(
      `/login?message=${encodeURIComponent("Revisa tu correo para confirmar tu cuenta antes de ingresar.")}`,
    );
  }

  await supabase.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });

  const { error: onboardingError } = await createOrganizationForUser(
    data.user.id,
    {
      organizationName: parsed.data.organizationName,
      email: parsed.data.email,
    },
  );

  if (onboardingError) signupError(onboardingError);

  redirect("/projects");
}

export async function loginAction(formData: FormData) {
  const redirectTo = formData.get("redirect")?.toString() || "/projects";

  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    loginError(parsed.error.errors[0]?.message ?? "Datos inválidos", redirectTo);
  }

  const supabase = await createClient();

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (authError) {
    const message =
      authError.message === "Invalid login credentials"
        ? "Correo o contraseña incorrectos"
        : authError.message;
    loginError(message, redirectTo);
  }

  redirect(redirectTo);
}
