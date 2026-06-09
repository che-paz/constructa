# Sprint 00 — Arquitectura y Documentación Inicial
**Período:** 2025–2026-06-09  
**Estado:** ✅ COMPLETADO

---

## Qué se construyó

- Propuesta comercial (HTML) analizada y traducida a arquitectura técnica
- Memoria documental completa en `docs/`
- Stack definido: Next.js 14 + Supabase + Claude API + Expo
- Schema PostgreSQL con RLS multitenant
- Roadmap 17 semanas hasta lanzamiento
- Estrategia de optimización de tokens

## Decisiones clave

| Decisión | Elegido | Razón |
|---|---|---|
| Memoria del proyecto | `docs/` Markdown | Chats cortos, contexto persistente |
| Multitenancy | RLS single-schema | Menor complejidad operacional |
| MVP demo | 4 módulos en 60 días | Propuesta comercial |
| MVP comercial | 6 módulos (plan Básico) | Justifica Q399/mes |

## Próximo sprint

**Sprint 01:** Auth + Módulo Proyectos + Layout  
**Primera tarea:** Crear monorepo y conectar Supabase
