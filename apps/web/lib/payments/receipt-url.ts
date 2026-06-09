import { createClient } from "@/lib/supabase/server";

export async function getReceiptSignedUrl(
  storagePath: string | null,
): Promise<string | null> {
  if (!storagePath) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("payment-receipts")
    .createSignedUrl(storagePath, 60 * 60);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export async function attachReceiptUrls<
  T extends { receipt_url: string | null },
>(payments: T[]): Promise<(T & { receipt_signed_url: string | null })[]> {
  return Promise.all(
    payments.map(async (payment) => ({
      ...payment,
      receipt_signed_url: await getReceiptSignedUrl(payment.receipt_url),
    })),
  );
}
