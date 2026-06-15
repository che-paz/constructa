"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Stage, StageStatus } from "@constructa/types";
import { stageStatusLabel } from "@constructa/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [delayStageId, setDelayStageId] = useState<string | null>(null);
  const [newPlannedEnd, setNewPlannedEnd] = useState("");
  const [delayReason, setDelayReason] = useState("");
  const [delayError, setDelayError] = useState<string | null>(null);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPlannedStart, setEditPlannedStart] = useState("");
  const [editPlannedEnd, setEditPlannedEnd] = useState("");
  const [editStatus, setEditStatus] = useState<StageStatus>("pending");
  const [editNotes, setEditNotes] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

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

  async function submitDelay(stage: Stage) {
    if (!newPlannedEnd) {
      setDelayError("Indica la nueva fecha de fin");
      return;
    }

    setUpdatingId(stage.id);
    setDelayError(null);

    const notePrefix = delayReason.trim()
      ? `Retraso: ${delayReason.trim()}`
      : "Retraso registrado";
    const mergedNotes = stage.notes
      ? `${stage.notes}\n${notePrefix}`
      : notePrefix;

    const res = await fetch(`/api/stages/${stage.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "delayed",
        planned_end: newPlannedEnd,
        notes: mergedNotes,
      }),
    });

    setUpdatingId(null);

    if (res.ok) {
      setDelayStageId(null);
      setNewPlannedEnd("");
      setDelayReason("");
      router.refresh();
    } else {
      setDelayError("No se pudo registrar el retraso");
    }
  }

  function startEdit(stage: Stage) {
    setEditingStageId(stage.id);
    setEditName(stage.name);
    setEditPlannedStart(stage.planned_start ?? "");
    setEditPlannedEnd(stage.planned_end ?? "");
    setEditStatus(stage.status);
    setEditNotes(stage.notes ?? "");
    setEditError(null);
    setDelayStageId(null);
  }

  async function submitEdit(stageId: string) {
    if (!editName.trim()) {
      setEditError("El nombre es requerido");
      return;
    }

    setUpdatingId(stageId);
    setEditError(null);

    const res = await fetch(`/api/stages/${stageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName.trim(),
        planned_start: editPlannedStart || null,
        planned_end: editPlannedEnd || null,
        status: editStatus,
        notes: editNotes || null,
      }),
    });

    setUpdatingId(null);

    if (res.ok) {
      setEditingStageId(null);
      router.refresh();
    } else {
      setEditError("No se pudo guardar la etapa");
    }
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
      <p className="text-xs text-muted-foreground">
        El porcentaje es el avance manual de la etapa. Para justificar un
        retraso, extiende la fecha de fin y describe el motivo.
      </p>

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
          const isDelayFormOpen = delayStageId === stage.id;

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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={updatingId === stage.id}
                    onClick={() => startEdit(stage)}
                  >
                    Editar
                  </Button>
                  {stage.status !== "delayed" &&
                    stage.status !== "completed" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={updatingId === stage.id}
                        onClick={() => {
                          setDelayStageId(stage.id);
                          setNewPlannedEnd(stage.planned_end ?? "");
                          setDelayReason("");
                          setDelayError(null);
                        }}
                      >
                        Marcar retraso
                      </Button>
                    )}
                </div>
              </div>

              {editingStageId === stage.id && (
                <div className="mt-3 rounded-md border bg-muted/30 p-3 space-y-3">
                  <p className="text-sm font-medium">Editar etapa</p>
                  {editError && (
                    <p className="text-sm text-destructive">{editError}</p>
                  )}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1 sm:col-span-2">
                      <Label htmlFor={`edit-name-${stage.id}`}>Nombre *</Label>
                      <Input
                        id={`edit-name-${stage.id}`}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`edit-start-${stage.id}`}>Inicio planificado</Label>
                      <Input
                        id={`edit-start-${stage.id}`}
                        type="date"
                        value={editPlannedStart}
                        onChange={(e) => setEditPlannedStart(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`edit-end-${stage.id}`}>Fin planificado</Label>
                      <Input
                        id={`edit-end-${stage.id}`}
                        type="date"
                        value={editPlannedEnd}
                        onChange={(e) => setEditPlannedEnd(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Estado</Label>
                      <Select
                        value={editStatus}
                        onValueChange={(v) => setEditStatus(v as StageStatus)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="in_progress">En progreso</SelectItem>
                          <SelectItem value="completed">Completada</SelectItem>
                          <SelectItem value="delayed">Retrasada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label htmlFor={`edit-notes-${stage.id}`}>Notas</Label>
                      <Textarea
                        id={`edit-notes-${stage.id}`}
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={updatingId === stage.id}
                      onClick={() => void submitEdit(stage.id)}
                    >
                      {updatingId === stage.id ? "Guardando…" : "Guardar"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingStageId(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {isDelayFormOpen && (
                <div className="mt-3 rounded-md border bg-muted/30 p-3 space-y-3">
                  <p className="text-sm font-medium">Registrar retraso</p>
                  {delayError && (
                    <p className="text-sm text-destructive">{delayError}</p>
                  )}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor={`delay-end-${stage.id}`}>
                        Nueva fecha de fin *
                      </Label>
                      <Input
                        id={`delay-end-${stage.id}`}
                        type="date"
                        value={newPlannedEnd}
                        onChange={(e) => setNewPlannedEnd(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label htmlFor={`delay-reason-${stage.id}`}>
                        Motivo del retraso
                      </Label>
                      <Textarea
                        id={`delay-reason-${stage.id}`}
                        value={delayReason}
                        onChange={(e) => setDelayReason(e.target.value)}
                        rows={2}
                        placeholder="Ej. lluvia, falta de material, cambio de diseño"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={updatingId === stage.id}
                      onClick={() => void submitDelay(stage)}
                    >
                      {updatingId === stage.id ? "Guardando…" : "Confirmar"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setDelayStageId(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
