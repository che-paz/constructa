"use client";

import type { MaterialEntry } from "@constructa/types";
import { SignedStorageLink } from "@/components/shared/signed-storage-link";
import { formatGtq, materialEntryTypeLabel } from "@constructa/utils";
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
}

export function MaterialInventoryTable({
  entries,
}: MaterialInventoryTableProps) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Sin movimientos registrados.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Material</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead className="text-right">Cantidad</TableHead>
          <TableHead className="text-right">Costo</TableHead>
          <TableHead>Factura</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
