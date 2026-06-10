import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/get-organization";
import { fetchOrgFinancialData } from "@/lib/finance/fetch-org-financial-data";
import { buildFinanceDashboard } from "@/lib/finance/summary";

export async function GET() {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await fetchOrgFinancialData(auth.organization.id);
    const dashboard = buildFinanceDashboard(
      auth.organization.id,
      data.projects,
      data.payments,
      data.expenses,
      data.materials,
      data.attendance,
      data.stages,
    );

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error("[finance/dashboard/GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
