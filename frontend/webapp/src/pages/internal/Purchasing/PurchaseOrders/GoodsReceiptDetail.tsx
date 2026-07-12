import { useEffect, useMemo, useState, useCallback } from "react";
import { ArrowLeft, MoreVertical, Pencil, Printer, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/axios";
import GoodsReceiptItemsTable, { GoodsReceiptItemRow } from "@/components/purchasing/GoodsReceiptItemsTable";
import PurchaseStatusBadge from "@/components/purchasing/PurchaseStatusBadge";
import { toast } from "sonner";
import { formatDate, getCleanApiError, normalizeStatus } from "@/components/purchasing/purchasingUtils";
import DetailSkeleton from "@/components/ui/DetailSkeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReturnItemsModal from "@/components/purchasing/ReturnItemsModal";
import CreateGoodsReceiptModal from "@/components/purchasing/CreateGoodsReceiptModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface GoodsReceiptDetailModel {
  id: string;
  receiptNumber: string;
  poNumber: string;
  purchaseOrderId: string;
  supplierName: string;
  receivedAt: string | null;
  approvedAt: string | null;
  status: string;
  notes?: string | null;
  createdByName: string | null;
  receivedByName: string | null;
  approvedByName: string | null;
  returnedByName: string | null;
  cancelledByName: string | null;
  returnRequestedByName: string | null;
  returnRequestItems: Array<{
    goods_receipt_item_id: string;
    quantity_returned: number;
    notes: string | null;
  }> | null;
  returnRequestedAt: string | null;
  items: GoodsReceiptItemRow[];
  purchaseOrder?: any | null;
}

const normalizeGoodsReceipt = (row: any): GoodsReceiptDetailModel => {
  const itemsRaw = Array.isArray(row.items) ? row.items : [];
  const poRaw = row.purchase_order || row.purchaseOrder || null;

  const purchaseOrderMapped = poRaw ? {
    id: String(poRaw.id ?? ""),
    poNumber: String(poRaw.po_number ?? poRaw.poNumber ?? ""),
    supplierName: String(poRaw.supplier?.name ?? poRaw.supplier?.CompanyName ?? ""),
    status: normalizeStatus(poRaw.status),
    items: (poRaw.items || []).map((item: any) => {
      const product = item.product || {};
      const manufacturer = product.manufacturer?.name || product.manufacturer || product.manufacturer_name || "";
      const manufacturerStr = manufacturer ? ` — ${manufacturer}` : "";
      const productName = `${String(product.name ?? item.product_name ?? item.productName ?? "Unnamed Product")}${manufacturerStr}`;

      const quantityReceived = (item.receipt_items || item.receiptItems || [])
        .filter((ri: any) => {
          const grStatus = ri.goods_receipt?.status || ri.goodsReceipt?.status || "";
          return ["RECEIVED", "PARTIALLY_RETURNED", "RETURNED"].includes(grStatus.toUpperCase());
        })
        .reduce((sum: number, ri: any) => sum + Number(ri.quantity_received ?? 0) - Number(ri.quantity_returned ?? 0), 0);

      return {
        id: String(item.id ?? ""),
        productId: String(item.product_id ?? item.productId ?? ""),
        productName,
        productSupplierId: String(item.product_supplier_id ?? item.productSupplierId ?? ""),
        quantityOrdered: Number(item.quantity_ordered ?? item.quantityOrdered ?? 0),
        quantityReceived,
        receiptItems: item.receipt_items || item.receiptItems || [],
      };
    })
  } : null;

  return {
    id: String(row.id ?? ""),
    receiptNumber: String(row.receipt_number ?? row.receiptNumber ?? row.id ?? "-"),
    poNumber: String(row.purchase_order?.po_number ?? row.purchaseOrder?.poNumber ?? row.po_number ?? "-"),
    purchaseOrderId: String(row.purchase_order_id ?? row.purchaseOrderId ?? row.purchase_order?.id ?? row.purchaseOrder?.id ?? ""),
    supplierName: String(row.purchase_order?.supplier?.name ?? row.purchase_order?.supplier?.CompanyName ?? row.purchaseOrder?.supplier?.name ?? "-"),
    receivedAt: row.received_at ?? row.receivedAt ?? row.created_at ?? null,
    approvedAt: row.approved_at ?? row.approvedAt ?? null,
    status: normalizeStatus(row.status),
    notes: row.notes ?? null,
    createdByName: row.created_by_name ?? row.createdByName ?? null,
    receivedByName: row.received_by_name ?? row.receivedByName ?? null,
    approvedByName: row.approved_by_name ?? row.approvedByName ?? null,
    returnedByName: row.returned_by_name ?? row.returnedByName ?? null,
    cancelledByName: row.cancelled_by_name ?? row.cancelledByName ?? null,
    returnRequestedByName: row.return_requested_by_name ?? row.returnRequestedByName ?? null,
    returnRequestItems: row.return_request_items ?? row.returnRequestItems ?? null,
    returnRequestedAt: row.return_requested_at ?? row.returnRequestedAt ?? null,
    purchaseOrder: purchaseOrderMapped,
    items: itemsRaw.map((item: any) => {
      const product = item.product || {};
      const poItem = item.purchase_order_item || item.purchaseOrderItem || {};

      const manufacturer = product.manufacturer?.name || product.manufacturer || product.manufacturer_name || "";
      const manufacturerStr = manufacturer ? ` — ${manufacturer}` : "";
      const productName = `${String(product.name ?? item.product_name ?? item.productName ?? "Unnamed Product")}${manufacturerStr}`;

      return {
        id: String(item.id ?? ""),
        productId: String(item.product_id ?? item.productId ?? product.id ?? ""),
        productSupplierId: String(item.product_supplier_id ?? item.productSupplierId ?? ""),
        productName,
        sku: String(product.sku ?? product.SKU ?? item.sku ?? "-"),
        partNumber: product.part_number ?? item.part_number ?? null,
        purchaseOrderItemId: String(poItem.id ?? item.purchase_order_item_id ?? item.purchaseOrderItemId ?? ""),
        ordered: Number(poItem.quantity_ordered ?? poItem.quantityOrdered ?? 0),
        quantityReceived: Number(item.quantity_received ?? item.quantityReceived ?? 0),
        quantityPromo: Number(item.quantity_promo ?? item.quantityPromo ?? 0),
        quantityRejected: Number(item.quantity_rejected ?? item.quantityRejected ?? 0),
        quantityReturned: Number(item.quantity_returned ?? item.quantityReturned ?? 0),
        notes: item.notes ?? null,
      };
    }),
  };
};

const GoodsReceiptDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<GoodsReceiptDetailModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmReceive, setConfirmReceive] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmApproveReturn, setConfirmApproveReturn] = useState(false);
  const [confirmRejectReturn, setConfirmRejectReturn] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  /* PDF preview */
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);

  const handlePreviewPDF = useCallback(async () => {
    if (!id) return;
    setIsLoadingPdf(true);
    setShowPdfPreview(true);
    try {
      const response = await api.get(`/purchasing/goods-receipts/${id}/download-pdf`, { responseType: 'blob' });
      if (pdfBlobUrl) window.URL.revokeObjectURL(pdfBlobUrl);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      setPdfBlobUrl(url);
    } catch {
      toast.error("Failed to load PDF preview.");
    } finally {
      setIsLoadingPdf(false);
    }
  }, [id, pdfBlobUrl]);
  const loadGoodsReceipt = async () => {
    if (!id) return;

    setLoading(true);

    try {
      const response = await api.get(`/purchasing/goods-receipts/${id}`);
      const row = response.data?.goods_receipt || response.data?.goodsReceipt || response.data?.data || response.data;
      const gr = normalizeGoodsReceipt(row);
      setReceipt(gr);
      sessionStorage.setItem(`breadcrumb-/webapp/purchasing/goods-receipts/${id}`, gr.receiptNumber);
      window.dispatchEvent(new Event('breadcrumb-update'));
    } catch (error: any) {
      console.error(error);
      toast.error("Unable to load goods receipt", { description: getCleanApiError(error, "Failed to load goods receipt.") });
      setReceipt(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadGoodsReceipt();

    return () => {
      sessionStorage.removeItem(`breadcrumb-/webapp/purchasing/goods-receipts/${id}`);
      window.dispatchEvent(new Event('breadcrumb-update'));
    };
  }, [id]);

  const receiveReceipt = async () => {
    if (!receipt) return;

    setActionLoading(true);
    try {
      await api.post(`/purchasing/goods-receipts/${receipt.id}/receive`);
      toast.success("Goods receipt received", { description: "The goods receipt was successfully marked as received." });
      await loadGoodsReceipt();
    } catch (error: any) {
      console.error(error);
      toast.error("Unable to receive goods receipt", { description: getCleanApiError(error, "Failed to receive goods receipt.") });
    } finally {
      setActionLoading(false);
    }
  };

  const approveReceipt = async () => {
    if (!receipt) return;

    setActionLoading(true);
    try {
      await api.post(`/purchasing/goods-receipts/${receipt.id}/approve`);
      toast.success("Goods receipt approved", { description: "Inventory was updated and stock movement was recorded." });
      await loadGoodsReceipt();
    } catch (error: any) {
      console.error(error);
      toast.error("Unable to approve receipt", { description: getCleanApiError(error, "Failed to approve goods receipt.") });
    } finally {
      setActionLoading(false);
    }
  };

  const cancelReceipt = async () => {
    if (!receipt) return;

    setActionLoading(true);
    try {
      await api.post(`/purchasing/goods-receipts/${receipt.id}/cancel`);
      toast.success("Goods receipt cancelled", { description: "The goods receipt was cancelled successfully." });
      await loadGoodsReceipt();
    } catch (error: any) {
      console.error(error);
      toast.error("Unable to cancel receipt", { description: getCleanApiError(error, "Failed to cancel goods receipt.") });
    } finally {
      setActionLoading(false);
    }
  };

  const deleteReceipt = async () => {
    if (!receipt) return;

    setActionLoading(true);
    try {
      await api.delete(`/purchasing/goods-receipts/${receipt.id}`);
      toast.success("Goods receipt deleted", { description: "The goods receipt was deleted successfully." });
      navigate("/webapp/purchasing/goods-receipts");
    } catch (error: any) {
      console.error(error);
      toast.error("Unable to delete goods receipt", { description: getCleanApiError(error, "Failed to delete goods receipt.") });
    } finally {
      setActionLoading(false);
    }
  };

  const approveReturn = async () => {
    if (!receipt) return;

    setActionLoading(true);
    try {
      const response = await api.post(`/purchasing/goods-receipts/${receipt.id}/return/approve`);
      const results = response.data?.results || [];
      const fullyApproved = results.filter((r: any) => r.approved === r.requested);
      const partialItems = results.filter((r: any) => r.approved < r.requested && r.approved > 0);
      const failedItems = results.filter((r: any) => r.approved === 0);

      if (partialItems.length > 0) {
        const details = partialItems.map((r: any) => `${r.requested} requested, ${r.approved} returned`).join("; ");
        toast.warning("Return partially approved", { description: `${details}. Insufficient stock for full return.` });
      } else if (failedItems.length > 0) {
        const details = failedItems.map((r: any) => r.reason).join("; ");
        toast.error("Return could not be processed", { description: details });
      } else {
        const totalApproved = fullyApproved.reduce((sum: number, r: any) => sum + r.approved, 0);
        toast.success("Return approved", { description: `${totalApproved} item(s) returned. Inventory updated and stock movements recorded.` });
      }
      await loadGoodsReceipt();
    } catch (error: any) {
      console.error(error);
      toast.error("Unable to approve return", { description: getCleanApiError(error, "Failed to approve return.") });
    } finally {
      setActionLoading(false);
    }
  };

  const rejectReturn = async () => {
    if (!receipt) return;

    setActionLoading(true);
    try {
      await api.post(`/purchasing/goods-receipts/${receipt.id}/return/reject`);
      toast.success("Return request rejected", { description: "The return request has been rejected." });
      await loadGoodsReceipt();
    } catch (error: any) {
      console.error(error);
      toast.error("Unable to reject return", { description: getCleanApiError(error, "Failed to reject return.") });
    } finally {
      setActionLoading(false);
    }
  };

  const editGoodsReceiptData = useMemo(() => {
    if (!receipt) return null;
    return {
      id: receipt.id,
      purchaseOrderId: receipt.purchaseOrderId,
      notes: receipt.notes || "",
      allowOverReceiving: false,
      items: receipt.items.map((item) => ({
        purchaseOrderItemId: item.purchaseOrderItemId || "",
        quantityReceived: String(item.quantityReceived),
        quantityPromo: String(item.quantityPromo || 0),
        quantityRejected: String(item.quantityRejected || 0),
        notes: item.notes || "",
      })),
    };
  }, [receipt]);

  return (
    <div className="w-full h-full px-6 pt-3 pb-6 flex flex-col gap-4 overflow-hidden select-none bg-background text-foreground">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" data-no-print>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex w-fit items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
            onClick={() => navigate("/webapp/purchasing/goods-receipts")}
          >
            <ArrowLeft size={16} /> Back
          </button>
          {normalizeStatus(receipt?.status) !== "DRAFT" && (
            <button type="button" className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted" onClick={handlePreviewPDF}>
              <Printer size={16} /> Print
            </button>
          )}
        </div>

        {receipt && (
          <div className="flex flex-wrap items-center gap-2">
            {normalizeStatus(receipt.status) === "DRAFT" && (
              <button type="button" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700" disabled={actionLoading} onClick={() => setConfirmReceive(true)}>
                Receive Goods
              </button>
            )}
            {normalizeStatus(receipt.status) === "SUBMITTED" && (
              <button type="button" className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700" disabled={actionLoading} onClick={() => setConfirmApprove(true)}>
                Approve Receipt
              </button>
            )}
            {["RECEIVED", "PARTIALLY_RETURNED"].includes(normalizeStatus(receipt.status)) && (
              <button type="button" className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700" disabled={actionLoading} onClick={() => setReturnOpen(true)}>
                Return Items
              </button>
            )}
            {normalizeStatus(receipt.status) === "RETURN_REQUESTED" && (
              <button type="button" className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700" disabled={actionLoading} onClick={() => setConfirmApproveReturn(true)}>
                Approve Return
              </button>
            )}

            {/* Overflow menu for secondary actions */}
            {(normalizeStatus(receipt.status) === "DRAFT" || normalizeStatus(receipt.status) === "SUBMITTED" || normalizeStatus(receipt.status) === "RETURN_REQUESTED") && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="inline-flex items-center justify-center rounded-md border border-border px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted" disabled={actionLoading}>
                    <MoreVertical size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {normalizeStatus(receipt.status) === "DRAFT" && (
                    <DropdownMenuItem onClick={() => setEditModalOpen(true)}>
                      <Pencil size={14} className="mr-2" /> Edit Receipt
                    </DropdownMenuItem>
                  )}
                  {normalizeStatus(receipt.status) === "SUBMITTED" && (
                    <DropdownMenuItem onClick={() => setConfirmCancel(true)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                      Cancel Receipt
                    </DropdownMenuItem>
                  )}
                  {normalizeStatus(receipt.status) === "RETURN_REQUESTED" && (
                    <DropdownMenuItem onClick={() => setConfirmRejectReturn(true)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                      Reject Return
                    </DropdownMenuItem>
                  )}
                  {normalizeStatus(receipt.status) === "DRAFT" && (
                    <DropdownMenuItem onClick={() => setConfirmDelete(true)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                      <Trash2 size={14} className="mr-2" /> Delete Receipt
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <DetailSkeleton />
      ) : !receipt ? (
        <div className="rounded-xl border border-border bg-background p-8 text-center text-muted-foreground">Goods receipt not found.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 items-stretch min-h-0">
          {/* Left Column: GR Info Card */}
          <div className="lg:col-span-1 flex flex-col gap-4 min-h-0">
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold tracking-tight text-foreground">{receipt.receiptNumber}</CardTitle>
                  <PurchaseStatusBadge status={receipt.status} />
                </div>
                <p className="text-xs text-muted-foreground">Supplier: <span className="font-semibold text-foreground">{receipt.supplierName}</span></p>
              </CardHeader>
              <CardContent className="flex-1 space-y-5 overflow-auto">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Purchase Order</p>
                  <button
                    type="button"
                    className="font-bold text-blue-600 hover:underline block text-left"
                    onClick={() => receipt.purchaseOrderId && navigate(`/webapp/purchasing/purchase-orders/${receipt.purchaseOrderId}`)}
                  >
                    {receipt.poNumber}
                  </button>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Received Date</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(receipt.receivedAt)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Approved At</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(receipt.approvedAt)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Notes</p>
                  <p className="text-sm text-foreground/80 italic">{receipt.notes || "-"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Left Column: GR Activity Card */}
            <Card className="flex-none flex flex-col min-h-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Created By</p>
                  <p className="text-sm font-medium text-foreground">{receipt.createdByName || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Received By</p>
                  <p className="text-sm font-medium text-foreground">{receipt.receivedByName || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Approved By</p>
                  <p className="text-sm font-medium text-foreground">{receipt.approvedByName || "-"}</p>
                </div>
                {receipt.returnedByName && (
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Returned By</p>
                    <p className="text-sm font-medium text-foreground">{receipt.returnedByName}</p>
                  </div>
                )}
                {receipt.cancelledByName && (
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Cancelled By</p>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">{receipt.cancelledByName}</p>
                  </div>
                )}
                {receipt.returnRequestedByName && (
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Return Requested By</p>
                    <p className="text-sm font-medium text-foreground">{receipt.returnRequestedByName}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Received Items */}
          <div className="lg:col-span-2 flex flex-col min-h-0">
            {normalizeStatus(receipt.status) === "RETURN_REQUESTED" && receipt.returnRequestItems && receipt.returnRequestItems.length > 0 && (
              <Card className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-amber-700 dark:text-amber-300">Pending Return Request</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
                    Requested by {receipt.returnRequestedByName || "Unknown"} on {formatDate(receipt.returnRequestedAt)}
                  </p>
                  <div className="space-y-1">
                    {receipt.returnRequestItems.map((pending, idx) => {
                      const item = receipt.items.find((i) => i.id === pending.goods_receipt_item_id);
                      return (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-foreground">{item?.productName || "Unknown Item"}</span>
                          <span className="text-muted-foreground">×</span>
                          <span className="font-semibold text-foreground">{pending.quantity_returned}</span>
                          {pending.notes && (
                            <span className="text-xs text-muted-foreground italic">({pending.notes})</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Received Items</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 overflow-hidden p-0 flex flex-col">
                <GoodsReceiptItemsTable items={receipt.items} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      <AlertDialog open={confirmApprove} onOpenChange={setConfirmApprove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Goods Receipt</AlertDialogTitle>
            <AlertDialogDescription>
              This will update inventory and record stock movements. Are you sure you want to approve {receipt?.receiptNumber}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-green-600 text-white hover:bg-green-700" disabled={actionLoading} onClick={approveReceipt}>
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Goods Receipt</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel {receipt?.receiptNumber}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" disabled={actionLoading} onClick={cancelReceipt}>
              Cancel Goods Receipt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmReceive} onOpenChange={setConfirmReceive}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Receive Goods Receipt</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark {receipt?.receiptNumber} as received? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-blue-600 text-white hover:bg-blue-700" disabled={actionLoading} onClick={receiveReceipt}>
              Receive Goods
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goods Receipt</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {receipt?.receiptNumber}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" disabled={actionLoading} onClick={deleteReceipt}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmApproveReturn} onOpenChange={setConfirmApproveReturn}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Return Request</AlertDialogTitle>
            <AlertDialogDescription>
              This will deduct the returned items from inventory. Items with insufficient stock will be partially returned. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-green-600 text-white hover:bg-green-700" disabled={actionLoading} onClick={approveReturn}>
              Approve Return
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmRejectReturn} onOpenChange={setConfirmRejectReturn}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Return Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this return request? The items will remain in inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" disabled={actionLoading} onClick={rejectReturn}>
              Reject Return
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ReturnItemsModal
        open={returnOpen}
        onOpenChange={setReturnOpen}
        goodsReceipt={receipt}
        onSaved={async () => {
          toast.success("Return request submitted", { description: "The return request is awaiting approval." });
          await loadGoodsReceipt();
        }}
        onError={(message) => toast.error("Unable to submit return request", { description: message })}
      />

      {receipt?.purchaseOrder && (
        <CreateGoodsReceiptModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          purchaseOrder={receipt.purchaseOrder}
          editGoodsReceipt={editGoodsReceiptData}
          onSaved={async () => {
            toast.success("Goods receipt updated", { description: "The goods receipt was updated successfully." });
            await loadGoodsReceipt();
          }}
          onError={(message) => toast.error("Unable to update receipt", { description: message })}
        />
      )}

      {/* ========== PDF PREVIEW DIALOG ========== */}
      <Dialog open={showPdfPreview} onOpenChange={(open) => {
        setShowPdfPreview(open);
        if (!open && pdfBlobUrl) {
          window.URL.revokeObjectURL(pdfBlobUrl);
          setPdfBlobUrl(null);
        }
      }}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b bg-background shrink-0">
            <DialogTitle className="text-lg font-semibold">
              GR Preview — {receipt?.receiptNumber || "Goods Receipt"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 bg-muted/30">
            {isLoadingPdf ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground animate-pulse">Generating PDF...</p>
                </div>
              </div>
            ) : pdfBlobUrl ? (
              <iframe
                src={pdfBlobUrl}
                className="w-full h-full border-0"
                title="GR PDF Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">No preview available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GoodsReceiptDetail;
