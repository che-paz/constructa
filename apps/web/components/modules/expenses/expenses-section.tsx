import type { Expense } from "@constructa/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExpenseForm } from "./expense-form";
import { ExpenseList } from "./expense-list";

interface ExpensesSectionProps {
  projectId: string;
  expenses: Expense[];
}

export function ExpensesSection({ projectId, expenses }: ExpensesSectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registrar gasto</CardTitle>
          <CardDescription>
            Gastos adicionales del proyecto (transporte, servicios, otros) que
            no están en materiales ni planilla
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseForm projectId={projectId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial de gastos</CardTitle>
          <CardDescription>
            {expenses.length} gasto{expenses.length === 1 ? "" : "s"}{" "}
            registrado{expenses.length === 1 ? "" : "s"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseList expenses={expenses} />
        </CardContent>
      </Card>
    </div>
  );
}
