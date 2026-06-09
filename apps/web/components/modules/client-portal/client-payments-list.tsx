import Link from "next/link";
import type { Payment } from "@constructa/types";
import { formatGtq, paymentMethodLabel } from "@constructa/utils";
import { Button } from "@/components/ui/button";
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

export interface ClientPaymentRow extends Payment {
  receipt_signed_url?: string | null;
}

interface ClientPaymentsListProps {
  projectName: string;
  token: string;
  balance: {
    client_advance: number;
    total_paid: number;
    pending_balance: number;
  };
  payments: ClientPaymentRow[];
}

export function ClientPaymentsList({
  projectName,
  token,
  balance,
  payments,
}: ClientPaymentsListProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Pagos — {projectName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Historial de pagos registrados por el constructor
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/client/${token}`}>Volver al portal</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Anticipo acordado</CardDescription>
            <CardTitle className="text-2xl">
              {formatGtq(balance.client_advance)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total pagado</CardDescription>
            <CardTitle className="text-2xl">
              {formatGtq(balance.total_paid)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Saldo pendiente de la obra</CardDescription>
            <CardTitle className="text-2xl">
              {formatGtq(balance.pending_balance)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial</CardTitle>
          <CardDescription>
            {payments.length}{" "}
            {payments.length === 1 ? "pago registrado" : "pagos registrados"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay pagos registrados.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Referencia</TableHead>
                  <TableHead>Comprobante</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.payment_date).toLocaleDateString(
                        "es-GT",
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatGtq(Number(payment.amount))}
                    </TableCell>
                    <TableCell>
                      {paymentMethodLabel(payment.payment_method)}
                    </TableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
