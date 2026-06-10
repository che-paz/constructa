import { createClient } from "@/lib/supabase/server";

export async function fetchOrgFinancialData(organizationId: string) {
  const supabase = await createClient();

  const [
    { data: projects, error: projectsError },
    { data: payments, error: paymentsError },
    { data: expenses, error: expensesError },
    { data: materials, error: materialsError },
    { data: attendance, error: attendanceError },
    { data: stages, error: stagesError },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, status, total_budget, client_advance")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    supabase
      .from("payments")
      .select("project_id, amount, payment_date")
      .eq("organization_id", organizationId)
      .is("deleted_at", null),
    supabase
      .from("expenses")
      .select("project_id, amount, expense_date")
      .eq("organization_id", organizationId)
      .is("deleted_at", null),
    supabase
      .from("material_entries")
      .select("project_id, total_cost, created_at")
      .eq("organization_id", organizationId)
      .is("deleted_at", null),
    supabase
      .from("worker_attendance")
      .select("project_id, amount_paid, work_date")
      .eq("organization_id", organizationId),
    supabase
      .from("stages")
      .select("project_id, progress_pct")
      .eq("organization_id", organizationId),
  ]);

  if (
    projectsError ||
    paymentsError ||
    expensesError ||
    materialsError ||
    attendanceError ||
    stagesError
  ) {
    throw (
      projectsError ??
      paymentsError ??
      expensesError ??
      materialsError ??
      attendanceError ??
      stagesError
    );
  }

  return {
    projects: projects ?? [],
    payments: payments ?? [],
    expenses: expenses ?? [],
    materials: materials ?? [],
    attendance: attendance ?? [],
    stages: stages ?? [],
  };
}
