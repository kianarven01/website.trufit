import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scrollArea";

import { Plus, Trash2, Car } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (vehicles: any[]) => void;
}

const genId = () => Math.random().toString(36).substring(2, 9);

const emptyVehicle = () => ({
  id: genId(),
  yearMakeModel: "",
  color: "",
  plateNo: "",
  vin: "",
  kilometers: 0,
  engineNo: "",
});

const AddVehicle: React.FC<Props> = ({ open, onOpenChange, onSaved }) => {
  const [vehicles, setVehicles] = useState<any[]>([emptyVehicle()]);

  const updateVehicle = (idx: number, field: string, value: any) => {
    setVehicles((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v))
    );
  };

  const addVehicleRow = () => {
    setVehicles((prev) => [...prev, emptyVehicle()]);
  };

  const removeVehicle = (idx: number) => {
    setVehicles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    const validVehicles = vehicles.filter((v) => v.yearMakeModel.trim());

    if (!validVehicles.length) {
      toast.error("Please add at least one vehicle");
      return;
    }

    onSaved?.(validVehicles);

    toast.success("Vehicle(s) added");

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Add Vehicle</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          <div className="px-6 pb-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold flex items-center gap-1.5">
                <Car className="h-4 w-4 text-muted-foreground" />
                Vehicles
              </p>

              <Button
                variant="outline"
                size="sm"
                onClick={addVehicleRow}
                className="h-7 gap-1 text-xs"
              >
                <Plus className="h-3 w-3" />
                Add Vehicle
              </Button>
            </div>

            <div className="space-y-4">
              {vehicles.map((v, idx) => (
                <div
                  key={v.id}
                  className="rounded-lg border p-3 space-y-2 bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Vehicle {idx + 1}
                    </span>

                    {vehicles.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeVehicle(idx)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <Label className="text-xs">Year / Make / Model</Label>
                      <Input
                        value={v.yearMakeModel}
                        onChange={(e) =>
                          updateVehicle(idx, "yearMakeModel", e.target.value)
                        }
                        placeholder="2020 Toyota Vios"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Color</Label>
                      <Input
                        value={v.color}
                        onChange={(e) =>
                          updateVehicle(idx, "color", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Plate No.</Label>
                      <Input
                        value={v.plateNo}
                        onChange={(e) =>
                          updateVehicle(idx, "plateNo", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <Label className="text-xs">VIN</Label>
                      <Input
                        value={v.vin}
                        onChange={(e) =>
                          updateVehicle(idx, "vin", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Kilometers</Label>
                      <Input
                        type="number"
                        value={v.kilometers || ""}
                        onChange={(e) =>
                          updateVehicle(
                            idx,
                            "kilometers",
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>

                    <div className="col-span-2">
                      <Label className="text-xs">Engine No.</Label>
                      <Input
                        value={v.engineNo}
                        onChange={(e) =>
                          updateVehicle(idx, "engineNo", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 pb-6 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button onClick={handleSave}>Save Vehicle</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddVehicle;