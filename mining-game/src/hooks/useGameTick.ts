// src/hooks/useGameTick.ts

// CHQ: Claude AI (Sonnet) generated file

import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";

/**
 * Drives the game's 1-second tick loop: calls `collectResources` every
 * second while the match is running, and automatically stops once
 * `isGameOver` is true. Mount this once (e.g. in `Dashboard`).
 */
export function useGameTick() {
  const collectResources = useGameStore((state) => state.collectResources);
  const isGameOver = useGameStore((state) => state.isGameOver);

  useEffect(() => {
    if (isGameOver) return;

    const interval = setInterval(() => {
      collectResources();
    }, 1000);

    return () => clearInterval(interval);
  }, [collectResources, isGameOver]);
}
