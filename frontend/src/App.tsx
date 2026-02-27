import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // Import this!
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/public/Home";
import LoginPage from "./pages/internal/LoginPage";
import Dashboard from "./pages/internal/Dashboard";
import Employees from "./pages/internal/HR/Employees"
import Register from "./pages/internal/Register";
import PageNotFound from "./pages/PageNotFound";

const App: React.FC = () => {
  return (
    <AuthProvider>
      {" "}
      {/* Wrap everything here */}
      <Router>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/webapp/login" element={<LoginPage />} />
          <Route path="/webapp/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/webapp/dashboard" element={<Dashboard />} />
            <Route path="/webapp/employee-management/employees" element={<Employees />} />
          </Route>

          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route
            path="/webapp"
            element={<Navigate to="/webapp/dashboard" replace />}
          />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
