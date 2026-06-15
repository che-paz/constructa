import { NextResponse } from "next/server";
import { UpdateMaterialBudgetSchema } from "@constructa/schemas";
import { getAuthContext } from "@/lib/auth/get-organization";
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

    const body: unknown = await request.json();
    const parsed = UpdateMaterialBudgetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data: existing, error: fetchError } = await supabase
      .from("stage_material_budgets")
      .select("id")
      .eq("id", params.id)
      .eq("organization_id", auth.organization.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("stage_material_budgets")
      .update({
        ...parsed.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .eq("organization_id", auth.organization.id)
      .select("*, stage:stages(name), material:material_catalog(name, unit)")
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("[materials/budgets/[id]/PATCH]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: existing, error: fetchError } = await supabase
      .from("stage_material_budgets")
      .select("id")
      .eq("id", params.id)
      .eq("organization_id", auth.organization.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("stage_material_budgets")
      .delete()
      .eq("id", params.id)
      .eq("organization_id", auth.organization.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[materials/budgets/[id]/DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
