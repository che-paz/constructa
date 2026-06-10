import type { Worker, WorkerAttendance } from "@constructa/types";
import {
  attendanceTypeLabel,
  formatGtq,
  workerSpecialtyLabel,
} from "@constructa/utils";
import { Badge } from "@/components/ui/badge";
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
}

export function WorkerHistory({ worker, attendance }: WorkerHistoryProps) {
  const records = attendance.filter((a) => a.worker_id === worker.id);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Historial — {worker.name}
        </CardTitle>
        <CardDescription>
          {workerSpecialtyLabel(worker.specialty)} · Jornal{" "}
          {worker.daily_rate != null
            ? formatGtq(Number(worker.daily_rate))
            : "sin definir"}{" "}
          · {records.length}{" "}
          {records.length === 1 ? "registro" : "registros"} en esta obra
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border px-3 py-2">
            <p className="text-xs text-muted-foreground">Horas acumuladas</p>
            <p className="text-lg font-semibold">{totalHours}h</p>
          </div>
          <div className="rounded-md border px-3 py-2">
            <p className="text-xs text-muted-foreground">Monto acumulado</p>
            <p className="text-lg font-semibold">{formatGtq(totalAmount)}</p>
          </div>
          <div className="rounded-md border px-3 py-2">
            <p className="text-xs text-muted-foreground">Pagado</p>
            <p className="text-lg font-semibold">
              {formatGtq(paidAmount)} / {formatGtq(totalAmount)}
            </p>
          </div>
        </div>

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
                      {attendanceTypeLabel(record.attendance_type)}
                    </td>
                    <td className="px-3 py-2">
                      {Number(record.hours_worked ?? 0)}h
                    </td>
                    <td className="px-3 py-2">
                      {formatGtq(Number(record.amount_paid ?? 0))}
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={record.is_paid ? "default" : "secondary"}>
                        {record.is_paid ? "Pagado" : "Pendiente"}
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
