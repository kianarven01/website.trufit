import { useState, useEffect, useMemo } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Plus, Trash2, Car } from "lucide-react";
import { toast } from "sonner";
import Combobox from "@/components/ui/combobox";

/* ================= CONSTANTS ================= */
const VEHICLE_STORAGE_KEY = "vehicles";
const VEHICLE_MODEL_STORAGE_KEY = "vehicleModels";

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
  customerId?: string;
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
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (vehicles: Vehicle[]) => void;
}

/* ================= HELPERS ================= */
const genId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // fallback
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

/* ================= COMPONENT ================= */
const AddCustomerVehicle: React.FC<Props> = ({
  open,
  onOpenChange,
  onSaved,
}) => {
  const [vehicles, setVehicles] = useState<VehicleForm[]>([emptyVehicle()]);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);

  /* ================= LOAD MODELS ================= */
  useEffect(() => {
    const stored = localStorage.getItem(VEHICLE_MODEL_STORAGE_KEY);
    setVehicleModels(stored ? JSON.parse(stored) : []);
  }, [open]);

  useEffect(() => {
    if (open) setVehicles([emptyVehicle()]);
  }, [open]);

  /* ================= CASCADING FILTER ================= */
  const years = useMemo(
    () => [...new Set(vehicleModels.map(v => String(v.year)))],
    [vehicleModels]
  );

  const makes = () =>
    [...new Set(vehicleModels.map(v => v.make))];

  const models = (make: string) =>
    [...new Set(
      vehicleModels
        .filter(v => v.make === make)
        .map(v => v.model)
    )];

  const variants = (make: string, model: string) =>
    vehicleModels
      .filter(v =>
        v.make === make &&
        v.model === model
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
  const handleSave = () => {
    const validVehicles = vehicles.filter(v => v.year && v.make && v.model);

    if (!validVehicles.length) {
      toast.error("Please add at least one valid vehicle");
      return;
    }

    const storedModels: VehicleModel[] =
      JSON.parse(localStorage.getItem(VEHICLE_MODEL_STORAGE_KEY) || "[]");

    const existingVehicles: Vehicle[] =
      JSON.parse(localStorage.getItem(VEHICLE_STORAGE_KEY) || "[]");

    let updatedModels = [...storedModels];

    const normalizedVehicles: Vehicle[] = validVehicles.map(v => {
      let model = updatedModels.find(m =>
        m.year === Number(v.year) &&
        m.make === v.make &&
        m.model === v.model &&
        m.variant === v.variant
      );

      if (!model) {
        model = {
          id: genId(),
          year: Number(v.year),
          make: v.make,
          model: v.model,
          variant: v.variant,
        };
        updatedModels.push(model);
      }

      return {
        id: v.id,
        vehicleModelId: model.id,
        color: v.color,
        plateNo: v.plateNo,
        engineNo: v.engineNo,
        vin: v.vin,
        registrationNo: v.registrationNo,
        sellingDealer: v.sellingDealer,
      };
    });

    localStorage.setItem(
      VEHICLE_MODEL_STORAGE_KEY,
      JSON.stringify(updatedModels)
    );

    const mergedVehicles = [...existingVehicles, ...normalizedVehicles];

    localStorage.setItem(
      VEHICLE_STORAGE_KEY,
      JSON.stringify(mergedVehicles)
    );

    onSaved?.(normalizedVehicles);

    toast.success("Vehicle(s) added");
    onOpenChange(false);
  };

  /* ================= UI ================= */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Add Vehicle</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          <div className="px-6 pb-4 space-y-4">

            <div className="flex justify-between">
              <p className="text-sm font-semibold flex items-center gap-1.5">
                <Car className="h-4 w-4" /> Vehicles
              </p>

              <Button size="sm" onClick={addVehicleRow}>
                <Plus className="h-3 w-3" /> Add Vehicle
              </Button>
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
                  <Combobox
                    value={v.year}
                    onChange={(val) => {
                      updateVehicle(idx, "year", val);
                      updateVehicle(idx, "make", "");
                      updateVehicle(idx, "model", "");
                      updateVehicle(idx, "variant", "");
                    }}
                    items={years}
                    placeholder="Year"
                  />

                  <Combobox
                    value={v.make}
                    onChange={(val) => {
                      updateVehicle(idx, "make", val);
                      updateVehicle(idx, "model", "");
                      updateVehicle(idx, "variant", "");
                    }}
                    items={makes()}
                    placeholder="Make"
                  />

                  <Combobox
                    value={v.model}
                    onChange={(val) => {
                      updateVehicle(idx, "model", val);
                      updateVehicle(idx, "variant", "");
                    }}
                    items={models(v.make)}
                    placeholder="Model"
                  />
                </div>

                <Combobox
                  value={v.variant}
                  onChange={(val) => updateVehicle(idx, "variant", val)}
                  items={variants(v.make, v.model)}
                  placeholder="Variant"
                />

                <div className="grid md:grid-cols-2 gap-2">
                  <Input placeholder="Color" value={v.color}
                    onChange={(e) => updateVehicle(idx, "color", e.target.value)} />

                  <Input placeholder="Plate No" value={v.plateNo}
                    onChange={(e) => updateVehicle(idx, "plateNo", e.target.value)} />

                  <Input placeholder="Engine No" value={v.engineNo}
                    onChange={(e) => updateVehicle(idx, "engineNo", e.target.value)} />

                  <Input placeholder="VIN" value={v.vin}
                    onChange={(e) => updateVehicle(idx, "vin", e.target.value)} />

                  <Input placeholder="Registration No" value={v.registrationNo}
                    onChange={(e) => updateVehicle(idx, "registrationNo", e.target.value)} />

                  <Input placeholder="Selling Dealer" value={v.sellingDealer}
                    onChange={(e) => updateVehicle(idx, "sellingDealer", e.target.value)} />
                </div>

              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Vehicle</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomerVehicle;