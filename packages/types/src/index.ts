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
