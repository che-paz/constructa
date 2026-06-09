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
