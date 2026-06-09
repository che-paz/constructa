# Sprint 01 — Auth + Proyectos + Layout
**Período:** 2026-06-09  
**Estado:** ✅ COMPLETADO

---

## Qué se construyó

- **Auth:** páginas `/login` y `/signup` con Supabase Auth (`@supabase/ssr`)
- **Onboarding:** signup crea `organizations` + `user_organizations` (rol `constructor`); fallback `/onboarding`
- **Layout dashboard:** sidebar, navbar, cierre de sesión, grupo `(dashboard)`
- **Middleware:** protección de rutas, refresh de sesión, redirección sin org
- **CRUD Proyectos (Módulo 01):**
  - API: `GET/POST /api/projects`, `GET/PATCH /api/projects/[id]`, `GET /api/projects/[id]/summary`
  - UI: lista con filtros, crear, editar, detalle con métricas
- **Packages:** schemas Zod (auth + projects), types, utils (`formatGtq`, `slugify`)

## Archivos clave

```
apps/web/
  app/(auth)/login|signup/
  app/(dashboard)/projects/
  app/api/projects/
  components/shared/   → sidebar, navbar, auth-form
  components/modules/projects/
  lib/auth/            → get-user, get-organization, onboarding
  lib/supabase/middleware.ts
```

## Decisiones clave

| Decisión | Elegido | Razón |
|---|---|---|
| Onboarding en signup | Crear org en el mismo flujo | Menos fricción para constructor dueño |
| Rutas protegidas | `/projects/*` vía middleware | Patrón estándar App Router |
| Validación | Zod en `@constructa/schemas` | Regla ENGINEERING_RULES |

## Próximo sprint

**Sprint 02:** Módulo Pagos + Portal del Cliente + tests RLS
