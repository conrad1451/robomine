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

const MINE_DATA: Record<MineType, Mine> = {
  gold: {
    id: "gold-1",
    type: "gold",
    name: "Golden Valley",
    depth: 100,
    resourcePerSecond: 0.5,
    totalExtracted: 0,
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
      const newMaterials = [...state.materials];
      let totalExtracted = state.totalMined;

      state.robots.forEach((robot) => {
        if (!robot.isWorking || !robot.assignedMine) return;

        const mine = state.mines.find((m) => m.type === robot.mineType);
        if (!mine) return;

        const extractAmount = mine.resourcePerSecond * robot.efficiency * 0.1;
        totalExtracted += extractAmount;

        // Convert raw material to value (simplified for demo)
        const baseValue =
          robot.mineType === "gold"
            ? 50
            : robot.mineType === "silver"
              ? 40
              : 30;
        newBalance += extractAmount * baseValue * robot.efficiency;
      });

      return {
        balance: newBalance,
        totalMined: totalExtracted,
        materials: newMaterials,
      };
    });
  },

  processResources: (recipe: MaterialType) => {
    // Simplified processing logic
    set((state) => {
      const energyCost = 500;
      if (state.balance < energyCost) return state;

      const materialIndex = state.materials.findIndex((m) => m.type === recipe);
      if (materialIndex === -1) return state;

      const newMaterials = [...state.materials];
      newMaterials[materialIndex].quantity += 10;

      return {
        balance: state.balance - energyCost,
        materials: newMaterials,
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
