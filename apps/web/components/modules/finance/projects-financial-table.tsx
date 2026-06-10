import Link from "next/link";
import type { ProjectFinancialSummary } from "@constructa/types";
import { formatGtq, projectStatusLabel } from "@constructa/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProjectsFinancialTableProps {
  projects: ProjectFinancialSummary[];
}

function budgetBadge(pct: number) {
  if (pct > 80) return <Badge variant="destructive">{pct}%</Badge>;
  if (pct > 60) return <Badge variant="secondary">{pct}%</Badge>;
  return <Badge variant="outline">{pct}%</Badge>;
}

export function ProjectsFinancialTable({
  projects,
}: ProjectsFinancialTableProps) {
  if (projects.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay proyectos activos para mostrar.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Proyecto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Presupuesto</TableHead>
            <TableHead className="text-right">Cobrado</TableHead>
            <TableHead className="text-right">Gastado</TableHead>
            <TableHead className="text-right">Por cobrar</TableHead>
            <TableHead className="text-right">% gasto</TableHead>
            <TableHead className="text-right">Avance</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.project_id}>
              <TableCell className="font-medium">
                {project.project_name}
                {project.alert && (
                  <span className="ml-2 text-xs text-destructive">⚠</span>
                )}
              </TableCell>
              <TableCell>{projectStatusLabel(project.status)}</TableCell>
              <TableCell className="text-right">
                {project.total_budget != null
                  ? formatGtq(project.total_budget)
                  : "—"}
              </TableCell>
              <TableCell className="text-right">
                {formatGtq(project.total_received)}
              </TableCell>
              <TableCell className="text-right">
                {formatGtq(project.total_spent)}
              </TableCell>
              <TableCell className="text-right">
                {formatGtq(project.pending_receivable)}
              </TableCell>
              <TableCell className="text-right">
                {budgetBadge(project.budget_used_pct)}
              </TableCell>
              <TableCell className="text-right">
                {project.progress_pct}%
              </TableCell>
              <TableCell className="text-right">
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/projects/${project.project_id}`}>Ver</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
