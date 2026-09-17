import { FloorLootTable } from "@/types/LootTable";
import data from "../../../../../public/data.json";

export type LootAPIResponse = {
  item: string;
  cost: string;
  firstRoll: `${string}%`;
  base: `${string}%`;
  sPlus: `${string}%`;
}[];

const toRow = (it: FloorLootTable): LootAPIResponse[number] => ({
  item: it.itemName,
  cost: it.cost,
  firstRoll: it.firstRoll,
  base: it.base,
  sPlus: it.sPlus,
});

export const GET = (
  request: Request,
  { params }: { params: { floor: string } }
) => {
  const floorData = (data as Record<string, FloorLootTable[]>)[params.floor];

  const { searchParams } = new URL(request.url);
  const chest = searchParams.get("chest");

  if (chest?.toLowerCase() === "all") {
    const chests: Record<string, LootAPIResponse> = {};
    for (const it of floorData ?? []) {
      (chests[it.chest] ??= []).push(toRow(it));
    }
    return new Response(JSON.stringify(chests), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const normalizedChest = chest?.toLowerCase().replace(/ chest$/, "");

  const response = floorData
    ?.filter((it) => it.chest == normalizedChest)
    .map(toRow);

  return new Response(JSON.stringify(response), {
    headers: { "Content-Type": "application/json" },
  });
};