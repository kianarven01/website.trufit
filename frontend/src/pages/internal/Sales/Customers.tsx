import { DashboardLayout } from "@/components/DashboardLayout";
import { PageShell } from "@/components/PageShell";

const Customers: React.FC = () => {
  return (
    <DashboardLayout>
      <PageShell 
      title="Customers" 
      description="Manage customer information">
        Customers
      </PageShell>
    </DashboardLayout>
  )
};

export default Customers;