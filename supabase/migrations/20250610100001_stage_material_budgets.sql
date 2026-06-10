-- Presupuesto esperado de materiales por etapa

CREATE TABLE stage_material_budgets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id),
  project_id        UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  stage_id          UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  material_id       UUID NOT NULL REFERENCES material_catalog(id),
  expected_quantity NUMERIC(10,2) NOT NULL,
  created_by        UUID NOT NULL REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE(stage_id, material_id)
);

CREATE INDEX idx_stage_material_budgets_project
  ON stage_material_budgets(project_id);

ALTER TABLE stage_material_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON stage_material_budgets
  FOR ALL USING (organization_id IN (SELECT public.user_organization_ids()));
