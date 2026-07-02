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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      let baseName = variant?.name || "";
      const engineStr = variant?.engine || "";
      const drivetrainStr = variant?.drivetrain || "";
      const transmissionStr = variant?.transmission || "";

      if (transmissionStr && baseName.endsWith(transmissionStr)) {
        baseName = baseName.slice(0, baseName.length - transmissionStr.length).trim();
      }
      if (drivetrainStr && baseName.endsWith(drivetrainStr)) {
        baseName = baseName.slice(0, baseName.length - drivetrainStr.length).trim();
      }
      if (engineStr && baseName.endsWith(engineStr)) {
        baseName = baseName.slice(0, baseName.length - engineStr.length).trim();
      }

      setName(baseName);
      setYear(variant?.year || "");
      setEngine(engineStr);
      setTransmission(transmissionStr);
      setDrivetrain(drivetrainStr);
    } else {
      setName("");
      setYear("");
      setEngine("");
      setTransmission("");
      setDrivetrain("");
    }
  }, [open, variant]);

  const computedName = React.useMemo(() => {
    const parts = [
      name.trim(),
      engine.trim(),
      drivetrain.trim(),
      transmission.trim(),
    ].filter(Boolean);
    return parts.join(" ");
  }, [name, engine, drivetrain, transmission]);

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      setSaving(true);

      await onSaved({
        id: variant?.id,
        name: computedName,
        year: year.trim() || "",
        engine: engine.trim() || "",
        transmission: transmission.trim() || "",
        drivetrain: drivetrain.trim() || "",
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
            <label className="text-sm font-medium">Base Variant Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. GLX"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Year Range</label>
            <Input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g. 2020-2025"
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

          {computedName && (
            <div className="md:col-span-2 rounded-lg bg-muted/40 border p-3 mt-1">
              <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Generated Catalog Name Preview
              </span>
              <span className="text-sm font-medium text-foreground">
                {computedName}
              </span>
            </div>
          )}
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