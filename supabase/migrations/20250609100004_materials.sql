-- Catálogo y movimientos de materiales

CREATE TABLE material_catalog (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name            TEXT NOT NULL,
  unit            TEXT NOT NULL,
  category        TEXT,
  standard_price  NUMERIC(10,2),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE material_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  stage_id        UUID REFERENCES stages(id),
  material_id     UUID NOT NULL REFERENCES material_catalog(id),
  entry_type      TEXT NOT NULL,
  quantity        NUMERIC(10,2) NOT NULL,
  unit_price      NUMERIC(10,2),
  total_cost      NUMERIC(12,2),
  supplier_id     UUID REFERENCES suppliers(id),
  invoice_number  TEXT,
  invoice_url     TEXT,
  notes           TEXT,
  reported_via    TEXT DEFAULT 'web',
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

ALTER TABLE material_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON material_catalog
  FOR ALL USING (organization_id IN (SELECT public.user_organization_ids()));

CREATE POLICY "org_isolation" ON material_entries
  FOR ALL USING (organization_id IN (SELECT public.user_organization_ids()));
