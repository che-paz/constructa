-- Fotos, reportes y conversaciones IA

CREATE TABLE photos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id      UUID NOT NULL REFERENCES projects(id),
  stage_id        UUID REFERENCES stages(id),
  url             TEXT NOT NULL,
  thumbnail_url   TEXT,
  ai_description  TEXT,
  ai_stage_detected TEXT,
  ai_progress_pct INT,
  taken_at        TIMESTAMPTZ,
  taken_by        UUID REFERENCES auth.users(id),
  is_visible_to_client BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id      UUID NOT NULL REFERENCES projects(id),
  report_type     TEXT DEFAULT 'weekly',
  period_start    DATE,
  period_end      DATE,
  ai_narrative    TEXT,
  pdf_url         TEXT,
  data_snapshot   JSONB,
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ai_conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  project_id      UUID REFERENCES projects(id),
  messages        JSONB NOT NULL DEFAULT '[]',
  tokens_used     INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER ai_conversations_updated_at
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON photos
  FOR ALL USING (organization_id IN (SELECT public.user_organization_ids()));

CREATE POLICY "org_isolation" ON reports
  FOR ALL USING (organization_id IN (SELECT public.user_organization_ids()));

CREATE POLICY "org_isolation" ON ai_conversations
  FOR ALL USING (organization_id IN (SELECT public.user_organization_ids()));
