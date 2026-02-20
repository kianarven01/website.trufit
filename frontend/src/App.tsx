import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Import your pages - Ensure the filenames match exactly (Case Sensitive!)
import Home from "./pages/public/Home";
import LoginPage from "./pages/internal/LoginPage";
import Dashboard from "./pages/internal/Dashboard.tsx";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Customer Redirect */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />

        {/* Web App Area */}
        <Route
          path="/webapp"
          element={<Navigate to="/webapp/login" replace />}
        />
        <Route path="/webapp/login" element={<LoginPage />} />
        <Route path="/webapp/dashboard" element={<Dashboard />} />

        {/* 404 Page */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center h-screen">
              <h1 className="text-2xl font-bold font-sans">
                404 - Page Not Found
              </h1>
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
