"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDayLabel } from "@/lib/utils/format";

export interface DailyTotal {
  date: string;
  total: number;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_4px_10px_rgba(0,0,0,0.08)]">
      <p className="text-muted-foreground">{formatDayLabel(label)}</p>
      <p className="mt-0.5 font-mono-ticket text-sm font-medium text-foreground">
        {formatCurrency(payload[0]?.value ?? 0)}
      </p>
    </div>
  );
}

export function SalesChart({ data }: { data: DailyTotal[] }) {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Ventas — ultimos 30 dias</CardTitle>
        <p className="text-xs text-muted-foreground">Total facturado por dia</p>
      </CardHeader>
      <CardContent className="h-[260px] pl-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.28} />
                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="hsl(var(--border))"
              strokeDasharray="3 4"
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDayLabel}
              tickLine={false}
              axisLine={false}
              interval={4}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "var(--font-mono)" }}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "hsl(var(--border))" }} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              fill="url(#salesFill)"
              activeDot={{ r: 4, fill: "hsl(var(--accent))", stroke: "hsl(var(--card))", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
