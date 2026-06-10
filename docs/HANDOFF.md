# HANDOFF.md — Traspaso entre chats
> Pegar al inicio del próximo chat. Actualizar al cerrar cada sprint.

---

## Resumen ejecutivo (30 segundos)

**CONSTRUCTA** es SaaS de gestión de construcción para constructores guatemaltecos.  
Reemplaza Excel + WhatsApp con módulos integrados + IA en español.  
Precios: Q399 / Q799 / Q1,499/mes.  
**Estado:** Core MVP web completo (Sprints 01–05) · Pulido local en curso · Móvil post-MVP.

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
  mobile: React Native + Expo (diferido — después de pulir web local)
  ai: Anthropic Claude (claude-sonnet-4-20250514) — Sprint 06
  hosting: Vercel + Supabase Cloud

Multitenancy: RLS con organization_id
Repo: Monorepo pnpm — apps/web + packages/
Dev: pnpm dev:3001 (CONSTRUCTA) · otro proyecto en :3000
Tests: pnpm test (32 tests RLS + unit)

Módulos web MVP listos: Proyectos, Pagos, Portal, Materiales, Cronograma,
Personal, Centro Financiero (+ CRUD gastos)

Diferido: WhatsApp (12), Captura por voz (13), App móvil

Fase actual: Pulido local web → luego Sprint 06 (IA + Reportes)
```

---

## Orden de trabajo acordado

1. **Ahora:** Afinar web local (gastos, UX, docs, lint, tests verdes)
2. **Después:** Sprint 06 — Asistente IA + Reportes automáticos
3. **Más adelante:** App móvil React Native (sprint separado)
4. **Post-beta:** WhatsApp y voz

---

## Instrucciones para el próximo chat (Sprint 06)

Ver prompt completo en historial o `docs/CURRENT_STATE.md`.  
Leer: `AI_SYSTEM.md`, `FEATURES/Asistente-IA-constructor.md`, `FEATURES/Reportes-Automaticos.md`.

**Fuera de alcance:** Módulos 12 (WhatsApp) y 13 (Voz).

---

*Actualizado: 2026-06-10 · Post Sprint 05 / pulido local*
