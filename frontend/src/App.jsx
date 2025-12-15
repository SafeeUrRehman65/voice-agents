import { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import HalalifyAgent from "./pages/HalalifyAgent";
import AGPharmaAgent from "./pages/AGPharmaAgent";
import LandingPage from "./pages/LandingPage";
import LLMProvider from "./providers/LLMProviders";
import LaunchAgentPage from "./pages/LaunchAgent";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/halalify-voice-agent" element={<HalalifyAgent />} />
          <Route path="/agp-voice-agent" element={<AGPharmaAgent />} />

          <Route
            path="/launch-agent"
            element={
              <LLMProvider>
                <LaunchAgentPage />
              </LLMProvider>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
