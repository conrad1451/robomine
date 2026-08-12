// src/components/RobotPanel.tsx

// CHQ: Claude AI (Haiku) generated file

import { useGameStore } from "../store/gameStore";

export function RobotPanel() {
  const { robots, balance } = useGameStore();

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-blue-500/30">
      <h2 className="text-2xl font-bold text-blue-400 mb-4">🤖 Robot Fleet</h2>

      {robots.length === 0 ? (
        <p className="text-gray-400">
          No robots yet. Purchase your first bot to start mining!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {robots.map((robot) => (
            <div
              key={robot.id}
              className="bg-slate-700 p-4 rounded border border-blue-400/50"
            >
              <h3 className="font-bold text-blue-300">{robot.name}</h3>
              <div className="text-sm text-gray-300 mt-2 space-y-1">
                <p>
                  Type: {robot.type} (Lvl {robot.level})
                </p>
                <p>Efficiency: {robot.efficiency}x</p>
                <p>Mining: {robot.mineType}</p>
                <p>Status: {robot.isWorking ? "✅ Working" : "⏸️ Idle"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
