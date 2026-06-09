import { redirect } from "next/navigation";
import type { Project } from "@constructa/types";
import { getAuthContext } from "@/lib/auth/get-organization";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectForm } from "@/components/modules/projects/project-form";

interface Props {
  params: { id: string };
}

export default async function EditProjectPage({ params }: Props) {
  const auth = await getAuthContext();
  if (!auth) redirect("/onboarding");

  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", params.id)
    .eq("organization_id", auth.organization.id)
    .is("deleted_at", null)
    .single();

  if (!project) redirect("/projects");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Editar proyecto"
        description={project.name}
      />
      <ProjectForm mode="edit" project={project as Project} />
    </div>
  );
}
