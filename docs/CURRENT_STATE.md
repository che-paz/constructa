# CURRENT_STATE.md
> **Actualizar este archivo después de cada sesión de trabajo.**  
> Es el "dónde estamos" del proyecto. Siempre refleja el estado real.

---

## Estado global: BETA EN PRODUCCIÓN — Sprint 07 feedback 🔧

```
[████████████████████████] 98% — MVP web en producción · Ajustes planilla post-reunión beta
```

---

## Última sesión de trabajo

- **Fecha:** 2026-06-12
- **Qué se hizo:**
  - Documentación completa del feedback de reunión con constructor en producción
  - Definido **Sprint 07**: planilla (jornal vs contrato, adelantos, especialidad custom) + fix IA materiales
  - Items generales (roles, config empresa, PDF portal branding) movidos a **Sprint 08**
  - Acuerdo: constructor pausa módulo Personal; resto de app activa durante implementación
- **Archivos clave:** `docs/FEEDBACK/beta-constructor-2026-06-12.md`, `docs/archive/sprint-07-beta-feedback.md`
- **Próxima tarea inmediata:** Fase D — contexto IA materiales · validar planilla con constructor
- **Producción:** https://constructa-nine.vercel.app — deploy Sprint 07 planilla ✅ (2026-06-12)

---

## Sprint activo

**Sprint 07 — Feedback beta: Planilla + IA materiales**  
Estado: 🔲 EN CURSO → ver `archive/sprint-07-beta-feedback.md` · origen: `FEEDBACK/beta-constructor-2026-06-12.md`

| Tarea | Estado | Notas |
|---|---|---|
| Forma de pago jornal vs contrato | ✅ DONE | UI + API |
| Especialidad custom | ✅ DONE | Opción “Otra” + texto libre |
| Adelantos al personal | ✅ DONE | Formulario + planilla |
| Planilla: bruto / adelantos / neto | ✅ DONE | Tabla + resumen semanal |
| IA: materiales por semana | 🔲 TODO | Fase D |

**Sprint anterior:** 06 — Asistente IA + Reportes ✅ COMPLETADO

---

## Módulos: estado de desarrollo

| Módulo | Estado | Sprint | Notas |
|---|---|---|---|
| 01 Gestión de Proyectos | 🟡 MVP BASE | Sprint 01 | CRUD + dashboard individual |
| 02 Cronograma Inteligente | 🟡 MVP BASE | Sprint 03 | CRUD etapas + timeline + retrasos |
| 03 Control de Materiales | 🟡 MVP BASE | Sprint 03 | Catálogo + movimientos + alertas |
| 04 Control de Personal | 🟡 SPRINT 07 CASI LISTO | Sprint 07 | Falta Fase D (IA materiales) |
| 05 Adelantos y Pagos | 🟡 MVP BASE | Sprint 02 | CRUD + comprobantes + saldo |
| 06 Portal del Cliente | 🟡 MVP BASE | Sprint 02 | Token público, avance + pagos |
| 10 Centro Financiero | 🟡 MVP BASE | Sprint 05 | Dashboard + flujo de caja + CSV |
| 07 Reportes Automáticos | 🟡 MVP BASE | Sprint 06 | PDF + narrativa Claude |
| 11 Asistente IA | 🟡 MEJORA CONTEXTO | Sprint 07 | Fix consultas materiales/semana |
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
