-- Pagos y gastos

CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id      UUID NOT NULL REFERENCES projects(id),
  client_id       UUID REFERENCES clients(id),
  amount          NUMERIC(12,2) NOT NULL,
  payment_method  TEXT,
  reference_number TEXT,
  receipt_url     TEXT,
  payment_date    DATE NOT NULL,
  description     TEXT,
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

CREATE TABLE expenses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id      UUID NOT NULL REFERENCES projects(id),
  stage_id        UUID REFERENCES stages(id),
  category        TEXT NOT NULL,
  description     TEXT NOT NULL,
  amount          NUMERIC(12,2) NOT NULL,
  supplier_id     UUID REFERENCES suppliers(id),
  invoice_number  TEXT,
  invoice_url     TEXT,
  expense_date    DATE NOT NULL,
  reported_via    TEXT DEFAULT 'web',
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON payments
  FOR ALL USING (organization_id IN (SELECT public.user_organization_ids()));

CREATE POLICY "org_isolation" ON expenses
  FOR ALL USING (organization_id IN (SELECT public.user_organization_ids()));
