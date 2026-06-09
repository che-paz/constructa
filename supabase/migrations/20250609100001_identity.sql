-- Tablas de identidad y acceso: organizations, user_organizations

CREATE TABLE organizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  plan            TEXT DEFAULT 'basico',
  max_projects    INT DEFAULT 3,
  max_users       INT DEFAULT 5,
  phone           TEXT,
  email           TEXT,
  logo_url        TEXT,
  settings        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE user_organizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

-- IDs de organizaciones del usuario autenticado (para RLS)
CREATE OR REPLACE FUNCTION public.user_organization_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM user_organizations
  WHERE user_id = auth.uid() AND is_active = true;
$$;

-- RLS: organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "organizations_select" ON organizations
  FOR SELECT USING (id IN (SELECT public.user_organization_ids()));

CREATE POLICY "organizations_insert" ON organizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "organizations_update" ON organizations
  FOR UPDATE USING (id IN (SELECT public.user_organization_ids()));

-- RLS: user_organizations
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_organizations_select" ON user_organizations
  FOR SELECT USING (
    user_id = auth.uid()
    OR organization_id IN (SELECT public.user_organization_ids())
  );

CREATE POLICY "user_organizations_insert" ON user_organizations
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR organization_id IN (SELECT public.user_organization_ids())
  );

CREATE POLICY "user_organizations_update" ON user_organizations
  FOR UPDATE USING (organization_id IN (SELECT public.user_organization_ids()));
