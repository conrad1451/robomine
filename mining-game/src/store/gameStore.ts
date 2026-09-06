// src/store/gameStore.ts
//
// The backend is the source of truth for every economic value (balance,
// ore, materials, robots). Every mutating action here follows the same
// pattern:
//   1. Apply an optimistic update locally, for instant UI feedback.
//   2. Fire the matching backend call.
//   3. On success: overwrite local state with the server's authoritative
//      response (discarding the optimistic guess).
//   4. On failure: roll back to the pre-action snapshot and surface an
//      error. Nothing the player "gained" locally survives a failed call.
//
// This means a tampered/faked local state (e.g. via devtools) is cosmetic
// at best and gets overwritten by the next successful sync - the only
// numbers that ever persist are ones the server computed itself.

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
import { GAME_DURATION_SECONDS } from "./gameTick";
import { gameApi } from "../api/gameApi";
import { ApiError, NetworkError } from "../api/client";

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
    resourcePerSecond: 2.5,
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

// Only used for the optimistic-UI cost preview (RobotPanel disables the
// button, shows the price). The server computes and enforces the real cost
// independently in GameConstants.RobotUpgradeCost - these values must match
// it for the optimistic guess to usually land correctly, but if they ever
// drift, the server's response is what actually counts.
const ROBOT_UPGRADE_BASE_COST: Record<RobotType, number> = {
  basic: 2000,
  advanced: 6000,
  elite: 20000,
};

const MAX_ROBOT_LEVEL = 10;
const MINE_UPGRADE_COST = 10000;

const MATERIAL_VALUES: Record<MaterialType, number> = {
  refined_gold: 450,
  refined_silver: 75,
  refined_copper: 12,
  circuits: 320,
  batteries: 280,
  construction_steel: 5,
};

interface GameStoreState extends GameState {
  // True while any request to the backend is in flight.
  isSyncing: boolean;
  // Message from the most recent failed action, if any. Cleared on the next
  // successful action.
  error: string | null;

  addRobot: (type: RobotType, mineName: MineType) => Promise<void>;
  assignRobotToMine: (robotId: string, mineName: MineType) => Promise<void>;
  collectResources: () => Promise<void>;
  processResources: (recipeId: MaterialType) => Promise<void>;
  sellOre: (mineType: MineType) => Promise<void>;
  sellMaterial: (
    materialType: MaterialType,
    quantity?: number,
  ) => Promise<void>;
  upgradeMine: (mineName: MineType) => Promise<void>;
  upgradeRobot: (robotId: string) => Promise<void>;
  startGame: () => void;
  // Pulls the authoritative state from the server - call on login and
  // whenever the app regains focus/connectivity.
  hydrate: () => Promise<void>;
  resetGame: () => Promise<void>; // CHQ: added by Claude AI
}

export function robotUpgradeCost(robot: Robot): number {
  return Math.round(
    ROBOT_UPGRADE_BASE_COST[robot.type] * Math.pow(1.6, robot.level - 1),
  );
}

// Every action follows the same "snapshot -> optimistic apply -> sync ->
// reconcile or rollback" shape, so it lives in one place.
function describeError(err: unknown): string {
  if (err instanceof ApiError)
    return err.message || "That action was rejected.";
  if (err instanceof NetworkError)
    return "Couldn't reach the server. Your last action may not have saved.";
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}

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
  hasStarted: false,
  isSyncing: false,
  error: null,

  hydrate: async () => {
    set({ isSyncing: true });
    try {
      const state = get();
      const fresh = await gameApi.getState({
        gameTime: state.gameTime,
        isGameOver: state.isGameOver,
        hasStarted: state.hasStarted,
      });
      // set({ ...fresh, isSyncing: false, error: null });
      set((state) => ({
        ...fresh,
        gameTime: state.gameTime,
        isGameOver: state.isGameOver,
        hasStarted: state.hasStarted,
        isSyncing: false,
        error: null,
      }));
    } catch (err) {
      set({ isSyncing: false, error: describeError(err) });
    }
  },

  addRobot: async (type: RobotType, mineName: MineType) => {
    const cost = ROBOT_COSTS[type];
    const snapshot = get();

    if (snapshot.isGameOver || snapshot.balance < cost) return;

    const tempRobot: Robot = {
      id: `temp-${Date.now()}`,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Bot #${snapshot.robots.length + 1}`,
      level: 1,
      mineType: mineName,
      efficiency: ROBOT_EFFICIENCY[type],
      isWorking: true,
      assignedMine: mineName,
    };

    set((state) => ({
      robots: [...state.robots, tempRobot],
      balance: state.balance - cost,
      isSyncing: true,
    }));

    try {
      const fresh = await gameApi.buyRobot(type, mineName, snapshot);
      set((state) => ({
        ...fresh,
        gameTime: state.gameTime,
        isGameOver: state.isGameOver,
        hasStarted: state.hasStarted,
        isSyncing: false,
        error: null,
      }));
    } catch (err) {
      set({
        robots: snapshot.robots,
        balance: snapshot.balance,
        isSyncing: false,
        error: describeError(err),
      });
    }
  },

  assignRobotToMine: async (robotId: string, mineName: MineType) => {
    const snapshot = get();

    set((state) => ({
      robots: state.robots.map((robot) =>
        robot.id === robotId
          ? { ...robot, assignedMine: mineName, mineType: mineName }
          : robot,
      ),
      isSyncing: true,
    }));

    try {
      const fresh = await gameApi.assignRobot(robotId, mineName, snapshot);
      set((state) => ({
        ...fresh,
        gameTime: state.gameTime,
        isGameOver: state.isGameOver,
        hasStarted: state.hasStarted,
        isSyncing: false,
        error: null,
      }));

    } catch (err) {
      set({
        robots: snapshot.robots,
        isSyncing: false,
        error: describeError(err),
      });
    }
  },

  // Pulls fresh state from the server, which computes any newly-accrued ore
  // from real elapsed time server-side. Safe to call infrequently - the
  // math doesn't depend on how often this is called, only on how much wall-
  // clock time has actually passed.
  collectResources: async () => {
    const state = get();
    if (state.isGameOver || !state.hasStarted) return;

    try {
      const fresh = await gameApi.getState(state);
      set((state) => ({
        ...fresh,
        gameTime: state.gameTime,
        isGameOver: state.isGameOver,
        hasStarted: state.hasStarted,
        // isSyncing: false,
        error: null,
      }));
    } catch (err) {
      // Silent on failure - this runs on a timer, not from a user click, so
      // we don't want to spam the error banner every few seconds while
      // offline. The next successful poll clears things up.
      if (err instanceof NetworkError) return;
      set({ error: describeError(err) });
    }
  },

  sellOre: async (mineType: MineType) => {
    const snapshot = get();
    if (snapshot.isGameOver) return;

    const mine = snapshot.mines.find((m) => m.type === mineType);
    if (!mine || mine.totalExtracted <= 0) return;

    const proceeds = mine.totalExtracted * ORE_BASE_VALUE[mineType];

    set((state) => ({
      balance: state.balance + proceeds,
      mines: state.mines.map((m) =>
        m.type === mineType ? { ...m, totalExtracted: 0 } : m,
      ),
      isSyncing: true,
    }));

    try {
      const fresh = await gameApi.sellOre(mineType, snapshot);
      set((state) => ({
        ...fresh,
        gameTime: state.gameTime,
        isGameOver: state.isGameOver,
        hasStarted: state.hasStarted,
        isSyncing: false,
        error: null,
      }));
    } catch (err) {
      set({
        balance: snapshot.balance,
        mines: snapshot.mines,
        isSyncing: false,
        error: describeError(err),
      });
    }
  },

  processResources: async (recipeId: MaterialType) => {
    const snapshot = get();
    const recipe = PROCESSING_RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return;
    if (snapshot.balance < recipe.energyCost) return;

    const mine = snapshot.mines.find((m) => m.type === recipe.input.type);
    if (!mine || mine.totalExtracted < recipe.input.quantity) return;

    set((state) => ({
      balance: state.balance - recipe.energyCost,
      mines: state.mines.map((m) =>
        m.type === recipe.input.type
          ? { ...m, totalExtracted: m.totalExtracted - recipe.input.quantity }
          : m,
      ),
      materials: state.materials.map((mat) =>
        mat.type === recipe.output.type
          ? { ...mat, quantity: mat.quantity + recipe.output.quantity }
          : mat,
      ),
      isSyncing: true,
    }));

    try {
      const fresh = await gameApi.processRecipe(recipeId, snapshot);
      set((state) => ({
        ...fresh,
        gameTime: state.gameTime,
        isGameOver: state.isGameOver,
        hasStarted: state.hasStarted,
        isSyncing: false,
        error: null,
      }));

    } catch (err) {
      set({
        balance: snapshot.balance,
        mines: snapshot.mines,
        materials: snapshot.materials,
        isSyncing: false,
        error: describeError(err),
      });
    }
  },

  sellMaterial: async (materialType: MaterialType, quantity?: number) => {
    const snapshot = get();
    const material = snapshot.materials.find((m) => m.type === materialType);
    if (!material || material.quantity <= 0) return;

    const sellQty = Math.min(quantity ?? material.quantity, material.quantity);
    if (sellQty <= 0) return;

    set((state) => ({
      balance: state.balance + sellQty * material.value,
      materials: state.materials.map((m) =>
        m.type === materialType ? { ...m, quantity: m.quantity - sellQty } : m,
      ),
      isSyncing: true,
    }));

    try {
      const fresh = await gameApi.sellMaterial(
        materialType,
        quantity,
        snapshot,
      );
      set((state) => ({
        ...fresh,
        gameTime: state.gameTime,
        isGameOver: state.isGameOver,
        hasStarted: state.hasStarted,
        isSyncing: false,
        error: null,
      }));

    } catch (err) {
      set({
        balance: snapshot.balance,
        materials: snapshot.materials,
        isSyncing: false,
        error: describeError(err),
      });
    }
  },

  upgradeMine: async (mineName: MineType) => {
    const snapshot = get();
    if (snapshot.isGameOver || snapshot.balance < MINE_UPGRADE_COST) return;

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
      balance: state.balance - MINE_UPGRADE_COST,
      isSyncing: true,
    }));

    try {
      const fresh = await gameApi.upgradeMine(mineName, snapshot);
      set((state) => ({
        ...fresh,
        gameTime: state.gameTime,
        isGameOver: state.isGameOver,
        hasStarted: state.hasStarted,
        isSyncing: false,
        error: null,
      }));
    } catch (err) {
      set({
        mines: snapshot.mines,
        balance: snapshot.balance,
        isSyncing: false,
        error: describeError(err),
      });
    }
  },

  upgradeRobot: async (robotId: string) => {
    const snapshot = get();
    if (snapshot.isGameOver) return;

    const robot = snapshot.robots.find((r) => r.id === robotId);
    if (!robot || robot.level >= MAX_ROBOT_LEVEL) return;

    const cost = robotUpgradeCost(robot);
    if (snapshot.balance < cost) return;

    set((state) => ({
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
      isSyncing: true,
    }));

    try {
      const fresh = await gameApi.upgradeRobot(robotId, snapshot);
      set((state) => ({
        ...fresh,
        gameTime: state.gameTime,
        isGameOver: state.isGameOver,
        hasStarted: state.hasStarted,
        isSyncing: false,
        error: null,
      }));
    } catch (err) {
      set({
        balance: snapshot.balance,
        robots: snapshot.robots,
        isSyncing: false,
        error: describeError(err),
      });
    }
  },

  startGame: () => {
    const state = get();
    if (state.hasStarted) return;
    set({ hasStarted: true });
  },

  // CHQ: Claude AI (Sonnet) made reset action
  resetGame: async () => {
    set({ isSyncing: true });
    try {
      const fresh = await gameApi.resetGame({
        gameTime: GAME_DURATION_SECONDS,
        isGameOver: false,
        hasStarted: false,
      });
      set({ ...fresh, isSyncing: false, error: null });
    } catch (err) {
      set({ isSyncing: false, error: describeError(err) });
    }
  },
}));
