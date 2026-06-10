# Módulo 11 — Asistente IA Constructor
> Consulta toda la empresa en lenguaje natural.

## Estado actual
```
✅ COMPLETADO | Sprint 06 | Plan: Profesional+
```

## Funcionalidades
- Chat interface con streaming en `/assistant`
- Consultas: gastos, atrasos, materiales, pagos
- Solo lectura (nunca escribe a BD directamente)
- Historial por sesión en `ai_conversations`
- Rate limit 100 req/hora + quota por plan

## API Routes
```
POST   /api/ai/chat          (streaming SSE)
GET    /api/ai/conversations
```

## Ver también
`AI_SYSTEM.md` → caso de uso #1, system prompt, quotas

## Criterio de finalización
- [x] Responde "¿Cuánto gasté en hierro este mes?" correctamente
- [x] Rate limit 100 req/hora por org
- [x] Respuesta en español guatemalteco
