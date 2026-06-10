"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  MaterialAlert,
  MaterialCatalog,
  MaterialSummary,
  PaymentBalance,
  PayrollSummary,
  Project,
  ProjectFinancialSummary,
  ProjectSummary,
  ScheduleSummary,
  Stage,
  Worker,
  WorkerAttendance,
} from "@constructa/types";
import { ProjectFinancialDetail } from "@/components/modules/finance/project-financial-detail";
import { formatGtq, projectStatusLabel } from "@constructa/utils";
import { MaterialsSection } from "@/components/modules/materials/materials-section";
import { WorkersSection } from "@/components/modules/workers/workers-section";
import type { MaterialEntryWithInvoiceUrl } from "@/components/modules/materials/material-inventory-table";
import {
  PaymentsSection,
} from "@/components/modules/payments/payments-section";
import type { PaymentWithReceiptUrl } from "@/components/modules/payments/payment-list";
import { StagesSection } from "@/components/modules/schedule/stages-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProjectDashboardProps {
  project: Project;
  summary: ProjectSummary;
  schedule: ScheduleSummary;
  balance: PaymentBalance;
  payments: PaymentWithReceiptUrl[];
  catalog: MaterialCatalog[];
  materialEntries: MaterialEntryWithInvoiceUrl[];
  materialSummary: MaterialSummary;
  materialAlerts: MaterialAlert[];
  workers: Worker[];
  attendance: WorkerAttendance[];
  payroll: PayrollSummary;
  financialSummary: ProjectFinancialSummary;
  clientPortalUrl: string | null;
}

export function ProjectDashboard({
  project,
  summary,
  schedule,
  balance,
  payments,
  catalog,
  materialEntries,
  materialSummary,
  materialAlerts,
  workers,
  attendance,
  payroll,
  financialSummary,
  clientPortalUrl,
}: ProjectDashboardProps) {
  const [copied, setCopied] = useState(false);

  const location = [project.address, project.municipality, project.department]
    .filter(Boolean)
    .join(" · ");

  const budget = Number(project.total_budget ?? 0);

  async function copyPortalLink() {
    if (!clientPortalUrl) return;
    await navigator.clipboard.writeText(clientPortalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            <Badge>{projectStatusLabel(project.status)}</Badge>
          </div>
          {location && (
            <p className="mt-1 text-sm text-muted-foreground">{location}</p>
          )}
        </div>
        <Button asChild variant="outline">
          <Link href={`/projects/${project.id}/edit`}>Editar proyecto</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avance general</CardDescription>
            <CardTitle className="text-3xl">{summary.progress_pct}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Presupuesto</CardDescription>
            <CardTitle className="text-2xl">
              {project.total_budget != null
                ? formatGtq(budget)
                : "Sin definir"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Anticipo acordado</CardDescription>
            <CardTitle className="text-2xl">
              {formatGtq(balance.client_advance)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Saldo pendiente de la obra</CardDescription>
            <CardTitle className="text-2xl">
              {formatGtq(balance.pending_balance)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {project.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Descripción</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {project.description}
            </p>
          </CardContent>
        </Card>
      )}

      <ProjectFinancialDetail summary={financialSummary} />

      <StagesSection projectId={project.id} schedule={schedule} />

      <MaterialsSection
        projectId={project.id}
        catalog={catalog}
        stages={schedule.stages as Stage[]}
        entries={materialEntries}
        summary={materialSummary}
        alerts={materialAlerts}
      />

      <WorkersSection
        projectId={project.id}
        workers={workers}
        attendance={attendance}
        payroll={payroll}
      />

      {clientPortalUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Portal del cliente</CardTitle>
            <CardDescription>
              Comparte este enlace con tu cliente para que vea el avance y los
              pagos
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <code className="flex-1 truncate rounded-md bg-muted px-3 py-2 text-xs">
              {clientPortalUrl}
            </code>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={copyPortalLink}>
                {copied ? "Copiado" : "Copiar enlace"}
              </Button>
              <Button asChild variant="secondary">
                <Link href={clientPortalUrl} target="_blank">
                  Abrir portal
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <PaymentsSection
        projectId={project.id}
        balance={balance}
        payments={payments}
      />

      <div className="flex gap-2 text-sm text-muted-foreground">
        {project.start_date && (
          <span>
            Inicio:{" "}
            {new Date(project.start_date).toLocaleDateString("es-GT")}
          </span>
        )}
        {project.planned_end_date && (
          <span>
            · Fin previsto:{" "}
            {new Date(project.planned_end_date).toLocaleDateString("es-GT")}
          </span>
        )}
      </div>
    </div>
  );
}
