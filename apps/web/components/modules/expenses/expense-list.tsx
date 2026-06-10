"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Expense } from "@constructa/types";
import { expenseCategoryLabel, formatGtq } from "@constructa/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ExpenseListProps {
  expenses: Expense[];
}

export function ExpenseList({ expenses }: ExpenseListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(expenseId: string) {
    if (!confirm("¿Eliminar este gasto?")) return;

    setDeletingId(expenseId);
    const res = await fetch(`/api/expenses/${expenseId}`, { method: "DELETE" });
    setDeletingId(null);

    if (res.ok) {
      router.refresh();
    }
  }

  if (expenses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay gastos registrados aún.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead className="text-right">Monto</TableHead>
          <TableHead>Factura</TableHead>
          <TableHead className="w-[80px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => (
          <TableRow key={expense.id}>
            <TableCell>
              {new Date(expense.expense_date).toLocaleDateString("es-GT")}
            </TableCell>
            <TableCell>{expenseCategoryLabel(expense.category)}</TableCell>
            <TableCell className="max-w-[200px] truncate">
              {expense.description}
            </TableCell>
            <TableCell className="text-right">
              {formatGtq(expense.amount)}
            </TableCell>
            <TableCell>{expense.invoice_number ?? "—"}</TableCell>
            <TableCell>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={deletingId === expense.id}
                onClick={() => handleDelete(expense.id)}
              >
                {deletingId === expense.id ? "…" : "Eliminar"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
