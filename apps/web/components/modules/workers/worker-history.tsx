"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Worker, WorkerAdvance, WorkerAttendance } from "@constructa/types";
import {
  attendanceTypeLabel,
  formatGtq,
  workerPaymentTypeLabel,
  workerSpecialtyLabel,
} from "@constructa/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface WorkerHistoryProps {
  worker: Worker;
  attendance: WorkerAttendance[];
  advances: WorkerAdvance[];
}

export function WorkerHistory({
  worker,
  attendance,
  advances,
}: WorkerHistoryProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingRate, setEditingRate] = useState(false);
  const [editRate, setEditRate] = useState(
    worker.daily_rate != null ? String(worker.daily_rate) : "",
  );

  const records = attendance.filter((a) => a.worker_id === worker.id);
  const workerAdvances = advances.filter((a) => a.worker_id === worker.id);

  const totalHours = records.reduce(
    (s, a) => s + Number(a.hours_worked ?? 0),
    0,
  );
  const totalAmount = records.reduce(
    (s, a) => s + Number(a.amount_paid ?? 0),
    0,
  );
  const paidAmount = records
    .filter((a) => a.is_paid)
    .reduce((s, a) => s + Number(a.amount_paid ?? 0), 0);
  const advancesTotal = workerAdvances.reduce(
    (s, a) => s + Number(a.amount),
    0,
  );

  const isContract = (worker.payment_type ?? "daily") === "contract";

  async function handleSaveRate() {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/workers/${worker.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        daily_rate: editRate ? Number(editRate) : null,
      }),
    });

    if (!res.ok) {
      setError("No se pudo actualizar el jornal");
      setLoading(false);
      return;
    }

    setEditingRate(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Historial — {worker.name}</CardTitle>
        <CardDescription>
          {workerSpecialtyLabel(worker.specialty)} ·{" "}
          {workerPaymentTypeLabel(worker.payment_type)}
          {!isContract && (
            <>
              {" "}
              · Jornal{" "}
              {worker.daily_rate != null
                ? formatGtq(Number(worker.daily_rate))
                : "sin definir"}
            </>
          )}{" "}
          · {records.length}{" "}
          {records.length === 1 ? "registro" : "registros"} en esta obra
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {!isContract && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Jornal actual:</span>
            {editingRate ? (
              <>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="h-8 w-28"
                  value={editRate}
                  onChange={(e) => setEditRate(e.target.value)}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={loading}
                  onClick={() => void handleSaveRate()}
                >
                  Guardar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingRate(false)}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <button
                type="button"
                className="font-medium hover:underline"
                onClick={() => setEditingRate(true)}
              >
                {worker.daily_rate != null
                  ? formatGtq(Number(worker.daily_rate))
                  : "Sin definir"}
              </button>
            )}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-md border px-3 py-2">
            <p className="text-xs text-muted-foreground">Horas acumuladas</p>
            <p className="text-lg font-semibold">{totalHours}h</p>
          </div>
          <div className="rounded-md border px-3 py-2">
            <p className="text-xs text-muted-foreground">Monto acumulado</p>
            <p className="text-lg font-semibold">{formatGtq(totalAmount)}</p>
          </div>
          <div className="rounded-md border px-3 py-2">
            <p className="text-xs text-muted-foreground">Adelantos (obra)</p>
            <p className="text-lg font-semibold text-amber-700">
              {formatGtq(advancesTotal)}
            </p>
          </div>
          <div className="rounded-md border px-3 py-2">
            <p className="text-xs text-muted-foreground">Pagado</p>
            <p className="text-lg font-semibold">
              {formatGtq(paidAmount)} / {formatGtq(totalAmount)}
            </p>
          </div>
        </div>

        {workerAdvances.length > 0 && (
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-3 py-2 font-medium">Adelantos</th>
                  <th className="px-3 py-2 font-medium">Fecha</th>
                  <th className="px-3 py-2 font-medium">Semana</th>
                  <th className="px-3 py-2 font-medium">Estado</th>
                  <th className="px-3 py-2 font-medium">Notas</th>
                </tr>
              </thead>
              <tbody>
                {workerAdvances.map((advance) => (
                  <tr key={advance.id} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium">
                      {formatGtq(Number(advance.amount))}
                    </td>
                    <td className="px-3 py-2">
                      {new Date(
                        `${advance.advance_date}T12:00:00`,
                      ).toLocaleDateString("es-GT")}
                    </td>
                    <td className="px-3 py-2">
                      {new Date(
                        `${advance.week_start}T12:00:00`,
                      ).toLocaleDateString("es-GT", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="px-3 py-2">
                      <Badge
                        variant={advance.is_deducted ? "default" : "secondary"}
                      >
                        {advance.is_deducted ? "Descontado" : "Pendiente"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {advance.notes ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sin asistencia registrada en este proyecto.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-3 py-2 font-medium">Fecha</th>
                  <th className="px-3 py-2 font-medium">Jornada</th>
                  <th className="px-3 py-2 font-medium">Horas</th>
                  <th className="px-3 py-2 font-medium">Monto</th>
                  <th className="px-3 py-2 font-medium">Estado</th>
                  <th className="px-3 py-2 font-medium">Notas</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      {new Date(`${record.work_date}T12:00:00`).toLocaleDateString(
                        "es-GT",
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isContract
                        ? "Contrato"
                        : attendanceTypeLabel(record.attendance_type)}
                    </td>
                    <td className="px-3 py-2">
                      {Number(record.hours_worked ?? 0)}h
                    </td>
                    <td className="px-3 py-2">
                      {formatGtq(Number(record.amount_paid ?? 0))}
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={record.is_paid ? "default" : "secondary"}>
                        {record.is_paid ? "Pagado el día" : "Pendiente"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {record.notes ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
