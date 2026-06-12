import type { AttendanceType, WorkerPaymentType } from "@constructa/types";
import { calculateHoursWorked } from "@constructa/utils";
import { enrichAttendanceAmount } from "./payroll";

interface AttendanceInput {
  check_in?: string | null;
  check_out?: string | null;
  attendance_type: AttendanceType;
  payment_type?: WorkerPaymentType;
  daily_rate?: number | null;
  amount_paid?: number | null;
}

export function computeAttendanceFields(input: AttendanceInput): {
  hours_worked: number;
  amount_paid: number;
} {
  const paymentType = input.payment_type ?? "daily";

  if (paymentType === "contract") {
    const hours =
      input.attendance_type === "absent"
        ? 0
        : calculateHoursWorked(
            input.check_in,
            input.check_out,
            input.attendance_type,
          );

    return {
      hours_worked: hours,
      amount_paid:
        input.attendance_type === "absent"
          ? 0
          : Math.round(Number(input.amount_paid ?? 0) * 100) / 100,
    };
  }

  const hours = calculateHoursWorked(
    input.check_in,
    input.check_out,
    input.attendance_type,
  );

  const amount = enrichAttendanceAmount(
    input.daily_rate,
    input.attendance_type,
    hours,
  );

  return { hours_worked: hours, amount_paid: amount };
}

export function validateContractAttendance(input: {
  attendance_type: AttendanceType;
  amount_paid?: number | null;
  notes?: string | null;
}): string | null {
  if (input.attendance_type === "absent") return null;

  if (input.amount_paid == null || input.amount_paid <= 0) {
    return "El monto del día es requerido para trabajadores por contrato";
  }

  if (!input.notes?.trim()) {
    return "Describe el trabajo realizado (contrato/tarea)";
  }

  return null;
}
