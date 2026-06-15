"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";

interface ClientPortalShareProps {
  url: string;
}

export function ClientPortalShare({ url }: ClientPortalShareProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void QRCode.toDataURL(url, {
      width: 220,
      margin: 2,
      color: { dark: "#0f172a", light: "#ffffff" },
    })
      .then((dataUrl) => {
        if (!cancelled) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudo generar el código QR");
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("No se pudo copiar el enlace");
    }
  }

  function downloadQr() {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = "portal-cliente-qr.png";
    link.click();
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <div className="flex flex-col items-center gap-2">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt="Código QR del portal del cliente"
            className="rounded-md border bg-white p-2"
            width={220}
            height={220}
          />
        ) : (
          <div className="flex h-[220px] w-[220px] items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
            Generando QR…
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!qrDataUrl}
          onClick={downloadQr}
        >
          Descargar QR
        </Button>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Escanea el QR o comparte la imagen por WhatsApp para que tu cliente
          acceda al portal sin copiar el enlace.
        </p>
        <code className="truncate rounded-md bg-muted px-3 py-2 text-xs">
          {url}
        </code>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => void copyLink()}>
            {copied ? "Copiado" : "Copiar enlace"}
          </Button>
        </div>
      </div>
    </div>
  );
}
