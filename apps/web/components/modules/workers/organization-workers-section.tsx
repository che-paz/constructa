"use client";

import type { Worker } from "@constructa/types";
import { WorkerList } from "@/components/modules/workers/worker-list";

interface OrganizationWorkersSectionProps {
  workers: Worker[];
}

export function OrganizationWorkersSection({
  workers,
}: OrganizationWorkersSectionProps) {
  return (
    <WorkerList
      workers={workers}
      selectedWorkerId={null}
      onSelectWorker={() => {}}
    />
  );
}
