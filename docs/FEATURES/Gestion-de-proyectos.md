# Módulo 01 — Gestión de Proyectos
> Base de todo el sistema. Cada obra = un proyecto digital.

## Problema que resuelve
Constructores no pueden ver el estado de múltiples obras simultáneamente.

## Estado actual
```
🟡 MVP BASE | Sprint 01 | CRUD + dashboard individual implementados
```

## Funcionalidades MVP
- CRUD de proyectos (cliente, ubicación, fechas, presupuesto GTQ)
- Dashboard: % avance, gastado vs pendiente
- Lista multi-proyecto con filtros
- Vista individual con tabs (resumen, materiales, pagos, cronograma)

## API Routes
```
GET/POST   /api/projects
GET/PATCH  /api/projects/[id]
GET        /api/projects/[id]/summary
```

## Tablas
`projects`, `clients`, `stages` (lectura básica en MVP)

## Criterio de finalización
- [x] Constructor crea y edita proyectos
- [x] Dashboard muestra métricas en tiempo real (avance, presupuesto, anticipo)
- [ ] RLS: org A no ve proyectos de org B (tests automáticos — Sprint 02)
