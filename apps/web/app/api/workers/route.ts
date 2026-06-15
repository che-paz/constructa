import { NextResponse } from "next/server";
import { CreateWorkerSchema } from "@constructa/schemas";
import type { Worker } from "@constructa/types";
import { getAuthContext } from "@/lib/auth/get-organization";
import { requireWrite } from "@/lib/auth/require-permission";
import { normalizeWorkerPayload } from "@/lib/workers/worker-payload";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("workers")
      .select("*")
      .eq("organization_id", auth.organization.id)
      .is("deleted_at", null)
      .order("name", { ascending: true });

    if (error) throw error;

    return NextResponse.json(data as Worker[]);
  } catch (error) {
    console.error("[workers/GET]", error);
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
    const parsed = CreateWorkerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const workerData = normalizeWorkerPayload(parsed.data);
    const { data, error } = await supabase
      .from("workers")
      .insert({
        ...workerData,
        organization_id: auth.organization.id,
        created_by: auth.userId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data as Worker, { status: 201 });
  } catch (error) {
    console.error("[workers/POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
