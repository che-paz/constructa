import { describe, expect, it } from "vitest";
import { buildSystemPrompt } from "../../apps/web/lib/ai/prompts";
import { serializeContextForPrompt } from "../../apps/web/lib/ai/context";

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
