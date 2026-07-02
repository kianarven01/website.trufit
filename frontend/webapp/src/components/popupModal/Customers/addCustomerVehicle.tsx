import { useState, useEffect, useMemo, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Plus, Trash2, Car } from "lucide-react";
import { toast } from "sonner";
import Combobox from "@/components/ui/combobox";

import api from "@/api/axios";
import AddVehicleVariant from "@/components/popupModal/ProductCatalog/addVehicleVariant";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

/* ================= TYPES ================= */
interface VehicleModel {
  id: string;
  modelId?: string;
  year: number;
  make: string;
  model: string;
  variant: string;
}

interface Vehicle {
  id: string;
  customerId: string; // parent will assign this
  vehicleModelId: string;
  color: string;
  plateNo: string;
  engineNo: string;
  vin: string;
  registrationNo: string;
  sellingDealer: string;
  hasWarranty?: boolean;
}

interface VehicleForm {
  id: string;
  year: string;
  make: string;
  model: string;
  variant: string;
  color: string;
  plateNo: string;
  engineNo: string;
  vin: string;
  registrationNo: string;
  sellingDealer: string;
  _originalPlateNo?: string;
}


type EnrichedVehicle = Vehicle & {
  year?: number;
  make?: string;
  model?: string;
  variant?: string;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (vehicles: Omit<EnrichedVehicle, "customerId">[]) => void;
  vehicleToEdit?: EnrichedVehicle | null;
}

/* ================= HELPERS ================= */
const genId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const emptyVehicle = (): VehicleForm => ({
  id: genId(),
  year: "",
  make: "",
  model: "",
  variant: "",
  color: "",
  plateNo: "",
  engineNo: "",
  vin: "",
  registrationNo: "",
  sellingDealer: "",
});

const toTitleCase = (str: string) => {
  if (!str) return "";
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
};

/* ================= COMPONENT ================= */
const AddCustomerVehicle: React.FC<Props> = ({
  open,
  onOpenChange,
  onSaved,
  vehicleToEdit,
}) => {
  const [vehicles, setVehicles] = useState<VehicleForm[]>([emptyVehicle()]);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  const [manufacturers, setManufacturers] = useState<{id: string, name: string}[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isLoadingManufacturers, setIsLoadingManufacturers] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [addVariantOpen, setAddVariantOpen] = useState(false);
  const [variantTargetVehicleIndex, setVariantTargetVehicleIndex] = useState<number>(-1);
  const [variantInitialSearch, setVariantInitialSearch] = useState("");
  const [showConfirmNewVehicles, setShowConfirmNewVehicles] = useState(false);
  const [pendingVehicles, setPendingVehicles] = useState<any[]>([]);

  const loadVehicleModels = async () => {
    setIsLoadingModels(true);
    try {
      const res = await api.get('/products/vehicles');
      const models = res.data.data.flatMap((m: any) => {
        return m.variants.length > 0 ? m.variants.map((v: any) => ({
          id: v.id,
          modelId: String(m.id),
          year: v.year,
          make: m.manufacturer?.name || "",
          model: m.model,
          variant: v.variant_name
        })) : [{
          id: m.id,
          modelId: String(m.id),
          year: 0,
          make: m.manufacturer?.name || "",
          model: m.model,
          variant: ""
        }];
      });
      setVehicleModels(models);
    } catch (error) {
      console.error("Failed to load vehicle models:", error);
    } finally {
      setIsLoadingModels(false);
    }
  };

  /* ================= LOAD MODELS ================= */
  useEffect(() => {
    if (!open) return;

    const fetchManufacturers = async () => {
      setIsLoadingManufacturers(true);
      try {
        const res = await api.get('/products/manufacturers');
        setManufacturers(res.data.data || []);
      } catch (error) {
        console.error("Failed to load manufacturers:", error);
      } finally {
        setIsLoadingManufacturers(false);
      }
    };

    loadVehicleModels();
    fetchManufacturers();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (vehicleToEdit) {
      // EDIT MODE
      setVehicles([
        {
          id: vehicleToEdit.id,
          year: String(vehicleToEdit.year || ""),
          make: vehicleToEdit.make || "",
          model: vehicleToEdit.model || "",
          variant: vehicleToEdit.variant || "",
          color: vehicleToEdit.color || "",
          plateNo: vehicleToEdit.plateNo || "",
          engineNo: vehicleToEdit.engineNo || "",
          vin: vehicleToEdit.vin || "",
          registrationNo: vehicleToEdit.registrationNo || "",
          sellingDealer: vehicleToEdit.sellingDealer || "",
          _originalPlateNo: vehicleToEdit.plateNo || "",
        },
      ]);
    } else {
      // ADD MODE
      setVehicles([emptyVehicle()]);
    }
  }, [open, vehicleToEdit]);

  /* ================= FILTERS ================= */
  const years = useMemo(
    () => [...new Set(vehicleModels.map(v => String(v.year)))],
    [vehicleModels]
  );

  const normalize = (val: string) => val?.trim().toLowerCase();

  const findCanonical = (list: string[], input: string) => {
    const normalized = normalize(input);
    return list.find(item => normalize(item) === normalized);
  };

  const makes = useMemo(() => {
    const fromModels = vehicleModels.map(v => v.make.trim());
    const fromManufacturers = manufacturers.map(m => m.name.trim());
    return [...new Set([...fromModels, ...fromManufacturers].filter(Boolean))];
  }, [vehicleModels, manufacturers]);

  const models = useCallback(
    (make: string) =>
      [...new Set(
        vehicleModels
          .filter(v => normalize(v.make) === normalize(make))
          .map(v => v.model.trim())
      )],
    [vehicleModels]
  );

  const variants = useCallback(
    (make: string, model: string) =>
      vehicleModels
        .filter(v =>
          normalize(v.make) === normalize(make) &&
          normalize(v.model) === normalize(model) &&
          v.variant && v.variant.trim() !== ""
        )
        .map(v => v.variant),
    [vehicleModels]
  );

  /* ================= STATE ================= */
  const updateVehicle = (idx: number, field: keyof VehicleForm, value: string) => {
    setVehicles(prev =>
      prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v))
    );
  };

  const addVehicleRow = () => setVehicles(p => [...p, emptyVehicle()]);
  const removeVehicle = (idx: number) =>
    setVehicles(p => p.filter((_, i) => i !== idx));

  const isYearInCatalogRange = (customerYear: number | string, catalogYearStr: string): boolean => {
    if (!catalogYearStr) return true;
    const customerYearNum = Number(customerYear);
    if (isNaN(customerYearNum)) return false;

    const cleanStr = catalogYearStr.replace(/\s+/g, "");

    if (cleanStr.includes("-")) {
      const [start, end] = cleanStr.split("-").map(Number);
      if (!isNaN(start) && !isNaN(end)) {
        return customerYearNum >= start && customerYearNum <= end;
      }
    }

    const years = cleanStr.split(",").map(Number);
    if (years.some(y => y === customerYearNum)) {
      return true;
    }

    return cleanStr === String(customerYear);
  };

  const handleVariantSaved = async (variantData: any) => {
    if (variantTargetVehicleIndex === -1) return;
    const targetVehicle = vehicles[variantTargetVehicleIndex];
    if (!targetVehicle) return;

    // Find model ID of current vehicle
    const foundModel = vehicleModels.find(
      m => normalize(m.make) === normalize(targetVehicle.make) && normalize(m.model) === normalize(targetVehicle.model)
    );
    let modelId = foundModel?.modelId;

    if (!modelId) {
      try {
        const customRes = await api.post('/products/vehicles/custom', {
          make: targetVehicle.make,
          model: targetVehicle.model,
        });
        modelId = String(customRes.data.data.id);
      } catch (error) {
        console.error("Failed to register custom model on the fly:", error);
        toast.error("Failed to register Make and Model to the catalog.");
        return;
      }
    }

    const payload = {
      car_model_id: Number(modelId),
      variant_name: variantData.name,
      year: null,
      engine_displacement: variantData.engine || null,
      transmission_type: variantData.transmission || null,
      drivetrain: variantData.drivetrain || null,
      fuel_type: variantData.fuel || null,
      body_type: variantData.bodyType || null,
      oil_capacity: null,
      service_class: null,
    };

    try {
      await api.post(`/vehicles/models/${modelId}/variants`, payload);
      toast.success("Variant added to catalog");
      
      // Reload vehicle models list
      await loadVehicleModels();

      // Pre-select new variant name in target vehicle row
      updateVehicle(variantTargetVehicleIndex, "variant", variantData.name);
    } catch (error) {
      console.error("Failed to save variant:", error);
      toast.error("Failed to register variant to catalog");
    }
  };

  /* ================= SAVE ================= */
  const executeSave = async (normalizedVehiclesList: any[]) => {
    setIsSaving(true);
    for (const nv of normalizedVehiclesList) {
      // Find if this model exists in the catalog to avoid duplicate API calls
      const modelMatch = vehicleModels.find(
        m => normalize(m.make) === normalize(nv.make) && normalize(m.model) === normalize(nv.model)
      );
      if (!modelMatch && !nv.vehicleModelId) {
        try {
          await api.post('/products/vehicles/custom', {
            make: nv.make,
            model: nv.model,
          });
        } catch (error) {
          console.error("Failed to add custom vehicle", error);
          toast.error("Failed to add vehicle to database");
          setIsSaving(false);
          return;
        }
      }
    }

    /* PASS TO PARENT */
    onSaved?.(normalizedVehiclesList);

    toast.success("Vehicle(s) added");
    setIsSaving(false);
    onOpenChange(false);
  };

  const handleSave = async () => {
    const validVehicles = vehicles.filter(v => v.plateNo || v.make || v.model);

    if (!validVehicles.length) {
      toast.error("Please add at least one valid vehicle");
      return;
    }

    for (const v of validVehicles) {
      if (!v.year || !v.make || !v.model || !v.variant || !v.color || !v.plateNo || !v.engineNo || !v.vin || !v.registrationNo || !v.sellingDealer) {
        toast.error("Please fill in all vehicle details.");
        return;
      }
    }

    setIsSaving(true);
    let hasNewVehicles = false;
    const normalizedVehicles: Omit<EnrichedVehicle, "customerId">[] = [];

    for (const v of validVehicles) {
      let vehicleModelId = "";
      const formattedMake = toTitleCase(v.make);
      const formattedModel = toTitleCase(v.model);
      const formattedVariant = toTitleCase(v.variant).trim() || "";

      // Check if make & model exists in catalog
      let modelExists = vehicleModels.some(
        m =>
          normalize(m.make) === normalize(formattedMake) &&
          normalize(m.model) === normalize(formattedModel)
      );

      if (!modelExists) {
         hasNewVehicles = true;
      }

      // Find matching catalog variant to link vehicle_variant_id
      let match = vehicleModels.find(
        m =>
          normalize(m.make) === normalize(formattedMake) &&
          normalize(m.model) === normalize(formattedModel) &&
          normalize(m.variant) === normalize(formattedVariant) &&
          isYearInCatalogRange(v.year, String(m.year))
      );

      if (match) {
         vehicleModelId = match.id;
      }

      normalizedVehicles.push({
        id: v.id,
        vehicleModelId,
        year: Number(v.year),
        make: v.make,
        model: v.model,
        variant: v.variant,
        color: v.color,
        plateNo: v.plateNo,
        engineNo: v.engineNo,
        vin: v.vin,
        registrationNo: v.registrationNo,
        sellingDealer: v.sellingDealer,
        ...(vehicleToEdit && v._originalPlateNo && v._originalPlateNo !== v.plateNo
          ? { oldPlateNo: v._originalPlateNo } as any
          : {}),
      });
    }

    if (hasNewVehicles) {
      setPendingVehicles(normalizedVehicles);
      setShowConfirmNewVehicles(true);
      setIsSaving(false);
      return;
    }

    await executeSave(normalizedVehicles);
  };

  /* ================= UI ================= */
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>{vehicleToEdit ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
            <p className="text-[13px] text-muted-foreground mt-1">
              {vehicleToEdit ? "Update existing vehicle details" : "Register new vehicles to this customer profile"}
            </p>
          </DialogHeader>

          <ScrollArea className="max-h-[65vh] relative">
            {(isLoadingManufacturers || isLoadingModels) && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[1px] transition-opacity">
                <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-3" />
                <p className="text-sm font-medium text-slate-600 animate-pulse">Loading vehicle data...</p>
              </div>
            )}
            <div className="px-6 pb-4 space-y-4">

              <div className="flex justify-between">
                <p className="text-sm font-semibold flex items-center gap-1.5">
                  <Car className="h-4 w-4" /> Vehicles
                </p>

                {!vehicleToEdit && (
                  <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={addVehicleRow}>
                    <Plus className="h-3 w-3" /> Add Vehicle
                  </Button>
                )}
              </div>

              {vehicles.map((v, idx) => (
                <div key={v.id} className="border rounded-lg p-3 space-y-2">

                  <div className="flex justify-between">
                    <span className="text-xs">Vehicle {idx + 1}</span>

                    {vehicles.length > 1 && (
                      <Button size="icon" variant="ghost" onClick={() => removeVehicle(idx)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-medium">Year</Label>
                      <Input
                        className="bg-muted/30"
                        placeholder=""
                        value={v.year}
                        onChange={(e) => updateVehicle(idx, "year", e.target.value.replace(/\D/g, "").slice(0, 4))}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-medium">Make</Label>
                      <Combobox
                        value={v.make}
                        onChange={(val) => {
                          updateVehicle(idx, "make", toTitleCase(val));
                          updateVehicle(idx, "model", "");
                          updateVehicle(idx, "variant", "");
                        }}
                        items={makes}
                        freeText
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-medium">Model</Label>
                      <Combobox
                        value={v.model}
                        onChange={(val) => {
                          const formatted = toTitleCase(val);
                          const canonical = findCanonical(models(v.make), formatted) || formatted;

                          updateVehicle(idx, "model", canonical);
                          updateVehicle(idx, "variant", "");
                        }}
                        items={models(v.make)}
                        freeText
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-medium">Variant</Label>
                      <Combobox
                        value={v.variant}
                        onChange={(val) => {
                          const formatted = toTitleCase(val);
                          const canonical = findCanonical(variants(v.make, v.model), formatted) || formatted;

                          updateVehicle(idx, "variant", canonical || "");
                        }}
                        items={variants(v.make, v.model)}
                        placeholder=""
                        allowAdd={!!(v.make && v.model)}
                        addLabel="Variant to Catalog"
                        onAdd={(searchVal) => {
                          setVariantTargetVehicleIndex(idx);
                          setVariantInitialSearch(searchVal);
                          setAddVariantOpen(true);
                        }}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-medium">Color</Label>
                      <Input className="bg-muted/30" placeholder="" value={v.color} onChange={(e) => updateVehicle(idx, "color", toTitleCase(e.target.value))} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-medium">Plate Number</Label>
                      <Input className="bg-muted/30" placeholder="" value={v.plateNo} onChange={(e) => updateVehicle(idx, "plateNo", e.target.value.toUpperCase().slice(0, 8))} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-medium">Engine Number</Label>
                      <Input className="bg-muted/30" placeholder="" value={v.engineNo} onChange={(e) => updateVehicle(idx, "engineNo", e.target.value.toUpperCase().slice(0, 20))} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-medium">VIN</Label>
                      <Input className="bg-muted/30" placeholder="" value={v.vin} onChange={(e) => updateVehicle(idx, "vin", e.target.value.toUpperCase().slice(0, 17))} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-medium">Registration Number</Label>
                      <Input className="bg-muted/30" placeholder="" value={v.registrationNo} onChange={(e) => updateVehicle(idx, "registrationNo", e.target.value.toUpperCase().slice(0, 15))} />
                    </div>

                    <div className="col-span-2 flex flex-col gap-1.5">
                      <Label className="text-xs font-medium">Selling Dealer</Label>
                      <Input className="bg-muted/30" placeholder="" value={v.sellingDealer} onChange={(e) => updateVehicle(idx, "sellingDealer", toTitleCase(e.target.value))} />
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 pb-6">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Vehicle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmNewVehicles} onOpenChange={setShowConfirmNewVehicles}>
        <AlertDialogContent className="rounded-2xl max-w-md border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">Unrecognized Vehicle Models</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
              One or more vehicles are not in our database. Would you like to register them to the database catalog?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel 
              onClick={() => {
                setShowConfirmNewVehicles(false);
                setPendingVehicles([]);
              }}
              className="text-xs border-muted-foreground/30 hover:bg-muted/50"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={async () => {
                setShowConfirmNewVehicles(false);
                await executeSave(pendingVehicles);
              }}
              className="text-xs bg-primary text-primary-foreground hover:bg-primary/95"
            >
              Yes, Add to Database
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddVehicleVariant
        open={addVariantOpen}
        onOpenChange={setAddVariantOpen}
        variant={{
          name: variantInitialSearch,
          year: variantTargetVehicleIndex !== -1 ? vehicles[variantTargetVehicleIndex]?.year : ""
        }}
        onSaved={handleVariantSaved}
        hideYear={true}
      />
    </>
  );
};

export default AddCustomerVehicle;