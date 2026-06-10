-- Bucket de reportes PDF (privado, acceso vía signed URLs)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-pdfs',
  'report-pdfs',
  false,
  10485760,
  ARRAY['application/pdf']
);

CREATE POLICY "report_pdfs_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'report-pdfs'
    AND (storage.foldername(name))[1]::uuid IN (SELECT public.user_organization_ids())
  );

CREATE POLICY "report_pdfs_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'report-pdfs'
    AND (storage.foldername(name))[1]::uuid IN (SELECT public.user_organization_ids())
  );

CREATE POLICY "report_pdfs_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'report-pdfs'
    AND (storage.foldername(name))[1]::uuid IN (SELECT public.user_organization_ids())
  );
