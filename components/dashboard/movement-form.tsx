"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

type MovementType = "in" | "out";

export function MovementForm({ products }: { products: { id: string; name: string }[] }) {
  const router = useRouter();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [type, setType] = useState<MovementType>("in");
  const [amount, setAmount] = useState("1");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const qty = Number(amount);
    if (!Number.isInteger(qty) || qty <= 0) {
      setError("La cantidad tiene que ser un entero mayor a 0.");
      return;
    }
    if (!reason.trim()) {
      setError("Falta el motivo.");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from("stock_movements").insert({
      product_id: productId,
      change_amount: type === "in" ? qty : -qty,
      reason: reason.trim(),
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    setAmount("1");
    setReason("");
    router.refresh();
  }

  if (products.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavia no hay productos cargados.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
      <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
        <Label htmlFor="product">Producto</Label>
        <Select id="product" value={productId} onChange={(e) => setProductId(e.target.value)}>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex w-40 flex-col gap-1.5">
        <Label htmlFor="type">Tipo</Label>
        <Select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as MovementType)}
        >
          <option value="in">Reposicion (+)</option>
          <option value="out">Merma / ajuste (-)</option>
        </Select>
      </div>
      <div className="flex w-28 flex-col gap-1.5">
        <Label htmlFor="amount">Cantidad</Label>
        <Input
          id="amount"
          type="number"
          min="1"
          step="1"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
        <Label htmlFor="reason">Motivo</Label>
        <Input
          id="reason"
          required
          placeholder="Ej: pedido a proveedor, rotura, vencimiento..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Registrar"}
      </Button>
      {error ? <p className="w-full text-xs text-destructive">{error}</p> : null}
    </form>
  );
}
