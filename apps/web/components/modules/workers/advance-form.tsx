"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateWorkerAdvanceSchema } from "@constructa/schemas";
import type { Worker, WorkerAdvance } from "@constructa/types";
import { formatGtq } from "@constructa/utils";
import { Badge } from "@/components/ui/badge";
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

interface AdvanceFormProps {
  projectId: string;
  workers: Worker[];
  advances: WorkerAdvance[];
  weekStart: string;
}

export function AdvanceForm({
  projectId,
  workers,
  advances,
  weekStart,
}: AdvanceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workerId, setWorkerId] = useState("");
  const [amount, setAmount] = useState("");
  const [advanceDate, setAdvanceDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [notes, setNotes] = useState("");

  const activeWorkers = workers.filter((w) => w.is_active);
  const weekAdvances = advances.filter(
    (a) => a.week_start === weekStart && !a.is_deducted,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!workerId) {
      setError("Selecciona un trabajador");
      return;
    }

    const payload = {
      worker_id: workerId,
      amount: Number(amount),
      advance_date: advanceDate,
      notes: notes || null,
      week_start: weekStart,
    };

    const parsed = CreateWorkerAdvanceSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Datos inválidos");
      return;
    }

    setLoading(true);

    const res = await fetch(`/api/projects/${projectId}/advances`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    const data: { error?: string } = await res.json();

    if (!res.ok) {
      setError(
        typeof data.error === "string"
          ? data.error
          : "No se pudo registrar el adelanto",
      );
      setLoading(false);
      return;
    }

    setAmount("");
    setNotes("");
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(advanceId: string) {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/advances/${advanceId}`, {
      method: "DELETE",
    });

    const data: { error?: string } = await res.json();

    if (!res.ok) {
      setError(
        typeof data.error === "string"
          ? data.error
          : "No se pudo eliminar el adelanto",
      );
      setLoading(false);
      return;
    }

    setLoading(false);
    router.refresh();
  }

  if (activeWorkers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Agrega trabajadores antes de registrar adelantos.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="advanceWorker">Trabajador *</Label>
            <Select value={workerId} onValueChange={setWorkerId}>
              <SelectTrigger id="advanceWorker">
                <SelectValue placeholder="Seleccionar…" />
              </SelectTrigger>
              <SelectContent>
                {activeWorkers.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="advanceAmount">Monto (GTQ) *</Label>
            <Input
              id="advanceAmount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="advanceDate">Fecha del adelanto *</Label>
            <Input
              id="advanceDate"
              type="date"
              value={advanceDate}
              onChange={(e) => setAdvanceDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="advanceNotes">Notas</Label>
            <Textarea
              id="advanceNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Opcional — motivo del adelanto"
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Se descontará en la planilla de la semana del{" "}
          {new Date(`${weekStart}T12:00:00`).toLocaleDateString("es-GT", {
            day: "numeric",
            month: "short",
          })}
          .
        </p>

        <Button type="submit" disabled={loading}>
          {loading ? "Guardando…" : "Registrar adelanto"}
        </Button>
      </form>

      {weekAdvances.length > 0 && (
        <div className="rounded-md border">
          <p className="border-b bg-muted/50 px-3 py-2 text-sm font-medium">
            Adelantos de esta semana
          </p>
          <ul className="divide-y text-sm">
            {weekAdvances.map((advance) => {
              const worker = workers.find((w) => w.id === advance.worker_id);
              return (
                <li
                  key={advance.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
                >
                  <div>
                    <p className="font-medium">
                      {worker?.name ?? "Trabajador"} —{" "}
                      {formatGtq(Number(advance.amount))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(
                        `${advance.advance_date}T12:00:00`,
                      ).toLocaleDateString("es-GT")}
                      {advance.notes ? ` · ${advance.notes}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Pendiente de descuento</Badge>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={loading}
                      onClick={() => void handleDelete(advance.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
