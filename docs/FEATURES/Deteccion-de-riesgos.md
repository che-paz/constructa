# Módulo 14 — Detección de Riesgos
> IA alerta antes de que sea crisis.

## Estado actual
```
🔲 NO INICIADO | Sprint 08 (Beta) | Plan: Empresa
```

## Triggers automáticos
- Consumo material > 20% sobre esperado
- Etapa > 5 días atrasada sin actualización
- Gasto > 80% presupuesto con < 70% avance
- Pago pendiente > 30 días

## Funcionalidades
- Job diario/semanal de análisis (Edge Function / Inngest)
- Alertas en dashboard + notificación push
- Recomendación concreta vía Claude

## API Routes
```
GET    /api/alerts?project=
POST   /api/alerts/analyze  (cron interno)
```

## Ver también
`AI_SYSTEM.md` → caso de uso #4

## Criterio de finalización
- [ ] Alertas generadas automáticamente sin intervención manual
- [ ] Predicción de sobrecosto con fecha estimada
