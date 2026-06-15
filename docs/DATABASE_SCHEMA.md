# DATABASE_SCHEMA.md
> Esquema completo de la base de datos PostgreSQL (Supabase).  
> Actualizar cada vez que se agregue o modifique una tabla.

---

## Modelo conceptual

```
organizations (tenants)
  └── users (members con roles)
  └── projects
        ├── stages (etapas de cronograma)
        ├── material_entries (inventario/consumo)
        ├── worker_attendance (asistencia)
        ├── payments (pagos cliente→constructor)
        ├── expenses (gastos del proyecto)
        ├── photos (evidencia fotográfica)
        └── incidents (incidentes reportados)
  └── workers (empleados de la empresa)
  └── worker_advances (adelantos al personal)
  └── clients (clientes de proyectos)
  └── suppliers (proveedores)
  └── ai_conversations (historial IA)
  └── whatsapp_messages (log de mensajes)
```

---

## Tablas de identidad y acceso

### `organizations`
```sql
CREATE TABLE organizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,       -- para URL del portal cliente
  plan            TEXT DEFAULT 'basico',      -- 'basico' | 'profesional' | 'empresa'
  max_projects    INT DEFAULT 3,
  max_users       INT DEFAULT 5,
  phone           TEXT,
  email           TEXT,
  logo_url        TEXT,
  settings        JSONB DEFAULT '{}',         -- config general de la empresa
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

### `user_organizations` (tabla de membresía)
```sql
CREATE TABLE user_organizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL,  -- 'constructor'|'supervisor'|'oficina'|'contador'
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, organization_id)
);
```

### `clients`
```sql
CREATE TABLE clients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id),   -- si tiene acceso al portal
  name            TEXT NOT NULL,
  email           TEXT,
  phone           TEXT,
  dpi             TEXT,                              -- documento de identidad GT
  address         TEXT,
  notes           TEXT,
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);
```

---

## Tablas de proyectos

### `projects`
```sql
CREATE TABLE projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id       UUID REFERENCES clients(id),
  name            TEXT NOT NULL,
  description     TEXT,
  address         TEXT,
  municipality    TEXT,                              -- municipio de Guatemala
  department      TEXT,                              -- departamento de Guatemala
  status          TEXT DEFAULT 'active',             -- 'active'|'paused'|'completed'|'cancelled'
  
  -- Fechas
  start_date      DATE,
  planned_end_date DATE,
  actual_end_date  DATE,
  
  -- Presupuesto (en quetzales)
  total_budget    NUMERIC(12,2),
  client_advance  NUMERIC(12,2) DEFAULT 0,           -- anticipo recibido
  
  -- Acceso cliente
  client_token    TEXT UNIQUE,                        -- token para portal público
  client_can_see_costs BOOLEAN DEFAULT false,
  
  -- Metadata
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);
```

### `stages` (etapas del cronograma)
```sql
CREATE TABLE stages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,                     -- 'Cimentación', 'Muros', etc.
  description     TEXT,
  order_index     INT NOT NULL,                      -- para ordenar etapas
  
  -- Fechas
  planned_start   DATE,
  planned_end     DATE,
  actual_start    DATE,
  actual_end      DATE,
  
  -- Progreso (0-100)
  progress_pct    INT DEFAULT 0,
  
  -- Asignación
  responsible_id  UUID REFERENCES auth.users(id),
  
  status          TEXT DEFAULT 'pending',            -- 'pending'|'in_progress'|'completed'|'delayed'
  notes           TEXT,
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

---

## Tablas de materiales

### `material_catalog` (catálogo de materiales)
```sql
CREATE TABLE material_catalog (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name            TEXT NOT NULL,                     -- 'Cemento', 'Hierro 3/8"', etc.
  unit            TEXT NOT NULL,                     -- 'bolsas','quintales','metros','unidades'
  category        TEXT,                              -- 'cemento','hierro','arena','block','tuberia'
  standard_price  NUMERIC(10,2),                     -- precio de referencia
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### `stage_material_budgets` (presupuesto esperado por etapa/material)
```sql
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
```

### `material_entries` (movimientos de inventario)
```sql
CREATE TABLE material_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  stage_id        UUID REFERENCES stages(id),
  material_id     UUID NOT NULL REFERENCES material_catalog(id),
  
  entry_type      TEXT NOT NULL,  -- 'purchase'|'consumption'|'transfer'|'loss'|'return'
  quantity        NUMERIC(10,2) NOT NULL,
  unit_price      NUMERIC(10,2),
  total_cost      NUMERIC(12,2),
  
  -- Para compras
  supplier_id     UUID REFERENCES suppliers(id),
  invoice_number  TEXT,
  invoice_url     TEXT,                              -- Supabase Storage URL
  
  -- Contexto
  notes           TEXT,
  reported_via    TEXT DEFAULT 'web',               -- 'web'|'mobile'|'whatsapp'|'voice'
  
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);
```

---

## Tablas de personal

### `workers`
```sql
CREATE TABLE workers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name            TEXT NOT NULL,
  dpi             TEXT,
  phone           TEXT,
  specialty       TEXT,                              -- enum común o texto custom
  payment_type    TEXT NOT NULL DEFAULT 'daily',     -- 'daily' | 'contract'
  daily_rate      NUMERIC(8,2),                      -- jornal diario GTQ (solo si payment_type = daily)
  is_active       BOOLEAN DEFAULT true,
  notes           TEXT,
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);
```

### `worker_advances`
```sql
CREATE TABLE worker_advances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  worker_id       UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  amount          NUMERIC(8,2) NOT NULL CHECK (amount > 0),
  advance_date    DATE NOT NULL,
  notes           TEXT,
  week_start      DATE NOT NULL,                     -- lunes de la semana a descontar
  is_deducted     BOOLEAN NOT NULL DEFAULT false,
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### `worker_payroll_balances` (Sprint 07b)
```sql
CREATE TABLE worker_payroll_balances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  worker_id       UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  balance_forward NUMERIC(8,2) NOT NULL DEFAULT 0 CHECK (balance_forward >= 0),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, worker_id)
);
```

### `worker_attendance`
```sql
CREATE TABLE worker_attendance (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id      UUID NOT NULL REFERENCES projects(id),
  worker_id       UUID NOT NULL REFERENCES workers(id),
  work_date       DATE NOT NULL,
  
  -- Control de jornada
  check_in        TIMESTAMPTZ,
  check_out       TIMESTAMPTZ,
  hours_worked    NUMERIC(4,2),
  
  attendance_type TEXT DEFAULT 'full',              -- 'full'|'half'|'absent'|'overtime'
  check_in_method TEXT DEFAULT 'manual',            -- 'manual'|'qr'|'gps'|'face'
  
  -- Pago
  amount_paid     NUMERIC(8,2),
  is_paid         BOOLEAN DEFAULT false,
  
  notes           TEXT,
  reported_via    TEXT DEFAULT 'web',
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(project_id, worker_id, work_date)
);
```

---

## Tablas financieras

### `payments` (pagos cliente → empresa)
```sql
CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id      UUID NOT NULL REFERENCES projects(id),
  client_id       UUID REFERENCES clients(id),
  
  amount          NUMERIC(12,2) NOT NULL,
  payment_method  TEXT,                             -- 'efectivo'|'transferencia'|'cheque'
  reference_number TEXT,
  receipt_url     TEXT,                             -- comprobante en Storage
  
  payment_date    DATE NOT NULL,
  description     TEXT,
  
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);
```

### `expenses` (gastos del proyecto)
```sql
CREATE TABLE expenses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id      UUID NOT NULL REFERENCES projects(id),
  stage_id        UUID REFERENCES stages(id),
  
  category        TEXT NOT NULL,                    -- 'materiales'|'mano_obra'|'transporte'|'otros'
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
```

---

## Tablas de proveedores

### `suppliers`
```sql
CREATE TABLE suppliers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name            TEXT NOT NULL,
  type            TEXT,                             -- 'ferreteria'|'transporte'|'contratista'|'otro'
  phone           TEXT,
  email           TEXT,
  address         TEXT,
  nit             TEXT,                             -- NIT de Guatemala
  notes           TEXT,
  is_active       BOOLEAN DEFAULT true,
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);
```

---

## Tablas de contenido

### `photos`
```sql
CREATE TABLE photos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id      UUID NOT NULL REFERENCES projects(id),
  stage_id        UUID REFERENCES stages(id),
  
  url             TEXT NOT NULL,                    -- Supabase Storage URL
  thumbnail_url   TEXT,
  
  -- IA metadata
  ai_description  TEXT,                             -- descripción generada por Claude
  ai_stage_detected TEXT,                           -- etapa detectada por visión
  ai_progress_pct INT,                              -- avance estimado por IA
  
  taken_at        TIMESTAMPTZ,
  taken_by        UUID REFERENCES auth.users(id),
  is_visible_to_client BOOLEAN DEFAULT true,
  
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### `reports`
```sql
CREATE TABLE reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id      UUID NOT NULL REFERENCES projects(id),
  
  report_type     TEXT DEFAULT 'weekly',            -- 'weekly'|'monthly'|'milestone'
  period_start    DATE,
  period_end      DATE,
  
  -- Contenido
  ai_narrative    TEXT,                             -- texto generado por Claude
  pdf_url         TEXT,                             -- PDF en Storage
  
  -- Datos del periodo (snapshot)
  data_snapshot   JSONB,
  
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### `ai_conversations`
```sql
CREATE TABLE ai_conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  project_id      UUID REFERENCES projects(id),     -- contexto opcional
  
  messages        JSONB NOT NULL DEFAULT '[]',       -- historial de mensajes
  tokens_used     INT DEFAULT 0,
  
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

### `ai_usage_log`
```sql
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
```

---

## Índices importantes

```sql
-- Performance crítica
CREATE INDEX idx_projects_org ON projects(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_material_entries_project ON material_entries(project_id, created_at DESC);
CREATE INDEX idx_attendance_project_date ON worker_attendance(project_id, work_date DESC);
CREATE INDEX idx_worker_advances_project_week ON worker_advances(project_id, week_start);
CREATE INDEX idx_worker_advances_worker_date ON worker_advances(worker_id, advance_date DESC);
CREATE INDEX idx_payments_project ON payments(project_id, payment_date DESC);
CREATE INDEX idx_expenses_project ON expenses(project_id, expense_date DESC);
CREATE INDEX idx_photos_project ON photos(project_id, created_at DESC);
```

---

## Vistas útiles

```sql
-- Resumen financiero por proyecto
CREATE VIEW project_financial_summary AS
SELECT 
  p.id,
  p.name,
  p.total_budget,
  COALESCE(SUM(pay.amount), 0) as total_received,
  COALESCE(SUM(exp.amount), 0) as total_expenses,
  p.total_budget - COALESCE(SUM(exp.amount), 0) as remaining_budget,
  ROUND(COALESCE(SUM(exp.amount), 0) / NULLIF(p.total_budget, 0) * 100, 1) as budget_used_pct
FROM projects p
LEFT JOIN payments pay ON pay.project_id = p.id AND pay.deleted_at IS NULL
LEFT JOIN expenses exp ON exp.project_id = p.id AND exp.deleted_at IS NULL
WHERE p.deleted_at IS NULL
GROUP BY p.id;
```
