"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateWorkerSchema } from "@constructa/schemas";
import type { WorkerPaymentType } from "@constructa/types";
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

const COMMON_SPECIALTIES = [
  { value: "albanil", label: "Albañil" },
  { value: "electricista", label: "Electricista" },
  { value: "plomero", label: "Plomero" },
  { value: "peon", label: "Peón" },
  { value: "carpintero", label: "Carpintero" },
  { value: "herrero", label: "Herrero" },
  { value: "pintor", label: "Pintor" },
  { value: "otro", label: "Otra especialidad…" },
];

export function WorkerForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [dpi, setDpi] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("albanil");
  const [customSpecialty, setCustomSpecialty] = useState("");
  const [paymentType, setPaymentType] = useState<WorkerPaymentType>("daily");
  const [dailyRate, setDailyRate] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (specialty === "otro" && !customSpecialty.trim()) {
      setError("Indica la especialidad del trabajador");
      return;
    }

    const payload = {
      name,
      dpi: dpi || null,
      phone: phone || null,
      specialty:
        specialty === "otro" ? customSpecialty.trim() : specialty || null,
      payment_type: paymentType,
      daily_rate:
        paymentType === "daily" && dailyRate ? Number(dailyRate) : null,
      notes: notes || null,
    };

    const parsed = CreateWorkerSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Datos inválidos");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/workers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    const data: { error?: string } = await res.json();

    if (!res.ok) {
      setError(
        typeof data.error === "string"
          ? data.error
          : "No se pudo registrar el trabajador",
      );
      setLoading(false);
      return;
    }

    setName("");
    setDpi("");
    setPhone("");
    setSpecialty("albanil");
    setCustomSpecialty("");
    setPaymentType("daily");
    setDailyRate("");
    setNotes("");
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
          <Label htmlFor="workerName">Nombre completo *</Label>
          <Input
            id="workerName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="workerDpi">DPI</Label>
          <Input
            id="workerDpi"
            value={dpi}
            onChange={(e) => setDpi(e.target.value)}
            placeholder="1234 56789 0101"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="workerPhone">Teléfono</Label>
          <Input
            id="workerPhone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="502 1234 5678"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentType">Forma de pago *</Label>
          <Select
            value={paymentType}
            onValueChange={(v) => setPaymentType(v as WorkerPaymentType)}
          >
            <SelectTrigger id="paymentType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Jornal diario</SelectItem>
              <SelectItem value="contract">Por contrato / tarea</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="workerSpecialty">Especialidad</Label>
          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger id="workerSpecialty">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMMON_SPECIALTIES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {specialty === "otro" && (
          <div className="space-y-2">
            <Label htmlFor="customSpecialty">Especialidad (texto libre) *</Label>
            <Input
              id="customSpecialty"
              value={customSpecialty}
              onChange={(e) => setCustomSpecialty(e.target.value)}
              placeholder="Ej. Instalador de piso"
            />
          </div>
        )}

        {paymentType === "daily" && (
          <div className="space-y-2">
            <Label htmlFor="dailyRate">Jornal diario (GTQ) *</Label>
            <Input
              id="dailyRate"
              type="number"
              min="0"
              step="0.01"
              value={dailyRate}
              onChange={(e) => setDailyRate(e.target.value)}
              required
            />
          </div>
        )}

        {paymentType === "contract" && (
          <div className="space-y-2 sm:col-span-2">
            <p className="text-sm text-muted-foreground">
              El monto se registra al cerrar cada día de trabajo, con una nota
              del trabajo realizado (ej. pegar piso).
            </p>
          </div>
        )}

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="workerNotes">Notas</Label>
          <Textarea
            id="workerNotes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Guardando…" : "Agregar trabajador"}
      </Button>
    </form>
  );
}
