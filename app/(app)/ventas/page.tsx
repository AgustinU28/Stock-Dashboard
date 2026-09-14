import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { SaleForm } from "@/components/dashboard/sale-form";
import { SalesTable } from "@/components/dashboard/sales-table";
import type { Product, Sale, SaleWithProduct } from "@/types/database";

export const revalidate = 0;

const HISTORY_LIMIT = 100;

export default async function VentasPage() {
  const supabase = await createClient();

  const [{ data: products, error: productsError }, { data: sales, error: salesError }] =
    await Promise.all([
      supabase.from("products").select("*").order("name", { ascending: true }),
      supabase
        .from("sales")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(HISTORY_LIMIT),
    ]);

  if (productsError || salesError) {
    throw new Error(productsError?.message ?? salesError?.message ?? "Error al cargar datos");
  }

  const productList = (products ?? []) as Product[];
  const saleList = (sales ?? []) as Sale[];
  const productsById = new Map(productList.map((p) => [p.id, p]));

  const salesWithProduct: SaleWithProduct[] = saleList.map((sale) => ({
    ...sale,
    product: productsById.get(sale.product_id) ?? null,
  }));

  const sellableProducts = productList.filter((p) => p.stock_quantity > 0);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-medium tracking-tight text-foreground">
          Ventas
        </h1>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Registrar venta</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4">
          <SaleForm products={sellableProducts} />
        </div>
      </Card>

      <SalesTable sales={salesWithProduct} />
    </div>
  );
}
