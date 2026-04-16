import { DashboardLayout } from "@/components/DashboardLayout";
import { Outlet } from "react-router-dom";

const SupplierContainer: React.FC = () => {
  return (
    <DashboardLayout>
       <Outlet />
    </DashboardLayout>
  );
};

export default SupplierContainer;