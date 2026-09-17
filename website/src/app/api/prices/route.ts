import { items } from "@/constants/items";

export const dynamic = "force-dynamic";

// Conservative fallback prices for items with no current AH/bazaar listing.
// These are cheap enchanted books; exact value barely affects EV.
const FALLBACK_PRICES: Record<string, number> = {
  "ENCHANTED_BOOK-ULTIMATE_COMBO-1": 1_000,
  "ENCHANTED_BOOK-ULTIMATE_COMBO-2": 10_000,
  "ENCHANTED_BOOK-ULTIMATE_BANK-3": 1_000,
  "ENCHANTED_BOOK-INFINITE_QUIVER-7": 25_000,
};

type BazaarQuickStatus = {
  buyPrice: number;
  sellPrice: number;
};

export const GET = async () => {
  const pricesResponse = await fetch("https://lb.tricked.pro/lowestbins", {
    next: {
      revalidate: 120,
    },
  });

  const data = (await pricesResponse.json()) as Record<string, number>;
  const lastModified = pricesResponse.headers.get("last-modified");

  const bazaarResponse = await fetch("https://api.hypixel.net/v2/skyblock/bazaar", {
    next: {
      revalidate: 60,
    },
  });
  const bazaar = (await bazaarResponse.json()) as {
    products?: Record<string, { quick_status: BazaarQuickStatus }>;
  };
  const bazaarPrices = new Map<string, number>();
  for (const key of Object.values(items)) {
    const product = bazaar.products?.[key];
    if (product) bazaarPrices.set(key, product.quick_status.buyPrice);
  }

  const pricesSubset: Record<string, number> = {};
  for (const item of Object.values(items)) {
    pricesSubset[item] =
      data[item] ?? bazaarPrices.get(item) ?? FALLBACK_PRICES[item];
  }

  return new Response(JSON.stringify({ lastModified, prices: pricesSubset }), {
    headers: { "Content-Type": "application/json" },
  });
};
