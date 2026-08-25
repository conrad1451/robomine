// src/hooks/useGameTick.ts
//
// Two independent timers:
//  1. A 1-second local countdown for the match clock display (gameTime).
//     This is cosmetic only - it doesn't grant any resources - so there's
//     nothing to gain by tampering with it locally.
//  2. A periodic sync with the backend, which computes and applies any
//     newly-accrued ore server-side from real elapsed time. This doesn't
//     need to run every second - the server's math is time-based, not
//     tick-count-based - so a slower interval just means the UI updates in
//     bigger, less-frequent jumps, not that any resources are lost.

import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";

const SYNC_INTERVAL_MS = 5000;

export function useGameTick() {
  const isGameOver = useGameStore((state) => state.isGameOver);
  const hasStarted = useGameStore((state) => state.hasStarted);
  const collectResources = useGameStore((state) => state.collectResources);

  // Local countdown clock (cosmetic).
  useEffect(() => {
    if (!hasStarted || isGameOver) return;

    const interval = setInterval(() => {
      useGameStore.setState((state) => {
        const nextGameTime = Math.max(state.gameTime - 1, 0);
        return {
          gameTime: nextGameTime,
          isGameOver: nextGameTime === 0,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameOver, hasStarted]);

  // Server sync (authoritative resource extraction).
  useEffect(() => {
    if (!hasStarted || isGameOver) return;

    // Sync immediately on start, then on the interval.
    collectResources();
    const interval = setInterval(() => {
      collectResources();
    }, SYNC_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [collectResources, isGameOver, hasStarted]);
}
