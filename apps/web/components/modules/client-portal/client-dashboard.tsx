import Link from "next/link";
import type { ClientPortalProject } from "@constructa/types";
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

interface ClientDashboardProps {
  project: ClientPortalProject;
  token: string;
}

export function ClientDashboard({ project, token }: ClientDashboardProps) {
  const location = [project.address, project.municipality, project.department]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          <Badge variant="secondary">{projectStatusLabel(project.status)}</Badge>
        </div>
        {location && (
          <p className="mt-1 text-sm text-muted-foreground">{location}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avance de la obra</CardDescription>
            <CardTitle className="text-3xl">{project.progress_pct}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pagos registrados</CardDescription>
            <CardTitle className="text-2xl">
              {formatGtq(project.balance.total_paid)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Saldo pendiente de la obra</CardDescription>
            <CardTitle className="text-2xl">
              {formatGtq(project.balance.pending_balance)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {project.client_can_see_costs && project.total_budget != null && (
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Presupuesto total</CardDescription>
            <CardTitle className="text-2xl">
              {formatGtq(Number(project.total_budget))}
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {project.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Descripción</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{project.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cronograma</CardTitle>
          <CardDescription>
            {project.stages.length === 0
              ? "Sin etapas registradas aún"
              : `${project.stages.length} etapas`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {project.stages.length > 0 ? (
            <ul className="space-y-3">
              {project.stages.map((stage, index) => (
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
              El cronograma se publicará próximamente.
            </p>
          )}
        </CardContent>
      </Card>

      <Button asChild>
        <Link href={`/client/${token}/payments`}>Ver historial de pagos</Link>
      </Button>
    </div>
  );
}
