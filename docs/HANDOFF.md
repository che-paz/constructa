# HANDOFF.md — Traspaso entre chats
> Pegar al inicio del próximo chat. Actualizar al cerrar cada sprint.

---

## Resumen ejecutivo (30 segundos)

**CONSTRUCTA** es SaaS de gestión de construcción para constructores guatemaltecos.  
Reemplaza Excel + WhatsApp con 14 módulos + IA en español.  
Precios: Q399 / Q799 / Q1,499/mes.  
**Estado:** Fase 0 completa · Supabase Cloud operativo · Sprint 01 pendiente.

---

## Resumen técnico compacto

```yaml
Proyecto: CONSTRUCTA
Tipo: SaaS B2B multitenant
Mercado: Constructores guatemaltecos (2–15 proyectos activos)
Moneda: GTQ · Idioma: Español guatemalteco

Stack:
  frontend: Next.js 14 + TypeScript + Tailwind + shadcn/ui
  backend: Next.js API Routes + Zod
  database: Supabase Cloud (PostgreSQL + Auth + Storage + RLS)
  mobile: React Native + Expo (futuro)
  ai: Anthropic Claude (claude-sonnet-4-20250514)
  hosting: Vercel + Supabase Cloud

Multitenancy: RLS con organization_id
Repo: Monorepo pnpm — apps/web + packages/
Supabase: project-ref qwijxxdsckztgnxnpqwb · 9 migraciones aplicadas
Dev: pnpm dev:3001 (CONSTRUCTA) · otro proyecto en :3000

MVP demo (60 días): Proyectos, Materiales, Pagos, Portal Cliente
MVP plan Básico (completo): + Cronograma, Personal (módulos 1–6)

Fase actual: 1 → Sprint 01 (Auth + Proyectos + Layout)
```

---

## Contexto de negocio (no perder)

- Constructores pragmáticos: adoptan si ahorran trabajo real desde día 1
- WhatsApp = canal de adopción para supervisores de campo
- Q399/mes es barato si evita Q5,000+ en materiales perdidos
- Portal del cliente = diferenciador local
- Módulo WOW: Control de Materiales

---

## Lo completado en sesión anterior

- [x] Monorepo pnpm (`apps/web`, `packages/`)
- [x] Next.js 14 + Tailwind + shadcn/ui + Supabase client
- [x] Supabase Cloud vinculado y migraciones aplicadas
- [x] `.env.local` configurado en `apps/web/`
- [x] `pnpm dev:3001` para desarrollo

---

## Instrucciones para el próximo chat

```
INICIO DE SESIÓN — CONSTRUCTA

Lee en orden antes de responder:
1. docs/PROJECT_OVERVIEW.md
2. docs/CURRENT_STATE.md
3. docs/ROADMAP.md (Sprint 1)
4. docs/FEATURES/Gestion-de-proyectos.md
5. docs/ENGINEERING_RULES.md

Stack: Next.js 14 + TypeScript + Supabase Cloud + Tailwind + shadcn/ui
Estado: Fase 0 completa. Supabase Cloud operativo (9 migraciones). Sprint 01.

Tarea de hoy — Sprint 01:
1. Auth: páginas login/signup con Supabase Auth
2. Onboarding: signup → crear organization + user_organizations (rol constructor)
3. Layout dashboard: sidebar, navbar, protección de rutas (middleware)
4. CRUD Proyectos (Módulo 01): listar, crear, editar, ver detalle

Dev: pnpm dev:3001 (localhost:3001)
Reglas: docs/ENGINEERING_RULES.md
```

---

*Actualizado: 2026-06-09 · Fin sesión Fase 0 / inicio Sprint 01*
