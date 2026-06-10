"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateMaterialBudgetSchema } from "@constructa/schemas";
import type { MaterialCatalog, MaterialSummary, Stage } from "@constructa/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MaterialBudgetFormProps {
  projectId: string;
  catalog: MaterialCatalog[];
  stages: Stage[];
  summary: MaterialSummary;
}

export function MaterialBudgetForm({
  projectId,
  catalog,
  stages,
  summary,
}: MaterialBudgetFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [materialId, setMaterialId] = useState(catalog[0]?.id ?? "");
  const [stageId, setStageId] = useState(stages[0]?.id ?? "");
  const [expectedQty, setExpectedQty] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!materialId) {
      setError("Selecciona un material");
      return;
    }
    if (!stageId) {
      setError("Selecciona una etapa");
      return;
    }

    const payload = {
      project_id: projectId,
      stage_id: stageId,
      material_id: materialId,
      expected_quantity: Number(expectedQty),
    };

    const parsed = CreateMaterialBudgetSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Datos inválidos");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/materials/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    const data: { error?: string } = await res.json();

    if (!res.ok) {
      setError(
        typeof data.error === "string"
          ? data.error
          : "No se pudo guardar el presupuesto",
      );
      setLoading(false);
      return;
    }

    setExpectedQty("");
    setLoading(false);
    router.refresh();
  }

  if (catalog.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Agrega materiales al catálogo antes de definir presupuestos.
      </p>
    );
  }

  if (stages.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Crea etapas en el cronograma antes de asignar presupuestos de
        materiales.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {summary.items.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Presupuestos definidos</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead className="text-right">Presupuesto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.items.map((item) => (
                <TableRow key={`${item.material_id}-${item.stage_id}`}>
                  <TableCell className="text-sm">{item.material_name}</TableCell>
                  <TableCell className="text-sm">
                    {item.stage_name ?? "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {item.expected_quantity} {item.unit}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <p className="text-sm text-muted-foreground">
          Define cuánto material planeas consumir en cada etapa. Esto es el
          plan — no registra compras ni consumos reales.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="budgetMaterialId">Material *</Label>
            <Select value={materialId} onValueChange={setMaterialId}>
              <SelectTrigger id="budgetMaterialId">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {catalog.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} ({m.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budgetStageId">Etapa *</Label>
            <Select value={stageId} onValueChange={setStageId}>
              <SelectTrigger id="budgetStageId">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="budgetExpectedQty">Cantidad presupuestada *</Label>
            <Input
              id="budgetExpectedQty"
              type="number"
              min="0.01"
              step="0.01"
              value={expectedQty}
              onChange={(e) => setExpectedQty(e.target.value)}
              placeholder="Ej. 50 bolsas para esta etapa"
              required
            />
          </div>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Guardando…" : "Guardar presupuesto"}
        </Button>
      </form>
    </div>
  );
}
