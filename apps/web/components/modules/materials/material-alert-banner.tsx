import type { MaterialAlert } from "@constructa/types";
import { Badge } from "@/components/ui/badge";

interface MaterialAlertBannerProps {
  alerts: MaterialAlert[];
}

export function MaterialAlertBanner({ alerts }: MaterialAlertBannerProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.material_id}
          className={`rounded-md border px-4 py-3 ${
            alert.severity === "high"
              ? "border-destructive/50 bg-destructive/10"
              : "border-amber-500/50 bg-amber-500/10"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={alert.severity === "high" ? "destructive" : "secondary"}>
              Desvío {alert.deviation_pct.toFixed(1)}%
            </Badge>
            <p className="text-sm font-medium">{alert.message}</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Esperado: {alert.expected_quantity} {alert.unit} · Real:{" "}
            {alert.actual_quantity} {alert.unit}
          </p>
        </div>
      ))}
    </div>
  );
}
