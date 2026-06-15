# Sprint 07b — Cierre de planilla + UX beta

**Estado:** ✅ COMPLETADO  
**Fecha inicio:** 2026-06-15  
**Origen:** `FEEDBACK/beta-constructor-2026-06-15.md`

---

## Objetivo

Completar el flujo operativo de planilla semanal (cierre, saldo arrastrado) y corregir fricciones de uso en materiales y cronograma detectadas en la 2ª reunión.

---

## Tareas

### Fase A — Saldo arrastrado (BD) ✅

- Migración `20250615100001_worker_payroll_balances.sql`
- Types + `ClosePayrollSchema`

### Fase B — Lógica planilla ✅

- `computePayrollAmounts` + `buildPayrollSummary` con saldo anterior
- `POST /api/projects/[id]/payroll/close`

### Fase C — UI planilla ✅

- Botón “Cerrar semana” en `payroll-table.tsx`
- Columnas saldo anterior y aviso carry forward

### Fase D — Materiales ✅

- `material-entry-form.tsx`: facturación solo en compras

### Fase E — Cronograma ✅

- Formulario inline de retraso con nueva fecha + motivo

### Fase F — Tests ✅

- Unit: saldo anterior, carry forward

---

## Criterio de finalización

- [x] Constructor cierra semana desde planilla
- [x] Adelanto > bruto → saldo próxima semana
- [x] Consumo sin precio/factura/archivo
- [x] Retraso extiende fecha fin con motivo

**Próximo:** Sprint 08a — ver `archive/sprint-08a-usability.md`
