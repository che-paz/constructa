import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Project } from "@constructa/types";
import { getAuthContext } from "@/lib/auth/get-organization";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectCard } from "@/components/modules/projects/project-card";
import { ProjectFilters } from "@/components/modules/projects/project-filters";

interface Props {
  searchParams: { status?: string; search?: string };
}

export default async function ProjectsPage({ searchParams }: Props) {
  const auth = await getAuthContext();
  if (!auth) redirect("/onboarding");

  const supabase = await createClient();
  let query = supabase
    .from("projects")
    .select("*")
    .eq("organization_id", auth.organization.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (searchParams.status) {
    query = query.eq("status", searchParams.status);
  }

  if (searchParams.search) {
    query = query.ilike("name", `%${searchParams.search}%`);
  }

  const { data: projects } = await query;
  const projectList = (projects ?? []) as Project[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proyectos"
        description={`${projectList.length} de ${auth.organization.max_projects} proyectos en tu plan`}
        action={{ label: "Nuevo proyecto", href: "/projects/new" }}
      />

      <Suspense fallback={null}>
        <ProjectFilters />
      </Suspense>

      {projectList.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            {searchParams.search || searchParams.status
              ? "No hay proyectos que coincidan con los filtros."
              : "Aún no tienes proyectos. Crea el primero para empezar."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projectList.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
