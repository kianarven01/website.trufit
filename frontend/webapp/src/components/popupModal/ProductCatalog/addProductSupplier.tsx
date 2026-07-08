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
import { toNumberOrNull } from "@/lib/format";

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

type PricingMode = "markup" | "manual";

const formatNumberInput = (value: number | null): string => {
  if (value === null || !Number.isFinite(value)) return "";
  return value.toFixed(2);
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
  const [pricingMode, setPricingMode] = useState<PricingMode>("manual");
  const [isVat, setIsVat] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  

  const costValue = useMemo(() => toNumberOrNull(supplierCost), [supplierCost]);
  const markupValue = useMemo(() => toNumberOrNull(markup), [markup]);
  const priceValue = useMemo(() => toNumberOrNull(price), [price]);

  const PH_VAT_PERCENT = 12;

  const computedPrice = useMemo(() => {
    if (costValue === null || markupValue === null) return null;

    return costValue + costValue * (markupValue / 100);
  }, [costValue, markupValue]);

  const computedMarkup = useMemo(() => {
    if (costValue === null || costValue <= 0 || priceValue === null) return null;

    return ((priceValue - costValue) / costValue) * 100;
  }, [costValue, priceValue]);

  const displayedPrice =
    pricingMode === "markup" ? formatNumberInput(computedPrice) : price;

  const displayedMarkup =
    pricingMode === "manual" ? formatNumberInput(computedMarkup) : markup;

  const resetForm = () => {
    setSupplierId("");
    setSupplierCost("");
    setMarkup("");
    setPrice("");
    setPricingMode("manual");
    setIsVat(false);
    
  };

  const handlePricingModeChange = (nextMode: PricingMode) => {
    setPricingMode(nextMode);

    if (nextMode === "markup") {
      setPrice("");
    }

    if (nextMode === "manual") {
      setMarkup("");
    }
  };

  const handleSave = async () => {
    if (!supplierId) {
      alert("Please select a supplier.");
      return;
    }

    const finalCost = costValue;
    const finalMarkup =
      pricingMode === "manual" ? computedMarkup : markupValue;

    const finalPrice =
      pricingMode === "markup" ? computedPrice : priceValue;

    if (finalCost === null) {
      setValidationError("Please enter supplier cost.");
      return;
    }

    if (finalPrice === null) {
      setValidationError("Please enter a selling price or provide markup to calculate it.");
      return;
    }

    setValidationError(null);
    setSaving(true);

    try {
      await api.post(`/products/${productId}/suppliers`, {
        supplier_id: supplierId,
        supplier_cost: finalCost,
        markup: finalMarkup,
        price: finalPrice,
        is_vat: isVat,
        vat_percent: isVat ? PH_VAT_PERCENT : null,
      });

      resetForm();
      onOpenChange(false);
      await onSaved?.();
    } catch (error) {
      console.error("Failed to add supplier to product:", error);
      setValidationError("Failed to add supplier. Please check the console or backend response.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
      setValidationError(null);
    }

    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Supplier</DialogTitle>
        </DialogHeader>

        {validationError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {validationError}
          </div>
        )}

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

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Advanced Pricing</p>
              <p className="text-xs text-muted-foreground">
                {pricingMode === "markup"
                  ? "Markup mode calculates selling price automatically."
                  : "Manual mode calculates markup automatically."}
              </p>
            </div>

            <div className="flex rounded-md border overflow-hidden">
              <button
                type="button"
                onClick={() => handlePricingModeChange("manual")}
                className={`px-3 py-1.5 text-xs ${
                  pricingMode === "manual"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground"
                }`}
              >
                Manual
              </button>

              <button
                type="button"
                onClick={() => handlePricingModeChange("markup")}
                className={`px-3 py-1.5 text-xs border-l ${
                  pricingMode === "markup"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground"
                }`}
              >
                Markup
              </button>
            </div>
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Markup %</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder={
                  pricingMode === "manual"
                    ? "Auto-calculated"
                    : "Example: 40"
                }
                value={displayedMarkup}
                disabled={pricingMode === "manual"}
                onChange={(event) => setMarkup(event.target.value)}
                className={pricingMode === "manual" ? "opacity-70" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label>Selling Price</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder={
                  pricingMode === "markup"
                    ? "Auto-calculated"
                    : "Enter selling price"
                }
                value={displayedPrice}
                disabled={pricingMode === "markup"}
                onChange={(event) => setPrice(event.target.value)}
                className={pricingMode === "markup" ? "opacity-70" : ""}
              />
            </div>
          </div>

          <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
            {pricingMode === "markup" ? (
              <p>
                Selling price will be calculated using:{" "}
                <span className="font-medium text-foreground">
                  Cost + Cost × Markup %
                </span>
              </p>
            ) : (
              <p>
                Markup will be calculated using:{" "}
                <span className="font-medium text-foreground">
                  (Selling Price - Cost) ÷ Cost × 100
                </span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-2">
              <input
                id="is_vat"
                type="checkbox"
                checked={isVat}
                onChange={(event) => setIsVat(event.target.checked)}
              />
              <Label htmlFor="is_vat">VAT</Label>
            </div>

            {isVat && (
              <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                VAT: {PH_VAT_PERCENT}%
              </span>
            )}
          </div>

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