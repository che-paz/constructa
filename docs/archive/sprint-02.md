# Sprint 02 — Pagos + Portal del Cliente

**Estado:** ✅ COMPLETADO  
**Fecha:** 2026-06-09

## Objetivo

Constructor registra pagos con comprobante; cliente ve avance y pagos vía portal con token.

## Entregables

- [x] API CRUD pagos por proyecto
- [x] Upload comprobantes (Supabase Storage)
- [x] Saldo automático: anticipo − pagos
- [x] Portal `/client/[token]`
- [x] Tests RLS org A vs org B

## Rutas nuevas

```
GET/POST   /api/projects/[id]/payments
GET        /api/projects/[id]/payments/balance
POST       /api/projects/[id]/payments/upload
DELETE     /api/payments/[id]

/client/[token]
/client/[token]/payments
```

## Migraciones

- `20250609100009_storage_receipts.sql` — bucket `payment-receipts`

## Verificación

```bash
pnpm dev:3001
pnpm test
pnpm db:status
```

## Siguiente sprint

Sprint 03 — Materiales + Cronograma
