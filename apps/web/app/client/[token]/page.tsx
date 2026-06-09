import { notFound } from "next/navigation";
import { getProjectByClientToken } from "@/lib/client-portal/get-project-by-token";
import { ClientDashboard } from "@/components/modules/client-portal/client-dashboard";

interface Props {
  params: { token: string };
}

export default async function ClientPortalPage({ params }: Props) {
  const project = await getProjectByClientToken(params.token);
  if (!project) notFound();

  return <ClientDashboard project={project} token={params.token} />;
}
