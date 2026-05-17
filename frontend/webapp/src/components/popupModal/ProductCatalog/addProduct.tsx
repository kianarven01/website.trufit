import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, UploadCloud, X } from "lucide-react";
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
  name?: string;
  CompanyName?: string;
  company_name?: string;
  label?: string;
}

interface ProductSupplierInput {
  supplier_id: string;
  supplier_cost: string;
  is_vat?: boolean;
  vat_percent?: string;
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
    description: "",
    category_id: categoryId || "",
    unit: "",
    manufacturer_id: "",
    barcode: "",
    part_number: "",
    is_oem: false,
    oem_reference_number: "",
  });

  const [productSuppliers, setProductSuppliers] = useState<
    ProductSupplierInput[]
  >([]);

  useEffect(() => {
    if (!open) return;

    api
      .get("/products/units")
      .then((res) => {
        const rows = Array.isArray(res.data?.data) ? res.data.data : res.data;
        setUnits(Array.isArray(rows) ? rows : []);
      })
      .catch((error) => {
        console.error("Failed to load units:", error);
        setUnits([]);
      });

    setForm((prev) => ({
      ...prev,
      category_id: categoryId || prev.category_id,
    }));
  }, [open, categoryId]);

  const getOptionLabel = (option: Option) => {
    return (
      option.name ||
      option.CompanyName ||
      option.company_name ||
      option.label ||
      "Unnamed"
    );
  };

  const updateField = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * Supplier IDs are UUIDs in your Supabase table.
   * So DO NOT use Number(supplier.id).
   */
  const validSupplierOptions = suppliers.filter((supplier) => {
    const supplierId = String(supplier.id || "").trim();
    return supplierId !== "" && supplierId !== "0";
  });

  const addSupplierRow = () => {
    setProductSuppliers((prev) => [
      ...prev,
      {
        supplier_id: "",
        supplier_cost: "",
        is_vat: false,
        vat_percent: "12",
      },
    ]);
  };

  const removeSupplierRow = (index: number) => {
    setProductSuppliers((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSupplierRow = (
    index: number,
    key: keyof ProductSupplierInput,
    value: any
  ) => {
    setProductSuppliers((prev) =>
      prev.map((supplier, i) =>
        i === index
          ? {
              ...supplier,
              [key]: value,
            }
          : supplier
      )
    );
  };

  const isSupplierAlreadySelected = (
    supplierId: string,
    currentIndex: number
  ) => {
    return productSuppliers.some(
      (row, index) =>
        index !== currentIndex &&
        String(row.supplier_id).trim() === String(supplierId).trim()
    );
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
      description: "",
      category_id: categoryId || "",
      unit: "",
      manufacturer_id: "",
      barcode: "",
      part_number: "",
      is_oem: false,
      oem_reference_number: "",
    });

    setProductSuppliers([]);
    setImageFile(null);
    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleModalChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }

    onOpenChange(nextOpen);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const payload = new FormData();

      payload.append("name", form.name.trim());
      payload.append("SKU", form.SKU.trim());
      payload.append("part_number", form.part_number.trim());
      payload.append("is_oem", form.is_oem ? "1" : "0");

      if (form.description.trim()) {
        payload.append("description", form.description.trim());
      }

      if (form.category_id) {
        payload.append("category_id", form.category_id);
      }

      if (form.unit) {
        payload.append("unit", form.unit);
      }

      if (form.manufacturer_id) {
        payload.append("manufacturer_id", form.manufacturer_id);
      }

      if (form.barcode.trim()) {
        payload.append("barcode", form.barcode.trim());
      }

      if (form.oem_reference_number.trim()) {
        payload.append("oem_reference_number", form.oem_reference_number.trim());
      }

      /**
       * Supplier IDs are UUIDs, so keep them as strings.
       * Only remove blank placeholder values.
       */
      const validSuppliers = productSuppliers.filter((supplier) => {
        const supplierId = String(supplier.supplier_id || "").trim();
        return supplierId !== "" && supplierId !== "0";
      });

      validSuppliers.forEach((supplier, index) => {
        payload.append(
          `suppliers[${index}][supplier_id]`,
          String(supplier.supplier_id).trim()
        );

        if (supplier.supplier_cost.trim() !== "") {
          payload.append(
            `suppliers[${index}][supplier_cost]`,
            supplier.supplier_cost.trim()
          );
        }

        payload.append(
          `suppliers[${index}][is_vat]`,
          supplier.is_vat ? "1" : "0"
        );

        if (supplier.is_vat && supplier.vat_percent) {
          payload.append(
            `suppliers[${index}][vat_percent]`,
            String(supplier.vat_percent).trim()
          );
        }
      });

      if (variantId) {
        payload.append("car_variant_id", variantId);
      }

      if (imageFile) {
        payload.append("image", imageFile);
      }

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

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to save product.";

      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const canSave =
    form.name.trim() && form.SKU.trim() && form.part_number.trim();

  return (
    <Dialog open={open} onOpenChange={handleModalChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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

              if (file) {
                handleFile(file);
              }
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

                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Drop product image here</p>
                <p className="text-xs text-muted-foreground">
                  or click to browse
                </p>
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (file) {
                  handleFile(file);
                }
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
                {getOptionLabel(category)}
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
                {getOptionLabel(manufacturer)}
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
                {getOptionLabel(unit)}
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

          <div className="col-span-2 border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Suppliers</p>
                <p className="text-xs text-muted-foreground">
                  Add one or more suppliers for this product.
                </p>
              </div>

              <Button type="button" variant="outline" onClick={addSupplierRow}>
                <Plus className="w-4 h-4 mr-2" />
                Add Supplier
              </Button>
            </div>

            {productSuppliers.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                No suppliers added yet. Click Add Supplier to link suppliers to
                this product.
              </div>
            ) : (
              <div className="space-y-3">
                {productSuppliers.map((supplierRow, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-3 space-y-3 bg-muted/30"
                  >
                    <div className="grid grid-cols-12 gap-3 items-center">
                      <select
                        className="col-span-6 border rounded-md px-3 py-2 bg-background text-sm"
                        value={supplierRow.supplier_id}
                        onChange={(e) =>
                          updateSupplierRow(index, "supplier_id", e.target.value)
                        }
                      >
                        <option value="">Select supplier</option>

                        {validSupplierOptions.map((supplier) => (
                          <option
                            key={supplier.id}
                            value={supplier.id}
                            disabled={isSupplierAlreadySelected(
                              supplier.id,
                              index
                            )}
                          >
                            {getOptionLabel(supplier)}
                          </option>
                        ))}
                      </select>

                      <Input
                        className="col-span-5"
                        placeholder="Supplier cost"
                        type="number"
                        min="0"
                        step="0.01"
                        value={supplierRow.supplier_cost}
                        onChange={(e) =>
                          updateSupplierRow(
                            index,
                            "supplier_cost",
                            e.target.value
                          )
                        }
                      />

                      <Button
                        type="button"
                        variant="outline"
                        className="col-span-1 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-input"
                        onClick={() => removeSupplierRow(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex gap-4 items-center pl-1 text-xs">
                      <span className="text-muted-foreground font-medium">Tax Type:</span>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="radio"
                            name={`isVat-${index}`}
                            checked={!supplierRow.is_vat}
                            onChange={() => updateSupplierRow(index, "is_vat", false)}
                            className="accent-primary"
                          />
                          Non-VAT
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="radio"
                            name={`isVat-${index}`}
                            checked={supplierRow.is_vat}
                            onChange={() => updateSupplierRow(index, "is_vat", true)}
                            className="accent-primary"
                          />
                          VAT
                        </label>
                      </div>

                      {supplierRow.is_vat && (
                        <div className="flex items-center gap-1.5 ml-4">
                          <span className="text-muted-foreground font-medium">Percent (%):</span>
                          <Input
                            type="number"
                            placeholder="12"
                            className="h-7 w-16 text-xs px-2"
                            value={supplierRow.vat_percent || ""}
                            onChange={(e) =>
                              updateSupplierRow(
                                index,
                                "vat_percent",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

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
              onChange={(e) =>
                updateField("oem_reference_number", e.target.value)
              }
            />
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleModalChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !canSave}
          >
            {saving ? "Saving..." : "Save Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}