import { NextResponse } from "next/server";
import { UpdateOrganizationSchema } from "@constructa/schemas";
import type { Organization } from "@constructa/types";
import { getAuthContext } from "@/lib/auth/get-organization";
import { requireOrgAdmin } from "@/lib/auth/require-permission";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", auth.organization.id)
      .single();

    if (error) throw error;

    return NextResponse.json(data as Organization);
  } catch (error) {
    console.error("[organizations/current/GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const denied = requireOrgAdmin(auth);
    if (denied) return denied;

    const body: unknown = await request.json();
    const parsed = UpdateOrganizationSchema.safeParse(body);
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
    const { data, error } = await supabase
      .from("organizations")
      .update({
        ...parsed.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", auth.organization.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data as Organization);
  } catch (error) {
    console.error("[organizations/current/PATCH]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
