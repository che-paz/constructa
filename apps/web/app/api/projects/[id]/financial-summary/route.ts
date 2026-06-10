import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/get-organization";
import { fetchOrgFinancialData } from "@/lib/finance/fetch-org-financial-data";
import { buildProjectFinancialSummary } from "@/lib/finance/summary";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, name, status, total_budget, client_advance")
      .eq("id", params.id)
      .eq("organization_id", auth.organization.id)
      .is("deleted_at", null)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data = await fetchOrgFinancialData(auth.organization.id);
    const summary = buildProjectFinancialSummary(
      {
        id: project.id,
        name: project.name,
        status: project.status,
        total_budget: project.total_budget,
        client_advance: project.client_advance,
      },
      data.payments.filter((p) => p.project_id === params.id),
      data.expenses.filter((e) => e.project_id === params.id),
      data.materials.filter((m) => m.project_id === params.id),
      data.attendance.filter((a) => a.project_id === params.id),
      data.stages.filter((s) => s.project_id === params.id),
    );

    return NextResponse.json(summary);
  } catch (error) {
    console.error("[projects/[id]/financial-summary/GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
