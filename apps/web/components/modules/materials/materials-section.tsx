import type {
  MaterialAlert,
  MaterialCatalog,
  MaterialSummary,
  Stage,
} from "@constructa/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CatalogForm } from "./catalog-form";
import { MaterialAlertBanner } from "./material-alert-banner";
import { MaterialBudgetForm } from "./material-budget-form";
import { MaterialEntryForm } from "./material-entry-form";
import {
  MaterialInventoryTable,
  type MaterialEntryWithInvoiceUrl,
} from "./material-inventory-table";
import { MaterialSummaryCard } from "./material-summary-card";

interface MaterialsSectionProps {
  projectId: string;
  catalog: MaterialCatalog[];
  stages: Stage[];
  entries: MaterialEntryWithInvoiceUrl[];
  summary: MaterialSummary;
  alerts: MaterialAlert[];
}

export function MaterialsSection({
  projectId,
  catalog,
  stages,
  entries,
  summary,
  alerts,
}: MaterialsSectionProps) {
  return (
    <div className="space-y-6">
      <MaterialAlertBanner alerts={alerts} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Catálogo de materiales</CardTitle>
          <CardDescription>
            Materiales comunes de construcción en Guatemala
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CatalogForm />
          {catalog.length > 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              {catalog.length} materiales en catálogo:{" "}
              {catalog.map((m) => m.name).join(", ")}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Presupuesto de materiales por etapa
          </CardTitle>
          <CardDescription>
            Planifica cuánto consumirás — separado de compras y consumos reales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MaterialBudgetForm
            projectId={projectId}
            catalog={catalog}
            stages={stages}
            summary={summary}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registrar movimiento</CardTitle>
          <CardDescription>
            Compras, consumo, transferencias, pérdidas y devoluciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MaterialEntryForm
            projectId={projectId}
            catalog={catalog}
            stages={stages}
          />
        </CardContent>
      </Card>

      <MaterialSummaryCard summary={summary} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial de movimientos</CardTitle>
          <CardDescription>
            {entries.length}{" "}
            {entries.length === 1 ? "movimiento" : "movimientos"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MaterialInventoryTable entries={entries} />
        </CardContent>
      </Card>
    </div>
  );
}
