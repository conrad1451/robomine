// FirstApp.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { Dashboard } from "../components/Dashboard";
import GameLeaderboard from "../components/Leaderboard";
// import "./App.css";
import { Box, Button, Typography } from "@mui/material";

export interface NavigationButtonsProps {
  navigate: (path: string) => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({ navigate }) => {
  return (
    <Box sx={{ display: "flex", gap: 2, justifyContent: "center", p: 4 }}>
      <Button variant="contained" onClick={() => navigate("/countdowndiggame")}>
        Dig against the clock
      </Button>
      <Button
        variant="contained"
        color="success"
        onClick={() => navigate("/leaderboard")}
      >
        View Leaderboard
      </Button>
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
      </Routes>
    </Router>
  );
};

export default FirstApp;
