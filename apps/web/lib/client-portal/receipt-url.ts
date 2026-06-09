import { createAdminClient } from "@/lib/supabase/admin";

export async function getClientReceiptSignedUrl(
  storagePath: string | null,
): Promise<string | null> {
  if (!storagePath) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from("payment-receipts")
    .createSignedUrl(storagePath, 60 * 60);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
