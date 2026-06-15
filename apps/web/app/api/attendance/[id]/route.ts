import { NextResponse } from "next/server";
import { UpdateAttendanceSchema } from "@constructa/schemas";
import type { WorkerAttendance } from "@constructa/types";
import { getAuthContext } from "@/lib/auth/get-organization";
import {
  computeAttendanceFields,
  validateContractAttendance,
} from "@/lib/workers/attendance";
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
    const parsed = UpdateAttendanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data: existing, error: fetchError } = await supabase
      .from("worker_attendance")
      .select("*, worker:workers(*)")
      .eq("id", params.id)
      .eq("organization_id", auth.organization.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const worker = existing.worker as {
      payment_type?: string;
      daily_rate?: number | null;
    } | null;
    const paymentType = (worker?.payment_type ?? "daily") as
      | "daily"
      | "contract";

    const attendanceType =
      parsed.data.attendance_type ?? existing.attendance_type;
    const checkIn =
      parsed.data.check_in !== undefined
        ? parsed.data.check_in
        : existing.check_in;
    const checkOut =
      parsed.data.check_out !== undefined
        ? parsed.data.check_out
        : existing.check_out;
    const amountPaid =
      parsed.data.amount_paid !== undefined
        ? parsed.data.amount_paid
        : existing.amount_paid;
    const notes =
      parsed.data.notes !== undefined ? parsed.data.notes : existing.notes;

    if (paymentType === "contract") {
      const contractError = validateContractAttendance({
        attendance_type: attendanceType,
        amount_paid: amountPaid,
        notes,
      });

      if (contractError) {
        return NextResponse.json({ error: contractError }, { status: 400 });
      }
    }

    const { hours_worked, amount_paid } = computeAttendanceFields({
      check_in: checkIn,
      check_out: checkOut,
      attendance_type: attendanceType,
      payment_type: paymentType,
      daily_rate: worker?.daily_rate,
      amount_paid: amountPaid,
    });

    const { data, error } = await supabase
      .from("worker_attendance")
      .update({
        check_in: checkIn,
        check_out: checkOut,
        attendance_type: attendanceType,
        hours_worked,
        amount_paid,
        notes,
        ...(parsed.data.is_paid !== undefined
          ? { is_paid: parsed.data.is_paid }
          : {}),
      })
      .eq("id", params.id)
      .eq("organization_id", auth.organization.id)
      .select("*, worker:workers(*)")
      .single();

    if (error) throw error;

    return NextResponse.json(data as WorkerAttendance);
  } catch (error) {
    console.error("[attendance/[id]/PATCH]", error);
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
      .from("worker_attendance")
      .select("id, is_paid")
      .eq("id", params.id)
      .eq("organization_id", auth.organization.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (existing.is_paid) {
      return NextResponse.json(
        { error: "No se puede eliminar asistencia ya marcada como pagada" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("worker_attendance")
      .delete()
      .eq("id", params.id)
      .eq("organization_id", auth.organization.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[attendance/[id]/DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
