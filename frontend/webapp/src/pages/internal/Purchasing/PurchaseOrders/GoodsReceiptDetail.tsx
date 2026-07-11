import { useEffect, useState } from "react";
import { ArrowLeft, Printer, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/axios";
import GoodsReceiptItemsTable, { GoodsReceiptItemRow } from "@/components/purchasing/GoodsReceiptItemsTable";
import PurchaseStatusBadge from "@/components/purchasing/PurchaseStatusBadge";
import PurchasingToast, { PurchasingToastType } from "@/components/purchasing/PurchasingToast";
import { formatDate, getCleanApiError, normalizeStatus } from "@/components/purchasing/purchasingUtils";
import DetailSkeleton from "@/components/ui/DetailSkeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReturnItemsModal from "@/components/purchasing/ReturnItemsModal";

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
  items: GoodsReceiptItemRow[];
}

const normalizeGoodsReceipt = (row: any): GoodsReceiptDetailModel => {
  const itemsRaw = Array.isArray(row.items) ? row.items : [];

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
    items: itemsRaw.map((item: any) => {
      const product = item.product || {};
      const poItem = item.purchase_order_item || item.purchaseOrderItem || {};

      const manufacturer = product.manufacturer?.name || product.manufacturer || product.manufacturer_name || "";
      const manufacturerStr = manufacturer ? ` — ${manufacturer}` : "";
      const productName = `${String(product.name ?? item.product_name ?? item.productName ?? "Unnamed Product")}${manufacturerStr}`;

      return {
        id: String(item.id ?? ""),
        productName,
        sku: String(product.sku ?? product.SKU ?? item.sku ?? "-"),
        partNumber: product.part_number ?? item.part_number ?? null,
        ordered: Number(poItem.quantity_ordered ?? poItem.quantityOrdered ?? 0),
        quantityReceived: Number(item.quantity_received ?? item.quantityReceived ?? 0),
        quantityPromo: Number(item.quantity_promo ?? item.quantityPromo ?? 0),
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
  const [returnOpen, setReturnOpen] = useState(false);
  const [toast, setToast] = useState<{
    type: PurchasingToastType;
    title: string;
    message: string;
  } | null>(null);

  const showToast = (type: PurchasingToastType, title: string, message: string) => {
    setToast({ type, title, message });
  };

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
      showToast("error", "Unable to load goods receipt", getCleanApiError(error, "Failed to load goods receipt."));
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

    try {
      await api.post(`/purchasing/goods-receipts/${receipt.id}/receive`);
      showToast("success", "Goods receipt received", "The goods receipt was successfully marked as received.");
      await loadGoodsReceipt();
    } catch (error: any) {
      console.error(error);
      showToast("error", "Unable to receive goods receipt", getCleanApiError(error, "Failed to receive goods receipt."));
    }
  };

  const approveReceipt = async () => {
    if (!receipt) return;

    try {
      await api.post(`/purchasing/goods-receipts/${receipt.id}/approve`);
      showToast("success", "Goods receipt approved", "Inventory was updated and stock movement was recorded.");
      await loadGoodsReceipt();
    } catch (error: any) {
      console.error(error);
      showToast("error", "Unable to approve receipt", getCleanApiError(error, "Failed to approve goods receipt."));
    }
  };

  const cancelReceipt = async () => {
    if (!receipt) return;

    try {
      await api.post(`/purchasing/goods-receipts/${receipt.id}/cancel`);
      showToast("success", "Goods receipt cancelled", "The goods receipt was cancelled successfully.");
      await loadGoodsReceipt();
    } catch (error: any) {
      console.error(error);
      showToast("error", "Unable to cancel receipt", getCleanApiError(error, "Failed to cancel goods receipt."));
    }
  };

  const deleteReceipt = async () => {
    if (!receipt) return;

    try {
      await api.delete(`/purchasing/goods-receipts/${receipt.id}`);
      showToast("success", "Goods receipt deleted", "The goods receipt was deleted successfully.");
      navigate("/webapp/purchasing/goods-receipts");
    } catch (error: any) {
      console.error(error);
      showToast("error", "Unable to delete goods receipt", getCleanApiError(error, "Failed to delete goods receipt."));
    }
  };

  return (
    <div className="w-full h-full px-6 pt-3 pb-6 flex flex-col gap-4 overflow-hidden select-none bg-background text-foreground">
      {toast && (
        <PurchasingToast type={toast.type} title={toast.title} message={toast.message} duration={4000} onClose={() => setToast(null)} />
      )}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          className="inline-flex w-fit items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
          onClick={() => navigate("/webapp/purchasing/goods-receipts")}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {receipt && (
          <div className="flex flex-wrap items-center gap-2">
            {normalizeStatus(receipt.status) === "DRAFT" && (
              <>
                <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700" onClick={() => setConfirmReceive(true)}>
                  Receive Goods
                </button>
                <button className="inline-flex items-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20" onClick={() => setConfirmDelete(true)}>
                  <Trash2 size={16} /> Delete Receipt
                </button>
              </>
            )}
            {normalizeStatus(receipt.status) === "SUBMITTED" && (
              <>
                <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700" onClick={() => setConfirmApprove(true)}>
                  Approve Receipt
                </button>
                <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700" onClick={() => setConfirmCancel(true)}>
                  Cancel Receipt
                </button>
              </>
            )}
            {["RECEIVED", "PARTIALLY_RETURNED"].includes(normalizeStatus(receipt.status)) && (
              <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700" onClick={() => setReturnOpen(true)}>
                Return Items
              </button>
            )}
            <button className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-muted" onClick={() => window.print()}>
              <Printer size={16} /> Print Receipt
            </button>
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
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Received Items */}
          <div className="lg:col-span-2 flex flex-col min-h-0">
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
            <AlertDialogAction className="bg-green-600 text-white hover:bg-green-700" onClick={approveReceipt}>
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
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={cancelReceipt}>
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
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction className="bg-blue-600 text-white hover:bg-blue-700" onClick={receiveReceipt}>
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
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={deleteReceipt}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ReturnItemsModal
        open={returnOpen}
        onOpenChange={setReturnOpen}
        goodsReceipt={receipt}
        onSaved={async () => {
          showToast("success", "Return processed successfully", "The return items were processed and stock ledger was updated.");
          await loadGoodsReceipt();
        }}
        onError={(message) => showToast("error", "Unable to return items", message)}
      />
    </div>
  );
};

export default GoodsReceiptDetail;
