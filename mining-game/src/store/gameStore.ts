// src/store/gameStore.ts

// CHQ: Claude AI (Haiku) generated file

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

interface GameStoreState extends GameState {
  addRobot: (type: RobotType, mineName: string) => void;
  assignRobotToMine: (robotId: string, mineName: MineType) => void;
  collectResources: () => void;
  processResources: (recipe: MaterialType) => void;
  upgradeMine: (mineName: MineType) => void;
  addBalance: (amount: number) => void;
  deductBalance: (amount: number) => boolean;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  balance: 50000,
  robots: [],
  mines: Object.values(MINE_DATA),
  materials: [
    { type: "refined_gold", quantity: 0, value: 100 },
    { type: "refined_silver", quantity: 0, value: 80 },
    { type: "refined_copper", quantity: 0, value: 60 },
    { type: "circuits", quantity: 0, value: 200 },
    { type: "batteries", quantity: 0, value: 150 },
    { type: "construction_steel", quantity: 0, value: 120 },
  ],
  totalMined: 0,
  gameTime: 0,

  addRobot: (type: RobotType, mineName: string) => {
    const cost = ROBOT_COSTS[type];
    const state = get();

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
    set((state) => {
      let newBalance = state.balance;
      let totalMinedDelta = 0;
      const gains: Record<string, number> = {};

      state.robots.forEach((robot) => {
        if (!robot.isWorking || !robot.assignedMine) return;

        const mine = state.mines.find((m) => m.type === robot.mineType);
        if (!mine) return;

        const extractAmount = mine.resourcePerSecond * robot.efficiency * 0.1;
        totalMinedDelta += extractAmount;
        gains[mine.type] = (gains[mine.type] ?? 0) + extractAmount;
      });

      const newMines = state.mines.map((mine) => {
        const extracted = gains[mine.type];
        if (!extracted) return mine;

        const capacityRemaining = mine.maxCapacity - mine.totalExtracted;
        const stockpiled = Math.min(extracted, Math.max(capacityRemaining, 0));
        const overflow = extracted - stockpiled;

        // Ore that doesn't fit in the mine's stockpile is auto-sold on the
        // spot so idle robots still generate some income, but the player
        // is incentivized to sell/process before hitting capacity.
        if (overflow > 0) {
          newBalance += overflow * ORE_BASE_VALUE[mine.type];
        }

        return {
          ...mine,
          totalExtracted: mine.totalExtracted + stockpiled,
          lifetimeExtracted: mine.lifetimeExtracted + extracted,
        };
      });

      return {
        balance: newBalance,
        totalMined: state.totalMined + totalMinedDelta,
        mines: newMines,
      };
    });
  },

  sellOre: (mineType: MineType) => {
    set((state) => {
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
