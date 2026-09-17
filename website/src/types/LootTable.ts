export interface MasterLootTable {
  F1: FloorLootTable[];
  M1: FloorLootTable[];
  F2: FloorLootTable[];
  M2: FloorLootTable[];
  F3: FloorLootTable[];
  M3: FloorLootTable[];
  F4: FloorLootTable[];
  M4: FloorLootTable[];
  F5: FloorLootTable[];
  M5: FloorLootTable[];
  F6: FloorLootTable[];
  M6: FloorLootTable[];
  F7: FloorLootTable[];
  M7: FloorLootTable[];
}

export interface FloorLootTable {
  chest: string;
  itemName: string;
  cost: string;
  firstRoll: `${string}%`;
  base: `${string}%`;
  sPlus: `${string}%`;
}