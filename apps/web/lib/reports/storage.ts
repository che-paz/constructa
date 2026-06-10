import { createClient } from "@/lib/supabase/server";

const BUCKET = "report-pdfs";

export async function uploadReportPdf(
  organizationId: string,
  projectId: string,
  reportId: string,
  pdfBuffer: Buffer,
): Promise<string> {
  const supabase = await createClient();
  const storagePath = `${organizationId}/${projectId}/${reportId}.pdf`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) throw error;
  return storagePath;
}

export async function getReportPdfSignedUrl(
  storagePath: string | null,
): Promise<string | null> {
  if (!storagePath) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 60 * 60);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export async function downloadReportPdf(
  storagePath: string,
): Promise<Buffer | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(storagePath);

  if (error || !data) return null;
  return Buffer.from(await data.arrayBuffer());
}
