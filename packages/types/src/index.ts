export type UserRole =
  | "constructor"
  | "supervisor"
  | "oficina"
  | "contador"
  | "cliente";

export type OrganizationPlan = "basico" | "profesional" | "empresa";

export type ProjectStatus = "active" | "paused" | "completed" | "cancelled";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: OrganizationPlan;
  max_projects: number;
  max_users: number;
}

export interface UserOrganization {
  id: string;
  user_id: string;
  organization_id: string;
  role: UserRole;
  is_active: boolean;
  organization?: Organization;
}

export interface Project {
  id: string;
  organization_id: string;
  client_id: string | null;
  name: string;
  description: string | null;
  address: string | null;
  municipality: string | null;
  department: string | null;
  status: ProjectStatus;
  start_date: string | null;
  planned_end_date: string | null;
  actual_end_date: string | null;
  total_budget: number | null;
  client_advance: number | null;
  client_token: string | null;
  client_can_see_costs: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProjectSummary {
  id: string;
  name: string;
  status: ProjectStatus;
  total_budget: number | null;
  client_advance: number | null;
  progress_pct: number;
  stages_count: number;
}

export type PaymentMethod =
  | "efectivo"
  | "transferencia"
  | "cheque"
  | "tarjeta"
  | "otro";

export interface Payment {
  id: string;
  organization_id: string;
  project_id: string;
  client_id: string | null;
  amount: number;
  payment_method: PaymentMethod | null;
  reference_number: string | null;
  receipt_url: string | null;
  payment_date: string;
  description: string | null;
  created_by: string;
  created_at: string;
  deleted_at: string | null;
}

export type ExpenseCategory =
  | "materiales"
  | "mano_obra"
  | "transporte"
  | "otros";

export interface Expense {
  id: string;
  organization_id: string;
  project_id: string;
  stage_id: string | null;
  category: ExpenseCategory;
  description: string;
  amount: number;
  supplier_id: string | null;
  invoice_number: string | null;
  invoice_url: string | null;
  expense_date: string;
  reported_via: string;
  created_by: string;
  created_at: string;
  deleted_at: string | null;
}

export interface PaymentBalance {
  total_budget: number | null;
  client_advance: number;
  total_paid: number;
  pending_balance: number;
  payments_count: number;
}

export interface ClientPortalStage {
  id: string;
  name: string;
  progress_pct: number;
  status: string;
}

export interface ClientPortalProject {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  municipality: string | null;
  department: string | null;
  status: ProjectStatus;
  start_date: string | null;
  planned_end_date: string | null;
  total_budget: number | null;
  client_advance: number | null;
  client_can_see_costs: boolean;
  progress_pct: number;
  stages: ClientPortalStage[];
  balance: PaymentBalance;
}

export type StageStatus = "pending" | "in_progress" | "completed" | "delayed";

export interface Stage {
  id: string;
  organization_id: string;
  project_id: string;
  name: string;
  description: string | null;
  order_index: number;
  planned_start: string | null;
  planned_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  progress_pct: number;
  responsible_id: string | null;
  status: StageStatus;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  delay_days?: number;
}

export interface ScheduleSummary {
  project_id: string;
  total_stages: number;
  completed_stages: number;
  delayed_stages: number;
  total_delay_days: number;
  progress_pct: number;
  stages: Stage[];
}

export type MaterialEntryType =
  | "purchase"
  | "consumption"
  | "transfer"
  | "loss"
  | "return";

export interface MaterialCatalog {
  id: string;
  organization_id: string;
  name: string;
  unit: string;
  category: string | null;
  standard_price: number | null;
  created_at: string;
}

export interface MaterialEntry {
  id: string;
  organization_id: string;
  project_id: string;
  stage_id: string | null;
  material_id: string;
  entry_type: MaterialEntryType;
  quantity: number;
  unit_price: number | null;
  total_cost: number | null;
  invoice_number: string | null;
  invoice_url: string | null;
  notes: string | null;
  reported_via: string;
  created_by: string;
  created_at: string;
  deleted_at: string | null;
  material?: MaterialCatalog;
}

export interface MaterialSummaryItem {
  material_id: string;
  material_name: string;
  unit: string;
  expected_quantity: number;
  /** Suma de movimientos tipo consumption + loss en la etapa */
  consumed_quantity: number;
  /** Suma de movimientos tipo purchase en la etapa */
  purchased_quantity: number;
  deviation_pct: number;
  stage_id: string | null;
  stage_name: string | null;
}

export interface MaterialSummary {
  project_id: string;
  items: MaterialSummaryItem[];
  total_expected_cost: number;
  total_actual_cost: number;
}

export interface MaterialAlert {
  material_id: string;
  material_name: string;
  unit: string;
  expected_quantity: number;
  actual_quantity: number;
  deviation_pct: number;
  severity: "medium" | "high";
  message: string;
}

export type WorkerSpecialty =
  | "albanil"
  | "electricista"
  | "plomero"
  | "peon"
  | "carpintero"
  | "herrero"
  | "pintor"
  | "otro";

export interface Worker {
  id: string;
  organization_id: string;
  name: string;
  dpi: string | null;
  phone: string | null;
  specialty: string | null;
  daily_rate: number | null;
  is_active: boolean;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type AttendanceType = "full" | "half" | "absent" | "overtime";

export type CheckInMethod = "manual" | "qr" | "gps" | "face";

export interface WorkerAttendance {
  id: string;
  organization_id: string;
  project_id: string;
  worker_id: string;
  work_date: string;
  check_in: string | null;
  check_out: string | null;
  hours_worked: number | null;
  attendance_type: AttendanceType;
  check_in_method: CheckInMethod;
  amount_paid: number | null;
  is_paid: boolean;
  notes: string | null;
  reported_via: string;
  created_by: string;
  created_at: string;
  worker?: Worker;
}

export interface PayrollDayEntry {
  work_date: string;
  attendance_type: AttendanceType;
  hours_worked: number;
  amount: number;
  is_paid: boolean;
}

export interface PayrollWorkerRow {
  worker_id: string;
  worker_name: string;
  specialty: string | null;
  daily_rate: number;
  days: PayrollDayEntry[];
  total_hours: number;
  total_amount: number;
  paid_amount: number;
  unpaid_amount: number;
}

export interface PayrollSummary {
  project_id: string;
  week_start: string;
  week_end: string;
  rows: PayrollWorkerRow[];
  total_hours: number;
  total_amount: number;
  paid_amount: number;
  unpaid_amount: number;
  workers_count: number;
}

export interface ProjectFinancialBreakdown {
  materials_cost: number;
  payroll_cost: number;
  registered_expenses: number;
}

export interface FinanceAlert {
  project_id: string;
  project_name: string;
  budget_used_pct: number;
  progress_pct: number;
  severity: "high";
  message: string;
}

export interface ProjectFinancialSummary {
  project_id: string;
  project_name: string;
  status: ProjectStatus;
  total_budget: number | null;
  total_received: number;
  total_spent: number;
  breakdown: ProjectFinancialBreakdown;
  remaining_budget: number | null;
  budget_used_pct: number;
  progress_pct: number;
  pending_receivable: number;
  alert: FinanceAlert | null;
}

export interface FinanceDashboardTotals {
  total_budget: number;
  total_received: number;
  total_spent: number;
  total_pending_receivable: number;
  total_remaining_budget: number;
}

export interface FinanceDashboard {
  organization_id: string;
  totals: FinanceDashboardTotals;
  projects: ProjectFinancialSummary[];
  alerts: FinanceAlert[];
}

export type CashflowPeriod = "week" | "month";

export interface CashflowEntry {
  date: string;
  inflows: number;
  outflows: number;
  net: number;
}

export interface CashflowSummary {
  period: CashflowPeriod;
  period_start: string;
  period_end: string;
  project_id: string | null;
  entries: CashflowEntry[];
  total_inflows: number;
  total_outflows: number;
  net: number;
}

export interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIConversation {
  id: string;
  organization_id: string;
  user_id: string;
  project_id: string | null;
  messages: AIChatMessage[];
  tokens_used: number;
  created_at: string;
  updated_at: string;
}

export type ReportType = "weekly" | "monthly" | "milestone";

export interface ReportDataSnapshot {
  project: {
    id: string;
    name: string;
    client_name: string | null;
    status: ProjectStatus;
    progress_pct: number;
  };
  period: {
    start: string;
    end: string;
  };
  financial: ProjectFinancialSummary;
  schedule: {
    total_stages: number;
    completed_stages: number;
    delayed_stages: number;
    stages: Array<{
      name: string;
      status: StageStatus;
      progress_pct: number;
      delay_days: number;
    }>;
  };
  materials: MaterialSummary;
  payroll: {
    week_start: string;
    total_amount: number;
    workers_count: number;
    total_hours: number;
  };
  payments_in_period: number;
  expenses_in_period: number;
}

export interface Report {
  id: string;
  organization_id: string;
  project_id: string;
  report_type: ReportType;
  period_start: string | null;
  period_end: string | null;
  ai_narrative: string | null;
  pdf_url: string | null;
  data_snapshot: ReportDataSnapshot | null;
  created_by: string;
  created_at: string;
}
