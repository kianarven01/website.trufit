import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface VehicleVariantFormData {
  id?: string;
  name: string;
  year?: string;
  engine?: string;
  transmission?: string;
  drivetrain?: string;
  oilCapacity?: number;
  serviceClass?: string;
}

interface AddVehicleVariantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: VehicleVariantFormData | null;
  onSaved: (variant: VehicleVariantFormData) => Promise<void> | void;
}

const AddVehicleVariant: React.FC<AddVehicleVariantProps> = ({
  open,
  onOpenChange,
  variant,
  onSaved,
}) => {
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [engine, setEngine] = useState("");
  const [transmission, setTransmission] = useState("");
  const [drivetrain, setDrivetrain] = useState("");
  const [oilCapacity, setOilCapacity] = useState("");
  const [serviceClass, setServiceClass] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(variant?.name || "");
      setYear(variant?.year || "");
      setEngine(variant?.engine || "");
      setTransmission(variant?.transmission || "");
      setDrivetrain(variant?.drivetrain || "");
      setOilCapacity(
        variant?.oilCapacity !== undefined ? String(variant.oilCapacity) : ""
      );
      setServiceClass(variant?.serviceClass || "");
    } else {
      setName("");
      setYear("");
      setEngine("");
      setTransmission("");
      setDrivetrain("");
      setOilCapacity("");
      setServiceClass("");
    }
  }, [open, variant]);

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      setSaving(true);

      await onSaved({
        id: variant?.id,
        name: name.trim(),
        year: year.trim() || "",
        engine: engine.trim() || "",
        transmission: transmission.trim() || "",
        drivetrain: drivetrain.trim() || "",
        oilCapacity: oilCapacity.trim() ? Number(oilCapacity) : undefined,
        serviceClass: serviceClass.trim() || "",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save variant:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {variant ? "Edit Vehicle Variant" : "Add Vehicle Variant"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Variant Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. GLX AT"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Year</label>
            <Input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g. 2024"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Engine</label>
            <Input
              value={engine}
              onChange={(e) => setEngine(e.target.value)}
              placeholder="e.g. 1.5L"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Transmission</label>
            <Input
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
              placeholder="e.g. Automatic"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Drivetrain</label>
            <Input
              value={drivetrain}
              onChange={(e) => setDrivetrain(e.target.value)}
              placeholder="e.g. FWD"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Oil Capacity</label>
            <Input
              type="number"
              step="0.1"
              value={oilCapacity}
              onChange={(e) => setOilCapacity(e.target.value)}
              placeholder="e.g. 4.5"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Service Class</label>
            <Input
              value={serviceClass}
              onChange={(e) => setServiceClass(e.target.value)}
              placeholder="e.g. Premium"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? "Saving..." : variant ? "Save Changes" : "Add Variant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddVehicleVariant;