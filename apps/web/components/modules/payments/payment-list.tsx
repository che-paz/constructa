"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Payment } from "@constructa/types";
import { formatGtq, paymentMethodLabel } from "@constructa/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface PaymentWithReceiptUrl extends Payment {
  receipt_signed_url?: string | null;
}

interface PaymentListProps {
  payments: PaymentWithReceiptUrl[];
}

export function PaymentList({ payments }: PaymentListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(paymentId: string) {
    if (!confirm("¿Eliminar este pago?")) return;

    setDeletingId(paymentId);
    const res = await fetch(`/api/payments/${paymentId}`, { method: "DELETE" });
    setDeletingId(null);

    if (res.ok) {
      router.refresh();
    }
  }

  if (payments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay pagos registrados aún.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Monto</TableHead>
          <TableHead>Método</TableHead>
          <TableHead>Referencia</TableHead>
          <TableHead>Comprobante</TableHead>
          <TableHead className="w-[80px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>
              {new Date(payment.payment_date).toLocaleDateString("es-GT")}
            </TableCell>
            <TableCell className="font-medium">
              {formatGtq(Number(payment.amount))}
            </TableCell>
            <TableCell>{paymentMethodLabel(payment.payment_method)}</TableCell>
            <TableCell className="text-muted-foreground">
              {payment.reference_number ?? "—"}
            </TableCell>
            <TableCell>
              {payment.receipt_signed_url ? (
                <a
                  href={payment.receipt_signed_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Ver
                </a>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                disabled={deletingId === payment.id}
                onClick={() => handleDelete(payment.id)}
              >
                {deletingId === payment.id ? "…" : "Eliminar"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
