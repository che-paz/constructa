# Sprint 07 — Feedback beta: Planilla + IA materiales

**Estado:** 🔲 EN CURSO  
**Fecha inicio:** 2026-06-12  
**Origen:** Reunión de uso con constructor en producción — ver `FEEDBACK/beta-constructor-2026-06-12.md`  
**Rama de trabajo:** `feat/planilla-pagos`  
**Acuerdo con cliente:** Constructor **no usa planilla** durante este sprint; resto de módulos activos.

---

## Objetivo

Adaptar el Módulo 04 a la operación real de constructores guatemaltecos: múltiples formas de pago, adelantos descontables y planilla semanal como herramienta de cierre. Corregir el Asistente IA para consultas granulares de materiales por periodo.

---

## Fase A — Modelo de datos (migración aditiva)

> **Regla:** Migraciones compatibles hacia atrás. No borrar columnas existentes.

**Estado: ✅ COMPLETADO** (2026-06-12)

### A.1 Tabla `workers` ✅

```sql
ALTER TABLE workers
  ADD COLUMN payment_type TEXT NOT NULL DEFAULT 'daily'
    CHECK (payment_type IN ('daily', 'contract'));
```

- Migración aplicada: `20250612100001_payroll_payment_types_and_advances.sql`
- Types + schemas actualizados en `packages/types`, `packages/schemas`

### A.2 Tabla `worker_advances` (nueva) ✅

Ver DDL en migración. RLS `org_isolation` + índices por proyecto/semana y trabajador/fecha.

### A.3 Tabla `worker_attendance` ✅

Sin cambios de esquema (monto manual y notas ya existen).

---

## Fase B — Backend y lógica

**Estado: ✅ COMPLETADO** (2026-06-12)

| # | Tarea | Estado |
|---|---|---|
| B1 | Schemas Zod (payment_type, adelantos, monto manual) | ✅ |
| B2 | Types extendidos | ✅ (Fase A) |
| B3 | API advances CRUD | ✅ |
| B4 | Payroll con adelantos y neto | ✅ |
| B5 | Attendance POST contrato vs jornal | ✅ |
| B6 | Workers POST/PATCH normalización | ✅ |

### Rutas nuevas

```
GET/POST   /api/projects/[id]/advances?week=
PATCH      /api/advances/[id]
DELETE     /api/advances/[id]
```

### Archivos clave

- `apps/web/app/api/projects/[id]/advances/route.ts`
- `apps/web/app/api/advances/[id]/route.ts`
- `apps/web/lib/workers/attendance.ts` — `validateContractAttendance`
- `apps/web/lib/workers/worker-payload.ts` — `normalizeWorkerPayload`

### Cálculo planilla semanal (nuevo)

```
bruto_semanal     = Σ amount_paid por días con asistencia
adelantos_semana  = Σ worker_advances WHERE week_start = semana AND NOT is_deducted
pagado_en_semana  = Σ amount_paid WHERE is_paid = true
neto_a_pagar      = bruto_semanal - adelantos_semana - pagado_en_semana
```

---

## Fase C — UI

**Estado: ✅ COMPLETADO** (2026-06-12)

| # | Tarea | Componente |
|---|---|---|
| C1 | Selector forma de pago | `worker-form.tsx` ✅ |
| C2 | Especialidad “Otra” + texto libre | `worker-form.tsx` ✅ |
| C3 | Asistencia adaptativa jornal/contrato | `attendance-form.tsx` ✅ |
| C4 | Registrar adelanto | `advance-form.tsx` ✅ |
| C5 | Planilla: adelantos, neto, pagado el día | `payroll-table.tsx` ✅ |
| C6 | Historial con adelantos | `worker-history.tsx` ✅ |
| C7 | Copy y lista con tipo de pago | `workers-section.tsx`, `worker-list.tsx` ✅ |

### Mockup lógico — formulario asistencia

**Jornal diario** (sin cambios):
- Trabajador, fecha, entrada, salida, tipo jornada, marcar pagado.

**Por contrato:**
- Trabajador, fecha, **Monto del día (GTQ)**, **Trabajo realizado** (nota), marcar pagado.
- Entrada/salida colapsadas como opcionales.

---

**Estado: ✅ COMPLETADO** (2026-06-12)

| # | Tarea | Archivo |
|---|---|---|
| D1 | Entradas de material con fecha y etapa | `lib/ai/context.ts` ✅ |
| D2 | Bloque `materiales_por_semana` en contexto | `lib/ai/material-context.ts` ✅ |
| D3 | System prompt: usar desglose antes de negar | `lib/ai/prompts.ts` ✅ |
| D4 | Tests agregación semanal de cemento | `tests/ai/context.test.ts` ✅ |

---

## Fase E — Tests y verificación

```bash
pnpm test                    # RLS worker_advances + payroll con adelantos
pnpm dev:3001                # flujo manual jornal + contrato + adelanto
```

**Checklist manual pre-deploy:**
- [ ] Crear trabajador jornal → asistencia calcula monto automático
- [ ] Crear trabajador contrato → asistencia exige monto + nota
- [ ] Especialidad custom guardada y visible en lista
- [ ] Adelanto mid-week aparece en planilla y reduce neto
- [ ] Día marcado “pagado” no suma a pendiente al cierre
- [ ] IA responde consumo de cemento de la semana con etapa
- [ ] Datos existentes del constructor intactos post-migración

---

## Fuera de alcance (Sprint 08+)

- PDF planilla semanal exportable
- QR asistencia
- Roles y permisos por pantalla
- Pantalla configuración empresa / cambio contraseña
- PDF portal cliente con membrete y colores de marca

---

## Orden de implementación recomendado

```
1. Migración workers.payment_type + worker_advances
2. Schemas + types + API advances
3. Worker form (payment_type + specialty custom)
4. Attendance form adaptativo
5. Payroll con adelantos
6. IA contexto materiales
7. Tests + deploy prod (ventana acordada con constructor)
```

**Estimación:** 3–5 días de desarrollo + 1 sesión de validación con constructor.

---

## Deploy

1. Backup Supabase (`workers`, `worker_attendance`).
2. `pnpm db:push` (migración aditiva).
3. Merge `feat/planilla-pagos` → `master`.
4. `npx vercel deploy --prod --yes` desde raíz del monorepo.
5. Avisar constructor: planilla reactivada; probar juntos 15 min.
