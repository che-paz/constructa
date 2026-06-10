import type { FinanceAlert } from "@constructa/types";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FinanceAlertsProps {
  alerts: FinanceAlert[];
}

export function FinanceAlerts({ alerts }: FinanceAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <Card className="border-destructive/40">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <CardTitle className="text-base">Alertas de presupuesto</CardTitle>
        </div>
        <CardDescription>
          Proyectos con más del 80% del presupuesto gastado y menos del 70% de
          avance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.project_id}
            className="flex flex-col gap-1 rounded-md border border-destructive/20 bg-destructive/5 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium">{alert.project_name}</p>
              <p className="text-xs text-muted-foreground">{alert.message}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="destructive">
                {alert.budget_used_pct}% gastado
              </Badge>
              <Badge variant="outline">{alert.progress_pct}% avance</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
