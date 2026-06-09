import Link from "next/link";
import type { Project, ProjectSummary } from "@constructa/types";
import { formatGtq, projectStatusLabel } from "@constructa/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Stage {
  id: string;
  name: string;
  progress_pct: number;
  status: string;
}

interface ProjectWithStages extends Project {
  stages?: Stage[];
}

interface ProjectDashboardProps {
  project: ProjectWithStages;
  summary: ProjectSummary;
}

export function ProjectDashboard({ project, summary }: ProjectDashboardProps) {
  const location = [project.address, project.municipality, project.department]
    .filter(Boolean)
    .join(" · ");

  const budget = Number(project.total_budget ?? 0);
  const advance = Number(project.client_advance ?? 0);
  const pending = budget - advance;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            <Badge>{projectStatusLabel(project.status)}</Badge>
          </div>
          {location && (
            <p className="mt-1 text-sm text-muted-foreground">{location}</p>
          )}
        </div>
        <Button asChild variant="outline">
          <Link href={`/projects/${project.id}/edit`}>Editar proyecto</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avance general</CardDescription>
            <CardTitle className="text-3xl">{summary.progress_pct}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Presupuesto</CardDescription>
            <CardTitle className="text-2xl">
              {project.total_budget != null
                ? formatGtq(budget)
                : "Sin definir"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Anticipo recibido</CardDescription>
            <CardTitle className="text-2xl">{formatGtq(advance)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pendiente por cobrar</CardDescription>
            <CardTitle className="text-2xl">
              {project.total_budget != null
                ? formatGtq(Math.max(pending, 0))
                : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {project.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Descripción</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {project.description}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cronograma</CardTitle>
          <CardDescription>
            {summary.stages_count === 0
              ? "Sin etapas registradas aún"
              : `${summary.stages_count} etapas`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {project.stages && project.stages.length > 0 ? (
            <ul className="space-y-3">
              {project.stages
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((stage, index) => (
                  <li key={stage.id}>
                    {index > 0 && <Separator className="mb-3" />}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{stage.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {stage.progress_pct}%
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Las etapas del cronograma se configurarán en el Sprint 03.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2 text-sm text-muted-foreground">
        {project.start_date && (
          <span>
            Inicio:{" "}
            {new Date(project.start_date).toLocaleDateString("es-GT")}
          </span>
        )}
        {project.planned_end_date && (
          <span>
            · Fin previsto:{" "}
            {new Date(project.planned_end_date).toLocaleDateString("es-GT")}
          </span>
        )}
      </div>
    </div>
  );
}
