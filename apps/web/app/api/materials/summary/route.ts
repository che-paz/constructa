import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/get-organization";
import { buildMaterialSummary } from "@/lib/materials/summary";
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

    const [{ data: budgets }, { data: entries }] = await Promise.all([
      supabase
        .from("stage_material_budgets")
        .select("*, stage:stages(name), material:material_catalog(name, unit)")
        .eq("project_id", projectId)
        .eq("organization_id", auth.organization.id),
      supabase
        .from("material_entries")
        .select("*, material:material_catalog(name, unit)")
        .eq("project_id", projectId)
        .eq("organization_id", auth.organization.id)
        .is("deleted_at", null),
    ]);

    const summary = buildMaterialSummary(
      projectId,
      budgets ?? [],
      entries ?? [],
    );

    return NextResponse.json(summary);
  } catch (error) {
    console.error("[materials/summary/GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
