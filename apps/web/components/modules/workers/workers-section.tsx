"use client";

import { useState } from "react";
import type {
  PayrollSummary,
  Worker,
  WorkerAdvance,
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
import { AdvanceForm } from "./advance-form";
import { AttendanceForm } from "./attendance-form";
import { PayrollTable } from "./payroll-table";
import { WorkerForm } from "./worker-form";
import { WorkerHistory } from "./worker-history";
import { WorkerList } from "./worker-list";

interface WorkersSectionProps {
  projectId: string;
  workers: Worker[];
  attendance: WorkerAttendance[];
  advances: WorkerAdvance[];
  payroll: PayrollSummary;
}

export function WorkersSection({
  projectId,
  workers,
  attendance,
  advances,
  payroll,
}: WorkersSectionProps) {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(
    null,
  );
  const [weekStart, setWeekStart] = useState(payroll.week_start);

  const selectedWorker = workers.find((w) => w.id === selectedWorkerId) ?? null;

  const workersHint =
    workers.length > 0 ? (
      <p className="text-sm text-muted-foreground">
        {workers.length} trabajador{workers.length === 1 ? "" : "es"} en la
        organización
      </p>
    ) : undefined;

  return (
    <div className="space-y-4 md:space-y-6">
      <CollapsibleFormSection
        title="Personal de la organización"
        description="Trabajadores compartidos entre proyectos — jornal o contrato por tarea"
        actionLabel="Agregar trabajador"
        collapsedHint={workersHint}
      >
        <WorkerForm />
      </CollapsibleFormSection>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Equipo asignado</CardTitle>
          <CardDescription>
            Selecciona un trabajador para ver su historial de asistencia y
            adelantos
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
        description="Jornal diario con horas, o monto manual si es por contrato"
        actionLabel="Registrar asistencia"
      >
        <AttendanceForm projectId={projectId} workers={workers} />
      </CollapsibleFormSection>

      <CollapsibleFormSection
        title="Registrar adelanto"
        description="Anticipo al trabajador — se descuenta al cierre de la semana"
        actionLabel="Registrar adelanto"
      >
        <AdvanceForm
          projectId={projectId}
          workers={workers}
          advances={advances}
          weekStart={weekStart}
        />
      </CollapsibleFormSection>

      <PayrollTable
        projectId={projectId}
        initialPayroll={payroll}
        onWeekChange={setWeekStart}
      />

      {selectedWorker && (
        <WorkerHistory
          worker={selectedWorker}
          attendance={attendance}
          advances={advances}
        />
      )}
    </div>
  );
}
