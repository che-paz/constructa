-- Sprint 07b: saldo arrastrado cuando adelantos superan el bruto semanal

CREATE TABLE worker_payroll_balances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  worker_id       UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  balance_forward NUMERIC(8,2) NOT NULL DEFAULT 0 CHECK (balance_forward >= 0),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, worker_id)
);

COMMENT ON TABLE worker_payroll_balances IS
  'Saldo a descontar la próxima semana cuando adelantos superan el bruto (por proyecto y trabajador)';

CREATE INDEX idx_worker_payroll_balances_project
  ON worker_payroll_balances(project_id);

ALTER TABLE worker_payroll_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON worker_payroll_balances
  FOR ALL USING (organization_id IN (SELECT public.user_organization_ids()));
