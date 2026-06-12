import type { WorkerPaymentType } from "@constructa/types";
import type { CreateWorkerInput, UpdateWorkerInput } from "@constructa/schemas";

export function normalizeWorkerPayload(
  data: CreateWorkerInput | UpdateWorkerInput,
): CreateWorkerInput | UpdateWorkerInput {
  if (data.payment_type === "contract") {
    return {
      ...data,
      payment_type: "contract" satisfies WorkerPaymentType,
      daily_rate: null,
    };
  }

  if (data.payment_type === "daily") {
    return {
      ...data,
      payment_type: "daily" satisfies WorkerPaymentType,
    };
  }

  return data;
}
