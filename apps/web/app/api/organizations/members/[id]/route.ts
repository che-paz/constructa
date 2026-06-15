import { NextResponse } from "next/server";
import { UpdateMemberSchema } from "@constructa/schemas";
import type { OrganizationMember } from "@constructa/types";
import { getAuthContext } from "@/lib/auth/get-organization";
import { requireOrgAdmin } from "@/lib/auth/require-permission";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const denied = requireOrgAdmin(auth);
    if (denied) return denied;

    const body: unknown = await request.json();
    const parsed = UpdateMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json({ error: "Sin cambios" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: existing, error: fetchError } = await supabase
      .from("user_organizations")
      .select("id, user_id, organization_id, role, is_active, created_at")
      .eq("id", params.id)
      .eq("organization_id", auth.organization.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (
      existing.user_id === auth.userId &&
      parsed.data.is_active === false
    ) {
      return NextResponse.json(
        { error: "No puedes desactivar tu propia cuenta" },
        { status: 422 },
      );
    }

    if (
      existing.user_id === auth.userId &&
      parsed.data.role &&
      parsed.data.role !== "constructor"
    ) {
      return NextResponse.json(
        { error: "No puedes cambiar tu propio rol de administrador" },
        { status: 422 },
      );
    }

    const { data: updated, error } = await supabase
      .from("user_organizations")
      .update(parsed.data)
      .eq("id", params.id)
      .select("id, user_id, organization_id, role, is_active, created_at")
      .single();

    if (error) throw error;

    const admin = createAdminClient();
    const { data: userData } = await admin.auth.admin.getUserById(
      updated.user_id,
    );

    const member: OrganizationMember = {
      ...updated,
      role: updated.role,
      email: userData.user?.email ?? "—",
    };

    return NextResponse.json(member);
  } catch (error) {
    console.error("[organizations/members/[id]/PATCH]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
