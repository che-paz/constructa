import { redirect } from "next/navigation";
import { Suspense } from "react";
import type { Organization, OrganizationMember } from "@constructa/types";
import { getAuthContext } from "@/lib/auth/get-organization";
import { canManageOrganization } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { AccountPasswordForm } from "@/components/modules/settings/account-password-form";
import { MembersSection } from "@/components/modules/settings/members-section";
import { OrganizationSettingsForm } from "@/components/modules/settings/organization-settings-form";
import {
  SettingsTabs,
  type SettingsTab,
} from "@/components/modules/settings/settings-tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SettingsPageProps {
  searchParams: { tab?: string };
}

async function loadMembers(organizationId: string): Promise<OrganizationMember[]> {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("user_organizations")
    .select("id, user_id, organization_id, role, is_active, created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true });

  const admin = createAdminClient();
  const members: OrganizationMember[] = [];

  for (const row of rows ?? []) {
    const { data } = await admin.auth.admin.getUserById(row.user_id as string);
    members.push({
      id: row.id as string,
      user_id: row.user_id as string,
      organization_id: row.organization_id as string,
      role: row.role,
      is_active: row.is_active as boolean,
      email: data.user?.email ?? "—",
      created_at: row.created_at as string,
    });
  }

  return members;
}

function resolveTab(tab?: string): SettingsTab {
  if (tab === "cuenta" || tab === "usuarios") return tab;
  return "empresa";
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const auth = await getAuthContext();
  if (!auth) redirect("/onboarding");

  const tab = resolveTab(searchParams.tab);
  const canManage = canManageOrganization(auth.membership.role);

  const supabase = await createClient();
  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", auth.organization.id)
    .single();

  const org = (organization ?? auth.organization) as Organization;
  const members =
    tab === "usuarios" ? await loadMembers(auth.organization.id) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        description="Administra tu empresa, cuenta y equipo de trabajo"
      />

      <Suspense fallback={<div className="text-sm text-muted-foreground">Cargando…</div>}>
        <SettingsTabs activeTab={tab}>
        {tab === "empresa" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Datos de la empresa</CardTitle>
              <CardDescription>
                Nombre, contacto y logo visible en reportes y portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrganizationSettingsForm
                organization={org}
                canEdit={canManage}
              />
            </CardContent>
          </Card>
        )}

        {tab === "cuenta" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tu cuenta</CardTitle>
              <CardDescription>
                Sesión actual: {auth.userEmail}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccountPasswordForm />
            </CardContent>
          </Card>
        )}

        {tab === "usuarios" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Usuarios y roles</CardTitle>
              <CardDescription>
                Controla quién accede a CONSTRUCTA y con qué permisos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MembersSection
                members={members}
                maxUsers={org.max_users}
                currentUserId={auth.userId}
                canManage={canManage}
              />
            </CardContent>
          </Card>
        )}
        </SettingsTabs>
      </Suspense>
    </div>
  );
}
