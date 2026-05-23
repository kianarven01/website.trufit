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

export interface PartsCategoryFormData {
  id?: string;
  name: string;
}

interface AddPartsCategoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: PartsCategoryFormData | null;
  onSaved: (category: PartsCategoryFormData) => Promise<void> | void;
}

const AddPartsCategory: React.FC<AddPartsCategoryProps> = ({
  open,
  onOpenChange,
  category,
  onSaved,
}) => {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(category?.name || "");
    } else {
      setName("");
    }
  }, [open, category]);

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      setSaving(true);

      await onSaved({
        id: category?.id,
        name: name.trim(),
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save category:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {category ? "Edit Parts Category" : "Add Parts Category"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? "Saving..." : category ? "Save Changes" : "Add Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPartsCategory;