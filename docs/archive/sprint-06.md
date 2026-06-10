# Sprint 06 — Asistente IA + Reportes Automáticos
> Completado: 2026-06-10

---

## Objetivo

Implementar Módulo 11 (Asistente IA Constructor) y Módulo 07 (Reportes Automáticos) en la web, sin WhatsApp ni captura por voz.

---

## Entregables

### Módulo 11 — Asistente IA

| Ítem | Estado |
|---|---|
| Chat UI con streaming en `/assistant` | ✅ |
| `POST /api/ai/chat` (SSE streaming) | ✅ |
| `GET /api/ai/conversations` | ✅ |
| Inyección de contexto del tenant (finanzas, materiales, cronograma) | ✅ |
| Solo lectura — no escribe a BD excepto historial | ✅ |
| Historial en `ai_conversations` | ✅ |
| Rate limit 100 req/hora + quota por plan | ✅ |
| Sidebar con enlace "Asistente IA" | ✅ |

### Módulo 07 — Reportes Automáticos

| Ítem | Estado |
|---|---|
| `POST /api/reports/generate` | ✅ |
| `GET /api/projects/[id]/reports` | ✅ |
| `GET /api/reports/[id]/pdf` | ✅ |
| Narrativa Claude en español guatemalteco | ✅ |
| Snapshot JSON en `reports.data_snapshot` | ✅ |
| PDF con React-PDF (decisión tomada) | ✅ |
| Storage bucket `report-pdfs` | ✅ |
| UI en dashboard de proyecto | ✅ |

### Infraestructura

| Ítem | Estado |
|---|---|
| Migración `ai_usage_log` | ✅ |
| `@anthropic-ai/sdk` + `@react-pdf/renderer` | ✅ |
| Schemas Zod en `@constructa/schemas` | ✅ |
| Tests unit contexto IA (+6) | ✅ |
| Tests RLS `ai_conversations` + `reports` (+4) | ✅ |
| Total tests: **42** | ✅ |

---

## Decisiones técnicas

| Decisión | Elegido | Razón |
|---|---|---|
| PDF | **React-PDF** | Compatible con Vercel serverless, sin Chromium |
| Rate limit | 100 req/hora por org | `ENGINEERING_RULES.md` |
| Quota asistente | 50/día (Profesional), ilimitado (Empresa) | `AI_SYSTEM.md` |
| Quota reportes | 30/mes (Profesional), ilimitado (Empresa) | `AI_SYSTEM.md` |
| Plan Básico | Sin acceso IA (403) | Planes de precios |

---

## Archivos clave

```
apps/web/
  app/(dashboard)/assistant/page.tsx
  app/api/ai/chat/route.ts
  app/api/ai/conversations/route.ts
  app/api/reports/generate/route.ts
  app/api/reports/[id]/pdf/route.ts
  app/api/projects/[id]/reports/route.ts
  lib/ai/anthropic.ts, context.ts, prompts.ts, quota.ts, conversations.ts
  lib/reports/collect-period-data.ts, generate-narrative.ts, pdf-document.tsx, storage.ts
  components/modules/ai/ai-chat.tsx
  components/modules/reports/reports-section.tsx

supabase/migrations/
  20250610100003_ai_usage_log.sql
  20250610100004_storage_reports.sql

tests/ai/context.test.ts
```

---

## Variables de entorno

```env
ANTHROPIC_API_KEY=   # Requerida para chat y reportes
```

---

## Criterios de cierre

- [x] Asistente responde consultas sobre gastos/materiales/pagos/avance
- [x] Reporte semanal generado y descargable en PDF
- [x] Tests (unit contexto IA + RLS ai_conversations/reports)
- [x] Docs actualizados

---

## Fuera de alcance (diferido)

- Módulo 12 WhatsApp Integrado
- Módulo 13 Captura por Voz
- App móvil React Native
