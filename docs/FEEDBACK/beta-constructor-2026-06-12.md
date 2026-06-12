# Feedback beta — Reunión de uso con constructor
> **Fecha:** 2026-06-12  
> **Entorno:** Producción — https://constructa-nine.vercel.app  
> **Acuerdo operativo:** Constructor sigue usando el resto de la app; **pausa temporal en Personal / Planilla** mientras se implementan mejoras.

---

## Resumen ejecutivo

La beta en producción validó el flujo general (proyectos, materiales, pagos, gastos). Los cambios más urgentes concentran en **Módulo 04 — Control de Personal**: formas de pago distintas al jornal diario, especialidades personalizadas y registro de **adelantos** descontables al cierre de semana.

Items secundarios: **contexto del Asistente IA** para consultas granulares de materiales, y mejoras generales (roles, configuración de empresa, PDF del portal) planificadas para sprints posteriores.

---

## 1. Personal y planilla

### 1.1 Especialidad adicional

**Solicitud:** Poder agregar una especialidad que no esté en la lista fija (Albañil, Electricista, etc.).

**Estado actual:** La BD guarda `specialty` como `TEXT`, pero la UI y el schema Zod usan un enum cerrado de 8 opciones.

**Decisión propuesta:**
- Mantener lista común para selección rápida.
- Si el usuario elige **“Otra”**, mostrar campo de texto libre (`specialty_custom`).
- Persistir en `workers.specialty` el valor custom (prefijo `custom:` opcional, o texto directo).

---

### 1.2 Forma de pago: jornal diario vs. por contrato

**Solicitud:** No todos cobran jornal. Algunos trabajan **por contrato/tarea** (ej. pegar piso → cobran por metro o monto acordado). Al terminar el día se registra un **monto manual** y una **nota** del trabajo.

**Ejemplo real:**
> Hoy Luis Ramírez — Q500 según contrato: pegar piso

**Estado actual:**
- Todo trabajador tiene `daily_rate` (jornal GTQ).
- El monto se calcula automáticamente: `jornal × tipo de jornada`.
- No existe distinción de forma de pago.

**Decisión propuesta:**

| Campo / concepto | Jornal diario | Por contrato |
|---|---|---|
| `payment_type` | `daily` | `contract` |
| Jornal (`daily_rate`) | Requerido | Oculto / no aplica |
| Cálculo de monto | Automático (`calculateAttendanceAmount`) | Manual al registrar asistencia |
| Notas del día | Opcional | **Requerido** describir la tarea/contrato |
| Horas entrada/salida | Sí | Opcional (solo referencia) |

**Flujo por contrato:**
1. Al crear/editar trabajador → seleccionar “Por contrato”.
2. Al registrar asistencia del día → campo **Monto del día (GTQ)** + **Descripción del trabajo**.
3. Planilla semanal muestra el monto ingresado (no calculado por jornal).

**Flujo jornal diario:** Sin cambios respecto al MVP actual.

---

### 1.3 Pago semanal vs. pago el mismo día

**Solicitud:** Los constructores pagan normalmente **al final de la semana**, pero a veces pagan a alguien **el mismo día**. Necesitan ver ambos escenarios claramente en la planilla.

**Estado actual:**
- `worker_attendance.is_paid` por registro diario.
- Planilla muestra “Pagado” / “pend.” por trabajador agregado.
- Checkbox “Marcar como pagado” en formulario de asistencia.

**Decisión propuesta (mejora UX, sin cambio de modelo):**
- En planilla semanal, distinguir visualmente días pagados al momento vs. pendientes al cierre.
- Resumen de semana con tres totales:
  - **Bruto semanal** (suma de montos)
  - **Ya pagado en la semana** (días con `is_paid = true`)
  - **Pendiente al cierre** (bruto − adelantos − ya pagado)
- Acción “Marcar semana como pagada” para cerrar todos los días pendientes de un trabajador (opcional fase 2).

---

### 1.4 Adelantos de dinero (descuento al cierre de semana)

**Solicitud:** Los albañiles piden **adelantos entre semana** y se descuentan del pago del viernes/sábado. Es crítico llevar ese registro.

**Estado actual:** No existe tabla ni UI de adelantos a trabajadores. (Los “adelantos” del módulo 05 son pagos del **cliente** al constructor, no del constructor al personal.)

**Decisión propuesta:**

Nueva entidad **`worker_advances`**:

```sql
CREATE TABLE worker_advances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id      UUID NOT NULL REFERENCES projects(id),
  worker_id       UUID NOT NULL REFERENCES workers(id),
  amount          NUMERIC(8,2) NOT NULL,
  advance_date    DATE NOT NULL,
  notes           TEXT,
  week_start      DATE,              -- semana a la que se descuenta (lunes)
  is_deducted     BOOLEAN DEFAULT false,
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

**Flujo:**
1. Durante la semana → “Registrar adelanto” (trabajador, monto, fecha, nota).
2. Planilla semanal → columna **Adelantos** y fila **Neto a pagar** = bruto − adelantos − pagado en el día.
3. Al marcar cierre de semana → adelantos de esa semana pasan a `is_deducted = true`.

**API nueva:**
```
GET/POST   /api/projects/[id]/advances?week=
PATCH      /api/advances/[id]
```

---

## 2. Asistente IA — consultas de materiales

### 2.1 Problema reportado

**Pregunta:** “¿Cuánto usé de cemento esta semana?”

**Respuesta actual:** Tabla genérica de totales (materiales Q810, planilla Q250…) y mensaje de que no tiene el detalle.

**Respuesta esperada:**
> “El total de cemento utilizado esta semana es de 1 bolsa con un costo de Q810.00 utilizados en la etapa de cimentación.”

### 2.2 Causa raíz (técnica)

El contexto IA (`lib/ai/context.ts`) inyecta `buildMaterialSummary()`, que solo expone:
- Totales acumulados por material/etapa (presupuesto vs consumido).
- **No** incluye movimientos individuales con `created_at` / `entry_date`.
- **No** filtra por semana.
- **No** expone cantidad + unidad + etapa en formato listo para preguntas temporales.

### 2.3 Solución propuesta

1. Enriquecer contexto del proyecto con **`material_movimientos_recientes`**: últimas N entradas de consumo/compra con fecha, material, cantidad, unidad, costo, etapa.
2. Agregar bloque **`materiales_por_semana`** (semana actual + anterior): agregación por `material_name` con `quantity` y `total_cost`.
3. Actualizar system prompt del asistente: instruir a usar esos campos antes de decir “no tengo detalle”.
4. Test de regresión: “¿Cuánto cemento esta semana?” con datos fixture.

**Alcance:** Solo contexto + prompt. Sin escribir a BD desde IA.

---

## 3. General — diferido a otros sprints

| Item | Solicitud | Sprint propuesto | Notas |
|---|---|---|---|
| Roles de usuario | Niveles constructor / supervisor / oficina / contador | **Sprint 08** (Beta) | Ya existe `user_organizations.role` en BD; falta UI y permisos |
| Configuración empresa | Logo, editar datos, cambiar contraseña | **Sprint 08b** — Configuración | `organizations.logo_url` existe; falta pantalla `/settings` |
| PDF portal cliente | Resumen con colores del logo, membrete, descripción de etapas | **Sprint 08** — extensión Módulo 06/07 | Basado en portal existente + React-PDF con branding |

Estos items **no bloquean** la pausa de planilla ni el trabajo inmediato del constructor en otros módulos.

---

## Trazabilidad

| # | Requerimiento | Prioridad | Sprint | Estado |
|---|---|---|---|---|
| R1 | Especialidad custom | Alta | 07 | 🔲 Pendiente |
| R2 | Forma de pago jornal vs contrato | Alta | 07 | 🔲 Pendiente |
| R3 | Planilla: pago mismo día vs cierre | Media | 07 | 🔲 Pendiente |
| R4 | Adelantos con descuento semanal | Alta | 07 | 🔲 Pendiente |
| R5 | IA: detalle materiales por semana | Media | 07 | 🔲 Pendiente |
| R6 | Roles de usuario | Baja | 08 | ⏸️ Diferido |
| R7 | Config empresa + contraseña | Baja | 08 | ⏸️ Diferido |
| R8 | PDF portal con branding | Media | 08 | ⏸️ Diferido |
