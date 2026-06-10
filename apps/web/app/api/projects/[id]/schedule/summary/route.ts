import { NextResponse } from "next/server";
import type { ScheduleSummary, Stage } from "@constructa/types";
import { getAuthContext } from "@/lib/auth/get-organization";
import { enrichStageWithDelay, isStageCriticallyDelayed } from "@/lib/schedule/delay";
import { getProjectForOrg } from "@/lib/projects/get-project-for-org";
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

    const { data: project, error: projectError } = await getProjectForOrg(
      params.id,
      auth.organization.id,
    );

    if (projectError || !project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("stages")
      .select("*")
      .eq("project_id", params.id)
      .eq("organization_id", auth.organization.id)
      .order("order_index", { ascending: true });

    if (error) throw error;

    const rawStages = (data ?? []) as Stage[];
    const stages = rawStages.map((s) => enrichStageWithDelay(s));

    const completed_stages = stages.filter((s) => s.status === "completed").length;
    const delayed_stages = stages.filter((s) =>
      isStageCriticallyDelayed(s),
    ).length;
    const total_delay_days = stages.reduce(
      (sum, s) => sum + (s.delay_days ?? 0),
      0,
    );
    const progress_pct =
      stages.length > 0
        ? Math.round(
            stages.reduce((sum, s) => sum + (s.progress_pct ?? 0), 0) /
              stages.length,
          )
        : 0;

    const summary: ScheduleSummary = {
      project_id: params.id,
      total_stages: stages.length,
      completed_stages,
      delayed_stages,
      total_delay_days,
      progress_pct,
      stages,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("[projects/[id]/schedule/summary/GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
