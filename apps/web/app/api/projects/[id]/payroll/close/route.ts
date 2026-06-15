import { NextResponse } from "next/server";
import { ClosePayrollSchema } from "@constructa/schemas";
import type {
  PayrollSummary,
  Worker,
  WorkerAdvance,
  WorkerAttendance,
  WorkerPayrollBalance,
} from "@constructa/types";
import { getWeekEnd, getWeekStart } from "@constructa/utils";
import { getAuthContext } from "@/lib/auth/get-organization";
import { requireWrite } from "@/lib/auth/require-permission";
import {
  buildPayrollSummary,
  computePayrollAmounts,
} from "@/lib/workers/payroll";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: { id: string };
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const denied = requireWrite(auth);
    if (denied) return denied;

    const body: unknown = await request.json();
    const parsed = ClosePayrollSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const weekStart = getWeekStart(parsed.data.week_start);
    const weekEnd = getWeekEnd(weekStart);

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

    const [
      { data: workers, error: workersError },
      { data: attendance, error: attendanceFetchError },
      { data: advances, error: advancesFetchError },
      { data: balances, error: balancesFetchError },
    ] = await Promise.all([
      supabase
        .from("workers")
        .select("*")
        .eq("organization_id", auth.organization.id)
        .is("deleted_at", null),
      supabase
        .from("worker_attendance")
        .select("*")
        .eq("project_id", params.id)
        .eq("organization_id", auth.organization.id)
        .gte("work_date", weekStart)
        .lte("work_date", weekEnd),
      supabase
        .from("worker_advances")
        .select("*")
        .eq("project_id", params.id)
        .eq("organization_id", auth.organization.id)
        .eq("week_start", weekStart)
        .eq("is_deducted", false),
      supabase
        .from("worker_payroll_balances")
        .select("*")
        .eq("project_id", params.id)
        .eq("organization_id", auth.organization.id),
    ]);

    const fetchError =
      workersError ??
      attendanceFetchError ??
      advancesFetchError ??
      balancesFetchError;

    if (fetchError) {
      console.error("[projects/[id]/payroll/close/POST] fetch", fetchError);
      const message =
        fetchError.code === "42P01"
          ? "Falta aplicar migraciones de planilla en la base de datos"
          : fetchError.message;
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const summary = buildPayrollSummary(
      params.id,
      (workers ?? []) as Worker[],
      (attendance ?? []) as WorkerAttendance[],
      weekStart,
      (advances ?? []) as WorkerAdvance[],
      (balances ?? []) as WorkerPayrollBalance[],
    );

    const targetWorkerIds = parsed.data.worker_ids?.length
      ? parsed.data.worker_ids
      : summary.rows.map((row) => row.worker_id);

    const rowsToClose = summary.rows.filter((row) =>
      targetWorkerIds.includes(row.worker_id),
    );

    if (rowsToClose.length === 0) {
      return NextResponse.json(
        { error: "No hay trabajadores con asistencia en esta semana" },
        { status: 400 },
      );
    }

    for (const row of rowsToClose) {
      const { carry_forward } = computePayrollAmounts(
        row.total_amount,
        row.advances_amount,
        row.paid_amount,
        row.balance_forward_opening,
      );

      const { error: attendanceError } = await supabase
        .from("worker_attendance")
        .update({ is_paid: true })
        .eq("project_id", params.id)
        .eq("organization_id", auth.organization.id)
        .eq("worker_id", row.worker_id)
        .gte("work_date", weekStart)
        .lte("work_date", weekEnd)
        .eq("is_paid", false);

      if (attendanceError) throw attendanceError;

      const { error: advancesError } = await supabase
        .from("worker_advances")
        .update({ is_deducted: true })
        .eq("project_id", params.id)
        .eq("organization_id", auth.organization.id)
        .eq("worker_id", row.worker_id)
        .eq("week_start", weekStart)
        .eq("is_deducted", false);

      if (advancesError) throw advancesError;

      const { error: balanceError } = await supabase
        .from("worker_payroll_balances")
        .upsert(
          {
            organization_id: auth.organization.id,
            project_id: params.id,
            worker_id: row.worker_id,
            balance_forward: carry_forward,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "project_id,worker_id" },
        );

      if (balanceError) {
        console.error("[projects/[id]/payroll/close/POST] balance", balanceError);
        throw balanceError;
      }
    }

    const [{ data: refreshedAttendance }, { data: refreshedAdvances }, { data: refreshedBalances }] =
      await Promise.all([
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
          .eq("organization_id", auth.organization.id),
        supabase
          .from("worker_payroll_balances")
          .select("*")
          .eq("project_id", params.id)
          .eq("organization_id", auth.organization.id),
      ]);

    const updatedSummary: PayrollSummary = buildPayrollSummary(
      params.id,
      (workers ?? []) as Worker[],
      (refreshedAttendance ?? []) as WorkerAttendance[],
      weekStart,
      (refreshedAdvances ?? []) as WorkerAdvance[],
      (refreshedBalances ?? []) as WorkerPayrollBalance[],
    );

    return NextResponse.json(updatedSummary);
  } catch (error) {
    console.error("[projects/[id]/payroll/close/POST]", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
