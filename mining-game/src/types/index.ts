// src/types/index.ts

// CHQ: Claude AI (Haiku) generated file

// export type MineType = "gold" | "silver" | "copper" | "lithium" | "rare_earth";

// CHQ: Gemini AI made
export const mineTypes = [
  "gold",
  "silver",
  "copper",
  "lithium",
  "rare_earth",
  "iron",
] as const;

// CHQ: Gemini AI made
export type MineType = (typeof mineTypes)[number];

export type MaterialType =
  | "refined_gold"
  | "refined_silver"
  | "refined_copper"
  | "circuits"
  | "batteries"
  | "construction_steel";
export type RobotType = "basic" | "advanced" | "elite";

export interface Robot {
  id: string;
  type: RobotType;
  name: string;
  level: number;
  mineType: MineType;
  efficiency: number;
  isWorking: boolean;
  assignedMine: string | null;
}

export interface Mine {
  id: string;
  type: MineType;
  name: string;
  depth: number;
  resourcePerSecond: number;
  /** Raw ore currently stockpiled at this mine (0..maxCapacity) */
  totalExtracted: number;
  /** Lifetime total ore ever pulled out of this mine, for stats display */
  lifetimeExtracted: number;
  robotsAssigned: number;
  maxCapacity: number;
}

export interface Material {
  type: MaterialType;
  quantity: number;
  value: number;
}

export interface GameState {
  balance: number;
  robots: Robot[];
  mines: Mine[];
  materials: Material[];
  totalMined: number;
  gameTime: number;
}

export interface ProcessingRecipe {
  id: MaterialType;
  label: string;
  icon: string;
  /** Ore consumed from a single mine's stockpile to run this recipe once */
  input: { type: MineType; quantity: number };
  output: { type: MaterialType; quantity: number };
  energyCost: number;
}

// CHQ: Claude AI (Sonnet): Base $/unit paid when raw, unprocessed ore is sold directly.
export const ORE_BASE_VALUE: Record<MineType, number> = {
  gold: 50,
  silver: 40,
  copper: 30,
  iron: 5,
  lithium: 30,
  rare_earth: 30,
};

// CHQ: Claude AI (Sonnet):
export const PROCESSING_RECIPES: ProcessingRecipe[] = [
  {
    id: "refined_gold",
    label: "Refined Gold",
    icon: "🟡",
    input: { type: "gold", quantity: 10 },
    output: { type: "refined_gold", quantity: 5 },
    energyCost: 500,
  },
  {
    id: "refined_silver",
    label: "Refined Silver",
    icon: "⚪",
    input: { type: "silver", quantity: 10 },
    output: { type: "refined_silver", quantity: 5 },
    energyCost: 400,
  },
  {
    id: "refined_copper",
    label: "Refined Copper",
    icon: "🟠",
    input: { type: "copper", quantity: 10 },
    output: { type: "refined_copper", quantity: 5 },
    energyCost: 300,
  },
  {
    id: "circuits",
    label: "Circuits",
    icon: "🔌",
    input: { type: "rare_earth", quantity: 6 },
    output: { type: "circuits", quantity: 2 },
    energyCost: 800,
  },
  {
    id: "batteries",
    label: "Batteries",
    icon: "🔋",
    input: { type: "lithium", quantity: 8 },
    output: { type: "batteries", quantity: 3 },
    energyCost: 600,
  },
  {
    id: "construction_steel",
    label: "Construction Steel",
    icon: "🏗️",
    input: { type: "iron", quantity: 15 }, // ← iron instead of copper
    output: { type: "construction_steel", quantity: 5 },
    energyCost: 400,
  },
];
