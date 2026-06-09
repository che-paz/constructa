"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatePaymentSchema } from "@constructa/schemas";
import type { PaymentMethod } from "@constructa/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentFormProps {
  projectId: string;
}

export function PaymentForm({ projectId }: PaymentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("transferencia");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [description, setDescription] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    let receiptUrl: string | null = null;

    if (receiptFile) {
      const formData = new FormData();
      formData.append("file", receiptFile);

      const uploadRes = await fetch(
        `/api/projects/${projectId}/payments/upload`,
        { method: "POST", body: formData },
      );

      const uploadData: { receipt_url?: string; error?: string } =
        await uploadRes.json();

      if (!uploadRes.ok) {
        setError(uploadData.error ?? "No se pudo subir el comprobante");
        return;
      }

      receiptUrl = uploadData.receipt_url ?? null;
    }

    const payload = {
      amount: Number(amount),
      payment_date: paymentDate,
      payment_method: paymentMethod,
      reference_number: referenceNumber || null,
      description: description || null,
      receipt_url: receiptUrl,
    };

    const parsed = CreatePaymentSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Datos inválidos");
      return;
    }

    setLoading(true);

    const res = await fetch(`/api/projects/${projectId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    const data: { error?: string } = await res.json();

    if (!res.ok) {
      setError(
        typeof data.error === "string"
          ? data.error
          : "No se pudo registrar el pago",
      );
      setLoading(false);
      return;
    }

    setAmount("");
    setReferenceNumber("");
    setDescription("");
    setReceiptFile(null);
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Monto (GTQ) *</Label>
          <Input
            id="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentDate">Fecha *</Label>
          <Input
            id="paymentDate"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Método *</Label>
          <Select
            value={paymentMethod}
            onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
          >
            <SelectTrigger id="paymentMethod">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="efectivo">Efectivo</SelectItem>
              <SelectItem value="transferencia">Transferencia</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
              <SelectItem value="tarjeta">Tarjeta</SelectItem>
              <SelectItem value="otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="referenceNumber">Referencia / No. transacción</Label>
          <Input
            id="referenceNumber"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="receipt">Comprobante (JPG, PNG, PDF — máx. 5 MB)</Label>
          <Input
            id="receipt"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Registrando…" : "Registrar pago"}
      </Button>
    </form>
  );
}
