import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import api from "@/api/axios";
import { getCleanApiError } from "./purchasingUtils";

export interface ReceiptPurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  productSupplierId: string;
  quantityOrdered: number;
  quantityReceived: number;
}

export interface ReceiptPurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  status: string;
  items: ReceiptPurchaseOrderItem[];
}

interface ReceiptLineState {
  purchaseOrderItemId: string;
  quantityReceived: string;
  quantityPromo: string;
  quantityRejected: string;
  notes: string;
}

export interface EditGoodsReceiptProps {
  id: string;
  purchaseOrderId: string;
  notes: string;
  allowOverReceiving: boolean;
  items: Array<{
    purchaseOrderItemId: string;
    quantityReceived: string;
    quantityPromo: string;
    quantityRejected: string;
    notes: string;
  }>;
}

interface CreateGoodsReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrder?: ReceiptPurchaseOrder | null;
  purchaseOrders?: ReceiptPurchaseOrder[];
  editGoodsReceipt?: EditGoodsReceiptProps | null;
  onSaved?: () => void | Promise<void>;
  onError?: (message: string) => void;
}



const CreateGoodsReceiptModal = ({
  open,
  onOpenChange,
  purchaseOrder,
  purchaseOrders = [],
  editGoodsReceipt = null,
  onSaved,
  onError,
}: CreateGoodsReceiptModalProps) => {
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState("");
  const [notes, setNotes] = useState("");
  const [allowOverReceiving, setAllowOverReceiving] = useState(false);
  const [items, setItems] = useState<ReceiptLineState[]>([]);
  const [saving, setSaving] = useState(false);

  const availablePurchaseOrders = useMemo(() => {
    const rows = purchaseOrder ? [purchaseOrder] : purchaseOrders;
    if (editGoodsReceipt) {
      return rows;
    }
    return rows.filter((po) => ["WAITING_TO_RECEIVE", "PARTIALLY_RECEIVED", "RETURNED"].includes(String(po.status).toUpperCase()));
  }, [purchaseOrder, purchaseOrders, editGoodsReceipt]);

  const selectedPurchaseOrder = useMemo(() => {
    return availablePurchaseOrders.find((po) => po.id === selectedPurchaseOrderId) || null;
  }, [availablePurchaseOrders, selectedPurchaseOrderId]);

  useEffect(() => {
    if (!open) return;

    if (editGoodsReceipt) {
      setSelectedPurchaseOrderId(editGoodsReceipt.purchaseOrderId);
      setNotes(editGoodsReceipt.notes || "");
      setAllowOverReceiving(editGoodsReceipt.allowOverReceiving || false);
    } else {
      const defaultPo = purchaseOrder || availablePurchaseOrders[0] || null;
      setSelectedPurchaseOrderId(defaultPo?.id || "");
      setNotes("");
      setAllowOverReceiving(false);
    }
  }, [open, purchaseOrder, availablePurchaseOrders.length, editGoodsReceipt]);

  useEffect(() => {
    if (!selectedPurchaseOrder) {
      setItems([]);
      return;
    }

    if (editGoodsReceipt && editGoodsReceipt.purchaseOrderId === selectedPurchaseOrder.id) {
      setItems(
        selectedPurchaseOrder.items.map((item) => {
          const existingItem = editGoodsReceipt.items.find((i) => i.purchaseOrderItemId === item.id);
          return {
            purchaseOrderItemId: item.id,
            quantityReceived: existingItem ? String(existingItem.quantityReceived) : "0",
            quantityPromo: existingItem ? String(existingItem.quantityPromo) : "0",
            quantityRejected: existingItem ? String(existingItem.quantityRejected) : "0",
            notes: existingItem ? (existingItem.notes || "") : "",
          };
        })
      );
    } else {
      setItems(
        selectedPurchaseOrder.items.map((item) => {
          const remaining = Math.max(0, item.quantityOrdered - item.quantityReceived);
          return {
            purchaseOrderItemId: item.id,
            quantityReceived: remaining > 0 ? String(remaining) : "0",
            quantityPromo: "0",
            quantityRejected: "0",
            notes: "",
          };
        })
      );
    }
  }, [selectedPurchaseOrder?.id, open, editGoodsReceipt]);

  const updateItem = (purchaseOrderItemId: string, changes: Partial<ReceiptLineState>) => {
    setItems((current) =>
      current.map((item) =>
        item.purchaseOrderItemId === purchaseOrderItemId ? { ...item, ...changes } : item
      )
    );
  };

  const handleSave = async (approveAfterCreate: boolean) => {
    if (!selectedPurchaseOrder) {
      onError?.("Please select a purchase order.");
      return;
    }

    const payloadItems = items
      .map((item) => {
        const poItem = selectedPurchaseOrder.items.find((row) => row.id === item.purchaseOrderItemId);
        const remaining = Math.max(0, (poItem?.quantityOrdered || 0) - (poItem?.quantityReceived || 0));
        const quantityReceived = Number(item.quantityReceived || 0);

        if (!allowOverReceiving && quantityReceived > remaining) {
          throw new Error(`Received quantity for ${poItem?.productName || "an item"} cannot exceed remaining quantity.`);
        }

        return {
          purchase_order_item_id: item.purchaseOrderItemId,
          quantity_received: quantityReceived,
          quantity_promo: Number(item.quantityPromo || 0),
          quantity_rejected: Number(item.quantityRejected || 0),
          notes: item.notes || null,
        };
      })
      .filter((item) => item.quantity_received > 0 || item.quantity_promo > 0 || item.quantity_rejected > 0);

    if (payloadItems.length === 0) {
      onError?.("Please enter at least one received quantity.");
      return;
    }

    setSaving(true);

    try {
      if (editGoodsReceipt) {
        await api.put(`/purchasing/goods-receipts/${editGoodsReceipt.id}`, {
          notes: notes || null,
          allow_over_receiving: allowOverReceiving,
          items: payloadItems,
        });
      } else {
        await api.post("/purchasing/goods-receipts", {
          purchase_order_id: selectedPurchaseOrder.id,
          notes: notes || null,
          allow_over_receiving: allowOverReceiving,
          items: payloadItems,
        });
      }

      await onSaved?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.response ? getCleanApiError(error) : (error instanceof Error ? error.message : getCleanApiError(error));
      onError?.(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-background shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">{editGoodsReceipt ? "Edit Goods Receipt" : "New Goods Receipt"}</h2>
            <p className="text-sm text-muted-foreground">Record supplier delivery and received quantities.</p>
          </div>
          <button type="button" className="rounded-md p-1 text-muted-foreground hover:bg-muted" onClick={() => onOpenChange(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[75vh] space-y-5 overflow-y-auto px-6 py-5">
          <div>
            <label className="mb-1 block text-sm font-medium">Purchase Order *</label>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
              value={selectedPurchaseOrderId}
              disabled={Boolean(purchaseOrder) || Boolean(editGoodsReceipt)}
              onChange={(event) => setSelectedPurchaseOrderId(event.target.value)}
            >
              <option value="">Select purchase order...</option>
              {availablePurchaseOrders.map((po) => (
                <option key={po.id} value={po.id}>
                  {po.poNumber} — {po.supplierName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-lg border p-3 bg-muted/20">
            <input
              id="allow_over_receiving"
              type="checkbox"
              checked={allowOverReceiving}
              onChange={(e) => setAllowOverReceiving(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <div className="grid gap-1.5 leading-none">
              <label htmlFor="allow_over_receiving" className="text-sm font-medium leading-none cursor-pointer">
                Allow Over-receiving
              </label>
              <p className="text-xs text-muted-foreground">
                Check this to receive quantities greater than the remaining ordered quantity.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Part</th>
                  <th className="px-4 py-3 text-right font-semibold">Ordered</th>
                  <th className="px-4 py-3 text-right font-semibold">Received</th>
                  <th className="px-4 py-3 text-right font-semibold">Remaining</th>
                  <th className="px-4 py-3 text-right font-semibold">Receive Now</th>
                  <th className="px-4 py-3 text-right font-semibold">Free / Promo</th>
                </tr>
              </thead>
              <tbody>
                {!selectedPurchaseOrder || selectedPurchaseOrder.items.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-muted-foreground" colSpan={5}>
                      No receivable purchase order items found.
                    </td>
                  </tr>
                ) : (
                  selectedPurchaseOrder.items.map((poItem) => {
                    const line = items.find((item) => item.purchaseOrderItemId === poItem.id);
                    const remaining = Math.max(0, poItem.quantityOrdered - poItem.quantityReceived);

                    return (
                      <tr key={poItem.id} className="border-t border-border/60">
                        <td className="px-4 py-3 font-medium">{poItem.productName}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{poItem.quantityOrdered}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{poItem.quantityReceived}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{remaining}</td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="number"
                            min="0"
                            max={allowOverReceiving ? undefined : remaining}
                            className="h-9 w-24 rounded-md border border-input bg-background px-3 text-right text-sm outline-none focus:ring-2 focus:ring-ring"
                            value={line?.quantityReceived || "0"}
                            onChange={(event) => updateItem(poItem.id, { quantityReceived: event.target.value })}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="number"
                            min="0"
                            className="h-9 w-24 rounded-md border border-input bg-background px-3 text-right text-sm outline-none focus:ring-2 focus:ring-ring"
                            value={line?.quantityPromo || "0"}
                            onChange={(event) => updateItem(poItem.id, { quantityPromo: event.target.value })}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Notes</label>
            <textarea
              className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. 2 units missing from delivery..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <button type="button" className="rounded-md px-4 py-2 text-sm text-muted-foreground hover:bg-muted" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </button>
          <button
            type="button"
            className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGoodsReceiptModal;
