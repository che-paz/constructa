# Módulo 10 — Centro Financiero
> Vista global de toda la empresa constructora.

## Problema que resuelve
Presupuestos fuera de control sin visión consolidada.

## Estado actual
```
🔲 NO INICIADO | Sprint 05 | Depende: Módulos 01, 03, 04, 05
```

## Funcionalidades MVP
- Dashboard multi-proyecto
- Gasto real vs presupuesto
- Cuentas por cobrar
- Flujo de caja por proyecto
- Exportación Excel básica

## API Routes
```
GET   /api/finance/dashboard
GET   /api/finance/cashflow?period=
GET   /api/projects/[id]/financial-summary
```

## Vistas BD
`project_financial_summary` (ver DATABASE_SCHEMA.md)

## Criterio de finalización
- [ ] Constructor ve todos los proyectos en un panel
- [ ] Alertas cuando proyecto > 80% presupuesto con < 70% avance
