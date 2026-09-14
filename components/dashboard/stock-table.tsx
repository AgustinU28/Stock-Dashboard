"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PriceTag } from "@/components/ui/price-tag";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import type { Product } from "@/types/database";

const LOW_STOCK_THRESHOLD = 10;

function toneFor(quantity: number): "ok" | "low" | "out" {
  if (quantity <= 0) return "out";
  if (quantity <= LOW_STOCK_THRESHOLD) return "low";
  return "ok";
}

function labelFor(quantity: number): string {
  if (quantity <= 0) return "sin stock";
  if (quantity <= LOW_STOCK_THRESHOLD) return `${formatNumber(quantity)} u.`;
  return `${formatNumber(quantity)} u.`;
}

export function StockTable({
  products,
  freshProductId,
}: {
  products: Product[];
  freshProductId: string | null;
}) {
  return (
    <Card className="col-span-full">
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle>Gondola — stock por producto</CardTitle>
        <p className="text-xs text-muted-foreground">Ordenado por menor stock primero</p>
      </CardHeader>
      {products.length === 0 ? (
        <p className="px-4 pb-6 text-sm text-muted-foreground">
          Todavia no hay productos cargados. Corre <code className="font-mono-ticket">npm run seed</code> para
          poblar datos de ejemplo.
        </p>
      ) : (
      <div className="overflow-x-auto px-4 pb-4">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
              <th className="pb-2 pr-4 font-medium">Producto</th>
              <th className="pb-2 pr-4 font-medium">Categoria</th>
              <th className="pb-2 pr-4 font-medium">Precio</th>
              <th className="pb-2 font-medium">Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className={cn(
                  "border-t border-border transition-colors",
                  product.id === freshProductId && "animate-pulse-once"
                )}
              >
                <td className="max-w-[220px] py-2.5 pr-4">
                  <p className="truncate text-foreground">{product.name}</p>
                  <p className="font-mono-ticket text-[11px] text-muted-foreground">
                    {product.sku}
                  </p>
                </td>
                <td className="py-2.5 pr-4 text-muted-foreground">{product.category}</td>
                <td className="py-2.5 pr-4 font-mono-ticket text-foreground">
                  {formatCurrency(product.price)}
                </td>
                <td className="py-2.5">
                  <PriceTag tone={toneFor(product.stock_quantity)}>
                    {labelFor(product.stock_quantity)}
                  </PriceTag>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </Card>
  );
}
