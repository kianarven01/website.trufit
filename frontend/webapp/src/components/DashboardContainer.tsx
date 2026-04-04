import { DashboardLayout } from "@/components/DashboardLayout";
import { Outlet } from "react-router-dom";

const DashboardContainer: React.FC = () => {
  return (
    <DashboardLayout>
       <Outlet />
    </DashboardLayout>
  );
};

export default DashboardContainer;