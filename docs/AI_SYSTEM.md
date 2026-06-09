# AI_SYSTEM.md
> Diseño del sistema de Inteligencia Artificial de CONSTRUCTA.  
> Leer antes de cualquier trabajo relacionado con IA, reportes automáticos o WhatsApp.

---

## Modelo central

**Motor:** Anthropic Claude API — `claude-sonnet-4-20250514`  
**Idioma objetivo:** Español guatemalteco  
**Rol del modelo:** Asistente de gestión de construcción con acceso contextual a los datos del tenant

---

## Los 4 casos de uso de IA

### 1. Asistente interactivo (Módulo 11)
Conversación en lenguaje natural con los datos de la empresa.

```
Usuario: "¿Cuánto gasté en cemento en el proyecto López este mes?"
Sistema: Consulta BD → Claude genera respuesta → Stream al usuario
```

**Características:**
- Historial de conversación por sesión (guardado en `ai_conversations`)
- Contexto del proyecto activo inyectado en system prompt
- Acciones: solo lectura de datos. Nunca escribe directamente a BD.

---

### 2. Procesamiento de mensajes WhatsApp (Módulo 12)
Interpreta mensajes de texto libre de supervisores en campo.

```
"Hoy llegaron 50 bolsas de cemento y trabajaron Juan, Pedro y Carlos"
→ Claude extrae entidades →
   { materiales: [{name:"cemento", qty:50, unit:"bolsas", type:"purchase"}],
     asistencia: [{name:"Juan"}, {name:"Pedro"}, {name:"Carlos"}] }
→ Sistema escribe a BD automáticamente
→ Respuesta de confirmación al supervisor
```

**Características:**
- No streaming (procesamiento background)
- Respuesta < 3 segundos para no frustrar al supervisor
- Fuzzy matching de nombres de trabajadores y materiales

---

### 3. Generación de reportes (Módulo 07)
Genera narrativa en español para reportes semanales/mensuales.

```
Sistema: Recopila datos del periodo → arma JSON estructurado
Claude: Recibe JSON → genera texto en español claro y profesional
Sistema: Combina texto + datos + fotos → PDF
```

**Prompt template para reportes:**
```
Eres el asistente administrativo de [EMPRESA]. Redacta un reporte semanal
profesional en español guatemalteco para el cliente [CLIENTE] sobre su proyecto
"[PROYECTO]". Usa un tono formal pero claro. Datos del periodo: [JSON_DATOS].
Máximo 400 palabras. Estructura: resumen ejecutivo, avance físico,
materiales utilizados, personal, próximos pasos.
```

---

### 4. Detección de riesgos (Módulo 14)
Análisis periódico (diario/semanal) para detectar anomalías.

```
Triggers automáticos:
- Consumo de material > 20% sobre lo esperado
- Etapa con > 5 días de retraso sin actualización
- Gasto > 80% del presupuesto con < 70% de avance
- Pago pendiente > 30 días

Claude analiza patrones → genera alerta con recomendación concreta
```

---

## System prompt base (plantilla)

```typescript
function buildSystemPrompt(context: OrganizationContext): string {
  return `Eres el asistente de gestión de obras de ${context.orgName}, 
una empresa constructora guatemalteca.

CONTEXTO DE LA EMPRESA:
- Moneda: Quetzales guatemaltecos (Q o GTQ)
- Proyectos activos: ${context.activeProjectCount}
- Plan: ${context.plan}
${context.currentProject ? `- Proyecto en contexto: ${context.currentProject.name}` : ''}

REGLAS DE COMPORTAMIENTO:
1. Responde siempre en español guatemalteco, formal pero claro.
2. Usa "Q" para cantidades en quetzales (ej: Q1,500).
3. Nunca inventes datos. Si no tienes información, dilo claramente.
4. Sé conciso. El constructor está ocupado.
5. Para fechas usa formato guatemalteco: día/mes/año.
6. Si detectas algo preocupante en los datos, mencionalo proactivamente.

DATOS DISPONIBLES PARA CONSULTA:
${context.dataContext}

RESTRICCIONES:
- No puedes modificar datos directamente, solo consultarlos.
- No compartas información de un proyecto con otro cliente.
- No respondas sobre temas ajenos a la gestión de construcción.`
}
```

---

## Procesamiento de voz (Módulo 13)

```
Audio del supervisor (desde app móvil)
  ↓
Transcripción: OpenAI Whisper API (modelo: whisper-1)
  ↓
Texto transcrito → mismo pipeline que WhatsApp
  ↓
Claude extrae entidades y escribe a BD
```

**Idioma hint:** `language: 'es'` en Whisper para forzar español.

---

### Análisis de fotografías (Módulo 08)

```typescript
// Claude Vision para clasificar fotos de obra
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 300,
  messages: [{
    role: 'user',
    content: [
      {
        type: 'image',
        source: { type: 'url', url: photoUrl }
      },
      {
        type: 'text',
        text: `Analiza esta fotografía de una obra de construcción en Guatemala.
               Proyecto: ${projectName}. Etapas del proyecto: ${stageNames}.
               Responde en JSON: { "stage": "nombre_etapa", "progress_pct": 0-100, 
               "description": "descripción breve en español", "concerns": [] }`
      }
    ]
  }]
})
```

---

## Gestión de tokens y costos

### Estimados de consumo por operación

| Operación | Input tokens | Output tokens | Costo aprox (USD) |
|---|---|---|---|
| Consulta asistente simple | 800 | 200 | $0.003 |
| Procesar mensaje WhatsApp | 400 | 150 | $0.002 |
| Generar reporte semanal | 1,500 | 600 | $0.008 |
| Analizar foto | 1,200 | 200 | $0.005 |
| Detección de riesgos | 2,000 | 400 | $0.010 |

### Límites por plan

| Plan | Consultas IA/día | Reportes IA/mes | Fotos analizadas/mes |
|---|---|---|---|
| Básico | 0 (sin IA) | 0 | 0 |
| Profesional | 50 | 30 | 100 |
| Empresa | Ilimitado | Ilimitado | Ilimitado |

### Control de costos en código

```typescript
// Tabla: ai_usage_log
// Verificar límites antes de cada llamada
async function checkAIQuota(orgId: string, operation: string): Promise<boolean> {
  const { count } = await supabase
    .from('ai_usage_log')
    .select('*', { count: 'exact' })
    .eq('organization_id', orgId)
    .eq('operation', operation)
    .gte('created_at', startOfDay(new Date()).toISOString())
  
  const limits = { assistant: 50, report: 1, photo: 5 }
  return (count ?? 0) < limits[operation]
}
```

---

## Estrategia de context window para el asistente

Para mantener conversaciones largas sin exceder el context window:

```typescript
function buildMessages(history: Message[], newMessage: string) {
  const MAX_HISTORY = 10  // últimos 10 turnos
  const recentHistory = history.slice(-MAX_HISTORY)
  
  // Si hay historial previo, agregar resumen
  if (history.length > MAX_HISTORY) {
    return [
      { role: 'user', content: `[Resumen de conversación anterior: ${history[0].summary}]` },
      { role: 'assistant', content: 'Entendido.' },
      ...recentHistory,
      { role: 'user', content: newMessage }
    ]
  }
  
  return [...recentHistory, { role: 'user', content: newMessage }]
}
```

---

## Flujo de error en llamadas IA

```
Error de API → Log en Sentry → Respuesta amigable al usuario
Timeout (>30s) → Retry 1 vez → Si falla, respuesta de fallback
Rate limit → Queue con delay → Notificar al usuario que espere
```

**Mensaje de fallback:**
> "En este momento no puedo procesar tu consulta. Por favor intenta en unos momentos."

---

## Roadmap IA por fase

| Fase | Feature | Complejidad |
|---|---|---|
| MVP (Fase 3) | Asistente básico (consultas de datos) | Media |
| MVP (Fase 3) | Generación de reportes PDF | Media |
| MVP (Fase 3) | Procesamiento mensajes WhatsApp | Alta |
| Post-MVP | Análisis de fotografías | Alta |
| Post-MVP | Detección de riesgos predictiva | Alta |
| Post-MVP | Captura por voz | Media |
