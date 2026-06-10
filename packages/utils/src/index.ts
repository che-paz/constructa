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
