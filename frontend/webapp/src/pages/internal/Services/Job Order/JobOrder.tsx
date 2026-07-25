import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import DataToolbar, { FilterOption } from "@/components/DataToolbar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Pagination, usePagination } from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wrench, MoreVertical, Eye, Play, CircleCheck, XCircle, Clock } from "lucide-react";
import api from "@/api/axios";
import { toast } from "sonner";

/* TYPES */
interface JobOrderRow {
  id: string;
  jo_number: string;
  date: string;
  status: string;
  statusRecord: { name: string } | null;
  timer_status: string | null;
  timer_total_seconds: number;
  technicianName: string;
  technicians: { employee: { id: number; first_name: string; last_name: string } | null; role: string }[];
  technician: { id: number; first_name: string; last_name: string } | null;
  vehicle: { id: number; plate_number: string; year_model: string; make: string; model: string; variant: string } | null;
  salesOrder: { id: string; so_number: string } | null;
  services: { id: number; service_type: { name: string } | null; PriceAtSale: number }[];
}

const statusFilterOptions: FilterOption[] = [
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Pending", value: "Pending" },
      { label: "In Progress", value: "In Progress" },
      { label: "Completed", value: "Completed" },
      { label: "Cancelled", value: "Cancelled" },
    ],
  },
];

const formatTimerShort = (totalSeconds: number): string => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

/* COMPONENT */
const JobOrderList: React.FC = () => {
  const navigate = useNavigate();
  const [jobOrders, setJobOrders] = useState<JobOrderRow[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ status: "all" });

  const { page, setPage, pageSize, setPageSize } = usePagination(25);

  const fetchJobOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        search: search || undefined,
        status: filters.status === "all" ? undefined : filters.status,
        page,
        per_page: pageSize,
      };
      const res = await api.get("/job-orders", { params });
      const data = res.data;
      setJobOrders(Array.isArray(data.data) ? data.data : []);
      setTotalItems(data.total || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load job orders");
    } finally {
      setIsLoading(false);
    }
  }, [search, filters.status, page, pageSize]);

  useEffect(() => {
    fetchJobOrders();
  }, [fetchJobOrders]);

  useEffect(() => {
    setPage(1);
  }, [search, filters.status, setPage]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/job-orders/${id}/status`, { status: newStatus });
      toast.success(`Job order status updated to ${newStatus}`);
      fetchJobOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const renderActions = (jo: JobOrderRow) => {
    const status = jo.statusRecord?.name ?? "Pending";

    return (
      <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors outline-none">
              <MoreVertical size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 z-[100]">
            <DropdownMenuItem onClick={() => navigate(`/webapp/services/job-orders/${jo.id}`)} className="cursor-pointer">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>

            {status === "Pending" && (
              <DropdownMenuItem onClick={() => handleStatusChange(jo.id, "In Progress")} className="cursor-pointer">
                <Play className="w-4 h-4 mr-2" />
                Start Work
              </DropdownMenuItem>
            )}

            {status === "In Progress" && (
              <DropdownMenuItem onClick={() => handleStatusChange(jo.id, "Completed")} className="cursor-pointer text-green-700 dark:text-green-400 focus:bg-green-500/10">
                <CircleCheck className="w-4 h-4 mr-2" />
                Complete
              </DropdownMenuItem>
            )}

            {(status === "Pending" || status === "In Progress") && (
              <DropdownMenuItem onClick={() => handleStatusChange(jo.id, "Cancelled")} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                <XCircle className="w-4 h-4 mr-2" />
                Cancel
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden">
      <DataToolbar
        searchPlaceholder="Search job orders, technicians, plate number..."
        onSearch={setSearch}
        filters={statusFilterOptions}
        activeFilters={filters}
        onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        onAdd={() => navigate("/webapp/services/job-orders/new")}
        addLabel="New Job Order"
      />

      {isLoading ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl px-2 overflow-hidden bg-background">
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading job orders...</p>
          </div>
        </div>
      ) : jobOrders.length > 0 ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl overflow-hidden bg-background">
          <ScrollArea className="flex-1 px-3">
            <Table className="table-fixed w-full border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[18%] text-center">JO #</TableHead>
                  <TableHead className="w-[22%] text-center">Customer</TableHead>
                  <TableHead className="w-[18%] text-center">Technician</TableHead>
                  <TableHead className="w-[18%] text-center">Status</TableHead>
                  <TableHead className="w-[10%] text-center">Date</TableHead>
                  <TableHead className="w-[8%] text-right pr-6"></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {jobOrders.map((jo) => {
                  const needsAttention = jo.timer_status === "running"
                    || (jo.statusRecord?.name === "Pending" && !jo.technicianName);
                  const attentionClass = needsAttention
                    ? jo.timer_status === "running"
                      ? "ring-2 ring-green-500 animate-border-pulse-green"
                      : "ring-2 ring-amber-500 animate-border-pulse-amber"
                    : "border-border/60";
                  return (
                    <TableRow
                      key={jo.id}
                      onClick={() => navigate(`/webapp/services/job-orders/${jo.id}`)}
                      className={cn(
                        "cursor-pointer transition-all rounded-lg border border-border/60 bg-card shadow-sm hover:shadow-md hover:bg-accent/30",
                        attentionClass
                      )}
                    >
                    <TableCell className="py-2.5 text-left pl-8">
                      <span className="font-semibold text-sm font-mono">{jo.jo_number || `JO-${jo.id.substring(0, 8).toUpperCase()}`}</span>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {jo.vehicle ? `${jo.vehicle.year_model || ""} ${jo.vehicle.make || ""} ${jo.vehicle.model || ""}`.trim() || "—" : "—"}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {jo.technicianName || "Unassigned"}
                    </TableCell>
                    <TableCell className="text-center">
                      {needsAttention ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className={`inline-flex w-fit items-center rounded-md border px-2.5 py-1 text-xs font-medium ${
                              jo.statusRecord?.name === "In Progress" ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300" :
                              jo.statusRecord?.name === "Completed" ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" :
                              jo.statusRecord?.name === "Cancelled" ? "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300" :
                              "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                            }`}>
                              {jo.statusRecord?.name || "Pending"}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {jo.timer_status === "running" ? "Timer is running — work in progress" : "No technician assigned"}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className={`inline-flex w-fit items-center rounded-md border px-2.5 py-1 text-xs font-medium ${
                          jo.statusRecord?.name === "In Progress" ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300" :
                          jo.statusRecord?.name === "Completed" ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" :
                          jo.statusRecord?.name === "Cancelled" ? "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300" :
                          "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        }`}>
                          {jo.statusRecord?.name || "Pending"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground text-xs">
                      {new Date(jo.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </TableCell>
                    <TableCell className="text-right pr-4">{renderActions(jo)}</TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>

          {totalItems > pageSize && (
            <div className="border-t mx-3">
              <Pagination
                totalItems={totalItems}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl px-2 overflow-hidden bg-background">
          <div className="py-16 flex flex-col items-center text-center">
            <Wrench className="h-6 w-6 mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">No job orders found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobOrderList;
