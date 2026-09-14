-- ============================================================================
-- 0002_auth.sql
-- Locks every table down to authenticated users. The app has no public
-- sign-up (it's a single-counter tool, not a multi-tenant product) — create
-- logins via the Supabase dashboard: Authentication -> Users -> Add user.
-- ============================================================================

drop policy if exists "public read products" on public.products;
drop policy if exists "public write products" on public.products;
drop policy if exists "public update products" on public.products;

create policy "authenticated read products" on public.products
  for select to authenticated using (true);
create policy "authenticated write products" on public.products
  for insert to authenticated with check (true);
create policy "authenticated update products" on public.products
  for update to authenticated using (true);

drop policy if exists "public read sales" on public.sales;
drop policy if exists "public insert sales" on public.sales;

create policy "authenticated read sales" on public.sales
  for select to authenticated using (true);
create policy "authenticated insert sales" on public.sales
  for insert to authenticated with check (true);

drop policy if exists "public read stock_movements" on public.stock_movements;
drop policy if exists "public insert stock_movements" on public.stock_movements;

create policy "authenticated read stock_movements" on public.stock_movements
  for select to authenticated using (true);
create policy "authenticated insert stock_movements" on public.stock_movements
  for insert to authenticated with check (true);
