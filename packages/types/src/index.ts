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
