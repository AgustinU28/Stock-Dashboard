import { createClient } from "@/lib/supabase/server";
import { dateKey } from "@/lib/utils/format";
import { DashboardLive } from "@/components/dashboard/dashboard-live";
import type { DailyTotal } from "@/components/dashboard/sales-chart";
import type { TicketEntry } from "@/components/dashboard/ticket-feed";
import type { Product, Sale } from "@/types/database";

export const revalidate = 0;

const HISTORY_DAYS = 30;
const FEED_LIMIT = 20;

function buildDailyTotals(sales: Sale[]): DailyTotal[] {
  const totals = new Map<string, number>();
  for (const sale of sales) {
    const key = dateKey(sale.created_at);
    totals.set(key, (totals.get(key) ?? 0) + sale.total_amount);
  }

  const days: DailyTotal[] = [];
  for (let i = HISTORY_DAYS - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - i);
    const key = dateKey(date.toISOString());
    days.push({ date: key, total: totals.get(key) ?? 0 });
  }
  return days;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - (HISTORY_DAYS - 1));

  const [{ data: products, error: productsError }, { data: sales, error: salesError }] =
    await Promise.all([
      supabase.from("products").select("*").order("stock_quantity", { ascending: true }),
      supabase
        .from("sales")
        .select("*")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false }),
    ]);

  if (productsError || salesError) {
    throw new Error(productsError?.message ?? salesError?.message ?? "Error al cargar datos");
  }

  const productList = (products ?? []) as Product[];
  const saleList = (sales ?? []) as Sale[];
  const productsById = new Map(productList.map((p) => [p.id, p]));

  const todayKey = dateKey(new Date().toISOString());
  const todaysSales = saleList.filter((sale) => dateKey(sale.created_at) === todayKey);

  const initialToday = {
    total: todaysSales.reduce((sum, s) => sum + s.total_amount, 0),
    units: todaysSales.reduce((sum, s) => sum + s.quantity, 0),
    count: todaysSales.length,
  };

  const initialTicketEntries: TicketEntry[] = saleList.slice(0, FEED_LIMIT).map((sale) => {
    const product = productsById.get(sale.product_id);
    return {
      id: sale.id,
      productName: product?.name ?? "Producto",
      productSku: product?.sku ?? "-",
      quantity: sale.quantity,
      totalAmount: sale.total_amount,
      createdAt: sale.created_at,
    };
  });

  return (
    <DashboardLive
      initialProducts={productList}
      initialTicketEntries={initialTicketEntries}
      initialDailyTotals={buildDailyTotals(saleList)}
      initialToday={initialToday}
    />
  );
}
