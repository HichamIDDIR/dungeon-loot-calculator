import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://dungeon-profit-calculator.vercel.app"),
  title: {
    default: "Hypixel SkyBlock Dungeon Loot Calculator | F1–M7 Chest EV",
    template: "%s | Dungeon Loot Calculator",
  },
  description:
    "Expected value calculator for Hypixel SkyBlock dungeon chests (F1–F7, M1–M7). Compare wood, gold, diamond, emerald, obsidian and bedrock chests using live prices and S+ drop chances, including Kismet reroll EV.",
  keywords: [
    "Hypixel SkyBlock",
    "dungeon loot",
    "dungeon loot calculator",
    "chest EV",
    "expected value",
    "F7 loot",
    "M7 loot",
    "catacombs",
    "Kismet feather",
    "bedrock chest",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "SkyBlock Dungeon Loot Calculator",
    title: "Hypixel SkyBlock Dungeon Loot Calculator | F1–M7 Chest EV",
    description:
      "Expected value calculator for Hypixel SkyBlock dungeon chests (F1–F7, M1–M7). Compare chests using live prices, S+ drop chances, and Kismet reroll EV.",
  },
  twitter: {
    card: "summary",
    title: "Hypixel SkyBlock Dungeon Loot Calculator",
    description:
      "Expected value calculator for Hypixel SkyBlock dungeon chests (F1–F7, M1–M7) using live prices and S+ drop chances.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
