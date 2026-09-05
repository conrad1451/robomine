// src/auth/AuthButton.tsx

// CHQ: Claude AI (Sonnet) generated this file

import { useSession, useUser, useDescope } from "@descope/react-sdk";
import { useState } from "react";
import { LoginModal } from "./LoginModal";

export function AuthButton() {
  const { isAuthenticated, isSessionLoading } = useSession();
  const { user } = useUser();
  const { logout } = useDescope();
  const [showLogin, setShowLogin] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const resetGame = useGameStore((state) => state.resetGame);
  const isSyncing = useGameStore((state) => state.isSyncing);
  
  if (isSessionLoading) {
    return (
      <div className="text-sm text-gray-400 px-3 py-2">Checking login…</div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-300">
          {user?.name || user?.email || "Logged in"}
        </span>

        {confirmingReset ? (
          <>
            <span className="text-sm text-red-300">Reset progress?</span>
            <button
              onClick={async () => {
                await resetGame();
                setConfirmingReset(false);
              }}
              disabled={isSyncing}
              className="bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 rounded text-sm transition disabled:opacity-50"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmingReset(false)}
              className="bg-slate-700 hover:bg-slate-600 text-white py-1.5 px-3 rounded text-sm transition"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirmingReset(true)}
            className="bg-slate-700 hover:bg-slate-600 text-white py-1.5 px-3 rounded text-sm transition"
          >
            Reset Game
          </button>
        )}

        <button
          onClick={() => logout()}
          className="bg-slate-700 hover:bg-slate-600 text-white py-1.5 px-3 rounded text-sm transition"
        >
          Log Out
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowLogin(true)}
        className="bg-yellow-600 hover:bg-yellow-700 text-white py-1.5 px-4 rounded text-sm font-semibold transition"
      >
        Log In to Save Scores
      </button>
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={() => setShowLogin(false)}
        />
      )}
    </>
  );
}
