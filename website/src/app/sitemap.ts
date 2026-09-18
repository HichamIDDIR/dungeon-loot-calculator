import type { MetadataRoute } from "next";
import data from "../../public/data.json";

const FLOOR_ORDER = [
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "M1",
  "M2",
  "M3",
  "M4",
  "M5",
  "M6",
  "M7",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    {
      url: "https://dungeon-profit-calculator.vercel.app",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const floors = ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "M1", "M2", "M3", "M4", "M5", "M6", "M7"].filter(
    (floor) => floor in data
  ).sort((a, b) => FLOOR_ORDER.indexOf(a as (typeof FLOOR_ORDER)[number]) - FLOOR_ORDER.indexOf(b as (typeof FLOOR_ORDER)[number]));

  for (const floor of floors) {
    pages.push({
      url: `https://dungeon-profit-calculator.vercel.app/#${floor.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  return pages;
}