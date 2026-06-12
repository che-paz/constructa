import type { OrganizationPlan } from "@constructa/types";
import type { OrganizationContext } from "./context";

/** Serializa contexto para tests sin acceso a BD. */
export function serializeContextForPrompt(
  orgName: string,
  plan: OrganizationPlan,
  payload: Record<string, unknown>,
  project?: { id: string; name: string },
): OrganizationContext {
  const proyectos = payload.proyectos as Array<{ estado: string }> | undefined;
  const activeProjectCount =
    proyectos?.filter((p) => p.estado === "active").length ?? 0;

  return {
    orgName,
    plan,
    activeProjectCount,
    currentProject: project,
    dataContext: JSON.stringify(payload, null, 2),
  };
}
