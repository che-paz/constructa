# Feedback beta — 2ª reunión de validación con constructor
> **Fecha:** 2026-06-15  
> **Entorno:** Producción — https://constructa-nine.vercel.app  
> **Contexto:** Validación post-Sprint 07 (planilla jornal/contrato, adelantos, IA materiales)

---

## Resumen ejecutivo

La segunda reunión confirmó que el Sprint 07 cubrió la base de planilla, pero expuso **huecos de UX críticos**: no hay acción de cierre semanal, los adelantos excedentes no se arrastran, y varios flujos (materiales, cronograma) confunden al usuario. Además surgieron requerimientos de **edición**, **reorganización de navegación** y **administración de empresa** para la beta cerrada.

---

## 1. Planilla semanal — cierre y lógica de pago

### 1.1 ¿Dónde registro el pago al cierre de semana?

**Problema:** La planilla muestra bruto / adelantos / neto pero es solo lectura. El único punto de marcar pago es el checkbox “Pagado el mismo día” al registrar asistencia.

**Decisión:** Botón **“Cerrar semana”** en la planilla que:
- Marca `is_paid = true` en asistencias pendientes de la semana
- Marca `is_deducted = true` en adelantos de la semana
- Actualiza saldo arrastrado (§1.2)

**Sprint:** 07b — P0

---

### 1.2 Adelanto que supera el pago semanal

**Problema:** Si adelantos > bruto, `net_amount` queda negativo y la UI muestra “Pagado” sin registrar deuda para la semana siguiente.

**Ejemplo:** Bruto Q400, adelanto Q600 → Q200 pendientes de descontar la próxima semana.

**Decisión:** Tabla `worker_payroll_balances` con `balance_forward` por proyecto + trabajador.

```
neto_a_pagar     = max(0, bruto − adelantos − pagado − saldo_anterior)
saldo_siguiente  = max(0, saldo_anterior + adelantos + pagado − bruto)
```

**Sprint:** 07b — P0

---

## 2. Materiales — consumo simplificado

**Solicitud:** Al registrar **consumo**, no pedir precio unitario, No. de factura ni archivo (ya capturados en la compra).

**Decisión:** Formulario adaptativo — campos de facturación solo en tipo `purchase`.

**Sprint:** 07b — P1

---

## 3. Cronograma — porcentaje y retrasos

**Problema:** El constructor no entiende qué hace el % ni “Marcar retraso”, ni cómo extender plazos.

**Estado actual:**
- `%` → actualiza `progress_pct` manualmente
- “Marcar retraso” → cambia status sin pedir nueva fecha ni motivo

**Decisión:**
- Diálogo al marcar retraso: **nueva fecha fin** + **motivo**
- Actualizar `planned_end` (no `actual_end`)
- Texto de ayuda en la sección

**Sprint:** 07b — P1

---

## 4. Portal del cliente — QR

**Solicitud:** Generar imagen QR en lugar de solo mostrar el enlace.

**Decisión:** QR descargable del URL `/client/{token}` en pestaña Cliente.

**Sprint:** 08a — P2

---

## 5. Edición de registros

**Solicitud:** Etapas, presupuestos por etapa, movimientos de material, empleados, asistencias y adelantos deben ser editables.

**Estado actual:** Mayoría solo creación; edición parcial en trabajadores y etapas.

**Sprint:** 08a — P2 (CRUD transversal)

---

## 6. Catálogo y personal independientes del proyecto

**Solicitud:** Carga de catálogo de materiales y personal de empresa en secciones propias, no dentro de cada proyecto.

**Decisión:** Nuevas rutas `/materials` (catálogo org) y `/personal` (trabajadores org) en sidebar.

**Sprint:** 08a — P2

---

## 7. Administración de empresa

**Solicitud:** Cambiar nombre, logo, usuarios y privilegios.

**Estado:** BD tiene `organizations.logo_url` y `user_organizations.role`; falta UI `/settings`.

**Sprint:** 08b — P1 (continúa R6/R7 de 1ª reunión)

---

## Trazabilidad

| # | Requerimiento | Prioridad | Sprint | Estado |
|---|---|---|---|---|
| R9 | Cerrar semana / marcar pagada | Alta | 07b | ✅ Hecho |
| R10 | Saldo arrastrado por adelanto excesivo | Alta | 07b | ✅ Hecho |
| R11 | Consumo sin precio/factura/archivo | Media | 07b | ✅ Hecho |
| R12 | Cronograma: retraso con nueva fecha | Media | 07b | ✅ Hecho |
| R13 | QR portal cliente | Media | 08a | ✅ Hecho |
| R14 | Editar etapas, materiales, personal | Media | 08a | ✅ Hecho |
| R15 | Nav independiente catálogo + personal | Media | 08a | ✅ Hecho |
| R16 | Settings empresa + usuarios | Alta | 08b | ✅ Hecho |

**Origen 1ª reunión (Sprint 07):** R1–R5 ✅ completados · R6–R8 → Sprint 08b
