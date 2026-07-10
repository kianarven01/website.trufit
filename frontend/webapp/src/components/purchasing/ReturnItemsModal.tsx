import { useEffect, useState } from "react";
import { X } from "lucide-react";
import api from "@/api/axios";
import { getCleanApiError } from "./purchasingUtils";

interface GoodsReceiptItemModel {
  id: string;
  quantityReceived?: number;
  quantity_received?: number;
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
  productName: string;
  sku: string;
  maxQty: number;
  qtyToReturn: string;
  notes: string;
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

  useEffect(() => {
    if (!open || !goodsReceipt) return;

    const lines = goodsReceipt.items.map((item) => {
      const quantityReceived = item.quantityReceived ?? item.quantity_received ?? 0;
      const quantityReturned = item.quantityReturned ?? item.quantity_returned ?? 0;
      const maxQty = Number(quantityReceived) - Number(quantityReturned);

      const productName = item.productName ?? item.product?.name ?? "Unnamed Product";
      const sku = item.sku ?? item.product?.sku ?? "-";

      return {
        goods_receipt_item_id: item.id,
        productName: productName,
        sku: sku,
        maxQty: maxQty > 0 ? maxQty : 0,
        qtyToReturn: "0",
        notes: "",
      };
    });

    setItems(lines);
  }, [open, goodsReceipt]);

  const updateLineQty = (itemId: string, value: string) => {
    setItems((current) =>
      current.map((item) => {
        if (item.goods_receipt_item_id !== itemId) return item;

        // Constraint checking
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
      await api.post(`/purchasing/goods-receipts/${goodsReceipt.id}/return`, {
        items: itemsToSubmit,
      });

      await onSaved?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      onError?.(getCleanApiError(error, "Failed to submit returns."));
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
            <h2 className="text-lg font-semibold">Return Items to Supplier</h2>
            <p className="text-sm text-muted-foreground">
              Return goods from Goods Receipt: <span className="font-semibold text-foreground">{goodsReceipt.receiptNumber}</span>
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
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Received Items</h3>

            <div className="space-y-2 rounded-xl border border-border p-3">
              {items.map((item) => (
                <div
                  key={item.goods_receipt_item_id}
                  className="grid grid-cols-12 gap-3 items-start border-b border-border/40 pb-3 last:border-0 last:pb-0"
                >
                  <div className="col-span-12 md:col-span-5">
                    <p className="font-medium text-sm text-foreground">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Max returnable quantity: <span className="font-semibold text-foreground">{item.maxQty}</span>
                    </p>
                  </div>

                  <div className="col-span-4 md:col-span-2">
                    <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Return Qty</label>
                    <input
                      type="number"
                      min="0"
                      max={item.maxQty}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
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
              ))}
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
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Processing..." : "Process Return"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnItemsModal;
