import { NextResponse } from "next/server";
import { CreateProjectSchema } from "@constructa/schemas";
import { generateClientToken } from "@constructa/utils";
import { getAuthContext } from "@/lib/auth/get-organization";
import { requireWrite } from "@/lib/auth/require-permission";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const supabase = await createClient();
    let query = supabase
      .from("projects")
      .select("*")
      .eq("organization_id", auth.organization.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("[projects/GET]", error);
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

    const denied = requireWrite(auth);
    if (denied) return denied;

    const body: unknown = await request.json();
    const parsed = CreateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { count } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", auth.organization.id)
      .is("deleted_at", null);

    if (count !== null && count >= auth.organization.max_projects) {
      return NextResponse.json(
        {
          error: `Límite de ${auth.organization.max_projects} proyectos alcanzado en tu plan`,
        },
        { status: 422 },
      );
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        ...parsed.data,
        organization_id: auth.organization.id,
        created_by: auth.userId,
        client_token: generateClientToken(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[projects/POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
