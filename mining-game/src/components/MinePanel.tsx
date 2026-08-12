// src/components/MinePanel.tsx

// CHQ: Claude AI (Haiku) generated file

import { useGameStore } from "../store/gameStore";
import type { MineType } from "../types";

export function MinePanel() {
  const { mines, robots, addRobot, balance } = useGameStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {mines.map((mine) => {
        const assignedRobots = robots.filter(
          (r) => r.assignedMine === mine.type,
        );

        return (
          <div
            key={mine.id}
            className="bg-gradient-to-br from-slate-700 to-slate-800 p-6 rounded-lg border border-yellow-500/30"
          >
            <h3 className="text-xl font-bold text-yellow-400 mb-2">
              {mine.name}
            </h3>
            <p className="text-gray-400 text-sm mb-4">Type: {mine.type}</p>

            <div className="space-y-2 text-sm mb-4">
              <p>
                📊 Depth: <span className="text-cyan-300">{mine.depth}m</span>
              </p>
              <p>
                ⚙️ Rate:{" "}
                <span className="text-cyan-300">
                  {mine.resourcePerSecond.toFixed(2)}/sec
                </span>
              </p>
              <p>
                🤖 Robots:{" "}
                <span className="text-cyan-300">{assignedRobots.length}</span>
              </p>
              <p>
                📦 Extracted:{" "}
                <span className="text-cyan-300">
                  {mine.totalExtracted.toFixed(0)}
                </span>
              </p>
            </div>

            <button
              onClick={() => {
                if (balance >= 5000) {
                  addRobot("basic", mine.type);
                }
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition disabled:opacity-50"
              disabled={balance < 5000}
            >
              Add Basic Bot ($5K)
            </button>
          </div>
        );
      })}
    </div>
  );
}
