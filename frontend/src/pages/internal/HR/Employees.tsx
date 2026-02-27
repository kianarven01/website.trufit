import { DashboardLayout } from "@/components/DashboardLayout";
import EmployeeTable from "@/components/recruitment/EmployeeTable";
import OnboardingTable from "@/components/recruitment/OnboardingTable";
import { PageShell } from "@/components/PageShell";
import { useEffect, useState } from "react";
import AddEmployeeModal from "@/components/popupModal/addEmployee";
import api from "@/api/axios";

interface Role {
  id: number;
  name: string;
}

interface Position {
  id: number;
  name: string;
}

const Employees: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  const [filters, setFilters] = useState({
    role: "all",
    position: "all",
  });

  // Fetch roles and positions from backend
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const roleRes = await api.get("/admin/roles");
        setRoles(roleRes.data.data);

        const positionRes = await api.get("/admin/positions"); // Assuming this endpoint exists
        setPositions(positionRes.data.data);
      } catch (error) {
        console.error("Failed to load filters", error);
      }
    };

    fetchFilters();
  }, []);

  // Prepare dynamic filters for PageShell
  const filterOptions = [
    {
      key: "role",
      label: "Role",
      options: [
        { value: "all", label: "All" },
        ...roles.map((r) => ({ value: r.id.toString(), label: r.name })),
      ],
    },
    {
      key: "position",
      label: "Position",
      options: [
        { value: "all", label: "All" },
        ...positions.map((p) => ({ value: p.id.toString(), label: p.name })),
      ],
    },
  ];

  return (
    <DashboardLayout>
      <PageShell
        title="Employees"
        description="List of all employees"
        searchPlaceholder="Search by name, username, role..."
        filters={filterOptions}
        activeFilters={filters}
        onFilterChange={(key, value) =>
          setFilters((prev) => ({ ...prev, [key]: value }))
        }
        onAdd={() => setShowAddModal(true)}
        addLabel="Add Employee"
      >
        <EmployeeTable />
        <div className="my-6 border-t border-slate-200" />
        <OnboardingTable />

      </PageShell>

      <AddEmployeeModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </DashboardLayout>
  );
};

export default Employees;