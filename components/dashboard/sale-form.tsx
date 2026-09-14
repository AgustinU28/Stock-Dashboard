"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils/format";

interface SellableProduct {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
}

export function SaleForm({ products }: { products: SellableProduct[] }) {
  const router = useRouter();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selected = useMemo(
    () => products.find((p) => p.id === productId),
    [products, productId]
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!selected) return;

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      setError("La cantidad tiene que ser un entero mayor a 0.");
      return;
    }
    if (qty > selected.stock_quantity) {
      setError(`Stock insuficiente (disponible: ${selected.stock_quantity}).`);
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from("sales").insert({
      product_id: selected.id,
      quantity: qty,
      total_amount: Number((selected.price * qty).toFixed(2)),
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    setQuantity("1");
    router.refresh();
  }

  if (products.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay productos con stock disponible para vender.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
      <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
        <Label htmlFor="product">Producto</Label>
        <Select id="product" value={productId} onChange={(e) => setProductId(e.target.value)}>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {formatCurrency(p.price)} ({p.stock_quantity} u.)
            </option>
          ))}
        </Select>
      </div>
      <div className="flex w-28 flex-col gap-1.5">
        <Label htmlFor="quantity">Cantidad</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          step="1"
          required
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Registrando..." : "Registrar venta"}
      </Button>
      {error ? <p className="w-full text-xs text-destructive">{error}</p> : null}
    </form>
  );
}
