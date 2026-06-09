# CONSTRUCTA

Plataforma SaaS de gestión integral para constructores guatemaltecos.

## Stack

- **Frontend:** Next.js 14 + TypeScript + Tailwind + shadcn/ui
- **Backend:** Supabase Cloud (PostgreSQL + Auth + Storage + RLS)
- **Monorepo:** pnpm workspaces

## Estructura

```
constructa/
├── apps/web/          # Next.js app
├── packages/          # types, schemas, utils compartidos
├── supabase/          # migraciones SQL
└── docs/              # documentación del proyecto
```

## Requisitos

- Node.js 20+
- pnpm 9+
- Cuenta en [supabase.com](https://supabase.com) (gratis)

## Inicio rápido — Supabase Cloud

Guía completa: [`docs/SUPABASE_CLOUD.md`](docs/SUPABASE_CLOUD.md)

```bash
# 1. Dependencias
pnpm install

# 2. Variables de entorno (keys del dashboard de Supabase)
cp .env.example apps/web/.env.local
# Editar apps/web/.env.local con URL y keys

# 3. Vincular proyecto remoto y aplicar migraciones
pnpm db:login
pnpm exec supabase link --project-ref TU_PROJECT_REF
pnpm db:push

# 4. App web
pnpm dev              # http://localhost:3000
```

## Scripts

| Comando | Descripción |
|---|---|
| `pnpm dev` | Next.js en http://localhost:3000 |
| `pnpm build` | Build de producción |
| `pnpm db:login` | Autenticar CLI con Supabase |
| `pnpm db:link` | Vincular al proyecto cloud |
| `pnpm db:push` | Aplicar migraciones al remoto |
| `pnpm db:status` | Estado de migraciones |
| `pnpm db:local:start` | Supabase local (opcional, requiere Docker) |

## Documentación

- [`docs/START_HERE.md`](docs/START_HERE.md) — protocolo de sesiones
- [`docs/SUPABASE_CLOUD.md`](docs/SUPABASE_CLOUD.md) — setup Supabase online
- [`docs/CURRENT_STATE.md`](docs/CURRENT_STATE.md) — estado del proyecto
