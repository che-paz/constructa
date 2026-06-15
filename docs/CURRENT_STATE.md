# CURRENT_STATE.md
> **Actualizar este archivo después de cada sesión de trabajo.**  
> Es el "dónde estamos" del proyecto. Siempre refleja el estado real.

---

## Estado global: BETA EN PRODUCCIÓN — Sprint 08b ✅

```
[████████████████████████] 100% — MVP web · Administración de empresa
```

---

## Última sesión de trabajo

- **Fecha:** 2026-06-15
- **Qué se hizo:**
  - **Sprint 08b completado:** `/settings` (empresa, logo, contraseña, usuarios/roles)
  - Permisos básicos por rol en APIs de escritura
  - Bucket `org-logos` para logos de empresa
- **Archivos clave:** `docs/archive/sprint-08b-admin.md`, `app/(dashboard)/settings/`
- **Próxima tarea inmediata:** Sprint 08+ — Fotografías, Compras, Riesgos (beta)
- **Producción:** https://constructa-nine.vercel.app

---

## Sprint activo

**Sprint 08+ — Módulos beta**  
Estado: 🔲 PENDIENTE

| Tarea | Estado | Notas |
|---|---|---|
| Fotografías | 🔲 PENDING | Módulo 08 |
| Compras y proveedores | 🔲 PENDING | Módulo 09 |
| Detección de riesgos | 🔲 PENDING | Módulo 14 |

**Sprint anterior:** 08b — Administración de empresa ✅ COMPLETADO

---

## Módulos: estado de desarrollo

| Módulo | Estado | Sprint | Notas |
|---|---|---|---|
| 01 Gestión de Proyectos | 🟡 MVP BASE | Sprint 01 | CRUD + dashboard individual |
| 02 Cronograma Inteligente | 🟡 MVP + UX | Sprint 07b | Retraso con nueva fecha |
| 03 Control de Materiales | 🟡 MVP + UX | Sprint 07b | Consumo simplificado |
| 04 Control de Personal | ✅ SPRINT 07b | Sprint 07b | Cierre semanal + saldo |
| 05 Adelantos y Pagos | 🟡 MVP BASE | Sprint 02 | CRUD + comprobantes + saldo |
| 06 Portal del Cliente | 🟡 MVP BASE | Sprint 02 | QR → Sprint 08a |
| 10 Centro Financiero | 🟡 MVP BASE | Sprint 05 | Dashboard + flujo de caja + CSV |
| 07 Reportes Automáticos | 🟡 MVP BASE | Sprint 06 | PDF + narrativa Claude |
| 11 Asistente IA | ✅ MEJORA CONTEXTO | Sprint 07 | Materiales por semana |
| 08 Fotografías | 🔲 PRÓXIMO | Sprint 08+ | Beta |
| 09 Compras y Proveedores | 🔲 PRÓXIMO | Sprint 08+ | Beta |
| 14 Detección de Riesgos | 🔲 PRÓXIMO | Sprint 08+ | Beta |
| 12 WhatsApp Integrado | ⏸️ DIFERIDO | — | Post-MVP |
| 13 Captura por Voz | ⏸️ DIFERIDO | — | Post-MVP |

---

## Decisiones técnicas tomadas

| Decisión | Elegido | Descartado | Razón |
|---|---|---|---|
| Saldo arrastrado planilla | `worker_payroll_balances` por proyecto+trabajador | Campo en workers | Adelantos son por proyecto |
| Cierre semanal | Batch `is_paid` + `is_deducted` + balance | Solo UI manual | Flujo real del constructor |
| PDF reportes | **React-PDF** | Puppeteer | Serverless Vercel |
| Rate limit IA | 100 req/hora/org | — | ENGINEERING_RULES |

---

## Comandos útiles

```bash
cd /Users/ch3/Desktop/CONSTRUCTA
pnpm dev:3001
pnpm test
pnpm db:push
npx vercel deploy --prod --yes
```

**Producción:** https://constructa-nine.vercel.app

---

## Cómo actualizar este archivo

Al terminar cada sesión:
1. Actualizar "Última sesión de trabajo"
2. Marcar tareas del sprint activo
3. Registrar decisiones técnicas nuevas
4. Actualizar % de progreso global
