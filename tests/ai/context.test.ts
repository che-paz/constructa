import { describe, expect, it } from "vitest";
import { buildSystemPrompt } from "../../apps/web/lib/ai/prompts";
import { serializeContextForPrompt } from "../../apps/web/lib/ai/serialize-context";

describe("AI context builder (unit)", () => {
  it("builds system prompt with org name and GTQ rules", () => {
    const context = serializeContextForPrompt(
      "Constructora López",
      "profesional",
      {
        totales: { total_spent: 85000 },
        proyectos: [
          {
            id: "p1",
            nombre: "Casa Zona 10",
            estado: "active",
            gastado: 85000,
          },
        ],
      },
      { id: "p1", name: "Casa Zona 10" },
    );

    const prompt = buildSystemPrompt(context);

    expect(prompt).toContain("Constructora López");
    expect(prompt).toContain("español guatemalteco");
    expect(prompt).toContain("Quetzales");
    expect(prompt).toContain("Casa Zona 10");
    expect(prompt).toContain("85000");
    expect(prompt).toContain("No puedes modificar datos");
  });

  it("serializes context with active project count", () => {
    const context = serializeContextForPrompt(
      "Obra GT",
      "empresa",
      {
        proyectos: [
          { estado: "active" },
          { estado: "active" },
          { estado: "completed" },
        ],
      },
    );

    expect(context.activeProjectCount).toBe(2);
    expect(context.orgName).toBe("Obra GT");
    expect(context.plan).toBe("empresa");
    expect(context.dataContext).toContain("proyectos");
  });

  it("includes project context when provided", () => {
    const context = serializeContextForPrompt(
      "Test Org",
      "profesional",
      { totales: {} },
      { id: "proj-abc", name: "Proyecto Norte" },
    );

    expect(context.currentProject).toEqual({
      id: "proj-abc",
      name: "Proyecto Norte",
    });

    const prompt = buildSystemPrompt(context);
    expect(prompt).toContain("Proyecto en contexto: Proyecto Norte");
  });
});

describe("AI material week context (unit)", () => {
  it("aggregates consumption by material for the current week", async () => {
    const { buildMaterialWeekContext } = await import(
      "../../apps/web/lib/ai/material-context"
    );

    const context = buildMaterialWeekContext(
      [
        {
          created_at: "2025-06-04T10:00:00.000Z",
          entry_type: "consumption",
          quantity: 1,
          total_cost: 810,
          material: { name: "Cemento", unit: "bolsa" },
          stage: { name: "Cimentación" },
        },
        {
          created_at: "2025-06-03T10:00:00.000Z",
          entry_type: "consumption",
          quantity: 5,
          total_cost: 200,
          material: { name: "Arena", unit: "m3" },
          stage: { name: "Cimentación" },
        },
      ],
      "2025-06-04",
    );

    const cemento = context.semana_actual.materiales.find(
      (item) => item.material === "Cemento",
    );

    expect(context.semana_actual.inicio).toBe("2025-06-02");
    expect(cemento).toEqual({
      material: "Cemento",
      unidad: "bolsa",
      cantidad_total: 1,
      costo_total: 810,
      etapas: ["Cimentación"],
    });
    expect(context.movimientos_recientes[0]?.material).toBe("Cemento");
  });

  it("includes weekly material context in serialized prompt payload", () => {
    const context = serializeContextForPrompt(
      "Constructora Beta",
      "profesional",
      {
        proyecto_detalle: {
          materiales_por_semana: {
            semana_actual: {
              inicio: "2025-06-02",
              fin: "2025-06-08",
              materiales: [
                {
                  material: "Cemento",
                  unidad: "bolsa",
                  cantidad_total: 1,
                  costo_total: 810,
                  etapas: ["Cimentación"],
                },
              ],
            },
          },
        },
      },
      { id: "p1", name: "KIMBERLY" },
    );

    const prompt = buildSystemPrompt(context);

    expect(context.dataContext).toContain("Cemento");
    expect(context.dataContext).toContain("Cimentación");
    expect(prompt).toContain("materiales_por_semana");
  });
});

describe("AI quota limits (unit)", () => {
  it("blocks basico plan from AI access", async () => {
    const { hasAIAccess } = await import("../../apps/web/lib/ai/quota");
    expect(hasAIAccess("basico")).toBe(false);
    expect(hasAIAccess("profesional")).toBe(true);
    expect(hasAIAccess("empresa")).toBe(true);
  });
});

describe("report period resolution (unit)", () => {
  it("resolves weekly period from explicit dates", async () => {
    const { resolveReportPeriod } = await import(
      "../../apps/web/lib/reports/collect-period-data"
    );

    const period = resolveReportPeriod(
      "weekly",
      "2025-06-02",
      "2025-06-08",
    );

    expect(period).toEqual({ start: "2025-06-02", end: "2025-06-08" });
  });
});

describe("conversation history trim (unit)", () => {
  it("keeps only last 10 messages", async () => {
    const { trimMessageHistory } = await import(
      "../../apps/web/lib/ai/conversations"
    );

    const messages = Array.from({ length: 15 }, (_, i) => ({
      role: "user" as const,
      content: `msg-${i}`,
    }));

    const trimmed = trimMessageHistory(messages);
    expect(trimmed).toHaveLength(10);
    expect(trimmed[0]?.content).toBe("msg-5");
    expect(trimmed[9]?.content).toBe("msg-14");
  });
});
