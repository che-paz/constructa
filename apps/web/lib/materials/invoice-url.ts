import { createClient } from "@/lib/supabase/server";

export async function getInvoiceSignedUrl(
  storagePath: string | null,
): Promise<string | null> {
  if (!storagePath) return null;

  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("material-invoices")
    .createSignedUrl(storagePath, 60 * 60);

  return data?.signedUrl ?? null;
}

export async function attachInvoiceUrls<
  T extends { invoice_url: string | null },
>(entries: T[]): Promise<(T & { invoice_signed_url: string | null })[]> {
  return Promise.all(
    entries.map(async (entry) => ({
      ...entry,
      invoice_signed_url: await getInvoiceSignedUrl(entry.invoice_url),
    })),
  );
}
