import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/get-organization";
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
      .select("id")
      .eq("id", params.id)
      .eq("organization_id", auth.organization.id)
      .is("deleted_at", null)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: reports, error } = await supabase
      .from("reports")
      .select(
        "id, report_type, period_start, period_end, ai_narrative, pdf_url, created_at",
      )
      .eq("project_id", params.id)
      .eq("organization_id", auth.organization.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ reports: reports ?? [] });
  } catch (error) {
    console.error("[projects/[id]/reports/GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
