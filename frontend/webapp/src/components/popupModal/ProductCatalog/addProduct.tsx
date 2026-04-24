import { useEffect, useState } from "react";
import api from "@/api/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Option {
  id: string;
  name: string;
}

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Option[];
  manufacturers: Option[];
  variantId?: string | null;
  categoryId?: string | null;
  onSaved: () => Promise<void> | void;
}

export default function ProductModal({
  open,
  onOpenChange,
  categories,
  manufacturers,
  variantId,
  categoryId,
  onSaved,
}: ProductModalProps) {
  const [units, setUnits] = useState<Option[]>([]);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: "",
    SKU: "",
    cost: "",
    description: "",
    category_id: categoryId || "",
    unit: "",
    manufacturer_id: "",
    barcode: "",
    part_number: "",
    is_oem: false,
    oem_reference_number: "",
  });

  useEffect(() => {
    if (!open) return;

    api.get("/products/units").then((res) => {
      const rows = Array.isArray(res.data?.data) ? res.data.data : res.data;
      setUnits(rows || []);
    });

    setForm((prev) => ({
      ...prev,
      category_id: categoryId || prev.category_id,
    }));
  }, [open, categoryId]);

  const updateField = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      SKU: "",
      cost: "",
      description: "",
      category_id: categoryId || "",
      unit: "",
      manufacturer_id: "",
      barcode: "",
      part_number: "",
      is_oem: false,
      oem_reference_number: "",
    });
    setImage(null);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const payload = new FormData();

      payload.append("name", form.name);
      payload.append("SKU", form.SKU);
      payload.append("cost", form.cost);
      payload.append("part_number", form.part_number);
      payload.append("is_oem", form.is_oem ? "1" : "0");

      if (form.description) payload.append("description", form.description);
      if (form.category_id) payload.append("category_id", form.category_id);
      if (form.unit) payload.append("unit", form.unit);
      if (form.manufacturer_id) payload.append("manufacturer_id", form.manufacturer_id);
      if (form.barcode) payload.append("barcode", form.barcode);
      if (form.oem_reference_number) {
        payload.append("oem_reference_number", form.oem_reference_number);
      }

      if (variantId) payload.append("car_variant_id", variantId);
      if (image) payload.append("image", image);

      await api.post("/products", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await onSaved();
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to save product:", error);
      alert(error?.response?.data?.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="Product name"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
          />

          <Input
            placeholder="SKU"
            value={form.SKU}
            onChange={(e) => updateField("SKU", e.target.value)}
          />

          <Input
            placeholder="Cost"
            type="number"
            value={form.cost}
            onChange={(e) => updateField("cost", e.target.value)}
          />

          <Input
            placeholder="Part number"
            value={form.part_number}
            onChange={(e) => updateField("part_number", e.target.value)}
          />

          <select
            className="border rounded-md px-3 py-2 bg-background"
            value={form.category_id}
            onChange={(e) => updateField("category_id", e.target.value)}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            className="border rounded-md px-3 py-2 bg-background"
            value={form.manufacturer_id}
            onChange={(e) => updateField("manufacturer_id", e.target.value)}
          >
            <option value="">Select manufacturer</option>
            {manufacturers.map((manufacturer) => (
              <option key={manufacturer.id} value={manufacturer.id}>
                {manufacturer.name}
              </option>
            ))}
          </select>

          <select
            className="border rounded-md px-3 py-2 bg-background"
            value={form.unit}
            onChange={(e) => updateField("unit", e.target.value)}
          >
            <option value="">Select unit</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>

          <Input
            placeholder="Barcode"
            value={form.barcode}
            onChange={(e) => updateField("barcode", e.target.value)}
          />

          <Input
            className="col-span-2"
            placeholder="Description"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
          />

          <Input
            className="col-span-2"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />

          <label className="col-span-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_oem}
              onChange={(e) => updateField("is_oem", e.target.checked)}
            />
            OEM Product
          </label>

          {form.is_oem && (
            <Input
              className="col-span-2"
              placeholder="OEM reference number"
              value={form.oem_reference_number}
              onChange={(e) => updateField("oem_reference_number", e.target.value)}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}