import { redirect } from "next/navigation";
import type { Worker } from "@constructa/types";
import { getAuthContext } from "@/lib/auth/get-organization";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { WorkerForm } from "@/components/modules/workers/worker-form";
import { OrganizationWorkersSection } from "@/components/modules/workers/organization-workers-section";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function PersonalPage() {
  const auth = await getAuthContext();
  if (!auth) redirect("/onboarding");

  const supabase = await createClient();
  const { data: workers } = await supabase
    .from("workers")
    .select("*")
    .eq("organization_id", auth.organization.id)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  const workerList = (workers ?? []) as Worker[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Personal de la empresa"
        description="Trabajadores compartidos entre proyectos — jornal diario o contrato por tarea"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agregar trabajador</CardTitle>
          <CardDescription>
            El personal se registra aquí y luego se asigna en cada proyecto al
            marcar asistencia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WorkerForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Equipo</CardTitle>
          <CardDescription>
            {workerList.length}{" "}
            {workerList.length === 1 ? "trabajador" : "trabajadores"}{" "}
            registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrganizationWorkersSection workers={workerList} />
        </CardContent>
      </Card>
    </div>
  );
}
