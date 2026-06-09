-- Bucket de comprobantes de pago (privado, acceso vía signed URLs)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-receipts',
  'payment-receipts',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

CREATE POLICY "payment_receipts_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'payment-receipts'
    AND (storage.foldername(name))[1]::uuid IN (SELECT public.user_organization_ids())
  );

CREATE POLICY "payment_receipts_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'payment-receipts'
    AND (storage.foldername(name))[1]::uuid IN (SELECT public.user_organization_ids())
  );

CREATE POLICY "payment_receipts_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'payment-receipts'
    AND (storage.foldername(name))[1]::uuid IN (SELECT public.user_organization_ids())
  );
