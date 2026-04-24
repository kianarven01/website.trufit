import { useEffect, useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
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
  suppliers: Option[];
  variantId?: string | null;
  categoryId?: string | null;
  onSaved: () => Promise<void> | void;
}

export default function ProductModal({
  open,
  onOpenChange,
  categories,
  manufacturers,
  suppliers,
  variantId,
  categoryId,
  onSaved,
}: ProductModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [units, setUnits] = useState<Option[]>([]);
  const [saving, setSaving] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [form, setForm] = useState({
    name: "",
    SKU: "",
    cost: "",
    description: "",
    category_id: categoryId || "",
    unit: "",
    manufacturer_id: "",
    supplier_id: "",
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

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
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
      supplier_id: "",
      barcode: "",
      part_number: "",
      is_oem: false,
      oem_reference_number: "",
    });

    setImageFile(null);
    setImagePreview("");
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
      if (imageFile) payload.append("image", imageFile);

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

  const canSave =
    form.name.trim() &&
    form.SKU.trim() &&
    form.cost.trim() &&
    form.part_number.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div
            className="col-span-2 border border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/30 transition"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
          >
            {imagePreview ? (
              <div className="relative w-full">
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="w-full h-48 object-cover rounded-lg border"
                />

                <button
                  type="button"
                  className="absolute top-2 right-2 bg-background border rounded-full p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageFile(null);
                    setImagePreview("");
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Drop product image here</p>
                <p className="text-xs text-muted-foreground">or click to browse</p>
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>

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
            value={form.supplier_id}
            onChange={(e) => updateField("supplier_id", e.target.value)}
          >
            <option value="">Select supplier optional</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
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

          <Button onClick={handleSave} disabled={saving || !canSave}>
            {saving ? "Saving..." : "Save Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}