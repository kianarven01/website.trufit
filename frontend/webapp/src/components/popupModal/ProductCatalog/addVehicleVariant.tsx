import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type VehicleVariant = {
  id: string;
  name: string;
  year: string;
  engine: string;
  transmission: string;
  drivetrain: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: VehicleVariant | null;
  onSaved: (variant: VehicleVariant) => void;
};

const AddVehicleVariant: React.FC<Props> = ({ open, onOpenChange, variant, onSaved }: Props) => {
  const isEdit = !!variant;

  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [engine, setEngine] = useState("");
  const [transmission, setTransmission] = useState("");
  const [drivetrain, setDrivetrain] = useState("");

  useEffect(() => {
    if (variant) {
      setName(variant.name);
      setYear(variant.year);
      setEngine(variant.engine);
      setTransmission(variant.transmission);
    } else {
      setName("");
      setYear(new Date().getFullYear().toString());
      setEngine("");
      setTransmission("");
    }
  }, [variant, open]);

  const handleSave = () => {
    if (!name || !year || !engine || !transmission) return;

    const data: VehicleVariant = {
      id: variant?.id ?? `V-${Date.now()}`,
      name,
      year,
      engine,
      transmission,
      drivetrain,
    };

    onSaved(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Variant" : "Add Variant"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Variant Name</Label>
            <Input
              placeholder="e.g. 2.8 GR-S 4x4 AT"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Year</Label>
            <Input
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Engine</Label>
            <Input
              placeholder="2.8L"
              value={engine}
              onChange={(e) => setEngine(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Drivetrain</Label>
            <Input
              placeholder="FWD or AWD"
              value={drivetrain}
              onChange={(e) => setDrivetrain(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Transmission</Label>
            <Input
              placeholder="A/T or M/T"
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            disabled={!name || !year || !engine || !transmission}
          >
            {isEdit ? "Save Changes" : "Add Variant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddVehicleVariant;