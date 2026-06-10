import type { MaterialSummary } from "@constructa/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MaterialSummaryCardProps {
  summary: MaterialSummary;
}

function formatDeviation(
  consumed: number,
  expected: number,
  deviationPct: number,
): { label: string; className: string } {
  if (consumed === 0) {
    return { label: "Sin consumo", className: "text-muted-foreground" };
  }
  if (deviationPct > 15) {
    return {
      label: `+${deviationPct.toFixed(1)}%`,
      className: "text-destructive font-medium",
    };
  }
  if (deviationPct > 0) {
    return {
      label: `+${deviationPct.toFixed(1)}%`,
      className: "text-amber-600 font-medium",
    };
  }
  return {
    label: `${deviationPct.toFixed(1)}%`,
    className: "text-muted-foreground",
  };
}

export function MaterialSummaryCard({ summary }: MaterialSummaryCardProps) {
  if (summary.items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Consumo vs presupuesto</CardTitle>
          <CardDescription>
            Define el presupuesto por etapa al registrar un movimiento
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Consumo vs presupuesto</CardTitle>
        <CardDescription>
          Compras no cuentan como consumo — registra un movimiento tipo
          &quot;Consumo&quot; cuando el material se use en obra
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead className="text-right">Presupuesto</TableHead>
              <TableHead className="text-right">Comprado</TableHead>
              <TableHead className="text-right">Consumido</TableHead>
              <TableHead className="text-right">Desvío</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary.items.map((item) => {
              const deviation = formatDeviation(
                item.consumed_quantity,
                item.expected_quantity,
                item.deviation_pct,
              );

              return (
                <TableRow key={`${item.material_id}-${item.stage_id}`}>
                  <TableCell className="text-sm">{item.material_name}</TableCell>
                  <TableCell className="text-sm">
                    {item.stage_name ?? "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {item.expected_quantity} {item.unit}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {item.purchased_quantity} {item.unit}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {item.consumed_quantity} {item.unit}
                  </TableCell>
                  <TableCell className={`text-right text-sm ${deviation.className}`}>
                    {deviation.label}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
