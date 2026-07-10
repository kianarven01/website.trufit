import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import api from "@/api/axios";
import { formatCurrency, getRows, getCleanApiError } from "./purchasingUtils";

interface SupplierOption {
  id: string;
  name: string;
}

interface ProductSupplierOption {
  id: string;
  product_id: string;
  supplier_id: string;
  supplier_cost?: number | string | null;
}

interface ProductOption {
  id: string;
  name: string;
  sku?: string | null;
  productSuppliers: ProductSupplierOption[];
}

interface LineItemState {
  id: string;
  productId: string;
  productSupplierId: string;
  quantity: string;
  unitCost: string;
}

interface NewPurchaseOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void | Promise<void>;
  onError?: (message: string) => void;
  editPurchaseOrder?: {
    id: string;
    supplierId: string;
    orderDate: string;
    requestShipDate: string;
    remarks: string;
    items: Array<{
      id: string;
      productId: string;
      productSupplierId: string;
      quantity: string;
      unitCost: string;
    }>;
  };
}



const normalizeSupplier = (row: any): SupplierOption => ({
  id: String(row.id ?? row.supplier_id ?? ""),
  name: String(row.name ?? row.CompanyName ?? row.company_name ?? row.supplier_name ?? "Unnamed Supplier"),
});

const normalizeProduct = (row: any): ProductOption => {
  const productSuppliersRaw = Array.isArray(row.product_suppliers)
    ? row.product_suppliers
    : Array.isArray(row.productSuppliers)
      ? row.productSuppliers
      : Array.isArray(row.suppliers)
        ? row.suppliers.map((supplier: any) => ({
            id: supplier.pivot?.id ?? supplier.product_supplier_id ?? supplier.id,
            product_id: row.id,
            supplier_id: supplier.pivot?.supplier_id ?? supplier.supplier_id ?? supplier.id,
            supplier_cost: supplier.pivot?.supplier_cost ?? supplier.supplier_cost,
          }))
        : [];

  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? row.product_name ?? row.ProductName ?? "Unnamed Product"),
    sku: row.SKU ?? row.sku ?? null,
    productSuppliers: productSuppliersRaw.map((ps: any) => ({
      id: String(ps.id ?? ps.product_supplier_id ?? ps.pivot?.id ?? ""),
      product_id: String(ps.product_id ?? ps.productID ?? row.id ?? ""),
      supplier_id: String(ps.supplier_id ?? ps.SupplierID ?? ps.pivot?.supplier_id ?? ""),
      supplier_cost: ps.supplier_cost ?? ps.cost ?? ps.pivot?.supplier_cost ?? null,
    })),
  };
};

const createEmptyLine = (): LineItemState => ({
  id: crypto.randomUUID(),
  productId: "",
  productSupplierId: "",
  quantity: "1",
  unitCost: "0",
});

const NewPurchaseOrderModal = ({
  open,
  onOpenChange,
  onSaved,
  onError,
  editPurchaseOrder,
}: NewPurchaseOrderModalProps) => {
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [requestShipDate, setRequestShipDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [items, setItems] = useState<LineItemState[]>([createEmptyLine()]);
  const [saving, setSaving] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const supplierProducts = useMemo(() => {
    if (!supplierId) return [];

    return products.filter((product) =>
      product.productSuppliers.some((ps) => String(ps.supplier_id) === String(supplierId))
    );
  }, [products, supplierId]);

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const quantity = Number(item.quantity || 0);
        const unitCost = Number(item.unitCost || 0);
        return sum + quantity * unitCost;
      }, 0),
    [items]
  );

  const loadOptions = async () => {
    setLoadingOptions(true);

    try {
      const [supplierRes, productRes] = await Promise.all([
        api.get("/products/suppliers"),
        api.get("/products"),
      ]);

      setSuppliers(getRows(supplierRes.data).map(normalizeSupplier).filter((row) => row.id));
      setProducts(getRows(productRes.data).map(normalizeProduct).filter((row) => row.id));
    } catch (error) {
      console.error(error);
      onError?.("Failed to load suppliers and products.");
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    void loadOptions();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (editPurchaseOrder) {
      setSupplierId(editPurchaseOrder.supplierId);
      setOrderDate(editPurchaseOrder.orderDate ? editPurchaseOrder.orderDate.slice(0, 10) : new Date().toISOString().slice(0, 10));
      setRequestShipDate(editPurchaseOrder.requestShipDate ? editPurchaseOrder.requestShipDate.slice(0, 10) : "");
      setRemarks(editPurchaseOrder.remarks || "");
      setItems(
        editPurchaseOrder.items.length > 0
          ? editPurchaseOrder.items.map((item) => ({
              id: item.id || crypto.randomUUID(),
              productId: item.productId,
              productSupplierId: item.productSupplierId,
              quantity: item.quantity,
              unitCost: item.unitCost,
            }))
          : [createEmptyLine()]
      );
    } else {
      setSupplierId("");
      setOrderDate(new Date().toISOString().slice(0, 10));
      setRequestShipDate("");
      setRemarks("");
      setItems([createEmptyLine()]);
    }
  }, [open, editPurchaseOrder]);

  const updateItem = (itemId: string, changes: Partial<LineItemState>) => {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== itemId) return item;

        const updated = { ...item, ...changes };

        if (changes.productId) {
          const selectedProduct = products.find((product) => product.id === changes.productId);
          const selectedProductSupplier = selectedProduct?.productSuppliers.find(
            (ps) => String(ps.supplier_id) === String(supplierId)
          );

          updated.productSupplierId = selectedProductSupplier?.id || "";
          updated.unitCost = String(selectedProductSupplier?.supplier_cost ?? "0");
        }

        return updated;
      })
    );
  };

  const addLine = () => setItems((current) => [...current, createEmptyLine()]);

  const removeLine = (itemId: string) => {
    setItems((current) => (current.length <= 1 ? current : current.filter((item) => item.id !== itemId)));
  };

  const handleSubmit = async () => {
    if (!supplierId) {
      onError?.("Please select a supplier.");
      return;
    }

    const validItems = items.filter(
      (item) => item.productId && item.productSupplierId && Number(item.quantity) > 0
    );

    if (validItems.length === 0) {
      onError?.("Please add at least one valid line item.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        supplier_id: supplierId,
        order_date: orderDate,
        request_ship_date: requestShipDate || null,
        remarks: remarks || null,
        items: validItems.map((item) => ({
          product_id: item.productId,
          product_supplier_id: item.productSupplierId,
          quantity_ordered: Number(item.quantity),
          unit_cost: Number(item.unitCost || 0),
        })),
      };

      if (editPurchaseOrder) {
        await api.put(`/purchasing/purchase-orders/${editPurchaseOrder.id}`, payload);
      } else {
        await api.post("/purchasing/purchase-orders", payload);
      }

      await onSaved?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      onError?.(getCleanApiError(error));
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
            <h2 className="text-lg font-semibold">{editPurchaseOrder ? "Edit Purchase Order" : "New Purchase Order"}</h2>
            <p className="text-sm text-muted-foreground">
              {editPurchaseOrder ? "Modify this draft purchase order." : "Create a draft purchase order for supplier replenishment."}
            </p>
          </div>
          <button type="button" className="rounded-md p-1 text-muted-foreground hover:bg-muted" onClick={() => onOpenChange(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[75vh] space-y-5 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-3">
              <label className="mb-1 block text-sm font-medium">Supplier *</label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={supplierId}
                disabled={loadingOptions}
                onChange={(event) => {
                  setSupplierId(event.target.value);
                  setItems([createEmptyLine()]);
                }}
              >
                <option value="">Select supplier...</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Order Date</label>
              <input
                type="date"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={orderDate}
                onChange={(event) => setOrderDate(event.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Expected Delivery</label>
              <input
                type="date"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={requestShipDate}
                onChange={(event) => setRequestShipDate(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Line Items</h3>
              <button type="button" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline" onClick={addLine}>
                <Plus size={15} /> Add Line
              </button>
            </div>

            <div className="space-y-2 rounded-xl border border-border p-3">
              {items.map((item) => {
                const lineTotal = Number(item.quantity || 0) * Number(item.unitCost || 0);

                return (
                  <div key={item.id} className="grid grid-cols-12 gap-2">
                    <select
                      className="col-span-12 h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring md:col-span-5"
                      value={item.productId}
                      disabled={!supplierId}
                      onChange={(event) => updateItem(item.id, { productId: event.target.value })}
                    >
                      <option value="">Select part...</option>
                      {supplierProducts.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      className="col-span-4 h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring md:col-span-2"
                      value={item.quantity}
                      onChange={(event) => updateItem(item.id, { quantity: event.target.value })}
                    />

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="col-span-5 h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring md:col-span-3"
                      value={item.unitCost}
                      onChange={(event) => updateItem(item.id, { unitCost: event.target.value })}
                    />

                    <div className="col-span-2 flex items-center justify-end text-sm font-medium md:col-span-1">
                      {formatCurrency(lineTotal)}
                    </div>

                    <button
                      type="button"
                      className="col-span-1 flex h-10 items-center justify-center rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                      onClick={() => removeLine(item.id)}
                      disabled={items.length <= 1}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Notes</label>
            <textarea
              className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder="Optional remarks..."
            />
          </div>

          <div className="rounded-xl bg-muted/40 px-4 py-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total</span>
              <span className="text-xl font-bold">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <button type="button" className="rounded-md px-4 py-2 text-sm text-muted-foreground hover:bg-muted" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </button>
          <button
            type="button"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? (editPurchaseOrder ? "Saving..." : "Creating...") : (editPurchaseOrder ? "Save Changes" : "Create PO")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewPurchaseOrderModal;
