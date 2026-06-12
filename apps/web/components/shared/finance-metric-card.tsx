import {
  Card,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FinanceMetricCardProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

/** Tarjeta de monto GTQ — tipografía responsive para móvil (evita overflow). */
export function FinanceMetricCard({
  label,
  value,
  className,
}: FinanceMetricCardProps) {
  return (
    <Card className={cn("min-w-0 overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardDescription className="line-clamp-2 text-xs leading-snug">
          {label}
        </CardDescription>
        <p className="mt-1.5 text-base font-semibold tabular-nums leading-tight tracking-tight sm:text-lg md:text-2xl">
          {value}
        </p>
      </CardHeader>
    </Card>
  );
}
