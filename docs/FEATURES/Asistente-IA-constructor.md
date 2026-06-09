# Módulo 11 — Asistente IA Constructor
> Consulta toda la empresa en lenguaje natural.

## Estado actual
```
🔲 NO INICIADO | Sprint 06 | Plan: Profesional+
```

## Funcionalidades
- Chat interface con streaming
- Consultas: gastos, atrasos, materiales, pagos
- Solo lectura (nunca escribe a BD directamente)
- Historial por sesión en `ai_conversations`

## API Routes
```
POST   /api/ai/chat          (streaming)
GET    /api/ai/conversations
```

## Ver también
`AI_SYSTEM.md` → caso de uso #1, system prompt, quotas

## Criterio de finalización
- [ ] Responde "¿Cuánto gasté en hierro este mes?" correctamente
- [ ] Rate limit 100 req/hora por org
- [ ] Respuesta en español guatemalteco
