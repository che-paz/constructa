const GTQ_FORMATTER = new Intl.NumberFormat("es-GT", {
  style: "currency",
  currency: "GTQ",
});

export function formatGtq(amount: number): string {
  return GTQ_FORMATTER.format(amount);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function generateClientToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

const STATUS_LABELS: Record<string, string> = {
  active: "Activo",
  paused: "Pausado",
  completed: "Completado",
  cancelled: "Cancelado",
};

export function projectStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  cheque: "Cheque",
  tarjeta: "Tarjeta",
  otro: "Otro",
};

export function paymentMethodLabel(method: string | null): string {
  if (!method) return "—";
  return PAYMENT_METHOD_LABELS[method] ?? method;
}

const STAGE_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  in_progress: "En progreso",
  completed: "Completada",
  delayed: "Retrasada",
};

export function stageStatusLabel(status: string): string {
  return STAGE_STATUS_LABELS[status] ?? status;
}

const MATERIAL_ENTRY_TYPE_LABELS: Record<string, string> = {
  purchase: "Compra",
  consumption: "Consumo",
  transfer: "Transferencia",
  loss: "Pérdida",
  return: "Devolución",
};

export function materialEntryTypeLabel(type: string): string {
  return MATERIAL_ENTRY_TYPE_LABELS[type] ?? type;
}

/** Días de atraso respecto a planned_end (positivo = atrasada). */
export function calculateStageDelayDays(
  plannedEnd: string | null | undefined,
  actualEnd: string | null | undefined,
  status: string,
  referenceDate?: string,
): number {
  if (!plannedEnd) return 0;

  const planned = new Date(plannedEnd);
  const ref = actualEnd
    ? new Date(actualEnd)
    : referenceDate
      ? new Date(referenceDate)
      : new Date();

  if (status === "completed" && actualEnd) {
    const diff = Math.floor(
      (ref.getTime() - planned.getTime()) / (1000 * 60 * 60 * 24),
    );
    return Math.max(diff, 0);
  }

  if (status !== "completed") {
    const diff = Math.floor(
      (ref.getTime() - planned.getTime()) / (1000 * 60 * 60 * 24),
    );
    return Math.max(diff, 0);
  }

  return 0;
}

export function calculateMaterialDeviation(
  expected: number,
  actual: number,
): number {
  if (expected <= 0) return actual > 0 ? 100 : 0;
  return ((actual - expected) / expected) * 100;
}

const ATTENDANCE_TYPE_LABELS: Record<string, string> = {
  full: "Jornada completa",
  half: "Media jornada",
  absent: "Ausente",
  overtime: "Horas extra",
};

export function attendanceTypeLabel(type: string): string {
  return ATTENDANCE_TYPE_LABELS[type] ?? type;
}

const WORKER_SPECIALTY_LABELS: Record<string, string> = {
  albanil: "Albañil",
  electricista: "Electricista",
  plomero: "Plomero",
  peon: "Peón",
  carpintero: "Carpintero",
  herrero: "Herrero",
  pintor: "Pintor",
  otro: "Otro",
};

export function workerSpecialtyLabel(specialty: string | null): string {
  if (!specialty) return "—";
  return WORKER_SPECIALTY_LABELS[specialty] ?? specialty;
}

const DEFAULT_HOURS_BY_TYPE: Record<string, number> = {
  full: 8,
  half: 4,
  absent: 0,
  overtime: 10,
};

const TYPE_RATE_MULTIPLIERS: Record<string, number> = {
  full: 1,
  half: 0.5,
  absent: 0,
  overtime: 1.5,
};

/** Horas trabajadas a partir de check-in/out o tipo de jornada. */
export function calculateHoursWorked(
  checkIn: string | null | undefined,
  checkOut: string | null | undefined,
  attendanceType: string,
): number {
  if (attendanceType === "absent") return 0;

  if (checkIn && checkOut) {
    const diffMs =
      new Date(checkOut).getTime() - new Date(checkIn).getTime();
    if (diffMs > 0) {
      return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
    }
  }

  return DEFAULT_HOURS_BY_TYPE[attendanceType] ?? 8;
}

/** Monto del día según jornal y tipo de jornada. */
export function calculateAttendanceAmount(
  dailyRate: number,
  attendanceType: string,
  hoursWorked?: number,
): number {
  if (attendanceType === "absent" || dailyRate <= 0) return 0;

  if (attendanceType === "overtime" && hoursWorked != null && hoursWorked > 8) {
    const hourly = dailyRate / 8;
    const extraHours = hoursWorked - 8;
    return Math.round((dailyRate + extraHours * hourly * 1.5) * 100) / 100;
  }

  const multiplier = TYPE_RATE_MULTIPLIERS[attendanceType] ?? 1;
  return Math.round(dailyRate * multiplier * 100) / 100;
}

/** Lunes de la semana para una fecha (ISO date string). */
export function getWeekStart(dateInput?: string): string {
  const ref = dateInput ? new Date(`${dateInput}T12:00:00`) : new Date();
  const day = ref.getDay();
  const diff = ref.getDate() - day + (day === 0 ? -6 : 1);
  ref.setDate(diff);
  return ref.toISOString().slice(0, 10);
}

/** Domingo de la semana dado el lunes (ISO date). */
export function getWeekEnd(weekStart: string): string {
  const end = new Date(`${weekStart}T12:00:00`);
  end.setDate(end.getDate() + 6);
  return end.toISOString().slice(0, 10);
}

/** Fechas ISO (lun–dom) de una semana. */
export function getWeekDates(weekStart: string): string[] {
  const dates: string[] = [];
  const start = new Date(`${weekStart}T12:00:00`);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export function calculatePaymentBalance(
  totalBudget: number | null | undefined,
  clientAdvance: number | null | undefined,
  payments: { amount: number }[],
): {
  total_budget: number | null;
  client_advance: number;
  total_paid: number;
  pending_balance: number;
  payments_count: number;
} {
  const budget =
    totalBudget != null && totalBudget > 0 ? Number(totalBudget) : null;
  const advance = Number(clientAdvance ?? 0);
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingBalance =
    budget != null
      ? Math.max(budget - totalPaid, 0)
      : Math.max(advance - totalPaid, 0);

  return {
    total_budget: budget,
    client_advance: advance,
    total_paid: totalPaid,
    pending_balance: pendingBalance,
    payments_count: payments.length,
  };
}
