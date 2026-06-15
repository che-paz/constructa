"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import type { MaterialEntry, MaterialEntryType, Stage } from "@constructa/types";
import { SignedStorageLink } from "@/components/shared/signed-storage-link";
import { formatGtq, materialEntryTypeLabel } from "@constructa/utils";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type MaterialEntryWithInvoiceUrl = MaterialEntry & {
  invoice_signed_url?: string | null;
};

interface MaterialInventoryTableProps {
  entries: MaterialEntryWithInvoiceUrl[];
  stages: Stage[];
}

export function MaterialInventoryTable({
  entries,
  stages,
}: MaterialInventoryTableProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entryType, setEntryType] = useState<MaterialEntryType>("purchase");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [stageId, setStageId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [notes, setNotes] = useState("");

  function startEdit(entry: MaterialEntryWithInvoiceUrl) {
    setEditingId(entry.id);
    setEntryType(entry.entry_type);
    setQuantity(String(entry.quantity));
    setUnitPrice(
      entry.unit_price != null ? String(entry.unit_price) : "",
    );
    setStageId(entry.stage_id ?? "");
    setInvoiceNumber(entry.invoice_number ?? "");
    setNotes(entry.notes ?? "");
    setError(null);
  }

  async function handleSave(entryId: string) {
    setLoading(true);
    setError(null);

    const isPurchase = entryType === "purchase";
    const payload = {
      entry_type: entryType,
      quantity: Number(quantity),
      stage_id: stageId || null,
      unit_price: isPurchase && unitPrice ? Number(unitPrice) : null,
      invoice_number: isPurchase && invoiceNumber ? invoiceNumber : null,
      notes: notes || null,
    };

    const res = await fetch(`/api/materials/entries/${entryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data: { error?: string } = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(
        typeof data.error === "string"
          ? data.error
          : "No se pudo actualizar el movimiento",
      );
      return;
    }

    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(entryId: string) {
    if (!confirm("¿Eliminar este movimiento?")) return;

    setLoading(true);
    setError(null);

    const res = await fetch(`/api/materials/entries/${entryId}`, {
      method: "DELETE",
    });

    setLoading(false);

    if (!res.ok) {
      setError("No se pudo eliminar el movimiento");
      return;
    }

    if (editingId === entryId) setEditingId(null);
    router.refresh();
  }

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Sin movimientos registrados.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Material</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Cantidad</TableHead>
            <TableHead className="text-right">Costo</TableHead>
            <TableHead>Factura</TableHead>
            <TableHead className="w-[120px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <Fragment key={entry.id}>
              <TableRow>
                <TableCell className="text-sm">
                  {new Date(entry.created_at).toLocaleDateString("es-GT")}
                </TableCell>
                <TableCell className="text-sm">
                  {entry.material?.name ?? "—"}
                </TableCell>
                <TableCell className="text-sm">
                  {materialEntryTypeLabel(entry.entry_type)}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {entry.quantity} {entry.material?.unit ?? ""}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {entry.total_cost != null ? formatGtq(entry.total_cost) : "—"}
                </TableCell>
                <TableCell className="text-sm">
                  {entry.invoice_url ? (
                    <SignedStorageLink
                      bucket="material-invoices"
                      path={entry.invoice_url}
                    />
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={loading}
                      onClick={() => startEdit(entry)}
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={loading}
                      onClick={() => void handleDelete(entry.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              {editingId === entry.id && (
                <TableRow>
                  <TableCell colSpan={7} className="bg-muted/30">
                    <div className="grid gap-3 py-2 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label>Tipo</Label>
                        <Select
                          value={entryType}
                          onValueChange={(v) =>
                            setEntryType(v as MaterialEntryType)
                          }
                        >
                          <SelectTrigger>
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

                      <div className="space-y-1">
                        <Label>Cantidad</Label>
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                        />
                      </div>

                      {stages.length > 0 && (
                        <div className="space-y-1">
                          <Label>Etapa</Label>
                          <Select
                            value={stageId || "__none__"}
                            onValueChange={(v) =>
                              setStageId(v === "__none__" ? "" : v)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sin etapa" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">Sin etapa</SelectItem>
                              {stages.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {entryType === "purchase" && (
                        <>
                          <div className="space-y-1">
                            <Label>Precio unitario (GTQ)</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={unitPrice}
                              onChange={(e) => setUnitPrice(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>No. factura</Label>
                            <Input
                              value={invoiceNumber}
                              onChange={(e) => setInvoiceNumber(e.target.value)}
                            />
                          </div>
                        </>
                      )}

                      <div className="space-y-1 sm:col-span-2">
                        <Label>Notas</Label>
                        <Textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={2}
                        />
                      </div>

                      <div className="flex gap-2 sm:col-span-2">
                        <Button
                          type="button"
                          size="sm"
                          disabled={loading}
                          onClick={() => void handleSave(entry.id)}
                        >
                          {loading ? "Guardando…" : "Guardar"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
