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
