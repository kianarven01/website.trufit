import { useEffect, useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import api from "@/api/axios";
import { getCleanApiError } from "./purchasingUtils";

interface GoodsReceiptItemModel {
  id: string;
  productId?: string;
  product_id?: string;
  productSupplierId?: string;
  product_supplier_id?: string;
  quantityReceived?: number;
  quantity_received?: number;
  quantityPromo?: number;
  quantity_promo?: number;
  quantityReturned?: number;
  quantity_returned?: number;
  productName?: string;
  sku?: string | null;
  product?: {
    id: string;
    name: string;
    sku?: string | null;
  } | null;
}

interface GoodsReceiptModel {
  id: string;
  receiptNumber: string;
  items: GoodsReceiptItemModel[];
  purchaseOrder?: any;
  purchase_order?: any;
}

interface ReturnItemsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goodsReceipt: GoodsReceiptModel | null;
  onSaved?: () => void | Promise<void>;
  onError?: (message: string) => void;
}

interface ReturnLineState {
  goods_receipt_item_id: string;
  productId: string;
  productSupplierId: string;
  productName: string;
  sku: string;
  maxQtyFromGR: number;
  currentStock: number | null;
  maxQty: number;
  totalBilled: number;
  qtyToReturn: string;
  notes: string;
  quantityReturned: number;
}

const ReturnItemsModal = ({
  open,
  onOpenChange,
  goodsReceipt,
  onSaved,
  onError,
}: ReturnItemsModalProps) => {
  const [items, setItems] = useState<ReturnLineState[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingStock, setLoadingStock] = useState(false);

  useEffect(() => {
    if (!open || !goodsReceipt) return;

    const po = goodsReceipt.purchaseOrder ?? goodsReceipt.purchase_order;
    const supplierBills = po?.supplierBills ?? po?.supplier_bills ?? [];

    const lines: ReturnLineState[] = goodsReceipt.items.map((item) => {
      const quantityReceived = item.quantityReceived ?? item.quantity_received ?? 0;
      const quantityPromo = item.quantityPromo ?? item.quantity_promo ?? 0;
      const quantityReturned = item.quantityReturned ?? item.quantity_returned ?? 0;

      const poItemId = (item as any).purchase_order_item_id ?? (item as any).purchaseOrderItemId;

      const totalBilled = supplierBills
        .filter((bill: any) => bill.status !== "VOID")
        .flatMap((bill: any) => bill.items || bill.receiptItems || [])
        .filter((bi: any) => {
          const targetId = bi.purchase_order_item_id ?? bi.purchaseOrderItemId;
          return String(targetId) === String(poItemId);
        })
        .reduce((sum: number, bi: any) => sum + Number(bi.quantity_billed ?? bi.quantityBilled ?? 0), 0);

      const remainingOnReceipt = Number(quantityReceived) + Number(quantityPromo) - Number(quantityReturned);

      const allReceiptItems = po?.items
        ?.filter((pi: any) => String(pi.id) === String(poItemId))
        ?.flatMap((pi: any) => pi.receiptItems ?? pi.receipt_items ?? []) || [];

      const totalReceivedForPO = allReceiptItems
        .filter((ri: any) => {
          const gr = ri.goodsReceipt ?? ri.goods_receipt;
          return ["RECEIVED", "PARTIALLY_RETURNED", "RETURNED"].includes(String(gr?.status ?? "").toUpperCase());
        })
        .reduce((sum: number, ri: any) => sum + Number(ri.quantity_received ?? ri.quantityReceived ?? 0) + Number(ri.quantity_promo ?? ri.quantityPromo ?? 0), 0);

      const totalReturnedForPO = allReceiptItems
        .filter((ri: any) => {
          const gr = ri.goodsReceipt ?? ri.goods_receipt;
          return ["RECEIVED", "PARTIALLY_RETURNED", "RETURNED"].includes(String(gr?.status ?? "").toUpperCase());
        })
        .reduce((sum: number, ri: any) => sum + Number(ri.quantity_returned ?? ri.quantityReturned ?? 0), 0);

      const netReceivedForPO = totalReceivedForPO - totalReturnedForPO;
      const unbilledForPO = Math.max(0, netReceivedForPO - totalBilled);

      const maxQtyFromGR = Math.min(remainingOnReceipt, unbilledForPO);
      const productName = item.productName ?? item.product?.name ?? "Unnamed Product";
      const sku = item.sku ?? item.product?.sku ?? "-";

      return {
        goods_receipt_item_id: item.id,
        productId: String(item.productId ?? item.product_id ?? item.product?.id ?? ""),
        productSupplierId: String(item.productSupplierId ?? item.product_supplier_id ?? ""),
        productName,
        sku,
        maxQtyFromGR: maxQtyFromGR > 0 ? maxQtyFromGR : 0,
        currentStock: null,
        maxQty: maxQtyFromGR > 0 ? maxQtyFromGR : 0,
        totalBilled,
        qtyToReturn: "0",
        notes: "",
        quantityReturned: Number(quantityReturned),
      };
    });

    setItems(lines);

    const fetchInventory = async () => {
      setLoadingStock(true);
      try {
        const res = await api.get("/inventory");
        const rows = Array.isArray(res.data?.data) ? res.data.data : res.data;

        const stockMap = new Map<string, number>();
        for (const row of rows) {
          const pid = String(row.product_id ?? row.productID ?? row.product?.id ?? "");
          const qty = Number(row.quantity_on_hand ?? 0);
          if (pid) stockMap.set(pid, (stockMap.get(pid) || 0) + qty);
        }

        setItems((current) =>
          current.map((item) => {
            const stock = stockMap.get(item.productId) ?? 0;
            const effectiveMax = Math.min(item.maxQtyFromGR, stock);
            return {
              ...item,
              currentStock: stock,
              maxQty: Math.max(0, effectiveMax),
            };
          })
        );
      } catch (error) {
        console.error("Failed to fetch inventory:", error);
      } finally {
        setLoadingStock(false);
      }
    };

    fetchInventory();
  }, [open, goodsReceipt]);

  const updateLineQty = (itemId: string, value: string) => {
    setItems((current) =>
      current.map((item) => {
        if (item.goods_receipt_item_id !== itemId) return item;

        let val = Number(value || 0);
        if (val < 0) val = 0;
        if (val > item.maxQty) val = item.maxQty;

        return { ...item, qtyToReturn: String(val) };
      })
    );
  };

  const updateLineNotes = (itemId: string, value: string) => {
    setItems((current) =>
      current.map((item) => {
        if (item.goods_receipt_item_id !== itemId) return item;
        return { ...item, notes: value };
      })
    );
  };

  const handleSubmit = async () => {
    if (!goodsReceipt) return;

    const itemsToSubmit = items
      .filter((item) => Number(item.qtyToReturn) > 0)
      .map((item) => ({
        goods_receipt_item_id: item.goods_receipt_item_id,
        quantity_returned: Number(item.qtyToReturn),
        notes: item.notes || null,
      }));

    if (itemsToSubmit.length === 0) {
      onError?.("Please enter a return quantity greater than 0 for at least one item.");
      return;
    }

    setSaving(true);

    try {
      await api.post(`/purchasing/goods-receipts/${goodsReceipt.id}/return/request`, {
        items: itemsToSubmit,
      });

      await onSaved?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      onError?.(getCleanApiError(error, "Failed to submit return request."));
    } finally {
      setSaving(false);
    }
  };

  if (!open || !goodsReceipt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-background shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Request Return to Supplier</h2>
            <p className="text-sm text-muted-foreground">
              Submit return request for Goods Receipt: <span className="font-semibold text-foreground">{goodsReceipt.receiptNumber}</span>
            </p>
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[75vh] space-y-4 overflow-y-auto px-6 py-5">
          {loadingStock && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
              Checking inventory levels...
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Received Items</h3>

            <div className="space-y-2 rounded-xl border border-border p-3">
              {items.map((item) => {
                const isLowStock = item.currentStock !== null && item.currentStock < item.maxQtyFromGR;
                const requestedExceedsStock = Number(item.qtyToReturn) > 0 && item.currentStock !== null && Number(item.qtyToReturn) > item.currentStock;

                return (
                  <div
                    key={item.goods_receipt_item_id}
                    className="grid grid-cols-12 gap-3 items-start border-b border-border/40 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="col-span-12 md:col-span-5">
                      <p className="font-medium text-sm text-foreground">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Max returnable: <span className="font-semibold text-foreground">{item.maxQty}</span>
                        {item.currentStock !== null && (
                          <span className={`ml-2 ${isLowStock ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
                            (Stock: {item.currentStock})
                          </span>
                        )}
                        {isLowStock && (
                          <span className="block text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 font-medium">
                            <AlertTriangle className="inline h-3 w-3 mr-0.5" />
                            Only {item.currentStock} in stock (originally received {item.maxQtyFromGR + (item.quantityReturned ?? 0)})
                          </span>
                        )}
                        {item.totalBilled > 0 && (
                          <span className="block text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 font-medium">
                            <AlertTriangle className="inline h-3 w-3 mr-0.5" />
                            {item.totalBilled} item(s) already billed. Cannot return billed items.
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="col-span-4 md:col-span-2">
                      <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Return Qty</label>
                      <input
                        type="number"
                        min="0"
                        max={item.maxQty}
                        className={`h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 disabled:opacity-50 ${
                          requestedExceedsStock
                            ? "border-amber-400 focus:ring-amber-400"
                            : "border-input focus:ring-ring"
                        }`}
                        value={item.qtyToReturn}
                        disabled={item.maxQty === 0}
                        onChange={(event) => updateLineQty(item.goods_receipt_item_id, event.target.value)}
                      />
                    </div>

                    <div className="col-span-8 md:col-span-5">
                      <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Notes / Reason</label>
                      <input
                        type="text"
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                        placeholder="Defective, wrong parts..."
                        value={item.notes}
                        disabled={item.maxQty === 0}
                        onChange={(event) => updateLineNotes(item.goods_receipt_item_id, event.target.value)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <button
            type="button"
            className="rounded-md px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleSubmit}
            disabled={saving || loadingStock}
          >
            {saving ? "Submitting..." : "Submit Return Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnItemsModal;
