import { useEffect, useRef, useState } from "react";
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
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import Combobox from "@/components/ui/combobox";

interface MakeOption {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: any | null;
  makerList: MakeOption[];
  onSaved: (vehicle: any) => void;
}

export function VehicleModal({
  open,
  onOpenChange,
  vehicle,
  makerList,
  onSaved,
}: Props) {
  const isEdit = !!vehicle;
  const [makeId, setMakeId] = useState(""); // stores ID or typed name temporarily
  const [model, setModel] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  useEffect(() => {
    if (open) {
      if (vehicle) {
        const maker = makerList.find((m) => m.id === vehicle.makeId);
        setMakeId(maker ? maker.id : vehicle.makeId); // display existing make ID or typed value
        setModel(vehicle.model);
        setImageUrl(vehicle.image || "");
      } else {
        setMakeId("");
        setModel("");
        setImageUrl("");
      }
    }
  }, [open, vehicle, makerList]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!makeId || !makeId.trim()) {
      toast.error("Please select or enter a Make");
      return;
    }
    if (!model.trim()) {
      toast.error("Model name is required");
      return;
    }

    setIsSaving(true);

    try {
      onSaved({
        id: vehicle?.id || crypto.randomUUID(),
        makeId, // temporary, will resolve in VehiclesPage
        model: capitalize(model),
        image: imageUrl,
        variants: vehicle?.variants || [],
      });
      toast.success(isEdit ? "Vehicle updated" : "Vehicle added");
      onOpenChange(false);
    } catch {
      toast.error("Failed to save vehicle");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-6 pb-2">
          <DialogTitle>{isEdit ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pb-4 px-4">
          {/* Image Section */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase">
              Vehicle Image
            </Label>
            <div
              className="relative h-32 w-full border-2 border-dashed rounded-lg bg-muted/30 flex items-center justify-center overflow-hidden group cursor-pointer"
              onClick={() => !imageUrl && fileInputRef.current?.click()}
            >
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-full w-full object-contain"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageUrl("");
                    }}
                    className="absolute top-2 right-2 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <ImagePlus className="h-6 w-6 mb-1" />
                  <span className="text-xs">Click to upload</span>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>

          {/* Make Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase">
              Make *
            </Label>
            <Combobox
              value={makerList.find((m) => m.id === makeId)?.name || makeId}
              onChange={(val) => {
                const selected = makerList.find(
                  (m) => m.name.toLowerCase() === val.toLowerCase()
                );
                setMakeId(selected ? selected.id : val);
              }}
              items={makerList.map((m) => m.name)}
              placeholder="Select or type manufacturer..."
            />
          </div>

          {/* Model Input */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase">
              Model *
            </Label>
            <Input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. Camry, F-150"
            />
          </div>
        </div>

        <DialogFooter className="px-4 py-4 border-t bg-muted/10">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving
              ? "Saving..."
              : isEdit
              ? "Update Vehicle"
              : "Save Vehicle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}