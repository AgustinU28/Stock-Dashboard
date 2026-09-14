"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatTime } from "@/lib/utils/format";

export interface TicketEntry {
  id: string;
  productName: string;
  productSku: string;
  quantity: number;
  totalAmount: number;
  createdAt: string;
}

export function TicketFeed({
  entries,
  freshId,
}: {
  entries: TicketEntry[];
  freshId: string | null;
}) {
  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle>Cinta de ventas</CardTitle>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
          </span>
          en vivo
        </span>
      </CardHeader>
      <div className="max-h-[300px] overflow-y-auto px-4 pb-4 font-mono-ticket text-xs">
        {entries.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground">
            Todavia no hay ventas registradas.
          </p>
        ) : (
          <ul>
            {entries.map((entry) => (
              <li
                key={entry.id}
                className={cn(
                  "flex items-start justify-between gap-3 border-b border-dashed border-border py-2.5 last:border-0",
                  entry.id === freshId && "animate-ticket-in animate-pulse-once"
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-foreground">{entry.productName}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {formatTime(entry.createdAt)} · {entry.productSku} · x{entry.quantity}
                  </p>
                </div>
                <p className="shrink-0 font-medium text-foreground">
                  {formatCurrency(entry.totalAmount)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
