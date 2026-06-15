"use client";

import { useState } from "react";
import { ChangePasswordSchema } from "@constructa/schemas";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AccountPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const parsed = ChangePasswordSchema.safeParse({
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });

    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Datos inválidos");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      setError("No se pudo verificar tu sesión");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: parsed.data.current_password,
    });

    if (signInError) {
      setError("La contraseña actual no es correcta");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: parsed.data.new_password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSuccess(true);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <p className="text-sm text-muted-foreground">
        Usa al menos 6 caracteres. Deberás iniciar sesión de nuevo en otros
        dispositivos.
      </p>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {success && (
        <p className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
          Contraseña actualizada correctamente.
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="currentPassword">Contraseña actual</Label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">Nueva contraseña</Label>
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Actualizando…" : "Cambiar contraseña"}
      </Button>
    </form>
  );
}
