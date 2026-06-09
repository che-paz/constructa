import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/get-organization";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: { id: string };
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: payment, error: fetchError } = await supabase
      .from("payments")
      .select("id")
      .eq("id", params.id)
      .eq("organization_id", auth.organization.id)
      .is("deleted_at", null)
      .single();

    if (fetchError || !payment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("payments")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", params.id)
      .eq("organization_id", auth.organization.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[payments/[id]/DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
