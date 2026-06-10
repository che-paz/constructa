import { NextResponse } from "next/server";
import { GenerateReportSchema } from "@constructa/schemas";
import { getAuthContext } from "@/lib/auth/get-organization";
import { logAIUsage, checkAIQuota } from "@/lib/ai/quota";
import { mapAIErrorToMessage } from "@/lib/ai/error-messages";
import {
  collectReportData,
  resolveReportPeriod,
} from "@/lib/reports/collect-period-data";
import { generateReportNarrative } from "@/lib/reports/generate-narrative";
import { renderReportPdf } from "@/lib/reports/pdf-document";
import { uploadReportPdf } from "@/lib/reports/storage";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quota = await checkAIQuota(
      auth.organization.id,
      auth.organization.plan,
      "report",
    );
    if (!quota.allowed) {
      return NextResponse.json({ error: quota.reason }, { status: 429 });
    }

    const body = await request.json();
    const parsed = GenerateReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { project_id, report_type, period_start, period_end } = parsed.data;
    const supabase = await createClient();

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, name")
      .eq("id", project_id)
      .eq("organization_id", auth.organization.id)
      .is("deleted_at", null)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const period = resolveReportPeriod(
      report_type,
      period_start,
      period_end,
    );

    const snapshot = await collectReportData(
      auth.organization.id,
      project_id,
      period,
    );

    const { narrative, tokensInput, tokensOutput } =
      await generateReportNarrative({
        orgName: auth.organization.name,
        snapshot,
      });

    const reportId = crypto.randomUUID();

    const pdfBuffer = await renderReportPdf({
      orgName: auth.organization.name,
      narrative,
      snapshot,
    });

    const pdfPath = await uploadReportPdf(
      auth.organization.id,
      project_id,
      reportId,
      pdfBuffer,
    );

    const { data: report, error: insertError } = await supabase
      .from("reports")
      .insert({
        id: reportId,
        organization_id: auth.organization.id,
        project_id,
        report_type,
        period_start: period.start,
        period_end: period.end,
        ai_narrative: narrative,
        pdf_url: pdfPath,
        data_snapshot: snapshot,
        created_by: auth.userId,
      })
      .select("*")
      .single();

    if (insertError) throw insertError;

    await logAIUsage({
      organizationId: auth.organization.id,
      userId: auth.userId,
      operation: "report",
      tokensInput,
      tokensOutput,
      latencyMs: Date.now() - startTime,
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("[reports/generate/POST]", error);
    return NextResponse.json(
      { error: mapAIErrorToMessage(error) },
      { status: 500 },
    );
  }
}
