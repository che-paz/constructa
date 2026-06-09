import { NextResponse } from "next/server";
import type { ProjectSummary } from "@constructa/types";
import { getAuthContext } from "@/lib/auth/get-organization";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, name, status, total_budget, client_advance")
      .eq("id", params.id)
      .eq("organization_id", auth.organization.id)
      .is("deleted_at", null)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: stages } = await supabase
      .from("stages")
      .select("progress_pct")
      .eq("project_id", params.id)
      .eq("organization_id", auth.organization.id);

    const stagesList = stages ?? [];
    const progress_pct =
      stagesList.length > 0
        ? Math.round(
            stagesList.reduce((sum, s) => sum + (s.progress_pct ?? 0), 0) /
              stagesList.length,
          )
        : 0;

    const summary: ProjectSummary = {
      id: project.id,
      name: project.name,
      status: project.status,
      total_budget: project.total_budget,
      client_advance: project.client_advance,
      progress_pct,
      stages_count: stagesList.length,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("[projects/[id]/summary/GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
