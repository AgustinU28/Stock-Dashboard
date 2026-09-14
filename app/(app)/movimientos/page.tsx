import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { MovementForm } from "@/components/dashboard/movement-form";
import { MovementsTable } from "@/components/dashboard/movements-table";
import type { Product, StockMovement, StockMovementWithProduct } from "@/types/database";

export const revalidate = 0;

const HISTORY_LIMIT = 100;

export default async function MovimientosPage() {
  const supabase = await createClient();

  const [{ data: products, error: productsError }, { data: movements, error: movementsError }] =
    await Promise.all([
      supabase.from("products").select("*").order("name", { ascending: true }),
      supabase
        .from("stock_movements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(HISTORY_LIMIT),
    ]);

  if (productsError || movementsError) {
    throw new Error(
      productsError?.message ?? movementsError?.message ?? "Error al cargar datos"
    );
  }

  const productList = (products ?? []) as Product[];
  const movementList = (movements ?? []) as StockMovement[];
  const productsById = new Map(productList.map((p) => [p.id, p]));

  const movementsWithProduct: StockMovementWithProduct[] = movementList.map((movement) => ({
    ...movement,
    product: productsById.get(movement.product_id) ?? null,
  }));

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-medium tracking-tight text-foreground">
          Movimientos de stock
        </h1>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Registrar movimiento</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4">
          <MovementForm products={productList.map((p) => ({ id: p.id, name: p.name }))} />
        </div>
      </Card>

      <MovementsTable movements={movementsWithProduct} />
    </div>
  );
}
