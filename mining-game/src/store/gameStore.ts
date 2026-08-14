// src/store/gameStore.ts

// CHQ: Claude AI (Haiku) generated file, heavily edited by me and Claude AI (Sonnet)

import { create } from "zustand";
import type {
  GameState,
  Robot,
  Mine,
  MineType,
  RobotType,
  MaterialType,
} from "../types";
import { ORE_BASE_VALUE, PROCESSING_RECIPES } from "../types";
import { computeGameTick, GAME_DURATION_SECONDS } from "./gameTick";

const MINE_DATA: Record<MineType, Mine> = {
  gold: {
    id: "gold-1",
    type: "gold",
    name: "Golden Valley",
    depth: 100,
    resourcePerSecond: 0.5,
    totalExtracted: 0,
    lifetimeExtracted: 0,
    robotsAssigned: 0,
    maxCapacity: 1000,
  },
  silver: {
    id: "silver-1",
    type: "silver",
    name: "Silver Ridge",
    depth: 80,
    resourcePerSecond: 0.8,
    totalExtracted: 0,
    lifetimeExtracted: 0,
    robotsAssigned: 0,
    maxCapacity: 1200,
  },
  copper: {
    id: "copper-1",
    type: "copper",
    name: "Copper Canyon",
    depth: 120,
    resourcePerSecond: 1.2,
    totalExtracted: 0,
    lifetimeExtracted: 0,
    robotsAssigned: 0,
    maxCapacity: 1500,
  },
  lithium: {
    id: "lithium-1",
    type: "lithium",
    name: "Lithium Deep",
    depth: 200,
    resourcePerSecond: 0.3,
    totalExtracted: 0,
    lifetimeExtracted: 0,
    robotsAssigned: 0,
    maxCapacity: 500,
  },
  rare_earth: {
    id: "rare_earth-1",
    type: "rare_earth",
    name: "Rare Element Core",
    depth: 300,
    resourcePerSecond: 0.1,
    totalExtracted: 0,
    lifetimeExtracted: 0,
    robotsAssigned: 0,
    maxCapacity: 200,
  },
  iron: {
    id: "iron-1",
    type: "iron",
    name: "Iron Ore Field",
    depth: 60,
    resourcePerSecond: 2.5, // Most abundant material
    totalExtracted: 0,
    lifetimeExtracted: 0,
    robotsAssigned: 0,
    maxCapacity: 2000,
  },
};

const ROBOT_COSTS: Record<RobotType, number> = {
  basic: 5000,
  advanced: 15000,
  elite: 50000,
};

const ROBOT_EFFICIENCY: Record<RobotType, number> = {
  basic: 1,
  advanced: 2.5,
  elite: 5,
};

// CHQ: Claude AI (Sonnet): Cost to upgrade a robot to (level + 1), scales with current level and tier.
const ROBOT_UPGRADE_BASE_COST: Record<RobotType, number> = {
  basic: 2000,
  advanced: 6000,
  elite: 20000,
};

const MAX_ROBOT_LEVEL = 10;

// CHQ: Claude AI (Haiku) extracted material prices into its own Record of constants
const MATERIAL_VALUES: Record<MaterialType, number> = {
  refined_gold: 450,
  refined_silver: 75,
  refined_copper: 12,
  circuits: 320,
  batteries: 280,
  construction_steel: 5,
};

interface GameStoreState extends GameState {
  addRobot: (type: RobotType, mineName: string) => void;
  assignRobotToMine: (robotId: string, mineName: MineType) => void;
  collectResources: () => void;
  processResources: (recipeId: MaterialType) => void;
  sellOre: (mineType: MineType) => void;
  sellMaterial: (materialType: MaterialType, quantity?: number) => void;
  upgradeMine: (mineName: MineType) => void;
  upgradeRobot: (robotId: string) => void;
  addBalance: (amount: number) => void;
  deductBalance: (amount: number) => boolean;
}

// CHQ: Claude AI (Sonnet):
export function robotUpgradeCost(robot: Robot): number {
  return Math.round(
    ROBOT_UPGRADE_BASE_COST[robot.type] * Math.pow(1.6, robot.level - 1),
  );
}

// CHQ: Claude AI (Haiku) swapped hard coded values with iterating ove a Record of constants
export const useGameStore = create<GameStoreState>((set, get) => ({
  balance: 50000,
  robots: [],
  mines: Object.values(MINE_DATA),
  materials: Object.entries(MATERIAL_VALUES).map(([type, value]) => ({
    type: type as MaterialType,
    quantity: 0,
    value,
  })),

  totalMined: 0,
  gameTime: GAME_DURATION_SECONDS,
  isGameOver: false,

  addRobot: (type: RobotType, mineName: string) => {
    const cost = ROBOT_COSTS[type];
    const state = get();

    if (state.isGameOver) return;
    if (state.balance < cost) return;

    const robot: Robot = {
      id: `robot-${Date.now()}`,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Bot #${state.robots.length + 1}`,
      level: 1,
      mineType: mineName as MineType,
      efficiency: ROBOT_EFFICIENCY[type],
      isWorking: true,
      assignedMine: mineName,
    };

    set((state) => ({
      robots: [...state.robots, robot],
      balance: state.balance - cost,
    }));
  },

  assignRobotToMine: (robotId: string, mineName: MineType) => {
    set((state) => ({
      robots: state.robots.map((robot) =>
        robot.id === robotId
          ? { ...robot, assignedMine: mineName, mineType: mineName }
          : robot,
      ),
    }));
  },

  collectResources: () => {
    set((state) => computeGameTick(state));
  },

  sellOre: (mineType: MineType) => {
    set((state) => {
      if (state.isGameOver) return state;

      const mine = state.mines.find((m) => m.type === mineType);
      if (!mine || mine.totalExtracted <= 0) return state;

      const proceeds = mine.totalExtracted * ORE_BASE_VALUE[mineType];

      return {
        balance: state.balance + proceeds,
        mines: state.mines.map((m) =>
          m.type === mineType ? { ...m, totalExtracted: 0 } : m,
        ),
      };
    });
  },

  processResources: (recipeId: MaterialType) => {
    set((state) => {
      const recipe = PROCESSING_RECIPES.find((r) => r.id === recipeId);
      if (!recipe) return state;

      if (state.balance < recipe.energyCost) return state;

      const mine = state.mines.find((m) => m.type === recipe.input.type);
      if (!mine || mine.totalExtracted < recipe.input.quantity) return state;

      const newMines = state.mines.map((m) =>
        m.type === recipe.input.type
          ? { ...m, totalExtracted: m.totalExtracted - recipe.input.quantity }
          : m,
      );

      const newMaterials = state.materials.map((mat) =>
        mat.type === recipe.output.type
          ? { ...mat, quantity: mat.quantity + recipe.output.quantity }
          : mat,
      );

      return {
        balance: state.balance - recipe.energyCost,
        mines: newMines,
        materials: newMaterials,
      };
    });
  },

  // CHQ: Claude AI (Sonnet):
  sellMaterial: (materialType: MaterialType, quantity?: number) => {
    set((state) => {
      const material = state.materials.find((m) => m.type === materialType);
      if (!material || material.quantity <= 0) return state;

      const sellQty = Math.min(
        quantity ?? material.quantity,
        material.quantity,
      );
      if (sellQty <= 0) return state;

      return {
        balance: state.balance + sellQty * material.value,
        materials: state.materials.map((m) =>
          m.type === materialType
            ? { ...m, quantity: m.quantity - sellQty }
            : m,
        ),
      };
    });
  },

  upgradeMine: (mineName: MineType) => {
    const upgradeCost = 10000;
    const state = get();

    if (state.isGameOver) return;
    if (state.balance < upgradeCost) return;

    set((state) => ({
      mines: state.mines.map((mine) =>
        mine.type === mineName
          ? {
              ...mine,
              depth: mine.depth + 10,
              resourcePerSecond: mine.resourcePerSecond * 1.2,
              maxCapacity: Math.round(mine.maxCapacity * 1.25),
            }
          : mine,
      ),
      balance: state.balance - upgradeCost,
    }));
  },

  // CHQ: Claude AI (Sonnet):
  upgradeRobot: (robotId: string) => {
    set((state) => {
      if (state.isGameOver) return state;

      const robot = state.robots.find((r) => r.id === robotId);
      if (!robot) return state;
      if (robot.level >= MAX_ROBOT_LEVEL) return state;

      const cost = robotUpgradeCost(robot);
      if (state.balance < cost) return state;

      return {
        balance: state.balance - cost,
        robots: state.robots.map((r) =>
          r.id === robotId
            ? {
                ...r,
                level: r.level + 1,
                efficiency: r.efficiency + ROBOT_EFFICIENCY[r.type] * 0.5,
              }
            : r,
        ),
      };
    });
  },

  addBalance: (amount: number) => {
    set((state) => ({
      balance: state.balance + amount,
    }));
  },

  deductBalance: (amount: number) => {
    const state = get();
    if (state.balance >= amount) {
      set((state) => ({
        balance: state.balance - amount,
      }));
      return true;
    }
    return false;
  },
}));
