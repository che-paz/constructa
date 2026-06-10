# ROADMAP.md
> Plan de desarrollo técnico desde estado actual hasta MVP completo.  
> Actualizar al completar cada fase o sprint.

---

## Visión general de fases

```
FASE 0    FASE 1         FASE 2           FASE 3          FASE 4        FASE 5
Docs  →   Fundamentos → Core MVP      →  IA + WhatsApp →  Beta →       Launch
Sprint 0  Sprint 1-2    Sprint 3-5       Sprint 6-7       Sprint 8      Sprint 9
Sem 1     Sem 2-5       Sem 6-12         Sem 13-16        Sem 17-18     Sem 19-20
```

---

## FASE 0 — Documentación y Setup
**Estado: ✅ COMPLETADO (setup técnico)**  
**Duración:** 1 semana  
**Objetivo:** Fundamentos técnicos antes de escribir código.

### Tareas

| # | Tarea | Estado | Dependencias |
|---|---|---|---|
| 0.1 | Arquitectura documental (`docs/`) | ✅ DONE | — |
| 0.2 | Validación con 10 constructores reales | ⏳ PENDING | — |
| 0.3 | Setup repositorio GitHub (monorepo) | ✅ DONE | — |
| 0.4 | Setup proyecto Supabase Cloud | ✅ DONE | 0.3 |
| 0.5 | Setup proyecto Vercel | ⏳ PENDING | 0.3 |
| 0.6 | Diseño sistema en Figma (pantallas MVP) | ⏳ PENDING | 0.2 |
| 0.7 | Setup CI/CD (GitHub Actions) | ⏳ PENDING | 0.3 |

**Criterio de finalización:** Repositorio inicializado, Supabase conectado, CI verde, Figma con pantallas principales.

**Archivos afectados:** `CURRENT_STATE.md`

**Riesgos:**
- Validación con constructores puede revelar módulos mal priorizados → ajustar antes de Fase 1

---

## FASE 1 — Fundamentos del Sistema
**Estado: 🟡 EN CURSO (Sprint 01)**  
**Duración:** 3 semanas (Sprints 1–2)  
**Objetivo:** Sistema de auth, multitenancy y los módulos base del plan Básico.

### Objetivo
Tener un sistema donde un constructor puede crear su cuenta, agregar proyectos, registrar pagos y dar acceso al portal al cliente.

### Módulos a desarrollar
- Módulo 01: Gestión de Proyectos
- Módulo 05: Adelantos y Pagos
- Módulo 06: Portal del Cliente (versión básica)

### Tareas técnicas

#### Sprint 1 (semanas 2–3): Infraestructura base
```
- [x] Schema SQL completo en Supabase (migraciones)
- [x] RLS policies para todas las tablas
- [x] Auth flow: signup → crear organización → onboarding
- [x] Layout principal: sidebar, navbar, perfil
- [x] CRUD completo de Proyectos (Módulo 01)
- [x] Lista de proyectos con filtros y búsqueda
- [x] Dashboard individual de proyecto
```

#### Sprint 2 (semanas 4–5): Pagos y Portal
```
- [ ] Módulo de Pagos (Módulo 05): registro, historial, saldos
- [ ] Upload de comprobantes a Supabase Storage
- [ ] Portal del Cliente (Módulo 06): acceso con token único
- [ ] Vista de pagos para el cliente
- [ ] Vista de avance básico para el cliente
- [ ] Tests de RLS (verificar aislamiento entre orgs)
```

**Archivos afectados:**
- `CURRENT_STATE.md` (actualizar sprint activo)
- `FEATURES/Gestion-de-proyectos.md`
- `FEATURES/Adelantos-y-pagos.md`
- `FEATURES/Portal-de-cliente.md`
- `archive/sprint-01.md`, `archive/sprint-02.md`

**Dependencias:** Fase 0 completada, Figma de estas pantallas aprobado

**Riesgos:**
- RLS mal configurado → bug de seguridad crítico. Mitigación: tests automáticos de RLS.
- Portal del cliente: gestión de tokens de acceso público sin auth

**Criterio de finalización:**
- Constructor puede crear cuenta, agregar proyecto, registrar pago
- Cliente puede ver su portal con token único
- RLS probado: org A no ve datos de org B

---

## FASE 2 — Core del MVP
**Estado: ✅ COMPLETADO (Sprints 3–5)**  
**Duración:** 5 semanas (Sprints 3–5)  
**Objetivo:** El sistema que justifica que un constructor pague Q399/mes.

### Módulos a desarrollar
- Módulo 02: Cronograma Inteligente
- Módulo 03: Control de Materiales ⭐ (más crítico)
- Módulo 04: Control de Personal
- Módulo 10: Centro Financiero (versión básica)

### Tareas técnicas

#### Sprint 3 (semanas 6–8): Materiales y Cronograma
```
- [ ] Catálogo de materiales por organización
- [ ] Registro de compras con upload de facturas
- [ ] Registro de consumo por etapa
- [ ] Dashboard: consumo real vs esperado
- [ ] Alertas de desvío (> 15% sobre lo esperado)
- [ ] Cronograma: crear/editar etapas
- [ ] Cronograma: fecha prevista vs real
- [ ] Recálculo automático al marcar retraso
```

#### Sprint 4 (semanas 9–10): Personal y Planilla
```
- [ ] CRUD de trabajadores
- [ ] Registro de asistencia manual y por QR
- [ ] Cálculo automático de horas y jornal
- [ ] Generación de planilla semanal (PDF básico)
- [ ] Historial de pagos por trabajador
```

#### Sprint 5 (semanas 11–12): Centro Financiero
```
- [ ] Dashboard multi-proyecto con métricas
- [ ] Gasto real vs presupuesto en tiempo real
- [ ] Cuentas por cobrar
- [ ] Flujo de caja por proyecto
- [ ] Exportación básica a Excel
- [ ] App móvil: pantallas principales (React Native)
```

**Archivos afectados:**
- `FEATURES/Control-de-materiales.md`
- `FEATURES/Cronograma-inteligente.md`
- `FEATURES/Centro-financiero.md`
- `archive/sprint-03.md` a `sprint-05.md`

**Dependencias:** Fase 1 completa y en producción

**Riesgos:**
- App móvil puede demorar más → priorizar web primero, móvil en sprint separado
- QR para asistencia requiere librería de cámara en web y móvil

**Criterio de finalización:**
- Constructor puede controlar materiales completos de un proyecto
- Planilla semanal generada automáticamente
- Dashboard financiero muestra situación real en tiempo real

---

## FASE 3 — Inteligencia Artificial (web)
**Estado: 🟡 EN CURSO (Sprint 06)**  
**Duración:** 2 semanas (Sprint 6) — *ajustado: sin WhatsApp ni voz*  
**Objetivo:** Diferenciación con asistente IA y reportes automáticos en la web.

### Módulos a desarrollar (Sprint 06)
- Módulo 07: Reportes Automáticos
- Módulo 11: Asistente IA Constructor

### Módulos diferidos (fuera de alcance inmediato)
- Módulo 12: WhatsApp Integrado → **PENDIENTE** (post-beta / cuando Meta apruebe)
- Módulo 13: Captura por Voz → **PENDIENTE** (requiere app móvil)

### Tareas técnicas

#### Sprint 6 (semanas 13–14): Asistente y Reportes
```
- [ ] Integración Anthropic API con rate limiting
- [ ] UI del asistente (chat interface con streaming)
- [ ] Sistema de inyección de contexto (datos del tenant)
- [ ] Generación de reportes semanales con Claude
- [ ] Template PDF de reporte (React-PDF o Puppeteer — decidir)
- [ ] Guardado y descarga de reportes
- [ ] Sistema de quota por plan
- [ ] Tests de contexto IA + aislamiento por org
```

#### ~~Sprint 7~~ — WhatsApp y Voz (DIFERIDO)
```
⏸️ No programado por ahora. Reactivar cuando:
- Beta cerrada valide demanda de campo
- App móvil Expo esté en roadmap activo
- Cuenta WhatsApp Business API aprobada
```

**Archivos afectados:**
- `AI_SYSTEM.md` (actualizar con implementaciones reales)
- `FEATURES/Asistente-IA-constructor.md`
- `FEATURES/Reportes-Automaticos.md`
- `archive/sprint-06.md`

**Dependencias:** Fase 2 completa, datos reales en BD para probar IA

**Riesgos:**
- Costos de IA en producción: monitorear desde día 1 con alertas
- PDF: elegir React-PDF vs Puppeteer al inicio del sprint

**Criterio de finalización:**
- Reporte semanal generado por IA en < 30 segundos
- Asistente responde consultas sobre datos de la empresa correctamente
- Rate limit y quotas por plan operativos

---

## FASE 4 — Beta Cerrada
**Estado: 🔲 NO INICIADO**  
**Duración:** 2 semanas (Sprint 8)  
**Objetivo:** 5 constructores reales usando el sistema en producción.

### Tareas

```
- [ ] Onboarding guiado para nuevos constructores
- [ ] Módulo 08: Fotografías (clasificación básica con IA)
- [ ] Módulo 09: Directorio de proveedores
- [ ] Módulo 14: Alertas de riesgo automáticas
- [ ] Soporte en tiempo real (chat de soporte)
- [ ] Recopilación estructurada de feedback
- [ ] Fix de bugs reportados
- [ ] Performance tuning
```

**Criterio de finalización:**
- 5 constructores activos con datos reales
- NPS > 40 en la beta
- < 5 bugs críticos abiertos
- Menos de 2h de downtime en el periodo

---

## FASE 5 — Lanzamiento Comercial
**Estado: 🔲 NO INICIADO**  
**Duración:** 2 semanas (Sprint 9)  
**Objetivo:** Producto en mercado, primeros pagos reales.

### Tareas

```
- [ ] Integración de pagos (Stripe o solución local GT)
- [ ] Landing page de marketing
- [ ] Documentación de usuario (video tutoriales)
- [ ] Sistema de facturación mensual
- [ ] Trial gratuito de 14 días automatizado
- [ ] Email de onboarding automatizado
- [ ] Analytics de producto (Mixpanel o Posthog)
- [ ] Política de privacidad y términos de servicio (GT)
```

**Criterio de finalización:**
- Primer pago procesado con éxito
- 10 organizaciones registradas
- Sistema de billing funcionando automáticamente

---

## Resumen de tiempos

| Fase | Semanas | Entregable principal |
|---|---|---|
| 0 | 1 | Setup completo |
| 1 | 3 | Auth + Proyectos + Pagos + Portal |
| 2 | 5 | Materiales + Personal + Financiero |
| 3 | 2 | IA + Reportes (web) |
| 4 | 2 | Beta cerrada con 5 clientes |
| 5 | 2 | Lanzamiento comercial |
| **Total** | **~15 semanas** | **MVP en mercado** |

---

## Definición de MVP

El MVP de CONSTRUCTA es la combinación de módulos que justifica el pago del **plan Básico (Q399/mes)** y demuestra el valor diferencial:

**MVP obligatorio (meses 1–3):**
1. Proyectos — ficha completa y dashboard
2. Pagos — registro con evidencia, saldo automático
3. Portal del cliente — acceso con token
4. Materiales — inventario y consumo real vs esperado
5. Personal — asistencia y planilla

**MVP diferencial (meses 3–4):**
6. Reportes automáticos con IA
7. Asistente IA básico

**Post-MVP (meses 5+):**
8. WhatsApp integrado *(diferido)*
9. Captura por voz *(diferido)*
10. Fotos inteligentes
11. Detección de riesgos
