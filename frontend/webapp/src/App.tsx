import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // Import this!
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/internal/LoginPage";
import Dashboard from "./pages/internal/Dashboard";

import CustomerContainer from "./pages/internal/Customer/CustomerContainer";
import CustomersList from "./pages/internal/Customer/Customers";
import CustomerDetail from "./pages/internal/Customer/CustomerDetail";

import Appointments from "./pages/internal/Sales/Appointments";

import JobOrder from "./pages/internal/Services/JobOrder";
import ServiceCatalog from "./pages/internal/Services/ServiceCatalog";

import SalesOrder from "./pages/internal/Sales/SalesOrder";
import Estimates from "./pages/internal/Sales/Estimates";

import PurchOrderContainer from "./pages/internal/Purchasing/PurchaseOrders/POContainer";
import PurchaseOrderList from "./pages/internal/Purchasing/PurchaseOrders/POList";
import PurchaseOrderDetails from "./pages/internal/Purchasing/PurchaseOrders/PODetail";
import SupplierList from "./pages/internal/Purchasing/Suppliers/SupplierList";
import SupplierContainer from "./pages/internal/Purchasing/Suppliers/SuppliersContainer";
import SupplierDetails from "./pages/internal/Purchasing/Suppliers/SupplierDetail";

import ProductCatalog from "./pages/internal/Products/ProductCatalogContainer";
import VehiclesPage from "./pages/internal/Products/ProductCatalog/Vehicles";
import VehicleVariantsPage from "./pages/internal/Products/ProductCatalog/VehicleVariants";
import ProductList from "./pages/internal/Products/ProductCatalog/Products";
import ProductDetail from "./pages/internal/Products/ProductCatalog/ProductDetail";


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
        <Route path="/webapp/login" element={<LoginPage />} />
        <Route path="/webapp/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/webapp/dashboard" element={<Dashboard />} />

            <Route path="/webapp/customers" element={<CustomerContainer />}>
              <Route index element={<CustomersList />} />
              <Route path=":id" element={<CustomerDetail />} />
            </Route>

            <Route path="/webapp/appointments" element={<Appointments />} />

            <Route path="/webapp/services/job-orders" element={<JobOrder />} />
            <Route path="/webapp/services/service-catalog" element={<ServiceCatalog />} />

            <Route path="/webapp/sales/sales-orders" element={<SalesOrder />} />
            <Route path="/webapp/sales/estimates" element={<Estimates />} />

            <Route path="/webapp/purchasing/purchase-orders" element={<PurchOrderContainer />}>
              <Route index element={<PurchaseOrderList />} />
              <Route path=":id" element={<PurchaseOrderDetails />} />
            </Route>

            <Route path="/webapp/purchasing/suppliers" element={<SupplierContainer />}>
              <Route index element={<SupplierList />} />
              <Route path=":supplierId" element={<SupplierDetails />} />
            </Route>

            <Route path="/webapp/products/product-catalog" element={<ProductCatalog />}>
              <Route index element={<VehiclesPage />} />
              <Route path=":vehicleSlug" element={<VehicleVariantsPage />} />
              <Route path=":vehicleSlug/:variantSlug/:categorySlug/products" element={<ProductList />} />
              <Route path=":vehicleSlug/:variantSlug/:categorySlug/products/:productId" element={<ProductDetail />} />

            </Route>

            <Route path="/webapp/products/inventory" element={<InventoryList />} />

            <Route path="/webapp/employee-management/current-employees" element={<Employees />} />
            <Route path="/webapp/employee-management/onboarding-employees" element={<OnboardingEmployees />} />
            <Route path="/webapp/settings/roles-and-permissions" element={<RolesandPermissions />} />

            <Route path="/webapp/settings/account" element={<AccountSettings />} />

          </Route>

        <Route path="/" element={<Navigate to="/webapp/login" replace />} />
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
