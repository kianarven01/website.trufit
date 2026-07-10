import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Combobox from "@/components/ui/combobox";
import api from "@/api/axios";
import { toast } from "sonner";
import AddVehicleVariant from "@/components/popupModal/ProductCatalog/addVehicleVariant";

interface AddVehicleCompatibilityProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  onSaved?: () => Promise<void> | void;
}

interface VehicleModel {
  id: string;
  modelId: string;
  year: string;
  make: string;
  model: string;
  variant: string;
  variantId: string;
}

const toTitleCase = (str: string) => {
  if (!str) return "";
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
};

const normalize = (val: string) => val?.trim().toLowerCase();

const AddVehicleCompatibility: React.FC<AddVehicleCompatibilityProps> = ({
  open,
  onOpenChange,
  productId,
  onSaved,
}) => {
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  const [manufacturers, setManufacturers] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isLoadingManufacturers, setIsLoadingManufacturers] = useState(false);

  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedVariantName, setSelectedVariantName] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");

  const [notes, setNotes] = useState("");
  const [applyToEquivalents, setApplyToEquivalents] = useState(false);
  const [saving, setSaving] = useState(false);

  const [addVariantOpen, setAddVariantOpen] = useState(false);

  /* ================= LOAD DATA ================= */
  const loadVehicleModels = async () => {
    setIsLoadingModels(true);
    try {
      const res = await api.get("/products/vehicles");
      const rows = res.data?.data ?? [];
      const models: VehicleModel[] = [];

      rows.forEach((vehicle: any) => {
        const variants = vehicle.variants || vehicle.vehicle_variants || [];
        const make = vehicle.manufacturer?.name || "";

        if (Array.isArray(variants) && variants.length > 0) {
          variants.forEach((v: any) => {
            models.push({
              id: String(v.id),
              modelId: String(vehicle.id),
              year: v.year ? String(v.year) : "",
              make,
              model: vehicle.model || "",
              variant: v.variant_name || v.name || "Variant",
              variantId: String(v.id),
            });
          });
        } else {
          models.push({
            id: String(vehicle.id),
            modelId: String(vehicle.id),
            year: "",
            make,
            model: vehicle.model || "",
            variant: "",
            variantId: "",
          });
        }
      });

      setVehicleModels(models);
    } catch (error) {
      console.error("Failed to load vehicle models:", error);
      setVehicleModels([]);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const loadManufacturers = async () => {
    setIsLoadingManufacturers(true);
    try {
      const res = await api.get("/vehicles/manufacturers");
      setManufacturers(res.data?.data || []);
    } catch (error) {
      console.error("Failed to load manufacturers:", error);
    } finally {
      setIsLoadingManufacturers(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    loadVehicleModels();
    loadManufacturers();
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSelectedMake("");
      setSelectedModel("");
      setSelectedVariantName("");
      setSelectedVariantId("");
      setNotes("");
      setApplyToEquivalents(false);
      setSaving(false);
    }
  }, [open]);

  /* ================= FILTERS ================= */
  const makes = useMemo(() => {
    const fromModels = vehicleModels.map((v) => v.make.trim());
    const fromManufacturers = manufacturers.map((m) => m.name.trim());
    return [...new Set([...fromModels, ...fromManufacturers].filter(Boolean))];
  }, [vehicleModels, manufacturers]);

  const models = useCallback(
    (make: string) =>
      [...new Set(
        vehicleModels
          .filter((v) => normalize(v.make) === normalize(make))
          .map((v) => v.model.trim())
          .filter(Boolean)
      )],
    [vehicleModels]
  );

  const variants = useCallback(
    (make: string, model: string) =>
      vehicleModels
        .filter(
          (v) =>
            normalize(v.make) === normalize(make) &&
            normalize(v.model) === normalize(model) &&
            v.variant &&
            v.variant.trim() !== ""
        )
        .map((v) => ({
          label: v.year ? `${v.variant} (${v.year})` : v.variant,
          value: v.variantId || v.id,
          description: v.year || undefined,
        })),
    [vehicleModels]
  );

  const findCanonical = (list: string[], input: string) => {
    const normalizedInput = normalize(input);
    return list.find((item) => normalize(item) === normalizedInput);
  };

  /* ================= HANDLERS ================= */
  const handleVariantSaved = async (variantData: any) => {
    const foundModel = vehicleModels.find(
      (m) =>
        normalize(m.make) === normalize(selectedMake) &&
        normalize(m.model) === normalize(selectedModel)
    );
    let modelId = foundModel?.modelId;

    if (!modelId) {
      try {
        const customRes = await api.post("/products/vehicles/custom", {
          make: selectedMake,
          model: selectedModel,
        });
        modelId = String(customRes.data.data.id);
      } catch (error) {
        console.error("Failed to register custom model:", error);
        toast.error("Failed to register Make and Model to the catalog.");
        return;
      }
    }

    const payload = {
      car_model_id: Number(modelId),
      variant_name: variantData.name,
      year: variantData.year || null,
      engine_displacement: variantData.engine || null,
      transmission_type: variantData.transmission || null,
      drivetrain: variantData.drivetrain || null,
      fuel_type: variantData.fuel || null,
      body_type: variantData.bodyType || null,
      oil_capacity: null,
      service_class: null,
    };

    try {
      const res = await api.post(`/vehicles/models/${modelId}/variants`, payload);
      toast.success("Variant added to catalog");

      const newVariantId = String(res.data?.id || res.data?.data?.id || "");
      const newVariantName = variantData.name;

      await loadVehicleModels();

      setSelectedVariantName(newVariantName);
      setSelectedVariantId(newVariantId);
    } catch (error) {
      console.error("Failed to save variant:", error);
      toast.error("Failed to register variant to catalog");
    }
  };

  const handleSave = async () => {
    if (!selectedVariantId) {
      toast.error("Please select a vehicle variant.");
      return;
    }

    try {
      setSaving(true);

      await api.post(`/products/${productId}/vehicle-compatibilities`, {
        car_variant_id: Number(selectedVariantId),
        notes: notes.trim() || null,
        apply_to_equivalents: applyToEquivalents,
      });

      toast.success("Vehicle compatibility added.");
      await onSaved?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to save vehicle compatibility:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to save vehicle compatibility. Please check the selected vehicle."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================= RENDER ================= */
  const isLoading = isLoadingModels || isLoadingManufacturers;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[620px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Add Vehicle Compatibility
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading vehicle data...</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Make</label>
                <Combobox
                  value={selectedMake}
                  onChange={(val) => {
                    setSelectedMake(toTitleCase(val));
                    setSelectedModel("");
                    setSelectedVariantName("");
                    setSelectedVariantId("");
                  }}
                  items={makes}
                  placeholder="Select or type make..."
                  freeText
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Model</label>
                <Combobox
                  value={selectedModel}
                  onChange={(val) => {
                    const formatted = toTitleCase(val);
                    const canonical = findCanonical(models(selectedMake), formatted) || formatted;
                    setSelectedModel(canonical);
                    setSelectedVariantName("");
                    setSelectedVariantId("");
                  }}
                  items={models(selectedMake)}
                  placeholder="Select or type model..."
                  freeText
                  disabled={!selectedMake || isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Variant</label>
              <Combobox
                value={selectedVariantId}
                onChange={(val) => {
                  setSelectedVariantId(val);
                  const found = variants(selectedMake, selectedModel).find((v) => v.value === val);
                  setSelectedVariantName(found?.label || "");
                }}
                items={variants(selectedMake, selectedModel)}
                placeholder={selectedModel ? "Select variant..." : "Select make and model first..."}
                disabled={!selectedModel || isLoading}
                allowAdd={!!(selectedMake && selectedModel)}
                addLabel="Variant to Catalog"
                onAdd={() => setAddVariantOpen(true)}
              />
              {selectedVariantId && (
                <p className="text-xs text-muted-foreground">
                  {selectedVariantName}
                </p>
              )}
            </div>

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
            <Button onClick={handleSave} disabled={saving || !selectedVariantId}>
              {saving ? "Saving..." : "Add Vehicle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddVehicleVariant
        open={addVariantOpen}
        onOpenChange={setAddVariantOpen}
        variant={{ name: "" }}
        onSaved={handleVariantSaved}
      />
    </>
  );
};

export default AddVehicleCompatibility;
