# Módulo 05 — Adelantos y Pagos
> Registro con evidencia. Fin de malentendidos de dinero.

## Problema que resuelve
Conflictos con clientes por pagos sin comprobante ni saldo actualizado.

## Estado actual
```
🔲 NO INICIADO | Sprint 02 | Depende: Módulo 01
```

## Funcionalidades MVP
- Registro: fecha, monto (GTQ), método, comprobante (Storage)
- Saldo automático: anticipo - pagos recibidos
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
- [ ] Constructor registra pago con comprobante
- [ ] Saldo se actualiza sin cálculo manual
- [ ] Cliente ve historial en portal (Módulo 06)
