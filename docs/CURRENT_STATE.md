# CURRENT_STATE.md
> **Actualizar este archivo después de cada sesión de trabajo.**  
> Es el "dónde estamos" del proyecto. Siempre refleja el estado real.

---

## Estado global: BETA EN PRODUCCIÓN — Vercel deploy ✅

```
[████████████████████████] 98% — MVP web en producción · Beta real con constructores
```

---

## Última sesión de trabajo

- **Fecha:** 2026-06-10
- **Qué se hizo:**
  - **Deploy Vercel (CLI):** https://constructa-nine.vercel.app — monorepo pnpm, root `apps/web`
  - Pestañas en dashboard de proyecto (`project-tab-nav.tsx`) — commit `efdb065`
  - Fix build Vercel: eliminado `(dashboard)/page.tsx` (conflicto con `/` landing)
  - Env vars en Vercel: Supabase, Anthropic, `CONSTRUCTA_DEFAULT_PLAN=profesional`
  - Docs: `docs/archive/deploy-vercel.md`
- **Archivos clave:** `vercel.json`, `apps/web/next.config.mjs`, `docs/archive/deploy-vercel.md`
- **Próxima tarea inmediata:** Conectar GitHub → auto-deploy · Supabase Auth URLs producción · checklist beta
- **Pendiente manual:** Supabase → Site URL + Redirect URLs con dominio Vercel

---

## Sprint activo

**Sprint 06 — Asistente IA + Reportes Automáticos**  
Estado: ✅ COMPLETADO → ver `archive/sprint-06.md`

| Tarea | Estado | Notas |
|---|---|---|
| Chat UI streaming `/assistant` | ✅ DONE | SSE + Anthropic |
| POST /api/ai/chat | ✅ DONE | Solo lectura, guarda historial |
| GET /api/ai/conversations | ✅ DONE | Listado por usuario |
| Inyección contexto tenant | ✅ DONE | Finanzas + materiales + cronograma |
| Rate limit + quota por plan | ✅ DONE | ai_usage_log |
| POST /api/reports/generate | ✅ DONE | < 30s objetivo |
| PDF React-PDF descargable | ✅ DONE | bucket report-pdfs |
| Tests unit + RLS | ✅ DONE | 42 tests |
| WhatsApp / Voz | ⏸️ DIFERIDO | Post-beta |

**Sprints anteriores:** 00–05 ✅ COMPLETADOS

---

## Módulos: estado de desarrollo

| Módulo | Estado | Sprint | Notas |
|---|---|---|---|
| 01 Gestión de Proyectos | 🟡 MVP BASE | Sprint 01 | CRUD + dashboard individual |
| 02 Cronograma Inteligente | 🟡 MVP BASE | Sprint 03 | CRUD etapas + timeline + retrasos |
| 03 Control de Materiales | 🟡 MVP BASE | Sprint 03 | Catálogo + movimientos + alertas |
| 04 Control de Personal | 🟡 MVP BASE | Sprint 04 | Asistencia + planilla semanal |
| 05 Adelantos y Pagos | 🟡 MVP BASE | Sprint 02 | CRUD + comprobantes + saldo |
| 06 Portal del Cliente | 🟡 MVP BASE | Sprint 02 | Token público, avance + pagos |
| 10 Centro Financiero | 🟡 MVP BASE | Sprint 05 | Dashboard + flujo de caja + CSV |
| 07 Reportes Automáticos | 🟡 MVP BASE | Sprint 06 | PDF + narrativa Claude |
| 11 Asistente IA | 🟡 MVP BASE | Sprint 06 | Chat streaming, solo lectura |
| 08 Fotografías | 🔲 PRÓXIMO | Sprint 08 | Beta |
| 09 Compras y Proveedores | 🔲 PRÓXIMO | Sprint 08 | Beta |
| 14 Detección de Riesgos | 🔲 PRÓXIMO | Sprint 08 | Beta |
| 12 WhatsApp Integrado | ⏸️ DIFERIDO | — | Post-MVP |
| 13 Captura por Voz | ⏸️ DIFERIDO | — | Post-MVP |

---

## Decisiones técnicas tomadas

| Decisión | Elegido | Descartado | Razón |
|---|---|---|---|
| PDF reportes | **React-PDF** | Puppeteer | Serverless Vercel, sin Chromium |
| Rate limit IA | 100 req/hora/org | — | ENGINEERING_RULES |
| Quota asistente | 50/día Profesional | — | AI_SYSTEM.md |
| Quota reportes | 30/mes Profesional | — | AI_SYSTEM.md |
| Alcance Fase 3 | Solo IA + Reportes | WhatsApp/voz | Sin bloqueos externos |

*(Decisiones anteriores Sprints 00–05 sin cambios — ver historial git)*

---

## Decisiones técnicas PENDIENTES

- [ ] Reconocimiento facial para asistencia: opcional post-MVP
- [ ] QR para asistencia en campo: MVP básico post-Sprint 04
- [ ] WhatsApp Business API: gestión Meta cuando se reactive módulo 12
- [ ] Transcripción de voz: Whisper vs Google Speech (módulo 13 diferido)
- [ ] Push notifications: Expo Notifications vs OneSignal
- [ ] Pasarela de pago GT: Stripe vs solución local

---

## Comandos útiles

```bash
cd /Users/ch3/Desktop/CONSTRUCTA
pnpm dev:3001          # CONSTRUCTA en localhost:3001
pnpm test              # 42 tests (RLS + unit)
pnpm db:push           # aplicar migraciones ai_usage_log + report-pdfs
npx vercel deploy --prod --yes   # deploy producción (desde raíz del monorepo)
```

**Producción:** https://constructa-nine.vercel.app  
**Requerido para IA:** `ANTHROPIC_API_KEY` en Vercel (server) y `.env.local` (local)

---

## Cómo actualizar este archivo

Al terminar cada sesión:
1. Actualizar "Última sesión de trabajo"
2. Marcar tareas del sprint activo
3. Registrar decisiones técnicas nuevas
4. Actualizar % de progreso global
