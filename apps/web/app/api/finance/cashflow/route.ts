import { CashflowQuerySchema } from "@constructa/schemas";
import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/get-organization";
import { fetchOrgFinancialData } from "@/lib/finance/fetch-org-financial-data";
import { buildCashflowSummary } from "@/lib/finance/summary";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parsed = CashflowQuerySchema.safeParse({
      period: searchParams.get("period") ?? "month",
      project: searchParams.get("project") ?? undefined,
      reference_date: searchParams.get("reference_date") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = await fetchOrgFinancialData(auth.organization.id);
    const cashflow = buildCashflowSummary(
      parsed.data.period,
      data.payments,
      data.expenses,
      data.materials,
      data.attendance,
      {
        projectId: parsed.data.project,
        referenceDate: parsed.data.reference_date,
      },
    );

    return NextResponse.json(cashflow);
  } catch (error) {
    console.error("[finance/cashflow/GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
