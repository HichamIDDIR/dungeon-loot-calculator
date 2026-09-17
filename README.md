# Dungeon Loot Calculator

> **Live demo:** https://dungeon-profit-calculator.vercel.app

A Next.js website that computes the expected value of Hypixel SkyBlock dungeon loot chests (F1–F7, M1–M7) using hand-verified drop data from the [Hypixel SkyBlock Community Wiki](https://hypixelskyblock.minecraft.wiki) and live market prices.

**Fork notice:** this is a fork of [FluxCapacitor2/dungeon-loot-calculator](https://github.com/FluxCapacitor2/dungeon-loot-calculator) (archived May 2026, no license specified). It continues the project with refreshed data and new decision aids — see **Credits** below.

## Features

- Expected value per run **net of base chest cost** (Wood is free, Bedrock costs 2,000,000, etc. — per-floor `BASE_COSTS` in `website/src/constants/baseCosts.ts`, verified against the wiki).
- **"Worth opening?" verdict** — green ✅ / red ⛔ based on whether net EV is positive.
- **Chest Comparison panel** — every chest of a floor side-by-side with net EV and an Open/Skip verdict; respects the S+ toggle.
- **Per-item `(skip)` hint** — rows where market price is lower than the chest's added cost are flagged; those items are rationally declined and excluded from EV.
- **Kismet reroll EV** — EV after paying a Kismet Feather.
- **Live prices** — a `force-dynamic` `/api/prices`: per item, AH lowest BIN (Tricked's `lowestbins`, 120 s cache) → bazaar instant-buy price (Hypixel v2, 60 s) → conservative fallback for unlisted books (currently only Bank III / Infinite Quiver VII fallbacks are active).

## Data

`website/public/data.json` holds all floors F1–F7 / M1–M7 in the wiki's flat-percentage schema (`firstRoll` / `base` / `sPlus`, rows grouped by chest). Every value was hand-verified against the wiki, including S+ bonus-roll bonuses; no essence/utility leaks, no rows above 100%. All 115 items map to SkyBlock item ids in `website/src/constants/items.ts`.

## Project layout

- `website/` — the Next.js app (pricing API, loot-data API, UI).
- ~~`extractor/`~~ — removed: the upstream scraper targeted the deprecated `wiki.hypixel.net`; the wiki has moved, and drop data is now curated directly into `public/data.json`.

## Run locally

```bash
cd website
npm install
npm run dev
```

Checks: `npm run lint`, `npx tsc --noEmit`, `npm run build`.

## Credits

- Original project and upstream work by **FluxCapacitor2** — [github.com/FluxCapacitor2/dungeon-loot-calculator](https://github.com/FluxCapacitor2/dungeon-loot-calculator). Archived by the owner on May 16, 2026. Upstream specifies no license; all original code remains theirs.
- Drop data sourced from the [Hypixel SkyBlock Community Wiki](https://hypixelskyblock.minecraft.wiki).
- Price data: [Tricked's `lowestbins`](https://github.com/Tricked-dev/lowestbins) and the [Hypixel Public API](https://api.hypixel.net/v2/skyblock/bazaar).

## License

MIT © 2026 HichamIDDIR — applies to this fork's own code and changes. See [LICENSE](./LICENSE). The upstream project by FluxCapacitor2 carries no license.