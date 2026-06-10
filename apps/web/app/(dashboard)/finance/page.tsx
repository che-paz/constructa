import { redirect } from "next/navigation";
import { FinanceDashboardView } from "@/components/modules/finance/finance-dashboard";
import { getAuthContext } from "@/lib/auth/get-organization";
import { fetchOrgFinancialData } from "@/lib/finance/fetch-org-financial-data";
import {
  buildCashflowSummary,
  buildFinanceDashboard,
} from "@/lib/finance/summary";

export default async function FinancePage() {
  const auth = await getAuthContext();
  if (!auth) redirect("/onboarding");

  const data = await fetchOrgFinancialData(auth.organization.id);
  const dashboard = buildFinanceDashboard(
    auth.organization.id,
    data.projects,
    data.payments,
    data.expenses,
    data.materials,
    data.attendance,
    data.stages,
  );
  const cashflow = buildCashflowSummary(
    "month",
    data.payments,
    data.expenses,
    data.materials,
    data.attendance,
  );

  return (
    <FinanceDashboardView dashboard={dashboard} initialCashflow={cashflow} />
  );
}
