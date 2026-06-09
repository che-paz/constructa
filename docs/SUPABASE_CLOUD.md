# Supabase Cloud — Setup CONSTRUCTA

> **Flujo recomendado.** No requiere Docker. Las migraciones en `supabase/migrations/` se aplican al proyecto remoto.

---

## 1. Crear proyecto en Supabase

1. Ir a [supabase.com/dashboard](https://supabase.com/dashboard) e iniciar sesión.
2. **New project** → nombre: `constructa` (o similar).
3. **Región:** `South America (São Paulo)` — más cercana a Guatemala.
4. Guardar la **database password** (la necesitarás al vincular el CLI).
5. Esperar ~2 min a que el proyecto esté listo.

---

## 2. Obtener las API keys

En el dashboard: **Project Settings → API**

| Variable | Dónde copiarla |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL (`https://xxxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` `secret` — **nunca en el cliente** |

---

## 3. Configurar variables en la app

```bash
cp .env.example apps/web/.env.local
```

Editar `apps/web/.env.local` con los valores del dashboard:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 4. Vincular el CLI al proyecto remoto

> **Importante:** Copia **solo** la línea del comando. No copies texto después de `#` ni líneas de comentario — el shell los interpreta como argumentos y falla.

**Paso A — login (una vez):**

```bash
pnpm db:login
```

**Paso B — link (reemplaza `TU_PROJECT_REF`):**

```bash
pnpm exec supabase link --project-ref TU_PROJECT_REF
```

Te pedirá la **database password** que definiste al crear el proyecto.

El **project ref** también está en `NEXT_PUBLIC_SUPABASE_URL`:  
`https://TU_PROJECT_REF.supabase.co`

---

## 5. Aplicar migraciones al cloud

```bash
pnpm db:push
```

**Verificar:**

```bash
pnpm db:status
```

Esto ejecuta las 9 migraciones en orden:

- Extensions y helpers
- Identity (`organizations`, `user_organizations`)
- Clients y suppliers
- Projects y stages
- Materials
- Workers
- Financial
- Content (photos, reports, AI)
- Indexes y vistas

Verificar en el dashboard: **Database → Tables** — deben aparecer ~15 tablas con RLS activo.

---

## 6. Verificar en local

```bash
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000).

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `pnpm db:login` | Autenticar CLI con Supabase |
| `pnpm db:link` | Vincular repo al proyecto cloud |
| `pnpm db:push` | Aplicar migraciones al remoto |
| `pnpm db:status` | Ver migraciones locales vs remotas |
| `pnpm db:pull` | Traer schema remoto (si hubo cambios en dashboard) |
| `pnpm db:local:start` | Supabase local (opcional, requiere Docker) |

---

## Auth — redirect URLs (para Sprint 01)

En **Authentication → URL Configuration**:

| Campo | Valor desarrollo |
|---|---|
| Site URL | `http://localhost:3000` |
| Redirect URLs | `http://localhost:3000/**` |

Para producción (Vercel): agregar `https://tu-dominio.com/**`.

---

## Troubleshooting

### `Access token not provided` (después de `supabase login`)

El login por navegador a veces muestra *"You are now logged in"* pero **no guarda el token** (bug conocido con Keychain en macOS).

**Solución — token manual (recomendada):**

1. Abrir [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
2. **Generate new token** → nombre: `constructa-cli`
3. Copiar el token (empieza con `sbp_`)
4. En la terminal:

```bash
pnpm exec supabase login --token sbp_PEGAR_TOKEN_AQUI
```

5. Verificar que funcionó:

```bash
pnpm exec supabase projects list
```

Si ves tu proyecto `constructa`, ya puedes hacer `link` y `db:push`.

**Alternativa sin token de cuenta — solo contraseña de BD:**

Si solo quieres aplicar migraciones sin vincular el proyecto:

```bash
pnpm exec supabase db push --db-url "postgresql://postgres:TU_PASSWORD@db.TU_PROJECT_REF.supabase.co:5432/postgres"
```

Reemplaza `TU_PASSWORD` y `TU_PROJECT_REF`. Si la contraseña tiene caracteres especiales (`@`, `#`, `%`), codifícala en URL o usa comillas simples alrededor de la URL completa.

---

**`project not linked`**  
→ Ejecutar `pnpm exec supabase link --project-ref TU_PROJECT_REF` (requiere login con token válido).

**Migración falla por objeto existente**  
→ Revisar en **Database → Migrations** qué ya se aplicó. No editar migraciones ya pusheadas; crear una nueva con `supabase migration new nombre`.

**RLS bloquea inserts en desarrollo**  
→ Normal. El signup/onboarding (Sprint 01) usará `service_role` o políticas específicas de registro.

---

## CI/CD (futuro)

En GitHub Actions, usar `SUPABASE_ACCESS_TOKEN` + `SUPABASE_PROJECT_REF` para `supabase db push` en deploy a staging.
