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

const SUGGESTED_CATEGORIES = [
  "Engine",
  "Brakes",
  "Suspension",
  "Transmission",
  "Exhaust",
  "Electrical",
  "Cooling",
  "Steering",
  "Fuel System",
  "Body & Trim",
  "Interior",
  "Tyres & Wheels",
];

type Category = {
  name: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onSaved: (category: Category) => void;
};

const AddPartsCategory: React.FC<Props> = ({
  open,
  onOpenChange,
  category,
  onSaved,
}) => {
  const isEdit = !!category;

  const [name, setName] = useState("");

  useEffect(() => {
    if (category) {
      setName(category.name);
    } else {
      setName("");
    }
  }, [category, open]);

  const handleSave = () => {
    if (!name.trim()) return;

    onSaved({ name });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Category" : "Add Category"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">

          {/* Category Name */}
          <div className="space-y-2">
            <Label>Category Name *</Label>
            <Input
              placeholder="e.g. Engine, Brakes..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Suggested Categories */}
          {!isEdit && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setName(cat)}
                  className="px-2 py-1.5 text-xs rounded-md border hover:bg-muted transition"
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button disabled={!name} onClick={handleSave}>
            {isEdit ? "Save Changes" : "Add Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPartsCategory;