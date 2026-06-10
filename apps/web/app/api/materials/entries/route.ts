import { NextResponse } from "next/server";
import { CreateMaterialEntrySchema } from "@constructa/schemas";
import type { MaterialEntry } from "@constructa/types";
import { getAuthContext } from "@/lib/auth/get-organization";
import { getProjectForOrg } from "@/lib/projects/get-project-for-org";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("project");

    if (!projectId) {
      return NextResponse.json(
        { error: "Parámetro project requerido" },
        { status: 400 },
      );
    }

    const { data: project, error: projectError } = await getProjectForOrg(
      projectId,
      auth.organization.id,
    );

    if (projectError || !project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("material_entries")
      .select("*, material:material_catalog(*)")
      .eq("project_id", projectId)
      .eq("organization_id", auth.organization.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data as MaterialEntry[]);
  } catch (error) {
    console.error("[materials/entries/GET]", error);
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

    const body: unknown = await request.json();
    const parsed = CreateMaterialEntrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { data: project, error: projectError } = await getProjectForOrg(
      parsed.data.project_id,
      auth.organization.id,
    );

    if (projectError || !project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const totalCost =
      parsed.data.unit_price != null
        ? parsed.data.unit_price * parsed.data.quantity
        : null;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("material_entries")
      .insert({
        ...parsed.data,
        total_cost: totalCost,
        organization_id: auth.organization.id,
        created_by: auth.userId,
      })
      .select("*, material:material_catalog(*)")
      .single();

    if (error) throw error;

    return NextResponse.json(data as MaterialEntry, { status: 201 });
  } catch (error) {
    console.error("[materials/entries/POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
