# ENGINEERING_RULES.md
> Reglas de ingeniería no negociables para CONSTRUCTA.  
> Leer antes de escribir cualquier línea de código.

---

## Principios fundamentales

1. **TypeScript strict en todo.** Sin `any`. Sin excepciones.
2. **Validar en el borde.** Toda entrada de usuario pasa por Zod antes de tocar la base de datos.
3. **Fallar ruidosamente en desarrollo, silenciosamente en producción.** Logs + Sentry.
4. **Un módulo, un directorio.** Sin lógica de materiales en el módulo de pagos.
5. **Server Components por default.** Solo `"use client"` cuando sea estrictamente necesario.

---

## Convenciones de nombrado

```
Archivos:          kebab-case.ts         (material-entry.ts)
Componentes:       PascalCase.tsx         (MaterialCard.tsx)
Hooks:             camelCase, prefijo use  (useProjectStats.ts)
API routes:        kebab-case             (api/materials/entries/route.ts)
Tablas BD:         snake_case plural       (material_entries)
Columnas BD:       snake_case             (organization_id, created_at)
Tipos TS:          PascalCase             (MaterialEntry, ProjectStatus)
Constantes:        SCREAMING_SNAKE        (MAX_PROJECTS_BASIC = 3)
```

---

## Estructura de un API Route (patrón obligatorio)

```typescript
// app/api/materials/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { NextResponse } from 'next/server'

// 1. Schema de validación SIEMPRE primero
const CreateMaterialSchema = z.object({
  project_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  quantity: z.number().positive(),
  unit: z.enum(['bolsas', 'quintales', 'metros', 'unidades', 'litros']),
})

export async function POST(request: Request) {
  try {
    // 2. Auth SIEMPRE segundo
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 3. Validar input
    const body = await request.json()
    const parsed = CreateMaterialSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    // 4. Lógica de negocio
    const { data, error } = await supabase
      .from('material_entries')
      .insert({ ...parsed.data, created_by: user.id })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[materials/POST]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## Estructura de un Server Component (patrón obligatorio)

```typescript
// app/(dashboard)/projects/[id]/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ProjectDashboard } from '@/components/modules/projects/project-dashboard'

interface Props {
  params: { id: string }
}

export default async function ProjectPage({ params }: Props) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*, stages(*), material_entries(count), workers(count)')
    .eq('id', params.id)
    .single()

  if (!project) redirect('/projects')

  // Renderizar con datos. Zero loading states en server components.
  return <ProjectDashboard project={project} />
}
```

---

## Manejo de errores: jerarquía

```
1. Zod validation errors → 400 Bad Request
2. Auth errors          → 401 Unauthorized
3. Permission errors    → 403 Forbidden
4. Not found           → 404 Not Found
5. Business logic err  → 422 Unprocessable Entity
6. Unexpected errors   → 500 Internal Server Error + Sentry
```

---

## Reglas de base de datos

- **Nunca borrar datos.** Usar `deleted_at` (soft delete) en todo.
- **Siempre `organization_id`.** Toda tabla de datos tiene esta columna.
- **Siempre timestamps.** `created_at`, `updated_at` en cada tabla.
- **Siempre `created_by`.** UUID del usuario que creó el registro.
- **Migrations nombradas:** `YYYYMMDD_descripcion_corta.sql`
- **RLS siempre activo.** Probar que funciona antes de PR.

```sql
-- Template de tabla nueva
CREATE TABLE nombre_tabla (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  -- campos específicos aquí
);

-- RLS obligatorio
ALTER TABLE nombre_tabla ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON nombre_tabla
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );
```

---

## Reglas de componentes

```
components/
├── ui/           → Solo shadcn. NO modificar directamente.
├── shared/       → Layout, NavBar, PageHeader, LoadingSpinner
└── modules/      → Un directorio por módulo
    └── projects/
        ├── project-card.tsx       (presentacional, sin lógica async)
        ├── project-dashboard.tsx  (orquestador)
        ├── project-form.tsx       (formulario con RHF)
        └── hooks/
            └── use-project-stats.ts
```

**Regla:** Un componente no debería hacer más de una cosa. Si tiene más de 150 líneas, dividirlo.

---

## Reglas de IA (Claude API)

- **Nunca datos sensibles en prompts.** Filtrar antes de enviar a Claude.
- **Siempre system prompt con contexto del tenant.** Incluir nombre de empresa, moneda (GTQ), idioma (español guatemalteco).
- **Rate limiting por organización.** Máximo 100 llamadas/hora.
- **Streaming por default** para respuestas al usuario. No-streaming para background jobs.
- **Logs de cada llamada:** tokens usados, costo estimado, latencia.
- **Timeout:** 30 segundos máximo por llamada.

```typescript
// Pattern para llamadas a Claude
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1000,
  system: buildSystemPrompt(organizationContext), // siempre contextualizado
  messages: [{ role: 'user', content: userMessage }],
  stream: true, // por default
})
```

---

## Git workflow

```
main          → producción (protegida, solo merge via PR)
staging       → pre-producción (deploy automático)
feat/nombre   → features (branching desde main)
fix/nombre    → bugfixes
docs/nombre   → solo documentación
```

**Commits:** Conventional Commits
```
feat(materiales): agregar alerta de desvío automática
fix(auth): corregir expiración de sesión en móvil
docs(arquitectura): actualizar diagrama de flujo WhatsApp
chore: actualizar dependencias de seguridad
```

---

## Checklist antes de hacer PR

- [ ] TypeScript sin errores (`tsc --noEmit`)
- [ ] Tests pasan (`pnpm test`)
- [ ] Linting limpio (`pnpm lint`)
- [ ] RLS probado manualmente para el feature
- [ ] Variables de entorno documentadas en `.env.example`
- [ ] `CURRENT_STATE.md` actualizado con lo que se completó
- [ ] Feature file en `docs/FEATURES/` actualizado si aplica

---

## Variables de entorno requeridas

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # Solo servidor, nunca cliente

# Anthropic
ANTHROPIC_API_KEY=                # Solo servidor

# WhatsApp (Fase 4)
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=

# App
NEXT_PUBLIC_APP_URL=
```
