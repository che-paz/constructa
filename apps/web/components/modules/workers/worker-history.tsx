"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AttendanceType, Worker, WorkerAdvance, WorkerAttendance } from "@constructa/types";
import {
  attendanceTypeLabel,
  formatGtq,
  workerPaymentTypeLabel,
  workerSpecialtyLabel,
} from "@constructa/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [editingAttendanceId, setEditingAttendanceId] = useState<string | null>(
    null,
  );
  const [editingAdvanceId, setEditingAdvanceId] = useState<string | null>(null);
  const [editAttendanceType, setEditAttendanceType] =
    useState<AttendanceType>("full");
  const [editAmount, setEditAmount] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editIsPaid, setEditIsPaid] = useState(false);
  const [editAdvanceAmount, setEditAdvanceAmount] = useState("");
  const [editAdvanceDate, setEditAdvanceDate] = useState("");
  const [editAdvanceNotes, setEditAdvanceNotes] = useState("");

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

  function startEditAttendance(record: WorkerAttendance) {
    setEditingAttendanceId(record.id);
    setEditAttendanceType(record.attendance_type);
    setEditAmount(
      record.amount_paid != null ? String(record.amount_paid) : "",
    );
    setEditNotes(record.notes ?? "");
    setEditIsPaid(record.is_paid);
    setError(null);
  }

  async function handleSaveAttendance(recordId: string) {
    setLoading(true);
    setError(null);

    const payload = isContract
      ? {
          amount_paid: editAmount ? Number(editAmount) : null,
          notes: editNotes || null,
          is_paid: editIsPaid,
        }
      : {
          attendance_type: editAttendanceType,
          notes: editNotes || null,
          is_paid: editIsPaid,
        };

    const res = await fetch(`/api/attendance/${recordId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data: { error?: string } = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(
        typeof data.error === "string"
          ? data.error
          : "No se pudo actualizar la asistencia",
      );
      return;
    }

    setEditingAttendanceId(null);
    router.refresh();
  }

  async function handleDeleteAttendance(recordId: string) {
    if (!confirm("¿Eliminar este registro de asistencia?")) return;

    setLoading(true);
    const res = await fetch(`/api/attendance/${recordId}`, { method: "DELETE" });
    setLoading(false);

    if (!res.ok) {
      setError("No se pudo eliminar la asistencia");
      return;
    }

    router.refresh();
  }

  function startEditAdvance(advance: WorkerAdvance) {
    setEditingAdvanceId(advance.id);
    setEditAdvanceAmount(String(advance.amount));
    setEditAdvanceDate(advance.advance_date);
    setEditAdvanceNotes(advance.notes ?? "");
    setError(null);
  }

  async function handleSaveAdvance(advanceId: string) {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/advances/${advanceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(editAdvanceAmount),
        advance_date: editAdvanceDate,
        notes: editAdvanceNotes || null,
      }),
    });

    const data: { error?: string } = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(
        typeof data.error === "string"
          ? data.error
          : "No se pudo actualizar el adelanto",
      );
      return;
    }

    setEditingAdvanceId(null);
    router.refresh();
  }

  async function handleDeleteAdvance(advanceId: string) {
    if (!confirm("¿Eliminar este adelanto?")) return;

    setLoading(true);
    const res = await fetch(`/api/advances/${advanceId}`, { method: "DELETE" });
    setLoading(false);

    if (!res.ok) {
      setError("No se pudo eliminar el adelanto");
      return;
    }

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
                  <th className="px-3 py-2 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {workerAdvances.map((advance) => (
                  <tr key={advance.id} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium">
                      {editingAdvanceId === advance.id ? (
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          className="h-8 w-24"
                          value={editAdvanceAmount}
                          onChange={(e) => setEditAdvanceAmount(e.target.value)}
                          disabled={advance.is_deducted}
                        />
                      ) : (
                        formatGtq(Number(advance.amount))
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editingAdvanceId === advance.id ? (
                        <Input
                          type="date"
                          className="h-8 w-36"
                          value={editAdvanceDate}
                          onChange={(e) => setEditAdvanceDate(e.target.value)}
                          disabled={advance.is_deducted}
                        />
                      ) : (
                        new Date(
                          `${advance.advance_date}T12:00:00`,
                        ).toLocaleDateString("es-GT")
                      )}
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
                      {editingAdvanceId === advance.id ? (
                        <Input
                          className="h-8"
                          value={editAdvanceNotes}
                          onChange={(e) => setEditAdvanceNotes(e.target.value)}
                        />
                      ) : (
                        (advance.notes ?? "—")
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {!advance.is_deducted && (
                        <div className="flex gap-1">
                          {editingAdvanceId === advance.id ? (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                disabled={loading}
                                onClick={() => void handleSaveAdvance(advance.id)}
                              >
                                OK
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingAdvanceId(null)}
                              >
                                Cancelar
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                disabled={loading}
                                onClick={() => startEditAdvance(advance)}
                              >
                                Editar
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                disabled={loading}
                                onClick={() =>
                                  void handleDeleteAdvance(advance.id)
                                }
                              >
                                Eliminar
                              </Button>
                            </>
                          )}
                        </div>
                      )}
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
                  <th className="px-3 py-2 font-medium">Acciones</th>
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
                      {editingAttendanceId === record.id && !isContract ? (
                        <Select
                          value={editAttendanceType}
                          onValueChange={(v) =>
                            setEditAttendanceType(v as AttendanceType)
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full">Completa</SelectItem>
                            <SelectItem value="half">Media</SelectItem>
                            <SelectItem value="overtime">Extra</SelectItem>
                            <SelectItem value="absent">Ausente</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : isContract ? (
                        "Contrato"
                      ) : (
                        attendanceTypeLabel(record.attendance_type)
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {Number(record.hours_worked ?? 0)}h
                    </td>
                    <td className="px-3 py-2">
                      {editingAttendanceId === record.id && isContract ? (
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="h-8 w-24"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                        />
                      ) : (
                        formatGtq(Number(record.amount_paid ?? 0))
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editingAttendanceId === record.id ? (
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={editIsPaid}
                            onChange={(e) => setEditIsPaid(e.target.checked)}
                          />
                          Pagado
                        </label>
                      ) : (
                        <Badge variant={record.is_paid ? "default" : "secondary"}>
                          {record.is_paid ? "Pagado el día" : "Pendiente"}
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {editingAttendanceId === record.id ? (
                        <Textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          rows={1}
                          className="min-h-8"
                        />
                      ) : (
                        (record.notes ?? "—")
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        {editingAttendanceId === record.id ? (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              disabled={loading}
                              onClick={() => void handleSaveAttendance(record.id)}
                            >
                              OK
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingAttendanceId(null)}
                            >
                              Cancelar
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              disabled={loading}
                              onClick={() => startEditAttendance(record)}
                            >
                              Editar
                            </Button>
                            {!record.is_paid && (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                disabled={loading}
                                onClick={() =>
                                  void handleDeleteAttendance(record.id)
                                }
                              >
                                Eliminar
                              </Button>
                            )}
                          </>
                        )}
                      </div>
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
