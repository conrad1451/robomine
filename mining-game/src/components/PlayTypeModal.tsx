// src/components/PlayTypeModal.tsx
import { useState } from "react";
import { useSession } from "@descope/react-sdk";
import { Box } from "@mui/material";
import { LoginModal } from "../auth/LoginModal";

const OfflinePlay = (props: { onClick: () => void }) => {
  const { onClick } = props;
  return (
    <Box sx={{ display: "flex", gap: 2, justifyContent: "center", p: 4 }}>
      <button
        onClick={onClick}
        className="text-gray-400 hover:text-white text-xl leading-none"
        aria-label="Play offline"
      >
        Play against yourself (Offline version)
      </button>
    </Box>
  );
};

const LeaderboardPlay = (props: { onClick: () => void }) => {
  const { onClick } = props;
  return (
    <Box sx={{ display: "flex", gap: 2, justifyContent: "center", p: 4 }}>
      <button
        onClick={onClick}
        className="text-gray-400 hover:text-white text-xl leading-none"
        aria-label="Play for leaderboard"
      >
        Play for a leaderboard position (Requires an internet connection and
        making an account)
      </button>
    </Box>
  );
};

export function PlayTypeModal(props: {
  onClose: () => void;
  leaderboardGame: () => void;
  offlineGame: () => void;
}) {
  const { onClose, offlineGame, leaderboardGame } = props;
  const { isAuthenticated } = useSession();

  // CHQ: Claude AI (Sonnet): Switching between "select"
  // and "login" modes prevents nested modal clutter and
  // renders <LoginModal/> cleanly at the top level.

  // "select": choosing offline vs leaderboard
  // "login": leaderboard was picked but the user isn't signed in yet
  const [mode, setMode] = useState<"select" | "login">("select");

  const handleLeaderboardClick = () => {
    if (isAuthenticated) {
      // Already signed in from a previous session, so skip login entirely
      leaderboardGame();
    } else {
      setMode("login");
    }
  };

  if (mode === "login") {
    // LoginModal is its own full-screen overlay so render it directly rather
    // than nesting it inside PlayTypeModal's backdrop below.
    //
    // onClose (cancel/backdrop click) just returns to the select screen.
    // onSuccess (Descope reported a successful sign-in) goes straight into
    // the leaderboard game instead of bouncing back through "select", which
    // used to race against the isAuthenticated flag and require extra clicks.
    return (
      <LoginModal
        onClose={() => setMode("select")}
        onSuccess={leaderboardGame}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-yellow-500/40 rounded-lg p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CHQ: Claude AI (Sonnet): Standardized button prop names from onClose 
        to onClick in OfflinePlay and LeaderboardPlay to better reflect their intent. */}
        <OfflinePlay onClick={offlineGame} />
        <LeaderboardPlay onClick={handleLeaderboardClick} />
      </div>
    </div>
  );
}
