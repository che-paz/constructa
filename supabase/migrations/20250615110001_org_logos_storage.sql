-- Bucket de logos de organización (privado, acceso vía signed URLs)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'org-logos',
  'org-logos',
  false,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

CREATE POLICY "org_logos_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'org-logos'
    AND (storage.foldername(name))[1]::uuid IN (SELECT public.user_organization_ids())
  );

CREATE POLICY "org_logos_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'org-logos'
    AND (storage.foldername(name))[1]::uuid IN (SELECT public.user_organization_ids())
  );

CREATE POLICY "org_logos_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'org-logos'
    AND (storage.foldername(name))[1]::uuid IN (SELECT public.user_organization_ids())
  );

CREATE POLICY "org_logos_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'org-logos'
    AND (storage.foldername(name))[1]::uuid IN (SELECT public.user_organization_ids())
  );
