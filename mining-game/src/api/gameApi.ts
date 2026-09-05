// src/api/gameApi.ts

// CHQ: Claude AI (Sonnet) generated file

import { api } from "./client";
import type {
  GameState,
  Mine,
  Robot,
  Material,
  MineType,
  RobotType,
  MaterialType,
} from "../types";

// --- Shapes returned by the backend (MiningGame.API) ---
// Property names are camelCase (ASP.NET Core's default JSON policy); enum
// values are snake_case strings (configured server-side to match these TS
// string literal types directly - see Program.cs's JsonStringEnumConverter).

interface PlayerDto {
  id: string;
  username: string;
  email: string;
  balance: number;
  totalMined: number;
  gameTime: number;
  createdAt: string;
  lastPlayedAt: string;
}

interface MineDto {
  id: string;
  name: string;
  type: MineType;
  depth: number;
  resourcePerSecond: number;
  totalExtracted: number;
  lifetimeExtracted: number;
  robotsAssigned: number;
  maxCapacity: number;
  lastCollectedAt: string | null;
}

interface RobotDto {
  id: string;
  mineId: string | null;
  name: string;
  type: RobotType;
  level: number;
  efficiency: number;
  isWorking: boolean;
}

interface MaterialDto {
  id: string;
  type: MaterialType;
  quantity: number;
  value: number;
}

// Define shape returned by the new endpoint
export interface ScoreDto {
  username: string;
  score: number;
  gameMode: string;
}

export interface GameStateDto {
  player: PlayerDto;
  mines: MineDto[];
  robots: RobotDto[];
  materials: MaterialDto[];
}

// The backend identifies which mine a robot works by MineId (a GUID); the
// frontend identifies it by MineType (e.g. "gold"), since there's exactly
// one mine of each type per player. This resolves one to the other.
function toFrontendState(
  dto: GameStateDto,
  previous: Pick<GameState, "gameTime" | "isGameOver" | "hasStarted">,
): GameState {
  const mineIdToType = new Map(dto.mines.map((m) => [m.id, m.type]));

  const mines: Mine[] = dto.mines.map((m) => ({
    id: m.id,
    type: m.type,
    name: m.name,
    depth: m.depth,
    resourcePerSecond: m.resourcePerSecond,
    totalExtracted: m.totalExtracted,
    lifetimeExtracted: m.lifetimeExtracted,
    robotsAssigned: m.robotsAssigned,
    maxCapacity: m.maxCapacity,
  }));

  const robots: Robot[] = dto.robots.map((r) => {
    const mineType = r.mineId ? (mineIdToType.get(r.mineId) ?? null) : null;
    return {
      id: r.id,
      type: r.type,
      name: r.name,
      level: r.level,
      mineType: (mineType ?? "gold") as MineType, // frontend type requires non-null; unassigned robots shouldn't normally occur
      efficiency: r.efficiency,
      isWorking: r.isWorking,
      assignedMine: mineType,
    };
  });

  const materials: Material[] = dto.materials.map((m) => ({
    type: m.type,
    quantity: m.quantity,
    value: m.value,
  }));

  return {
    balance: dto.player.balance,
    totalMined: dto.player.totalMined,
    robots,
    mines,
    materials,
    // Match-session concepts the backend doesn't model (yet) - preserved
    // from whatever the client already had.
    gameTime: previous.gameTime,
    isGameOver: previous.isGameOver,
    hasStarted: previous.hasStarted,
  };
}

export const gameApi = {
  getState: (
    previous: Pick<GameState, "gameTime" | "isGameOver" | "hasStarted">,
  ) =>
    api
      .get<GameStateDto>("/api/gamestate")
      .then((dto) => toFrontendState(dto, previous)),

  sellOre: (
    mineType: MineType,
    previous: Pick<GameState, "gameTime" | "isGameOver" | "hasStarted">,
  ) =>
    api
      .post<GameStateDto>(`/api/mines/${mineType}/sell`)
      .then((dto) => toFrontendState(dto, previous)),

  upgradeMine: (
    mineType: MineType,
    previous: Pick<GameState, "gameTime" | "isGameOver" | "hasStarted">,
  ) =>
    api
      .post<GameStateDto>(`/api/mines/${mineType}/upgrade`)
      .then((dto) => toFrontendState(dto, previous)),

  buyRobot: (
    type: RobotType,
    mineType: MineType,
    previous: Pick<GameState, "gameTime" | "isGameOver" | "hasStarted">,
  ) =>
    api
      .post<GameStateDto>("/api/robots", { type, mineType })
      .then((dto) => toFrontendState(dto, previous)),

  assignRobot: (
    robotId: string,
    mineType: MineType,
    previous: Pick<GameState, "gameTime" | "isGameOver" | "hasStarted">,
  ) =>
    api
      .post<GameStateDto>(`/api/robots/${robotId}/assign`, { mineType })
      .then((dto) => toFrontendState(dto, previous)),

  upgradeRobot: (
    robotId: string,
    previous: Pick<GameState, "gameTime" | "isGameOver" | "hasStarted">,
  ) =>
    api
      .post<GameStateDto>(`/api/robots/${robotId}/upgrade`)
      .then((dto) => toFrontendState(dto, previous)),

  processRecipe: (
    recipeId: MaterialType,
    previous: Pick<GameState, "gameTime" | "isGameOver" | "hasStarted">,
  ) =>
    api
      .post<GameStateDto>(`/api/processing/${recipeId}`)
      .then((dto) => toFrontendState(dto, previous)),

  sellMaterial: (
    materialType: MaterialType,
    quantity: number | undefined,
    previous: Pick<GameState, "gameTime" | "isGameOver" | "hasStarted">,
  ) =>
    api
      .post<GameStateDto>(
        `/api/processing/materials/${materialType}/sell`,
        quantity ? { quantity } : {},
      )
      .then((dto) => toFrontendState(dto, previous)),

  getScores: (gameMode: string) =>
    api.get<ScoreDto[]>(`/api/scores/game/${gameMode}`),

  resetGame: (
    previous: Pick<GameState, "gameTime" | "isGameOver" | "hasStarted">,
  ) =>
    api
      .post<GameStateDto>("/api/player/reset")
      .then((dto) => toFrontendState(dto, previous)),
};
