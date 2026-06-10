"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateExpenseSchema } from "@constructa/schemas";
import type { ExpenseCategory } from "@constructa/types";
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

interface ExpenseFormProps {
  projectId: string;
}

export function ExpenseForm({ projectId }: ExpenseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<ExpenseCategory>("otros");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [invoiceNumber, setInvoiceNumber] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      category,
      description,
      amount: Number(amount),
      expense_date: expenseDate,
      invoice_number: invoiceNumber || null,
    };

    const parsed = CreateExpenseSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Datos inválidos");
      return;
    }

    setLoading(true);

    const res = await fetch(`/api/projects/${projectId}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    const data: { error?: string } = await res.json();

    if (!res.ok) {
      setError(
        typeof data.error === "string"
          ? data.error
          : "No se pudo registrar el gasto",
      );
      setLoading(false);
      return;
    }

    setDescription("");
    setAmount("");
    setInvoiceNumber("");
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
          <Label htmlFor="expenseCategory">Categoría *</Label>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as ExpenseCategory)}
          >
            <SelectTrigger id="expenseCategory">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="materiales">Materiales</SelectItem>
              <SelectItem value="mano_obra">Mano de obra</SelectItem>
              <SelectItem value="transporte">Transporte</SelectItem>
              <SelectItem value="otros">Otros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expenseAmount">Monto (GTQ) *</Label>
          <Input
            id="expenseAmount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expenseDate">Fecha *</Label>
          <Input
            id="expenseDate"
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoiceNumber">No. factura</Label>
          <Input
            id="invoiceNumber"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="expenseDescription">Descripción *</Label>
          <Textarea
            id="expenseDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Registrando…" : "Registrar gasto"}
      </Button>
    </form>
  );
}
