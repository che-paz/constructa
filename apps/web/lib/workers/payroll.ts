import type {
  PayrollDayEntry,
  PayrollSummary,
  PayrollWorkerRow,
  Worker,
  WorkerAttendance,
} from "@constructa/types";
import { calculateAttendanceAmount, getWeekDates, getWeekEnd, getWeekStart } from "@constructa/utils";

export function buildPayrollSummary(
  projectId: string,
  workers: Worker[],
  attendance: WorkerAttendance[],
  weekParam?: string,
): PayrollSummary {
  const weekStart = getWeekStart(weekParam);
  const weekEnd = getWeekEnd(weekStart);
  const weekDates = getWeekDates(weekStart);

  const weekAttendance = attendance.filter(
    (a) => a.work_date >= weekStart && a.work_date <= weekEnd,
  );

  const activeWorkers = workers.filter(
    (w) => w.is_active && w.deleted_at == null,
  );

  const workerIdsInWeek = new Set(weekAttendance.map((a) => a.worker_id));
  const workersForPayroll = activeWorkers.filter((w) =>
    workerIdsInWeek.has(w.id),
  );

  const rows: PayrollWorkerRow[] = workersForPayroll.map((worker) => {
    const dailyRate = Number(worker.daily_rate ?? 0);
    const workerRecords = weekAttendance.filter(
      (a) => a.worker_id === worker.id,
    );

    const days: PayrollDayEntry[] = weekDates.map((date) => {
      const record = workerRecords.find((a) => a.work_date === date);
      if (!record) {
        return {
          work_date: date,
          attendance_type: "absent" as const,
          hours_worked: 0,
          amount: 0,
          is_paid: false,
        };
      }

      const hours = Number(record.hours_worked ?? 0);
      const amount = Number(record.amount_paid ?? 0);

      return {
        work_date: date,
        attendance_type: record.attendance_type,
        hours_worked: hours,
        amount,
        is_paid: record.is_paid,
      };
    });

    const daysWithAttendance = days.filter((d) => d.amount > 0 || d.hours_worked > 0);
    const totalHours = daysWithAttendance.reduce((s, d) => s + d.hours_worked, 0);
    const totalAmount = daysWithAttendance.reduce((s, d) => s + d.amount, 0);
    const paidAmount = daysWithAttendance
      .filter((d) => d.is_paid)
      .reduce((s, d) => s + d.amount, 0);

    return {
      worker_id: worker.id,
      worker_name: worker.name,
      specialty: worker.specialty,
      daily_rate: dailyRate,
      days,
      total_hours: Math.round(totalHours * 100) / 100,
      total_amount: Math.round(totalAmount * 100) / 100,
      paid_amount: Math.round(paidAmount * 100) / 100,
      unpaid_amount: Math.round((totalAmount - paidAmount) * 100) / 100,
    };
  });

  const totalHours = rows.reduce((s, r) => s + r.total_hours, 0);
  const totalAmount = rows.reduce((s, r) => s + r.total_amount, 0);
  const paidAmount = rows.reduce((s, r) => s + r.paid_amount, 0);

  return {
    project_id: projectId,
    week_start: weekStart,
    week_end: weekEnd,
    rows,
    total_hours: Math.round(totalHours * 100) / 100,
    total_amount: Math.round(totalAmount * 100) / 100,
    paid_amount: Math.round(paidAmount * 100) / 100,
    unpaid_amount: Math.round((totalAmount - paidAmount) * 100) / 100,
    workers_count: rows.length,
  };
}

export function enrichAttendanceAmount(
  dailyRate: number | null | undefined,
  attendanceType: string,
  hoursWorked: number,
): number {
  return calculateAttendanceAmount(
    Number(dailyRate ?? 0),
    attendanceType,
    hoursWorked,
  );
}
