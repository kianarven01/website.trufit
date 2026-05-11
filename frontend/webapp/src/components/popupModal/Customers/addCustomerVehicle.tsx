import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Plus, Trash2, Car } from "lucide-react";
import { toast } from "sonner";
import Combobox from "@/components/ui/combobox";

import api from "@/api/axios";

/* ================= TYPES ================= */
interface VehicleModel {
  id: string;
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
  return str.trim().charAt(0).toUpperCase() + str.trim().slice(1);
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

  /* ================= LOAD MODELS ================= */
  useEffect(() => {
    if (!open) return;

    const fetchModels = async () => {
      setIsLoadingModels(true);
      try {
        const res = await api.get('/products/vehicles');
        const models = res.data.data.flatMap((m: any) => {
          return m.variants.length > 0 ? m.variants.map((v: any) => ({
            id: v.id,
            year: v.year,
            make: m.manufacturer?.name || "",
            model: m.model,
            variant: v.variant_name
          })) : [{
            id: m.id,
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

    fetchModels();
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

  const makes = () => {
    const fromModels = vehicleModels.map(v => v.make.trim());
    const fromManufacturers = manufacturers.map(m => m.name.trim());
    return [...new Set([...fromModels, ...fromManufacturers].filter(Boolean))];
  };

  const models = (make: string) =>
    [...new Set(
      vehicleModels
        .filter(v => normalize(v.make) === normalize(make))
        .map(v => v.model.trim())
    )];

  const variants = (make: string, model: string) =>
    vehicleModels
      .filter(v =>
        normalize(v.make) === normalize(make) &&
        normalize(v.model) === normalize(model) &&
        v.variant && v.variant.trim() !== ""
      )
      .map(v => v.variant);

  /* ================= STATE ================= */
  const updateVehicle = (idx: number, field: keyof VehicleForm, value: string) => {
    setVehicles(prev =>
      prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v))
    );
  };

  const addVehicleRow = () => setVehicles(p => [...p, emptyVehicle()]);
  const removeVehicle = (idx: number) =>
    setVehicles(p => p.filter((_, i) => i !== idx));

  /* ================= SAVE ================= */
  const handleSave = async () => {
    const validVehicles = vehicles.filter(v => v.plateNo);

    if (!validVehicles.length) {
      toast.error("Please add at least one valid vehicle");
      return;
    }

    setIsSaving(true);
    let hasNewVehicles = false;
    const normalizedVehicles: Omit<EnrichedVehicle, "customerId">[] = [];

    for (const v of validVehicles) {
      let vehicleModelId = "";
      const formattedMake = toTitleCase(v.make);
      const formattedModel = toTitleCase(v.model);
      const formattedVariant = toTitleCase(v.variant).trim() || "";

      let match = vehicleModels.find(
        m =>
          normalize(m.make) === normalize(formattedMake) &&
          normalize(m.model) === normalize(formattedModel)
      );

      if (match) {
         vehicleModelId = match.id;
      } else {
         hasNewVehicles = true;
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
      const confirmAdd = window.confirm("One or more vehicles are not in our database. Would you like to add them?");
      if (!confirmAdd) {
        setIsSaving(false);
        return;
      }

      for (const nv of normalizedVehicles) {
        if (!nv.vehicleModelId) {
          try {
            await api.post('/products/vehicles/custom', {
              make: nv.make,
              model: nv.model
            });
            nv.vehicleModelId = ""; // Important: We do not create VehicleVariants, so this remains empty.
          } catch (error) {
            console.error("Failed to add custom vehicle", error);
            toast.error("Failed to add vehicle to database");
            setIsSaving(false);
            return;
          }
        }
      }
    }

    /* PASS TO PARENT */
    onSaved?.(normalizedVehicles);

    toast.success("Vehicle(s) added");
    setIsSaving(false);
    onOpenChange(false);
  };

  /* ================= UI ================= */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Add Vehicle</DialogTitle>
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
                    <Label className="text-xs font-semibold text-slate-700">Year</Label>
                    <Input
                      type="number"
                      maxLength={4}
                      value={v.year}
                      onChange={(e) => updateVehicle(idx, "year", e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Make</Label>
                    <Combobox
                      value={v.make}
                      onChange={(val) => {
                        updateVehicle(idx, "make", toTitleCase(val));
                        updateVehicle(idx, "model", "");
                        updateVehicle(idx, "variant", "");
                      }}
                      items={makes()}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Model</Label>
                    <Combobox
                      value={v.model}
                      onChange={(val) => {
                        const formatted = toTitleCase(val);
                        const canonical = findCanonical(models(v.make), formatted) || formatted;

                        updateVehicle(idx, "model", canonical);
                        updateVehicle(idx, "variant", "");
                      }}
                      items={models(v.make)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Variant</Label>
                    <Combobox
                      value={v.variant}
                      onChange={(val) => {
                        const formatted = toTitleCase(val);
                        const canonical = findCanonical(variants(v.make, v.model), formatted) || formatted;

                        updateVehicle(idx, "variant", canonical || "");
                      }}
                      items={variants(v.make, v.model)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Color</Label>
                    <Input value={v.color} onChange={(e) => updateVehicle(idx, "color", toTitleCase(e.target.value))} />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Plate Number</Label>
                    <Input maxLength={15} value={v.plateNo} onChange={(e) => updateVehicle(idx, "plateNo", e.target.value.toUpperCase().replace(/\s+/g, ''))} />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Engine Number</Label>
                    <Input maxLength={30} value={v.engineNo} onChange={(e) => updateVehicle(idx, "engineNo", e.target.value.toUpperCase())} />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-slate-700">VIN</Label>
                    <Input maxLength={17} value={v.vin} onChange={(e) => updateVehicle(idx, "vin", e.target.value.toUpperCase())} />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Registration Number</Label>
                    <Input maxLength={30} value={v.registrationNo} onChange={(e) => updateVehicle(idx, "registrationNo", e.target.value.toUpperCase())} />
                  </div>

                  <div className="col-span-2 flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Selling Dealer</Label>
                    <Input value={v.sellingDealer} onChange={(e) => updateVehicle(idx, "sellingDealer", e.target.value)} />
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
  );
};

export default AddCustomerVehicle;