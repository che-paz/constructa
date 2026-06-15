import { NextResponse } from "next/server";
import { UpdateWorkerAdvanceSchema } from "@constructa/schemas";
import type { WorkerAdvance } from "@constructa/types";
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
    const parsed = UpdateWorkerAdvanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data: existing, error: fetchError } = await supabase
      .from("worker_advances")
      .select("id, is_deducted")
      .eq("id", params.id)
      .eq("organization_id", auth.organization.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (
      existing.is_deducted &&
      (parsed.data.amount != null || parsed.data.advance_date != null)
    ) {
      return NextResponse.json(
        { error: "No se puede editar monto o fecha de un adelanto descontado" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("worker_advances")
      .update(parsed.data)
      .eq("id", params.id)
      .eq("organization_id", auth.organization.id)
      .select("*, worker:workers(*)")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(data as WorkerAdvance);
  } catch (error) {
    console.error("[advances/[id]/PATCH]", error);
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
      .from("worker_advances")
      .select("id, is_deducted")
      .eq("id", params.id)
      .eq("organization_id", auth.organization.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (existing.is_deducted) {
      return NextResponse.json(
        { error: "No se puede eliminar un adelanto ya descontado" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("worker_advances")
      .delete()
      .eq("id", params.id)
      .eq("organization_id", auth.organization.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[advances/[id]/DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
