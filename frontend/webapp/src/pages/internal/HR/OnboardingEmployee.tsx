import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scrollArea";

import DataToolbar from "@/components/DataToolbar";
import AddEmployeeModal from "@/components/popupModal/addEmployee";
import { ImageIcon, MoreVertical, ClipboardCopy, Send, Ban } from "lucide-react";
import api from "@/api/axios";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OnboardingEmployee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  key_code: string;
  is_used: boolean;
  expires_at: string;
}

const OnboardingEmployees: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [employees, setEmployees] = useState<OnboardingEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState<Record<string, string>>({
    status: "all",
  });

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/admin/registration-keys");
      if (res.data?.status === "success") {
        setEmployees(res.data.data);
      }
    } catch {
      toast.error("Failed to load onboarding employees");
    } finally {
      setIsLoading(false);
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

  const regenerateKey = async (id: number) => {
    try {
      const res = await api.post(`/admin/onboarding-employees/${id}/regenerate`);
      const newKey = res.data.key;
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === id ? { ...emp, key_code: newKey, is_used: false } : emp))
      );
      toast.success("Registration key regenerated");
    } catch {
      toast.error("Failed to regenerate key");
    }
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Registration key copied!");
  };

  /* SEARCH & FILTER */
  const normalize = (val: string) => (val || "").toLowerCase().replace(/\s+/g, " ").trim();

  const filtered = useMemo(() => {
    const q = normalize(search);

    return employees.filter((e) => {
      // Status Filter
      if (filters.status !== "all" && getStatus(e) !== filters.status) {
        return false;
      }

      const fullName = normalize(`${e.first_name} ${e.last_name}`);
      const tokens = q.split(" ").filter(Boolean);

      const matchesSearch =
        tokens.length === 0 ||
        tokens.every(
          (t) =>
            fullName.includes(t) ||
            e.email.toLowerCase().includes(t) ||
            e.key_code.toLowerCase().includes(t)
        );

      return matchesSearch;
    });
  }, [employees, search, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toolbarFilters = [
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


  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden">
      <DataToolbar
        searchPlaceholder="Search onboarding employees..."
        onSearch={setSearch}
        onAdd={() => setShowAddModal(true)}
        addLabel="Add Employee"
        filters={toolbarFilters}
        onFilterChange={handleFilterChange}
        activeFilters={filters}
      />

      {isLoading ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl px-2 overflow-hidden bg-background">
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">
              Loading onboarding employees...
            </p>
          </div>
        </div>
      ) : employees.length > 0 ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl overflow-hidden bg-background">
          <ScrollArea className="flex-1 px-2">
            <Table className="table-fixed w-full border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%] text-center">Employee</TableHead>
                  <TableHead className="w-[25%] text-center">Key Code</TableHead>
                  <TableHead className="w-[15%] text-center">Status</TableHead>
                  <TableHead className="w-[20%] text-center">Expires</TableHead>
                  <TableHead className="w-[10%] text-center"></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map((e) => (
                    <TableRow
                      key={e.id}
                      className={cn(
                        "transition-all rounded-lg border border-border/60 bg-card shadow-sm hover:shadow-md",
                        "hover:bg-accent/30"
                      )}
                    >
                      <TableCell className="py-2 text-center">
                        <div className="flex flex-col items-center">
                          <p className="font-semibold text-foreground uppercase">
                            {`${e.first_name} ${e.last_name}`.trim()}
                          </p>
                          <p className="text-[10px] tracking-wider text-muted-foreground font-medium">
                            {e.email || "No Email"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        <code className="inline-flex items-center justify-between px-2 py-1 rounded text-xs border border-border">
                          <span className="truncate">{e.key_code}</span>
                          <ClipboardCopy
                            className="w-4 h-4 cursor-pointer text-muted-foreground hover:text-primary ml-2 flex-shrink-0"
                            onClick={() => copyToClipboard(e.key_code)}
                          />
                        </code>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          "inline-flex items-center px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider border",
                          getStatus(e) === "registered" && "bg-emerald-100 text-emerald-800 border-emerald-200",
                          getStatus(e) === "pending" && "bg-amber-100 text-amber-800 border-amber-200",
                          getStatus(e) === "expired" && "bg-destructive/10 text-destructive border-destructive/20"
                        )}>
                          {getStatus(e)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {new Date(e.expires_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                              <MoreVertical size={18} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => regenerateKey(e.id)} className="cursor-pointer">
                              <Send className="w-4 h-4 mr-2" />
                              ReSend Code
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast("Cancelled action")} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                              <Ban className="w-4 h-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="py-16 flex flex-col items-center text-center">
                        <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">No onboarding employees found</p>
                        <p className="text-xs text-muted-foreground">Try adjusting your search</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center">
            <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">No onboarding employees available</p>
            <p className="text-xs text-muted-foreground">Add an employee to get started</p>
          </CardContent>
        </Card>
      )}

      <AddEmployeeModal open={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
};

export default OnboardingEmployees;