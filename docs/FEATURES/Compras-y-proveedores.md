# Módulo 09 — Compras y Proveedores
> Directorio de ferreterías y historial de precios.

## Estado actual
```
🔲 NO INICIADO | Sprint 08 (Beta) | Plan: Profesional+
```

## Funcionalidades MVP (Beta)
- CRUD proveedores (ferretería, transporte, contratista)
- Historial de precios por producto
- Registro de facturas vinculadas a compras de materiales

## API Routes
```
GET/POST   /api/suppliers
GET        /api/suppliers/[id]/price-history
```

## Tablas
`suppliers` (vinculado a `material_entries`)

## IA (post-MVP)
> "Ferretería A vende cemento 8% más barato que Ferretería B."

## Criterio de finalización
- [ ] Directorio de proveedores funcional
- [ ] Compras vinculadas a facturas en Storage
