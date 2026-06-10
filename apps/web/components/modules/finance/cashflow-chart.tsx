"use client";

import type { CashflowEntry } from "@constructa/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatGtq } from "@constructa/utils";

interface CashflowChartProps {
  entries: CashflowEntry[];
}

function formatShortDate(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${day}/${month}`;
}

export function CashflowChart({ entries }: CashflowChartProps) {
  const data = entries.map((entry) => ({
    ...entry,
    label: formatShortDate(entry.date),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11 }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickFormatter={(v: number) =>
            v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
          }
        />
        <Tooltip
          formatter={(value: number) => formatGtq(value)}
          labelFormatter={(_, payload) => {
            const item = payload?.[0]?.payload as { date?: string } | undefined;
            return item?.date
              ? new Date(`${item.date}T12:00:00`).toLocaleDateString("es-GT")
              : "";
          }}
        />
        <Legend />
        <Bar
          dataKey="inflows"
          name="Entradas"
          fill="hsl(var(--primary))"
          radius={[2, 2, 0, 0]}
        />
        <Bar
          dataKey="outflows"
          name="Salidas"
          fill="hsl(0 72% 51%)"
          radius={[2, 2, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
