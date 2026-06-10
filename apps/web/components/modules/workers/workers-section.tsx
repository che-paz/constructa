"use client";

import { useState } from "react";
import type {
  PayrollSummary,
  Worker,
  WorkerAttendance,
} from "@constructa/types";
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal de la organización</CardTitle>
          <CardDescription>
            Trabajadores compartidos entre proyectos — jornal en quetzales (GTQ)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <WorkerForm />
          <WorkerList
            workers={workers}
            selectedWorkerId={selectedWorkerId}
            onSelectWorker={setSelectedWorkerId}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registrar asistencia</CardTitle>
          <CardDescription>
            Marca entrada, salida y tipo de jornada para este proyecto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AttendanceForm projectId={projectId} workers={workers} />
        </CardContent>
      </Card>

      <PayrollTable payroll={payroll} />

      {selectedWorker && (
        <WorkerHistory worker={selectedWorker} attendance={attendance} />
      )}
    </div>
  );
}
