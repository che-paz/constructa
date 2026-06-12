# Deploy Vercel — CONSTRUCTA Beta

> Sesión: 2026-06-10 · Deploy inicial por CLI (GitHub conectado después)

---

## URL de producción

| Entorno | URL |
|---|---|
| **Production** | https://constructa-nine.vercel.app |
| Vercel Dashboard | https://vercel.com/paencima-2015s-projects/constructa |
| Proyecto | `constructa` (team: paencima-2015s-projects) |

---

## Configuración del monorepo

| Setting | Valor |
|---|---|
| Root Directory | `apps/web` |
| Framework | Next.js 14 |
| Install Command | `pnpm install` (desde raíz del monorepo) |
| Build Command | `pnpm build` |
| Node.js | >= 20 |
| `vercel.json` raíz | `/vercel.json` — install + build monorepo |

**Importante:** Desplegar siempre desde la **raíz del repo**, no desde `apps/web` solo:

```bash
cd /Users/ch3/Desktop/CONSTRUCTA
npx vercel deploy --prod --yes
```

---

## Variables de entorno (Vercel)

Configuradas en **Production** y **Preview** (sin secretos en este doc):

| Variable | Tipo | Notas |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | plain | Dashboard Supabase → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | plain | Clave `anon` pública |
| `SUPABASE_SERVICE_ROLE_KEY` | encrypted | Solo servidor — onboarding, RLS bypass |
| `ANTHROPIC_API_KEY` | encrypted | Solo servidor — IA + reportes |
| `NEXT_PUBLIC_APP_URL` | plain | `https://constructa-nine.vercel.app` |
| `CONSTRUCTA_DEFAULT_PLAN` | plain | `profesional` (orgs nuevas con IA habilitada) |

---

## Supabase Auth — producción

En **Authentication → URL Configuration** del proyecto Supabase (São Paulo):

| Campo | Valor |
|---|---|
| Site URL | `https://constructa-nine.vercel.app` |
| Redirect URLs | `https://constructa-nine.vercel.app/**` |

Mantener también localhost para desarrollo:

- `http://localhost:3001/**`

Ver `docs/SUPABASE_CLOUD.md`.

---

## Fix aplicado en deploy

- **Conflicto de rutas:** Eliminado `app/(dashboard)/page.tsx` — competía con `app/page.tsx` en `/` y rompía el build en Vercel (`page_client-reference-manifest.js` ENOENT).
- **`next.config.mjs`:** `experimental.outputFileTracingRoot` para monorepo pnpm.

---

## Conectar GitHub (pendiente)

1. Push del repo local a `github.com/TU_USUARIO/constructa`
2. Vercel → Project Settings → Git → Connect Repository
3. Root Directory ya está en `apps/web` — no cambiar
4. Auto-deploy en push a `master`/`main`

---

## Checklist beta (prueba real)

- [ ] Signup / login funciona
- [ ] Onboarding crea organización
- [ ] CRUD proyecto
- [ ] Materiales, personal, pagos, gastos
- [ ] Asistente IA responde (Anthropic con créditos)
- [ ] Reporte PDF se genera y descarga
- [ ] Portal cliente (link con `NEXT_PUBLIC_APP_URL` correcto)
- [ ] Org en plan profesional (`CONSTRUCTA_DEFAULT_PLAN=profesional`)
- [ ] Supabase Auth redirect URLs actualizadas

---

## PWA — Instalación en móvil

CONSTRUCTA es una **Progressive Web App** instalable. Stack: `@serwist/next` + `serwist` (no `next-pwa` legacy).

| Archivo | Propósito |
|---|---|
| `apps/web/public/manifest.webmanifest` | Manifest web (`display: standalone`, `lang: es-GT`) |
| `apps/web/public/icons/icon-192.png` | Icono 192×192 |
| `apps/web/public/icons/icon-512.png` | Icono 512×512 |
| `apps/web/app/sw.ts` | Service worker (cache mínimo + fallback offline) |
| `apps/web/public/sw.js` | Generado en build (no commitear) |
| `components/shared/pwa-install-banner.tsx` | Banner Android con `beforeinstallprompt` |
| `components/shared/service-worker-register.tsx` | Registro SW en cliente (solo producción) |

**Middleware:** `sw.js` y `manifest.webmanifest` están excluidos del matcher de auth (`middleware.ts`). `/~offline` es ruta pública para el fallback offline.

**Regenerar iconos placeholder:**

```bash
cd apps/web && node scripts/generate-pwa-icons.mjs
```

### Android — criterios de instalación

1. Abrir https://constructa-nine.vercel.app en **Chrome** (Android)
2. Menú ⋮ → debe aparecer **“Instalar app”** o **“Añadir a pantalla de inicio”**
3. El banner propio **“Instalar CONSTRUCTA”** aparece si Chrome dispara `beforeinstallprompt` (HTTPS + manifest + SW + iconos válidos)
4. Tras instalar, la app abre en **modo standalone** (sin barra del navegador)
5. **Login/signup** debe funcionar igual en la PWA instalada (cookies Supabase + redirect URLs)

### iOS (Safari) — sin popup automático

iOS no soporta `beforeinstallprompt`. Flujo manual:

1. Abrir la URL en **Safari**
2. Tocar el botón **Compartir** (cuadrado con flecha)
3. Elegir **“Agregar a pantalla de inicio”**
4. Confirmar nombre “CONSTRUCTA”

`appleWebApp` en `layout.tsx` mejora la experiencia al abrir desde el icono del home screen.

### Checklist post-deploy (Android)

- [ ] Chrome muestra “Instalar app” en menú ⋮
- [ ] Banner propio funciona con `beforeinstallprompt`
- [ ] App abre en standalone (sin barra del navegador)
- [ ] Login/signup sigue funcionando en PWA instalada
- [ ] Página `/~offline` visible sin conexión en navegación

---

## Comandos útiles

```bash
# Deploy producción (desde raíz del monorepo)
cd CONSTRUCTA && npx vercel deploy --prod --yes

# Ver env vars
cd CONSTRUCTA && npx vercel env ls

# Inspeccionar último deploy
npx vercel inspect constructa-nine.vercel.app
```
