import { NextResponse } from "next/server";
import { InviteMemberSchema } from "@constructa/schemas";
import type { OrganizationMember } from "@constructa/types";
import { getAuthContext } from "@/lib/auth/get-organization";
import { requireOrgAdmin } from "@/lib/auth/require-permission";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function resolveMemberEmails(userIds: string[]) {
  const admin = createAdminClient();
  const emails = new Map<string, string>();

  await Promise.all(
    userIds.map(async (userId) => {
      const { data, error } = await admin.auth.admin.getUserById(userId);
      if (!error && data.user?.email) {
        emails.set(userId, data.user.email);
      }
    }),
  );

  return emails;
}

export async function GET() {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const { data: rows, error } = await supabase
      .from("user_organizations")
      .select("id, user_id, organization_id, role, is_active, created_at")
      .eq("organization_id", auth.organization.id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const userIds = (rows ?? []).map((row) => row.user_id as string);
    const emails = await resolveMemberEmails(userIds);

    const members: OrganizationMember[] = (rows ?? []).map((row) => ({
      id: row.id as string,
      user_id: row.user_id as string,
      organization_id: row.organization_id as string,
      role: row.role,
      is_active: row.is_active as boolean,
      email: emails.get(row.user_id as string) ?? "—",
      created_at: row.created_at as string,
    }));

    return NextResponse.json({
      members,
      max_users: auth.organization.max_users,
    });
  } catch (error) {
    console.error("[organizations/members/GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const denied = requireOrgAdmin(auth);
    if (denied) return denied;

    const body: unknown = await request.json();
    const parsed = InviteMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const supabase = await createClient();
    const admin = createAdminClient();

    const { count } = await supabase
      .from("user_organizations")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", auth.organization.id)
      .eq("is_active", true);

    if (count !== null && count >= auth.organization.max_users) {
      return NextResponse.json(
        {
          error: `Límite de ${auth.organization.max_users} usuarios alcanzado en tu plan`,
        },
        { status: 422 },
      );
    }

    const { data: listData } = await admin.auth.admin.listUsers();
    const existingUser = listData.users.find(
      (user) => user.email?.toLowerCase() === email,
    );

    let userId = existingUser?.id;

    if (!userId) {
      const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://constructa-nine.vercel.app"}/login`;
      const { data: invited, error: inviteError } =
        await admin.auth.admin.inviteUserByEmail(email, { redirectTo });

      if (!inviteError && invited.user) {
        userId = invited.user.id;
      } else {
        const tempPassword = crypto.randomUUID();
        const { data: created, error: createError } =
          await admin.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true,
          });

        if (createError || !created.user) {
          return NextResponse.json(
            { error: createError?.message ?? "No se pudo crear el usuario" },
            { status: 422 },
          );
        }

        userId = created.user.id;
      }
    }

    const { data: existingMembership } = await supabase
      .from("user_organizations")
      .select("id, is_active")
      .eq("user_id", userId)
      .eq("organization_id", auth.organization.id)
      .maybeSingle();

    if (existingMembership?.is_active) {
      return NextResponse.json(
        { error: "Este usuario ya pertenece a la empresa" },
        { status: 409 },
      );
    }

    if (existingMembership) {
      const { data: reactivated, error: reactivateError } = await supabase
        .from("user_organizations")
        .update({
          role: parsed.data.role,
          is_active: true,
        })
        .eq("id", existingMembership.id)
        .select("id, user_id, organization_id, role, is_active, created_at")
        .single();

      if (reactivateError) throw reactivateError;

      const member: OrganizationMember = {
        ...reactivated,
        role: reactivated.role,
        email,
      };

      return NextResponse.json(member, { status: 200 });
    }

    const { data: membership, error: membershipError } = await supabase
      .from("user_organizations")
      .insert({
        user_id: userId,
        organization_id: auth.organization.id,
        role: parsed.data.role,
        is_active: true,
      })
      .select("id, user_id, organization_id, role, is_active, created_at")
      .single();

    if (membershipError) throw membershipError;

    const member: OrganizationMember = {
      ...membership,
      role: membership.role,
      email,
    };

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("[organizations/members/POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
