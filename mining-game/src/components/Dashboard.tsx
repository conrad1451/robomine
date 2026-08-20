// src/components/Dashboard.tsx

// CHQ: Claude AI (Haiku) create and I edited heavily with assistance from Claude AI (Sonnet)

import { useGameStore } from "../store/gameStore";
import { useGameTick } from "../hooks/useGameTick";
import { MinePanel } from "./MinePanel";
import { RobotPanel } from "./RobotPanel";
import { ProcessingPanel } from "./ProcessingPanel";
// import DescopeAuth from "../auth/DescopeAuth";
import { AuthButton } from "../auth/AuthButton";
import { useSession } from "@descope/react-sdk";

function formatGameTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function Dashboard() {
  // Descope Auth hooks
  // const { isAuthenticated, isSessionLoading } = useSession();
  // const { user } = useUser();
  // const { logout } = useDescope();

  // Zustand Game Store
  const balance = useGameStore((state) => state.balance);
  const totalMined = useGameStore((state) => state.totalMined);
  const gameTime = useGameStore((state) => state.gameTime);
  const isGameOver = useGameStore((state) => state.isGameOver);
  const hasStarted = useGameStore((state) => state.hasStarted);
  const startGame = useGameStore((state) => state.startGame);
  const { isAuthenticated } = useSession();

  useGameTick();

  // Placeholder until a real backend/storage layer is picked — for now this

  // just confirms the login → save flow is wired up end to end.

  function handleSaveScore() {
    console.log("Saving score (stub):", { balance, totalMined });

    alert(
      `Score saved (placeholder)!\nBalance: $${balance.toLocaleString()}\nTotal Mined: ${totalMined.toFixed(0)}`,
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      {!hasStarted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-800 border border-yellow-500/40 rounded-lg p-8 text-center max-w-sm">
            <h2 className="text-2xl font-bold text-yellow-400 mb-2">
              ⛏️ Ready to Mine?
            </h2>

            <p className="text-gray-400 mb-6">
              The {Math.floor(gameTime / 60)}-minute timer starts as soon as you
              begin.
            </p>

            <button
              onClick={startGame}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded transition"
            >
              Start Mining
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-2">
            ⛏️ Gold Mine Tycoon
          </h1>

          <p className="text-gray-400">
            Build your mining empire with robots and advanced processing
          </p>
        </div>

        <AuthButton />
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

        <div
          className={`bg-gradient-to-br p-6 rounded-lg border ${
            isGameOver
              ? "from-red-700 to-red-900 border-red-400"
              : "from-purple-600 to-purple-800 border-purple-400"
          }`}
        >
          <p className="text-purple-200 text-sm">⏱️ Time Left</p>
          <p className="text-3xl font-bold text-white">
            {isGameOver ? "Game Over" : formatGameTime(gameTime)}
          </p>
          {isGameOver && (
            <div className="mt-3">
              {isAuthenticated ? (
                <button
                  onClick={handleSaveScore}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-1.5 px-3 rounded text-sm transition"
                >
                  Save Score
                </button>
              ) : (
                <p className="text-xs text-red-200">
                  Log in above to save your score.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Game Panels */}
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

      <div className="mt-8 bg-slate-800 p-6 rounded-lg border border-green-500/30">
        <h2 className="text-2xl font-bold text-green-400 mb-4">
          🔧 Material Processing
        </h2>
        <ProcessingPanel />
      </div>
    </div>
  );
}
