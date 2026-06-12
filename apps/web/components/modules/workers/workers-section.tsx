"use client";

import { useState } from "react";
import type {
  PayrollSummary,
  Worker,
  WorkerAttendance,
} from "@constructa/types";
import { CollapsibleFormSection } from "@/components/shared/collapsible-form-section";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AttendanceForm } from "./attendance-form";
import { PayrollTable } from "./payroll-table";
import { WorkerForm } from "./worker-form";
import { WorkerHistory } from "./worker-history";
import { WorkerList } from "./worker-list";

interface WorkersSectionProps {
  projectId: string;
  workers: Worker[];
  attendance: WorkerAttendance[];
  payroll: PayrollSummary;
}

export function WorkersSection({
  projectId,
  workers,
  attendance,
  payroll,
}: WorkersSectionProps) {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(
    null,
  );

  const selectedWorker = workers.find((w) => w.id === selectedWorkerId) ?? null;

  const workersHint =
    workers.length > 0 ? (
      <p className="text-sm text-muted-foreground">
        {workers.length} trabajador{workers.length === 1 ? "" : "es"} activo
        {workers.length === 1 ? "" : "s"} en la organización
      </p>
    ) : undefined;

  return (
    <div className="space-y-4 md:space-y-6">
      <CollapsibleFormSection
        title="Personal de la organización"
        description="Trabajadores compartidos entre proyectos — jornal en quetzales (GTQ)"
        actionLabel="Agregar trabajador"
        collapsedHint={workersHint}
      >
        <WorkerForm />
      </CollapsibleFormSection>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Equipo asignado</CardTitle>
          <CardDescription>
            Selecciona un trabajador para ver su historial de asistencia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WorkerList
            workers={workers}
            selectedWorkerId={selectedWorkerId}
            onSelectWorker={setSelectedWorkerId}
          />
        </CardContent>
      </Card>

      <CollapsibleFormSection
        title="Registrar asistencia"
        description="Marca entrada, salida y tipo de jornada para este proyecto"
        actionLabel="Registrar asistencia"
      >
        <AttendanceForm projectId={projectId} workers={workers} />
      </CollapsibleFormSection>

      <PayrollTable projectId={projectId} initialPayroll={payroll} />

      {selectedWorker && (
        <WorkerHistory worker={selectedWorker} attendance={attendance} />
      )}
    </div>
  );
}
