import { DashboardLayout } from "@/components/DashboardLayout";
import { Outlet } from "react-router-dom";

const CustomerContainer: React.FC = () => {
  return (
    <DashboardLayout>
       <Outlet />
    </DashboardLayout>
  );
};

export default CustomerContainer;