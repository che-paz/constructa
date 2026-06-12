-- Sprint 07: formas de pago (jornal vs contrato) y adelantos al personal

ALTER TABLE workers
  ADD COLUMN payment_type TEXT NOT NULL DEFAULT 'daily'
    CHECK (payment_type IN ('daily', 'contract'));

COMMENT ON COLUMN workers.payment_type IS
  'daily = jornal diario (cálculo automático); contract = monto manual por tarea/día';

CREATE TABLE worker_advances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  worker_id       UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  amount          NUMERIC(8,2) NOT NULL CHECK (amount > 0),
  advance_date    DATE NOT NULL,
  notes           TEXT,
  week_start      DATE NOT NULL,
  is_deducted     BOOLEAN NOT NULL DEFAULT false,
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE worker_advances IS
  'Adelantos de dinero al personal; se descuentan en la planilla semanal (week_start = lunes)';

CREATE INDEX idx_worker_advances_project_week
  ON worker_advances(project_id, week_start);

CREATE INDEX idx_worker_advances_worker_date
  ON worker_advances(worker_id, advance_date DESC);

ALTER TABLE worker_advances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON worker_advances
  FOR ALL USING (organization_id IN (SELECT public.user_organization_ids()));
