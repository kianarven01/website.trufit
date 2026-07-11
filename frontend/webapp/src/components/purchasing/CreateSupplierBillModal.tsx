import { useEffect, useState, useMemo } from "react";
import { X, AlertCircle } from "lucide-react";
import api from "@/api/axios";
import { getCleanApiError, formatDate } from "./purchasingUtils";
import { toast } from "sonner";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export interface BillPurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku?: string | null;
  partNumber?: string | null;
  quantityOrdered: number;
  quantityReceived: number; // Net received quantity
  unitCost: number;
  quantityBilled: number; // Sum of already billed
}

export interface BillPurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  supplierPaymentTerms: string;
  items: BillPurchaseOrderItem[];
}

interface CreateSupplierBillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrder?: BillPurchaseOrder | null;
  purchaseOrders?: BillPurchaseOrder[];
  onSaved?: () => void | Promise<void>;
  onError?: (message: string) => void;
}

interface BillLineItem {
  purchaseOrderItemId: string;
  productName: string;
  sku?: string | null;
  partNumber?: string | null;
  quantityReceived: number;
  alreadyBilled: number;
  maxReceivable: number;
  quantityBilled: string;
  poUnitPrice: number;
  unitPrice: string;
}

export default function CreateSupplierBillModal({
  open,
  onOpenChange,
  purchaseOrder,
  purchaseOrders = [],
  onSaved,
  onError,
}: CreateSupplierBillModalProps) {
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<BillLineItem[]>([]);
  const [saving, setSaving] = useState(false);

  // Set today's date as default bill date
  useEffect(() => {
    if (open && !billDate) {
      const today = new Date().toISOString().split("T")[0];
      setBillDate(today);
    }
  }, [open, billDate]);

  // Set selected PO ID if passed as prop
  useEffect(() => {
    if (open) {
      if (purchaseOrder) {
        setSelectedPurchaseOrderId(purchaseOrder.id);
      } else {
        setSelectedPurchaseOrderId("");
      }
      setBillNumber("");
      setNotes("");
    }
  }, [open, purchaseOrder]);

  const availablePurchaseOrders = useMemo(() => {
    return purchaseOrder ? [purchaseOrder] : purchaseOrders;
  }, [purchaseOrder, purchaseOrders]);

  const selectedPurchaseOrder = useMemo(() => {
    return availablePurchaseOrders.find((po) => po.id === selectedPurchaseOrderId) || null;
  }, [availablePurchaseOrders, selectedPurchaseOrderId]);

  // Auto-calculate Due Date based on Bill Date and Supplier Payment Terms
  useEffect(() => {
    if (!billDate || !selectedPurchaseOrder) return;

    const terms = selectedPurchaseOrder.supplierPaymentTerms || "COD";
    const dateObj = new Date(billDate);

    let daysToAdd = 0;
    if (terms === "NET_15") daysToAdd = 15;
    else if (terms === "NET_30") daysToAdd = 30;
    else if (terms === "NET_45") daysToAdd = 45;
    else if (terms === "NET_60") daysToAdd = 60;

    if (daysToAdd > 0) {
      dateObj.setDate(dateObj.getDate() + daysToAdd);
      setDueDate(dateObj.toISOString().split("T")[0]);
    } else {
      setDueDate(billDate);
    }
  }, [billDate, selectedPurchaseOrder]);

  // Load items when PO is selected
  useEffect(() => {
    if (selectedPurchaseOrder) {
      const lineItems = selectedPurchaseOrder.items.map((item) => {
        const netReceived = item.quantityReceived;
        const alreadyBilled = item.quantityBilled || 0;
        const maxReceivable = Math.max(0, netReceived - alreadyBilled);

        return {
          purchaseOrderItemId: item.id,
          productName: item.productName,
          sku: item.sku,
          partNumber: item.partNumber,
          quantityReceived: netReceived,
          alreadyBilled,
          maxReceivable,
          quantityBilled: String(maxReceivable), // default to billing remaining received
          poUnitPrice: item.unitCost,
          unitPrice: String(item.unitCost), // default to agreed contract price
        };
      });
      setItems(lineItems);
    } else {
      setItems([]);
    }
  }, [selectedPurchaseOrder]);

  const updateItem = (itemId: string, field: "quantityBilled" | "unitPrice", value: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.purchaseOrderItemId === itemId) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // Calculate total billed amount
  const calculatedTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const qty = parseFloat(item.quantityBilled) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      return sum + qty * price;
    }, 0);
  }, [items]);

  // Check if there will be any match exception (quantity or price discrepancy)
  const hasExceptions = useMemo(() => {
    return items.some((item) => {
      const qtyBilled = parseFloat(item.quantityBilled) || 0;
      const invoicePrice = parseFloat(item.unitPrice) || 0;
      const qtyMismatch = qtyBilled > item.maxReceivable;
      const priceMismatch = Math.abs(invoicePrice - item.poUnitPrice) > 0.01;
      return qtyMismatch || priceMismatch;
    });
  }, [items]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedPurchaseOrderId) {
      toast.error("Please select a purchase order.");
      return;
    }
    if (!billNumber.trim()) {
      toast.error("Please enter the supplier invoice number.");
      return;
    }
    if (!billDate) {
      toast.error("Please select the bill date.");
      return;
    }
    if (!dueDate) {
      toast.error("Please select the due date.");
      return;
    }

    const payload = {
      purchase_order_id: selectedPurchaseOrderId,
      bill_number: billNumber.trim(),
      bill_date: billDate,
      due_date: dueDate,
      notes: notes.trim() || null,
      items: items.map((item) => ({
        purchase_order_item_id: item.purchaseOrderItemId,
        quantity_billed: parseInt(item.quantityBilled) || 0,
        unit_price: parseFloat(item.unitPrice) || 0,
      })),
    };

    setSaving(true);
    try {
      const response = await api.post("/purchasing/supplier-bills", payload);
      toast.success(response.data.message || "Supplier bill recorded successfully.");
      onOpenChange(false);
      onSaved?.();
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.response ? getCleanApiError(error) : (error instanceof Error ? error.message : getCleanApiError(error));
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-xl border border-border bg-background shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Record Supplier Bill</h2>
            <p className="text-sm text-muted-foreground">Match supplier invoice quantities and prices against Goods Receipts.</p>
          </div>
          <button type="button" className="rounded-md p-1 text-muted-foreground hover:bg-muted" onClick={() => onOpenChange(false)}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Purchase Order *</label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                value={selectedPurchaseOrderId}
                disabled={Boolean(purchaseOrder)}
                onChange={(event) => setSelectedPurchaseOrderId(event.target.value)}
              >
                <option value="">Select purchase order...</option>
                {availablePurchaseOrders.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.poNumber} ({po.supplierName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Invoice / Bill Number *</label>
              <input
                type="text"
                placeholder="e.g. INV-99801"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Invoice Date *</label>
              <input
                type="date"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Due Date *</label>
              <input
                type="date"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              {selectedPurchaseOrder && (
                <p className="text-[11px] text-amber-600 mt-1 leading-normal font-medium">
                  Terms: <strong>{selectedPurchaseOrder.supplierPaymentTerms ? selectedPurchaseOrder.supplierPaymentTerms.replace("_", " ") : "COD"}</strong>. Due date calculated automatically.
                </p>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <Table className="table-fixed w-full">
              <TableHeader className="bg-muted/50 text-xs text-muted-foreground border-b border-border/80">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[18%] pl-4 py-3 text-center font-medium">Product</TableHead>
                  <TableHead className="w-[10%] py-3 font-medium text-center">Part Number</TableHead>
                  <TableHead className="w-[10%] py-3 font-medium text-center">Net Received</TableHead>
                  <TableHead className="w-[10%] py-3 font-medium text-center">Already Billed</TableHead>
                  <TableHead className="w-[10%] py-3 font-medium text-center">Max Billed</TableHead>
                  <TableHead className="w-[11%] py-3 font-medium text-center">Bill Now</TableHead>
                  <TableHead className="w-[10%] py-3 font-medium text-right">PO Price</TableHead>
                  <TableHead className="w-[11%] py-3 font-medium text-right">Invoice Price</TableHead>
                  <TableHead className="w-[10%] py-3 font-medium text-right pr-6">Line Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-4 py-6 text-center text-muted-foreground" colSpan={9}>
                      No billing items found. Please select a Purchase Order that has received items.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => {
                    const qtyBilledVal = parseFloat(item.quantityBilled) || 0;
                    const priceVal = parseFloat(item.unitPrice) || 0;
                    const lineTotal = qtyBilledVal * priceVal;

                    const qtyException = qtyBilledVal > item.maxReceivable;
                    const priceException = Math.abs(priceVal - item.poUnitPrice) > 0.01;

                    return (
                      <TableRow key={item.purchaseOrderItemId} className="border-b border-border/60 last:border-b-0 hover:bg-transparent">
                        <TableCell className="py-3 text-left pl-4">
                          <p className="font-semibold text-foreground text-sm">{item.productName}</p>
                          {item.sku && <p className="text-[11px] text-muted-foreground leading-none mt-0.5">{item.sku}</p>}
                        </TableCell>
                        <TableCell className="py-3 text-center text-muted-foreground">{item.partNumber || "-"}</TableCell>
                        <TableCell className="py-3 text-center text-muted-foreground">{item.quantityReceived}</TableCell>
                        <TableCell className="py-3 text-center text-muted-foreground">{item.alreadyBilled}</TableCell>
                        <TableCell className="py-3 text-center text-muted-foreground font-semibold">{item.maxReceivable}</TableCell>

                        <TableCell className="py-3">
                          <div className="flex justify-center">
                            <input
                              type="number"
                              min="0"
                              className={`h-9 w-16 rounded-md border text-center text-sm outline-none focus:ring-2 ${qtyException
                                  ? "border-red-500 bg-red-50/10 focus:ring-red-500"
                                  : "border-input bg-background focus:ring-ring"
                                }`}
                              value={item.quantityBilled}
                              onChange={(e) => updateItem(item.purchaseOrderItemId, "quantityBilled", e.target.value)}
                            />
                          </div>
                        </TableCell>

                        <TableCell className="py-3 text-right text-muted-foreground">
                          ₱{item.poUnitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>

                        <TableCell className="py-3">
                          <div className="flex justify-end">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className={`h-9 w-20 rounded-md border px-2 text-right text-sm outline-none focus:ring-2 ${priceException
                                  ? "border-red-500 bg-red-50/10 focus:ring-red-500"
                                  : "border-input bg-background focus:ring-ring"
                                }`}
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.purchaseOrderItemId, "unitPrice", e.target.value)}
                            />
                          </div>
                        </TableCell>

                        <TableCell className="py-3 text-right font-semibold text-foreground pr-6">
                          ₱{lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {hasExceptions && (
            <div className="rounded-lg border border-red-250 bg-red-50/10 p-3 text-xs text-red-800 flex items-start gap-2 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-300">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>
                <strong>Warning:</strong> Discrepancies detected between PO and Invoice values. Saving will flag this bill as a <strong>Match Exception</strong> and require manager approval.
              </span>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">Internal Notes</label>
            <textarea
              placeholder="e.g. Price approved by manager due to emergency delivery fee..."
              className="min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div className="text-left">
              <span className="text-xs text-muted-foreground uppercase tracking-wider block">Total Invoice Value</span>
              <span className="text-xl font-bold text-foreground">
                ₱{calculatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="h-10 rounded-lg border border-input bg-background px-4 text-sm font-medium hover:bg-muted"
                disabled={saving}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-10 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={saving || items.length === 0}
              >
                {saving ? "Saving..." : "Save Invoice"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
