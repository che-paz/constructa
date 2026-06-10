import type { Stage } from "@constructa/types";
import { calculateStageDelayDays } from "@constructa/utils";

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * When a stage is delayed, push subsequent stages' planned dates by the delay amount.
 * MVP: shifts planned_start and planned_end of stages with higher order_index.
 */
export function computeDependentStageUpdates(
  allStages: Stage[],
  updatedStage: Stage,
): { id: string; planned_start: string | null; planned_end: string | null }[] {
  const delayDays = calculateStageDelayDays(
    updatedStage.planned_end,
    updatedStage.actual_end,
    updatedStage.status,
  );

  if (delayDays <= 0 || updatedStage.status !== "delayed") {
    return [];
  }

  const subsequent = allStages
    .filter((s) => s.order_index > updatedStage.order_index)
    .sort((a, b) => a.order_index - b.order_index);

  return subsequent.map((stage) => ({
    id: stage.id,
    planned_start: stage.planned_start
      ? addDays(stage.planned_start, delayDays)
      : null,
    planned_end: stage.planned_end
      ? addDays(stage.planned_end, delayDays)
      : null,
  }));
}
