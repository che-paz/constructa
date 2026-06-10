import type { OrganizationPlan } from "@constructa/types";
import { createClient } from "@/lib/supabase/server";

export type AIOperation = "assistant" | "report";

const HOURLY_RATE_LIMIT = 100;

const PLAN_LIMITS: Record<
  OrganizationPlan,
  { assistant_daily: number; report_monthly: number }
> = {
  basico: { assistant_daily: 0, report_monthly: 0 },
  profesional: { assistant_daily: 50, report_monthly: 30 },
  empresa: { assistant_daily: Number.MAX_SAFE_INTEGER, report_monthly: Number.MAX_SAFE_INTEGER },
};

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: string;
}

function startOfDayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function startOfHourIso(): string {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  return d.toISOString();
}

function startOfMonthIso(): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export function hasAIAccess(plan: OrganizationPlan): boolean {
  return plan !== "basico";
}

export async function checkAIQuota(
  organizationId: string,
  plan: OrganizationPlan,
  operation: AIOperation,
): Promise<QuotaCheckResult> {
  if (!hasAIAccess(plan)) {
    return {
      allowed: false,
      reason: "El plan Básico no incluye funciones de IA. Actualice a Profesional.",
    };
  }

  const limits = PLAN_LIMITS[plan];
  const supabase = await createClient();

  const { count: hourlyCount, error: hourlyError } = await supabase
    .from("ai_usage_log")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .gte("created_at", startOfHourIso());

  if (hourlyError) throw hourlyError;

  if ((hourlyCount ?? 0) >= HOURLY_RATE_LIMIT) {
    return {
      allowed: false,
      reason: "Límite de 100 consultas por hora alcanzado. Intente más tarde.",
    };
  }

  if (operation === "assistant") {
    const { count, error } = await supabase
      .from("ai_usage_log")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("operation", "assistant")
      .gte("created_at", startOfDayIso());

    if (error) throw error;

    if ((count ?? 0) >= limits.assistant_daily) {
      return {
        allowed: false,
        reason: "Cuota diaria de consultas al asistente alcanzada.",
      };
    }
  }

  if (operation === "report") {
    const { count, error } = await supabase
      .from("ai_usage_log")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("operation", "report")
      .gte("created_at", startOfMonthIso());

    if (error) throw error;

    if ((count ?? 0) >= limits.report_monthly) {
      return {
        allowed: false,
        reason: "Cuota mensual de reportes alcanzada.",
      };
    }
  }

  return { allowed: true };
}

export async function logAIUsage(params: {
  organizationId: string;
  userId: string;
  operation: AIOperation;
  tokensInput?: number;
  tokensOutput?: number;
  latencyMs?: number;
}): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("ai_usage_log").insert({
    organization_id: params.organizationId,
    user_id: params.userId,
    operation: params.operation,
    tokens_input: params.tokensInput ?? 0,
    tokens_output: params.tokensOutput ?? 0,
    latency_ms: params.latencyMs ?? null,
  });

  if (error) {
    console.error("[ai/logAIUsage]", error);
  }
}
