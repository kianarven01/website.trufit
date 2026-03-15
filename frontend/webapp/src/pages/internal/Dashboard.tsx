import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import SalesDashboard from "@/components/dashboards/SalesDashboard";
import PurchasingDashboard from "@/components/dashboards/PurchasingDashboard";
import HrDashboard from "@/components/dashboards/HrDashboard";

const Dashboard = () => {
  const { user, role, loading } = useAuth();

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );

  if (!user) return <Navigate to="/webapp/login" replace />;

  const userRole = role?.toLowerCase() || "";
  const getComponent = () => {
    switch (userRole) {
      case "admin":
        return <AdminDashboard />;
      case "hr":
        return <HrDashboard />;
      case "sales":
        return <SalesDashboard />;
      case "purchasing":
        return <PurchasingDashboard />;

      default:
        return <div>Default Staff View</div>;
    }
  };

  return <DashboardLayout>{getComponent()}</DashboardLayout>;
};

export default Dashboard;
