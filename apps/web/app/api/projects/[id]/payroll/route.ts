import { NextResponse } from "next/server";
import type { PayrollSummary, Worker, WorkerAdvance, WorkerAttendance, WorkerPayrollBalance } from "@constructa/types";
import { getWeekStart } from "@constructa/utils";
import { getAuthContext } from "@/lib/auth/get-organization";
import { buildPayrollSummary } from "@/lib/workers/payroll";
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

    const { searchParams } = new URL(request.url);
    const week = searchParams.get("week") ?? undefined;

    const supabase = await createClient();

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", params.id)
      .eq("organization_id", auth.organization.id)
      .is("deleted_at", null)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const weekStart = getWeekStart(week);

    const [{ data: workers }, { data: attendance }, { data: advances }, { data: balances }] =
      await Promise.all([
      supabase
        .from("workers")
        .select("*")
        .eq("organization_id", auth.organization.id)
        .is("deleted_at", null)
        .order("name", { ascending: true }),
      supabase
        .from("worker_attendance")
        .select("*, worker:workers(*)")
        .eq("project_id", params.id)
        .eq("organization_id", auth.organization.id)
        .order("work_date", { ascending: true }),
      supabase
        .from("worker_advances")
        .select("*")
        .eq("project_id", params.id)
        .eq("organization_id", auth.organization.id)
        .eq("week_start", weekStart),
      supabase
        .from("worker_payroll_balances")
        .select("*")
        .eq("project_id", params.id)
        .eq("organization_id", auth.organization.id),
    ]);

    const summary: PayrollSummary = buildPayrollSummary(
      params.id,
      (workers ?? []) as Worker[],
      (attendance ?? []) as WorkerAttendance[],
      week,
      (advances ?? []) as WorkerAdvance[],
      (balances ?? []) as WorkerPayrollBalance[],
    );

    return NextResponse.json(summary);
  } catch (error) {
    console.error("[projects/[id]/payroll/GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
