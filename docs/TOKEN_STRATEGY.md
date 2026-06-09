# TOKEN_STRATEGY.md
> Estrategia de optimización de tokens y gestión de memoria del proyecto.  
> Leer una vez. Aplicar siempre.

---

## El problema que resuelve esta estrategia

Los chats largos con Claude tienen tres problemas:
1. **Degradación de contexto:** la información de hace 50 mensajes se "olvida"
2. **Costo de tokens:** contexto acumulado = más tokens = más costo
3. **Pérdida de coherencia:** decisiones tomadas antes se contradicen después

La solución: **la documentación es la memoria, no el chat.**

---

## Protocolo de inicio de chat (SIEMPRE)

Al comenzar cualquier sesión de trabajo con Claude, pegar este bloque:

```
CONTEXTO DEL PROYECTO — CONSTRUCTA
Lee estos archivos en orden antes de responder:
1. docs/PROJECT_OVERVIEW.md (contexto general)
2. docs/CURRENT_STATE.md (dónde estamos ahora)
3. docs/[archivo específico del trabajo de hoy]

Proyecto: CONSTRUCTA — SaaS para constructores guatemaltecos
Stack: Next.js 14 + Supabase + Claude API + React Native (Expo)
Moneda: Quetzales (GTQ)
Idioma del producto: Español guatemalteco
```

**¿Por qué solo 2–3 archivos?** Cada archivo tiene ~500–800 tokens. Leer todos los docs = ~7,000 tokens innecesarios. Leer solo los relevantes = ~1,500 tokens.

---

## Qué documentos leer según el trabajo

| Tipo de trabajo | Archivos a leer |
|---|---|
| **Inicio de sesión nueva (siempre)** | `PROJECT_OVERVIEW.md` + `CURRENT_STATE.md` |
| **Diseño de base de datos** | + `DATABASE_SCHEMA.md` + `ARCHITECTURE.md` |
| **Escribir código backend** | + `ENGINEERING_RULES.md` + `DATABASE_SCHEMA.md` |
| **Trabajar en módulo específico** | + `FEATURES/[nombre].md` |
| **Trabajo de IA/Claude API** | + `AI_SYSTEM.md` |
| **Planificar siguiente sprint** | + `ROADMAP.md` + `archive/sprint-ultimo.md` |
| **Fix de bug** | + `CURRENT_STATE.md` + archivo del módulo afectado |

---

## Cuándo crear un nuevo chat

Crear un chat nuevo cuando:

1. **Se completa un sprint** → archivar en `docs/archive/sprint-XX.md`
2. **El chat supera 30 mensajes** → empezar nuevo con contexto documentado
3. **Se cambia de dominio** (de DB a UI, de backend a IA) → chat fresco
4. **Se toma una decisión arquitectónica importante** → documentar y nuevo chat
5. **Hay confusión o contradicción** en las respuestas → señal de contexto degradado

**Regla de oro:** Si necesitas scrollear más de 2 pantallas para recordar algo, el contexto está demasiado largo. Documenta y empieza chat nuevo.

---

## Protocolo de cierre de chat

Antes de terminar cualquier sesión de trabajo, hacer esto:

### 1. Actualizar `CURRENT_STATE.md`
```
- Última sesión: [fecha] — [qué se hizo en 1 línea]
- Tareas completadas: [marcar ✅]
- Próxima tarea inmediata: [1 tarea concreta]
- Decisiones técnicas nuevas: [si las hay]
```

### 2. Actualizar el feature file si se trabajó en un módulo
```
docs/FEATURES/[modulo].md → sección "Estado actual"
```

### 3. Si se completó un sprint
Crear `docs/archive/sprint-XX.md` con este template:

```markdown
# Sprint XX — [Nombre]
**Período:** [fechas]
**Estado:** COMPLETADO

## Qué se construyó
- [Lista de features terminadas]

## Decisiones técnicas tomadas
- [Decisión]: [Razón]

## Problemas encontrados y soluciones
- [Problema]: [Solución]

## Métricas
- Tareas completadas: X/Y
- Deuda técnica identificada: [si hay]

## Próximo sprint
- Objetivo: [objetivo del sprint siguiente]
- Primera tarea: [tarea concreta para empezar]
```

---

## Cómo reducir tokens en un chat activo

### Técnica 1: Prompt de referencia corto
En lugar de explicar todo el proyecto de nuevo, pegar solo lo relevante:

```
CONTEXTO RÁPIDO:
- Módulo: Control de Materiales (Módulo 03)
- Estado: Tengo el schema de BD listo, necesito la API route
- Stack: Next.js 14 App Router, Supabase, TypeScript, Zod
- Patrón: Ver ENGINEERING_RULES.md (auth → validar → BD → return)
- Tabla: material_entries (ver DATABASE_SCHEMA.md)
```

### Técnica 2: Preguntas específicas, no abiertas
```
❌ MAL: "¿Cómo hago el módulo de materiales?"
✅ BIEN: "Necesito la API route POST /api/materials/entries. 
         Validar: project_id (uuid), material_id (uuid), quantity (number+), 
         entry_type ('purchase'|'consumption'|'loss').
         Seguir patrón de ENGINEERING_RULES.md."
```

### Técnica 3: Código primero, preguntas después
```
❌ MAL: Pedir a Claude que piense y proponga
✅ BIEN: Dar el código que tienes, pedir una mejora específica
```

### Técnica 4: Un problema por chat
Cada chat resuelve UNA cosa:
- Un componente
- Una API route
- Un diseño de schema
- Un bug específico

---

## Template de inicio de chat para cada tipo de trabajo

### Para código (backend)
```
Proyecto CONSTRUCTA — SaaS construcción guatemalteca
Stack: Next.js 14 + TypeScript + Supabase + Zod

Necesito: [descripción específica]
Tabla involucrada: [nombre]
Validaciones requeridas: [lista]
Patrón a seguir: auth → validate → query → return

ENGINEERING_RULES clave:
- TypeScript strict, sin any
- Zod en todas las entradas
- Soft delete (deleted_at)
- organization_id en todo
```

### Para UI/componentes
```
Proyecto CONSTRUCTA — SaaS construcción guatemalteca
Stack: Next.js 14 + Tailwind CSS + shadcn/ui + TypeScript

Necesito: [componente específico]
Datos que recibe: [props]
Acciones que hace: [callbacks]
Diseño: oscuro, azul (#1E6FBA) + ámbar (#F5A623), profesional industrial
```

### Para IA/Claude API
```
Proyecto CONSTRUCTA — Sistema IA para constructores GT
Stack: Anthropic API (claude-sonnet-4-20250514) + Next.js

Contexto del módulo: [qué módulo de IA]
Leer AI_SYSTEM.md para patrones y límites
Idioma target: español guatemalteco
Rate limiting: 100 req/hora por organización
```

### Para base de datos
```
Proyecto CONSTRUCTA — Multi-tenant SaaS (Supabase/PostgreSQL)
Multitenancy: Row Level Security con organization_id

Necesito: [tabla o query específica]
Leer DATABASE_SCHEMA.md para contexto
Reglas: soft delete, timestamps, UUIDs, RLS en toda tabla nueva
```

---

## Jerarquía de documentos por frecuencia de lectura

```
ALTA (leer en casi todo chat):
├── PROJECT_OVERVIEW.md    (~600 tokens)
└── CURRENT_STATE.md       (~400 tokens)

MEDIA (leer cuando aplica):
├── ARCHITECTURE.md        (~800 tokens)
├── ENGINEERING_RULES.md   (~700 tokens)
├── DATABASE_SCHEMA.md     (~900 tokens)
├── AI_SYSTEM.md           (~700 tokens)
└── ROADMAP.md             (~800 tokens)

BAJA (leer por módulo específico):
└── FEATURES/*.md          (~300-500 tokens cada uno)

ARCHIVO (leer solo para contexto histórico):
└── archive/sprint-*.md    (~400 tokens cada uno)
```

**Costo máximo de contexto inicial bien usado:** ~2,000 tokens  
**Costo de un chat largo sin documentación:** ~15,000–30,000 tokens

---

## Señales de que el chat necesita ser reiniciado

- Claude "olvida" decisiones tomadas antes en el mismo chat
- Las respuestas se vuelven genéricas y no específicas al proyecto
- Hay contradicciones con el stack o convenciones establecidas
- El chat lleva más de 45 minutos de trabajo continuo
- Se están discutiendo más de 2 módulos diferentes

**Acción:** Parar, documentar el estado, crear chat nuevo con el protocolo de inicio.
