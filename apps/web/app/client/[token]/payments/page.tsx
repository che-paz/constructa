import { notFound } from "next/navigation";
import { getProjectByClientToken } from "@/lib/client-portal/get-project-by-token";
import { getClientReceiptSignedUrl } from "@/lib/client-portal/receipt-url";
import { createAdminClient } from "@/lib/supabase/admin";
import { ClientPaymentsList } from "@/components/modules/client-portal/client-payments-list";

interface Props {
  params: { token: string };
}

export default async function ClientPaymentsPage({ params }: Props) {
  const project = await getProjectByClientToken(params.token);
  if (!project) notFound();

  const supabase = createAdminClient();
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("project_id", project.id)
    .is("deleted_at", null)
    .order("payment_date", { ascending: false });

  const paymentsWithUrls = await Promise.all(
    (payments ?? []).map(async (payment) => ({
      ...payment,
      receipt_signed_url: await getClientReceiptSignedUrl(payment.receipt_url),
    })),
  );

  return (
    <ClientPaymentsList
      projectName={project.name}
      token={params.token}
      balance={project.balance}
      payments={paymentsWithUrls}
    />
  );
}
