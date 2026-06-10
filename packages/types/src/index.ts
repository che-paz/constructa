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
