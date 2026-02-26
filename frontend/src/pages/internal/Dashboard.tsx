import React from "react";
import { useAuth } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";
import { SalesDashboard } from "@/components/dashboards/SalesDashboard";
import { PurchasingDashboard } from "@/components/dashboards/PurchasingDashboard";
import { HrDashboard } from "@/components/dashboards/HrDashboard";

const Dashboard = () => {
  const { user, role, loading } = useAuth();

  const isAdmin = role?.toLowerCase() === "admin";
  const isHR = role?.toLowerCase() === "hr";
  const isSales = role?.toLowerCase() === "sales";
  const isPurchasing = role?.toLowerCase() === "purchasing";


  // Wait until auth is loaded
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // If user is not logged in
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please log in to access the dashboard.</p>
      </div>
    );
  }

  // Select dashboard based on role
  const userRole = role?.toLowerCase() || "";
  let DashboardComponent: React.ReactNode;

  switch (userRole) {
    case "admin":
      DashboardComponent = <AdminDashboard />;
      break;
    case "sales":
      DashboardComponent = <SalesDashboard />;
      break;
    case "purchasing":
      DashboardComponent = <PurchasingDashboard />;
      break;
    case "hr":
      DashboardComponent = <HrDashboard />;
      break;
  }

  return <DashboardLayout>{DashboardComponent}</DashboardLayout>;
};

export default Dashboard;