# Módulo 11 — Asistente IA Constructor
> Consulta toda la empresa en lenguaje natural.

## Estado actual
```
🟡 MVP + MEJORA CONTEXTO | Sprint 06 ✅ → Sprint 07 🔲 | Plan: Profesional+
```

## Funcionalidades
- Chat interface con streaming en `/assistant`
- Consultas: gastos, atrasos, materiales, pagos
- Solo lectura (nunca escribe a BD directamente)
- Historial por sesión en `ai_conversations`
- Rate limit 100 req/hora + quota por plan

## Mejora Sprint 07 — consultas de materiales por periodo

**Problema beta:** Preguntas como “¿cuánto cemento usé esta semana?” recibían totales genéricos porque el contexto solo incluía resumen acumulado (`buildMaterialSummary`), sin movimientos fechados ni agregación semanal.

**Solución:**
- Inyectar movimientos de material recientes (fecha, cantidad, unidad, costo, etapa).
- Agregar bloque `materiales_semana_actual` al JSON de contexto.
- Ajustar system prompt para usar esos datos antes de responder “no tengo detalle”.

**Respuesta objetivo:**
> “El total de cemento utilizado esta semana es de 1 bolsa con un costo de Q810.00 utilizados en la etapa de cimentación.”

## API Routes
```
POST   /api/ai/chat          (streaming SSE)
GET    /api/ai/conversations
```

## Ver también
`AI_SYSTEM.md` → caso de uso #1, system prompt, quotas  
`FEEDBACK/beta-constructor-2026-06-12.md` → §2

## Criterio de finalización
- [x] Responde consultas generales de gastos y avance
- [x] Rate limit 100 req/hora por org
- [x] Respuesta en español guatemalteco
- [ ] Responde consumo de material específico por semana con cantidad, costo y etapa (Sprint 07)
