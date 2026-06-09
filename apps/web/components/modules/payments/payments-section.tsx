import type { PaymentBalance } from "@constructa/types";
import { formatGtq } from "@constructa/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaymentForm } from "./payment-form";
import { PaymentList, type PaymentWithReceiptUrl } from "./payment-list";

interface PaymentsSectionProps {
  projectId: string;
  balance: PaymentBalance;
  payments: PaymentWithReceiptUrl[];
}

export function PaymentsSection({
  projectId,
  balance,
  payments,
}: PaymentsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Presupuesto total</CardDescription>
            <CardTitle className="text-2xl">
              {balance.total_budget != null
                ? formatGtq(balance.total_budget)
                : "Sin definir"}
            </CardTitle>
          </CardHeader>
        </Card>
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
            <CardDescription>Total pagos registrados</CardDescription>
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
          <CardTitle className="text-base">Registrar pago</CardTitle>
          <CardDescription>
            {balance.total_budget != null
              ? `Saldo = presupuesto total (${formatGtq(balance.total_budget)}) − pagos registrados`
              : "Define el presupuesto total del proyecto para calcular el saldo de la obra"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentForm projectId={projectId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial de pagos</CardTitle>
          <CardDescription>
            {balance.payments_count}{" "}
            {balance.payments_count === 1 ? "pago" : "pagos"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentList payments={payments} />
        </CardContent>
      </Card>
    </div>
  );
}
