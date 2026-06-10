# CURRENT_STATE.md
> **Actualizar este archivo después de cada sesión de trabajo.**  
> Es el "dónde estamos" del proyecto. Siempre refleja el estado real.

---

## Estado global: FASE 2 — CORE MVP (Sprint 04)

```
[██████████████████████░░] 80% — Sprint 04 completo · listo para Sprint 05
```

---

## Última sesión de trabajo

- **Fecha:** 2026-06-10
- **Qué se hizo:**
  - Módulo 04 Personal: CRUD trabajadores org, asistencia manual, cálculo horas/monto
  - Planilla semanal en dashboard proyecto (tabla lun–dom, navegación por semana)
  - Historial asistencia/pagos por trabajador (clic en nombre)
  - APIs: workers, attendance, payroll
  - Tests RLS: +5 workers/attendance (20 RLS total) + 4 unit tests payroll
- **Archivos clave:** `app/api/workers/`, `app/api/attendance/`, `components/modules/workers/`, `lib/workers/`
- **Próxima tarea inmediata:** Sprint 05 — Centro Financiero

---

## Sprint activo

**Sprint 00 — Fundamentos del proyecto**  
Estado: ✅ COMPLETADO → ver `archive/sprint-00.md`

**Sprint 01 — Auth + Proyectos + Layout**  
Estado: ✅ COMPLETADO → ver `archive/sprint-01.md`

**Sprint 02 — Pagos + Portal del Cliente**  
Estado: ✅ COMPLETADO → ver `archive/sprint-02.md`

**Sprint 03 — Materiales + Cronograma**  
Estado: ✅ COMPLETADO → ver `archive/sprint-03.md`

**Sprint 04 — Personal y Planilla**  
Estado: ✅ COMPLETADO → ver `archive/sprint-04.md`

| Tarea | Estado | Notas |
|---|---|---|
| CRUD trabajadores | ✅ DONE | Org-scoped, jornal GTQ |
| Asistencia manual | ✅ DONE | Upsert por día/proyecto/trabajador |
| Cálculo horas y monto | ✅ DONE | full/half/absent/overtime |
| Planilla semanal | ✅ DONE | Tabla + selector semana |
| Historial por trabajador | ✅ DONE | En dashboard proyecto |
| Tests RLS personal | ✅ DONE | `pnpm test` — 24 tests |
| PDF planilla | 🔲 POST-MVP | React-PDF vs Puppeteer pendiente |

## Módulos: estado de desarrollo

| Módulo | Estado | Sprint | Notas |
|---|---|---|---|
| 01 Gestión de Proyectos | 🟡 MVP BASE | Sprint 01 | CRUD + dashboard individual |
| 02 Cronograma Inteligente | 🟡 MVP BASE | Sprint 03 | CRUD etapas + timeline + retrasos |
| 03 Control de Materiales | 🟡 MVP BASE | Sprint 03 | Catálogo + movimientos + alertas |
| 04 Control de Personal | 🟡 MVP BASE | Sprint 04 | Asistencia + planilla semanal |
| 05 Adelantos y Pagos | 🟡 MVP BASE | Sprint 02 | CRUD + comprobantes + saldo |
| 06 Portal del Cliente | 🟡 MVP BASE | Sprint 02 | Token público, avance + pagos |
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
| Comprobantes de pago | Storage path en `receipt_url` | URL firmada persistida | Signed URLs se generan al leer |
| Portal del cliente | Admin client server-side por token | RLS público anon | Sin auth; filtra campos sensibles |
| Facturas de materiales | Storage path en `invoice_url` | URL firmada persistida | Mismo patrón que payment-receipts |
| Presupuesto esperado materiales | Tabla `stage_material_budgets` | JSON en stages | Normalizado, queryable por etapa |
| Asistencia duplicada | Upsert `(project_id, worker_id, work_date)` | Insert siempre | Permite corregir jornada del día |
| Cálculo jornal | Multiplicador por tipo + horas extra | Solo manual | full=1×, half=0.5×, overtime=1.5× + extras |

---

## Decisiones técnicas PENDIENTES

- [ ] Estrategia de PDF: React-PDF vs Puppeteer
- [ ] Reconocimiento facial para asistencia: opcional post-MVP
- [ ] QR para asistencia en campo: MVP básico post-Sprint 04
- [ ] Transcripción de voz: Whisper API vs Google Speech-to-Text
- [ ] Push notifications: Expo Notifications vs OneSignal
- [ ] Pasarela de pago GT: Stripe vs solución local

---

## Riesgos activos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| WhatsApp API costos altos | Media | Alto | Evaluar en Fase 4 |
| Adopción en campo (supervisores) | Alta | Alto | WhatsApp + voz como canales |
| RLS mal configurado | Media | Crítico | Tests automáticos de aislamiento ✅ |
| Scope creep en MVP | Alta | Alto | Plan Básico = 6 módulos máximo |

---

## Comandos útiles (recordatorio)

```bash
cd /Users/ch3/Desktop/CONSTRUCTA
pnpm dev:3001          # CONSTRUCTA en localhost:3001
pnpm test              # tests RLS + unit
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
