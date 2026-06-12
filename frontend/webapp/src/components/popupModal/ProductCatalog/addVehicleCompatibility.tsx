import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/api/axios";

interface AddVehicleCompatibilityProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  onSaved?: () => Promise<void> | void;
}

interface VehicleVariantOption {
  id: string;
  label: string;
  make?: string;
  model?: string;
  variant?: string;
  year?: string;
}

const getRows = (data: any): any[] => {
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
};

const normalizeVariant = (row: any, parent?: any): VehicleVariantOption | null => {
  const id = row.id ?? row.variant_id ?? row.car_variant_id;
  if (!id) return null;

  const make =
    parent?.manufacturer?.name ||
    parent?.Manufacturer?.name ||
    parent?.make ||
    parent?.brand ||
    row.make ||
    row.manufacturer_name ||
    row.brand_name ||
    "";

  const model =
    parent?.model ||
    parent?.name ||
    parent?.vehicle_model ||
    row.model ||
    row.vehicle_model ||
    row.model_name ||
    "";

  const variant =
    row.variant_name ||
    row.name ||
    row.variant ||
    row.trim ||
    "Variant";

  const year = row.year ? String(row.year) : "";
  const engine = row.engine || row.engine_displacement || "";

  const label = [make, model, variant, year, engine]
    .filter(Boolean)
    .join(" • ");

  return {
    id: String(id),
    label: label || `Variant #${id}`,
    make,
    model,
    variant,
    year,
  };
};

const flattenVehicleVariants = (rows: any[]): VehicleVariantOption[] => {
  const variants: VehicleVariantOption[] = [];

  rows.forEach((vehicle) => {
    const nestedVariants =
      vehicle.variants ||
      vehicle.vehicle_variants ||
      vehicle.VehicleVariants ||
      vehicle.car_variants ||
      vehicle.CarVariants ||
      [];

    if (Array.isArray(nestedVariants) && nestedVariants.length > 0) {
      nestedVariants.forEach((variant: any) => {
        const normalized = normalizeVariant(variant, vehicle);
        if (normalized) variants.push(normalized);
      });
      return;
    }

    const normalized = normalizeVariant(vehicle);
    if (normalized) variants.push(normalized);
  });

  const unique = new Map<string, VehicleVariantOption>();
  variants.forEach((variant) => unique.set(variant.id, variant));

  return Array.from(unique.values()).sort((a, b) =>
    a.label.localeCompare(b.label)
  );
};

const AddVehicleCompatibility: React.FC<AddVehicleCompatibilityProps> = ({
  open,
  onOpenChange,
  productId,
  onSaved,
}) => {
  const [variants, setVariants] = useState<VehicleVariantOption[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [manualVariantId, setManualVariantId] = useState("");
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState("");
  const [applyToEquivalents, setApplyToEquivalents] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [saving, setSaving] = useState(false);

  const filteredVariants = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return variants;

    return variants.filter((variant) =>
      variant.label.toLowerCase().includes(keyword)
    );
  }, [variants, search]);

  const loadVariants = async () => {
    setLoadingVariants(true);

    try {
      // This endpoint is expected to return vehicles with nested variants.
      // The normalizer below is flexible for different response shapes.
      const res = await api.get("/vehicles");
      const rows = getRows(res.data);
      setVariants(flattenVehicleVariants(rows));
    } catch (error) {
      console.error("Failed to load vehicle variants:", error);
      setVariants([]);
    } finally {
      setLoadingVariants(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setSelectedVariantId("");
      setManualVariantId("");
      setSearch("");
      setNotes("");
      setApplyToEquivalents(false);
      setSaving(false);
      return;
    }

    void loadVariants();
  }, [open]);

  const handleSave = async () => {
    const variantId = selectedVariantId || manualVariantId.trim();

    if (!variantId) {
      alert("Please select a vehicle variant.");
      return;
    }

    try {
      setSaving(true);

      await api.post(`/products/${productId}/vehicle-compatibilities`, {
        car_variant_id: Number(variantId),
        notes: notes.trim() || null,
        apply_to_equivalents: applyToEquivalents,
      });

      await onSaved?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to save vehicle compatibility:", error);
      alert(
        error?.response?.data?.message ||
          "Failed to save vehicle compatibility. Please check the selected vehicle."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add Vehicle Compatibility
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Vehicle Variant</label>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search make, model, variant, year, engine"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Vehicle Variant</label>
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none"
              value={selectedVariantId}
              onChange={(event) => {
                setSelectedVariantId(event.target.value);
                if (event.target.value) setManualVariantId("");
              }}
              disabled={loadingVariants}
            >
              <option value="">
                {loadingVariants ? "Loading variants..." : "Select vehicle variant"}
              </option>
              {filteredVariants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.label}
                </option>
              ))}
            </select>
          </div>

          {variants.length === 0 && !loadingVariants && (
            <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
              <p className="text-xs text-muted-foreground">
                No variants were loaded from the vehicle endpoint. You can temporarily enter the car_variant_id manually.
              </p>
              <Input
                value={manualVariantId}
                onChange={(event) => {
                  setManualVariantId(event.target.value);
                  if (event.target.value) setSelectedVariantId("");
                }}
                placeholder="Enter car_variant_id"
                type="number"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              className="w-full min-h-[80px] rounded-md border border-border bg-background px-3 py-2 text-sm outline-none resize-none"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional fitment notes"
            />
          </div>

          <label className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 p-3 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={applyToEquivalents}
              onChange={(event) => setApplyToEquivalents(event.target.checked)}
            />
            <span>
              <span className="font-medium">
                Also apply this vehicle compatibility to equivalent products
              </span>
              <span className="block text-xs text-muted-foreground">
                This copies the same vehicle variant to products in the same equivalent group. Existing records will be skipped.
              </span>
            </span>
          </label>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || (!selectedVariantId && !manualVariantId.trim())}>
            {saving ? "Saving..." : "Save Compatibility"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddVehicleCompatibility;
