import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StockTable } from "@/components/dashboard/stock-table";
import { ProductForm } from "@/components/dashboard/product-form";
import type { Product } from "@/types/database";

export const revalidate = 0;

export default async function ProductosPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("stock_quantity", { ascending: true });

  if (error) throw new Error(error.message);
  const products = (data ?? []) as Product[];

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-medium tracking-tight text-foreground">
          Productos
        </h1>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Nuevo producto</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4">
          <ProductForm />
        </div>
      </Card>

      <StockTable products={products} freshProductId={null} />
    </div>
  );
}
