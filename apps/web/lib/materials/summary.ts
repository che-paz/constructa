import type { MaterialAlert, MaterialSummary, MaterialSummaryItem } from "@constructa/types";
import { calculateMaterialDeviation } from "@constructa/utils";

const DEVIATION_ALERT_THRESHOLD = 15;

interface BudgetRow {
  id?: string;
  stage_id: string;
  material_id: string;
  expected_quantity: number;
  stage?: { name: string } | null;
  material?: { name: string; unit: string } | null;
}

interface EntryRow {
  stage_id: string | null;
  material_id: string;
  entry_type: string;
  quantity: number;
  total_cost: number | null;
  material?: { name: string; unit: string } | null;
}

function sumByType(
  entries: EntryRow[],
  materialId: string,
  stageId: string | null,
  types: string[],
): number {
  return entries
    .filter((e) => {
      if (e.material_id !== materialId) return false;
      if (e.stage_id !== stageId) return false;
      return types.includes(e.entry_type);
    })
    .reduce((sum, e) => sum + Number(e.quantity), 0);
}

export function buildMaterialSummary(
  projectId: string,
  budgets: BudgetRow[],
  entries: EntryRow[],
): MaterialSummary {
  const items: MaterialSummaryItem[] = budgets.map((b) => {
    const consumed = sumByType(entries, b.material_id, b.stage_id, [
      "consumption",
      "loss",
    ]);
    const purchased = sumByType(entries, b.material_id, b.stage_id, [
      "purchase",
    ]);
    const expected = Number(b.expected_quantity);
    return {
      budget_id: b.id,
      material_id: b.material_id,
      material_name: b.material?.name ?? "Material",
      unit: b.material?.unit ?? "",
      expected_quantity: expected,
      consumed_quantity: consumed,
      purchased_quantity: purchased,
      deviation_pct: calculateMaterialDeviation(expected, consumed),
      stage_id: b.stage_id,
      stage_name: b.stage?.name ?? null,
    };
  });

  const total_expected_cost = entries
    .filter((e) => e.entry_type === "purchase")
    .reduce((sum, e) => sum + Number(e.total_cost ?? 0), 0);

  const consumptionCost = entries
    .filter((e) => e.entry_type === "consumption" || e.entry_type === "loss")
    .reduce((sum, e) => sum + Number(e.total_cost ?? 0), 0);

  return {
    project_id: projectId,
    items,
    total_expected_cost,
    total_actual_cost: consumptionCost || total_expected_cost,
  };
}

export function buildMaterialAlerts(
  summary: MaterialSummary,
): MaterialAlert[] {
  return summary.items
    .filter((item) => item.deviation_pct > DEVIATION_ALERT_THRESHOLD)
    .map((item) => ({
      material_id: item.material_id,
      material_name: item.material_name,
      unit: item.unit,
      expected_quantity: item.expected_quantity,
      actual_quantity: item.consumed_quantity,
      deviation_pct: item.deviation_pct,
      severity: item.deviation_pct > 30 ? "high" : "medium",
      message: `Consumo de ${item.material_name} excede lo esperado en ${item.deviation_pct.toFixed(1)}%`,
    }));
}
