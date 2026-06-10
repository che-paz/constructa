export function mapAIErrorToMessage(error: unknown): string {
  const errMsg = error instanceof Error ? error.message : String(error);

  if (
    errMsg.includes("credit balance is too low") ||
    errMsg.includes("insufficient_quota")
  ) {
    return "La cuenta de Anthropic no tiene créditos suficientes. Agregue saldo en console.anthropic.com → Plans & Billing.";
  }

  if (errMsg.includes("authentication") || errMsg.includes("401")) {
    return "Clave de API de Anthropic inválida. Verifique ANTHROPIC_API_KEY en .env.local.";
  }

  if (errMsg.includes("ANTHROPIC_API_KEY no configurada")) {
    return "Falta ANTHROPIC_API_KEY. Agréguela en apps/web/.env.local y reinicie el servidor.";
  }

  if (errMsg.includes("Bucket not found") || errMsg.includes("report-pdfs")) {
    return "Bucket de PDFs no configurado. Ejecute pnpm db:push para aplicar migraciones.";
  }

  if (errMsg.includes("ai_usage_log")) {
    return "Tabla ai_usage_log no existe. Ejecute pnpm db:push para aplicar migraciones.";
  }

  return "No se pudo generar el reporte. Intente de nuevo en unos momentos.";
}
