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

import DashboardContainer from "./components/DashboardContainer";

import CustomersList from "./pages/internal/Customer/Customers";
import CustomerDetail from "./pages/internal/Customer/CustomerDetail";

import AppointmentsList from "./pages/internal/Appointment/Appointments";

import JobOrder from "./pages/internal/Services/Job Order/JobOrder";
import ServiceCatalog from "./pages/internal/Services/Service Catalog/ServiceCatalog";
import TaskLibraryList from "./pages/internal/Services/Service Catalog/TaskLibrary";
import ServiceCatalogForm from "./pages/internal/Services/Service Catalog/ServiceCatalogForm";
import ServiceDetail from "./pages/internal/Services/Service Catalog/ServiceDetail";


import SalesOrder from "./pages/internal/Sales/SalesOrder/SalesOrderList";

import Estimates from "./pages/internal/Sales/Estimates/Estimates";
import AddEstimate from "./pages/internal/Sales/Estimates/AddEstimate";

import PurchaseOrderList from "./pages/internal/Purchasing/PurchaseOrders/POList";
import PurchaseOrderDetails from "./pages/internal/Purchasing/PurchaseOrders/PODetail";

import SupplierList from "./pages/internal/Purchasing/Suppliers/SupplierList";
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

            <Route path="/webapp" element={<DashboardContainer />}>
              
              <Route>
                <Route path="appointments">
                  <Route index element={<AppointmentsList />} />
                </Route>
              </Route>

              {/* Customers */}
              <Route path="customers">
                <Route index element={<CustomersList />} />
                <Route path=":id" element={<CustomerDetail />} />
              </Route>

              {/* Services */}
              <Route path="services">
                <Route path="service-catalog">
                  <Route index element={<ServiceCatalog />} />
                  <Route path="task-library" element={<TaskLibraryList />} />
                  <Route path="new-service" element={<ServiceCatalogForm mode="add" />} />
                  <Route path=":id/edit" element={<ServiceCatalogForm mode="edit" />} />
                  <Route path=":id" element={<ServiceDetail />} />
                </Route>

                <Route>
                  <Route path="job-orders">
                    <Route index element={<JobOrder />} />
                    <Route path=":new-job-order" element={<JobOrderForm mode="add" />} />
                  </Route>
                </Route>

              </Route>

              {/* Sales */}
              <Route path="sales">
                <Route path="sales-orders">
                  <Route index element={<SalesOrder />} />
                </Route>

                <Route path="estimates">
                  <Route index element={<Estimates />} />
                  <Route path="new-estimate" element={<AddEstimate />} />
                </Route>
              </Route>

              {/* Purchasing */}
              <Route path="purchasing">
                <Route path="purchase-orders">
                  <Route index element={<PurchaseOrderList />} />
                  <Route path=":id" element={<PurchaseOrderDetails />} />
                </Route>

                <Route path="suppliers">
                  <Route index element={<SupplierList />} />
                  <Route path=":supplierId" element={<SupplierDetails />} />
                </Route>
              </Route>

            </Route>

            <Route path="/webapp/services/job-orders" element={<JobOrder />} />

            <Route path="/webapp/products/product-catalog" element={<ProductCatalog />}>
              <Route index element={<VehiclesPage />} />
              <Route path=":vehicleSlug" element={<VehicleVariantsPage />} />
              <Route path=":vehicleSlug/:variantSlug/:categorySlug/products" element={<ProductList />} />
              <Route path=":vehicleSlug/:variantSlug/:categorySlug/products/:productNameSlug" element={<ProductDetail />} />

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
