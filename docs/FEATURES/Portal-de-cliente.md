# Módulo 06 — Portal del Cliente
> El cliente ve su obra sin llamar al constructor.

## Problema que resuelve
Clientes sin visibilidad generan desconfianza y disputas.

## Estado actual
```
🟡 MVP BASE | Sprint 02 ✅ | Depende: Módulos 01, 05
```

## Funcionalidades MVP
- Acceso vía `client_token` único por proyecto (sin auth complejo)
- Vista: avance %, cronograma simplificado, fotos
- Pagos realizados y saldo pendiente
- Sin exposición de costos internos (flag `client_can_see_costs`)

## Rutas web
```
/client/[token]           → dashboard cliente
/client/[token]/payments  → historial pagos
/client/[token]/photos    → galería
```

## Tablas
`projects.client_token`, `payments`, `photos`, `stages`

## Criterio de finalización
- [x] Cliente accede con link/token
- [x] Ve avance y pagos en tiempo real
- [x] No accede a datos de otros proyectos
