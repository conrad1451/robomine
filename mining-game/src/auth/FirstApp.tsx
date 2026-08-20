// FirstApp.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Dashboard } from "../components/Dashboard";
// import "./App.css";

const FirstApp = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/countdowngame" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default FirstApp;
