import type { UserRole } from "@constructa/types";

export const ORG_STAFF_ROLES = [
  "constructor",
  "supervisor",
  "oficina",
  "contador",
] as const;

export type OrgStaffRole = (typeof ORG_STAFF_ROLES)[number];

export const ROLE_LABELS: Record<OrgStaffRole, string> = {
  constructor: "Constructor",
  supervisor: "Supervisor",
  oficina: "Oficina",
  contador: "Contador",
};

export const ROLE_DESCRIPTIONS: Record<OrgStaffRole, string> = {
  constructor: "Acceso completo y administración de la empresa",
  supervisor: "Puede registrar y editar datos de obra",
  oficina: "Solo lectura en proyectos y operaciones",
  contador: "Lectura general y registro de pagos y gastos",
};

/** Admin de la organización: settings, usuarios, logo */
export function canManageOrganization(role: UserRole): boolean {
  return role === "constructor";
}

/** Escritura en proyectos, materiales, personal, cronograma */
export function canWrite(role: UserRole): boolean {
  return role === "constructor" || role === "supervisor";
}

/** Escritura en pagos, gastos y finanzas */
export function canWriteFinance(role: UserRole): boolean {
  return role === "constructor" || role === "contador";
}
