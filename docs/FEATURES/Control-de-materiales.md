# Módulo 03 — Control de Materiales
> Módulo más crítico para el valor percibido del MVP.  
> El que más dinero ahorra al constructor.

---

## Problema que resuelve

El constructor no sabe cuánto material tiene, cuánto consumió, ni si le están robando.  
Un proyecto de Q300,000 puede perder Q20,000+ en cemento e hierro sin detección.

## Valor diferencial

**Comparación real vs esperado por etapa.** No es un inventario cualquiera —  
es un inventario que sabe cuánto DEBERÍA haberse usado y alerta cuando no cuadra.

---

## Estado actual

```
🔲 NO INICIADO
Fase target: 2 (Sprint 3)
Dependencias: Módulo 01 (Proyectos) debe estar completo
```

---

## Flujo del usuario

```
Constructor define presupuesto de materiales por etapa
  ↓
Supervisor registra llegada de materiales (web/móvil/WhatsApp/voz)
  ↓
Sistema registra consumo por etapa
  ↓
Dashboard: consumo real vs esperado en tiempo real
  ↓
Alerta si hay desvío > 15%
  ↓
IA explica el desvío y sugiere acción
```

---

## Tipos de movimientos

| Tipo | Descripción | Quién lo registra |
|---|---|---|
| `purchase` | Llegada de material comprado | Supervisor / Oficina |
| `consumption` | Material usado en obra | Supervisor |
| `transfer` | Movimiento entre proyectos | Constructor |
| `loss` | Material dañado o perdido | Supervisor |
| `return` | Devolución a proveedor | Oficina |

---

## Materiales comunes en construcción guatemalteca

```
Cemento (bolsas)
Hierro 3/8" (quintales)
Hierro 1/2" (quintales)
Hierro 1/4" (quintales)
Arena (camionadas)
Piedrín (camionadas)
Block (unidades)
Ladrillo (millares)
Madera (pies tablares)
Tubería PVC (unidades/metros)
Cable eléctrico (metros)
```

---

## API Routes necesarias

```
GET    /api/materials/catalog           → lista catálogo org
POST   /api/materials/catalog           → crear material
GET    /api/materials/entries?project=  → movimientos del proyecto
POST   /api/materials/entries           → registrar movimiento
GET    /api/materials/summary?project=  → resumen real vs esperado
GET    /api/materials/alerts?project=   → desvíos activos
```

---

## Componentes UI

```
MaterialCatalogManager     → CRUD del catálogo
MaterialEntryForm          → registro de movimiento (modal)
MaterialInventoryTable     → tabla con filtros por tipo y fecha
MaterialVsExpectedChart    → gráfico real vs esperado (Recharts)
MaterialAlertBanner        → alerta de desvío con acción
MaterialWhatsAppParser     → preview del parsing de WhatsApp
```

---

## Schema de tablas involucradas

Ver `DATABASE_SCHEMA.md`:
- `material_catalog`
- `material_entries`

---

## Lógica de alertas

```typescript
// Trigger: después de cada registro de consumo
async function checkMaterialDeviation(projectId: string, materialId: string) {
  const expected = await getExpectedConsumption(projectId, materialId)
  const actual = await getActualConsumption(projectId, materialId)
  
  const deviationPct = ((actual - expected) / expected) * 100
  
  if (deviationPct > 15) {
    await createAlert({
      project_id: projectId,
      type: 'material_deviation',
      severity: deviationPct > 30 ? 'high' : 'medium',
      message: `Consumo de ${materialName} excede lo esperado en ${deviationPct.toFixed(1)}%`,
      data: { expected, actual, material_id: materialId }
    })
  }
}
```

---

## Prompt de IA para explicar desvíos

```
Eres el asistente del proyecto [NOMBRE]. Se detectó un desvío en materiales:
Material: [NOMBRE], Esperado: [X] [unidad], Consumido: [Y] [unidad], Desvío: [Z]%

Posibles causas en proyectos de construcción guatemalteca:
1. Error en el estimado inicial
2. Desperdicio en mezcla o cortes
3. Cambio en diseño de la obra
4. Sustracción de materiales

Basándote en el historial de este proyecto, sugiere la causa más probable
y una acción concreta. Máximo 3 oraciones.
```

---

## Criterio de finalización del módulo

- [ ] Constructor puede crear catálogo de materiales
- [ ] Supervisor puede registrar llegada de materiales (web + móvil)
- [ ] Sistema calcula consumo real vs esperado automáticamente
- [ ] Alerta automática cuando hay desvío > 15%
- [ ] Dashboard muestra estado por material y por etapa
- [ ] Registro funciona también vía WhatsApp (Fase 3)

---

## Notas de implementación

- Los precios de materiales fluctúan en Guatemala → guardar precio en cada `material_entry`, no solo en catálogo
- El "esperado" lo define el constructor al crear la etapa (presupuesto de materiales)
- MVP no requiere proveedores (Módulo 09) — se puede ingresar proveedor como texto libre primero
