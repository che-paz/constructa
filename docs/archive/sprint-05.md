# Sprint 05 — Centro Financiero

**Estado:** ✅ COMPLETADO  
**Fecha:** 2026-06-10

## Objetivo

Dashboard multi-proyecto con métricas consolidadas, gasto real vs presupuesto, cuentas por cobrar, flujo de caja y exportación CSV.

## Entregables

### Módulo 10 — Centro Financiero (versión básica)
- [x] Dashboard multi-proyecto (presupuesto, cobrado, gastado, saldo, por cobrar)
- [x] Gasto real = materiales + planilla + gastos registrados
- [x] Cuentas por cobrar (saldo pendiente cliente por obra)
- [x] Flujo de caja por periodo (semana/mes) con gráfico Recharts
- [x] UI `/finance` en sidebar + detalle financiero en dashboard de proyecto
- [x] Exportación CSV del resumen financiero
- [x] Alertas cuando proyecto > 80% presupuesto con < 70% avance

### APIs
- [x] `GET /api/finance/dashboard`
- [x] `GET /api/finance/cashflow?period=week|month`
- [x] `GET /api/projects/[id]/financial-summary`

### Tests y docs
- [x] Tests RLS expenses (+3 tests)
- [x] Unit tests agregación financiera (+5 tests)
- [x] `CURRENT_STATE.md` actualizado

## Rutas nuevas

```
GET   /finance
GET   /api/finance/dashboard
GET   /api/finance/cashflow?period=&project=&reference_date=
GET   /api/projects/[id]/financial-summary
```

## Archivos clave

- `apps/web/app/(dashboard)/finance/page.tsx`
- `apps/web/app/api/finance/`
- `apps/web/app/api/projects/[id]/financial-summary/`
- `apps/web/lib/finance/summary.ts`, `fetch-org-financial-data.ts`
- `apps/web/components/modules/finance/`
- `packages/types` — ProjectFinancialSummary, FinanceDashboard, CashflowSummary
- `packages/utils` — calculateProjectSpent, detectBudgetAlert, getMonthStart/End
- `packages/schemas` — CashflowQuerySchema

## Migraciones

Ninguna nueva — agregación en capa de aplicación (vista SQL existente solo cubre payments + expenses).

## Verificación

```bash
pnpm dev:3001
pnpm test          # 32 tests (18 RLS + 14 unit) con Supabase cloud
```

## Siguiente sprint

Sprint 06 — Asistente IA + Reportes automáticos (sin WhatsApp ni voz)
