import Link from "next/link";
import type { Project } from "@constructa/types";
import { formatGtq, projectStatusLabel } from "@constructa/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  active: "default",
  paused: "secondary",
  completed: "outline",
  cancelled: "destructive",
};

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const location = [project.municipality, project.department]
    .filter(Boolean)
    .join(", ");

  return (
    <Link href={`/projects/${project.id}`} prefetch scroll={false}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <Badge variant={STATUS_VARIANT[project.status] ?? "secondary"}>
              {projectStatusLabel(project.status)}
            </Badge>
          </div>
          {location && (
            <CardDescription>{location}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          {project.total_budget != null && (
            <p>
              Presupuesto:{" "}
              <span className="font-medium text-foreground">
                {formatGtq(Number(project.total_budget))}
              </span>
            </p>
          )}
          {project.start_date && (
            <p>
              Inicio:{" "}
              {new Date(project.start_date).toLocaleDateString("es-GT")}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
