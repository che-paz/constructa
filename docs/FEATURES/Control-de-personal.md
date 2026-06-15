# Módulo 04 — Control de Personal
> Asistencia digital, planilla semanal y adelantos al personal.

## Problema que resuelve
Planillas calculadas a mano en cuadernos, sin trazabilidad de jornales, contratos por tarea ni adelantos descontables al cierre de semana.

## Estado actual
```
🟡 MVP BASE + MEJORAS BETA | Sprint 04 ✅ → Sprint 07 🔲 | Depende: Módulo 01
```

## Funcionalidades MVP (Sprint 04 — completado)
- CRUD trabajadores a nivel **organización** (compartidos entre proyectos)
- Especialidad predefinida + jornal diario GTQ
- Asistencia manual por proyecto (entrada/salida, tipo de jornada)
- Cálculo automático de horas y monto (jornal × tipo)
- Planilla semanal con totales y estado pagado/pendiente
- Historial de asistencia por trabajador

## Mejoras beta (Sprint 07 — completado + 07b)

> Detalle: `FEEDBACK/beta-constructor-2026-06-12.md`, `FEEDBACK/beta-constructor-2026-06-15.md`  
> Plan: `archive/sprint-07-beta-feedback.md`, `archive/sprint-07b-payroll-close.md`

### Formas de pago

| Tipo | Código | Comportamiento |
|---|---|---|
| Jornal diario | `daily` | Cálculo automático por tipo de jornada (sin cambios) |
| Por contrato | `contract` | Monto manual al cerrar el día + nota del trabajo |

**Ejemplo contrato:** Luis Ramírez — Q500 — “pegar piso”

### Especialidad custom
- Lista común (Albañil, Electricista, …) + opción **“Otra”** con texto libre.

### Adelantos al personal
- Registro de adelantos mid-week por trabajador y proyecto.
- Descuento automático en planilla semanal al cierre.
- Distinto de los adelantos del **cliente** (Módulo 05).

### Planilla semanal mejorada
- Desglose: bruto, saldo anterior, adelantos, pagado en el día, **neto a pagar al cierre**.
- Botón **Cerrar semana** marca asistencias pagadas y descuenta adelantos.
- Saldo arrastrado cuando adelanto > bruto (`worker_payroll_balances`).
- Visibilidad de quién cobró el mismo día vs. pendiente al viernes/sábado.

## API Routes

```
GET/POST   /api/workers
PATCH      /api/workers/[id]
GET/POST   /api/attendance?project=&worker=
GET        /api/projects/[id]/payroll?week=
POST       /api/projects/[id]/payroll/close        ← Sprint 07b
GET/POST   /api/projects/[id]/advances?week=    ← Sprint 07
PATCH      /api/advances/[id]                    ← Sprint 07
```

## Tablas
- `workers` — incluye `payment_type` (`daily` | `contract`)
- `worker_attendance`
- `worker_advances` — adelantos descontables (Sprint 07)
- `worker_payroll_balances` — saldo arrastrado (Sprint 07b)

## Modelo de datos — workers (post Sprint 07)

```sql
workers (
  ...
  specialty       TEXT,           -- enum común o texto custom
  payment_type    TEXT DEFAULT 'daily',  -- 'daily' | 'contract'
  daily_rate      NUMERIC(8,2),   -- solo aplica si payment_type = 'daily'
  ...
)
```

## Criterio de finalización

### Sprint 04 ✅
- [x] Supervisor marca asistencia (manual web)
- [x] Planilla semanal en tabla con selector de semana
- [x] Historial de pagos/asistencia por trabajador

### Sprint 07 ✅
- [x] Especialidad custom (“Otra”)
- [x] Forma de pago jornal vs contrato
- [x] Monto manual + nota para trabajadores por contrato
- [x] Registro y descuento de adelantos en planilla
- [x] Resumen semanal: bruto / adelantos / pagado / neto

### Sprint 07b ✅
- [x] Cerrar semana desde planilla
- [x] Saldo arrastrado por adelanto excesivo

### Post-MVP
- [ ] PDF planilla semanal exportable
- [ ] QR asistencia en campo
