-- Clientes y proveedores

CREATE TABLE clients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id),
  name            TEXT NOT NULL,
  email           TEXT,
  phone           TEXT,
  dpi             TEXT,
  address         TEXT,
  notes           TEXT,
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE suppliers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  type            TEXT,
  phone           TEXT,
  email           TEXT,
  address         TEXT,
  nit             TEXT,
  notes           TEXT,
  is_active       BOOLEAN DEFAULT true,
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON clients
  FOR ALL USING (organization_id IN (SELECT public.user_organization_ids()));

CREATE POLICY "org_isolation" ON suppliers
  FOR ALL USING (organization_id IN (SELECT public.user_organization_ids()));
