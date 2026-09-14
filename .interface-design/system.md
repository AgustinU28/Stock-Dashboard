# Mostrador — design system

## Direction and feel

A neighborhood almacen counter, not a SaaS console. The product exists in the
physical world of a small store: kraft paper, chalk price boards, register
ticket tape, price-gun stickers. Calm and tactile, not corporate. The person
using this is a shopkeeper glancing between customers — the eye should land
on "what needs restocking" and "how's today going" instantly.

**Domain vocabulary:** gondola (shelf/aisle), caja registradora, cinta de
ticket, quiebre de stock, reposicion, mostrador, etiqueta de precio.

**Rejected defaults:**
- Blue/indigo SaaS gradient KPI cards -> warm kraft/cream neutral surfaces.
- Generic "recent activity" list with icons in colored circles -> a
  ticket-tape feed styled like a running register receipt.
- Pill badges for stock status -> price-tag-shaped chip (pointed left edge +
  grommet dot) — this is the signature element.

## Tokens

One hue family per mode; only lightness shifts between surface levels
(background -> card -> popover). Full values live in `app/globals.css`
(`:root` / `.dark`) and are wired into `tailwind.config.ts`.

- **background:** warm cream (`36 30% 96%` light / `30 12% 9%` dark)
- **foreground:** charcoal ink, warm-tinted, never pure black
- **accent:** terracotta/amber (`24 78% 48%`) — reserved for the one hero KPI
  and the sales chart. Not used decoratively elsewhere.
- **success:** register green (connection indicator, healthy stock)
- **warning:** mustard (low stock)
- **destructive:** warm red (out of stock)

## Depth strategy

**Subtle shadows**, committed across the app — not borders-only, not
layered. `Card` uses the light-mode 3-layer stack from the interface-design
skill (`0 0 0 1px rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.06), 0 2px 4px
rgba(0,0,0,.04)`), collapsing to a single ring in dark mode
(`0 0 0 1px rgba(255,255,255,.08)`).

## Spacing & radius

Base unit: 4px multiples via Tailwind defaults. `--radius: 0.625rem` (10px)
on cards; `calc(var(--radius) - 2px/4px)` for md/sm (inputs, small chips).

## Typography

Three-font system, loaded via `next/font/google` in `app/layout.tsx`:

- **Fraunces** (`font-display`) — warm serif for page/section titles. Evokes
  a hand-painted store sign rather than a SaaS wordmark.
- **IBM Plex Sans** (`font-sans`, default body) — UI text, labels.
- **IBM Plex Mono** (`font-mono`, `.font-mono-ticket` utility with
  `tabular-nums`) — all numbers: prices, KPI hero values, the ticket feed,
  table stock counts. This is what gives the "printed receipt" feel.

**Hierarchy pattern (KPI card):** label 11px/500/uppercase/tracked/muted ->
hero value 28px/600/mono/tabular-nums (accent color only on the single
dominant KPI) -> hint 12px/muted below.

## Key component patterns

- **`Card`** (`components/ui/card.tsx`) — `rounded-lg bg-card`, subtle
  shadow per Depth strategy above. Reused everywhere; don't inline the
  shadow classes elsewhere.
- **`PriceTag`** (`components/ui/price-tag.tsx`) — the signature stock-status
  chip. `clip-path: polygon(10px 0,100% 0,100% 100%,10px 100%,0 50%)` for
  the pointed left edge, a 4px rounded dot as the grommet, `font-mono-ticket`
  text. Three tones: `ok` (success), `low` (warning), `out` (destructive).
  Low-stock threshold is 10 units, hardcoded in `stock-table.tsx`.
- **`KpiCard`** — see Typography hierarchy pattern above. `accent` prop
  reserved for exactly one dominant metric per screen.
- **Ticket feed rows** — monospace, `border-b border-dashed border-border`
  between entries (perforation effect), new entries flash with
  `animate-ticket-in animate-pulse-once` (both defined in
  `tailwind.config.ts`).
- **Realtime flash** — any row/entry that just changed via a Supabase
  `postgres_changes` event gets `animate-pulse-once` for 1.6s
  (`FLASH_DURATION_MS` in `dashboard-live.tsx`), background fades from
  `success/0.35` to transparent.

## Notes for next session

- Dark mode tokens exist and are wired, but no theme-toggle UI has been
  built yet — `.dark` class is inert until something adds it.
- Multi-page nav now exists in `app/(app)/layout.tsx`: brand + tabs
  (`NavTabs`) on the left, user email + sign-out on the right. Per-page
  headers stay a simple `h1` (e.g. "Resumen", "Productos") — the brand
  identity lives in the shared shell, don't repeat it per page.
- The whole app is now gated by Supabase Auth (see README) — `/login` is
  outside the `(app)` route group and has no nav shell.
