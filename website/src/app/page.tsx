"use client";

import { Footer } from "@/components/Footer";
import { useState } from "react";
import useSWR from "swr";
import { FormattedNumber } from "../components/FormattedNumber";
import { BASE_COSTS } from "../constants/baseCosts";
import { items } from "../constants/items";
import { LootAPIResponse } from "./api/data/[floor]/route";

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());

const chestEV = (
  rows: LootAPIResponse,
  sPlus: boolean,
  base: number,
  prices: Record<string, number> | undefined
) => {
  let ev = 0;
  for (const row of rows) {
    const itemId = items[row.item];
    const price = prices?.[itemId];
    if (price === undefined) continue;
    const profit = price - parseInt(row.cost.replaceAll(/,/g, ""));
    if (profit < 0) continue;
    ev += (profit * parseFloat(sPlus ? row.sPlus : row.base)) / 100;
  }
  return ev - base;
};

const dateFormat = new Intl.RelativeTimeFormat(undefined);

export default function Home() {
  const [floor, setFloor] = useState("F7");
  const [chest, setChest] = useState("Bedrock Chest");

  // Reset the "Chest" dropdown if it's set to Bedrock and a floor under 5 is chosen
  if (parseInt(floor.charAt(1)) < 5 && chest === "Bedrock Chest") {
    setChest("Obsidian Chest");
  }

  const url = `/api/data/${floor}?chest=${encodeURIComponent(chest)}`;

  const chestName = chest.toLowerCase().replace(/ chest$/, "");
  const baseCost = BASE_COSTS[floor]?.[chestName] ?? 0;

  const { data: chances } = useSWR<LootAPIResponse>(url, fetcher);
  const { data: chestSummary } = useSWR<Record<string, LootAPIResponse>>(
    `/api/data/${floor}?chest=all`,
    fetcher
  );
  const { data: priceData } = useSWR<{
    prices: Record<string, number>;
    lastModified: string;
  }>("/api/prices", fetcher);

  const calculateEV = (sPlus = false) =>
    chances !== undefined
      ? chestEV(chances, sPlus, baseCost, priceData?.prices)
      : 0;

  const [sPlus, setSPlus] = useState(true);
  const ev = calculateEV(sPlus);
  const kismetPrice = priceData?.prices?.["KISMET_FEATHER"];
  const evAfterReroll = ev - (kismetPrice ?? 0);

  return (
    <main className="flex flex-col prose dark:prose-invert mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Hypixel SkyBlock Dungeon Loot Calculator",
            alternateName: "SkyBlock Dungeon Loot Calculator",
            url: "https://dungeon-profit-calculator.vercel.app",
            applicationCategory: "UtilityApplication",
            operatingSystem: "Web",
            inLanguage: "en",
            description:
              "Expected value calculator for Hypixel SkyBlock dungeon loot chests (F1-F7, M1-M7). Compares wood, gold, diamond, emerald, obsidian and bedrock chest EV using live market prices, S+ drop chances and Kismet feather rerolls.",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            genre: ["Gaming", "Hypixel SkyBlock"],
          }),
        }}
      />
      <h1 className="mt-24">SkyBlock Dungeon Loot Calculator</h1>
      <p className="mt-0 text-lg">
        Find out whether a Hypixel SkyBlock dungeon chest is worth opening.
        This EV calculator covers every floor (F1–F7 and M1–M7) and all six
        chests (wood, gold, diamond, emerald, obsidian, and bedrock) using
        live BIN prices, S+ drop chances, and Kismet feather reroll
        profitability.
      </p>
      <h2 className="mt-4">Inputs</h2>
      <form className="flex md:flex-row gap-4">
        <label className="flex flex-col gap-2">
          <span className="font-medium">Floor</span>
          <select
            className="p-2 rounded-md dark:bg-gray-900"
            value={floor}
            onChange={(e) => setFloor(e.currentTarget.value)}
          >
            <option value="F1">F1</option>
            <option value="F2">F2</option>
            <option value="F3">F3</option>
            <option value="F4">F4</option>
            <option value="F5">F5</option>
            <option value="F6">F6</option>
            <option value="F7">F7</option>
            <option value="M1">M1</option>
            <option value="M2">M2</option>
            <option value="M3">M3</option>
            <option value="M4">M4</option>
            <option value="M5">M5</option>
            <option value="M6">M6</option>
            <option value="M7">M7</option>
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-medium">Chest</span>
          <select
            className="p-2 rounded-md dark:bg-gray-900"
            value={chest}
            onChange={(e) => setChest(e.currentTarget.value)}
          >
            <option value="Wood Chest">Wood</option>
            <option value="Gold Chest">Gold</option>
            <option value="Diamond Chest">Diamond</option>
            <option value="Emerald Chest">Emerald</option>
            <option value="Obsidian Chest">Obsidian</option>
            <option
              value="Bedrock Chest"
              disabled={parseInt(floor.charAt(1)) < 5}
            >
              Bedrock
            </option>
          </select>
        </label>
      </form>
      {!!chances && (
        <>
          <h2>Stats</h2>
          <label>
            <input
              type="checkbox"
              onChange={(e) => setSPlus(e.currentTarget.checked)}
              checked={sPlus}
            />
            <span className="ml-2">S+ run?</span>
          </label>
          <ul>
            <li>
              Expected value per run:{" "}
              <FormattedNumber>{ev}</FormattedNumber>
              <span className={ev > 0 ? "text-green-600" : "text-red-600"}>
                {" "}
                {ev > 0 ? "✅ Worth opening" : "⛔ Not worth opening"}
              </span>
            </li>
            <li>
              Chest cost (base):{" "}
              <FormattedNumber noColor>{baseCost}</FormattedNumber>
            </li>
            <li>
              Kismet Price:{" "}
              <FormattedNumber noColor>
                {kismetPrice ?? "Loading..."}
              </FormattedNumber>
            </li>
            <li>
              Expected value after rerolling:{" "}
              {kismetPrice ? (
                <FormattedNumber>{evAfterReroll}</FormattedNumber>
              ) : (
                "Loading..."
              )}
            </li>
            <li>
              {evAfterReroll > 0
                ? "🎉 Rerolling is likely profitable!"
                : "😔 Rerolling is unlikely profitable :("}
            </li>
          </ul>
          {chestSummary !== undefined && (
            <>
              <h2>Chest Comparison</h2>
              <table>
                <thead>
                  <tr>
                    <th>Chest</th>
                    <th>Net EV ({sPlus ? "S+" : "base"})</th>
                    <th>Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(chestSummary).map((c) => {
                    const net = chestEV(
                      chestSummary[c],
                      sPlus,
                      BASE_COSTS[floor]?.[c] ?? 0,
                      priceData?.prices
                    );
                    return (
                      <tr key={c}>
                        <td>{c.charAt(0).toUpperCase() + c.slice(1)} Chest</td>
                        <td>
                          <FormattedNumber>{net}</FormattedNumber>
                        </td>
                        <td>{net > 0 ? "✅ Open" : "⛔ Skip"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
          <h2>Items</h2>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Cost</th>
                <th>First Roll</th>
                <th>Chance (Base)</th>
                <th>Chance (S+)</th>
                <th>BIN</th>
                <th>Profit</th>
                <th>EV (S+)</th>
              </tr>
            </thead>
            <tbody>
              {chances.map((row) => {
                const itemId = items[row.item];
                const price = priceData?.prices?.[itemId];
                const profit =
                  (price ?? 0) - parseInt(row.cost.replaceAll(/,/g, ""));
                const ev = (profit * parseFloat(row.sPlus)) / 100;
                return (
                  <tr key={row.item}>
                    <td>{row.item}</td>
                    <td>{row.cost}</td>
                    <td>{row.firstRoll}</td>
                    <td>{row.base}</td>
                    <td>{row.sPlus}</td>
                    <td>
                      <FormattedNumber noColor>{price ?? "-"}</FormattedNumber>
                    </td>
                    <td>
                      <FormattedNumber>{profit}</FormattedNumber>
                      {profit < 0 && (
                        <span className="ml-1 text-xs text-gray-500">
                          (skip)
                        </span>
                      )}
                    </td>
                    <td>
                      <FormattedNumber>
                        {price ? Math.round(ev) : "-"}
                      </FormattedNumber>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
      <h2 className="mt-12 mb-0">Notes</h2>
      <Footer
        pricesLastUpdated={
          priceData?.lastModified ? new Date(priceData.lastModified) : undefined
        }
      />
    </main>
  );
}
