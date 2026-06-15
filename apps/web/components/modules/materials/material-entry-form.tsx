"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateMaterialEntrySchema } from "@constructa/schemas";
import type { MaterialCatalog, MaterialEntryType, Stage } from "@constructa/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MaterialEntryFormProps {
  projectId: string;
  catalog: MaterialCatalog[];
  stages: Stage[];
}

export function MaterialEntryForm({
  projectId,
  catalog,
  stages,
}: MaterialEntryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [materialId, setMaterialId] = useState(catalog[0]?.id ?? "");
  const [stageId, setStageId] = useState(stages[0]?.id ?? "");
  const [entryType, setEntryType] = useState<MaterialEntryType>("purchase");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

  const isPurchase = entryType === "purchase";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!materialId) {
      setError("Selecciona un material del catálogo");
      return;
    }

    let invoiceUrl: string | null = null;

    if (invoiceFile && isPurchase) {
      const formData = new FormData();
      formData.append("file", invoiceFile);
      formData.append("project_id", projectId);

      const uploadRes = await fetch("/api/materials/entries/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData: { invoice_url?: string; error?: string } =
        await uploadRes.json();

      if (!uploadRes.ok) {
        setError(uploadData.error ?? "No se pudo subir la factura");
        return;
      }

      invoiceUrl = uploadData.invoice_url ?? null;
    }

    const payload = {
      project_id: projectId,
      stage_id: stageId || null,
      material_id: materialId,
      entry_type: entryType,
      quantity: Number(quantity),
      unit_price: isPurchase && unitPrice ? Number(unitPrice) : null,
      invoice_number: isPurchase && invoiceNumber ? invoiceNumber : null,
      invoice_url: isPurchase ? invoiceUrl : null,
      notes: notes || null,
    };

    const parsed = CreateMaterialEntrySchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Datos inválidos");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/materials/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    const data: { error?: string } = await res.json();

    if (!res.ok) {
      setError(
        typeof data.error === "string"
          ? data.error
          : "No se pudo registrar el movimiento",
      );
      setLoading(false);
      return;
    }

    setQuantity("");
    setUnitPrice("");
    setInvoiceNumber("");
    setNotes("");
    setInvoiceFile(null);
    setLoading(false);
    router.refresh();
  }

  if (catalog.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Primero agrega materiales al catálogo de la organización.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="materialId">Material *</Label>
          <Select value={materialId} onValueChange={setMaterialId}>
            <SelectTrigger id="materialId">
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
          <Label htmlFor="entryType">Tipo de movimiento *</Label>
          <Select
            value={entryType}
            onValueChange={(v) => {
              const next = v as MaterialEntryType;
              setEntryType(next);
              if (next !== "purchase") {
                setUnitPrice("");
                setInvoiceNumber("");
                setInvoiceFile(null);
              }
            }}
          >
            <SelectTrigger id="entryType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="purchase">Compra</SelectItem>
              <SelectItem value="consumption">Consumo</SelectItem>
              <SelectItem value="transfer">Transferencia</SelectItem>
              <SelectItem value="loss">Pérdida</SelectItem>
              <SelectItem value="return">Devolución</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {stages.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="stageId">Etapa</Label>
            <Select value={stageId} onValueChange={setStageId}>
              <SelectTrigger id="stageId">
                <SelectValue placeholder="Sin etapa" />
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
        )}

        <div className="space-y-2">
          <Label htmlFor="quantity">Cantidad *</Label>
          <Input
            id="quantity"
            type="number"
            min="0.01"
            step="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            {entryType === "purchase"
              ? "Cuánto compraste o llegó a obra."
              : entryType === "consumption"
                ? "Cuánto se usó en la etapa."
                : "Cantidad de este movimiento."}
          </p>
        </div>

        {isPurchase && (
          <>
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Precio unitario (GTQ)</Label>
              <Input
                id="unitPrice"
                type="number"
                min="0"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">No. factura</Label>
              <Input
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="invoice">Factura (JPG, PNG, PDF — máx. 5 MB)</Label>
              <Input
                id="invoice"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => setInvoiceFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </>
        )}

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="entryNotes">Notas</Label>
          <Textarea
            id="entryNotes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Registrando…" : "Registrar movimiento"}
      </Button>
    </form>
  );
}
