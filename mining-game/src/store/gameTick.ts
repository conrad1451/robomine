// src/store/gameTick.ts

// CHQ: Claude AI (Sonnet) generated file

import type { GameState } from "../types";

/** Total match length in seconds (30 minutes). */
export const GAME_DURATION_SECONDS = 30 * 60;

/**
 * Pure per-second game tick: advances the countdown, extracts ore for every
 * working robot (capped at each mine's remaining capacity), and flags game
 * over once time hits zero.
 *
 * Deliberately takes/returns plain data with no Zustand `set`/`get` so it
 * can be unit-tested and reasoned about in isolation from the store.
 */
export function computeGameTick(
  state: Pick<
    GameState,
    "gameTime" | "isGameOver" | "robots" | "mines" | "totalMined"
  >,
): Pick<GameState, "gameTime" | "isGameOver" | "totalMined" | "mines"> {
  if (state.isGameOver) {
    return {
      gameTime: state.gameTime,
      isGameOver: state.isGameOver,
      totalMined: state.totalMined,
      mines: state.mines,
    };
  }

  const nextGameTime = Math.max(state.gameTime - 1, 0);
  const isGameOver = nextGameTime === 0;

  let totalMinedDelta = 0;
  const gains: Record<string, number> = {};

  state.robots.forEach((robot) => {
    if (!robot.isWorking || !robot.assignedMine) return;

    const mine = state.mines.find((m) => m.type === robot.mineType);
    if (!mine) return;

    // Efficiency multiplies extraction SPEED
    const extractAmount = mine.resourcePerSecond * robot.efficiency * 0.1;
    gains[mine.type] = (gains[mine.type] ?? 0) + extractAmount;
  });

  // Ore has no economic value until it's sold (sellOre) or refined and sold
  // (processResources + sellMaterial). Extraction itself is capped at each
  // mine's remaining capacity — once a mine is full, robots working it
  // simply stop pulling out more until it's sold down.
  const newMines = state.mines.map((mine) => {
    const gain = gains[mine.type];
    if (!gain) return mine;

    const capacityRemaining = Math.max(
      mine.maxCapacity - mine.totalExtracted,
      0,
    );
    const extracted = Math.min(gain, capacityRemaining);

    totalMinedDelta += extracted;

    return {
      ...mine,
      totalExtracted: mine.totalExtracted + extracted,
      lifetimeExtracted: mine.lifetimeExtracted + extracted,
    };
  });

  return {
    gameTime: nextGameTime,
    isGameOver,
    totalMined: state.totalMined + totalMinedDelta,
    mines: newMines,
  };
}
