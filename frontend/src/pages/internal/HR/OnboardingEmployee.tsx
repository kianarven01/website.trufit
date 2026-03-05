import { DashboardLayout } from "@/components/DashboardLayout";
import { PageShell, FilterOption, ColumnDef } from "@/components/PageShell";
import { useEffect, useState, useMemo } from "react";
import AddEmployeeModal from "@/components/popupModal/addEmployee";
import api from "@/api/axios";
import { toast } from "sonner";

interface OnboardingEmployee {
  id: number;
  employee_name: string;
  email: string;
  key_code: string;
  is_used: boolean;
  expires_at: string;
}

const OnboardingEmployees: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [employees, setEmployees] = useState<OnboardingEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState<number | null>(null);

  const [filters, setFilters] = useState<Record<string, string>>({
    status: "all",
  });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/registration-keys");
      if (res.data?.status === "success") {
        setEmployees(res.data.data);
      }
    } catch {
      toast.error("Failed to load onboarding employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const getStatus = (emp: OnboardingEmployee) => {
    const isExpired = new Date(emp.expires_at) < new Date();
    if (emp.is_used) return "registered";
    if (isExpired) return "expired";
    return "pending";
  };

  const filteredEmployees = useMemo(() => {
    if (filters.status === "all") return employees;
    return employees.filter((emp) => getStatus(emp) === filters.status);
  }, [employees, filters.status]);

  const regenerateKey = async (id: number) => {
    setRegenerating(id);
    try {
      const res = await api.post(`/admin/onboarding-employees/${id}/regenerate`);
      const newKey = res.data.key;

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === id ? { ...emp, key_code: newKey, is_used: false } : emp
        )
      );

      toast.success("Registration key regenerated");
    } catch {
      toast.error("Failed to regenerate key");
    } finally {
      setRegenerating(null);
    }
  };

  // Filters for the PageShell
  const filterOptions: FilterOption[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "pending", label: "Pending" },
        { value: "registered", label: "Registered" },
        { value: "expired", label: "Expired" },
      ],
    },
  ];

  // Define table columns
  const columns: ColumnDef<OnboardingEmployee>[] = [
    {
      key: "employee",
      label: "Employee",
      render: (emp) => (
        <div>
          <div className="font-semibold uppercase tracking-tight">
            {emp.employee_name}
          </div>
          <div className="text-[10px] text-muted-foreground">{emp.email}</div>
        </div>
      ),
    },
    {
      key: "key_code",
      label: "Key Code",
      render: (emp) => (
        <code className="px-2 py-1 rounded text-xs border border-border">
          {emp.key_code}
        </code>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (emp) => getStatus(emp),
    },
    {
      key: "expires_at",
      label: "Expires",
      render: (emp) => new Date(emp.expires_at).toLocaleDateString(),
    },
    {
      key: "action",
      label: "Action",
      render: (emp) =>
        !emp.is_used ? (
          <button
            onClick={() => regenerateKey(emp.id)}
            disabled={regenerating === emp.id}
            className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
          >
            {regenerating === emp.id ? "Working..." : "Regenerate"}
          </button>
        ) : (
          <span className="text-xs text-muted-foreground italic">
            Completed
          </span>
        ),
    },
  ];

  return (
    <DashboardLayout>
      <PageShell
        title="Onboarding Employees"
        description="Manage onboarding employees and their registration keys."
        items={filteredEmployees}
        columns={columns}
        getItemId={(emp) => emp.id.toString()}
        filters={filterOptions}
        activeFilters={filters}
        onFilterChange={(key, value) =>
          setFilters((prev) => ({ ...prev, [key]: value }))
        }
        addLabel="Add Employee"
        onAdd={() => setShowAddModal(true)}
        loading={loading}
      />

      <AddEmployeeModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </DashboardLayout>
  );
};

export default OnboardingEmployees;