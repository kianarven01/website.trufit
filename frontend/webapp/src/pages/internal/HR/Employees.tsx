import { DashboardLayout } from "@/components/DashboardLayout";
import { PageShell, FilterOption, ColumnDef } from "@/components/PageShell";
import { useEffect, useState, useMemo } from "react";
import api from "@/api/axios";
import { MoreVertical } from "lucide-react";

interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  position?: string;
  role_name?: string;
  join_date?: string;
}

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const [filters, setFilters] = useState<Record<string, string>>({
    role: "all",
    position: "all",
  });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/employees");

      if (res.data?.status === "success") {
        setEmployees(res.data.data);
      }
    } catch {
      alert("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees
      .filter((e) => {
        if (filters.role !== "all") {
          return e.role_name === filters.role;
        }
        return true;
      })
      .filter((e) => {
        if (filters.position !== "all") {
          return e.position === filters.position;
        }
        return true;
      })
      .filter((e) => {
        const q = searchQuery.toLowerCase();

        return (
          e.name?.toLowerCase().includes(q) ||
          e.email?.toLowerCase().includes(q) ||
          e.position?.toLowerCase().includes(q)
        );
      });
  }, [employees, filters.role, filters.position, searchQuery]);

  const roleOptions = useMemo(() => {
    const roles = Array.from(
      new Set(employees.map((e) => e.role_name).filter(Boolean))
    );

    return roles.map((role) => ({
      value: role as string,
      label: role as string,
    }));
  }, [employees]);

  const positionOptions = useMemo(() => {
    const positions = Array.from(
      new Set(employees.map((e) => e.position).filter(Boolean))
    );
    return positions.map((pos) => ({
      value: pos as string,
      label: pos as string,
    }));
  }, [employees]);

  const filterOptions: FilterOption[] = [
    { key: "role", label: "Role", options: roleOptions },
    { key: "position", label: "Position", options: positionOptions },
  ];

  const ActionDropdown: React.FC<{ emp: Employee }> = ({ emp }) => {
    const [open, setOpen] = useState(false);

    const handleEdit = () => {
      alert(`Edit ${emp.name}`);
      setOpen(false);
    };

    const handleDeactivate = () => {
      alert(`Deactivate ${emp.name}`);
      setOpen(false);
    };

    return (
      <div className="relative flex justify-end">
        <button
          onClick={() => setOpen(!open)}
          className="p-1 rounded hover:bg-muted"
        >
          <MoreVertical className="w-4 h-4 text-muted-foreground" />
        </button>

        {open && (
          <div className="absolute right-0 mt-1 w-40 bg-popover border border-border rounded-md shadow-lg z-10">
            <button
              onClick={handleEdit}
              className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground text-sm"
            >
              Edit
            </button>

            <button
              onClick={handleDeactivate}
              className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground text-sm text-red-500"
            >
              Terminate
            </button>
          </div>
        )}
      </div>
    );
  };

  const columns: ColumnDef<Employee>[] = [
    {
      key: "employee",
      label: "Employee",
      render: (emp) => (
        <div>
          <div className="font-semibold uppercase tracking-tight">
          <div className="font-semibold uppercase tracking-tight">
            {emp.name || "Unnamed"}
          </div>
          <div className="text-[10px] text-muted-foreground">{emp.email}</div>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (emp) => emp.phone || "-",
    },
    {
      key: "address",
      label: "Address",
      render: (emp) => emp.address || "-",
    },
    {
      key: "position",
      label: "Position",
      render: (emp) => emp.position || "-",
    },
    {
      key: "role",
      label: " System Role",
      render: (emp) => emp.role_name || "-",
    },
    {
      key: "join_date",
      label: "Join Date",
      render: (emp) =>
        emp.join_date
          ? new Date(emp.join_date).toLocaleDateString()
          : "Pending",
    },
    {
      key: "actions",
      label: "",
      render: (emp) => <ActionDropdown emp={emp} />,
    },
  ];

  return (
    <DashboardLayout>
      <PageShell<Employee>
      <PageShell<Employee>
        title="Employees"
        description="Manage company employees."
        items={filteredEmployees}
        columns={columns}
        getItemId={(emp) => emp.id.toString()}
        filters={filterOptions}
        activeFilters={filters}
        onFilterChange={(key, value) =>
          setFilters((prev) => ({ ...prev, [key]: value }))
        }
        searchPlaceholder="Search employees..."
        onSearch={(query) => setSearchQuery(query)}
        addLabel="Add Employee"
        onAdd={() => alert("Open Add Employee Modal")}
        loading={loading}
      />
    </DashboardLayout>
  );
};

export default Employees;