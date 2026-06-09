# CONSTRUCTA — Punto de Entrada
> Leer este archivo si es tu primera sesión o un chat nuevo.

---

## Protocolo de inicio (copiar al chat)

```
CONTEXTO — CONSTRUCTA
Lee en orden:
1. docs/PROJECT_OVERVIEW.md
2. docs/CURRENT_STATE.md
3. docs/[archivo del trabajo de hoy]

Stack: Next.js 14 + Supabase + Claude API + Expo
Moneda: GTQ · Idioma: Español guatemalteco
Tarea de hoy: [especificar]
```

---

## Mapa de documentos

| Archivo | Cuándo leer | ~Tokens |
|---|---|---|
| `PROJECT_OVERVIEW.md` | **Siempre primero** | 600 |
| `CURRENT_STATE.md` | **Siempre segundo** | 400 |
| `ARCHITECTURE.md` | Backend, infra, repo | 800 |
| `ENGINEERING_RULES.md` | Antes de escribir código | 700 |
| `DATABASE_SCHEMA.md` | Trabajo de BD | 900 |
| `AI_SYSTEM.md` | IA, reportes, WhatsApp | 700 |
| `ROADMAP.md` | Planificación, sprints | 800 |
| `TOKEN_STRATEGY.md` | Protocolo de chats | 500 |
| `FEATURES/*.md` | Módulo específico | 300–500 |
| `archive/sprint-*.md` | Contexto histórico | 400 |

---

## Estructura del repositorio (objetivo)

```
constructa/
├── apps/web/          # Next.js 14
├── apps/mobile/       # Expo
├── packages/          # types, schemas, utils
├── supabase/          # migrations, functions
└── docs/              # MEMORIA DEL PROYECTO ← aquí
```

---

## Siguiente acción concreta

1. ~~Crear monorepo pnpm + `apps/web`~~ ✅
2. **Supabase Cloud:** seguir `docs/SUPABASE_CLOUD.md` → `pnpm db:login` → `db:link` → `db:push`
3. Sprint 01: Auth + módulo Proyectos
4. Validar con 5 constructores antes de más código
