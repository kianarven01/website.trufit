import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import CreateGoodsReceiptModal, { ReceiptPurchaseOrder } from "@/components/purchasing/CreateGoodsReceiptModal";
import PurchaseStatusBadge from "@/components/purchasing/PurchaseStatusBadge";
import PurchasingToast, { PurchasingToastType } from "@/components/purchasing/PurchasingToast";
import { formatDate, getCleanApiError, getRows, normalizeStatus } from "@/components/purchasing/purchasingUtils";

interface GoodsReceiptRow {
  id: string;
  receiptNumber: string;
  poNumber: string;
  supplierName: string;
  receivedAt: string | null;
  status: string;
  notes?: string | null;
}

const getApprovedReceivedQuantity = (row: any) => {
  const receiptItems = Array.isArray(row.receipt_items)
    ? row.receipt_items
    : Array.isArray(row.receiptItems)
      ? row.receiptItems
      : [];

  return receiptItems
    .filter((receiptItem: any) => normalizeStatus(receiptItem.goods_receipt?.status ?? receiptItem.goodsReceipt?.status) === "APPROVED")
    .reduce((sum: number, receiptItem: any) => sum + Number(receiptItem.quantity_received || 0), 0);
};

const normalizeGoodsReceipt = (row: any): GoodsReceiptRow => ({
  id: String(row.id ?? ""),
  receiptNumber: String(row.receipt_number ?? row.receiptNumber ?? row.id ?? "-"),
  poNumber: String(row.purchase_order?.po_number ?? row.purchaseOrder?.poNumber ?? row.po_number ?? "-"),
  supplierName: String(
    row.purchase_order?.supplier?.name ??
      row.purchase_order?.supplier?.CompanyName ??
      row.purchaseOrder?.supplier?.name ??
      row.supplier_name ??
      "-"
  ),
  receivedAt: row.received_at ?? row.receivedAt ?? row.created_at ?? null,
  status: normalizeStatus(row.status),
  notes: row.notes ?? null,
});

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

const GoodsReceipts = () => {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState<GoodsReceiptRow[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<ReceiptPurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    type: PurchasingToastType;
    title: string;
    message: string;
  } | null>(null);

  const showToast = (type: PurchasingToastType, title: string, message: string) => {
    setToast({ type, title, message });
  };

  const loadGoodsReceipts = async () => {
    setLoading(true);

    try {
      const response = await api.get("/purchasing/goods-receipts");
      const rows = getRows(response.data, ["goods_receipts", "goodsReceipts"]);
      setReceipts(rows.map(normalizeGoodsReceipt).filter((receipt) => receipt.id));
    } catch (error: any) {
      console.error(error);
      showToast("error", "Unable to load goods receipts", getCleanApiError(error, "Failed to load goods receipts."));
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadReceivablePurchaseOrders = async () => {
    try {
      const response = await api.get("/purchasing/purchase-orders");
      const rows = getRows(response.data, ["purchase_orders", "purchaseOrders"]);
      setPurchaseOrders(
        rows
          .map(normalizePurchaseOrderForReceipt)
          .filter((po) => ["APPROVED", "PARTIALLY_RECEIVED"].includes(normalizeStatus(po.status)))
      );
    } catch (error) {
      console.error(error);
      setPurchaseOrders([]);
    }
  };

  useEffect(() => {
    void loadGoodsReceipts();
    void loadReceivablePurchaseOrders();
  }, []);

  const filteredReceipts = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return receipts;

    return receipts.filter((receipt) =>
      `${receipt.receiptNumber} ${receipt.poNumber} ${receipt.supplierName} ${receipt.status}`
        .toLowerCase()
        .includes(query)
    );
  }, [receipts, search]);

  const approveReceipt = async (receipt: GoodsReceiptRow) => {
    try {
      await api.post(`/purchasing/goods-receipts/${receipt.id}/approve`);
      showToast("success", "Goods receipt approved", `${receipt.receiptNumber} was approved and inventory was updated.`);
      await loadGoodsReceipts();
      await loadReceivablePurchaseOrders();
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

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Goods Receipts</h1>
          <p className="mt-1 text-sm text-muted-foreground">Warehouse delivery inspection & stock receiving</p>
        </div>

        <button
          type="button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-amber-500 px-4 text-sm font-semibold text-white hover:bg-amber-600"
          onClick={() => setModalOpen(true)}
        >
          <Plus size={17} /> Receive Delivery
        </button>
      </div>

      <div className="mb-5">
        <input
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring sm:w-80"
          placeholder="Search receipt, PO, or supplier..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Receipt #</th>
              <th className="px-4 py-3 text-left font-semibold">PO Number</th>
              <th className="px-4 py-3 text-left font-semibold">Supplier</th>
              <th className="px-4 py-3 text-left font-semibold">Date</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Notes</th>
              <th className="px-4 py-3 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-8 text-center text-muted-foreground" colSpan={7}>Loading goods receipts...</td>
              </tr>
            ) : filteredReceipts.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-muted-foreground" colSpan={7}>No goods receipts found.</td>
              </tr>
            ) : (
              filteredReceipts.map((receipt) => (
                <tr
                  key={receipt.id}
                  className="cursor-pointer border-t border-border/60 hover:bg-muted/40"
                  onClick={() => navigate(`/webapp/purchasing/goods-receipts/${receipt.id}`)}
                >
                  <td className="px-4 py-3 font-medium">{receipt.receiptNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{receipt.poNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{receipt.supplierName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(receipt.receivedAt)}</td>
                  <td className="px-4 py-3"><PurchaseStatusBadge status={receipt.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{receipt.notes || "-"}</td>
                  <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                    {normalizeStatus(receipt.status) === "DRAFT" && (
                      <button className="rounded-md border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/20" onClick={() => approveReceipt(receipt)}>
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CreateGoodsReceiptModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        purchaseOrders={purchaseOrders}
        onSaved={async () => {
          showToast("success", "Goods receipt saved", "The goods receipt was saved successfully.");
          await loadGoodsReceipts();
          await loadReceivablePurchaseOrders();
        }}
        onError={(message) => showToast("error", "Unable to save goods receipt", message)}
      />
    </div>
  );
};

export default GoodsReceipts;
