// src/components/Dashboard.tsx

// CHQ: Claude AI (Haiku) generated file

import { useGameStore } from "../store/gameStore";
import { useGameTick } from "../hooks/useGameTick";
import { MinePanel } from "./MinePanel";
import { RobotPanel } from "./RobotPanel";
import { ProcessingPanel } from "./ProcessingPanel";

export function Dashboard() {
  // CHQ: Gemini AI: use individual selectors so sub-components
  // only update when their specific slice of state changes:
  const balance = useGameStore((state) => state.balance);
  const totalMined = useGameStore((state) => state.totalMined);
  const gameTime = useGameStore((state) => state.gameTime);

  useGameTick();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-2">
          ⛏️ Gold Mine Tycoon
        </h1>
        <p className="text-gray-400">
          Build your mining empire with robots and advanced processing
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 p-6 rounded-lg border border-yellow-400">
          <p className="text-yellow-200 text-sm">💰 Balance</p>
          <p className="text-3xl font-bold text-white">
            ${balance.toLocaleString()}
          </p>
        </div>
        <div className="bg-gradient-to-br from-cyan-600 to-cyan-800 p-6 rounded-lg border border-cyan-400">
          <p className="text-cyan-200 text-sm">⛏️ Total Mined</p>
          <p className="text-3xl font-bold text-white">
            {totalMined.toFixed(0)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-lg border border-purple-400">
          <p className="text-purple-200 text-sm">⏱️ Game Time</p>
          <p className="text-3xl font-bold text-white">{gameTime}s</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">
            🏭 Mining Operations
          </h2>
          <MinePanel />
        </div>
        <div>
          <RobotPanel />
        </div>
      </div>

      {/* Processing Section */}
      <div className="mt-8 bg-slate-800 p-6 rounded-lg border border-green-500/30">
        <h2 className="text-2xl font-bold text-green-400 mb-4">
          🔧 Material Processing
        </h2>
        <ProcessingPanel />
      </div>
    </div>
  );
}
