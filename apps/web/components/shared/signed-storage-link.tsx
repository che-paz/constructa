"use client";

import { useState } from "react";

interface SignedStorageLinkProps {
  bucket: "payment-receipts" | "material-invoices";
  path: string;
  label?: string;
}

export function SignedStorageLink({
  bucket,
  path,
  label = "Ver",
}: SignedStorageLinkProps) {
  const [loading, setLoading] = useState(false);

  async function handleOpen() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ bucket, path });
      const res = await fetch(`/api/storage/signed-url?${params.toString()}`);
      if (!res.ok) return;
      const data = (await res.json()) as { url?: string };
      if (data.url) window.open(data.url, "_blank", "noopener,noreferrer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleOpen()}
      disabled={loading}
      className="text-sm text-primary hover:underline disabled:opacity-50"
    >
      {loading ? "Abriendo…" : label}
    </button>
  );
}
