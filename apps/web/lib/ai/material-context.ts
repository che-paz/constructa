import { getWeekEnd, getWeekStart } from "@constructa/utils";

const CONSUMPTION_TYPES = new Set(["consumption", "loss"]);

export interface MaterialEntryInsightRow {
  created_at: string;
  entry_type: string;
  quantity: number | string;
  total_cost: number | string | null;
  material?: { name: string; unit: string } | null;
  stage?: { name: string } | null;
}

export interface MaterialMovementInsight {
  fecha: string;
  material: string;
  unidad: string;
  tipo: string;
  cantidad: number;
  costo: number;
  etapa: string | null;
}

export interface MaterialWeekItem {
  material: string;
  unidad: string;
  cantidad_total: number;
  costo_total: number;
  etapas: string[];
}

export interface MaterialWeekBlock {
  inicio: string;
  fin: string;
  materiales: MaterialWeekItem[];
}

export interface MaterialWeekContext {
  semana_actual: MaterialWeekBlock;
  semana_anterior: MaterialWeekBlock;
  movimientos_recientes: MaterialMovementInsight[];
}

function entryDate(entry: MaterialEntryInsightRow): string {
  return entry.created_at.slice(0, 10);
}

function inDateRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

function materialName(entry: MaterialEntryInsightRow): string {
  return entry.material?.name ?? "Material";
}

function materialUnit(entry: MaterialEntryInsightRow): string {
  return entry.material?.unit ?? "";
}

function stageName(entry: MaterialEntryInsightRow): string | null {
  return entry.stage?.name ?? null;
}

export function buildMaterialMovementInsights(
  entries: MaterialEntryInsightRow[],
  limit = 40,
): MaterialMovementInsight[] {
  return entries
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit)
    .map((entry) => ({
      fecha: entryDate(entry),
      material: materialName(entry),
      unidad: materialUnit(entry),
      tipo: entry.entry_type,
      cantidad: Number(entry.quantity),
      costo: Number(entry.total_cost ?? 0),
      etapa: stageName(entry),
    }));
}

export function buildMaterialWeekAggregates(
  entries: MaterialEntryInsightRow[],
  weekStart: string,
  weekEnd: string,
  types: Set<string> = CONSUMPTION_TYPES,
): MaterialWeekItem[] {
  const byMaterial = new Map<
    string,
    { unidad: string; cantidad: number; costo: number; etapas: Set<string> }
  >();

  for (const entry of entries) {
    if (!types.has(entry.entry_type)) continue;

    const date = entryDate(entry);
    if (!inDateRange(date, weekStart, weekEnd)) continue;

    const name = materialName(entry);
    const current = byMaterial.get(name) ?? {
      unidad: materialUnit(entry),
      cantidad: 0,
      costo: 0,
      etapas: new Set<string>(),
    };

    current.cantidad += Number(entry.quantity);
    current.costo += Number(entry.total_cost ?? 0);

    const stage = stageName(entry);
    if (stage) current.etapas.add(stage);

    byMaterial.set(name, current);
  }

  return Array.from(byMaterial.entries())
    .map(([material, data]) => ({
      material,
      unidad: data.unidad,
      cantidad_total: Math.round(data.cantidad * 100) / 100,
      costo_total: Math.round(data.costo * 100) / 100,
      etapas: Array.from(data.etapas),
    }))
    .sort((a, b) => a.material.localeCompare(b.material, "es"));
}

function previousWeekStart(weekStart: string): string {
  const date = new Date(`${weekStart}T12:00:00`);
  date.setDate(date.getDate() - 7);
  return getWeekStart(date.toISOString().slice(0, 10));
}

export function buildMaterialWeekContext(
  entries: MaterialEntryInsightRow[],
  referenceDate?: string,
): MaterialWeekContext {
  const weekStart = getWeekStart(referenceDate);
  const weekEnd = getWeekEnd(weekStart);
  const prevStart = previousWeekStart(weekStart);
  const prevEnd = getWeekEnd(prevStart);

  return {
    semana_actual: {
      inicio: weekStart,
      fin: weekEnd,
      materiales: buildMaterialWeekAggregates(entries, weekStart, weekEnd),
    },
    semana_anterior: {
      inicio: prevStart,
      fin: prevEnd,
      materiales: buildMaterialWeekAggregates(entries, prevStart, prevEnd),
    },
    movimientos_recientes: buildMaterialMovementInsights(entries),
  };
}
