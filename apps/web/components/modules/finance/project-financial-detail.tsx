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
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base">Resumen financiero</CardTitle>
            <CardDescription>
              Materiales + planilla + gastos registrados vs presupuesto
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Gasto total</p>
            <p className="text-lg font-semibold">
              {formatGtq(summary.total_spent)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Cobrado</p>
            <p className="text-lg font-semibold">
              {formatGtq(summary.total_received)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Por cobrar</p>
            <p className="text-lg font-semibold">
              {formatGtq(summary.pending_receivable)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">% presupuesto usado</p>
            <p className="text-lg font-semibold">{summary.budget_used_pct}%</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">Materiales</p>
            <p className="font-medium">
              {formatGtq(summary.breakdown.materials_cost)}
            </p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">Planilla</p>
            <p className="font-medium">
              {formatGtq(summary.breakdown.payroll_cost)}
            </p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">Gastos registrados</p>
            <p className="font-medium">
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
