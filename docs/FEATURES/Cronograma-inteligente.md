# Módulo 02 — Cronograma Inteligente
> Planificación por etapas con seguimiento automático de retrasos.

## Problema que resuelve
Atrasos no detectados hasta que ya es crisis.

## Estado actual
```
🟡 MVP BASE | Sprint 03 ✅ | Depende: Módulo 01
```

## Funcionalidades MVP
- Etapas: cimentación, muros, eléctrico, techado (plantillas GT)
- Fecha prevista vs real por etapa
- Asignación de responsable
- Recálculo al marcar retraso
- Alerta visual si etapa > 5 días atrasada

## API Routes
```
GET/POST   /api/projects/[id]/stages
PATCH      /api/stages/[id]
GET        /api/projects/[id]/schedule/summary
```

## Tablas
`stages`

## IA (Fase 3)
> "El proyecto lleva 12 días de atraso respecto al cronograma."

## Criterio de finalización
- [ ] CRUD de etapas con orden
- [ ] Vista Gantt simplificada o timeline
- [ ] Indicador de días de atraso calculado automáticamente
