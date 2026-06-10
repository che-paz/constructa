# CONSTRUCTA — Project Overview
> **Leer este archivo primero en cada nuevo chat.**  
> Última actualización: 2025 · Versión 1.0

---

## ¿Qué es CONSTRUCTA?

Plataforma SaaS de gestión integral para constructores guatemaltecos. Sustituye Excel, WhatsApp y cuadernos por un sistema unificado con IA nativa en español.

**Problema central:** Constructores que manejan proyectos de millones de quetzales con herramientas no diseñadas para eso, perdiendo entre Q15,000–Q80,000/año en materiales no controlados y conflictos de pagos.

**Solución:** Sistema web + app móvil con 14 módulos integrados, asistente IA en español y roles diferenciados por tipo de usuario.

---

## Mercado objetivo

- **Segmento primario:** Constructores independientes guatemaltecos con 2–15 proyectos activos simultáneos
- **Geografía inicial:** Guatemala (español guatemalteco, quetzales GTQ)
- **Tamaño de empresa:** Micro a mediana constructora (1 dueño, 1–5 empleados de oficina, supervisores de campo)

---

## Propuesta de valor

| Para quién | Qué resuelve | Cómo |
|---|---|---|
| Constructor (dueño) | Pérdida de control al escalar | Dashboard multi-proyecto + IA |
| Supervisor | Reportar desde campo es engorroso | WhatsApp integrado + voz |
| Cliente | No sabe qué pasa con su obra | Portal propio con evidencia |
| Contador | Datos financieros dispersos | Módulo financiero aislado |

---

## Stack tecnológico definido

> Ver `ARCHITECTURE.md` para detalle completo.

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes + Supabase (PostgreSQL + Auth + Storage)
- **IA:** Anthropic Claude API (claude-sonnet-4-20250514)
- **Mobile:** React Native (Expo) — comparte lógica con web
- **WhatsApp:** Meta WhatsApp Business API (Cloud API)
- **Hosting:** Vercel (frontend) + Supabase (backend)
- **PDF:** React-PDF o Puppeteer para reportes generados

---

## Los 14 módulos (resumen)

| # | Módulo | Plan mínimo | MVP |
|---|---|---|---|
| 01 | Gestión de Proyectos | Básico | ✅ SÍ |
| 02 | Cronograma Inteligente | Básico | ✅ SÍ |
| 03 | Control de Materiales | Básico | ✅ SÍ |
| 04 | Control de Personal | Básico | ✅ SÍ |
| 05 | Adelantos y Pagos | Básico | ✅ SÍ |
| 06 | Portal del Cliente | Básico | ✅ SÍ |
| 07 | Reportes Automáticos | Profesional | 🔜 Fase 2 |
| 08 | Fotografías Inteligentes | Profesional | 🔜 Fase 2 |
| 09 | Compras y Proveedores | Profesional | 🔜 Fase 2 |
| 10 | Centro Financiero | Profesional | 🔜 Fase 2 |
| 11 | Asistente IA Constructor | Profesional | 🔜 Fase 3 |
| 12 | WhatsApp Integrado | Profesional | 🔜 Fase 3 |
| 13 | Captura por Voz | Empresa | 🔜 Fase 3 |
| 14 | Detección de Riesgos IA | Empresa | 🔜 Fase 3 |

---

## Planes de precios

| Plan | Precio/mes | Proyectos | Usuarios | Módulos |
|---|---|---|---|---|
| Básico | Q399 | 3 | 5 | 1–6 |
| Profesional | Q799 | 10 | 20 | 1–11 |
| Empresa | Q1,499 | Ilimitado | Ilimitado | 1–14 |

---

## Roles del sistema

1. **Constructor** — Dueño. Acceso total.
2. **Supervisor** — Campo. Reporta vía WhatsApp o voz.
3. **Oficina** — Valida gastos y facturas.
4. **Cliente** — Portal de solo lectura de su obra.
5. **Contador** — Solo módulo financiero y reportes.

---

## Estado actual del proyecto

> Ver `CURRENT_STATE.md` para estado detallado.

- Fase: **Core MVP web** — Sprints 01–05 completados
- Código escrito: **~75%** del MVP web (falta IA + reportes)
- Documentación: **Actualizada por sprint**
- Próximo paso: Pulido local → Sprint 06 (IA + Reportes) → Beta → Móvil

---

## Archivos clave a leer según contexto

| Si vas a trabajar en... | Lee estos archivos |
|---|---|
| Cualquier sesión nueva | `PROJECT_OVERVIEW.md` → `CURRENT_STATE.md` |
| Backend / base de datos | + `ARCHITECTURE.md` + `DATABASE_SCHEMA.md` |
| Funcionalidades IA | + `AI_SYSTEM.md` |
| Un módulo específico | + `FEATURES/[nombre-módulo].md` |
| Sprint activo | + `archive/sprint-XX.md` más reciente |
| Reglas de código | + `ENGINEERING_RULES.md` |
