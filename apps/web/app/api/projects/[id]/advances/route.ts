import { NextResponse } from "next/server";
import { CreateWorkerAdvanceSchema } from "@constructa/schemas";
import type { WorkerAdvance } from "@constructa/types";
import { getWeekStart } from "@constructa/utils";
import { getAuthContext } from "@/lib/auth/get-organization";
import { getProjectForOrg } from "@/lib/projects/get-project-for-org";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: { id: string };
}

export async function GET(request: Request, { params }: RouteContext) {
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

    const { searchParams } = new URL(request.url);
    const week = searchParams.get("week");

    const supabase = await createClient();
    let query = supabase
      .from("worker_advances")
      .select("*, worker:workers(*)")
      .eq("project_id", params.id)
      .eq("organization_id", auth.organization.id)
      .order("advance_date", { ascending: false });

    if (week) {
      query = query.eq("week_start", week);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data as WorkerAdvance[]);
  } catch (error) {
    console.error("[projects/[id]/advances/GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: RouteContext) {
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

    const body: unknown = await request.json();
    const parsed = CreateWorkerAdvanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data: worker, error: workerError } = await supabase
      .from("workers")
      .select("id")
      .eq("id", parsed.data.worker_id)
      .eq("organization_id", auth.organization.id)
      .is("deleted_at", null)
      .eq("is_active", true)
      .single();

    if (workerError || !worker) {
      return NextResponse.json(
        { error: "Trabajador no encontrado" },
        { status: 404 },
      );
    }

    const weekStart =
      parsed.data.week_start ?? getWeekStart(parsed.data.advance_date);

    const { data, error } = await supabase
      .from("worker_advances")
      .insert({
        organization_id: auth.organization.id,
        project_id: params.id,
        worker_id: parsed.data.worker_id,
        amount: parsed.data.amount,
        advance_date: parsed.data.advance_date,
        notes: parsed.data.notes ?? null,
        week_start: weekStart,
        created_by: auth.userId,
      })
      .select("*, worker:workers(*)")
      .single();

    if (error) throw error;

    return NextResponse.json(data as WorkerAdvance, { status: 201 });
  } catch (error) {
    console.error("[projects/[id]/advances/POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
