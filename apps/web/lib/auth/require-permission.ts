import { NextResponse } from "next/server";
import type { AuthContext } from "@/lib/auth/get-organization";
import {
  canManageOrganization,
  canWrite,
  canWriteFinance,
} from "@/lib/auth/permissions";

function forbidden(message = "Sin permisos para esta acción") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function requireOrgAdmin(auth: AuthContext) {
  if (!canManageOrganization(auth.membership.role)) {
    return forbidden("Solo el constructor puede administrar la empresa");
  }
  return null;
}

export function requireWrite(auth: AuthContext) {
  if (!canWrite(auth.membership.role)) {
    return forbidden("Tu rol solo tiene permiso de lectura");
  }
  return null;
}

export function requireFinanceWrite(auth: AuthContext) {
  if (!canWriteFinance(auth.membership.role)) {
    return forbidden("Tu rol no puede modificar registros financieros");
  }
  return null;
}
