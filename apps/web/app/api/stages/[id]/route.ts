import { NextResponse } from "next/server";
import { UpdateStageSchema } from "@constructa/schemas";
import type { Stage } from "@constructa/types";
import { getAuthContext } from "@/lib/auth/get-organization";
import { enrichStageWithDelay } from "@/lib/schedule/delay";
import { computeDependentStageUpdates } from "@/lib/schedule/recalculate";
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
    const parsed = UpdateStageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data: existing, error: fetchError } = await supabase
      .from("stages")
      .select("*")
      .eq("id", params.id)
      .eq("organization_id", auth.organization.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("stages")
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq("id", params.id)
      .eq("organization_id", auth.organization.id)
      .select()
      .single();

    if (error) throw error;

    const updatedStage = data as Stage;

    if (updatedStage.status === "delayed") {
      const { data: allStages } = await supabase
        .from("stages")
        .select("*")
        .eq("project_id", updatedStage.project_id)
        .eq("organization_id", auth.organization.id)
        .order("order_index", { ascending: true });

      const dependentUpdates = computeDependentStageUpdates(
        (allStages ?? []) as Stage[],
        updatedStage,
      );

      for (const dep of dependentUpdates) {
        await supabase
          .from("stages")
          .update({
            planned_start: dep.planned_start,
            planned_end: dep.planned_end,
            updated_at: new Date().toISOString(),
          })
          .eq("id", dep.id)
          .eq("organization_id", auth.organization.id);
      }
    }

    return NextResponse.json(enrichStageWithDelay(updatedStage));
  } catch (error) {
    console.error("[stages/[id]/PATCH]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
