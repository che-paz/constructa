import { redirect } from "next/navigation";
import type { Project, ProjectSummary } from "@constructa/types";
import { getAuthContext } from "@/lib/auth/get-organization";
import { computePaymentBalance } from "@/lib/payments/balance";
import { attachReceiptUrls } from "@/lib/payments/receipt-url";
import { createClient } from "@/lib/supabase/server";
import { ProjectDashboard } from "@/components/modules/projects/project-dashboard";

interface Props {
  params: { id: string };
}

export default async function ProjectDetailPage({ params }: Props) {
  const auth = await getAuthContext();
  if (!auth) redirect("/onboarding");

  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*, stages(*)")
    .eq("id", params.id)
    .eq("organization_id", auth.organization.id)
    .is("deleted_at", null)
    .single();

  if (!project) redirect("/projects");

  const { data: stages } = await supabase
    .from("stages")
    .select("progress_pct")
    .eq("project_id", params.id)
    .eq("organization_id", auth.organization.id);

  const stagesList = stages ?? [];
  const progress_pct =
    stagesList.length > 0
      ? Math.round(
          stagesList.reduce((sum, s) => sum + (s.progress_pct ?? 0), 0) /
            stagesList.length,
        )
      : 0;

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("project_id", params.id)
    .eq("organization_id", auth.organization.id)
    .is("deleted_at", null)
    .order("payment_date", { ascending: false });

  const balance = computePaymentBalance(
    project.total_budget,
    project.client_advance,
    payments ?? [],
  );

  const paymentsWithUrls = await attachReceiptUrls(payments ?? []);

  const summary: ProjectSummary = {
    id: project.id,
    name: project.name,
    status: project.status,
    total_budget: project.total_budget,
    client_advance: project.client_advance,
    progress_pct,
    stages_count: stagesList.length,
  };

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
  const clientPortalUrl = project.client_token
    ? `${appUrl}/client/${project.client_token}`
    : null;

  return (
    <ProjectDashboard
      project={
        project as Project & {
          stages?: {
            id: string;
            name: string;
            progress_pct: number;
            status: string;
          }[];
        }
      }
      summary={summary}
      balance={balance}
      payments={paymentsWithUrls}
      clientPortalUrl={clientPortalUrl}
    />
  );
}
