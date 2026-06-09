import type { PaymentBalance } from "@constructa/types";
import { calculatePaymentBalance } from "@constructa/utils";

interface PaymentRow {
  amount: number;
}

export function computePaymentBalance(
  totalBudget: number | null | undefined,
  clientAdvance: number | null | undefined,
  payments: PaymentRow[],
): PaymentBalance {
  return calculatePaymentBalance(totalBudget, clientAdvance, payments);
}
