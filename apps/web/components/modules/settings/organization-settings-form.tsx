"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UpdateOrganizationSchema } from "@constructa/schemas";
import type { Organization } from "@constructa/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrgLogoUpload } from "@/components/modules/settings/org-logo-upload";

interface OrganizationSettingsFormProps {
  organization: Organization;
  canEdit: boolean;
}

export function OrganizationSettingsForm({
  organization,
  canEdit,
}: OrganizationSettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState(organization.name);
  const [phone, setPhone] = useState(organization.phone ?? "");
  const [email, setEmail] = useState(organization.email ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit) return;

    setError(null);
    setSuccess(false);

    const payload = {
      name,
      phone: phone || null,
      email: email || null,
    };

    const parsed = UpdateOrganizationSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Datos inválidos");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/organizations/current", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    const data: { error?: string } = await res.json();

    if (!res.ok) {
      setError(
        typeof data.error === "string"
          ? data.error
          : "No se pudo guardar los cambios",
      );
      setLoading(false);
      return;
    }

    setLoading(false);
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <OrgLogoUpload
        organizationName={organization.name}
        logoPath={organization.logo_url}
        canEdit={canEdit}
      />

      {!canEdit && (
        <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
          Solo el constructor puede editar los datos de la empresa.
        </p>
      )}

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {success && (
        <p className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
          Cambios guardados correctamente.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="orgName">Nombre de la empresa *</Label>
          <Input
            id="orgName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={!canEdit}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="orgPhone">Teléfono</Label>
          <Input
            id="orgPhone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={!canEdit}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="orgEmail">Correo de contacto</Label>
          <Input
            id="orgEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!canEdit}
          />
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Plan: {organization.plan}</p>
        <p>
          Límites: {organization.max_projects} proyectos ·{" "}
          {organization.max_users} usuarios
        </p>
      </div>

      {canEdit && (
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando…" : "Guardar cambios"}
        </Button>
      )}
    </form>
  );
}
