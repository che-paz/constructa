import type { ScheduleSummary } from "@constructa/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StageForm } from "./stage-form";
import { StageList } from "./stage-list";

interface StagesSectionProps {
  projectId: string;
  schedule: ScheduleSummary;
}

export function StagesSection({ projectId, schedule }: StagesSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Etapas</CardDescription>
            <CardTitle className="text-2xl">{schedule.total_stages}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completadas</CardDescription>
            <CardTitle className="text-2xl">
              {schedule.completed_stages}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Con atraso crítico (&gt;5d)</CardDescription>
            <CardTitle className="text-2xl text-destructive">
              {schedule.delayed_stages}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avance cronograma</CardDescription>
            <CardTitle className="text-2xl">{schedule.progress_pct}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agregar etapa</CardTitle>
          <CardDescription>
            Plantillas guatemaltecas o nombre personalizado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StageForm projectId={projectId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cronograma</CardTitle>
          <CardDescription>
            {schedule.total_stages === 0
              ? "Sin etapas registradas"
              : `${schedule.total_delay_days} días de atraso acumulado`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StageList stages={schedule.stages} />
        </CardContent>
      </Card>
    </div>
  );
}
