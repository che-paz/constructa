"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateAttendanceSchema } from "@constructa/schemas";
import type { AttendanceType, Worker } from "@constructa/types";
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

interface AttendanceFormProps {
  projectId: string;
  workers: Worker[];
}

export function AttendanceForm({ projectId, workers }: AttendanceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workerId, setWorkerId] = useState("");
  const [workDate, setWorkDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [checkInTime, setCheckInTime] = useState("07:00");
  const [checkOutTime, setCheckOutTime] = useState("16:00");
  const [attendanceType, setAttendanceType] =
    useState<AttendanceType>("full");
  const [notes, setNotes] = useState("");
  const [markPaid, setMarkPaid] = useState(false);

  const activeWorkers = workers.filter((w) => w.is_active);

  function buildTimestamp(date: string, time: string): string | null {
    if (attendanceType === "absent") return null;
    return new Date(`${date}T${time}:00`).toISOString();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!workerId) {
      setError("Selecciona un trabajador");
      return;
    }

    const checkIn = buildTimestamp(workDate, checkInTime);
    const checkOut = buildTimestamp(workDate, checkOutTime);

    const payload = {
      project_id: projectId,
      worker_id: workerId,
      work_date: workDate,
      check_in: checkIn,
      check_out: checkOut,
      attendance_type: attendanceType,
      check_in_method: "manual" as const,
      notes: notes || null,
      is_paid: markPaid,
    };

    const parsed = CreateAttendanceSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Datos inválidos");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    const data: { error?: string } = await res.json();

    if (!res.ok) {
      setError(
        typeof data.error === "string"
          ? data.error
          : "No se pudo registrar la asistencia",
      );
      setLoading(false);
      return;
    }

    setNotes("");
    setMarkPaid(false);
    setLoading(false);
    router.refresh();
  }

  if (activeWorkers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Agrega al menos un trabajador activo antes de registrar asistencia.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="attendanceWorker">Trabajador *</Label>
          <Select value={workerId} onValueChange={setWorkerId}>
            <SelectTrigger id="attendanceWorker">
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
          <Label htmlFor="workDate">Fecha *</Label>
          <Input
            id="workDate"
            type="date"
            value={workDate}
            onChange={(e) => setWorkDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="attendanceType">Tipo de jornada *</Label>
          <Select
            value={attendanceType}
            onValueChange={(v) => setAttendanceType(v as AttendanceType)}
          >
            <SelectTrigger id="attendanceType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Jornada completa</SelectItem>
              <SelectItem value="half">Media jornada</SelectItem>
              <SelectItem value="overtime">Horas extra</SelectItem>
              <SelectItem value="absent">Ausente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {attendanceType !== "absent" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="checkIn">Entrada</Label>
              <Input
                id="checkIn"
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkOut">Salida</Label>
              <Input
                id="checkOut"
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="attendanceNotes">Notas</Label>
          <Textarea
            id="attendanceNotes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        <div className="flex items-center gap-2 sm:col-span-2">
          <input
            id="markPaid"
            type="checkbox"
            checked={markPaid}
            onChange={(e) => setMarkPaid(e.target.checked)}
            className="h-4 w-4 rounded border"
          />
          <Label htmlFor="markPaid" className="font-normal">
            Marcar como pagado
          </Label>
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Registrando…" : "Registrar asistencia"}
      </Button>
    </form>
  );
}
