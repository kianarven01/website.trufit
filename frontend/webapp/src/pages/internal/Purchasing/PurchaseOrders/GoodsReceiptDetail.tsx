import { useEffect, useState } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/axios";
import GoodsReceiptItemsTable, { GoodsReceiptItemRow } from "@/components/purchasing/GoodsReceiptItemsTable";
import PurchaseStatusBadge from "@/components/purchasing/PurchaseStatusBadge";
import PurchasingToast, { PurchasingToastType } from "@/components/purchasing/PurchasingToast";
import { formatDate, getCleanApiError, normalizeStatus } from "@/components/purchasing/purchasingUtils";

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
        ordered: Number(poItem.quantity_ordered ?? poItem.quantityOrdered ?? 0),
        quantityReceived: Number(item.quantity_received ?? item.quantityReceived ?? 0),
        quantityRejected: Number(item.quantity_rejected ?? item.quantityRejected ?? 0),
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
      setReceipt(normalizeGoodsReceipt(row));
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

  return (
    <div className="min-h-full bg-background px-5 py-5 text-foreground">
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
              <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700" onClick={approveReceipt}>
                Approve Receipt
              </button>
            )}
            <button className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-muted" onClick={() => window.print()}>
              <Printer size={16} /> Print Receipt
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-background p-8 text-center text-muted-foreground">Loading goods receipt...</div>
      ) : !receipt ? (
        <div className="rounded-xl border border-border bg-background p-8 text-center text-muted-foreground">Goods receipt not found.</div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-background p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{receipt.receiptNumber}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  PO: {receipt.poNumber} • Supplier: {receipt.supplierName}
                </p>
              </div>
              <PurchaseStatusBadge status={receipt.status} />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Received Date</p>
                <p className="mt-1 font-medium">{formatDate(receipt.receivedAt)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Approved At</p>
                <p className="mt-1 font-medium">{formatDate(receipt.approvedAt)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Purchase Order</p>
                <button
                  type="button"
                  className="mt-1 font-medium text-blue-600 hover:underline"
                  onClick={() => receipt.purchaseOrderId && navigate(`/webapp/purchasing/purchase-orders/${receipt.purchaseOrderId}`)}
                >
                  {receipt.poNumber}
                </button>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Notes</p>
                <p className="mt-1 font-medium">{receipt.notes || "-"}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">Received Items</h2>
            <GoodsReceiptItemsTable items={receipt.items} />
          </div>
        </div>
      )}
    </div>
  );
};

export default GoodsReceiptDetail;
