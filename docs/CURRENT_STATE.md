# CURRENT_STATE.md
> **Actualizar este archivo después de cada sesión de trabajo.**  
> Es el "dónde estamos" del proyecto. Siempre refleja el estado real.

---

## Estado global: FASE 1 — FUNDAMENTOS (Sprint 02)

```
[██████████████░░░░░░] 40% — Sprint 01 completo · Sprint 02 listo para iniciar
```

---

## Última sesión de trabajo

- **Fecha:** 2026-06-09
- **Qué se hizo:**
  - Sprint 01 completado y verificado en producción local
  - Auth: Server Actions (`/login`, `/signup`) — funciona sin depender de JS cliente
  - Onboarding: service role server-side para bootstrap de org (fix RLS)
  - Fix: `NEXT_PUBLIC_SUPABASE_ANON_KEY` corrupta en `.env.local`
  - CRUD Proyectos operativo end-to-end
- **Archivos clave:** `lib/auth/actions.ts`, `lib/supabase/admin.ts`, `lib/auth/onboarding.ts`
- **Próxima tarea inmediata:** Sprint 02 — Módulo Pagos + Portal del Cliente + tests RLS

---

## Sprint activo

**Sprint 00 — Fundamentos del proyecto**  
Estado: ✅ COMPLETADO → ver `archive/sprint-00.md`

**Sprint 01 — Auth + Proyectos + Layout**  
Estado: ✅ COMPLETADO → ver `archive/sprint-01.md`

**Sprint 02 — Pagos + Portal del Cliente**  
Estado: 🟡 EN CURSO

| Tarea | Estado | Notas |
|---|---|---|
| Módulo Pagos (Módulo 05) | 🔲 PENDIENTE | Registro, historial, saldos |
| Upload comprobantes (Storage) | 🔲 PENDIENTE | Supabase Storage |
| Portal del Cliente (Módulo 06) | 🔲 PENDIENTE | Acceso con `client_token` |
| Tests RLS aislamiento orgs | 🔲 PENDIENTE | Crítico seguridad |

## Módulos: estado de desarrollo

| Módulo | Estado | Sprint | Notas |
|---|---|---|---|
| 01 Gestión de Proyectos | 🟡 MVP BASE | Sprint 01 | CRUD + dashboard individual |
| 02 Cronograma Inteligente | 🔲 NO INICIADO | Sprint 03 | |
| 03 Control de Materiales | 🔲 NO INICIADO | Sprint 03 | Mayor ROI percibido |
| 04 Control de Personal | 🔲 NO INICIADO | Sprint 04 | |
| 05 Adelantos y Pagos | 🔲 NO INICIADO | Sprint 02 | |
| 06 Portal del Cliente | 🔲 NO INICIADO | Sprint 02 | |
| 07–14 | 🔲 NO INICIADO | Sprint 06+ | Post-MVP |

---

## Decisiones técnicas tomadas

| Decisión | Elegido | Descartado | Razón |
|---|---|---|---|
| Frontend framework | Next.js 14 | Remix, Nuxt | Ecosistema, Vercel, App Router |
| Base de datos | Supabase Cloud (PostgreSQL) | Firebase, PlanetScale | Auth + Storage + Realtime incluidos |
| Auth | Supabase Auth + `@supabase/ssr` | auth-helpers-nextjs (deprecated) | Paquete actual para App Router |
| Supabase hosting | Cloud (São Paulo) | Solo local | Sin Docker, deploy directo |
| Dev ports | CONSTRUCTA `:3001`, otros `:3000` | — | Convivencia multi-proyecto |
| Mobile | React Native (Expo) | Flutter, native | Reutilizar lógica JS/TS |
| IA | Anthropic Claude API | OpenAI, Gemini | Mejor razonamiento en español |
| CSS | Tailwind CSS + shadcn/ui | CSS Modules | Velocidad de desarrollo |
| Monorepo | pnpm workspaces | npm, yarn | Performance y hoisting controlado |
| Onboarding bootstrap | Service role server-side | Client anon insert | RLS bloquea insert sin sesión activa |

---

## Decisiones técnicas PENDIENTES

- [ ] Estrategia de PDF: React-PDF vs Puppeteer
- [ ] Reconocimiento facial para asistencia: opcional post-MVP
- [ ] Transcripción de voz: Whisper API vs Google Speech-to-Text
- [ ] Push notifications: Expo Notifications vs OneSignal
- [ ] Pasarela de pago GT: Stripe vs solución local

---

## Riesgos activos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| WhatsApp API costos altos | Media | Alto | Evaluar en Fase 4 |
| Adopción en campo (supervisores) | Alta | Alto | WhatsApp + voz como canales |
| RLS mal configurado | Media | Crítico | Tests automáticos de aislamiento |
| Scope creep en MVP | Alta | Alto | Plan Básico = 6 módulos máximo |

---

## Comandos útiles (recordatorio)

```bash
cd /Users/ch3/Desktop/CONSTRUCTA
pnpm dev:3001          # CONSTRUCTA en localhost:3001
pnpm db:status         # verificar migraciones
pnpm db:push           # aplicar nuevas migraciones al cloud
```

---

## Cómo actualizar este archivo

Al terminar cada sesión:
1. Actualizar "Última sesión de trabajo"
2. Marcar tareas del sprint activo
3. Registrar decisiones técnicas nuevas
4. Actualizar % de progreso global
