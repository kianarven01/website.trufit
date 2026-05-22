import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Pagination, usePagination } from "@/components/ui/pagination";
import DataToolbar from "@/components/DataToolbar";
import { ImageIcon, MoreVertical, Edit, UserX } from "lucide-react";
import api from "@/api/axios";
import { toast } from "sonner";
import EditEmployeeModal from "@/components/popupModal/editEmployee";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  position?: string;
  role_name?: string;
  join_date?: string;
}

const EmployeesList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [employeeToTerminate, setEmployeeToTerminate] = useState<Employee | null>(null);
  const navigate = useNavigate();

  const { page, setPage, pageSize, setPageSize, paginate } = usePagination(25);

  const [filters, setFilters] = useState({
    role: "all",
    position: "all",
  });

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/admin/employees");
      if (res.data?.status === "success") {
        setEmployees(res.data.data);
      }
    } catch {
      console.error("Failed to load employees");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleTerminate = async () => {
    if (!employeeToTerminate) return;
    try {
      const res = await api.delete(`/admin/employees/${employeeToTerminate.id}`);
      if (res.data?.status === "success") {
        toast.success(`${getFullName(employeeToTerminate)} has been terminated.`);
        fetchEmployees(); // Refresh list
      }
    } catch {
      toast.error("Failed to terminate employee.");
    } finally {
      setEmployeeToTerminate(null);
    }
  };

  const getFullName = (e: Employee) => `${e.first_name} ${e.last_name}`.trim() || "Unnamed";

  /* SEARCH & FILTER */
  const normalize = (val: string) =>
    (val || "").toLowerCase().replace(/\s+/g, " ").trim();

  const filtered = useMemo(() => {
    const q = normalize(search);

    return employees.filter((e) => {
      // Role Filter
      if (filters.role !== "all" && e.role_name !== filters.role) {
        return false;
      }

      // Position Filter
      if (filters.position !== "all" && e.position !== filters.position) {
        return false;
      }

      const fullName = normalize(getFullName(e));
      const position = normalize(e.position || "");
      const role = normalize(e.role_name || "");

      const tokens = q.split(" ").filter(Boolean);

      const matchesSearch =
        tokens.length === 0 ||
        tokens.every((t) =>
          fullName.includes(t) ||
          e.email.toLowerCase().includes(t) ||
          position.includes(t) ||
          role.includes(t)
        );

      return matchesSearch;
    });
  }, [employees, search, filters]);

  const roleOptions = useMemo(() => {
    const roles = Array.from(new Set(employees.map((e) => e.role_name).filter(Boolean)));
    return roles.map((role) => ({ label: role as string, value: role as string }));
  }, [employees]);

  const positionOptions = useMemo(() => {
    const positions = Array.from(new Set(employees.map((e) => e.position).filter(Boolean)));
    return positions.map((pos) => ({ label: pos as string, value: pos as string }));
  }, [employees]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toolbarFilters = [
    { key: "role", label: "System Role", options: roleOptions },
    { key: "position", label: "Position", options: positionOptions },
  ];

  const paginated = paginate(filtered);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize, filters, setPage]);

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden">
      <DataToolbar
        searchPlaceholder="Search employees..."
        onSearch={setSearch}
        filters={toolbarFilters}
        onFilterChange={handleFilterChange}
        activeFilters={filters}
      />

      {isLoading ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl px-2 overflow-hidden bg-background">
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">
              Loading employees...
            </p>
          </div>
        </div>
      ) : employees.length > 0 ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl overflow-hidden bg-background">
          <ScrollArea className="flex-1 px-2">
            <Table className="table-fixed w-full border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[10%] text-center">Employee ID</TableHead>
                  <TableHead className="w-[22%] text-center">Employee</TableHead>
                  <TableHead className="w-[13%] text-center">Phone</TableHead>
                  <TableHead className="w-[15%] text-center">Position</TableHead>
                  <TableHead className="w-[12%] text-center">System Role</TableHead>
                  <TableHead className="w-[12%] text-center">Join Date</TableHead>
                  <TableHead className="w-[6%] text-center"></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.length > 0 ? (
                  paginated.map((e) => (
                    <TableRow
                      key={e.id}
                      className={cn(
                        "transition-all rounded-lg border border-border/60 bg-card shadow-sm hover:shadow-md",
                        "hover:bg-accent/30"
                      )}
                    >
                      <TableCell className="py-2 text-center font-mono text-xs text-muted-foreground">
                        {e.id}
                      </TableCell>
                      <TableCell className="py-2 text-center">
                        <div className="flex flex-col items-center">
                          <p className="font-semibold text-foreground capitalize">{getFullName(e).toLowerCase()}</p>
                          <p className="text-[10px] tracking-wider text-muted-foreground font-medium">
                            {e.email || "No Email"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium">{e.phone || "-"}</TableCell>
                      <TableCell className="text-center text-muted-foreground">{e.position || "-"}</TableCell>
                      <TableCell className="text-center text-muted-foreground">{e.role_name || "-"}</TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {e.join_date ? new Date(e.join_date).toLocaleDateString() : "Pending"}
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                              <MoreVertical size={18} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => setEmployeeToEdit(e)} className="cursor-pointer">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEmployeeToTerminate(e)} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                              <UserX className="w-4 h-4 mr-2" />
                              Terminate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="py-16 flex flex-col items-center text-center">
                        <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">No employees found</p>
                        <p className="text-xs text-muted-foreground">Try adjusting your search</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>

          <Pagination
            totalItems={filtered.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center">
            <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">No employees available</p>
            <p className="text-xs text-muted-foreground">Add an employee to get started</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Employee Modal */}
      <EditEmployeeModal
        open={!!employeeToEdit}
        onClose={() => setEmployeeToEdit(null)}
        employee={employeeToEdit}
        onSuccess={fetchEmployees}
      />

      {/* Terminate Confirmation Alert */}
      <AlertDialog open={!!employeeToTerminate} onOpenChange={(open) => !open && setEmployeeToTerminate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Terminate Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to terminate <span className="font-bold">{employeeToTerminate ? getFullName(employeeToTerminate) : ""}</span>? 
              This will restrict their access but preserve their historical data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleTerminate} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Terminate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmployeesList;
