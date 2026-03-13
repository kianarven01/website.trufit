import { DashboardLayout } from "@/components/DashboardLayout";
import Preferences from "@/components/admin/Preferences";

const RolesandPermissions: React.FC = () => {
  return (
    <div>
      <DashboardLayout>
        <Preferences />
      
      </DashboardLayout>
    </div>
  );
}

export default RolesandPermissions;