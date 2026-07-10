import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import NewPurchaseOrderModal from "@/components/purchasing/NewPurchaseOrderModal";
import PurchaseStatusBadge from "@/components/purchasing/PurchaseStatusBadge";
import PurchasingToast, { PurchasingToastType } from "@/components/purchasing/PurchasingToast";
import { formatCurrency, formatDate, getCleanApiError, getRows, normalizeStatus } from "@/components/purchasing/purchasingUtils";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import DataToolbar from "@/components/DataToolbar";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ImageIcon, MoreVertical, Eye, Send, Check, Trash2, XCircle, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface PurchaseOrderRow {
  id: string;
  poNumber: string;
  supplierName: string;
  orderDate: string | null;
  expectedDelivery: string | null;
  totalAmount: number;
  status: string;
}

const filterTabs = [
  { label: "All", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Approved", value: "APPROVED" },
  { label: "Partially Received", value: "PARTIALLY_RECEIVED" },
  { label: "Received", value: "RECEIVED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const normalizePurchaseOrder = (row: any): PurchaseOrderRow => ({
  id: String(row.id ?? ""),
  poNumber: String(row.po_number ?? row.poNumber ?? row.id ?? "-"),
  supplierName: String(
    row.supplier?.name ??
      row.supplier?.CompanyName ??
      row.supplier_name ??
      row.supplierName ??
      "-"
  ),
  orderDate: row.order_date ?? row.orderDate ?? row.created_at ?? null,
  expectedDelivery: row.request_ship_date ?? row.expected_delivery_date ?? row.eta ?? null,
  totalAmount: Number(row.total_amount ?? row.totalAmount ?? row.total ?? 0),
  status: normalizeStatus(row.status),
});

const PurchaseOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<PurchaseOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ order: PurchaseOrderRow; action: "submit" | "approve" | "cancel"; label: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<PurchaseOrderRow | null>(null);
  const [toast, setToast] = useState<{
    type: PurchasingToastType;
    title: string;
    message: string;
  } | null>(null);

  const { page, setPage, pageSize, setPageSize } = usePagination(25);
  const [totalItems, setTotalItems] = useState(0);

  const showToast = (type: PurchasingToastType, title: string, message: string) => {
    setToast({ type, title, message });
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
        },
      });
      const rows = getRows(response.data, ["purchase_orders", "purchaseOrders"]);
      setOrders(rows.map(normalizePurchaseOrder).filter((order) => order.id));
      setTotalItems(response.data?.pagination?.total ?? rows.length);
    } catch (error: any) {
      console.error(error);
      showToast("error", "Unable to load purchase orders", getCleanApiError(error, "Failed to load purchase orders."));
      setOrders([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPurchaseOrders();
  }, [page, pageSize, activeFilter, search]);

  const runPoAction = async (order: PurchaseOrderRow, action: "submit" | "approve" | "cancel") => {
    const labels = {
      submit: "submitted",
      approve: "approved",
      cancel: "cancelled",
    };

    try {
      await api.post(`/purchasing/purchase-orders/${order.id}/${action}`);
      showToast("success", "Purchase order updated", `${order.poNumber} was ${labels[action]} successfully.`);
      await loadPurchaseOrders();
    } catch (error: any) {
      console.error(error);
      showToast("error", "Unable to update purchase order", getCleanApiError(error, "Failed to update purchase order."));
    }
  };

  const deletePo = async (order: PurchaseOrderRow) => {
    try {
      await api.delete(`/purchasing/purchase-orders/${order.id}`);
      showToast("success", "Purchase order deleted", `${order.poNumber} was deleted successfully.`);
      await loadPurchaseOrders();
    } catch (error: any) {
      console.error(error);
      showToast("error", "Unable to delete purchase order", getCleanApiError(error, "Failed to delete purchase order."));
    }
  };

  const renderActions = (order: PurchaseOrderRow) => {
    const status = normalizeStatus(order.status);

    return (
      <div className="flex items-center justify-end" onClick={(event) => event.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors outline-none">
              <MoreVertical size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => navigate(`/webapp/purchasing/purchase-orders/${order.id}`)} className="cursor-pointer">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>

            {status === "DRAFT" && (
              <>
                <DropdownMenuItem onClick={() => setConfirmAction({ order, action: "submit", label: "submit" })} className="cursor-pointer">
                  <Send className="w-4 h-4 mr-2" />
                  Submit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setConfirmDelete(order)} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
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

            {(status === "APPROVED" || status === "PARTIALLY_RECEIVED") && (
              <DropdownMenuItem onClick={() => navigate(`/webapp/purchasing/purchase-orders/${order.id}`)} className="cursor-pointer text-amber-700 dark:text-amber-400 focus:bg-amber-500/10">
                <FileText className="w-4 h-4 mr-2" />
                Create Receipt
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden select-none bg-background text-foreground">
      {toast && (
        <PurchasingToast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={4000}
          onClose={() => setToast(null)}
        />
      )}

      {/* Toolbar */}
      <DataToolbar
        searchPlaceholder="Search PO number or supplier..."
        onSearch={(value) => { setSearch(value); setPage(1); }}
        onAdd={() => setIsCreateOpen(true)}
        addLabel="New PO"
      />

      {/* Filters Pill Bar */}
      <div className="flex flex-wrap items-center bg-card/60 backdrop-blur-md border border-border/40 rounded-xl p-1 w-fit gap-1 shadow-sm">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={cn(
              "px-4 py-1.5 text-xs font-semibold rounded-lg transition",
              activeFilter === tab.value
                ? "bg-blue-600 dark:bg-blue-700 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => { setActiveFilter(tab.value); setPage(1); }}
          >
            {tab.label}
          </button>
        ))}
      </div>

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
                    <TableCell className="text-center font-semibold text-foreground">{formatCurrency(order.totalAmount)}</TableCell>
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
            <AlertDialogTitle>Delete Purchase Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {confirmDelete?.poNumber}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => { if (confirmDelete) void deletePo(confirmDelete); setConfirmDelete(null); }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New PO Modal */}
      <NewPurchaseOrderModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSaved={async () => {
          showToast("success", "Purchase order created", "The purchase order was saved as draft.");
          await loadPurchaseOrders();
        }}
        onError={(message) => showToast("error", "Unable to save purchase order", message)}
      />
    </div>
  );
};

export default PurchaseOrders;
