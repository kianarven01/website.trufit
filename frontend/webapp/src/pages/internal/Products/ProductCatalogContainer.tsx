import { DashboardLayout } from "@/components/DashboardLayout";
import { Outlet } from "react-router-dom";


const ProductCatalog: React.FC = () => {
  return (
    <DashboardLayout>
      <Outlet /> 
    </DashboardLayout>
  );
};

export default ProductCatalog;