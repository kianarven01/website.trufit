import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DataToolbar from "@/components/DataToolbar";
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
import {
  Inbox,
  MoreVertical,
  Eye,
  Send,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  RefreshCw,
  Play,
  CircleCheck,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/api/axios";
import { FilterOption } from "@/components/DataToolbar";

/* TYPES */
interface SalesOrder {
  id: string;
  so_number: string;
  status: string;
  type: string;
  customerName: string;
  plateNo: string;
  itemCount: number;
  total: number;
  createdAt: string;
  deletedAt?: string | null;
  hasUnissuedItems?: boolean;
  billing_statement?: { id: string; bill_number?: string; status?: string } | null;
}

const statusConfig: Record<string, { label: string; variant: any }> = {
  DRAFT: { label: "Draft", variant: "default" as const },
  SUBMITTED: { label: "Submitted", variant: "outline" as const },
  APPROVED: { label: "Approved", variant: "approved" as const },
  IN_PROGRESS: { label: "In Progress", variant: "received" as const },
  COMPLETED: { label: "Completed", variant: "approved" as const },
  CANCELLED: { label: "Cancelled", variant: "cancelled" as const },
};

const ALL_STATUSES = ["DRAFT", "SUBMITTED", "APPROVED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

const SO_FILTERS_CONFIG: FilterOption[] = [
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Draft", value: "DRAFT" },
      { label: "Submitted", value: "SUBMITTED" },
      { label: "Approved", value: "APPROVED" },
      { label: "In Progress", value: "IN_PROGRESS" },
      { label: "Completed", value: "COMPLETED" },
      { label: "Cancelled", value: "CANCELLED" },
    ],
  },
  {
    key: "type",
    label: "Type",
    options: [
      { label: "Counter Sale", value: "COUNTER" },
      { label: "Repair Order", value: "REPAIR" },
    ],
  },
  {
    key: "archived",
    label: "Archived",
    options: [
      { label: "Show Archived", value: "true" },
      { label: "Hide Archived", value: "false" },
    ],
  },
];

const SalesOrderList: React.FC = () => {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [showArchived, setShowArchived] = useState(false);
  const [paginationData, setPaginationData] = useState({
    total: 0,
    per_page: 25,
    current_page: 1,
    last_page: 1,
  });
  const [confirmDelete, setConfirmDelete] = useState<SalesOrder | null>(null);
  const [confirmForceDelete, setConfirmForceDelete] = useState<SalesOrder | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ order: SalesOrder; action: string; label: string; className?: string } | null>(null);
  const navigate = useNavigate();

  const { page, setPage, pageSize, setPageSize } = usePagination(25);

  const activeFilters = {
    status: activeFilter === "ALL" ? "all" : activeFilter,
    type: typeFilter === "ALL" ? "all" : typeFilter,
    archived: showArchived ? "true" : "false",
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === "status") {
      setActiveFilter(value === "all" ? "ALL" : value);
      setPage(1);
    } else if (key === "type") {
      setTypeFilter(value === "all" ? "ALL" : value);
      setPage(1);
    } else if (key === "archived") {
      setShowArchived(value === "true");
      setPage(1);
    }
  };

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.set("per_page", String(pageSize));
      params.set("page", String(page));
      if (search) params.set("search", search);
      if (activeFilter !== "ALL") params.set("status", activeFilter);
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      if (showArchived) params.set("archived", "true");

      const res = await api.get(`/sales-orders?${params.toString()}`);
      const data = res.data.data || [];
      const pagination = res.data.pagination;

      const normalized: SalesOrder[] = data.map((o: any) => {
        const items = Array.isArray(o.items) ? o.items : [];
        const hasUnissuedItems = o.Status === "IN_PROGRESS" && items.some((i: any) => !i.is_issued && !i.needs_ordering);

        return {
          id: o.id,
          so_number: o.so_number || o.id.substring(0, 8).toUpperCase(),
          status: o.Status || "DRAFT",
          type: o.type || "COUNTER",
          customerName: o.customer
            ? `${o.customer.first_name || ""} ${o.customer.last_name || ""}`.trim() || "—"
            : "—",
          plateNo: o.vehicle?.plate_number || "—",
          itemCount: items.length,
          total: Number(o.Total) || 0,
          createdAt: o.created_at,
          deletedAt: o.deleted_at,
          hasUnissuedItems,
          billing_statement: o.billing_statement ? {
            id: o.billing_statement.id,
            bill_number: o.billing_statement.bill_number,
            status: o.billing_statement.status,
          } : null,
        };
      });

      setOrders(normalized);
      if (pagination) {
        setPaginationData(pagination);
      }
    } catch (err) {
      console.error("Failed to load Sales Orders", err);
      toast.error("Failed to load Sales Orders");
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, activeFilter, typeFilter, showArchived]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const runAction = async (order: SalesOrder, action: string) => {
    try {
      await api.post(`/sales-orders/${order.id}/${action}`);
      const messages: Record<string, string> = {
        submit: "Sales Order submitted for approval.",
        approve: "Sales Order approved & stock reserved.",
        cancel: "Sales Order cancelled.",
        "start-work": "Sales Order work started.",
        complete: "Sales Order completed.",
        reopen: "Sales Order reopened.",
      };
      toast.success(messages[action] || "Action completed.");
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${action} Sales Order`);
    }
  };

  const archiveOrder = async (order: SalesOrder) => {
    try {
      await api.delete(`/sales-orders/${order.id}`);
      toast.success("Sales Order archived.");
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to archive Sales Order");
    }
  };

  const restoreOrder = async (order: SalesOrder) => {
    try {
      await api.patch(`/sales-orders/${order.id}/restore`);
      toast.success("Sales Order restored.");
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to restore Sales Order");
    }
  };

  const forceDeleteOrder = async (order: SalesOrder) => {
    try {
      await api.delete(`/sales-orders/${order.id}/force`);
      toast.success("Sales Order permanently deleted.");
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete Sales Order");
    }
  };

  const renderActions = (order: SalesOrder) => {
    return (
      <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors outline-none">
              <MoreVertical size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 z-[100]">
            <DropdownMenuItem onClick={() => navigate(`/webapp/sales/sales-orders/${order.id}`)} className="cursor-pointer">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>

            {order.deletedAt ? (
              <>
                <DropdownMenuItem onClick={() => restoreOrder(order)} className="cursor-pointer">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Restore
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setConfirmForceDelete(order)} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Permanently
                </DropdownMenuItem>
              </>
            ) : (
              <>
                {order.status === "DRAFT" && (
                  <>
                    <DropdownMenuItem onClick={() => navigate(`/webapp/sales/sales-orders/${order.id}/edit`)} className="cursor-pointer">
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setConfirmAction({ order, action: "submit", label: "Submit" })} className="cursor-pointer">
                      <Send className="w-4 h-4 mr-2" />
                      Submit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setConfirmDelete(order)} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Archive SO
                    </DropdownMenuItem>
                  </>
                )}

                {order.status === "SUBMITTED" && (
                  <>
                    <DropdownMenuItem onClick={() => setConfirmAction({ order, action: "approve", label: "Approve", className: "bg-green-600 text-white hover:bg-green-700" })} className="cursor-pointer text-green-700 dark:text-green-400 focus:bg-green-500/10">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setConfirmAction({ order, action: "cancel", label: "Cancel Order", className: "bg-destructive text-white hover:bg-destructive/90" })} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel
                    </DropdownMenuItem>
                  </>
                )}

                {order.status === "APPROVED" && order.type !== "COUNTER" && (
                  <>
                    <DropdownMenuItem onClick={() => setConfirmAction({ order, action: "start-work", label: "Start Work" })} className="cursor-pointer">
                      <Play className="w-4 h-4 mr-2" />
                      Start Work
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setConfirmAction({ order, action: "cancel", label: "Cancel Order", className: "bg-destructive text-white hover:bg-destructive/90" })} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel
                    </DropdownMenuItem>
                  </>
                )}

                {order.status === "APPROVED" && order.type === "COUNTER" && (
                  <DropdownMenuItem onClick={() => setConfirmAction({ order, action: "cancel", label: "Cancel Order", className: "bg-destructive text-white hover:bg-destructive/90" })} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel
                  </DropdownMenuItem>
                )}

                {order.status === "IN_PROGRESS" && order.type !== "COUNTER" && (
                  <>
                    <DropdownMenuItem onClick={() => setConfirmAction({ order, action: "complete", label: "Complete", className: "bg-amber-600 text-white hover:bg-amber-700" })} className="cursor-pointer">
                      <CircleCheck className="w-4 h-4 mr-2" />
                      Complete
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setConfirmAction({ order, action: "cancel", label: "Cancel Order", className: "bg-destructive text-white hover:bg-destructive/90" })} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel
                    </DropdownMenuItem>
                  </>
                )}

                {order.status === "COMPLETED" && order.type !== "COUNTER" && (
                  <>
                    <DropdownMenuItem onClick={() => setConfirmAction({ order, action: "reopen", label: "Reopen" })} className="cursor-pointer">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reopen
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setConfirmDelete(order)} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Archive SO
                    </DropdownMenuItem>
                  </>
                )}

                {order.status === "CANCELLED" && (
                  <DropdownMenuItem onClick={() => setConfirmDelete(order)} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Archive SO
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden">
      <DataToolbar
        searchPlaceholder="Search sales orders..."
        onSearch={(value) => { setSearch(value); setPage(1); }}
        onAdd={() => navigate("/webapp/sales/sales-orders/create")}
        addLabel="Create Order"
        filters={SO_FILTERS_CONFIG}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
      />

      {isLoading ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl px-2 overflow-hidden bg-background">
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading sales orders...</p>
          </div>
        </div>
      ) : orders.length > 0 ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl overflow-hidden bg-background">
          <ScrollArea className="flex-1 px-3">
            <Table className="table-fixed w-full border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[18%] text-center">SO #</TableHead>
                  <TableHead className="w-[28%] text-center">Customer</TableHead>
                  <TableHead className="w-[18%] text-center">Total</TableHead>
                  <TableHead className="w-[18%] text-center">Status</TableHead>
                  <TableHead className="w-[10%] text-center">Date</TableHead>
                  <TableHead className="w-[8%] text-right pr-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => {
                  const statusLabel = statusConfig[o.status]?.label || o.status;
                  const isCounter = o.type === "COUNTER";
                  return (
                    <TableRow
                      key={o.id}
                      onClick={() => navigate(`/webapp/sales/sales-orders/${o.id}`)}
                      className="cursor-pointer transition-all rounded-lg border border-border/60 bg-card shadow-sm hover:shadow-md hover:bg-accent/30"
                    >
                      <TableCell className="py-2.5 text-left pl-8">
                        <span className="font-semibold text-sm font-mono">{o.so_number}</span>
                        <span className="text-[10px] text-muted-foreground ml-1.5">{isCounter ? "Counter" : "Repair"}</span>
                      </TableCell>
                      <TableCell className="text-center font-medium">{o.customerName}</TableCell>
                      <TableCell className="text-center font-semibold text-foreground">
                        ₱{o.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <span className={`inline-flex w-fit items-center rounded-md border px-2.5 py-1 text-xs font-medium ${
                            o.status === "APPROVED" ? "border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300" :
                            o.status === "IN_PROGRESS" ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300" :
                            o.status === "COMPLETED" ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" :
                            o.status === "CANCELLED" ? "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300" :
                            o.status === "SUBMITTED" ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" :
                            "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          }`}>
                            {statusLabel}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground text-xs">
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      </TableCell>
                      <TableCell className="text-right pr-4">{renderActions(o)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>

          {paginationData.total > paginationData.per_page && (
            <div className="border-t mx-3">
              <Pagination
                totalItems={paginationData.total}
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
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <Inbox className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">No sales orders found</p>
            {showArchived && <p className="text-xs text-muted-foreground mt-1">No archived sales orders</p>}
          </div>
        </div>
      )}

      {/* Action Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => { if (!open) setConfirmAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm {confirmAction?.label}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmAction?.action} this Sales Order?
              {confirmAction?.action === "approve" && " This will reserve inventory stock."}
              {confirmAction?.action === "cancel" && " Reserved stock will be released."}
              {confirmAction?.action === "complete" && " This marks the order as completed."}
              {confirmAction?.action === "reopen" && " This will return the order to In Progress."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={confirmAction?.className || "bg-blue-600 text-white hover:bg-blue-700"}
              onClick={() => { if (confirmAction) void runAction(confirmAction.order, confirmAction.action); setConfirmAction(null); }}
            >
              {confirmAction?.label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Dialog */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => { if (!open) setConfirmDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Sales Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive {confirmDelete?.so_number}? It will be hidden from the active list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => { if (confirmDelete) void archiveOrder(confirmDelete); setConfirmDelete(null); }}
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Force Delete Dialog */}
      <AlertDialog open={!!confirmForceDelete} onOpenChange={(open) => { if (!open) setConfirmForceDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Sales Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete {confirmForceDelete?.so_number}? This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => { if (confirmForceDelete) void forceDeleteOrder(confirmForceDelete); setConfirmForceDelete(null); }}
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SalesOrderList;
