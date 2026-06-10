import type { Stage } from "@constructa/types";
import { calculateStageDelayDays } from "@constructa/utils";

export const DELAY_ALERT_THRESHOLD_DAYS = 5;

export function enrichStageWithDelay(stage: Stage, referenceDate?: string): Stage {
  const delay_days = calculateStageDelayDays(
    stage.planned_end,
    stage.actual_end,
    stage.status,
    referenceDate,
  );
  return { ...stage, delay_days };
}

export function isStageCriticallyDelayed(stage: Stage, referenceDate?: string): boolean {
  const enriched = enrichStageWithDelay(stage, referenceDate);
  return (enriched.delay_days ?? 0) > DELAY_ALERT_THRESHOLD_DAYS;
}
