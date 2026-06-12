"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type {
  Expense,
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
  WorkerAdvance,
  WorkerAttendance,
} from "@constructa/types";
import { ExpensesSection } from "@/components/modules/expenses/expenses-section";
import { ProjectFinancialDetail } from "@/components/modules/finance/project-financial-detail";
import { formatGtq, projectStatusLabel } from "@constructa/utils";
import { MaterialsSection } from "@/components/modules/materials/materials-section";
import { WorkersSection } from "@/components/modules/workers/workers-section";
import type { MaterialEntryWithInvoiceUrl } from "@/components/modules/materials/material-inventory-table";
import { PaymentsSection } from "@/components/modules/payments/payments-section";
import type { PaymentWithReceiptUrl } from "@/components/modules/payments/payment-list";
import { StagesSection } from "@/components/modules/schedule/stages-section";
import { ReportsSection } from "@/components/modules/reports/reports-section";
import { MaterialAlertBanner } from "@/components/modules/materials/material-alert-banner";
import {
  FinanceSubNav,
  isValidProjectTab,
  ProjectTabNav,
  type ProjectTabId,
} from "@/components/modules/projects/project-tab-nav";
import { Badge } from "@/components/ui/badge";
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
  advances: WorkerAdvance[];
  payroll: PayrollSummary;
  financialSummary: ProjectFinancialSummary;
  expenses: Expense[];
  reports: ReportSummary[];
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
  advances,
  payroll,
  financialSummary,
  expenses,
  reports,
  clientPortalUrl,
}: ProjectDashboardProps) {
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [financeSection, setFinanceSection] = useState<"pagos" | "gastos">(
    "pagos",
  );

  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<ProjectTabId>(() =>
    isValidProjectTab(initialTab) ? initialTab : "resumen",
  );

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
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">
              {project.name}
            </h1>
            <Badge className="shrink-0">{projectStatusLabel(project.status)}</Badge>
          </div>
          {location && (
            <p className="mt-1 text-sm text-muted-foreground">{location}</p>
          )}
        </div>
        <Button asChild variant="outline" className="w-full shrink-0 sm:w-auto">
          <Link href={`/projects/${project.id}/edit`}>Editar proyecto</Link>
        </Button>
      </div>

      <ProjectTabNav
        activeTab={activeTab}
        onTabChange={(tab) => startTransition(() => setActiveTab(tab))}
        materialAlertCount={materialAlerts.length}
      />

      <div
        className={isPending ? "opacity-60 transition-opacity duration-150" : undefined}
      >
      {activeTab === "resumen" && (
        <div className="space-y-6 pt-2">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <Card className="min-w-0">
              <CardHeader className="pb-2">
                <CardDescription>Avance general</CardDescription>
                <CardTitle className="text-xl font-semibold tabular-nums leading-tight md:text-3xl">
                  {summary.progress_pct}%
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="min-w-0">
              <CardHeader className="pb-2">
                <CardDescription>Presupuesto</CardDescription>
                <CardTitle className="text-sm font-semibold tabular-nums leading-tight sm:text-base md:text-xl">
                  {project.total_budget != null
                    ? formatGtq(budget)
                    : "Sin definir"}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="min-w-0">
              <CardHeader className="pb-2">
                <CardDescription>Gastado</CardDescription>
                <CardTitle className="text-sm font-semibold tabular-nums leading-tight sm:text-base md:text-xl">
                  {formatGtq(financialSummary.total_spent)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="min-w-0">
              <CardHeader className="pb-2">
                <CardDescription>Saldo pendiente</CardDescription>
                <CardTitle className="text-sm font-semibold tabular-nums leading-tight sm:text-base md:text-xl">
                  {formatGtq(balance.pending_balance)}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {materialAlerts.length > 0 && (
            <MaterialAlertBanner alerts={materialAlerts} />
          )}

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

          <div className="grid gap-4 sm:grid-cols-3">
            <Card
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => setActiveTab("cronograma")}
            >
              <CardHeader className="pb-2">
                <CardDescription>Cronograma</CardDescription>
                <CardTitle className="text-lg">
                  {schedule.completed_stages}/{schedule.total_stages} etapas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {schedule.delayed_stages > 0
                    ? `${schedule.delayed_stages} con atraso crítico`
                    : "Sin retrasos críticos"}
                </p>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => setActiveTab("materiales")}
            >
              <CardHeader className="pb-2">
                <CardDescription>Materiales</CardDescription>
                <CardTitle className="text-lg">
                  {materialEntries.length} movimientos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {materialAlerts.length > 0
                    ? `${materialAlerts.length} alerta(s) de desvío`
                    : "Consumo bajo control"}
                </p>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => setActiveTab("personal")}
            >
              <CardHeader className="pb-2">
                <CardDescription>Personal</CardDescription>
                <CardTitle className="text-lg">
                  {payroll.workers_count} trabajadores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Planilla semana: {formatGtq(payroll.total_amount)}
                </p>
              </CardContent>
            </Card>
          </div>

          {clientPortalUrl && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">Portal del cliente</CardTitle>
                  <CardDescription>
                    Comparte el avance y pagos con tu cliente
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("cliente")}
                >
                  Gestionar
                </Button>
              </CardHeader>
            </Card>
          )}

          <ProjectDatesFooter project={project} />
        </div>
      )}

      {activeTab === "cronograma" && (
        <div className="pt-2">
          <StagesSection projectId={project.id} schedule={schedule} />
        </div>
      )}

      {activeTab === "materiales" && (
        <div className="pt-2">
          <MaterialsSection
            projectId={project.id}
            catalog={catalog}
            stages={schedule.stages as Stage[]}
            entries={materialEntries}
            summary={materialSummary}
            alerts={materialAlerts}
          />
        </div>
      )}

      {activeTab === "personal" && (
        <div className="pt-2">
          <WorkersSection
            projectId={project.id}
            workers={workers}
            attendance={attendance}
            advances={advances}
            payroll={payroll}
          />
        </div>
      )}

      {activeTab === "finanzas" && (
        <div className="space-y-6 pt-2">
          <FinanceSubNav active={financeSection} onChange={setFinanceSection} />
          {financeSection === "pagos" ? (
            <PaymentsSection
              projectId={project.id}
              balance={balance}
              payments={payments}
            />
          ) : (
            <ExpensesSection projectId={project.id} expenses={expenses} />
          )}
        </div>
      )}

      {activeTab === "cliente" && (
        <div className="pt-2">
          {clientPortalUrl ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Portal del cliente</CardTitle>
                <CardDescription>
                  Comparte este enlace con tu cliente para que vea el avance y
                  los pagos de su obra
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
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Este proyecto no tiene token de portal configurado. Edita el
                proyecto para habilitarlo.
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "reportes" && (
        <div className="pt-2">
          <ReportsSection projectId={project.id} initialReports={reports} />
        </div>
      )}
      </div>
    </div>
  );
}

function ProjectDatesFooter({ project }: { project: Project }) {
  if (!project.start_date && !project.planned_end_date) return null;

  return (
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
  );
}
