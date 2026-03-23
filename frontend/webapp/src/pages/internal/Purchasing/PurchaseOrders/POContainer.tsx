import { DashboardLayout } from "@/components/DashboardLayout";
import { Outlet } from "react-router-dom";

const PurchOrderContainer: React.FC = () => {
  return (
    <DashboardLayout>
       <Outlet />
    </DashboardLayout>
  );
};

export default PurchOrderContainer;