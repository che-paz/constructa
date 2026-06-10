# Módulo 04 — Control de Personal
> Asistencia digital y planilla automática.

## Problema que resuelve
Planillas calculadas a mano en cuadernos, sin trazabilidad.

## Estado actual
```
🟡 MVP BASE | Sprint 04 ✅ | Depende: Módulo 01
```

## Funcionalidades MVP
- CRUD trabajadores (especialidad, jornal GTQ)
- Asistencia manual + QR (facial post-MVP)
- Cálculo automático de horas y monto
- Planilla semanal exportable (PDF básico)

## API Routes
```
GET/POST   /api/workers
POST       /api/attendance
GET        /api/projects/[id]/payroll?week=
```

## Tablas
`workers`, `worker_attendance`

## Criterio de finalización
- [x] Supervisor marca asistencia (manual web)
- [x] Planilla semanal en tabla con selector de semana
- [x] Historial de pagos/asistencia por trabajador
- [ ] PDF exportable (post-MVP)
- [ ] QR asistencia (post-MVP básico)
