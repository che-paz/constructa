# Sprint 04 — Personal y Planilla

**Estado:** ✅ COMPLETADO  
**Fecha:** 2026-06-10

## Objetivo

Control de personal: CRUD trabajadores, asistencia manual, cálculo automático de horas/jornal y planilla semanal por proyecto.

## Entregables

### Módulo 04 — Control de Personal
- [x] CRUD trabajadores por organización (nombre, DPI, teléfono, especialidad, jornal GTQ)
- [x] API workers + attendance + payroll
- [x] Registro de asistencia manual (proyecto, trabajador, fecha, check-in/out, tipo jornada)
- [x] Cálculo automático de horas trabajadas y monto (jornal × tipo)
- [x] UI en dashboard del proyecto: personal + formulario asistencia + planilla semanal
- [x] Historial de pagos/asistencia por trabajador (clic en nombre)
- [ ] PDF planilla semanal — post-MVP (decisión pendiente React-PDF vs Puppeteer)
- [ ] QR asistencia — post-MVP básico

### Tests y docs
- [x] Tests RLS workers + worker_attendance (+5 tests, 20 RLS total)
- [x] Unit tests calculateHoursWorked + calculateAttendanceAmount
- [x] `CURRENT_STATE.md` actualizado

## Rutas nuevas

```
GET/POST   /api/workers
PATCH      /api/workers/[id]
GET/POST   /api/attendance?project=&worker=
GET        /api/projects/[id]/payroll?week=
```

## Archivos clave

- `apps/web/app/api/workers/`
- `apps/web/app/api/attendance/`
- `apps/web/app/api/projects/[id]/payroll/`
- `apps/web/lib/workers/payroll.ts`, `attendance.ts`
- `apps/web/components/modules/workers/`
- `packages/schemas` — CreateWorkerSchema, CreateAttendanceSchema
- `packages/utils` — calculateHoursWorked, calculateAttendanceAmount, getWeekStart

## Migraciones

Ninguna nueva — tablas `workers` y `worker_attendance` ya en `20250609100005_workers.sql`.

## Verificación

```bash
pnpm dev:3001
pnpm test          # 24 tests (15 RLS + 9 unit) con Supabase cloud
```

## Siguiente sprint

Sprint 05 — Centro Financiero
