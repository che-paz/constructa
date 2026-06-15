import type {
  MaterialAlert,
  MaterialCatalog,
  MaterialSummary,
  Stage,
} from "@constructa/types";
import { CollapsibleFormSection } from "@/components/shared/collapsible-form-section";
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
  const catalogHint =
    catalog.length > 0 ? (
      <p className="text-sm text-muted-foreground">
        {catalog.length} materiales en catálogo:{" "}
        {catalog.map((m) => m.name).join(", ")}
      </p>
    ) : undefined;

  return (
    <div className="space-y-4 md:space-y-6">
      <MaterialAlertBanner alerts={alerts} />

      <CollapsibleFormSection
        title="Catálogo de materiales"
        description="Materiales comunes de construcción en Guatemala"
        actionLabel="Gestionar catálogo"
        collapsedHint={catalogHint}
      >
        <p className="mb-3 text-sm text-muted-foreground">
          Administra el catálogo completo en{" "}
          <a href="/materials" className="text-primary underline">
            Materiales
          </a>
          .
        </p>
        <CatalogForm />
      </CollapsibleFormSection>

      <CollapsibleFormSection
        title="Presupuesto de materiales por etapa"
        description="Planifica cuánto consumirás — separado de compras y consumos reales"
        actionLabel="Definir presupuesto"
      >
        <MaterialBudgetForm
          projectId={projectId}
          catalog={catalog}
          stages={stages}
          summary={summary}
        />
      </CollapsibleFormSection>

      <CollapsibleFormSection
        title="Registrar movimiento"
        description="Compras, consumo, transferencias, pérdidas y devoluciones"
        actionLabel="Registrar movimiento"
      >
        <MaterialEntryForm
          projectId={projectId}
          catalog={catalog}
          stages={stages}
        />
      </CollapsibleFormSection>

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
          <MaterialInventoryTable entries={entries} stages={stages} />
        </CardContent>
      </Card>
    </div>
  );
}
