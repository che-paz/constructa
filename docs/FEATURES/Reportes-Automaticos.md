# Módulo 07 — Reportes Automáticos
> La IA redacta. El PDF está listo.

## Estado actual
```
✅ COMPLETADO | Sprint 06 | Plan: Profesional+
```

## Funcionalidades
- Reporte semanal automático (avance, materiales, personal, gastos)
- Narrativa en español guatemalteco vía Claude
- Exportación PDF (React-PDF)
- Historial de reportes en dashboard de proyecto

## API Routes
```
POST   /api/reports/generate
GET    /api/projects/[id]/reports
GET    /api/reports/[id]/pdf
```

## Tablas
`reports`, `ai_usage_log`

## Ver también
`AI_SYSTEM.md` → caso de uso #3

## Criterio de finalización
- [x] Reporte generado en < 30 segundos
- [x] PDF descargable y compartible con cliente
