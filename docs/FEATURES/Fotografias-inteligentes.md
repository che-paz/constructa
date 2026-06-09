# Módulo 08 — Fotografías Inteligentes
> IA clasifica, organiza y compara avance visual.

## Estado actual
```
🔲 NO INICIADO | Sprint 08 (Beta) | Plan: Profesional+
```

## Funcionalidades
- Upload desde web/móvil → Supabase Storage
- Clasificación por etapa (Claude Vision)
- Comparación avance real vs planificado
- Galería visible en portal del cliente

## API Routes
```
POST   /api/photos
GET    /api/projects/[id]/photos
POST   /api/photos/[id]/analyze  (IA)
```

## Tablas
`photos`

## Criterio de finalización
- [ ] Foto clasificada automáticamente por etapa
- [ ] Reporte fotográfico exportable
