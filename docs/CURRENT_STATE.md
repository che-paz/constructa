# CURRENT_STATE.md
> **Actualizar este archivo después de cada sesión de trabajo.**  
> Es el "dónde estamos" del proyecto. Siempre refleja el estado real.

---

## Estado global: FASE 3 — IA + REPORTES (Sprint 06)

```
[████████████████████░░░░] 83% — Core MVP completo · Fase 3 en curso (sin WhatsApp/voz)
```

---

## Última sesión de trabajo

- **Fecha:** 2026-06-10
- **Qué se hizo:**
  - Módulo 10 Centro Financiero: dashboard multi-proyecto, flujo de caja, alertas
  - Agregación gasto real = materiales + planilla + gastos registrados
  - APIs finance/dashboard, finance/cashflow, projects/[id]/financial-summary
  - UI `/finance` en sidebar + resumen financiero en dashboard de proyecto
  - Exportación CSV + gráfico Recharts
  - Tests RLS expenses (+3) + unit agregación financiera (+5)
- **Archivos clave:** `app/api/finance/`, `lib/finance/`, `components/modules/finance/`
- **Próxima tarea inmediata:** Pulido web local → Sprint 06 (Asistente IA + Reportes)
- **Diferido explícito:** App móvil, WhatsApp (12) y Captura por voz (13)

### Pulido local (en curso)

| Ítem | Estado | Notas |
|---|---|---|
| CRUD gastos en proyecto | ✅ DONE | API + UI expenses |
| Home → /finance | ✅ DONE | Hub financiero como entrada |
| Lint limpio | ✅ DONE | — |
| Docs sincronizados | ✅ DONE | HANDOFF, OVERVIEW |
| Sprint 06 IA + Reportes | 🔲 SIGUIENTE | Tras validar web local |
| App móvil React Native | 🔲 POST-MVP | Después de web estable |

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

**Sprint 05 — Centro Financiero**  
Estado: ✅ COMPLETADO → ver `archive/sprint-05.md`

| Tarea | Estado | Notas |
|---|---|---|
| Dashboard multi-proyecto | ✅ DONE | Métricas consolidadas GTQ |
| Gasto real vs presupuesto | ✅ DONE | Materiales + planilla + expenses |
| Cuentas por cobrar | ✅ DONE | Saldo pendiente por obra |
| Flujo de caja | ✅ DONE | Semana/mes + Recharts |
| Exportación CSV | ✅ DONE | Desde vista /finance |
| Alertas presupuesto/avance | ✅ DONE | >80% gasto y <70% avance |
| Tests RLS expenses | ✅ DONE | `pnpm test` — 32 tests |
| App móvil React Native | 🔲 POST-MVP | Sprint separado |

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
| 07 Reportes Automáticos | 🔲 PRÓXIMO | Sprint 06 | PDF + narrativa Claude |
| 11 Asistente IA | 🔲 PRÓXIMO | Sprint 06 | Chat streaming, solo lectura |
| 08 Fotografías | 🔲 NO INICIADO | Sprint 08 | Beta |
| 09 Compras y Proveedores | 🔲 NO INICIADO | Sprint 08 | Beta |
| 14 Detección de Riesgos | 🔲 NO INICIADO | Sprint 08 | Beta |
| 12 WhatsApp Integrado | ⏸️ DIFERIDO | — | Post-MVP; aprobación Meta pendiente |
| 13 Captura por Voz | ⏸️ DIFERIDO | — | Post-MVP; requiere app móvil |

### Módulos diferidos (decisión 2026-06-10)

| Módulo | Motivo | Revisar cuando |
|---|---|---|
| 12 WhatsApp | Costo/aprobación Meta + complejidad webhook | Beta con constructores reales |
| 13 Captura por voz | Depende de app móvil Expo | Tras app móvil o demanda validada |

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
| Agregación financiera | Capa app (`lib/finance`) | Extender vista SQL | Incluye materiales + planilla además de expenses |
| Alcance Fase 3 | Solo IA + Reportes (Sprint 06) | Incluir WhatsApp/voz en Sprint 07 | Priorizar diferenciación web sin bloqueos externos |

---

## Decisiones técnicas PENDIENTES

- [ ] Estrategia de PDF: React-PDF vs Puppeteer ← **decidir en Sprint 06**
- [ ] Reconocimiento facial para asistencia: opcional post-MVP
- [ ] QR para asistencia en campo: MVP básico post-Sprint 04
- [ ] WhatsApp Business API: gestión Meta cuando se reactive módulo 12
- [ ] Transcripción de voz: Whisper API vs Google Speech-to-Text (módulo 13 diferido)
- [ ] Push notifications: Expo Notifications vs OneSignal
- [ ] Pasarela de pago GT: Stripe vs solución local

---

## Riesgos activos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| WhatsApp API costos altos | Media | Alto | Evaluar en Fase 4 |
| Adopción en campo (supervisores) | Alta | Alto | Web manual por ahora; WhatsApp/voz diferidos |
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
