import { DashboardLayout } from "@/components/DashboardLayout";
import {
  MasterDetailPanel,
  FilterOption,
  ColumnDef,
} from "@/components/MasterDetailPanel";
import { useEffect, useState, useMemo } from "react";
import api from "@/api/axios";
import { toast } from "sonner";

interface Employee {
  id: number;
  name: string;
  email: string;
  address?: string;
  position?: string;
  role_name?: string;
  join_date?: string;
}

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({
    role: "all",
    position: "all",
  });

  // Fetch employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/employees");
      if (res.data?.status === "success") {
        setEmployees(res.data.data);
      }
    } catch {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filter + search logic
  const filteredEmployees = useMemo(() => {
    return employees
      .filter((e) => {
        if (filters.role && filters.role !== "all") {
          return e.role_name === filters.role;
        }
        return true;
      })
      .filter((e) => {
        if (filters.position && filters.position !== "all") {
          return e.position === filters.position;
        }
        return true;
      })
      .filter((e) => {
        const query = searchQuery.toLowerCase();
        return (
          e.name?.toLowerCase().includes(query) ||
          e.email?.toLowerCase().includes(query) ||
          e.position?.toLowerCase().includes(query)
        );
      });
  }, [employees, filters.role, filters.position, searchQuery]);

  // Generate dynamic role and position options
  const roleOptions = useMemo(() => {
    const roles = Array.from(
      new Set(employees.map((e) => e.role_name).filter(Boolean)),
    );
    return roles.map((role) => ({
      value: role as string,
      label: role as string,
    }));
  }, [employees]);

  const positionOptions = useMemo(() => {
    const positions = Array.from(
      new Set(employees.map((e) => e.position).filter(Boolean)),
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

  // Table columns
  const columns: ColumnDef<Employee>[] = [
    {
      key: "name",
      label: "Employee",
      render: (emp) => (
        <div>
          <div className="font-bold text-slate-800">
            {emp.name || "Unnamed"}
          </div>
          <div className="text-[10px] text-slate-400 lowercase">
            {emp.email}
          </div>
        </div>
      ),
    },
    {
      key: "position",
      label: "Position",
      render: (emp) => emp.position || "-",
    },
    {
      key: "role",
      label: "Role",
      render: (emp) => emp.role_name || "-",
    },
  ];

  return (
    <DashboardLayout>
      <MasterDetailPanel<Employee>
        title="Current Employees"
        description="Manage all employee details"
        items={filteredEmployees}
        selectedItem={selectedEmployee}
        onSelect={setSelectedEmployee}
        getItemId={(emp) => emp.id.toString()}
        columns={columns}
        filters={filterOptions}
        activeFilters={filters}
        onFilterChange={(key, value) =>
          setFilters((prev) => ({ ...prev, [key]: value }))
        }
        searchPlaceholder="Search employees..."
        onSearch={(query) => setSearchQuery(query)}
        addLabel="Add Employee"
      >
        {selectedEmployee && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{selectedEmployee.name}</h2>
            <p className="text-sm text-muted-foreground">
              {selectedEmployee.email}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold">Address:</span>{" "}
                {selectedEmployee.address || "No address"}
              </div>
              <div>
                <span className="font-semibold">Position:</span>{" "}
                {selectedEmployee.position || "-"}
              </div>
              <div>
                <span className="font-semibold">Role:</span>{" "}
                {selectedEmployee.role_name || "-"}
              </div>
              <div>
                <span className="font-semibold">Join Date:</span>{" "}
                {selectedEmployee.join_date
                  ? new Date(selectedEmployee.join_date).toLocaleDateString()
                  : "Pending"}
              </div>
            </div>
          </div>
        )}
      </MasterDetailPanel>
    </DashboardLayout>
  );
};

export default Employees;
