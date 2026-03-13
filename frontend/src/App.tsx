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

import JobOrder from "./pages/internal/Services/JobOrder";
import ServiceCatalog from "./pages/internal/Services/ServiceCatalog";

import SalesOrder from "./pages/internal/Sales/SalesOrder";
import Estimates from "./pages/internal/Sales/Estimates";

import ProductCatalog from "./pages/internal/Products/Products";
import InventoryList from "./pages/internal/Products/InventoryList";

import Employees from "./pages/internal/HR/Employees"
import OnboardingEmployees from "./pages/internal/HR/OnboardingEmployee"
import RolesandPermissions from "./pages/internal/HR/RolesandPermissions";

import AccountSettings from "./pages/internal/AccountSettings";

import Register from "./pages/internal/Register";
import PageNotFound from "./pages/PageNotFound";

const App: React.FC = () => {
  return (
    //wrap everything here
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
            <Route path="/webapp/customers" element={<Customers />} />
            <Route path="/webapp/appointments" element={<Appointments />} />

            <Route path="/webapp/services/job-orders" element={<JobOrder />} />
            <Route path="/webapp/services/service-catalog" element={<ServiceCatalog />} />

            <Route path="/webapp/sales/sales-orders" element={<SalesOrder />} />
            <Route path="/webapp/sales/estimates" element={<Estimates />} />

            <Route path="/webapp/products/product-catalog" element={<ProductCatalog />} />
            <Route path="/webapp/products/inventory-list" element={<InventoryList />} />

            <Route path="/webapp/employee-management/current-employees" element={<Employees />} />
            <Route path="/webapp/employee-management/onboarding-employees" element={<OnboardingEmployees />} />
            <Route path="/webapp/settings/roles-and-permissions" element={<RolesandPermissions />} />

            <Route path="/webapp/settings/account" element={<AccountSettings />} />

          </Route>

        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route
          path="/webapp"
          element={<Navigate to="/webapp/dashboard" replace />}
        />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
