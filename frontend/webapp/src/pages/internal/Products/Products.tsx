import { PageShell } from "@/components/PageShell";
import Vehicles from "./ProductCatalog/Vehicles";
import { DashboardLayout } from "@/components/DashboardLayout";

const ProductCatalog: React.FC = () => {
  return (
    <div>
      <DashboardLayout>
        <Vehicles/>
      </DashboardLayout>
    </div>
  );
}

export default ProductCatalog;