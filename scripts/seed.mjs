// ============================================================================
// scripts/seed.mjs
//
// Populates the database with ~50 products and ~200 sales spread over the
// last 30 days, so the dashboard's charts have realistic data out of the box.
//
// Run with:  npm run seed
//
// Requires SUPABASE_SERVICE_ROLE_KEY (not the anon key) so seeding bypasses
// RLS and doesn't depend on the public insert policies. Get it from
// Supabase dashboard -> Project Settings -> API -> service_role.
// NEVER expose the service role key to the browser or commit it.
// ============================================================================

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY " +
      "(e.g. `export SUPABASE_SERVICE_ROLE_KEY=...` or run via `dotenv -e .env.local -- npm run seed`)."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const CATEGORIES = [
  "Bebidas",
  "Almacen",
  "Limpieza",
  "Perfumeria",
  "Snacks",
];

const PRODUCT_NAMES = [
  "Agua Mineral 500ml", "Gaseosa Cola 2L", "Cerveza Lager 473ml", "Jugo de Naranja 1L",
  "Agua Saborizada 1.5L", "Arroz Largo Fino 1kg", "Fideos Tallarin 500g", "Aceite de Girasol 900ml",
  "Yerba Mate 1kg", "Azucar Blanca 1kg", "Harina 0000 1kg", "Sal Fina 500g",
  "Lavandina 1L", "Detergente Concentrado 750ml", "Jabon en Polvo 800g", "Suavizante para Ropa 900ml",
  "Papel Higienico x4", "Esponja Multiuso", "Limpiador Liquido 500ml", "Desinfectante Aerosol",
  "Shampoo 400ml", "Jabon de Tocador x3", "Desodorante Aerosol", "Pasta Dental 90g",
  "Papas Fritas 150g", "Alfajor Triple", "Galletitas Dulces 300g", "Galletitas Saladas 200g",
  "Barra de Cereal x6", "Mani Salado 200g", "Chocolate en Barra 100g", "Caramelos Surtidos 500g",
  "Cafe Molido 250g", "Te en Saquitos x25", "Leche Entera 1L", "Yogur Bebible 1L",
  "Manteca 200g", "Queso Cremoso 300g", "Dulce de Leche 400g", "Mermelada 350g",
  "Vinagre de Alcohol 500ml", "Mostaza 250g", "Ketchup 380g", "Mayonesa 250g",
  "Pan Lactal 500g", "Galletas de Arroz 100g", "Cereal de Maiz 300g", "Avena Instantanea 400g",
  "Atun en Lata 170g", "Sardinas en Lata 125g",
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomPastTimestamp(daysAgoMax) {
  const now = Date.now();
  const msAgo = randomInt(0, daysAgoMax * 24 * 60 * 60 * 1000);
  return new Date(now - msAgo).toISOString();
}

async function seedProducts() {
  const products = PRODUCT_NAMES.map((name, i) => ({
    name,
    sku: `SKU-${String(i + 1).padStart(4, "0")}`,
    stock_quantity: randomInt(0, 200),
    price: randomFloat(200, 8000, 2),
    category: CATEGORIES[i % CATEGORIES.length],
  }));

  const { data, error } = await supabase
    .from("products")
    .insert(products)
    .select("id, price, stock_quantity");

  if (error) throw new Error(`Seeding products failed: ${error.message}`);
  console.log(`Inserted ${data.length} products.`);
  return data;
}

async function seedSales(products, count = 200) {
  // Each inserted sale decrements products.stock_quantity via the
  // trg_sales_apply_stock trigger, which is guarded by a >= 0 check
  // constraint. Track remaining stock locally so we never generate a sale
  // that would oversell a product and roll back the batch.
  const remaining = new Map(products.map((p) => [p.id, p.stock_quantity]));
  const sales = [];

  for (let i = 0; i < count; i += 1) {
    const sellable = products.filter((p) => (remaining.get(p.id) ?? 0) > 0);
    if (sellable.length === 0) break;

    const product = sellable[randomInt(0, sellable.length - 1)];
    const available = remaining.get(product.id);
    const quantity = randomInt(1, Math.min(8, available));

    remaining.set(product.id, available - quantity);
    sales.push({
      product_id: product.id,
      quantity,
      total_amount: Number((product.price * quantity).toFixed(2)),
      created_at: randomPastTimestamp(30),
    });
  }

  // Insert in batches to avoid one giant request.
  const batchSize = 50;
  let inserted = 0;
  for (let i = 0; i < sales.length; i += batchSize) {
    const batch = sales.slice(i, i + batchSize);
    const { error } = await supabase.from("sales").insert(batch);
    if (error) throw new Error(`Seeding sales failed: ${error.message}`);
    inserted += batch.length;
  }
  console.log(`Inserted ${inserted} sales.`);
}

async function main() {
  console.log("Seeding database...");
  const products = await seedProducts();
  await seedSales(products, 200);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
