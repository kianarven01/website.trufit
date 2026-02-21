import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute"; // The bouncer
import Home from "./pages/public/Home";
import LoginPage from "./pages/internal/LoginPage";
import Dashboard from "./pages/internal/Dashboard";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public - No ID needed */}
        <Route path="/home" element={<Home />} />
        <Route path="/webapp/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/webapp/dashboard" element={<Dashboard />} />
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route
          path="/webapp"
          element={<Navigate to="/webapp/dashboard" replace />}
        />

        {/* 404 */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
};

export default App;
