"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { CATEGORIES } from "@/lib/constants";

export function ProductForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from("products").insert({
      name,
      sku,
      category,
      price: Number(price),
      stock_quantity: Number(stock) || 0,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    setName("");
    setSku("");
    setPrice("");
    setStock("0");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 sm:grid-cols-6 sm:items-end">
      <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sku">SKU</Label>
        <Input id="sku" required value={sku} onChange={(e) => setSku(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category">Categoria</Label>
        <Select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="price">Precio</Label>
        <Input
          id="price"
          type="number"
          min="0"
          step="0.01"
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="stock">Stock inicial</Label>
        <Input
          id="stock"
          type="number"
          min="0"
          step="1"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />
      </div>
      <div className="col-span-2 flex items-center gap-3 sm:col-span-6">
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Agregar producto"}
        </Button>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </form>
  );
}
