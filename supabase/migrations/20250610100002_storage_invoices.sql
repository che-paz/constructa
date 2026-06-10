-- Bucket de facturas de materiales (privado, acceso vía signed URLs)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'material-invoices',
  'material-invoices',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

CREATE POLICY "material_invoices_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'material-invoices'
    AND (storage.foldername(name))[1]::uuid IN (SELECT public.user_organization_ids())
  );

CREATE POLICY "material_invoices_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'material-invoices'
    AND (storage.foldername(name))[1]::uuid IN (SELECT public.user_organization_ids())
  );

CREATE POLICY "material_invoices_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'material-invoices'
    AND (storage.foldername(name))[1]::uuid IN (SELECT public.user_organization_ids())
  );
