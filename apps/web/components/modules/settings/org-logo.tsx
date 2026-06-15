"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Building2 } from "lucide-react";

interface OrgLogoProps {
  logoPath: string | null | undefined;
  organizationName: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-12 w-12",
  md: "h-20 w-20",
  lg: "h-28 w-28",
};

export function OrgLogo({
  logoPath,
  organizationName,
  size = "md",
}: OrgLogoProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!logoPath) {
      setUrl(null);
      return;
    }

    const path = logoPath;
    let cancelled = false;

    async function load() {
      const params = new URLSearchParams({
        bucket: "org-logos",
        path,
      });
      const res = await fetch(`/api/storage/signed-url?${params.toString()}`);
      if (!res.ok || cancelled) return;
      const data = (await res.json()) as { url?: string };
      if (!cancelled && data.url) setUrl(data.url);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [logoPath]);

  const className = `${sizeClasses[size]} shrink-0 rounded-lg border bg-muted object-cover`;

  if (url) {
    return (
      <Image
        src={url}
        alt={`Logo de ${organizationName}`}
        width={112}
        height={112}
        className={className}
        unoptimized
      />
    );
  }

  return (
    <div
      className={`${className} flex items-center justify-center text-muted-foreground`}
      aria-hidden
    >
      <Building2 className="h-1/2 w-1/2" />
    </div>
  );
}
