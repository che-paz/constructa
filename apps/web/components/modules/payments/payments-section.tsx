import type { PaymentBalance } from "@constructa/types";
import { formatGtq } from "@constructa/utils";
import { CollapsibleFormSection } from "@/components/shared/collapsible-form-section";
import { FinanceMetricCard } from "@/components/shared/finance-metric-card";
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
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        <FinanceMetricCard
          label="Presupuesto total"
          value={
            balance.total_budget != null
              ? formatGtq(balance.total_budget)
              : "Sin definir"
          }
        />
        <FinanceMetricCard
          label="Anticipo acordado"
          value={formatGtq(balance.client_advance)}
        />
        <FinanceMetricCard
          label="Total pagos registrados"
          value={formatGtq(balance.total_paid)}
        />
        <FinanceMetricCard
          label="Saldo pendiente de la obra"
          value={formatGtq(balance.pending_balance)}
        />
      </div>

      <CollapsibleFormSection
        title="Registrar pago"
        description={
          balance.total_budget != null
            ? `Saldo = presupuesto total (${formatGtq(balance.total_budget)}) − pagos registrados`
            : "Define el presupuesto total del proyecto para calcular el saldo de la obra"
        }
        actionLabel="Registrar pago"
      >
        <PaymentForm projectId={projectId} />
      </CollapsibleFormSection>

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
