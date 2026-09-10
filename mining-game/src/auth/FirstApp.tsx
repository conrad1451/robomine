// FirstApp.tsx
import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { Dashboard } from "../components/Dashboard";
import GameLeaderboard from "../components/Leaderboard";

import PrivacyPolicy from "../components/PrivacyPolicy"
import TermsOfUse from "../components/TermsOfUse";
import Disclaimer from "../components/Disclaimer";

import { PlayTypeModal } from "../components/PlayTypeModal";

// import "./App.css";
import { Box, Button, Typography } from "@mui/material";

export interface NavigationButtonsProps {
  navigate: (path: string) => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({ navigate }) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <Box sx={{ display: "flex", gap: 2, justifyContent: "center", p: 4 }}>
      {/* <Button variant="contained" onClick={() => navigate("/countdowndiggame")}>
        Dig against the clock
      </Button> */}

      <>
        <Button variant="contained" onClick={() => setShowOptions(true)}>
          Dig against the clock
        </Button>
        {showOptions && (
          <PlayTypeModal
            onClose={() => setShowOptions(false)}
            leaderboardGame={() => navigate("/countdowndiggame")}
            offlineGame={() => navigate("/countdowndiggame")}
          />
        )}

        {/* {showOptions && <PlayTypeModal onClose={() => setShowOptions(false)} />} */}
      </>
      <Button
        variant="contained"
        color="success"
        onClick={() => navigate("/leaderboard")}
      >
        View Leaderboard
      </Button>
      <>
        <div id="ta-ad-container" style={{ minHeight: "100px" }} />
        <div className="footer">
          <Button onClick={() => navigate("/terms")}>Terms of Use</Button>
          <Button onClick={() => navigate("/privacy")}>
            Privacy Policy
            </Button>
          <Button onClick={() => navigate("/disclaimer")}>
            Disclaimer
          </Button>
        </div>
      </>
    </Box>
  );
};

const HomePage = () => {
  const navigate = useNavigate(); // CHQ: Claude AI (Sonnet) provided useNavigate fixS
  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h3" gutterBottom>
        Welcome
      </Typography>
      <NavigationButtons navigate={navigate} />
    </Box>
  );
};

const FirstApp = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/countdowndiggame" element={<Dashboard />} />
        <Route path="/leaderboard" element={<GameLeaderboard />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfUse />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
      </Routes>
    </Router>
  );
};

export default FirstApp;
