-- Log de uso de IA para quotas y rate limiting

CREATE TABLE ai_usage_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id),
  operation       TEXT NOT NULL CHECK (operation IN ('assistant', 'report')),
  tokens_input    INT DEFAULT 0,
  tokens_output   INT DEFAULT 0,
  latency_ms      INT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ai_usage_log_org_op_created
  ON ai_usage_log(organization_id, operation, created_at DESC);

ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON ai_usage_log
  FOR ALL USING (organization_id IN (SELECT public.user_organization_ids()));
