-- ============================================================================
-- 0001_init_schema.sql
-- Core schema for the sales/stock realtime dashboard.
--
-- Tables:
--   products        catalog of sellable items and their current stock level
--   sales           one row per sale transaction against a product
--   stock_movements audit trail of every stock change (+ or -) and why
--
-- Design note: stock_quantity on `products` is a denormalized running total.
-- It is kept in sync by triggers below whenever a row is inserted into
-- `sales` (stock goes down) or `stock_movements` (stock goes up or down by
-- change_amount). Reading current stock is then a single indexed lookup on
-- `products` instead of a SUM() over history on every dashboard load.
-- ============================================================================

-- Extension needed for gen_random_uuid()
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- products
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  sku            text not null unique,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  price          numeric(12, 2) not null check (price >= 0),
  category       text not null,
  created_at     timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_stock_quantity_idx on public.products (stock_quantity);

-- ----------------------------------------------------------------------------
-- sales
-- ----------------------------------------------------------------------------
create table if not exists public.sales (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products (id) on delete restrict,
  quantity     integer not null check (quantity > 0),
  total_amount numeric(12, 2) not null check (total_amount >= 0),
  created_at   timestamptz not null default now()
);

create index if not exists sales_created_at_idx on public.sales (created_at desc);
create index if not exists sales_product_id_idx on public.sales (product_id);

-- ----------------------------------------------------------------------------
-- stock_movements
-- ----------------------------------------------------------------------------
-- change_amount is signed: positive = restock/adjustment in, negative = loss,
-- breakage, correction, etc. Sales are NOT written here — they have their own
-- table and their own trigger below — this table is for movements that are
-- not a sale (restocks, manual corrections, damages).
create table if not exists public.stock_movements (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products (id) on delete restrict,
  change_amount integer not null check (change_amount <> 0),
  reason        text not null,
  created_at    timestamptz not null default now()
);

create index if not exists stock_movements_created_at_idx on public.stock_movements (created_at desc);
create index if not exists stock_movements_product_id_idx on public.stock_movements (product_id);

-- ----------------------------------------------------------------------------
-- Triggers: keep products.stock_quantity in sync
-- ----------------------------------------------------------------------------
create or replace function public.apply_sale_to_stock()
returns trigger
language plpgsql
as $$
begin
  update public.products
  set stock_quantity = stock_quantity - new.quantity
  where id = new.product_id;
  return new;
end;
$$;

drop trigger if exists trg_sales_apply_stock on public.sales;
create trigger trg_sales_apply_stock
  after insert on public.sales
  for each row
  execute function public.apply_sale_to_stock();

create or replace function public.apply_stock_movement()
returns trigger
language plpgsql
as $$
begin
  update public.products
  set stock_quantity = stock_quantity + new.change_amount
  where id = new.product_id;
  return new;
end;
$$;

drop trigger if exists trg_stock_movements_apply on public.stock_movements;
create trigger trg_stock_movements_apply
  after insert on public.stock_movements
  for each row
  execute function public.apply_stock_movement();

-- ----------------------------------------------------------------------------
-- Row Level Security
--
-- This is a portfolio demo with no auth system (per project scope). We enable
-- RLS on every table and grant read/write to the `anon` role explicitly, so
-- access is intentional and documented rather than "RLS disabled" by default.
-- In a real multi-tenant product these policies would be scoped per-user.
-- ----------------------------------------------------------------------------
alter table public.products enable row level security;
alter table public.sales enable row level security;
alter table public.stock_movements enable row level security;

create policy "public read products" on public.products
  for select using (true);
create policy "public write products" on public.products
  for insert with check (true);
create policy "public update products" on public.products
  for update using (true);

create policy "public read sales" on public.sales
  for select using (true);
create policy "public insert sales" on public.sales
  for insert with check (true);

create policy "public read stock_movements" on public.stock_movements
  for select using (true);
create policy "public insert stock_movements" on public.stock_movements
  for insert with check (true);

-- ----------------------------------------------------------------------------
-- Realtime
--
-- Add the tables the client needs to subscribe to (new sales, stock changes)
-- to the `supabase_realtime` publication. Without this, supabase.channel()
-- subscriptions on these tables never receive postgres_changes events.
-- ----------------------------------------------------------------------------
alter publication supabase_realtime add table public.sales;
alter publication supabase_realtime add table public.stock_movements;
alter publication supabase_realtime add table public.products;
