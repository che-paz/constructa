"use client";

import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import type { Report } from "@constructa/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ReportSummary {
  id: string;
  report_type: string;
  period_start: string | null;
  period_end: string | null;
  ai_narrative: string | null;
  created_at: string;
}

interface ReportsSectionProps {
  projectId: string;
  initialReports: ReportSummary[];
}

export function ReportsSection({
  projectId,
  initialReports,
}: ReportsSectionProps) {
  const [reports, setReports] = useState<ReportSummary[]>(initialReports);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          report_type: "weekly",
        }),
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(
          typeof err.error === "string"
            ? err.error
            : "No se pudo generar el reporte",
        );
      }

      const report = (await res.json()) as Report;
      setReports((prev) => [
        {
          id: report.id,
          report_type: report.report_type,
          period_start: report.period_start,
          period_end: report.period_end,
          ai_narrative: report.ai_narrative,
          created_at: report.created_at,
        },
        ...prev,
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al generar reporte",
      );
    } finally {
      setGenerating(false);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("es-GT", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Reportes automáticos
          </CardTitle>
          <CardDescription>
            Reporte semanal con narrativa IA en español guatemalteco
          </CardDescription>
        </div>
        <Button onClick={handleGenerate} disabled={generating} size="sm">
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando…
            </>
          ) : (
            "Generar reporte semanal"
          )}
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}

        {reports.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no hay reportes generados para este proyecto.
          </p>
        ) : (
          <ul className="space-y-3">
            {reports.map((report) => (
              <li
                key={report.id}
                className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    Reporte semanal ·{" "}
                    {report.period_start && report.period_end
                      ? `${report.period_start} — ${report.period_end}`
                      : formatDate(report.created_at)}
                  </p>
                  {report.ai_narrative && (
                    <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                      {report.ai_narrative}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Generado el {formatDate(report.created_at)}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="shrink-0">
                  <a
                    href={`/api/reports/${report.id}/pdf`}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar PDF
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
