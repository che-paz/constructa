import { PageHeader } from "@/components/shared/page-header";
import { ProjectForm } from "@/components/modules/projects/project-form";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Nuevo proyecto"
        description="Registra una nueva obra en tu constructora"
      />
      <ProjectForm mode="create" />
    </div>
  );
}
