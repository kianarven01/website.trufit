import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, UploadCloud, X } from "lucide-react";
import api from "@/api/axios";
import ManageProductCategories from "./manageProductCategories";

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
  products_count?: number;
  parts_count?: number;
}

interface PartOption {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  category_id: string;
  category_name?: string | null;
}

interface ProductSupplierInput {
  supplier_id: string;
  supplier_cost: string;
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

type ProductNameMode = "auto" | "manual";
type ProductSkuMode = "auto" | "manual";
type ReferenceModalType = "category" | "part" | "manufacturer" | "unit" | null;

const ADD_NEW_CATEGORY = "__add_new_category__";
const ADD_NEW_PART = "__add_new_part__";
const ADD_NEW_MANUFACTURER = "__add_new_manufacturer__";
const ADD_NEW_UNIT = "__add_new_unit__";

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

  const [localCategories, setLocalCategories] = useState<Option[]>(categories);
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [localManufacturers, setLocalManufacturers] = useState<Option[]>(manufacturers);
  const [referenceModalType, setReferenceModalType] = useState<ReferenceModalType>(null);
  const [savingReference, setSavingReference] = useState(false);
  const [referenceForm, setReferenceForm] = useState({
    name: "",
    code: "",
    abbreviation: "",
    category_id: "",
    description: "",
  });

  const [units, setUnits] = useState<Option[]>([]);
  const [parts, setParts] = useState<PartOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [productNameMode, setProductNameMode] = useState<ProductNameMode>("auto");
  const [productSkuMode, setProductSkuMode] = useState<ProductSkuMode>("auto");
  const [skuLoading, setSkuLoading] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [form, setForm] = useState({
    name: "",
    SKU: "",
    description: "",
    category_id: categoryId || "",
    part_id: "",
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
    setLocalCategories(categories);
  }, [categories]);

  const handleManagedCategoriesChanged = (nextCategories: Option[]) => {
    setLocalCategories(nextCategories);

    setForm((prev) => {
      if (!prev.category_id) return prev;

      const stillExists = nextCategories.some(
        (category) => String(category.id) === String(prev.category_id)
      );

      return stillExists
        ? prev
        : {
            ...prev,
            category_id: "",
            part_id: "",
          };
    });
  };

  useEffect(() => {
    setLocalManufacturers(manufacturers);
  }, [manufacturers]);

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

    api
      .get("/products/parts")
      .then((res) => {
        const rows = Array.isArray(res.data?.data) ? res.data.data : res.data;

        setParts(
          (Array.isArray(rows) ? rows : []).map((row: any) => ({
            id: String(row.id),
            name: String(row.name || ""),
            code: row.code ?? null,
            description: row.description ?? null,
            category_id: String(row.category_id ?? ""),
            category_name: row.category_name ?? null,
          }))
        );
      })
      .catch((error) => {
        console.error("Failed to load parts:", error);
        setParts([]);
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

  const getOptionName = (option?: Option | null) => {
    if (!option) return "";

    return (
      option.name ||
      option.CompanyName ||
      option.company_name ||
      option.label ||
      ""
    ).trim();
  };

  const updateField = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const selectedManufacturerName = useMemo(() => {
    const selectedManufacturer = localManufacturers.find(
      (manufacturer) =>
        String(manufacturer.id) === String(form.manufacturer_id)
    );

    return getOptionName(selectedManufacturer);
  }, [localManufacturers, form.manufacturer_id]);

  const selectedPartName = useMemo(() => {
    const selectedPart = parts.find(
      (part) => String(part.id) === String(form.part_id)
    );

    return selectedPart?.name?.trim() || "";
  }, [parts, form.part_id]);

  const generatedProductName = useMemo(() => {
    const baseName = [selectedManufacturerName, selectedPartName]
      .filter(Boolean)
      .join(" ")
      .trim();

    const partNumber = form.part_number.trim();

    if (baseName && partNumber) {
      return `${baseName} - ${partNumber}`;
    }

    if (baseName) {
      return baseName;
    }

    return partNumber;
  }, [selectedManufacturerName, selectedPartName, form.part_number]);

  useEffect(() => {
    if (!open || productNameMode !== "auto") return;

    setForm((prev) => {
      if (prev.name === generatedProductName) {
        return prev;
      }

      return {
        ...prev,
        name: generatedProductName,
      };
    });
  }, [open, productNameMode, generatedProductName]);

  useEffect(() => {
    if (!open || productSkuMode !== "auto") return;

    if (!form.manufacturer_id || !form.part_id) {
      setForm((prev) => ({
        ...prev,
        SKU: "",
      }));
      return;
    }

    let cancelled = false;

    const loadSkuPreview = async () => {
      setSkuLoading(true);

      try {
        const res = await api.get("/products/sku-preview", {
          params: {
            manufacturer_id: form.manufacturer_id,
            part_id: form.part_id,
          },
        });

        const generatedSku = String(res.data?.sku || "");

        if (!cancelled) {
          setForm((prev) => ({
            ...prev,
            SKU: generatedSku,
          }));
        }
      } catch (error) {
        console.error("Failed to generate SKU preview:", error);

        if (!cancelled) {
          setForm((prev) => ({
            ...prev,
            SKU: "",
          }));
        }
      } finally {
        if (!cancelled) {
          setSkuLoading(false);
        }
      }
    };

    void loadSkuPreview();

    return () => {
      cancelled = true;
    };
  }, [open, productSkuMode, form.manufacturer_id, form.part_id]);

  const handleProductNameModeChange = (mode: ProductNameMode) => {
    setProductNameMode(mode);

    if (mode === "auto") {
      setForm((prev) => ({
        ...prev,
        name: generatedProductName,
      }));
    }
  };

  const handleProductSkuModeChange = (mode: ProductSkuMode) => {
    setProductSkuMode(mode);

    if (mode === "manual") {
      setSkuLoading(false);
      return;
    }

    if (!form.manufacturer_id || !form.part_id) {
      setForm((prev) => ({
        ...prev,
        SKU: "",
      }));
    }
  };

  const filteredParts = useMemo(() => {
    if (!form.category_id) {
      return parts;
    }

    return parts.filter(
      (part) => String(part.category_id) === String(form.category_id)
    );
  }, [parts, form.category_id]);

  const handleCategoryChange = (categoryIdValue: string) => {
    setForm((prev) => {
      const currentPart = parts.find(
        (part) => String(part.id) === String(prev.part_id)
      );

      const shouldClearPart =
        currentPart &&
        String(currentPart.category_id) !== String(categoryIdValue);

      return {
        ...prev,
        category_id: categoryIdValue,
        part_id: shouldClearPart ? "" : prev.part_id,
      };
    });
  };

  const handlePartChange = (partIdValue: string) => {
    const selectedPart = parts.find(
      (part) => String(part.id) === String(partIdValue)
    );

    setForm((prev) => ({
      ...prev,
      part_id: partIdValue,
      category_id: selectedPart
        ? String(selectedPart.category_id)
        : prev.category_id,
    }));
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
      },
    ]);
  };

  const removeSupplierRow = (index: number) => {
    setProductSuppliers((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSupplierRow = (
    index: number,
    key: keyof ProductSupplierInput,
    value: string
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
      part_id: "",
      unit: "",
      manufacturer_id: "",
      barcode: "",
      part_number: "",
      is_oem: false,
      oem_reference_number: "",
    });

    setProductSuppliers([]);
    setProductNameMode("auto");
    setProductSkuMode("auto");
    setSkuLoading(false);
    setImageFile(null);
    setImagePreview("");
    setReferenceModalType(null);
    setSavingReference(false);
    setReferenceForm({
      name: "",
      code: "",
      abbreviation: "",
      category_id: "",
      description: "",
    });

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

  const openReferenceModal = (type: ReferenceModalType) => {
    if (!type) return;

    setReferenceModalType(type);
    setReferenceForm({
      name: "",
      code: "",
      abbreviation: "",
      category_id: type === "part" ? form.category_id : "",
      description: "",
    });
  };

  const closeReferenceModal = () => {
    setReferenceModalType(null);
    setSavingReference(false);
    setReferenceForm({
      name: "",
      code: "",
      abbreviation: "",
      category_id: "",
      description: "",
    });
  };

  const handleSaveReference = async () => {
    if (!referenceModalType) return;

    const name = referenceForm.name.trim();

    if (!name) {
      alert("Name is required.");
      return;
    }

    setSavingReference(true);

    try {
      if (referenceModalType === "category") {
        const res = await api.post("/products/categories", {
          name,
          code: referenceForm.code.trim() || undefined,
        });

        const created = res.data?.data || res.data?.category || res.data;
        const newCategory: Option = {
          id: String(created.id),
          name: String(created.name || name),
          code: created.code ?? (referenceForm.code.trim() || undefined),
        };

        setLocalCategories((prev) => [...prev, newCategory]);
        updateField("category_id", newCategory.id);
      }

      if (referenceModalType === "manufacturer") {
        const res = await api.post("/products/manufacturers", {
          name,
          code: referenceForm.code.trim() || undefined,
        });

        const created = res.data?.data || res.data?.manufacturer || res.data;
        const newManufacturer: Option = {
          id: String(created.id),
          name: String(created.name || name),
          code: created.code ?? (referenceForm.code.trim() || undefined),
        };

        setLocalManufacturers((prev) => [...prev, newManufacturer]);
        updateField("manufacturer_id", newManufacturer.id);
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
        updateField("unit", newUnit.id);
      }

      if (referenceModalType === "part") {
        const selectedCategoryId = referenceForm.category_id || form.category_id;

        if (!selectedCategoryId) {
          alert("Please select a category for the new part.");
          return;
        }

        const res = await api.post("/products/parts", {
          name,
          category_id: selectedCategoryId,
          code: referenceForm.code.trim() || undefined,
          description: referenceForm.description.trim() || undefined,
        });

        const created = res.data?.data || res.data?.part || res.data;
        const newPart: PartOption = {
          id: String(created.id),
          name: String(created.name || name),
          code: created.code ?? (referenceForm.code.trim() || null),
          description: created.description ?? (referenceForm.description.trim() || null),
          category_id: String(created.category_id || selectedCategoryId),
          category_name: created.category_name ?? null,
        };

        setParts((prev) => [...prev, newPart]);
        setForm((prev) => ({
          ...prev,
          category_id: newPart.category_id,
          part_id: newPart.id,
        }));
      }

      closeReferenceModal();
    } catch (error: any) {
      console.error("Failed to save reference:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to save reference item.";

      alert(message);
    } finally {
      setSavingReference(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const payload = new FormData();

      payload.append("name", form.name.trim());

      if (form.SKU.trim()) {
        payload.append("SKU", form.SKU.trim());
      }

      payload.append("part_number", form.part_number.trim());
      payload.append("is_oem", form.is_oem ? "1" : "0");

      if (form.description.trim()) {
        payload.append("description", form.description.trim());
      }

      if (form.category_id) {
        payload.append("category_id", form.category_id);
      }

      if (form.part_id) {
        payload.append("part_id", form.part_id);
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

  const canSave = form.name.trim() && form.part_number.trim();

  return (
    <>
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

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                Product name
              </span>

              <div className="flex overflow-hidden rounded-md border text-xs">
                <button
                  type="button"
                  onClick={() => handleProductNameModeChange("auto")}
                  className={`px-2 py-1 transition ${
                    productNameMode === "auto"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-accent"
                  }`}
                >
                  Auto
                </button>
                <button
                  type="button"
                  onClick={() => handleProductNameModeChange("manual")}
                  className={`border-l px-2 py-1 transition ${
                    productNameMode === "manual"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-accent"
                  }`}
                >
                  Manual
                </button>
              </div>
            </div>

            <Input
              placeholder={
                productNameMode === "auto"
                  ? "Auto: Manufacturer + Part - Part number"
                  : "Product name"
              }
              value={form.name}
              readOnly={productNameMode === "auto"}
              onChange={(e) => updateField("name", e.target.value)}
              className={productNameMode === "auto" ? "opacity-80" : ""}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">SKU</span>

              <div className="flex overflow-hidden rounded-md border text-xs">
                <button
                  type="button"
                  onClick={() => handleProductSkuModeChange("auto")}
                  className={`px-2 py-1 transition ${
                    productSkuMode === "auto"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-accent"
                  }`}
                >
                  Auto
                </button>
                <button
                  type="button"
                  onClick={() => handleProductSkuModeChange("manual")}
                  className={`border-l px-2 py-1 transition ${
                    productSkuMode === "manual"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-accent"
                  }`}
                >
                  Manual
                </button>
              </div>
            </div>

            <Input
              placeholder={
                productSkuMode === "auto"
                  ? skuLoading
                    ? "Generating SKU..."
                    : "Auto: Brand code + Part code + sequence"
                  : "SKU"
              }
              value={form.SKU}
              readOnly={productSkuMode === "auto"}
              onChange={(e) => updateField("SKU", e.target.value.toUpperCase())}
              className={productSkuMode === "auto" ? "opacity-80" : ""}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Category
              </span>
              <button
                type="button"
                className="text-xs font-medium text-primary hover:underline"
                onClick={() => setManageCategoriesOpen(true)}
              >
                Manage Categories
              </button>
            </div>

            <select
              className="w-full border rounded-md px-3 py-2 bg-background"
              value={form.category_id}
              onChange={(e) => {
                const value = e.target.value;

                if (value === ADD_NEW_CATEGORY) {
                  openReferenceModal("category");
                  return;
                }

                handleCategoryChange(value);
              }}
            >
              <option value="">Select category</option>

              {localCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {getOptionLabel(category)}
                </option>
              ))}

              <option value={ADD_NEW_CATEGORY}>+ Add new category</option>
            </select>
          </div>

          <select
            className="border rounded-md px-3 py-2 bg-background"
            value={form.part_id}
            onChange={(e) => {
              const value = e.target.value;

              if (value === ADD_NEW_PART) {
                openReferenceModal("part");
                return;
              }

              handlePartChange(value);
            }}
          >
            <option value="">Select part</option>

            {filteredParts.map((part) => (
              <option key={part.id} value={part.id}>
                {part.name}
              </option>
            ))}

            <option value={ADD_NEW_PART}>+ Add new part</option>
          </select>

          <select
            className="border rounded-md px-3 py-2 bg-background"
            value={form.manufacturer_id}
            onChange={(e) => {
              const value = e.target.value;

              if (value === ADD_NEW_MANUFACTURER) {
                openReferenceModal("manufacturer");
                return;
              }

              updateField("manufacturer_id", value);
            }}
          >
            <option value="">Select manufacturer</option>

            {localManufacturers.map((manufacturer) => (
              <option key={manufacturer.id} value={manufacturer.id}>
                {getOptionLabel(manufacturer)}
              </option>
            ))}

            <option value={ADD_NEW_MANUFACTURER}>+ Add new manufacturer</option>
          </select>

          <select
            className="border rounded-md px-3 py-2 bg-background"
            value={form.unit}
            onChange={(e) => {
              const value = e.target.value;

              if (value === ADD_NEW_UNIT) {
                openReferenceModal("unit");
                return;
              }

              updateField("unit", value);
            }}
          >
            <option value="">Select unit</option>

            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name || "Unnamed unit"}
              </option>
            ))}

            <option value={ADD_NEW_UNIT}>+ Add new unit</option>
          </select>

          <Input
            placeholder="Part number"
            value={form.part_number}
            onChange={(e) => updateField("part_number", e.target.value)}
          />

          <Input
            placeholder="Barcode (optional - defaults to SKU)"
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
                    className="grid grid-cols-12 gap-3 items-center"
                  >
                    <select
                      className="col-span-6 border rounded-md px-3 py-2 bg-background"
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
                      className="col-span-1 px-2"
                      onClick={() => removeSupplierRow(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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

    <ManageProductCategories
      open={manageCategoriesOpen}
      onOpenChange={setManageCategoriesOpen}
      onChanged={handleManagedCategoriesChanged}
    />

    <Dialog open={referenceModalType !== null} onOpenChange={(nextOpen) => {
      if (!nextOpen) {
        closeReferenceModal();
      }
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {referenceModalType === "category" && "Add Category"}
            {referenceModalType === "part" && "Add Part"}
            {referenceModalType === "manufacturer" && "Add Manufacturer"}
            {referenceModalType === "unit" && "Add Unit"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Name"
            value={referenceForm.name}
            onChange={(e) =>
              setReferenceForm((prev) => ({ ...prev, name: e.target.value }))
            }
          />

          {(referenceModalType === "category" ||
            referenceModalType === "part" ||
            referenceModalType === "manufacturer") && (
            <Input
              placeholder="Code (optional)"
              value={referenceForm.code}
              onChange={(e) =>
                setReferenceForm((prev) => ({
                  ...prev,
                  code: e.target.value.toUpperCase(),
                }))
              }
            />
          )}

          {referenceModalType === "unit" && (
            <Input
              placeholder="Abbreviation, example: pcs"
              value={referenceForm.abbreviation}
              onChange={(e) =>
                setReferenceForm((prev) => ({
                  ...prev,
                  abbreviation: e.target.value,
                }))
              }
            />
          )}

          {referenceModalType === "part" && (
            <>
              <select
                className="w-full border rounded-md px-3 py-2 bg-background"
                value={referenceForm.category_id}
                onChange={(e) =>
                  setReferenceForm((prev) => ({
                    ...prev,
                    category_id: e.target.value,
                  }))
                }
              >
                <option value="">Select category for this part</option>
                {localCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {getOptionLabel(category)}
                  </option>
                ))}
              </select>

              <Input
                placeholder="Description (optional)"
                value={referenceForm.description}
                onChange={(e) =>
                  setReferenceForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={closeReferenceModal}
            disabled={savingReference}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSaveReference}
            disabled={savingReference}
          >
            {savingReference ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}