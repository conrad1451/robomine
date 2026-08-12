// src/types/index.ts

// CHQ: Claude AI (Haiku) generated file

export type MineType = "gold" | "silver" | "copper" | "lithium" | "rare_earth";
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
  input: { type: MineType; quantity: number }[];
  output: { type: MaterialType; quantity: number };
  processingTime: number;
  energyCost: number;
}
