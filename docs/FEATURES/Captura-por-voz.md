# Módulo 13 — Captura por Voz
> Nota de voz → transcripción → clasificación automática.

## Estado actual
```
⏸️ DIFERIDO | Post-MVP | Plan: Empresa | Requiere app móvil Expo
```
> Decisión 2026-06-10: pospuesto junto con WhatsApp; depende de app móvil.

## Funcionalidades
- Grabación en app móvil (Expo)
- Transcripción: Whisper API (`language: 'es'`)
- Mismo pipeline de extracción que WhatsApp (Claude)
- Cola offline para señal limitada

## API Routes
```
POST   /api/voice/transcribe
POST   /api/voice/process
```

## Ver también
`AI_SYSTEM.md` → Procesamiento de voz

## Criterio de finalización
- [ ] Voz transcrita y registrada en BD correctamente
- [ ] Funciona con conexión intermitente (cola local)
