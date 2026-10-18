import { items } from "@/constants/items";

// Serve the merged price set from cache for 2 minutes so every page view does
// not hit the upstream feeds. The upstream fetches below also revalidate on
// their own intervals.
export const revalidate = 120;

// Conservative fallback prices for items with no current AH/bazaar listing.
// These are cheap enchanted books; exact value barely affects EV.
const FALLBACK_PRICES: Record<string, number> = {
  "ENCHANTED_BOOK-ULTIMATE_COMBO-1": 1_000,
  "ENCHANTED_BOOK-ULTIMATE_COMBO-2": 10_000,
  "ENCHANTED_BOOK-ULTIMATE_BANK-3": 1_000,
  "ENCHANTED_BOOK-INFINITE_QUIVER-7": 25_000,
};

// A feed that leaves more than this share of items unpriced is broken, not
// just sparsely listed.
const INCOMPLETE_THRESHOLD = 0.25;

type BazaarQuickStatus = {
  buyPrice: number;
  sellPrice: number;
};

type PriceSet = {
  lastModified: string | null;
  prices: Record<string, number>;
};

export type PricesResponse = {
  prices: Record<string, number>;
  lastModified: string | null;
  stale?: boolean;
  incomplete?: boolean;
  missingCount?: number;
  error?: string;
};

// Last successful price set for this warm instance, used when the upstream
// feed fails between (or before) cache revalidations.
let lastGoodPrices: PriceSet | null = null;

const fetchLowestbins = async (): Promise<PriceSet> => {
  const response = await fetch("https://lb.tricked.pro/lowestbins", {
    next: {
      revalidate: 120,
    },
  });

  if (!response.ok) {
    throw new Error(`lowestbins responded with ${response.status}`);
  }

  const data: unknown = await response.json();
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error("lowestbins returned an unexpected response shape");
  }

  const prices: Record<string, number> = {};
  for (const [item, price] of Object.entries(data)) {
    if (typeof price === "number" && Number.isFinite(price)) {
      prices[item] = price;
    }
  }
  if (Object.keys(prices).length === 0) {
    throw new Error("lowestbins returned no prices");
  }

  return { lastModified: response.headers.get("last-modified"), prices };
};

// The bazaar is a secondary source; failures here are non-fatal.
const fetchBazaarPrices = async (): Promise<Map<string, number>> => {
  const bazaarPrices = new Map<string, number>();
  try {
    const response = await fetch(
      "https://api.hypixel.net/v2/skyblock/bazaar",
      {
        next: {
          revalidate: 60,
        },
      }
    );
    if (!response.ok) return bazaarPrices;

    const bazaar = (await response.json()) as {
      products?: Record<string, { quick_status?: BazaarQuickStatus }>;
    };
    for (const key of Object.values(items)) {
      const buyPrice = bazaar.products?.[key]?.quick_status?.buyPrice;
      if (typeof buyPrice === "number" && buyPrice > 0) {
        bazaarPrices.set(key, buyPrice);
      }
    }
  } catch {
    // Ignore; prices are resolved from the other sources.
  }
  return bazaarPrices;
};

const json = (body: PricesResponse, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const GET = async () => {
  const bazaarPrices = await fetchBazaarPrices();

  let binPrices: Record<string, number> | undefined;
  let lastModified: string | null = null;
  let stale = false;

  try {
    const lowestbins = await fetchLowestbins();
    binPrices = lowestbins.prices;
    lastModified = lowestbins.lastModified;
  } catch {
    if (lastGoodPrices) {
      binPrices = lastGoodPrices.prices;
      lastModified = lastGoodPrices.lastModified;
      stale = true;
    }
  }

  if (!binPrices) {
    return json(
      {
        error:
          "Live prices are unavailable and no recent prices are cached, so expected values cannot be calculated.",
        prices: {},
        lastModified: null,
      },
      503
    );
  }

  const merge = (primary: Record<string, number>) => {
    const prices: Record<string, number> = {};
    let missingCount = 0;
    for (const item of Object.values(items)) {
      const price =
        primary[item] ?? bazaarPrices.get(item) ?? FALLBACK_PRICES[item];
      if (price === undefined) missingCount += 1;
      else prices[item] = price;
    }
    return { prices, missingCount };
  };

  let merged = merge(binPrices);
  let missingCount = merged.missingCount;
  const isIncomplete = () =>
    missingCount > Object.keys(items).length * INCOMPLETE_THRESHOLD;

  // A fresh but mostly-empty feed is worse than a complete cached one.
  if (!stale && isIncomplete()) {
    const cached = lastGoodPrices ? merge(lastGoodPrices.prices) : null;
    if (cached && cached.missingCount < missingCount) {
      merged = cached;
      missingCount = cached.missingCount;
      stale = true;
      lastModified = lastGoodPrices?.lastModified ?? lastModified;
    }
  }

  if (!stale) {
    lastGoodPrices = { lastModified, prices: merged.prices };
  }

  return json({
    prices: merged.prices,
    lastModified,
    ...(stale ? { stale: true } : {}),
    ...(isIncomplete() ? { incomplete: true, missingCount } : {}),
  });
};
