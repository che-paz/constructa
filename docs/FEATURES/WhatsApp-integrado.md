# Módulo 12 — WhatsApp Integrado
> Canal natural de adopción para supervisores de campo.

## Estado actual
```
⏸️ DIFERIDO | Post-beta | Plan: Profesional+ | Fuera de Sprint 06–07
```
> Decisión 2026-06-10: pospuesto hasta validar beta y aprobación Meta WhatsApp Business API.

## Funcionalidades
- Mensaje libre → inventario/ asistencia actualizados
- Confirmación automática al supervisor
- IA interpreta y clasifica (Claude)

## API Routes
```
POST   /api/webhooks/whatsapp   (Meta Cloud API)
GET    /api/webhooks/whatsapp   (verificación)
```

## Flujo
Ver `ARCHITECTURE.md` → Flujo WhatsApp

## Ejemplos
- "Hoy llegaron 50 bolsas de cemento" → `material_entries`
- "Juan Pérez trabajó hoy" → `worker_attendance`

## Criterio de finalización
- [ ] Supervisor reporta desde WhatsApp sin abrir app
- [ ] Respuesta < 3 segundos
- [ ] Log en `whatsapp_messages`
