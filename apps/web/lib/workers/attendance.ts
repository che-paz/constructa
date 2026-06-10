import type { AttendanceType } from "@constructa/types";
import { calculateAttendanceAmount, calculateHoursWorked } from "@constructa/utils";
import { enrichAttendanceAmount } from "./payroll";

interface AttendanceInput {
  check_in?: string | null;
  check_out?: string | null;
  attendance_type: AttendanceType;
  daily_rate?: number | null;
}

export function computeAttendanceFields(input: AttendanceInput): {
  hours_worked: number;
  amount_paid: number;
} {
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
