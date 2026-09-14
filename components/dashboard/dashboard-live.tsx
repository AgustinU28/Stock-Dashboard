"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Product, Sale } from "@/types/database";
import { dateKey } from "@/lib/utils/format";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { SalesChart, type DailyTotal } from "@/components/dashboard/sales-chart";
import { TicketFeed, type TicketEntry } from "@/components/dashboard/ticket-feed";
import { StockTable } from "@/components/dashboard/stock-table";
import { formatCurrency, formatNumber } from "@/lib/utils/format";

const LOW_STOCK_THRESHOLD = 10;
const FLASH_DURATION_MS = 1600;
const FEED_LIMIT = 20;

interface TodayAggregate {
  total: number;
  units: number;
  count: number;
}

export function DashboardLive({
  initialProducts,
  initialTicketEntries,
  initialDailyTotals,
  initialToday,
}: {
  initialProducts: Product[];
  initialTicketEntries: TicketEntry[];
  initialDailyTotals: DailyTotal[];
  initialToday: TodayAggregate;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [ticketEntries, setTicketEntries] = useState(initialTicketEntries);
  const [dailyTotals, setDailyTotals] = useState(initialDailyTotals);
  const [today, setToday] = useState(initialToday);
  const [connected, setConnected] = useState(false);

  const [freshProductId, setFreshProductId] = useState<string | null>(null);
  const [freshTicketId, setFreshTicketId] = useState<string | null>(null);
  const productFlashTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const ticketFlashTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const productsRef = useRef(products);
  productsRef.current = products;

  useEffect(() => {
    const channel = supabase
      .channel("dashboard-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sales" },
        (payload) => {
          const sale = payload.new as Sale;
          const product = productsRef.current.find((p) => p.id === sale.product_id);

          const entry: TicketEntry = {
            id: sale.id,
            productName: product?.name ?? "Producto",
            productSku: product?.sku ?? "-",
            quantity: sale.quantity,
            totalAmount: sale.total_amount,
            createdAt: sale.created_at,
          };

          setTicketEntries((prev) => [entry, ...prev].slice(0, FEED_LIMIT));

          setToday((prev) => ({
            total: prev.total + sale.total_amount,
            units: prev.units + sale.quantity,
            count: prev.count + 1,
          }));

          setDailyTotals((prev) => {
            const key = dateKey(sale.created_at);
            const last = prev[prev.length - 1];
            if (last && last.date === key) {
              return [...prev.slice(0, -1), { date: key, total: last.total + sale.total_amount }];
            }
            return [...prev, { date: key, total: sale.total_amount }];
          });

          setFreshTicketId(sale.id);
          clearTimeout(ticketFlashTimeout.current);
          ticketFlashTimeout.current = setTimeout(() => setFreshTicketId(null), FLASH_DURATION_MS);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "products" },
        (payload) => {
          const updated = payload.new as Product;
          setProducts((prev) =>
            [...prev.filter((p) => p.id !== updated.id), updated].sort(
              (a, b) => a.stock_quantity - b.stock_quantity
            )
          );
          setFreshProductId(updated.id);
          clearTimeout(productFlashTimeout.current);
          productFlashTimeout.current = setTimeout(() => setFreshProductId(null), FLASH_DURATION_MS);
        }
      )
      .subscribe((status) => setConnected(status === "SUBSCRIBED"));

    return () => {
      supabase.removeChannel(channel);
      clearTimeout(productFlashTimeout.current);
      clearTimeout(ticketFlashTimeout.current);
    };
  }, []);

  const lowStockCount = useMemo(
    () => products.filter((p) => p.stock_quantity <= LOW_STOCK_THRESHOLD).length,
    [products]
  );

  const avgTicket = today.count > 0 ? today.total / today.count : 0;

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
            Panel del mostrador
          </p>
          <h1 className="font-display text-4xl font-medium tracking-tight text-foreground">
            Ventas y stock
          </h1>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <span className="relative flex h-2 w-2">
            {connected && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            )}
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${connected ? "bg-success" : "bg-muted-foreground"}`}
            />
          </span>
          {connected ? "conectado en vivo" : "conectando..."}
        </span>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Ventas de hoy" value={formatCurrency(today.total)} hint={`${formatNumber(today.count)} tickets`} accent />
        <KpiCard label="Unidades vendidas" value={formatNumber(today.units)} hint="hoy" />
        <KpiCard label="Ticket promedio" value={formatCurrency(avgTicket)} hint="hoy" />
        <KpiCard
          label="Stock bajo"
          value={formatNumber(lowStockCount)}
          hint={`de ${formatNumber(products.length)} productos`}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SalesChart data={dailyTotals} />
        <TicketFeed entries={ticketEntries} freshId={freshTicketId} />
      </div>

      <StockTable products={products} freshProductId={freshProductId} />
    </div>
  );
}
