import { NextResponse } from "next/server";
import { CreateAttendanceSchema } from "@constructa/schemas";
import type { WorkerAttendance } from "@constructa/types";
import { getAuthContext } from "@/lib/auth/get-organization";
import { computeAttendanceFields, validateContractAttendance } from "@/lib/workers/attendance";
import { getProjectForOrg } from "@/lib/projects/get-project-for-org";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("project");
    const workerId = searchParams.get("worker");

    if (!projectId) {
      return NextResponse.json(
        { error: "Parámetro project requerido" },
        { status: 400 },
      );
    }

    const { data: project, error: projectError } = await getProjectForOrg(
      projectId,
      auth.organization.id,
    );

    if (projectError || !project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const supabase = await createClient();
    let query = supabase
      .from("worker_attendance")
      .select("*, worker:workers(*)")
      .eq("project_id", projectId)
      .eq("organization_id", auth.organization.id)
      .order("work_date", { ascending: false });

    if (workerId) {
      query = query.eq("worker_id", workerId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data as WorkerAttendance[]);
  } catch (error) {
    console.error("[attendance/GET]", error);
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

    const body: unknown = await request.json();
    const parsed = CreateAttendanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { data: project, error: projectError } = await getProjectForOrg(
      parsed.data.project_id,
      auth.organization.id,
    );

    if (projectError || !project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const supabase = await createClient();

    const { data: worker, error: workerError } = await supabase
      .from("workers")
      .select("id, daily_rate, payment_type")
      .eq("id", parsed.data.worker_id)
      .eq("organization_id", auth.organization.id)
      .is("deleted_at", null)
      .single();

    if (workerError || !worker) {
      return NextResponse.json(
        { error: "Trabajador no encontrado" },
        { status: 404 },
      );
    }

    const paymentType = worker.payment_type ?? "daily";

    if (paymentType === "contract") {
      const contractError = validateContractAttendance({
        attendance_type: parsed.data.attendance_type,
        amount_paid: parsed.data.amount_paid,
        notes: parsed.data.notes,
      });

      if (contractError) {
        return NextResponse.json({ error: contractError }, { status: 400 });
      }
    }

    const { hours_worked, amount_paid } = computeAttendanceFields({
      check_in: parsed.data.check_in,
      check_out: parsed.data.check_out,
      attendance_type: parsed.data.attendance_type,
      payment_type: paymentType,
      daily_rate: worker.daily_rate,
      amount_paid: parsed.data.amount_paid,
    });

    const { data, error } = await supabase
      .from("worker_attendance")
      .upsert(
        {
          organization_id: auth.organization.id,
          project_id: parsed.data.project_id,
          worker_id: parsed.data.worker_id,
          work_date: parsed.data.work_date,
          check_in: parsed.data.check_in ?? null,
          check_out: parsed.data.check_out ?? null,
          hours_worked,
          attendance_type: parsed.data.attendance_type,
          check_in_method: parsed.data.check_in_method,
          amount_paid,
          is_paid: parsed.data.is_paid ?? false,
          notes: parsed.data.notes ?? null,
          created_by: auth.userId,
        },
        { onConflict: "project_id,worker_id,work_date" },
      )
      .select("*, worker:workers(*)")
      .single();

    if (error) throw error;

    return NextResponse.json(data as WorkerAttendance, { status: 201 });
  } catch (error) {
    console.error("[attendance/POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
