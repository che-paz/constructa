"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrgLogo } from "@/components/modules/settings/org-logo";

interface OrgLogoUploadProps {
  organizationName: string;
  logoPath: string | null | undefined;
  canEdit: boolean;
}

export function OrgLogoUpload({
  organizationName,
  logoPath,
  canEdit,
}: OrgLogoUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/organizations/logo/upload", {
      method: "POST",
      body: formData,
    });

    const data: { error?: string } = await res.json();

    if (!res.ok) {
      setError(
        typeof data.error === "string"
          ? data.error
          : "No se pudo subir el logo",
      );
      setLoading(false);
      return;
    }

    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <OrgLogo
        logoPath={logoPath}
        organizationName={organizationName}
        size="lg"
      />
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          JPG, PNG o WEBP. Máximo 2 MB.
        </p>
        {canEdit && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => void handleFileChange(e)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              {loading ? "Subiendo…" : "Cambiar logo"}
            </Button>
          </>
        )}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    </div>
  );
}
