import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/axios";
import ProductReferencesModal from "./productReferencesModal";

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
  code?: string;
  CompanyName?: string;
  company_name?: string;
  label?: string;
  is_spol?: boolean;
}

type PricingMode = "manual" | "markup";

interface ProductSupplierInput {
  supplier_id: string;
  supplier_cost: string;
  markup: string;
  price: string;
  pricing_mode: PricingMode;
  is_vat: boolean;
}

interface SpolProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  product?: any;
  categories: Option[];
  manufacturers: Option[];
  suppliers: Option[];
  onSaved: () => Promise<void> | void;
  onError?: (message: string) => void;
}

const ADD_NEW_CATEGORY = "__add_new_category__";
const ADD_NEW_MANUFACTURER = "__add_new_manufacturer__";
const ADD_NEW_UNIT = "__add_new_unit__";

type ReferenceModalType = "manufacturer" | "unit" | null;

export default function SpolProductModal({
  open,
  onOpenChange,
  mode = "create",
  product,
  categories,
  manufacturers,
  suppliers,
  onSaved,
  onError,
}: SpolProductModalProps) {
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [units, setUnits] = useState<Option[]>([]);
  const [referencesModalOpen, setReferencesModalOpen] = useState(false);
  const [localManufacturers, setLocalManufacturers] = useState<Option[]>(manufacturers);

  const [referenceModalType, setReferenceModalType] = useState<ReferenceModalType>(null);
  const [savingReference, setSavingReference] = useState(false);
  const [referenceForm, setReferenceForm] = useState({ name: "", code: "", abbreviation: "" });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [form, setForm] = useState({
    name: "",
    category_id: "",
    unit: "",
    selling_price: "",
    description: "",
    manufacturer_id: "",
    part_number: "",
    conversion_factor: "",
    base_unit_id: "",
  });

  const [productSuppliers, setProductSuppliers] = useState<ProductSupplierInput[]>([]);

  const [showInlineCategoryForm, setShowInlineCategoryForm] = useState(false);
  const [inlineCategoryName, setInlineCategoryName] = useState("");
  const [savingInlineCategory, setSavingInlineCategory] = useState(false);

  const [localCategories, setLocalCategories] = useState<Option[]>(categories);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  useEffect(() => {
    setLocalManufacturers(manufacturers);
  }, [manufacturers]);

  const spolCategories = localCategories.filter((c) => {
    return c.is_spol === true;
  });

  const validSupplierOptions = useMemo(() => {
    return suppliers.filter((s) => {
      const id = String(s.id || "").trim();
      return id !== "" && id !== "0";
    });
  }, [suppliers]);

  useEffect(() => {
    if (!open) return;

    api
      .get("/products/units")
      .then((res) => {
        const rows = Array.isArray(res.data?.data) ? res.data.data : res.data;
        setUnits(Array.isArray(rows) ? rows : []);
      })
      .catch(() => setUnits([]));
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && product) {
      setImageFile(null);
      setImagePreview(product.image_path || product.image || "");
      setForm({
        name: product.name || "",
        category_id: product.categoryId ? String(product.categoryId) : "",
        unit: product.unitId ? String(product.unitId) : "",
        selling_price: product.price ? String(product.price) : "",
        description: product.description === "-" ? "" : (product.description || ""),
        manufacturer_id: product.manufacturerId ? String(product.manufacturerId) : "",
        part_number: product.partNumber || "",
        conversion_factor: product.conversion_factor && product.conversion_factor > 1
          ? String(product.conversion_factor)
          : "",
        base_unit_id: product.base_unit_id ? String(product.base_unit_id) : "",
      });
      setProductSuppliers(
        (product.suppliers || []).map((s: any) => ({
          supplier_id: String(s.supplier_id || s.supplierId || s.id || ""),
          supplier_cost: String(s.supplier_cost || s.supplierCost || ""),
          markup: String(s.active_price?.Markup ?? s.markup ?? ""),
          price: String(s.active_price?.Price ?? s.price ?? s.Price ?? ""),
          pricing_mode: (s.active_price?.Markup != null && s.active_price?.Markup !== "" ? "markup" : "manual") as PricingMode,
          is_vat: Boolean(s.is_vat),
        }))
      );
    } else {
      setImageFile(null);
      setImagePreview("");
      setForm({
        name: "",
        category_id: "",
        unit: "",
        selling_price: "",
        description: "",
        manufacturer_id: "",
        part_number: "",
        conversion_factor: "",
        base_unit_id: "",
      });
      setProductSuppliers([]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setShowInlineCategoryForm(false);
    setInlineCategoryName("");
    setReferenceModalType(null);
    setSavingReference(false);
  }, [open, mode, product]);

  const getOptionLabel = (option: Option) => {
    return option.name || option.CompanyName || option.company_name || option.label || "Unnamed";
  };

  const PH_VAT_PERCENT = 12;

  const toNumberOrNull = (value: string): number | null => {
    if (value.trim() === "") return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };

  const formatNum = (value: number | null): string => {
    if (value === null || !Number.isFinite(value)) return "";
    return value.toFixed(2);
  };

  const hasSuppliers = productSuppliers.length > 0 &&
    productSuppliers.some((s) => String(s.supplier_id || "").trim() !== "");

  const isSundriesCategory = spolCategories.some(
    (c) => String(c.id) === String(form.category_id) && c.name === "Sundries"
  ) || (mode === "edit" && product?.category === "Sundries");

  const canSave = form.name.trim() && form.category_id && (isSundriesCategory || form.unit);

  const addSupplierRow = () => {
    setProductSuppliers((prev) => [...prev, {
      supplier_id: "",
      supplier_cost: "",
      markup: "",
      price: "",
      pricing_mode: "manual",
      is_vat: false,
    }]);
  };

  const removeSupplierRow = (index: number) => {
    setProductSuppliers((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSupplierRow = (index: number, field: keyof ProductSupplierInput, value: string) => {
    setProductSuppliers((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const isSupplierAlreadySelected = (supplierId: string, currentIndex: number) => {
    return productSuppliers.some(
      (row, i) => i !== currentIndex && String(row.supplier_id) === String(supplierId)
    );
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const openReferenceModal = (type: ReferenceModalType) => {
    if (!type) return;
    setReferenceModalType(type);
    setReferenceForm({ name: "", code: "", abbreviation: "" });
  };

  const closeReferenceModal = () => {
    setReferenceModalType(null);
    setSavingReference(false);
    setReferenceForm({ name: "", code: "", abbreviation: "" });
  };

  const handleSaveReference = async () => {
    if (!referenceModalType) return;
    const name = referenceForm.name.trim();
    if (!name) { toast.error("Name is required."); return; }
    setSavingReference(true);

    try {
      if (referenceModalType === "manufacturer") {
        const res = await api.post("/products/manufacturers", {
          name,
          code: referenceForm.code.trim() || undefined,
        });
        const created = res.data?.data || res.data?.manufacturer || res.data;
        const newMfg: Option = {
          id: String(created.id),
          name: String(created.name || name),
          code: created.code ?? (referenceForm.code.trim() || undefined),
        };
        setLocalManufacturers((prev) => [...prev, newMfg]);
        setForm((prev) => ({ ...prev, manufacturer_id: newMfg.id }));
      }

      if (referenceModalType === "unit") {
        const res = await api.post("/products/units", {
          name,
          abbreviation: referenceForm.abbreviation.trim() || undefined,
        });
        const created = res.data?.data || res.data?.unit || res.data;
        const newUnit: Option = {
          id: String(created.id),
          name: String(created.name || name),
          label: created.abbreviation || referenceForm.abbreviation.trim() || undefined,
        };
        setUnits((prev) => [...prev, newUnit]);
        setForm((prev) => ({ ...prev, unit: newUnit.id }));
      }

      closeReferenceModal();
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to save.";
      toast.error(message);
    } finally {
      setSavingReference(false);
    }
  };

  const handleSave = async () => {
    const validSuppliersForCheck = productSuppliers.filter((s) => {
      const id = String(s.supplier_id || "").trim();
      return id !== "" && id !== "0";
    });

    for (let i = 0; i < validSuppliersForCheck.length; i++) {
      const s = validSuppliersForCheck[i];
      if (!s.supplier_cost.trim()) {
        toast.error(`Supplier ${i + 1}: Supplier Cost is required.`);
        return;
      }
      if (s.pricing_mode === "manual" && !s.price.trim()) {
        toast.error(`Supplier ${i + 1}: Selling Price is required in Manual mode.`);
        return;
      }
      if (s.pricing_mode === "markup" && !s.markup.trim()) {
        toast.error(`Supplier ${i + 1}: Markup % is required in Markup mode.`);
        return;
      }
    }

    setSaving(true);

    try {
      const payload = new FormData();
      payload.append("name", form.name.trim());
      payload.append("category_id", form.category_id);
      payload.append("unit", form.unit);
      payload.append("is_spol", "1");
      payload.append("item_type", "spol");

      if (form.description.trim()) {
        payload.append("description", form.description.trim());
      }
      if (form.manufacturer_id) {
        payload.append("manufacturer_id", form.manufacturer_id);
      }
      if (form.part_number.trim()) {
        payload.append("part_number", form.part_number.trim());
      }
      if (form.selling_price && !hasSuppliers) {
        payload.append("selling_price", form.selling_price);
      }
      if (form.conversion_factor.trim()) {
        payload.append("conversion_factor", form.conversion_factor.trim());
      }
      if (form.base_unit_id) {
        payload.append("base_unit_id", form.base_unit_id);
      }
      if (imageFile) {
        payload.append("image", imageFile);
      }

      const validSuppliers = productSuppliers.filter((s) => {
        const id = String(s.supplier_id || "").trim();
        return id !== "" && id !== "0";
      });

      validSuppliers.forEach((supplier, index) => {
        payload.append(`suppliers[${index}][supplier_id]`, String(supplier.supplier_id).trim());
        if (supplier.supplier_cost.trim() !== "") {
          payload.append(`suppliers[${index}][supplier_cost]`, supplier.supplier_cost.trim());
        }

        const costVal = toNumberOrNull(supplier.supplier_cost);
        const markupVal = toNumberOrNull(supplier.markup);
        const priceVal = toNumberOrNull(supplier.price);

        const conversionFactor = toNumberOrNull(form.conversion_factor) ?? 1;
        const unitCost = costVal !== null && conversionFactor > 1
          ? costVal / conversionFactor
          : costVal;

        const finalMarkup =
          supplier.pricing_mode === "manual"
            ? (unitCost !== null && unitCost > 0 && priceVal !== null
              ? ((priceVal - unitCost) / unitCost) * 100
              : null)
            : markupVal;

        const finalPrice =
          supplier.pricing_mode === "markup"
            ? (unitCost !== null && markupVal !== null
              ? unitCost + unitCost * (markupVal / 100)
              : null)
            : priceVal;

        if (finalMarkup !== null) {
          payload.append(`suppliers[${index}][markup]`, String(Math.round(finalMarkup * 100) / 100));
        }
        if (finalPrice !== null) {
          payload.append(`suppliers[${index}][price]`, String(finalPrice));
        }

        if (supplier.is_vat) {
          payload.append(`suppliers[${index}][is_vat]`, "1");
          payload.append(`suppliers[${index}][vat_percent]`, String(PH_VAT_PERCENT));
        }
      });

      if (mode === "edit" && product?.id) {
        await api.post(`/products/${product.id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
          params: { _method: "PUT" },
        });
      } else {
        await api.post("/products", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await onSaved();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to save SPOL product:", error);
      const message = error?.response?.data?.message || "Failed to save product.";
      if (onError) {
        onError(message);
      } else {
        toast.error(message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setImageFile(null);
            setImagePreview("");
            setForm({
              name: "",
              category_id: "",
              unit: "",
              selling_price: "",
              description: "",
              manufacturer_id: "",
              part_number: "",
              conversion_factor: "",
              base_unit_id: "",
            });
            setProductSuppliers([]);
            setShowInlineCategoryForm(false);
            setInlineCategoryName("");
          }
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          onOpenChange(nextOpen);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{mode === "edit" ? "Edit Supplies & Oils Product" : "Add Supplies & Oils Product"}</DialogTitle>
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline self-end"
              onClick={() => setReferencesModalOpen(true)}
            >
              Manage References
            </button>
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
                  if (file) {
                    handleFile(file);
                  }
                }}
              />
            </div>

            <div className="space-y-1 col-span-1">
              <span className="text-xs font-medium text-muted-foreground">
                Product Name <span className="text-destructive">*</span>
              </span>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Sundries, Brake Cleaner"
              />
            </div>

            <div className="space-y-1 col-span-1">
              <span className="text-xs font-medium text-muted-foreground">
                Category <span className="text-destructive">*</span>
              </span>
              <select
                className="w-full border rounded-md px-3 py-2 bg-background text-sm h-10"
                value={showInlineCategoryForm ? ADD_NEW_CATEGORY : form.category_id}
                disabled={mode === "edit" && isSundriesCategory}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === ADD_NEW_CATEGORY) {
                    setShowInlineCategoryForm(true);
                    return;
                  }
                  setShowInlineCategoryForm(false);
                  setForm({ ...form, category_id: value });
                }}
              >
                <option value="">Select category</option>
                {spolCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {getOptionLabel(category)}
                  </option>
                ))}
                <option value={ADD_NEW_CATEGORY}>+ Add new category</option>
              </select>

              {showInlineCategoryForm && (
                <div className="mt-2 p-3 border rounded-lg bg-muted/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inlineCategoryName}
                      onChange={(e) => setInlineCategoryName(e.target.value)}
                      placeholder="Category name *"
                      className="flex-1 border rounded-md px-3 py-1.5 text-sm bg-background"
                    />
                    <label className="flex items-center gap-1.5 text-sm whitespace-nowrap">
                      <input type="checkbox" checked disabled className="rounded" />
                      Supplies & Oils
                    </label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowInlineCategoryForm(false);
                        setInlineCategoryName("");
                      }}
                      className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={savingInlineCategory || !inlineCategoryName.trim()}
                      onClick={async () => {
                        if (!inlineCategoryName.trim()) return;
                        setSavingInlineCategory(true);
                        try {
                          const res = await api.post("/products/categories", {
                            name: inlineCategoryName.trim(),
                            is_spol: true,
                          });
                          const newCat = res.data?.data;
                          if (newCat) {
                            setLocalCategories((prev) => [...prev, { id: String(newCat.id), name: newCat.name, is_spol: true }]);
                            setForm((prev) => ({ ...prev, category_id: String(newCat.id) }));
                          }
                          setShowInlineCategoryForm(false);
                          setInlineCategoryName("");
                        } catch (err: any) {
                          toast.error(err?.response?.data?.message || "Failed to create category.");
                        } finally {
                          setSavingInlineCategory(false);
                        }
                      }}
                      className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                    >
                      {savingInlineCategory ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 col-span-2">
              {!isSundriesCategory && (
                <div className="space-y-1 col-span-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Unit <span className="text-destructive">*</span>
                  </span>
                  <select
                    className="w-full border rounded-md px-3 py-2 bg-background text-sm h-10"
                    value={form.unit}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === ADD_NEW_UNIT) {
                        openReferenceModal("unit");
                        return;
                      }
                      setForm({ ...form, unit: value });
                    }}
                  >
                    <option value="">Select unit</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {getOptionLabel(unit)}
                      </option>
                    ))}
                    <option value={ADD_NEW_UNIT}>+ Add new unit</option>
                  </select>
                </div>
              )}

              {!hasSuppliers && (
                <div className="space-y-1 col-span-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Default Selling Price
                  </span>
                  <Input
                    type="number"
                    value={form.selling_price}
                    onChange={(e) => setForm({ ...form, selling_price: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}
            </div>

            {/* UOM Conversion Section */}
            {!isSundriesCategory && (
              <div className="col-span-2 border rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-sm font-medium">Unit Conversion (Optional)</p>
                  <p className="text-xs text-muted-foreground">
                    If this product is purchased in bulk units (e.g., drums) but tracked in smaller units (e.g., liters), set the conversion factor.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      Conversion Factor
                    </span>
                    <Input
                      type="number"
                      min="1"
                      placeholder="e.g. 200 (1 drum = 200 liters)"
                      value={form.conversion_factor}
                      onChange={(e) => setForm({ ...form, conversion_factor: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      Base Unit (Inventory Unit)
                    </span>
                    <select
                      className="w-full border rounded-md px-3 py-2 bg-background text-sm h-10"
                      value={form.base_unit_id}
                      onChange={(e) => setForm({ ...form, base_unit_id: e.target.value })}
                    >
                      <option value="">Same as purchase unit</option>
                      {units.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {getOptionLabel(unit)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {form.conversion_factor && Number(form.conversion_factor) > 1 && form.base_unit_id && (
                  <div className="text-xs text-primary font-medium bg-primary/5 border border-primary/20 rounded-md px-3 py-2">
                    1{" "}
                    {units.find((u) => String(u.id) === String(form.unit))?.name || "purchase unit"}
                    {" "}= {form.conversion_factor}{" "}
                    {units.find((u) => String(u.id) === String(form.base_unit_id))?.name || "base units"}
                    {" "}in inventory
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 col-span-2">
              {!isSundriesCategory && (
                <div className="space-y-1 col-span-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Manufacturer
                  </span>
                  <select
                    className="w-full border rounded-md px-3 py-2 bg-background text-sm h-10"
                    value={form.manufacturer_id}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === ADD_NEW_MANUFACTURER) {
                        openReferenceModal("manufacturer");
                        return;
                      }
                      setForm({ ...form, manufacturer_id: value });
                    }}
                  >
                    <option value="">Select manufacturer</option>
                    {localManufacturers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {getOptionLabel(m)}
                      </option>
                    ))}
                    <option value={ADD_NEW_MANUFACTURER}>+ Add new manufacturer</option>
                  </select>
                </div>
              )}

              <div className="space-y-1 col-span-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Part Number
                </span>
                <Input
                  value={form.part_number}
                  onChange={(e) => setForm({ ...form, part_number: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="space-y-1 col-span-2">
              <span className="text-xs font-medium text-muted-foreground">
                Description
              </span>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>

            {!isSundriesCategory && (
              <div className="border rounded-xl p-4 space-y-3 col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Suppliers</p>
                    <p className="text-xs text-muted-foreground">
                      Optional. Add suppliers for tracked items (brake cleaner, oil, etc.).
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addSupplierRow}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Supplier
                  </Button>
                </div>

                {productSuppliers.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    No suppliers added. This product will use the default selling price.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {productSuppliers.map((supplierRow, index) => {
                      const costVal = toNumberOrNull(supplierRow.supplier_cost);
                      const markupVal = toNumberOrNull(supplierRow.markup);
                      const priceVal = toNumberOrNull(supplierRow.price);

                      const conversionFactor = toNumberOrNull(form.conversion_factor) ?? 1;
                      const unitCost = costVal !== null && conversionFactor > 1
                        ? costVal / conversionFactor
                        : costVal;

                      const computedPrice =
                        unitCost !== null && markupVal !== null
                          ? unitCost + unitCost * (markupVal / 100)
                          : null;
                      const computedMarkup =
                        unitCost !== null && unitCost > 0 && priceVal !== null
                          ? ((priceVal - unitCost) / unitCost) * 100
                          : null;

                      const displayedPrice =
                        supplierRow.pricing_mode === "markup"
                          ? formatNum(computedPrice)
                          : supplierRow.price;
                      const displayedMarkup =
                        supplierRow.pricing_mode === "manual"
                          ? formatNum(computedMarkup)
                          : supplierRow.markup;

                      return (
                        <div
                          key={index}
                          className="rounded-lg border border-border p-3 space-y-3"
                        >
                          <div className="grid grid-cols-12 gap-3 items-center">
                            <select
                              className="col-span-9 border rounded-md px-3 py-2 bg-background text-sm"
                              value={supplierRow.supplier_id}
                              onChange={(e) => updateSupplierRow(index, "supplier_id", e.target.value)}
                            >
                              <option value="">Select supplier</option>
                              {validSupplierOptions.map((supplier) => (
                                <option
                                  key={supplier.id}
                                  value={supplier.id}
                                  disabled={isSupplierAlreadySelected(supplier.id, index)}
                                >
                                  {getOptionLabel(supplier)}
                                </option>
                              ))}
                            </select>
                            <Button
                              type="button"
                              variant="outline"
                              className="col-span-3 px-2"
                              onClick={() => removeSupplierRow(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between rounded-md border p-2">
                            <span className="text-xs text-muted-foreground">
                              {supplierRow.pricing_mode === "markup"
                                ? "Markup mode: calculates selling price."
                                : "Manual mode: calculates markup."}
                            </span>
                            <div className="flex rounded-md border overflow-hidden">
                              <button
                                type="button"
                                onClick={() => {
                                  updateSupplierRow(index, "pricing_mode", "manual");
                                  updateSupplierRow(index, "markup", "");
                                }}
                                className={`px-2 py-1 text-[11px] ${supplierRow.pricing_mode === "manual"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-background text-muted-foreground"
                                  }`}
                              >
                                Manual
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  updateSupplierRow(index, "pricing_mode", "markup");
                                  updateSupplierRow(index, "price", "");
                                }}
                                className={`px-2 py-1 text-[11px] border-l ${supplierRow.pricing_mode === "markup"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-background text-muted-foreground"
                                  }`}
                              >
                                Markup
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground">
                              Supplier Cost
                            </span>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              value={supplierRow.supplier_cost}
                              onChange={(e) => updateSupplierRow(index, "supplier_cost", e.target.value)}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-muted-foreground">
                                Markup %
                              </span>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder={
                                  supplierRow.pricing_mode === "manual"
                                    ? "Auto-calculated"
                                    : "e.g. 40"
                                }
                                value={displayedMarkup}
                                disabled={supplierRow.pricing_mode === "manual"}
                                onChange={(e) => updateSupplierRow(index, "markup", e.target.value)}
                                className={supplierRow.pricing_mode === "manual" ? "opacity-70" : ""}
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-muted-foreground">
                                Selling Price
                              </span>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder={
                                  supplierRow.pricing_mode === "markup"
                                    ? "Auto-calculated"
                                    : "Enter selling price"
                                }
                                value={displayedPrice}
                                disabled={supplierRow.pricing_mode === "markup"}
                                onChange={(e) => updateSupplierRow(index, "price", e.target.value)}
                                className={supplierRow.pricing_mode === "markup" ? "opacity-70" : ""}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`spol_vat_${index}`}
                              checked={supplierRow.is_vat}
                              onChange={(e) =>
                                updateSupplierRow(index, "is_vat", e.target.checked ? "true" : "")
                              }
                              className="rounded"
                            />
                            <label htmlFor={`spol_vat_${index}`} className="text-xs text-muted-foreground">
                              VAT
                            </label>
                            {supplierRow.is_vat && (
                              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                {PH_VAT_PERCENT}%
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !canSave}>
              {saving ? "Saving..." : "Save Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProductReferencesModal
        open={referencesModalOpen}
        onOpenChange={setReferencesModalOpen}
        mode="spol"
        onChanged={async () => {
          await onSaved();
          const res = await api.get("/products/units");
          const rows = Array.isArray(res.data?.data) ? res.data.data : res.data;
          setUnits(Array.isArray(rows) ? rows : []);
        }}
      />

      <Dialog open={referenceModalType !== null} onOpenChange={(nextOpen) => {
        if (!nextOpen) closeReferenceModal();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {referenceModalType === "manufacturer" && "Add Manufacturer"}
              {referenceModalType === "unit" && "Add Unit"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              placeholder="Name"
              value={referenceForm.name}
              onChange={(e) => setReferenceForm((prev) => ({ ...prev, name: e.target.value }))}
            />

            {referenceModalType === "manufacturer" && (
              <Input
                placeholder="Code (optional)"
                value={referenceForm.code}
                onChange={(e) => setReferenceForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
              />
            )}

            {referenceModalType === "unit" && (
              <Input
                placeholder="Abbreviation, example: pcs"
                value={referenceForm.abbreviation}
                onChange={(e) => setReferenceForm((prev) => ({ ...prev, abbreviation: e.target.value }))}
              />
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeReferenceModal} disabled={savingReference}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveReference} disabled={savingReference}>
              {savingReference ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
