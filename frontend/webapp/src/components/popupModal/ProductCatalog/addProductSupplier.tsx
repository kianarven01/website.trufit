import React, { useMemo, useState } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SupplierOption {
  id: string;
  name: string;
  supplier_code?: string;
}

interface AddProductSupplierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  suppliers: SupplierOption[];
  onSaved?: () => void | Promise<void>;
}

const toNumberOrNull = (value: string): number | null => {
  if (value.trim() === "") return null;

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const AddProductSupplierModal: React.FC<AddProductSupplierModalProps> = ({
  open,
  onOpenChange,
  productId,
  suppliers,
  onSaved,
}) => {
  const [supplierId, setSupplierId] = useState("");
  const [supplierCost, setSupplierCost] = useState("");
  const [markup, setMarkup] = useState("");
  const [price, setPrice] = useState("");
  const [isVat, setIsVat] = useState(false);
  const [vatPercent, setVatPercent] = useState("");
  const [saving, setSaving] = useState(false);

  const computedPrice = useMemo(() => {
    const costValue = toNumberOrNull(supplierCost);
    const markupValue = toNumberOrNull(markup);

    if (costValue === null || markupValue === null) {
      return null;
    }

    return costValue + costValue * (markupValue / 100);
  }, [supplierCost, markup]);

  const resetForm = () => {
    setSupplierId("");
    setSupplierCost("");
    setMarkup("");
    setPrice("");
    setIsVat(false);
    setVatPercent("");
  };

  const handleSave = async () => {
    if (!supplierId) {
      alert("Please select a supplier.");
      return;
    }

    setSaving(true);

    try {
      const manualPrice = toNumberOrNull(price);
      const finalPrice = manualPrice ?? computedPrice;

      await api.post(`/products/${productId}/suppliers`, {
        supplier_id: supplierId,
        supplier_cost: toNumberOrNull(supplierCost),
        markup: toNumberOrNull(markup),
        price: finalPrice,
        is_vat: isVat,
        vat_percent: isVat ? toNumberOrNull(vatPercent) : null,
      });

      resetForm();
      onOpenChange(false);
      await onSaved?.();
    } catch (error) {
      console.error("Failed to add supplier to product:", error);
      alert("Failed to add supplier. Please check the console or backend response.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }

    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Supplier</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Supplier</Label>
            <select
              value={supplierId}
              onChange={(event) => setSupplierId(event.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                  {supplier.supplier_code ? ` (${supplier.supplier_code})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Supplier Cost</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={supplierCost}
                onChange={(event) => setSupplierCost(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Markup %</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Example: 40"
                value={markup}
                onChange={(event) => setMarkup(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Selling Price</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder={
                computedPrice !== null
                  ? `Auto: ${computedPrice.toFixed(2)}`
                  : "Optional manual price"
              }
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to use the computed price from supplier cost and markup.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="is_vat"
              type="checkbox"
              checked={isVat}
              onChange={(event) => setIsVat(event.target.checked)}
            />
            <Label htmlFor="is_vat">VAT included</Label>
          </div>

          {isVat && (
            <div className="space-y-2">
              <Label>VAT Percent</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Example: 12"
                value={vatPercent}
                onChange={(event) => setVatPercent(event.target.value)}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Supplier"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductSupplierModal;