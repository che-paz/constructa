"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Stage } from "@constructa/types";
import { stageStatusLabel } from "@constructa/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { DELAY_ALERT_THRESHOLD_DAYS } from "@/lib/schedule/delay";

interface StageListProps {
  stages: Stage[];
}

function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("es-GT");
}

export function StageList({ stages }: StageListProps) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function markDelayed(stage: Stage) {
    setUpdatingId(stage.id);

    const today = new Date().toISOString().slice(0, 10);
    const res = await fetch(`/api/stages/${stage.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "delayed",
        actual_end: today,
      }),
    });

    setUpdatingId(null);
    if (res.ok) router.refresh();
  }

  async function updateProgress(stage: Stage, progress_pct: number) {
    setUpdatingId(stage.id);

    const res = await fetch(`/api/stages/${stage.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress_pct }),
    });

    setUpdatingId(null);
    if (res.ok) router.refresh();
  }

  if (stages.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Agrega etapas para comenzar el cronograma.
      </p>
    );
  }

  const sorted = [...stages].sort((a, b) => a.order_index - b.order_index);
  const minDate = sorted.find((s) => s.planned_start)?.planned_start;
  const maxDate = sorted.reduce<string | null>((max, s) => {
    const end = s.planned_end ?? s.planned_start;
    if (!end) return max;
    if (!max || end > max) return end;
    return max;
  }, null);

  const rangeStart = minDate ? new Date(minDate).getTime() : null;
  const rangeEnd = maxDate ? new Date(maxDate).getTime() : null;
  const rangeMs =
    rangeStart != null && rangeEnd != null && rangeEnd > rangeStart
      ? rangeEnd - rangeStart
      : null;

  return (
    <div className="space-y-4">
      {rangeMs != null && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Timeline</p>
          <div className="relative h-8 rounded-md bg-muted">
            {sorted.map((stage) => {
              if (!stage.planned_start || !stage.planned_end) return null;
              const start = new Date(stage.planned_start).getTime();
              const end = new Date(stage.planned_end).getTime();
              const left = ((start - rangeStart!) / rangeMs) * 100;
              const width = Math.max(((end - start) / rangeMs) * 100, 2);
              const isCritical =
                (stage.delay_days ?? 0) > DELAY_ALERT_THRESHOLD_DAYS;

              return (
                <div
                  key={`bar-${stage.id}`}
                  className={`absolute top-1 h-6 rounded-sm text-[10px] leading-6 text-white text-center truncate px-1 ${
                    isCritical ? "bg-destructive" : "bg-primary"
                  }`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  title={stage.name}
                >
                  {stage.name}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ul className="space-y-3">
        {sorted.map((stage, index) => {
          const isCritical =
            (stage.delay_days ?? 0) > DELAY_ALERT_THRESHOLD_DAYS;

          return (
            <li key={stage.id}>
              {index > 0 && <Separator className="mb-3" />}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{stage.name}</span>
                    <Badge variant="outline">
                      {stageStatusLabel(stage.status)}
                    </Badge>
                    {isCritical && (
                      <Badge variant="destructive">
                        {stage.delay_days} días de atraso
                      </Badge>
                    )}
                    {(stage.delay_days ?? 0) > 0 &&
                      (stage.delay_days ?? 0) <= DELAY_ALERT_THRESHOLD_DAYS && (
                        <Badge variant="secondary">
                          {stage.delay_days}d atraso
                        </Badge>
                      )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Previsto: {formatDate(stage.planned_start)} →{" "}
                    {formatDate(stage.planned_end)}
                    {stage.actual_end &&
                      ` · Real: ${formatDate(stage.actual_end)}`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    className="w-16 h-8"
                    defaultValue={stage.progress_pct}
                    disabled={updatingId === stage.id}
                    onBlur={(e) => {
                      const val = Number(e.target.value);
                      if (val !== stage.progress_pct) {
                        updateProgress(stage, val);
                      }
                    }}
                  />
                  <span className="text-xs text-muted-foreground">%</span>
                  {stage.status !== "delayed" && stage.status !== "completed" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={updatingId === stage.id}
                      onClick={() => markDelayed(stage)}
                    >
                      Marcar retraso
                    </Button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
