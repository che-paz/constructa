import { NextResponse } from "next/server";
import { CreateMaterialBudgetSchema } from "@constructa/schemas";
import { getAuthContext } from "@/lib/auth/get-organization";
import { getProjectForOrg } from "@/lib/projects/get-project-for-org";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();
    const parsed = CreateMaterialBudgetSchema.safeParse(body);
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

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("stage_material_budgets")
      .upsert(
        {
          ...parsed.data,
          organization_id: auth.organization.id,
          created_by: auth.userId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "stage_id,material_id" },
      )
      .select("*, stage:stages(name), material:material_catalog(name, unit)")
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[materials/budgets/POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
