-- Personal y asistencia

CREATE TABLE workers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name            TEXT NOT NULL,
  dpi             TEXT,
  phone           TEXT,
  specialty       TEXT,
  daily_rate      NUMERIC(8,2),
  is_active       BOOLEAN DEFAULT true,
  notes           TEXT,
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

CREATE TRIGGER workers_updated_at
  BEFORE UPDATE ON workers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE worker_attendance (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id      UUID NOT NULL REFERENCES projects(id),
  worker_id       UUID NOT NULL REFERENCES workers(id),
  work_date       DATE NOT NULL,
  check_in        TIMESTAMPTZ,
  check_out       TIMESTAMPTZ,
  hours_worked    NUMERIC(4,2),
  attendance_type TEXT DEFAULT 'full',
  check_in_method TEXT DEFAULT 'manual',
  amount_paid     NUMERIC(8,2),
  is_paid         BOOLEAN DEFAULT false,
  notes           TEXT,
  reported_via    TEXT DEFAULT 'web',
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, worker_id, work_date)
);

ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON workers
  FOR ALL USING (organization_id IN (SELECT public.user_organization_ids()));

CREATE POLICY "org_isolation" ON worker_attendance
  FOR ALL USING (organization_id IN (SELECT public.user_organization_ids()));
