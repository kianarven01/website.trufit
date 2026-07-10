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
    items: itemsRaw.map((item: any) => {
      const product = item.product || {};
      const poItem = item.purchase_order_item || item.purchaseOrderItem || {};

      return {
        id: String(item.id ?? ""),
        productName: String(product.name ?? item.product_name ?? item.productName ?? "Unnamed Product"),
        sku: String(product.sku ?? product.SKU ?? item.sku ?? "-"),
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
    <div className="w-full h-full px-6 pt-3 pb-6 flex flex-col gap-6 overflow-y-auto bg-background text-foreground">
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
                <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700" onClick={() => setConfirmApprove(true)}>
                  Approve Receipt
                </button>
                <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700" onClick={() => setConfirmCancel(true)}>
                  Cancel Receipt
                </button>
                <button className="inline-flex items-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20" onClick={() => setConfirmDelete(true)}>
                  <Trash2 size={16} /> Delete Receipt
                </button>
              </>
            )}
            {["APPROVED", "PARTIALLY_RETURNED"].includes(normalizeStatus(receipt.status)) && (
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
        <div className="space-y-6">
          {/* Main Info Card */}
          <div className="rounded-xl border border-border/80 bg-card shadow-sm hover:shadow-md transition-shadow p-6 border-l-4 border-l-amber-500">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{receipt.receiptNumber}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  PO: <button type="button" className="font-semibold text-blue-600 hover:underline" onClick={() => receipt.purchaseOrderId && navigate(`/webapp/purchasing/purchase-orders/${receipt.purchaseOrderId}`)}>{receipt.poNumber}</button> • Supplier: <span className="font-semibold text-foreground">{receipt.supplierName}</span>
                </p>
              </div>
              <PurchaseStatusBadge status={receipt.status} />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Received Date</p>
                <p className="font-bold text-foreground">{formatDate(receipt.receivedAt)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Approved At</p>
                <p className="font-bold text-foreground">{formatDate(receipt.approvedAt)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Purchase Order</p>
                <button
                  type="button"
                  className="font-bold text-blue-600 hover:underline block text-left"
                  onClick={() => receipt.purchaseOrderId && navigate(`/webapp/purchasing/purchase-orders/${receipt.purchaseOrderId}`)}
                >
                  {receipt.poNumber}
                </button>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Notes</p>
                <p className="text-sm text-foreground/80 italic">{receipt.notes || "-"}</p>
              </div>
            </div>
          </div>

          {/* Received Items Section */}
          <div className="rounded-xl border border-border/80 bg-card shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground">Received Items</h2>
            <GoodsReceiptItemsTable items={receipt.items} />
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={cancelReceipt}>
              Cancel Receipt
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
