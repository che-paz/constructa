import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/get-organization";
import {
  downloadReportPdf,
  getReportPdfSignedUrl,
} from "@/lib/reports/storage";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: { id: string };
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: report, error } = await supabase
      .from("reports")
      .select("id, pdf_url, project:projects(name)")
      .eq("id", params.id)
      .eq("organization_id", auth.organization.id)
      .single();

    if (error || !report?.pdf_url) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const url = new URL(request.url);
    const mode = url.searchParams.get("mode");

    if (mode === "url") {
      const signedUrl = await getReportPdfSignedUrl(report.pdf_url);
      if (!signedUrl) {
        return NextResponse.json({ error: "PDF no disponible" }, { status: 404 });
      }
      return NextResponse.json({ url: signedUrl });
    }

    const buffer = await downloadReportPdf(report.pdf_url);
    if (!buffer) {
      return NextResponse.json({ error: "PDF no disponible" }, { status: 404 });
    }

    const projectData = report.project;
    const projectName =
      projectData &&
      !Array.isArray(projectData) &&
      "name" in projectData
        ? (projectData as { name: string }).name
        : "reporte";

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="reporte-${projectName.replace(/\s+/g, "-")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[reports/[id]/pdf/GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
