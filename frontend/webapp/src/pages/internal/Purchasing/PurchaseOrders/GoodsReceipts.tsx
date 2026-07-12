import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import CreateGoodsReceiptModal, { ReceiptPurchaseOrder } from "@/components/purchasing/CreateGoodsReceiptModal";
import PurchaseStatusBadge from "@/components/purchasing/PurchaseStatusBadge";
import { toast } from "sonner";
import { formatDate, getCleanApiError, getRows, getApprovedReceivedQuantity, normalizeStatus, normalizeGoodsReceiptRow, GoodsReceiptRow } from "@/components/purchasing/purchasingUtils";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import DataToolbar from "@/components/DataToolbar";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ImageIcon, MoreVertical, Eye, Check, Trash2, XCircle, RefreshCw } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const normalizePurchaseOrderForReceipt = (row: any): ReceiptPurchaseOrder => {
  const itemsRaw = Array.isArray(row.items) ? row.items : [];

  return {
    id: String(row.id ?? ""),
    poNumber: String(row.po_number ?? row.poNumber ?? row.id ?? "-"),
    supplierName: String(row.supplier?.name ?? row.supplier?.CompanyName ?? row.supplier_name ?? "-"),
    status: normalizeStatus(row.status),
    items: itemsRaw.map((item: any) => {
      const product = item.product || {};
      const quantityOrdered = Number(item.quantity_ordered ?? item.quantityOrdered ?? 0);
      const quantityReceived = Number(item.quantity_received ?? item.quantityReceived ?? getApprovedReceivedQuantity(item));

      return {
        id: String(item.id ?? ""),
        productId: String(item.product_id ?? item.productId ?? product.id ?? ""),
        productName: String(product.name ?? item.product_name ?? item.productName ?? "Unnamed Product"),
        productSupplierId: String(item.product_supplier_id ?? item.productSupplierId ?? ""),
        quantityOrdered,
        quantityReceived,
      };
    }),
  };
};

const GR_FILTERS_CONFIG = [
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Draft", value: "DRAFT" },
      { label: "Approved", value: "APPROVED" },
      { label: "Return Requested", value: "RETURN_REQUESTED" },
      { label: "Partially Returned", value: "PARTIALLY_RETURNED" },
      { label: "Returned", value: "RETURNED" },
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

const GoodsReceipts = () => {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState<GoodsReceiptRow[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<ReceiptPurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmApprove, setConfirmApprove] = useState<GoodsReceiptRow | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<GoodsReceiptRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<GoodsReceiptRow | null>(null);
  const [confirmForceDelete, setConfirmForceDelete] = useState<GoodsReceiptRow | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const { page, setPage, pageSize, setPageSize } = usePagination(25);
  const [totalItems, setTotalItems] = useState(0);
  const [activeFilter, setActiveFilter] = useState("ALL");

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

  const loadGoodsReceipts = async () => {
    setLoading(true);

    try {
      const response = await api.get("/purchasing/goods-receipts", {
        params: {
          page,
          per_page: pageSize,
          search: search || undefined,
          status: activeFilter !== "ALL" ? activeFilter : undefined,
          archived: showArchived ? "true" : undefined,
        },
      });
      const rows = getRows(response.data, ["goods_receipts", "goodsReceipts"]);
      setReceipts(rows.flatMap((row) => { const r = normalizeGoodsReceiptRow(row); return r.id ? [r] : []; }));
      setTotalItems(response.data?.pagination?.total ?? rows.length);
    } catch (error: any) {
      console.error(error);
      toast.error("Unable to load goods receipts", { description: getCleanApiError(error, "Failed to load goods receipts.") });
      setReceipts([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const loadReceivablePurchaseOrders = async () => {
    try {
      const response = await api.get("/purchasing/purchase-orders");
      const rows = getRows(response.data, ["purchase_orders", "purchaseOrders"]);
      setPurchaseOrders(
        rows.flatMap((row) => {
          const po = normalizePurchaseOrderForReceipt(row);
          return ["WAITING_TO_RECEIVE", "PARTIALLY_RECEIVED"].includes(normalizeStatus(po.status)) ? [po] : [];
        })
      );
    } catch (error) {
      console.error(error);
      setPurchaseOrders([]);
    }
  };

  useEffect(() => {
    void loadGoodsReceipts();
    void loadReceivablePurchaseOrders();
  }, [page, pageSize, search, activeFilter, showArchived]);

  const approveReceipt = async (receipt: GoodsReceiptRow) => {
    try {
      await api.post(`/purchasing/goods-receipts/${receipt.id}/approve`);
      toast.success("Goods receipt approved", { description: `${receipt.receiptNumber} was approved and inventory was updated.` });
      await loadGoodsReceipts();
      await loadReceivablePurchaseOrders();
    } catch (error: any) {
      console.error(error);
      toast.error("Unable to approve receipt", { description: getCleanApiError(error, "Failed to approve goods receipt.") });
    }
  };

  const cancelReceipt = async (receipt: GoodsReceiptRow) => {
    try {
      await api.post(`/purchasing/goods-receipts/${receipt.id}/cancel`);
      toast.success("Goods receipt cancelled", { description: `${receipt.receiptNumber} was cancelled.` });
      await loadGoodsReceipts();
    } catch (error: any) {
      console.error(error);
      toast.error("Unable to cancel receipt", { description: getCleanApiError(error, "Failed to cancel goods receipt.") });
    }
  };

  const archiveReceipt = async (receipt: GoodsReceiptRow) => {
    try {
      await api.delete(`/purchasing/goods-receipts/${receipt.id}`);
      toast.success("Goods receipt archived", { description: `${receipt.receiptNumber} was archived successfully.` });
      await loadGoodsReceipts();
      await loadReceivablePurchaseOrders();
    } catch (error: any) {
      console.error(error);
      toast.error("Unable to archive goods receipt", { description: getCleanApiError(error, "Failed to archive goods receipt.") });
    }
  };

  const handleRestore = async (receipt: GoodsReceiptRow) => {
    try {
      await api.patch(`/purchasing/goods-receipts/${receipt.id}/restore`);
      toast.success("Goods receipt restored", { description: `${receipt.receiptNumber} has been restored.` });
      await loadGoodsReceipts();
    } catch (error: any) {
      console.error(error);
      toast.error("Unable to restore goods receipt", { description: getCleanApiError(error, "Failed to restore goods receipt.") });
    }
  };

  const handleForceDelete = async (receipt: GoodsReceiptRow) => {
    try {
      await api.delete(`/purchasing/goods-receipts/${receipt.id}/force`);
      toast.success("Goods receipt deleted", { description: `${receipt.receiptNumber} was permanently deleted.` });
      await loadGoodsReceipts();
      await loadReceivablePurchaseOrders();
    } catch (error: any) {
      console.error(error);
      toast.error("Unable to permanently delete goods receipt", { description: getCleanApiError(error, "Failed to permanently delete goods receipt.") });
    }
  };

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden select-none bg-background text-foreground">

      {/* Toolbar */}
      <DataToolbar
        searchPlaceholder="Search receipt, PO, or supplier..."
        onSearch={(value) => { setSearch(value); setPage(1); }}
        onAdd={() => setModalOpen(true)}
        addLabel="Receive Delivery"
        addButtonClassName="bg-amber-500 hover:bg-amber-600 text-white"
        filters={GR_FILTERS_CONFIG}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
      />

      {/* Table Container */}
      {loading ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl px-2 overflow-hidden bg-background">
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">
              Loading goods receipts...
            </p>
          </div>
        </div>
      ) : receipts.length > 0 ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl overflow-hidden bg-background">
          <ScrollArea className="flex-1 px-3">
            <Table className="table-fixed w-full border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[15%] text-center">Receipt #</TableHead>
                  <TableHead className="w-[15%] text-center">PO Number</TableHead>
                  <TableHead className="w-[25%] text-center">Supplier</TableHead>
                  <TableHead className="w-[15%] text-center">Date</TableHead>
                  <TableHead className="w-[12%] text-center">Status</TableHead>
                  <TableHead className="w-[13%] text-center">Notes</TableHead>
                  <TableHead className="w-[10%] text-right pr-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow
                    key={receipt.id}
                    onClick={() => navigate(`/webapp/purchasing/goods-receipts/${receipt.id}`)}
                    className={cn(
                      "cursor-pointer transition-all rounded-lg border border-border/60 bg-card shadow-sm hover:shadow-md",
                      "hover:bg-accent/30"
                    )}
                  >
                    <TableCell className="py-2.5 text-left pl-8">
                      <span className="font-semibold text-sm">{receipt.receiptNumber}</span>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">{receipt.poNumber}</TableCell>
                    <TableCell className="text-center font-medium">{receipt.supplierName}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{formatDate(receipt.receivedAt)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <PurchaseStatusBadge status={receipt.status} />
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground max-w-[150px] truncate">{receipt.notes || "-"}</TableCell>
                    <TableCell className="text-right pr-4" onClick={(event) => event.stopPropagation()}>
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button type="button" className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors outline-none">
                              <MoreVertical size={16} />
                            </button>
                          </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => navigate(`/webapp/purchasing/goods-receipts/${receipt.id}`)} className="cursor-pointer">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>

                          {receipt.deletedAt ? (
                            <>
                              <DropdownMenuItem onClick={() => handleRestore(receipt)} className="cursor-pointer">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Restore
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setConfirmForceDelete(receipt)} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Permanently
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <>
                              {normalizeStatus(receipt.status) === "DRAFT" && (
                                <>
                                  <DropdownMenuItem onClick={() => setConfirmApprove(receipt)} className="cursor-pointer text-green-700 dark:text-green-400 focus:bg-green-500/10">
                                    <Check className="w-4 h-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setConfirmCancel(receipt)} className="cursor-pointer text-amber-700 dark:text-amber-400 focus:bg-amber-500/10">
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancel
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setConfirmDelete(receipt)} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Archive GR
                                  </DropdownMenuItem>
                                </>
                              )}

                              {normalizeStatus(receipt.status) === "CANCELLED" && (
                                <DropdownMenuItem onClick={() => setConfirmDelete(receipt)} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Archive GR
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
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
            <p className="text-sm font-medium">No goods receipts found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search</p>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmApprove} onOpenChange={(open) => { if (!open) setConfirmApprove(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Goods Receipt</AlertDialogTitle>
            <AlertDialogDescription>
              This will update inventory and record stock movements. Are you sure you want to approve {confirmApprove?.receiptNumber}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-green-600 text-white hover:bg-green-700" onClick={() => { if (confirmApprove) void approveReceipt(confirmApprove); setConfirmApprove(null); }}>
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => { if (!open) setConfirmDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Goods Receipt</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive {confirmDelete?.receiptNumber}? It will be hidden from the active list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => { if (confirmDelete) void archiveReceipt(confirmDelete); setConfirmDelete(null); }}
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
            <AlertDialogTitle>Permanently Delete Goods Receipt</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete {confirmForceDelete?.receiptNumber}? This action is permanent and cannot be undone.
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

      {/* Cancel Dialog */}
      <AlertDialog open={!!confirmCancel} onOpenChange={(open) => { if (!open) setConfirmCancel(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Goods Receipt</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel {confirmCancel?.receiptNumber}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => { if (confirmCancel) void cancelReceipt(confirmCancel); setConfirmCancel(null); }}
            >
              Cancel Receipt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Modal */}
      <CreateGoodsReceiptModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        purchaseOrders={purchaseOrders}
        onSaved={async () => {
          toast.success("Goods receipt saved", { description: "The goods receipt was saved successfully." });
          await loadGoodsReceipts();
          await loadReceivablePurchaseOrders();
        }}
        onError={(message) => toast.error("Unable to save goods receipt", { description: message })}
      />
    </div>
  );
};

export default GoodsReceipts;
