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
import About from "./pages/public/About";
import Contacts from "./pages/public/Contacts";
import Services from "./pages/public/Services";
import Products from "./pages/public/Products";
import LoginPage from "./pages/internal/LoginPage";
import Dashboard from "./pages/internal/Dashboard";

import Customers from "./pages/internal/Sales/Customers";
import Appointments from "./pages/internal/Sales/Appointments";
import JobOrders from "./pages/internal/Sales/JobOrders";
import Estimates from "./pages/internal/Sales/Estimates";

import AvailableProducts from "./pages/internal/Products";

import Employees from "./pages/internal/HR/Employees"
import OnboardingEmployees from "./pages/internal/HR/OnboardingEmployee"

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
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/products" element={<Products />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/webapp/login" element={<LoginPage />} />
          <Route path="/webapp/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/webapp/dashboard" element={<Dashboard />} />
            <Route path="/webapp/sales/customers" element={<Customers />} />
            <Route path="/webapp/sales/appointments" element={<Appointments />} />
            <Route path="/webapp/sales/job-orders" element={<JobOrders />} />
            <Route path="/webapp/sales/estimates" element={<Estimates />} />

            <Route path="/webapp/products" element={<AvailableProducts />} />

            <Route path="/webapp/employee-management/current-employees" element={<Employees />} />
            <Route path="/webapp/employee-management/onboarding-employees" element={<OnboardingEmployees />} />

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
