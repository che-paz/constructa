-- Índices de performance y vistas útiles

CREATE INDEX idx_projects_org ON projects(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_material_entries_project ON material_entries(project_id, created_at DESC);
CREATE INDEX idx_attendance_project_date ON worker_attendance(project_id, work_date DESC);
CREATE INDEX idx_payments_project ON payments(project_id, payment_date DESC);
CREATE INDEX idx_expenses_project ON expenses(project_id, expense_date DESC);
CREATE INDEX idx_photos_project ON photos(project_id, created_at DESC);

CREATE VIEW project_financial_summary AS
SELECT
  p.id,
  p.name,
  p.total_budget,
  COALESCE(SUM(pay.amount), 0) AS total_received,
  COALESCE(SUM(exp.amount), 0) AS total_expenses,
  p.total_budget - COALESCE(SUM(exp.amount), 0) AS remaining_budget,
  ROUND(COALESCE(SUM(exp.amount), 0) / NULLIF(p.total_budget, 0) * 100, 1) AS budget_used_pct
FROM projects p
LEFT JOIN payments pay ON pay.project_id = p.id AND pay.deleted_at IS NULL
LEFT JOIN expenses exp ON exp.project_id = p.id AND exp.deleted_at IS NULL
WHERE p.deleted_at IS NULL
GROUP BY p.id;
