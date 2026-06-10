"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateStageSchema } from "@constructa/schemas";
import type { StageStatus } from "@constructa/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GT_TEMPLATES = [
  "Cimentación",
  "Muros",
  "Losas",
  "Eléctrico",
  "Plomería",
  "Techado",
  "Acabados",
];

interface StageFormProps {
  projectId: string;
}

export function StageForm({ projectId }: StageFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [plannedStart, setPlannedStart] = useState("");
  const [plannedEnd, setPlannedEnd] = useState("");
  const [progressPct, setProgressPct] = useState("0");
  const [status, setStatus] = useState<StageStatus>("pending");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      name,
      planned_start: plannedStart || null,
      planned_end: plannedEnd || null,
      progress_pct: Number(progressPct),
      status,
      notes: notes || null,
    };

    const parsed = CreateStageSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Datos inválidos");
      return;
    }

    setLoading(true);

    const res = await fetch(`/api/projects/${projectId}/stages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    const data: { error?: string } = await res.json();

    if (!res.ok) {
      setError(
        typeof data.error === "string"
          ? data.error
          : "No se pudo crear la etapa",
      );
      setLoading(false);
      return;
    }

    setName("");
    setPlannedStart("");
    setPlannedEnd("");
    setProgressPct("0");
    setStatus("pending");
    setNotes("");
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {GT_TEMPLATES.map((tpl) => (
          <Button
            key={tpl}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setName(tpl)}
          >
            {tpl}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="stageName">Nombre de etapa *</Label>
          <Input
            id="stageName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="plannedStart">Inicio previsto</Label>
          <Input
            id="plannedStart"
            type="date"
            value={plannedStart}
            onChange={(e) => setPlannedStart(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="plannedEnd">Fin previsto</Label>
          <Input
            id="plannedEnd"
            type="date"
            value={plannedEnd}
            onChange={(e) => setPlannedEnd(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="progressPct">Avance (%)</Label>
          <Input
            id="progressPct"
            type="number"
            min="0"
            max="100"
            value={progressPct}
            onChange={(e) => setProgressPct(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stageStatus">Estado</Label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as StageStatus)}
          >
            <SelectTrigger id="stageStatus">
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

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="stageNotes">Notas</Label>
          <Textarea
            id="stageNotes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Guardando…" : "Agregar etapa"}
      </Button>
    </form>
  );
}
