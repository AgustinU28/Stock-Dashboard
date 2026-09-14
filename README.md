# Mostrador — panel de ventas y stock

Panel en tiempo real de ventas y stock para un comercio de barrio, construido
con Next.js App Router y Supabase (Postgres + Row Level Security + Realtime +
Auth). Ver [`.interface-design/system.md`](.interface-design/system.md) para
la dirección de diseño (tokens, tipografías, componentes).

## Stack

- **Next.js 16** (React 19), TypeScript
- **Supabase**: Postgres, RLS, Realtime, Auth (email/password)
- **Tailwind CSS** + primitivas propias estilo shadcn
- **recharts** para el gráfico de ventas

## Puesta en marcha

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

Copiá `.env.local.example` a `.env.local` y completá con los datos de tu
proyecto de Supabase (Project Settings → API):

```bash
cp .env.local.example .env.local
```

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — públicas,
  se usan en el navegador.
- `SUPABASE_SERVICE_ROLE_KEY` — solo si vas a correr el seed. Sacala de la
  misma pantalla (secreto `service_role`). **Nunca** la expongas al browser
  ni la commitees.

### 3. Base de datos

Corré las migraciones, en orden, contra tu proyecto (Supabase dashboard →
SQL Editor → pegar el contenido → Run):

1. [`supabase/migrations/0001_init_schema.sql`](supabase/migrations/0001_init_schema.sql)
   — tablas (`products`, `sales`, `stock_movements`), triggers que mantienen
   `stock_quantity` sincronizado, RLS, y las tablas agregadas a la
   publicación `supabase_realtime`.
2. [`supabase/migrations/0002_auth.sql`](supabase/migrations/0002_auth.sql)
   — reemplaza las políticas RLS públicas por políticas que exigen un
   usuario autenticado.

### 4. Crear un usuario

La app no tiene alta pública de usuarios (es una herramienta de un solo
mostrador, no un producto multi-tenant). Creá tu login en Supabase
dashboard → **Authentication → Users → Add user**.

### 5. (Opcional) poblar datos de ejemplo

```bash
npm run seed
```

Necesita `SUPABASE_SERVICE_ROLE_KEY` en `.env.local` — inserta ~50 productos
y ~200 ventas de los últimos 30 días, respetando el stock disponible.

### 6. Correr

```bash
npm run dev
```

Abrí http://localhost:3000 — te va a redirigir a `/login`.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (Turbopack) |
| `npm run dev:webpack` | Servidor de desarrollo con webpack en vez de Turbopack (fallback) |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run seed` | Puebla la base con datos de ejemplo |

## Estructura

```
app/
  login/              pantalla de login (fuera del shell autenticado)
  (app)/              rutas protegidas por middleware
    page.tsx            overview: KPIs, gráfico, feed de ventas, stock
    productos/           alta y listado de productos
    ventas/               historial de ventas
    movimientos/          altas de movimientos de stock (reposición, ajuste, merma)
components/
  dashboard/          componentes del overview
  ui/                 primitivas (Card, PriceTag, ...)
lib/
  supabase/           clientes de Supabase (browser, server, middleware)
  utils/              cn, formato de moneda/fecha
supabase/
  migrations/         SQL versionado
scripts/seed.mjs      script de datos de ejemplo
```

## Seguridad

Todas las tablas tienen RLS habilitada. Antes de `0002_auth.sql`, cualquiera
con la `anon key` podía leer y escribir — intencional en el scope inicial de
demo. Después de `0002_auth.sql`, todo requiere sesión autenticada.
