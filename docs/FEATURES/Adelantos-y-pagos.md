# Módulo 05 — Adelantos y Pagos
> Registro con evidencia. Fin de malentendidos de dinero.

## Problema que resuelve
Conflictos con clientes por pagos sin comprobante ni saldo actualizado.

## Estado actual
```
🟡 MVP BASE | Sprint 02 ✅ | Depende: Módulo 01
```

## Funcionalidades MVP
- Registro: fecha, monto (GTQ), método, comprobante (Storage)
- Saldo automático: presupuesto total − pagos registrados
- Historial por proyecto
- Alertas de pagos pendientes

## API Routes
```
GET/POST   /api/projects/[id]/payments
GET        /api/projects/[id]/payments/balance
DELETE     /api/payments/[id]  (soft delete)
```

## Tablas
`payments`

## Criterio de finalización
- [x] Constructor registra pago con comprobante
- [x] Saldo se actualiza sin cálculo manual
- [x] Cliente ve historial en portal (Módulo 06)
