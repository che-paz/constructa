# Módulo 04 — Control de Personal
> Asistencia digital y planilla automática.

## Problema que resuelve
Planillas calculadas a mano en cuadernos, sin trazabilidad.

## Estado actual
```
🔲 NO INICIADO | Sprint 04 | Depende: Módulo 01
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
- [ ] Supervisor marca asistencia
- [ ] Planilla semanal generada con un clic
- [ ] Historial de pagos por trabajador
