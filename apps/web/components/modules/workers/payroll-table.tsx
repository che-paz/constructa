"use client";

import { useEffect, useState } from "react";
import type { PayrollSummary } from "@constructa/types";
import {
  attendanceTypeLabel,
  formatGtq,
  getWeekStart,
  workerSpecialtyLabel,
} from "@constructa/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PayrollTableProps {
  projectId: string;
  initialPayroll: PayrollSummary;
  onWeekChange?: (weekStart: string) => void;
}

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function PayrollTable({
  projectId,
  initialPayroll,
  onWeekChange,
}: PayrollTableProps) {
  const [payroll, setPayroll] = useState(initialPayroll);
  const [loading, setLoading] = useState(false);
  const currentWeekStart = getWeekStart();

  useEffect(() => {
    setPayroll(initialPayroll);
  }, [initialPayroll]);

  async function handleWeekChange(weekStart: string) {
    setLoading(true);
    onWeekChange?.(weekStart);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/payroll?week=${weekStart}`,
      );
      if (res.ok) {
        setPayroll((await res.json()) as PayrollSummary);
      }
    } finally {
      setLoading(false);
    }
  }

  function shiftWeek(delta: number) {
    const d = new Date(`${payroll.week_start}T12:00:00`);
    d.setDate(d.getDate() + delta * 7);
    void handleWeekChange(d.toISOString().slice(0, 10));
  }

  function workerRateLabel(row: PayrollSummary["rows"][number]) {
    if (row.payment_type === "contract") {
      return `${workerSpecialtyLabel(row.specialty)} · Por contrato`;
    }
    return `${workerSpecialtyLabel(row.specialty)} · ${formatGtq(row.daily_rate)}/día`;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Planilla semanal</CardTitle>
            <CardDescription>
              Cierre de semana con adelantos y pagos del día
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => shiftWeek(-1)}
            >
              ← Semana anterior
            </Button>
            <div className="space-y-1">
              <Label htmlFor="weekPicker" className="text-xs">
                Semana (lunes)
              </Label>
              <Input
                id="weekPicker"
                type="date"
                className="h-8 w-36"
                value={payroll.week_start}
                disabled={loading}
                onChange={(e) => void handleWeekChange(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || payroll.week_start >= currentWeekStart}
              onClick={() => shiftWeek(1)}
            >
              Semana siguiente →
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando planilla…</p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-md border px-3 py-2">
                <p className="text-xs text-muted-foreground">Trabajadores</p>
                <p className="text-lg font-semibold">{payroll.workers_count}</p>
              </div>
              <div className="rounded-md border px-3 py-2">
                <p className="text-xs text-muted-foreground">Bruto semanal</p>
                <p className="text-lg font-semibold">
                  {formatGtq(payroll.total_amount)}
                </p>
              </div>
              <div className="rounded-md border px-3 py-2">
                <p className="text-xs text-muted-foreground">Adelantos</p>
                <p className="text-lg font-semibold text-amber-700">
                  {formatGtq(payroll.advances_amount)}
                </p>
              </div>
              <div className="rounded-md border px-3 py-2">
                <p className="text-xs text-muted-foreground">Pagado en semana</p>
                <p className="text-lg font-semibold text-green-700">
                  {formatGtq(payroll.paid_amount)}
                </p>
              </div>
              <div className="rounded-md border px-3 py-2 sm:col-span-2 lg:col-span-1">
                <p className="text-xs text-muted-foreground">Neto al cierre</p>
                <p className="text-lg font-semibold">
                  {formatGtq(payroll.net_amount)}
                </p>
              </div>
            </div>

            {payroll.rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay asistencia registrada en esta semana.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full min-w-[900px] text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left">
                      <th className="px-3 py-2 font-medium">Trabajador</th>
                      {DAY_LABELS.map((label, i) => (
                        <th
                          key={label}
                          className="px-2 py-2 text-center font-medium"
                        >
                          {label}
                          <br />
                          <span className="text-xs font-normal text-muted-foreground">
                            {payroll.rows[0]?.days[i]?.work_date.slice(8)}
                          </span>
                        </th>
                      ))}
                      <th className="px-3 py-2 text-right font-medium">Horas</th>
                      <th className="px-3 py-2 text-right font-medium">Bruto</th>
                      <th className="px-3 py-2 text-right font-medium">
                        Adelantos
                      </th>
                      <th className="px-3 py-2 text-right font-medium">Neto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payroll.rows.map((row) => (
                      <tr key={row.worker_id} className="border-b last:border-0">
                        <td className="px-3 py-2">
                          <p className="font-medium">{row.worker_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {workerRateLabel(row)}
                          </p>
                        </td>
                        {row.days.map((day) => (
                          <td
                            key={day.work_date}
                            className="px-1 py-2 text-center"
                          >
                            {day.amount > 0 || day.hours_worked > 0 ? (
                              <div className="space-y-0.5">
                                <Badge
                                  variant={day.is_paid ? "default" : "secondary"}
                                  className="text-xs"
                                  title={
                                    day.is_paid
                                      ? "Pagado el mismo día"
                                      : "Pendiente al cierre"
                                  }
                                >
                                  {row.payment_type === "contract"
                                    ? formatGtq(day.amount)
                                    : `${day.hours_worked}h`}
                                </Badge>
                                {row.payment_type !== "contract" && (
                                  <p className="text-xs text-muted-foreground">
                                    {attendanceTypeLabel(day.attendance_type)
                                      .replace("Jornada ", "")
                                      .slice(0, 4)}
                                  </p>
                                )}
                                {day.is_paid && (
                                  <p className="text-xs text-green-700">Pagado</p>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        ))}
                        <td className="px-3 py-2 text-right">
                          {row.total_hours}h
                        </td>
                        <td className="px-3 py-2 text-right font-medium">
                          {formatGtq(row.total_amount)}
                        </td>
                        <td className="px-3 py-2 text-right text-amber-700">
                          {row.advances_amount > 0
                            ? formatGtq(row.advances_amount)
                            : "—"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {row.net_amount > 0 ? (
                            <span className="font-medium">
                              {formatGtq(row.net_amount)}
                            </span>
                          ) : (
                            <span className="text-green-700">Pagado</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/30 font-medium">
                      <td className="px-3 py-2" colSpan={8}>
                        Total semana
                      </td>
                      <td className="px-3 py-2 text-right">
                        {payroll.total_hours}h
                      </td>
                      <td className="px-3 py-2 text-right">
                        {formatGtq(payroll.total_amount)}
                      </td>
                      <td className="px-3 py-2 text-right text-amber-700">
                        {formatGtq(payroll.advances_amount)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {formatGtq(payroll.net_amount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
