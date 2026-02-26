import { useAuth } from "../../context/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";
import { SalesDashboard } from "@/components/dashboards/SalesDashboard";
import { PurchasingDashboard } from "@/components/dashboards/PurchasingDashboard";

const Dashboard = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role?.toLowerCase()) {
      case "admin":
        return <AdminDashboard />;
      case "sales":
        return <SalesDashboard />;
      case "purchasing":
        return <PurchasingDashboard />;
      default:
        return <AdminDashboard />;
    }
  };

  return <DashboardLayout>{renderDashboard()}</DashboardLayout>;
};

export default Dashboard;