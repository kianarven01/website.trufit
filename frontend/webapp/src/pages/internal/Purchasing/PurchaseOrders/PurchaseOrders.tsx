import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import NewPurchaseOrderModal from "@/components/purchasing/NewPurchaseOrderModal";
import PurchaseStatusBadge from "@/components/purchasing/PurchaseStatusBadge";
import { toast } from "sonner";
import { formatCurrency, formatDate, getCleanApiError, getRows, normalizeStatus, normalizePurchaseOrderRow, PurchaseOrderRow } from "@/components/purchasing/purchasingUtils";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import DataToolbar from "@/components/DataToolbar";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ImageIcon, MoreVertical, Eye, Send, Check, Trash2, XCircle, FileText, RefreshCw } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


const PO_FILTERS_CONFIG = [
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Draft", value: "DRAFT" },
      { label: "Submitted", value: "SUBMITTED" },
      { label: "Approved", value: "APPROVED" },
      { label: "Partially Received", value: "PARTIALLY_RECEIVED" },
      { label: "Received", value: "RECEIVED" },
      { label: "Cancelled", value: "CANCELLED" },
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

const PurchaseOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<PurchaseOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [showArchived, setShowArchived] = useState(false);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ order: PurchaseOrderRow; action: "submit" | "approve" | "cancel"; label: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<PurchaseOrderRow | null>(null);
  const [confirmForceDelete, setConfirmForceDelete] = useState<PurchaseOrderRow | null>(null);
  const { page, setPage, pageSize, setPageSize } = usePagination(25);
  const [totalItems, setTotalItems] = useState(0);

  const activeFilters = {
    status: activeFilter === "ALL" ? "all" : activeFilter,
    archived: showArchived ? "true" : "false",
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === "status") {
      setActiveFilter(value === "all" ? "ALL" : value);
      setPage(1);
    } else if (key === "archived") {
      setShowArchived(value === "true");
      setPage(1);
    }
  };

  const loadPurchaseOrders = async () => {
    setLoading(true);

    try {
      const response = await api.get("/purchasing/purchase-orders", {
        params: {
          page,
          per_page: pageSize,
          search: search || undefined,
          status: activeFilter !== "ALL" ? activeFilter : undefined,
          archived: showArchived ? "true" : undefined,
        },
      });
      const rows = getRows(response.data, ["purchase_orders", "purchaseOrders"]);
      setOrders(rows.flatMap((row) => { const o = normalizePurchaseOrderRow(row); return o.id ? [o] : []; }));
      setTotalItems(response.data?.pagination?.total ?? rows.length);
    } catch (error: any) {
      console.error(error);
      toast.error("Unable to load purchase orders", { description: getCleanApiError(error, "Failed to load purchase orders.") });
      setOrders([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPurchaseOrders();
  }, [page, pageSize, activeFilter, showArchived, search]);

  const runPoAction = async (order: PurchaseOrderRow, action: "submit" | "approve" | "cancel") => {
    const labels = {
      submit: "submitted",
      approve: "approved",
      cancel: "cancelled",
    };

    try {
      await api.post(`/purchasing/purchase-orders/${order.id}/${action}`);
      toast.success("Purchase order updated", { description: `${order.poNumber} was ${labels[action]} successfully.` });
      await loadPurchaseOrders();
    } catch (error: any) {
      console.error(error);
      toast.error("Unable to update purchase order", { description: getCleanApiError(error, "Failed to update purchase order.") });
    }
  };

  const archivePo = async (order: PurchaseOrderRow) => {
    try {
      await api.delete(`/purchasing/purchase-orders/${order.id}`);
      toast.success("Purchase order archived", { description: `${order.poNumber} was archived successfully.` });
      await loadPurchaseOrders();
    } catch (error: any) {
      console.error(error);
      toast.error("Unable to archive purchase order", { description: getCleanApiError(error, "Failed to archive purchase order.") });
    }
  };

  const handleRestore = async (order: PurchaseOrderRow) => {
    try {
      await api.patch(`/purchasing/purchase-orders/${order.id}/restore`);
      toast.success("Purchase order restored", { description: `${order.poNumber} has been restored.` });
      await loadPurchaseOrders();
    } catch (error: any) {
      console.error(error);
      toast.error("Unable to restore purchase order", { description: getCleanApiError(error, "Failed to restore purchase order.") });
    }
  };

  const handleForceDelete = async (order: PurchaseOrderRow) => {
    try {
      await api.delete(`/purchasing/purchase-orders/${order.id}/force`);
      toast.success("Purchase order deleted", { description: `${order.poNumber} was permanently deleted.` });
      await loadPurchaseOrders();
    } catch (error: any) {
      console.error(error);
      toast.error("Unable to permanently delete purchase order", { description: getCleanApiError(error, "Failed to permanently delete purchase order.") });
    }
  };

  const renderActions = (order: PurchaseOrderRow) => {
    const status = normalizeStatus(order.status);

    return (
      <div className="flex items-center justify-end" onClick={(event) => event.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors outline-none">
              <MoreVertical size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => navigate(`/webapp/purchasing/purchase-orders/${order.id}`)} className="cursor-pointer">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>

            {order.deletedAt ? (
              <>
                <DropdownMenuItem onClick={() => handleRestore(order)} className="cursor-pointer">
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
                {status === "DRAFT" && (
                  <>
                    <DropdownMenuItem onClick={() => setConfirmAction({ order, action: "submit", label: "submit" })} className="cursor-pointer">
                      <Send className="w-4 h-4 mr-2" />
                      Submit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setConfirmDelete(order)} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Archive PO
                    </DropdownMenuItem>
                  </>
                )}

                {status === "SUBMITTED" && (
                  <>
                    <DropdownMenuItem onClick={() => setConfirmAction({ order, action: "approve", label: "approve" })} className="cursor-pointer text-green-700 dark:text-green-400 focus:bg-green-500/10">
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setConfirmAction({ order, action: "cancel", label: "cancel" })} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel
                    </DropdownMenuItem>
                  </>
                )}

                {status === "CANCELLED" && (
                  <DropdownMenuItem onClick={() => setConfirmDelete(order)} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Archive PO
                  </DropdownMenuItem>
                )}

                {(status === "APPROVED" || status === "PARTIALLY_RECEIVED") && (
                  <DropdownMenuItem onClick={() => navigate(`/webapp/purchasing/purchase-orders/${order.id}`)} className="cursor-pointer text-amber-700 dark:text-amber-400 focus:bg-amber-500/10">
                    <FileText className="w-4 h-4 mr-2" />
                    Create Receipt
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
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden select-none bg-background text-foreground">
      {/* Toolbar */}
      <DataToolbar
        searchPlaceholder="Search PO number or supplier..."
        onSearch={(value) => { setSearch(value); setPage(1); }}
        onAdd={() => setIsCreateOpen(true)}
        addLabel="New PO"
        filters={PO_FILTERS_CONFIG}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
      />

      {/* Table Container */}
      {loading ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl px-2 overflow-hidden bg-background">
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">
              Loading purchase orders...
            </p>
          </div>
        </div>
      ) : orders.length > 0 ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl overflow-hidden bg-background">
          <ScrollArea className="flex-1 px-3">
            <Table className="table-fixed w-full border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[15%] text-center">PO Number</TableHead>
                  <TableHead className="w-[30%] text-center">Supplier</TableHead>
                  <TableHead className="w-[20%] text-center">Date</TableHead>
                  <TableHead className="w-[15%] text-center">Total</TableHead>
                  <TableHead className="w-[10%] text-center">Status</TableHead>
                  <TableHead className="w-[10%] text-right pr-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow
                    key={order.id}
                    onClick={() => navigate(`/webapp/purchasing/purchase-orders/${order.id}`)}
                    className={cn(
                      "cursor-pointer transition-all rounded-lg border border-border/60 bg-card shadow-sm hover:shadow-md",
                      "hover:bg-accent/30"
                    )}
                  >
                    <TableCell className="py-2.5 text-left pl-8">
                      <span className="font-semibold text-sm">{order.poNumber}</span>
                    </TableCell>
                    <TableCell className="text-center font-medium">{order.supplierName}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{formatDate(order.orderDate)}</TableCell>
                    <TableCell className="text-center font-semibold text-foreground">
                      {["CLOSED", "RETURNED", "COMPLETED"].includes(order.status)
                        ? formatCurrency(order.receivedAmount)
                        : formatCurrency(order.totalAmount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <PurchaseStatusBadge status={order.status} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-4">{renderActions(order)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          <div className="border-t mx-3">
            <Pagination
              totalItems={totalItems}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl px-2 overflow-hidden bg-background">
          <div className="py-16 flex flex-col items-center text-center">
            <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">No purchase orders found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => { if (!open) setConfirmAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm {confirmAction?.label}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmAction?.action} {confirmAction?.order.poNumber}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={confirmAction?.action === "cancel" ? "bg-destructive text-white hover:bg-destructive/90" : "bg-blue-600 text-white hover:bg-blue-700"}
              onClick={() => { if (confirmAction) void runPoAction(confirmAction.order, confirmAction.action); setConfirmAction(null); }}
            >
              {confirmAction?.label === "submit" ? "Submit" : confirmAction?.action === "approve" ? "Approve" : confirmAction?.action === "cancel" ? "Cancel" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => { if (!open) setConfirmDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Purchase Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive {confirmDelete?.poNumber}? It will be hidden from the active list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => { if (confirmDelete) void archivePo(confirmDelete); setConfirmDelete(null); }}
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
            <AlertDialogTitle>Permanently Delete Purchase Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete {confirmForceDelete?.poNumber}? This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => { if (confirmForceDelete) void handleForceDelete(confirmForceDelete); setConfirmForceDelete(null); }}
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New PO Modal */}
      <NewPurchaseOrderModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSaved={async () => {
          toast.success("Purchase order created", { description: "The purchase order was saved as draft." });
          await loadPurchaseOrders();
        }}
        onError={(message) => toast.error("Unable to save purchase order", { description: message })}
      />
    </div>
  );
};

export default PurchaseOrders;
