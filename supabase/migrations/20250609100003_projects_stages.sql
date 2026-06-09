-- Proyectos y etapas del cronograma

CREATE TABLE projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id       UUID REFERENCES clients(id),
  name            TEXT NOT NULL,
  description     TEXT,
  address         TEXT,
  municipality    TEXT,
  department      TEXT,
  status          TEXT DEFAULT 'active',
  start_date      DATE,
  planned_end_date DATE,
  actual_end_date  DATE,
  total_budget    NUMERIC(12,2),
  client_advance  NUMERIC(12,2) DEFAULT 0,
  client_token    TEXT UNIQUE,
  client_can_see_costs BOOLEAN DEFAULT false,
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE stages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  order_index     INT NOT NULL,
  planned_start   DATE,
  planned_end     DATE,
  actual_start    DATE,
  actual_end      DATE,
  progress_pct    INT DEFAULT 0,
  responsible_id  UUID REFERENCES auth.users(id),
  status          TEXT DEFAULT 'pending',
  notes           TEXT,
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER stages_updated_at
  BEFORE UPDATE ON stages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON projects
  FOR ALL USING (organization_id IN (SELECT public.user_organization_ids()));

CREATE POLICY "org_isolation" ON stages
  FOR ALL USING (organization_id IN (SELECT public.user_organization_ids()));
