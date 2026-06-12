"use client";

import { useState } from "react";
import type {
  CashflowPeriod,
  CashflowSummary,
  FinanceDashboard,
} from "@constructa/types";
import { formatGtq } from "@constructa/utils";
import { Download } from "lucide-react";
import { CashflowChart } from "@/components/modules/finance/cashflow-chart";
import { FinanceAlerts } from "@/components/modules/finance/finance-alerts";
import { ProjectsFinancialTable } from "@/components/modules/finance/projects-financial-table";
import { financialSummaryToCsv } from "@/lib/finance/summary";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FinanceDashboardViewProps {
  dashboard: FinanceDashboard;
  initialCashflow: CashflowSummary;
}

export function FinanceDashboardView({
  dashboard,
  initialCashflow,
}: FinanceDashboardViewProps) {
  const [period, setPeriod] = useState<CashflowPeriod>(initialCashflow.period);
  const [cashflow, setCashflow] = useState(initialCashflow);
  const [loadingCashflow, setLoadingCashflow] = useState(false);

  async function handlePeriodChange(value: CashflowPeriod) {
    setPeriod(value);
    setLoadingCashflow(true);
    try {
      const res = await fetch(`/api/finance/cashflow?period=${value}`);
      if (res.ok) {
        const data = (await res.json()) as CashflowSummary;
        setCashflow(data);
      }
    } finally {
      setLoadingCashflow(false);
    }
  }

  function exportCsv() {
    const csv = financialSummaryToCsv(dashboard);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `constructa-finanzas-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const { totals } = dashboard;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            Centro Financiero
          </h1>
          <p className="text-sm text-muted-foreground">
            Vista consolidada de presupuesto, cobros, gastos y cuentas por
            cobrar
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full shrink-0 sm:w-auto"
          onClick={exportCsv}
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Presupuesto total</CardDescription>
            <CardTitle className="text-lg md:text-2xl">
              {formatGtq(totals.total_budget)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cobrado</CardDescription>
            <CardTitle className="text-lg md:text-2xl">
              {formatGtq(totals.total_received)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Gastado</CardDescription>
            <CardTitle className="text-lg md:text-2xl">
              {formatGtq(totals.total_spent)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Saldo presupuesto</CardDescription>
            <CardTitle className="text-lg md:text-2xl">
              {formatGtq(totals.total_remaining_budget)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cuentas por cobrar</CardDescription>
            <CardTitle className="text-lg md:text-2xl">
              {formatGtq(totals.total_pending_receivable)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <FinanceAlerts alerts={dashboard.alerts} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Proyectos</CardTitle>
          <CardDescription>
            Gasto real vs presupuesto por obra
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectsFinancialTable projects={dashboard.projects} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Flujo de caja</CardTitle>
            <CardDescription>
              Entradas vs salidas —{" "}
              {new Date(`${cashflow.period_start}T12:00:00`).toLocaleDateString(
                "es-GT",
              )}{" "}
              al{" "}
              {new Date(`${cashflow.period_end}T12:00:00`).toLocaleDateString(
                "es-GT",
              )}
            </CardDescription>
          </div>
          <Select
            value={period}
            onValueChange={(v) => handlePeriodChange(v as CashflowPeriod)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mes</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Entradas</p>
              <p className="text-lg font-semibold text-primary">
                {formatGtq(cashflow.total_inflows)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Salidas</p>
              <p className="text-lg font-semibold text-destructive">
                {formatGtq(cashflow.total_outflows)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Neto</p>
              <p className="text-lg font-semibold">
                {formatGtq(cashflow.net)}
              </p>
            </div>
          </div>
          {loadingCashflow ? (
            <p className="text-sm text-muted-foreground">Cargando…</p>
          ) : (
            <CashflowChart entries={cashflow.entries} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
