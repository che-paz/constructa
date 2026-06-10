# Sprint 03 — Materiales + Cronograma

**Estado:** ✅ COMPLETADO  
**Fecha:** 2026-06-10

## Objetivo

Control de materiales (catálogo, movimientos, real vs esperado, alertas) y cronograma por etapas con detección de retrasos.

## Entregables

### Módulo 02 — Cronograma Inteligente
- [x] CRUD etapas por proyecto (orden, fechas, responsable, progress_pct, status)
- [x] API stages + schedule summary
- [x] UI timeline/Gantt simplificado + lista ordenada
- [x] Cálculo automático días de atraso; alerta visual > 5 días
- [x] Recálculo al marcar retraso (empuja fechas de etapas siguientes)

### Módulo 03 — Control de Materiales
- [x] Catálogo de materiales por organización (CRUD)
- [x] Movimientos: purchase, consumption, transfer, loss, return
- [x] Upload facturas → bucket `material-invoices`
- [x] Consumo real vs esperado por etapa/material (`stage_material_budgets`)
- [x] Dashboard materiales: resumen + alertas desvío > 15%
- [x] APIs catalog, entries, summary, alerts, budgets

### Tests y docs
- [x] Tests RLS material_catalog + material_entries (org A no ve org B)
- [x] Unit tests delay + deviation
- [x] `CURRENT_STATE.md` actualizado

## Rutas nuevas

```
GET/POST   /api/projects/[id]/stages
PATCH      /api/stages/[id]
GET        /api/projects/[id]/schedule/summary

GET/POST   /api/materials/catalog
PATCH      /api/materials/catalog/[id]
GET/POST   /api/materials/entries
POST       /api/materials/entries/upload
GET        /api/materials/summary?project=
GET        /api/materials/alerts?project=
POST       /api/materials/budgets
```

## Migraciones

- `20250610100001_stage_material_budgets.sql` — presupuesto esperado por etapa/material
- `20250610100002_storage_invoices.sql` — bucket `material-invoices`

## Verificación

```bash
pnpm dev:3001
pnpm test          # 15 tests (10 RLS + 5 unit)
pnpm db:push       # aplicar migraciones nuevas al cloud
```

## Siguiente sprint

Sprint 04 — Personal y Planilla
