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

## Mejora planificada — Sprint 08 (feedback beta)

PDF de resumen para el **portal del cliente** con:
- Colores y logo de la empresa (`organizations.logo_url`)
- Membrete personalizado
- Descripción de cada etapa del cronograma (no solo nombre y %)
- Basado en datos ya visibles en el portal + React-PDF

Ver `FEEDBACK/beta-constructor-2026-06-12.md` → §3.

## Criterio de finalización
- [x] Reporte generado en < 30 segundos
- [x] PDF descargable y compartible con cliente
- [ ] PDF portal con branding de empresa (Sprint 08)
