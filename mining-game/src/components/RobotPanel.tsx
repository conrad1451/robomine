// src/components/RobotPanel.tsx

// CHQ: Claude AI (Haiku) generated file

import type { Robot, MineType } from "../types";

import { robotUpgradeCost, useGameStore } from "../store/gameStore";
import { useState } from "react";

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

// CHQ: Claude AI (Sonnet) refactored functional component
export function RobotPanel() {
  const { robots, balance, upgradeRobot } = useGameStore();

  const ROBOT_MINE_TYPES: MineType[] = [
    "gold",
    "silver",
    "copper",
    "lithium",
    "rare_earth",
    "iron",
  ];

  // null = "show all"; otherwise the selected MineType filter
  const [selectedType, setSelectedType] = useState<MineType | null | "none">(
    null,
  );

  const visibleRobots = selectedType
    ? robots.filter((robot) => robot.mineType === selectedType)
    : robots;

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-blue-500/30">
      <h2 className="text-2xl font-bold text-blue-400 mb-4">🤖 Robot Fleet</h2>

      {robots.length === 0 ? (
        <p className="text-gray-400">
          No robots yet. Purchase your first bot to start mining!
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              onClick={() => setSelectedType(null)}
              className={`w-full py-2 px-3 rounded text-sm transition ${
                selectedType === null
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-slate-700 hover:bg-slate-600"
              } text-white`}
            >
              Show All
            </button>
            {ROBOT_MINE_TYPES.map((mineType) => (
              <button
                key={mineType}
                onClick={() => setSelectedType(mineType)}
                className={`w-full py-2 px-3 rounded text-sm transition capitalize ${
                  selectedType === mineType
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-slate-700 hover:bg-slate-600"
                } text-white`}
              >
                {mineType.replace("_", " ")}
              </button>
            ))}
            <button
              onClick={() => setSelectedType("none")}
              className={`w-full py-2 px-3 rounded text-sm transition ${
                selectedType === "none"
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-slate-700 hover:bg-slate-600"
              } text-white`}
            >
              Collapse All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleRobots.map((robot) => {
              const cost = robotUpgradeCost(robot);
              const maxed = robot.level >= 10;

              return (
                <RobotInfoTile
                  key={robot.id}
                  robot={robot}
                  balance={balance}
                  cost={cost}
                  maxed={maxed}
                  upgradeRobot={upgradeRobot}
                />
              );
            })}
          </div>

          {visibleRobots.length === 0 &&
            (selectedType === "none" ? (
              <p className="text-gray-400 mt-2">Robots view collapsed.</p>
            ) : (
              <p className="text-gray-400 mt-2">
                No robots mining {selectedType?.replace("_", " ")} right now.
              </p>
            ))}
        </>
      )}
    </div>
  );
}
