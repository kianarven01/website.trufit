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
import Combobox from "@/components/ui/combobox";

export interface VehicleModalVehicle {
  id?: string;
  makeId: string;
  model: string;
  image?: string;
}

export interface VehicleMakerOption {
  id: string;
  name: string;
}

interface VehicleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: VehicleModalVehicle | null;
  makerList: VehicleMakerOption[];
  onSaved: (vehicle: VehicleModalVehicle) => Promise<void> | void;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  open,
  onOpenChange,
  vehicle,
  makerList,
  onSaved,
}) => {
  const [makeName, setMakeName] = useState("");
  const [model, setModel] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedMaker = useMemo(
    () => makerList.find((maker) => maker.id === vehicle?.makeId) || null,
    [makerList, vehicle]
  );

  useEffect(() => {
    if (open) {
      setMakeName(selectedMaker?.name || "");
      setModel(vehicle?.model || "");
      setImage(vehicle?.image || "");
    } else {
      setMakeName("");
      setModel("");
      setImage("");
    }
  }, [open, vehicle, selectedMaker]);

  const handleSave = async () => {
    const chosenMaker = makerList.find((maker) => maker.name === makeName);

    if (!chosenMaker || !model.trim()) return;

    try {
      setSaving(true);

      await onSaved({
        id: vehicle?.id,
        makeId: chosenMaker.id,
        model: model.trim(),
        image: image.trim(),
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save vehicle:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {vehicle ? "Edit Vehicle" : "Add Vehicle"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Make</label>
            <Combobox
              items={makerList.map((maker) => maker.name)}
              value={makeName}
              onChange={setMakeName}
              placeholder="Select vehicle make"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Model</label>
            <Input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Enter vehicle model"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Image URL</label>
            <Input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Paste image URL"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !makeName || !model.trim()}>
            {saving ? "Saving..." : vehicle ? "Save Changes" : "Add Vehicle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};