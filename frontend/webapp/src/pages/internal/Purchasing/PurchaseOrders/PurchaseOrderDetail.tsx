import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Printer, ReceiptText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/axios";
import CreateGoodsReceiptModal, { ReceiptPurchaseOrder } from "@/components/purchasing/CreateGoodsReceiptModal";
import PurchaseOrderItemsTable, { PurchaseOrderItemRow } from "@/components/purchasing/PurchaseOrderItemsTable";
import PurchaseStatusBadge from "@/components/purchasing/PurchaseStatusBadge";
import PurchasingToast, { PurchasingToastType } from "@/components/purchasing/PurchasingToast";
import { formatCurrency, formatDate, getCleanApiError, normalizeStatus } from "@/components/purchasing/purchasingUtils";
import DetailSkeleton from "@/components/ui/DetailSkeleton";

interface PurchaseOrderDetailModel {
  id: string;
  poNumber: string;
  supplierName: string;
  supplierId?: string | null;
  orderDate: string | null;
  expectedDelivery: string | null;
  status: string;
  remarks?: string | null;
  totalAmount: number;
  items: PurchaseOrderItemRow[];
  receiptModalItems: ReceiptPurchaseOrder["items"];
  goodsReceipts: Array<{
    id: string;
    receiptNumber: string;
    status: string;
    receivedAt: string | null;
  }>;
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

const normalizePurchaseOrder = (row: any): PurchaseOrderDetailModel => {
  const itemsRaw = Array.isArray(row.items) ? row.items : [];
  const goodsReceiptsRaw = Array.isArray(row.goods_receipts)
    ? row.goods_receipts
    : Array.isArray(row.goodsReceipts)
      ? row.goodsReceipts
      : [];

  const items = itemsRaw.map((item: any) => {
    const product = item.product || {};
    const quantityOrdered = Number(item.quantity_ordered ?? item.quantityOrdered ?? 0);
    const quantityReceived = Number(item.quantity_received ?? item.quantityReceived ?? getApprovedReceivedQuantity(item));
    const unitCost = Number(item.unit_cost ?? item.unitCost ?? 0);
    const lineTotal = Number(item.line_total ?? item.lineTotal ?? quantityOrdered * unitCost);

    return {
      id: String(item.id ?? ""),
      productName: String(product.name ?? item.product_name ?? item.productName ?? "Unnamed Product"),
      sku: product.SKU ?? product.sku ?? item.sku ?? null,
      quantityOrdered,
      quantityReceived,
      unitCost,
      lineTotal,
    };
  });

  const receiptModalItems = itemsRaw.map((item: any) => {
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
  });

  return {
    id: String(row.id ?? ""),
    poNumber: String(row.po_number ?? row.poNumber ?? row.id ?? "-"),
    supplierName: String(row.supplier?.name ?? row.supplier?.CompanyName ?? row.supplier_name ?? row.supplierName ?? "-"),
    supplierId: row.supplier_id ?? row.supplierId ?? row.supplier?.id ?? null,
    orderDate: row.order_date ?? row.orderDate ?? row.created_at ?? null,
    expectedDelivery: row.request_ship_date ?? row.expected_delivery_date ?? row.eta ?? null,
    status: normalizeStatus(row.status),
    remarks: row.remarks ?? row.notes ?? null,
    totalAmount: Number(row.total_amount ?? row.totalAmount ?? row.total ?? 0),
    items,
    receiptModalItems,
    goodsReceipts: goodsReceiptsRaw.map((receipt: any) => ({
      id: String(receipt.id ?? ""),
      receiptNumber: String(receipt.receipt_number ?? receipt.receiptNumber ?? receipt.id ?? "-"),
      status: normalizeStatus(receipt.status),
      receivedAt: receipt.received_at ?? receipt.receivedAt ?? receipt.created_at ?? null,
    })),
  };
};

const PurchaseOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrderDetailModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    type: PurchasingToastType;
    title: string;
    message: string;
  } | null>(null);

  const showToast = (type: PurchasingToastType, title: string, message: string) => {
    setToast({ type, title, message });
  };

  const loadPurchaseOrder = async () => {
    if (!id) return;

    setLoading(true);

    try {
      const response = await api.get(`/purchasing/purchase-orders/${id}`);
      const row = response.data?.purchase_order || response.data?.purchaseOrder || response.data?.data || response.data;
      setPurchaseOrder(normalizePurchaseOrder(row));
    } catch (error: any) {
      console.error(error);
      showToast("error", "Unable to load purchase order", getCleanApiError(error, "Failed to load purchase order."));
      setPurchaseOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPurchaseOrder();
  }, [id]);

  const receiptPurchaseOrder = useMemo<ReceiptPurchaseOrder | null>(() => {
    if (!purchaseOrder) return null;

    return {
      id: purchaseOrder.id,
      poNumber: purchaseOrder.poNumber,
      supplierName: purchaseOrder.supplierName,
      status: purchaseOrder.status,
      items: purchaseOrder.receiptModalItems,
    };
  }, [purchaseOrder]);

  const runPoAction = async (action: "submit" | "approve" | "cancel") => {
    if (!purchaseOrder) return;

    const labels = {
      submit: "submitted",
      approve: "approved",
      cancel: "cancelled",
    };

    try {
      await api.post(`/purchasing/purchase-orders/${purchaseOrder.id}/${action}`);
      showToast("success", "Purchase order updated", `${purchaseOrder.poNumber} was ${labels[action]} successfully.`);
      await loadPurchaseOrder();
    } catch (error: any) {
      console.error(error);
      showToast("error", "Unable to update purchase order", getCleanApiError(error, "Failed to update purchase order."));
    }
  };

  const handlePrint = () => window.print();

  const status = normalizeStatus(purchaseOrder?.status);
  const canSubmit = status === "DRAFT";
  const canApprove = status === "SUBMITTED";
  const canCancel = ["DRAFT", "SUBMITTED", "APPROVED"].includes(status);
  const canCreateReceipt = ["APPROVED", "PARTIALLY_RECEIVED"].includes(status);

  return (
    <div className="min-h-full bg-background px-5 py-5 text-foreground">
      {toast && (
        <PurchasingToast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={4000}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          className="inline-flex w-fit items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
          onClick={() => navigate("/webapp/purchasing/purchase-orders")}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {purchaseOrder && (
          <div className="flex flex-wrap items-center gap-2">
            {canSubmit && (
              <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700" onClick={() => runPoAction("submit")}>
                Submit PO
              </button>
            )}
            {canApprove && (
              <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700" onClick={() => runPoAction("approve")}>
                Approve PO
              </button>
            )}
            {canCancel && (
              <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700" onClick={() => runPoAction("cancel")}>
                Cancel PO
              </button>
            )}
            <button className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-muted" onClick={handlePrint}>
              <Printer size={16} /> Print PO
            </button>
            {canCreateReceipt && (
              <button className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600" onClick={() => setReceiptModalOpen(true)}>
                <ReceiptText size={16} /> Create Goods Receipt
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <DetailSkeleton />
      ) : !purchaseOrder ? (
        <div className="rounded-xl border border-border bg-background p-8 text-center text-muted-foreground">Purchase order not found.</div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-background p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{purchaseOrder.poNumber}</h1>
                <p className="mt-1 text-sm text-muted-foreground">Supplier: {purchaseOrder.supplierName}</p>
              </div>
              <PurchaseStatusBadge status={purchaseOrder.status} />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Order Date</p>
                <p className="mt-1 font-medium">{formatDate(purchaseOrder.orderDate)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Expected Delivery</p>
                <p className="mt-1 font-medium">{formatDate(purchaseOrder.expectedDelivery)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Total Amount</p>
                <p className="mt-1 font-medium">{formatCurrency(purchaseOrder.totalAmount)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Remarks</p>
                <p className="mt-1 font-medium">{purchaseOrder.remarks || "-"}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">Line Items</h2>
            <PurchaseOrderItemsTable items={purchaseOrder.items} />
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">Goods Receipts</h2>
            <div className="overflow-hidden rounded-xl border border-border bg-background">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Receipt #</th>
                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrder.goodsReceipts.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-center text-muted-foreground" colSpan={3}>
                        No goods receipts yet.
                      </td>
                    </tr>
                  ) : (
                    purchaseOrder.goodsReceipts.map((receipt) => (
                      <tr
                        key={receipt.id}
                        className="cursor-pointer border-t border-border/60 hover:bg-muted/40"
                        onClick={() => navigate(`/webapp/purchasing/goods-receipts/${receipt.id}`)}
                      >
                        <td className="px-4 py-3 font-medium">{receipt.receiptNumber}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(receipt.receivedAt)}</td>
                        <td className="px-4 py-3"><PurchaseStatusBadge status={receipt.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <CreateGoodsReceiptModal
        open={receiptModalOpen}
        onOpenChange={setReceiptModalOpen}
        purchaseOrder={receiptPurchaseOrder}
        onSaved={async () => {
          showToast("success", "Goods receipt saved", "The goods receipt was created successfully.");
          await loadPurchaseOrder();
        }}
        onError={(message) => showToast("error", "Unable to save goods receipt", message)}
      />
    </div>
  );
};

export default PurchaseOrderDetail;
