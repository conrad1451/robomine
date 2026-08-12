// src/components/RobotPanel.tsx

// CHQ: Claude AI (Haiku) generated file

import type { Robot } from "../types";

import { robotUpgradeCost, useGameStore } from "../store/gameStore";

const RobotInfoTile = (props: {
  robot: Robot;
  balance: number;
  cost: number;
  maxed: boolean;
  upgradeRobot: (robotId: string) => void;
}) => {
  const { robot, balance, cost, maxed, upgradeRobot } = props;
  return (
    <div
      key={robot.id}
      className="bg-slate-700 p-4 rounded border border-blue-400/50"
    >
      <h3 className="font-bold text-blue-300">{robot.name}</h3>
      <div className="text-sm text-gray-300 mt-2 space-y-1 mb-3">
        <p>
          Type: {robot.type} (Lvl {robot.level})
        </p>
        <p>Efficiency: {robot.efficiency.toFixed(1)}x</p>
        <p>Mining: {robot.mineType}</p>
        <p>Status: {robot.isWorking ? "✅ Working" : "⏸️ Idle"}</p>
      </div>

      <button
        onClick={() => upgradeRobot(robot.id)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded text-sm transition disabled:opacity-50"
        disabled={maxed || balance < cost}
      >
        {maxed ? "Max Level" : `Upgrade ($${cost.toLocaleString()})`}
      </button>
    </div>
  );
};

// CHQ: Claude AI (Sonnet): edits made to file
export function RobotPanel() {
  const { robots, balance, upgradeRobot } = useGameStore();

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-blue-500/30">
      <h2 className="text-2xl font-bold text-blue-400 mb-4">🤖 Robot Fleet</h2>

      {robots.length === 0 ? (
        <p className="text-gray-400">
          No robots yet. Purchase your first bot to start mining!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {robots.map((robot) => {
            const cost = robotUpgradeCost(robot);
            const maxed = robot.level >= 10;

            return (
              <RobotInfoTile
                robot={robot}
                balance={balance}
                cost={cost}
                maxed={maxed}
                upgradeRobot={upgradeRobot}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
