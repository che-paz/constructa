import { NextResponse } from "next/server";
import { UpdateMaterialEntrySchema } from "@constructa/schemas";
import type { MaterialEntry } from "@constructa/types";
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
    const parsed = UpdateMaterialEntrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data: existing, error: fetchError } = await supabase
      .from("material_entries")
      .select("*")
      .eq("id", params.id)
      .eq("organization_id", auth.organization.id)
      .is("deleted_at", null)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const quantity =
      parsed.data.quantity != null
        ? parsed.data.quantity
        : Number(existing.quantity);
    const unitPrice =
      parsed.data.unit_price !== undefined
        ? parsed.data.unit_price
        : existing.unit_price != null
          ? Number(existing.unit_price)
          : null;

    const totalCost =
      unitPrice != null ? unitPrice * quantity : existing.total_cost;

    const { data, error } = await supabase
      .from("material_entries")
      .update({
        ...parsed.data,
        quantity,
        unit_price: unitPrice,
        total_cost: totalCost,
      })
      .eq("id", params.id)
      .eq("organization_id", auth.organization.id)
      .select("*, material:material_catalog(*)")
      .single();

    if (error) throw error;

    return NextResponse.json(data as MaterialEntry);
  } catch (error) {
    console.error("[materials/entries/[id]/PATCH]", error);
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
      .from("material_entries")
      .select("id")
      .eq("id", params.id)
      .eq("organization_id", auth.organization.id)
      .is("deleted_at", null)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("material_entries")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", params.id)
      .eq("organization_id", auth.organization.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[materials/entries/[id]/DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
