"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InviteMemberSchema, OrgStaffRoleSchema } from "@constructa/schemas";
import type { OrganizationMember, UserRole } from "@constructa/types";
import {
  ORG_STAFF_ROLES,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
} from "@/lib/auth/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MembersSectionProps {
  members: OrganizationMember[];
  maxUsers: number;
  currentUserId: string;
  canManage: boolean;
}

function roleBadgeVariant(role: UserRole) {
  if (role === "constructor") return "default";
  if (role === "supervisor") return "secondary";
  return "outline";
}

export function MembersSection({
  members,
  maxUsers,
  currentUserId,
  canManage,
}: MembersSectionProps) {
  const router = useRouter();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] =
    useState<(typeof ORG_STAFF_ROLES)[number]>("supervisor");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const activeCount = members.filter((m) => m.is_active).length;

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!canManage) return;

    setError(null);

    const parsed = InviteMemberSchema.safeParse({
      email: inviteEmail,
      role: inviteRole,
    });

    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Datos inválidos");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/organizations/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    const data: { error?: string } = await res.json();

    if (!res.ok) {
      setError(
        typeof data.error === "string"
          ? data.error
          : "No se pudo agregar el usuario",
      );
      setLoading(false);
      return;
    }

    setInviteEmail("");
    setLoading(false);
    router.refresh();
  }

  async function updateMember(
    memberId: string,
    patch: { role?: UserRole; is_active?: boolean },
  ) {
    setUpdatingId(memberId);
    setError(null);

    const res = await fetch(`/api/organizations/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });

    const data: { error?: string } = await res.json();

    if (!res.ok) {
      setError(
        typeof data.error === "string"
          ? data.error
          : "No se pudo actualizar el usuario",
      );
      setUpdatingId(null);
      return;
    }

    setUpdatingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        {activeCount} de {maxUsers} usuarios activos
      </div>

      {!canManage && (
        <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
          Solo el constructor puede invitar usuarios y cambiar roles.
        </p>
      )}

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {canManage && activeCount < maxUsers && (
        <form
          onSubmit={handleInvite}
          className="grid gap-4 rounded-lg border p-4 sm:grid-cols-[1fr_auto_auto]"
        >
          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="inviteEmail">Invitar por correo</Label>
            <Input
              id="inviteEmail"
              type="email"
              placeholder="usuario@ejemplo.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Si el correo es nuevo, recibirá un enlace para activar su cuenta.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inviteRole">Rol</Label>
            <Select
              value={inviteRole}
              onValueChange={(value) =>
                setInviteRole(OrgStaffRoleSchema.parse(value))
              }
            >
              <SelectTrigger id="inviteRole">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORG_STAFF_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Agregando…" : "Agregar usuario"}
            </Button>
          </div>
        </form>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        {ORG_STAFF_ROLES.map((role) => (
          <div key={role} className="rounded-md border px-3 py-2 text-sm">
            <p className="font-medium">{ROLE_LABELS[role]}</p>
            <p className="text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
          </div>
        ))}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Correo</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            {canManage && <TableHead className="text-right">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const isSelf = member.user_id === currentUserId;
            const busy = updatingId === member.id;

            return (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  {member.email}
                  {isSelf && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (tú)
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {canManage && !isSelf && member.is_active ? (
                    <Select
                      value={member.role}
                      disabled={busy}
                      onValueChange={(value) =>
                        void updateMember(member.id, {
                          role: OrgStaffRoleSchema.parse(value),
                        })
                      }
                    >
                      <SelectTrigger className="h-8 w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORG_STAFF_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={roleBadgeVariant(member.role)}>
                      {ROLE_LABELS[member.role as keyof typeof ROLE_LABELS] ??
                        member.role}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={member.is_active ? "secondary" : "outline"}>
                    {member.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    {!isSelf && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={busy}
                        onClick={() =>
                          void updateMember(member.id, {
                            is_active: !member.is_active,
                          })
                        }
                      >
                        {member.is_active ? "Desactivar" : "Reactivar"}
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
