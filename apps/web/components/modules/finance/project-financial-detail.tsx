import Link from "next/link";
import type { ProjectFinancialSummary } from "@constructa/types";
import { formatGtq } from "@constructa/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProjectFinancialDetailProps {
  summary: ProjectFinancialSummary;
}

export function ProjectFinancialDetail({
  summary,
}: ProjectFinancialDetailProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="text-base">Resumen financiero</CardTitle>
            <CardDescription>
              Materiales + planilla + gastos registrados vs presupuesto
            </CardDescription>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {summary.alert && (
              <Badge variant="destructive">Alerta presupuesto</Badge>
            )}
            <Button asChild variant="outline" size="sm">
              <Link href="/finance">Ver en Finanzas</Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4 lg:gap-4">
          <div className="min-w-0 overflow-hidden rounded-md border p-2.5 sm:p-3">
            <p className="text-xs text-muted-foreground">Gasto total</p>
            <p className="mt-0.5 text-base font-semibold tabular-nums leading-tight sm:text-lg">
              {formatGtq(summary.total_spent)}
            </p>
          </div>
          <div className="min-w-0 overflow-hidden rounded-md border p-2.5 sm:p-3">
            <p className="text-xs text-muted-foreground">Cobrado</p>
            <p className="mt-0.5 text-base font-semibold tabular-nums leading-tight sm:text-lg">
              {formatGtq(summary.total_received)}
            </p>
          </div>
          <div className="min-w-0 overflow-hidden rounded-md border p-2.5 sm:p-3">
            <p className="text-xs text-muted-foreground">Por cobrar</p>
            <p className="mt-0.5 text-base font-semibold tabular-nums leading-tight sm:text-lg">
              {formatGtq(summary.pending_receivable)}
            </p>
          </div>
          <div className="min-w-0 overflow-hidden rounded-md border p-2.5 sm:p-3">
            <p className="text-xs text-muted-foreground">% presupuesto usado</p>
            <p className="mt-0.5 text-base font-semibold tabular-nums leading-tight sm:text-lg">
              {summary.budget_used_pct}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
          <div className="min-w-0 overflow-hidden rounded-md border p-2.5 sm:p-3">
            <p className="text-xs text-muted-foreground">Materiales</p>
            <p className="mt-0.5 text-base font-medium tabular-nums leading-tight sm:text-lg">
              {formatGtq(summary.breakdown.materials_cost)}
            </p>
          </div>
          <div className="min-w-0 overflow-hidden rounded-md border p-2.5 sm:p-3">
            <p className="text-xs text-muted-foreground">Planilla</p>
            <p className="mt-0.5 text-base font-medium tabular-nums leading-tight sm:text-lg">
              {formatGtq(summary.breakdown.payroll_cost)}
            </p>
          </div>
          <div className="min-w-0 overflow-hidden rounded-md border p-2.5 sm:p-3">
            <p className="text-xs text-muted-foreground">Gastos registrados</p>
            <p className="mt-0.5 text-base font-medium tabular-nums leading-tight sm:text-lg">
              {formatGtq(summary.breakdown.registered_expenses)}
            </p>
          </div>
        </div>

        {summary.alert && (
          <p className="text-sm text-destructive">{summary.alert.message}</p>
        )}
      </CardContent>
    </Card>
  );
}
