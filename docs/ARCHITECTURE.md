# ARCHITECTURE.md
> Arquitectura técnica completa de CONSTRUCTA.  
> Leer antes de cualquier trabajo de backend, base de datos o infraestructura.

---

## Visión general del sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTES                             │
│  Browser (Next.js)   App Móvil (RN/Expo)   WhatsApp Bot     │
└──────────────┬──────────────┬─────────────────┬────────────┘
               │              │                 │
               ▼              ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (Next.js)                       │
│  /api/projects  /api/materials  /api/payments  /api/ai      │
│  /api/webhooks/whatsapp    /api/reports    /api/workers      │
└──────────────────────────┬──────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Supabase   │  │  Claude API  │  │  External    │
│  PostgreSQL  │  │  (Anthropic) │  │  Services    │
│  Auth        │  │  claude-     │  │  WhatsApp    │
│  Storage     │  │  sonnet-4    │  │  Whisper API │
│  Realtime    │  │              │  │  Expo Push   │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## Stack completo

### Frontend Web
- **Framework:** Next.js 14 (App Router, Server Components)
- **Lenguaje:** TypeScript (strict mode)
- **Estilos:** Tailwind CSS + shadcn/ui (componentes base)
- **Estado global:** Zustand (ligero) o React Context para auth
- **Estado servidor:** TanStack Query (React Query)
- **Formularios:** React Hook Form + Zod (validación)
- **Gráficos:** Recharts
- **Tablas:** TanStack Table
- **Fechas:** date-fns
- **PDF viewer:** react-pdf

### App Móvil
- **Framework:** React Native con Expo (SDK 51+)
- **Navegación:** Expo Router
- **Comparte:** hooks, tipos, esquemas Zod, utils con web
- **Storage offline:** MMKV (react-native-mmkv)
- **Cámara:** expo-camera
- **Notificaciones:** expo-notifications

### Backend (API)
- **Runtime:** Next.js API Routes (Edge cuando aplique)
- **Validación:** Zod en todas las entradas
- **Auth middleware:** Supabase Auth + JWT
- **Rate limiting:** Upstash Redis (para endpoints de IA)
- **Background jobs:** Supabase Edge Functions o Inngest

### Base de datos
- **Motor:** PostgreSQL via Supabase
- **ORM:** Prisma (type-safety, migrations)
- **Multitenancy:** Row Level Security (RLS) en Supabase
- **Búsqueda:** PostgreSQL full-text search (español)
- **Archivos:** Supabase Storage (fotos de obra, facturas, PDF)

### IA
- **Modelo:** claude-sonnet-4-20250514 (Anthropic)
- **Streaming:** sí, para respuestas largas
- **Contexto:** datos del tenant inyectados en system prompt
- **Rate limiting:** por organización (tenant)

### Infraestructura
- **Frontend hosting:** Vercel
- **Base de datos:** Supabase Cloud (región más cercana: us-east-1 o sao-paulo)
- **CDN assets:** Vercel Edge Network
- **Monitoring:** Vercel Analytics + Sentry
- **Logs:** Axiom o Logtail
- **CI/CD:** GitHub Actions → Vercel auto-deploy

---

## Multitenancy: modelo de aislamiento

CONSTRUCTA usa **Row Level Security (RLS)** de Supabase como estrategia principal.

```sql
-- Cada tabla tiene organization_id
-- RLS policy example:
CREATE POLICY "Users can only see their org data"
ON projects
FOR ALL
USING (organization_id = auth.jwt() ->> 'organization_id');
```

**Modelo de tenant:**
- 1 organización = 1 empresa constructora
- Usuarios pertenecen a 1 organización
- Datos completamente aislados por `organization_id`
- NO compartimos schemas (single-schema multitenant con RLS)

---

## Estructura del repositorio (monorepo)

```
constructa/
├── apps/
│   ├── web/                    # Next.js app
│   │   ├── app/               # App Router
│   │   │   ├── (auth)/        # Login, signup
│   │   │   ├── (dashboard)/   # App principal
│   │   │   │   ├── projects/
│   │   │   │   ├── materials/
│   │   │   │   ├── workers/
│   │   │   │   ├── payments/
│   │   │   │   └── reports/
│   │   │   ├── client/        # Portal del cliente (public)
│   │   │   └── api/           # API routes
│   │   ├── components/
│   │   │   ├── ui/            # shadcn components
│   │   │   ├── modules/       # Feature components
│   │   │   └── shared/        # Layout, nav, etc
│   │   └── lib/
│   │       ├── supabase/
│   │       ├── ai/
│   │       └── utils/
│   └── mobile/                 # Expo app
│       ├── app/               # Expo Router
│       ├── components/
│       └── lib/               # Shared con web via packages/
├── packages/
│   ├── types/                  # Tipos TypeScript compartidos
│   ├── schemas/                # Zod schemas compartidos
│   └── utils/                  # Utilidades compartidas
├── supabase/
│   ├── migrations/             # SQL migrations
│   ├── functions/              # Edge functions
│   └── seed.sql               # Datos de prueba
├── docs/                       # Esta carpeta
└── package.json               # Workspace root (pnpm)
```

---

## Flujo de autenticación

```
Usuario → login form → Supabase Auth → JWT con { userId, orgId, role }
                                         ↓
                              Middleware Next.js verifica JWT
                                         ↓
                              API routes usan orgId para RLS
```

**Roles en JWT custom claims:**
```json
{
  "sub": "uuid-del-usuario",
  "organization_id": "uuid-de-la-org",
  "role": "constructor | supervisor | oficina | cliente | contador"
}
```

---

## Flujo WhatsApp (Módulo 12)

```
Supervisor → WhatsApp mensaje
     ↓
Meta Cloud API → Webhook → /api/webhooks/whatsapp
     ↓
Claude API procesa el mensaje en contexto del proyecto activo
     ↓
Extrae: tipo (material/asistencia/avance/incidente)
     ↓
Escribe a base de datos con organization_id correcto
     ↓
Responde confirmación al supervisor vía WhatsApp
```

---

## Flujo generación de reportes PDF

```
Usuario solicita reporte → API /api/reports/generate
     ↓
Consulta Supabase: materiales + personal + pagos + fotos
     ↓
Claude API genera narrativa en español
     ↓
React-PDF renderiza template con datos + narrativa
     ↓
PDF guardado en Supabase Storage
     ↓
URL firmada devuelta al frontend
```

---

## Decisiones de seguridad

- Todos los endpoints requieren JWT válido
- RLS como segunda capa (defense in depth)
- Supabase Storage con políticas por organización
- Variables de entorno: nunca en cliente, solo servidor
- API keys de terceros: solo en Edge Functions o server-side
- Rate limiting en endpoints de IA: 100 req/hora por organización

---

## Performance targets

- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Dashboard carga inicial: < 2s (con Server Components)
- API response p95: < 500ms
- Generación de PDF: < 10s
- Respuesta Asistente IA: streaming, primera palabra < 1s
