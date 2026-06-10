import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/get-organization";
import { hasAIAccess } from "@/lib/ai/quota";
import { AIChat } from "@/components/modules/ai/ai-chat";
import { PageHeader } from "@/components/shared/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function AssistantPage() {
  const auth = await getAuthContext();
  if (!auth) redirect("/onboarding");

  if (!hasAIAccess(auth.organization.plan)) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Asistente IA"
          description="Consulta tus datos en lenguaje natural"
        />
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            El asistente IA está disponible en el plan Profesional o superior.
            Actualice su plan para acceder a esta función.
          </p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("organization_id", auth.organization.id)
    .is("deleted_at", null)
    .eq("status", "active")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asistente IA"
        description="Consulta gastos, materiales, pagos y avance de tus obras"
      />
      <AIChat projects={projects ?? []} />
    </div>
  );
}
