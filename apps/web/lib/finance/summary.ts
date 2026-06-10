import type {
  CashflowEntry,
  CashflowPeriod,
  CashflowSummary,
  FinanceDashboard,
  FinanceDashboardTotals,
  ProjectFinancialBreakdown,
  ProjectFinancialSummary,
  ProjectStatus,
} from "@constructa/types";
import {
  calculateBudgetUsedPct,
  calculatePaymentBalance,
  calculateProjectSpent,
  calculateRemainingBudget,
  detectBudgetAlert,
  getMonthEnd,
  getMonthStart,
  getWeekEnd,
  getWeekStart,
} from "@constructa/utils";

interface ProjectRow {
  id: string;
  name: string;
  status: ProjectStatus;
  total_budget: number | null;
  client_advance: number | null;
}

interface PaymentRow {
  project_id: string;
  amount: number;
  payment_date: string;
}

interface ExpenseRow {
  project_id: string;
  amount: number;
  expense_date: string;
}

interface MaterialRow {
  project_id: string;
  total_cost: number | null;
  created_at: string;
}

interface AttendanceRow {
  project_id: string;
  amount_paid: number | null;
  work_date: string;
}

interface StageProgressRow {
  project_id: string;
  progress_pct: number;
}

function sumAmounts(rows: { amount: number }[]): number {
  return rows.reduce((sum, row) => sum + Number(row.amount), 0);
}

function sumMaterialCosts(rows: MaterialRow[]): number {
  return rows.reduce((sum, row) => sum + Number(row.total_cost ?? 0), 0);
}

function sumPayrollCosts(rows: AttendanceRow[]): number {
  return rows.reduce((sum, row) => sum + Number(row.amount_paid ?? 0), 0);
}

function averageProgress(stages: StageProgressRow[]): number {
  if (stages.length === 0) return 0;
  const total = stages.reduce((sum, s) => sum + Number(s.progress_pct ?? 0), 0);
  return Math.round(total / stages.length);
}

export function buildProjectBreakdown(
  materials: MaterialRow[],
  attendance: AttendanceRow[],
  expenses: ExpenseRow[],
): ProjectFinancialBreakdown {
  return {
    materials_cost: sumMaterialCosts(materials),
    payroll_cost: sumPayrollCosts(attendance),
    registered_expenses: sumAmounts(expenses),
  };
}

export function buildProjectFinancialSummary(
  project: ProjectRow,
  payments: PaymentRow[],
  expenses: ExpenseRow[],
  materials: MaterialRow[],
  attendance: AttendanceRow[],
  stages: StageProgressRow[],
): ProjectFinancialSummary {
  const breakdown = buildProjectBreakdown(materials, attendance, expenses);
  const total_spent = calculateProjectSpent(breakdown);
  const total_received = sumAmounts(payments);
  const progress_pct = averageProgress(stages);
  const budget_used_pct = calculateBudgetUsedPct(
    total_spent,
    project.total_budget,
  );
  const balance = calculatePaymentBalance(
    project.total_budget,
    project.client_advance,
    payments,
  );

  const alert = detectBudgetAlert({
    project_id: project.id,
    project_name: project.name,
    budget_used_pct,
    progress_pct,
  });

  return {
    project_id: project.id,
    project_name: project.name,
    status: project.status,
    total_budget: project.total_budget,
    total_received,
    total_spent,
    breakdown,
    remaining_budget: calculateRemainingBudget(project.total_budget, total_spent),
    budget_used_pct,
    progress_pct,
    pending_receivable: balance.pending_balance,
    alert,
  };
}

export function buildFinanceDashboard(
  organizationId: string,
  projects: ProjectRow[],
  payments: PaymentRow[],
  expenses: ExpenseRow[],
  materials: MaterialRow[],
  attendance: AttendanceRow[],
  stages: StageProgressRow[],
): FinanceDashboard {
  const summaries = projects.map((project) =>
    buildProjectFinancialSummary(
      project,
      payments.filter((p) => p.project_id === project.id),
      expenses.filter((e) => e.project_id === project.id),
      materials.filter((m) => m.project_id === project.id),
      attendance.filter((a) => a.project_id === project.id),
      stages.filter((s) => s.project_id === project.id),
    ),
  );

  const totals: FinanceDashboardTotals = summaries.reduce(
    (acc, summary) => ({
      total_budget: acc.total_budget + Number(summary.total_budget ?? 0),
      total_received: acc.total_received + summary.total_received,
      total_spent: acc.total_spent + summary.total_spent,
      total_pending_receivable:
        acc.total_pending_receivable + summary.pending_receivable,
      total_remaining_budget:
        acc.total_remaining_budget + Number(summary.remaining_budget ?? 0),
    }),
    {
      total_budget: 0,
      total_received: 0,
      total_spent: 0,
      total_pending_receivable: 0,
      total_remaining_budget: 0,
    },
  );

  const alerts = summaries
    .map((s) => s.alert)
    .filter((a): a is NonNullable<typeof a> => a != null);

  return {
    organization_id: organizationId,
    totals,
    projects: summaries,
    alerts,
  };
}

function inDateRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

function resolvePeriodBounds(
  period: CashflowPeriod,
  referenceDate?: string,
): { start: string; end: string } {
  if (period === "week") {
    const start = getWeekStart(referenceDate);
    return { start, end: getWeekEnd(start) };
  }
  const start = getMonthStart(referenceDate);
  return { start, end: getMonthEnd(referenceDate) };
}

function groupCashflowByDate(
  start: string,
  end: string,
  payments: PaymentRow[],
  expenses: ExpenseRow[],
  materials: MaterialRow[],
  attendance: AttendanceRow[],
): CashflowEntry[] {
  const dates: string[] = [];
  const cursor = new Date(`${start}T12:00:00`);
  const limit = new Date(`${end}T12:00:00`);

  while (cursor <= limit) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates.map((date) => {
    const inflows = payments
      .filter((p) => p.payment_date === date)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const expenseOut = expenses
      .filter((e) => e.expense_date === date)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const materialOut = materials
      .filter((m) => m.created_at.slice(0, 10) === date)
      .reduce((sum, m) => sum + Number(m.total_cost ?? 0), 0);

    const payrollOut = attendance
      .filter((a) => a.work_date === date)
      .reduce((sum, a) => sum + Number(a.amount_paid ?? 0), 0);

    const outflows = expenseOut + materialOut + payrollOut;
    return {
      date,
      inflows,
      outflows,
      net: inflows - outflows,
    };
  });
}

export function buildCashflowSummary(
  period: CashflowPeriod,
  payments: PaymentRow[],
  expenses: ExpenseRow[],
  materials: MaterialRow[],
  attendance: AttendanceRow[],
  options?: { projectId?: string; referenceDate?: string },
): CashflowSummary {
  const { start, end } = resolvePeriodBounds(period, options?.referenceDate);

  const filterProject = <T extends { project_id: string }>(rows: T[]) =>
    options?.projectId
      ? rows.filter((r) => r.project_id === options.projectId)
      : rows;

  const scopedPayments = filterProject(payments).filter((p) =>
    inDateRange(p.payment_date, start, end),
  );
  const scopedExpenses = filterProject(expenses).filter((e) =>
    inDateRange(e.expense_date, start, end),
  );
  const scopedMaterials = filterProject(materials).filter((m) =>
    inDateRange(m.created_at.slice(0, 10), start, end),
  );
  const scopedAttendance = filterProject(attendance).filter((a) =>
    inDateRange(a.work_date, start, end),
  );

  const entries = groupCashflowByDate(
    start,
    end,
    scopedPayments,
    scopedExpenses,
    scopedMaterials,
    scopedAttendance,
  );

  const total_inflows = entries.reduce((sum, e) => sum + e.inflows, 0);
  const total_outflows = entries.reduce((sum, e) => sum + e.outflows, 0);

  return {
    period,
    period_start: start,
    period_end: end,
    project_id: options?.projectId ?? null,
    entries,
    total_inflows,
    total_outflows,
    net: total_inflows - total_outflows,
  };
}

export function financialSummaryToCsv(
  dashboard: FinanceDashboard,
): string {
  const header = [
    "Proyecto",
    "Estado",
    "Presupuesto",
    "Cobrado",
    "Gastado",
    "Materiales",
    "Planilla",
    "Gastos registrados",
    "Saldo presupuesto",
    "% presupuesto usado",
    "% avance",
    "Por cobrar",
  ].join(",");

  const rows = dashboard.projects.map((p) =>
    [
      `"${p.project_name.replace(/"/g, '""')}"`,
      p.status,
      p.total_budget ?? "",
      p.total_received,
      p.total_spent,
      p.breakdown.materials_cost,
      p.breakdown.payroll_cost,
      p.breakdown.registered_expenses,
      p.remaining_budget ?? "",
      p.budget_used_pct,
      p.progress_pct,
      p.pending_receivable,
    ].join(","),
  );

  return [header, ...rows].join("\n");
}
