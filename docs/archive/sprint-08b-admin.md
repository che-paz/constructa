# Sprint 08b — Administración de empresa

**Estado:** ✅ COMPLETADO  
**Origen:** `FEEDBACK/beta-constructor-2026-06-12.md` R6–R7 + `2026-06-15.md` R16

---

## Objetivo

Pantalla de configuración de organización: datos, logo, contraseña, usuarios y roles.

---

## Tareas

```
- [x] Ruta /settings con tabs: Empresa | Cuenta | Usuarios
- [x] PATCH organizations (name, logo_url upload)
- [x] Cambio de contraseña (Supabase Auth)
- [x] Listar / invitar usuarios de la org
- [x] Asignar role: constructor | supervisor | oficina | contador
- [x] Middleware básico de permisos por rol (lectura vs escritura)
```

**Entregables:**
- `app/(dashboard)/settings/page.tsx`
- APIs: `/api/organizations/current`, `/api/organizations/logo/upload`, `/api/organizations/members`
- `lib/auth/permissions.ts` + guards en rutas de mutación
- Migración `20250615110001_org_logos_storage.sql`

**Estimación:** ~1 semana
