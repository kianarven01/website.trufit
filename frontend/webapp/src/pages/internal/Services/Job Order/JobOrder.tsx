import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import DataToolbar, { FilterOption } from "@/components/DataToolbar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Badge } from "@/components/ui/badge";
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
import TableSkeleton from "@/components/ui/TableSkeleton";

/* TYPES */
interface JobOrderRow {
  id: string;
  jo_number: string;
  joNumber: string;
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

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Completed":
      return <Badge variant="approved">Completed</Badge>;
    case "In Progress":
      return <Badge variant="received">In Progress</Badge>;
    case "Pending":
      return <Badge variant="for-approval">Pending</Badge>;
    case "Cancelled":
      return <Badge variant="cancelled">Cancelled</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
};

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
        <div className="flex-1 flex flex-col justify-start py-4">
          <TableSkeleton columns={8} rows={8} />
        </div>
      ) : jobOrders.length > 0 ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl overflow-hidden bg-background">
          <ScrollArea className="flex-1 px-3">
            <Table className="table-fixed w-full min-w-[900px] border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-[12%]">JO #</TableHead>
                  <TableHead className="text-center w-[14%]">Date</TableHead>
                  <TableHead className="text-center w-[14%]">Plate No.</TableHead>
                  <TableHead className="text-center w-[16%]">Technician</TableHead>
                  <TableHead className="text-center w-[10%]">Timer</TableHead>
                  <TableHead className="text-center w-[14%]">Services</TableHead>
                  <TableHead className="text-center w-[12%]">Status</TableHead>
                  <TableHead className="text-center w-[8%]"></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {jobOrders.map((jo) => (
                  <TableRow
                    key={jo.id}
                    onClick={() => navigate(`/webapp/services/job-orders/${jo.id}`)}
                    className="cursor-pointer bg-card border rounded-lg hover:bg-accent/30 text-center"
                  >
                    <TableCell className="font-mono font-bold text-primary">
                      {jo.jo_number || jo.joNumber || `JO-${jo.id.substring(0, 8).toUpperCase()}`}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(jo.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {jo.vehicle?.plate_number ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                          {jo.vehicle.plate_number}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {jo.technicianName || "Unassigned"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`inline-block w-2 h-2 rounded-full ${jo.timer_status === "running" ? "bg-green-500 animate-pulse" : jo.timer_status === "paused" ? "bg-amber-500" : "bg-gray-300"}`} />
                        <span className={`text-xs font-mono ${jo.timer_status === "running" ? "text-green-600 font-bold" : jo.timer_status === "paused" ? "text-amber-600" : "text-muted-foreground"}`}>
                          {formatTimerShort(jo.timer_total_seconds || 0)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {jo.services?.length > 0
                        ? jo.services.map((s) => s.service_type?.name).filter(Boolean).join(", ")
                        : "—"}
                    </TableCell>
                    <TableCell>{getStatusBadge(jo.statusRecord?.name ?? "Pending")}</TableCell>
                    <TableCell>{renderActions(jo)}</TableCell>
                  </TableRow>
                ))}
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
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center">
            <Wrench className="h-8 w-8 mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">No job orders available</p>
            <p className="text-xs text-muted-foreground">
              Create a new job order to get started
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JobOrderList;
