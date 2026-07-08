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
  products_count?: number;
  parts_count?: number;
  is_spol?: boolean;
}

interface PartOption {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  category_id: string;
  category_name?: string | null;
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

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  product?: any | null;
  categories: Option[];
  manufacturers: Option[];
  suppliers: Option[];
  variantId?: string | null;
  categoryId?: string | null;
  onSaved: () => Promise<void> | void;
  onError?: (message: string) => void;
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
  mode = "create",
  product = null,
  categories,
  manufacturers,
  suppliers,
  variantId,
  categoryId,
  onSaved,
  onError,
}: ProductModalProps) {
  const isEditMode = mode === "edit";
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [localCategories, setLocalCategories] = useState<Option[]>(categories);
  const [referencesModalOpen, setReferencesModalOpen] = useState(false);
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
  const [pendingPartReferenceForm, setPendingPartReferenceForm] = useState<typeof referenceForm | null>(null);

  const [showInlineCategoryForm, setShowInlineCategoryForm] = useState(false);
  const [inlineCategoryName, setInlineCategoryName] = useState("");
  const [savingInlineCategory, setSavingInlineCategory] = useState(false);

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
  });

  const [productSuppliers, setProductSuppliers] = useState<
    ProductSupplierInput[]
  >([]);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);


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

    if (!isEditMode) {
      setForm((prev) => ({
        ...prev,
        category_id: categoryId || prev.category_id,
      }));
    }
  }, [open, categoryId, isEditMode]);

  useEffect(() => {
    if (!open || !isEditMode || !product) return;

    setProductNameMode("manual");
    setProductSkuMode("manual");
    setSkuLoading(false);
    setProductSuppliers([]);
    setImageFile(null);
    setImagePreview(product.image_path || product.image || "");

    setForm({
      name: product.name || "",
      SKU: product.SKU || product.sku || "",
      description: product.description || "",
      category_id: product.category_id ? String(product.category_id) : "",
      part_id: product.part_id ? String(product.part_id) : "",
      unit: product.unit ? String(product.unit) : "",
      manufacturer_id: product.manufacturer_id
        ? String(product.manufacturer_id)
        : "",
      barcode: product.barcode || "",
      part_number: product.part_number || "",
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [open, isEditMode, product]);

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
    if (!open || isEditMode || productNameMode !== "auto") return;

    setForm((prev) => {
      if (prev.name === generatedProductName) {
        return prev;
      }

      return {
        ...prev,
        name: generatedProductName,
      };
    });
  }, [open, isEditMode, productNameMode, generatedProductName]);

  useEffect(() => {
    if (!open || isEditMode || productSkuMode !== "auto") return;

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
  }, [open, isEditMode, productSkuMode, form.manufacturer_id, form.part_id]);

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

  const selectedPart = useMemo(() => {
    return parts.find((part) => String(part.id) === String(form.part_id)) || null;
  }, [parts, form.part_id]);

  const filteredParts = useMemo(() => {
    if (!form.category_id) return parts;
    return parts.filter((p) => String(p.category_id) === String(form.category_id));
  }, [parts, form.category_id]);

  /**
   * Supplier IDs are UUIDs in your Supabase table.
   * So DO NOT use Number(supplier.id).
   */
  const validSupplierOptions = suppliers.filter((supplier) => {
    const supplierId = String(supplier.id || "").trim();
    return supplierId !== "" && supplierId !== "0";
  });

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

  const addSupplierRow = () => {
    setProductSuppliers((prev) => [
      ...prev,
      {
        supplier_id: "",
        supplier_cost: "",
        markup: "",
        price: "",
        pricing_mode: "manual",
        is_vat: false,
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
      category_id: type === "part" ? selectedPart?.category_id || "" : "",
      description: "",
    });
  };

  const closeReferenceModal = () => {
    setReferenceModalType(null);
    setSavingReference(false);
    setPendingPartReferenceForm(null);
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
      toast.error("Name is required.");
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

        if (pendingPartReferenceForm) {
          setReferenceModalType("part");
          setReferenceForm({
            ...pendingPartReferenceForm,
            category_id: newCategory.id,
          });
          setPendingPartReferenceForm(null);
          return;
        }
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
          toast.error("Please select a category for the new part.");
          return;
        }

        const res = await api.post("/products/parts", {
          name,
          category_id: selectedCategoryId,
          description: referenceForm.description.trim() || undefined,
        });

        const created = res.data?.data || res.data?.part || res.data;
        const newPart: PartOption = {
          id: String(created.id),
          name: String(created.name || name),
          code: created.code ?? null,
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
    if (!isEditMode) {
      const validSuppliers = productSuppliers.filter((s) => {
        const id = String(s.supplier_id || "").trim();
        return id !== "" && id !== "0";
      });

      for (let i = 0; i < validSuppliers.length; i++) {
        const s = validSuppliers[i];
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
    }

    setSaving(true);

    try {
      const payload = new FormData();

      payload.append("name", form.name.trim());
      payload.append("item_type", "part");

      if (form.SKU.trim() || isEditMode) {
        payload.append("SKU", form.SKU.trim());
      }

      payload.append("part_number", form.part_number.trim());

      if (form.description.trim() || isEditMode) {
        payload.append("description", form.description.trim());
      }

      if (form.category_id || isEditMode) {
        payload.append("category_id", form.category_id || "");
      }

      if (form.part_id || isEditMode) {
        payload.append("part_id", form.part_id || "");
      }

      if (form.unit || isEditMode) {
        payload.append("unit", form.unit || "");
      }

      if (form.manufacturer_id || isEditMode) {
        payload.append("manufacturer_id", form.manufacturer_id || "");
      }

      if (form.barcode.trim() || isEditMode) {
        payload.append("barcode", form.barcode.trim());
      }

      /**
       * Supplier IDs are UUIDs, so keep them as strings.
       * Only remove blank placeholder values.
       * Supplier editing is intentionally create-mode only.
       */
      if (!isEditMode) {
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

          const costVal = toNumberOrNull(supplier.supplier_cost);
          const markupVal = toNumberOrNull(supplier.markup);
          const priceVal = toNumberOrNull(supplier.price);

          const finalMarkup =
            supplier.pricing_mode === "manual"
              ? (costVal !== null && costVal > 0 && priceVal !== null
                  ? ((priceVal - costVal) / costVal) * 100
                  : null)
              : markupVal;

          const finalPrice =
            supplier.pricing_mode === "markup"
              ? (costVal !== null && markupVal !== null
                  ? costVal + costVal * (markupVal / 100)
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

        if (variantId) {
          payload.append("car_variant_id", variantId);
        }
      }

      if (imageFile) {
        payload.append("image", imageFile);
      }

      if (isEditMode && product?.id) {
        payload.append("_method", "PATCH");

        await api.post(`/products/${product.id}`, payload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await api.post("/products", payload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      await onSaved();
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to save product:", error);

      const validationErrors = error?.response?.data?.errors;

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (validationErrors
          ? Object.values(validationErrors).flat().join(" ")
          : "Failed to save product.");

      if (onError) {
        onError(message);
      } else {
      toast.error(message);
      }
    } finally {
      setSaving(false);
    }
  };

  const canSave = form.name.trim() && form.category_id && form.unit;

  return (
    <>
    <Dialog open={open} onOpenChange={handleModalChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Product" : "Add Product"}</DialogTitle>
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
            <span className="text-xs font-medium text-muted-foreground">
              Part
            </span>

            <select
              className="w-full border rounded-md px-3 py-2 bg-background"
              value={form.part_id}
              onChange={(e) => {
                const value = e.target.value;

                if (value === ADD_NEW_PART) {
                  openReferenceModal("part");
                  return;
                }

                const selectedPart = parts.find((part) => String(part.id) === String(value));
                setForm((prev) => ({
                  ...prev,
                  part_id: value,
                  category_id: selectedPart ? String(selectedPart.category_id) : "",
                }));
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
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Category
              </span>
            </div>

            <select
              className="w-full border rounded-md px-3 py-2 bg-background"
              value={showInlineCategoryForm ? ADD_NEW_CATEGORY : form.category_id}
              onChange={(e) => {
                const value = e.target.value;
                if (value === ADD_NEW_CATEGORY) {
                  setShowInlineCategoryForm(true);
                  return;
                }
                setShowInlineCategoryForm(false);
                setForm((prev) => ({
                  ...prev,
                  category_id: value,
                  part_id: "",
                }));
              }}
            >
              <option value="">Select category</option>
              {localCategories
                .filter((c) => !c.is_spol)
                .map((category) => (
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
                          is_spol: false,
                        });
                        const newCat = res.data?.data;
                        if (newCat) {
                          setLocalCategories((prev) => [...prev, { id: String(newCat.id), name: newCat.name }]);
                          setForm((prev) => ({ ...prev, category_id: String(newCat.id), part_id: "" }));
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

          {!isEditMode && (
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
              <div className="space-y-4">
                {productSuppliers.map((supplierRow, index) => {
                  const costVal = toNumberOrNull(supplierRow.supplier_cost);
                  const markupVal = toNumberOrNull(supplierRow.markup);
                  const priceVal = toNumberOrNull(supplierRow.price);

                  const computedPrice =
                    costVal !== null && markupVal !== null
                      ? costVal + costVal * (markupVal / 100)
                      : null;
                  const computedMarkup =
                    costVal !== null && costVal > 0 && priceVal !== null
                      ? ((priceVal - costVal) / costVal) * 100
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
                          onChange={(e) =>
                            updateSupplierRow(index, "supplier_id", e.target.value)
                          }
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
                            className={`px-2 py-1 text-[11px] ${
                              supplierRow.pricing_mode === "manual"
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
                            className={`px-2 py-1 text-[11px] border-l ${
                              supplierRow.pricing_mode === "markup"
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
                          onChange={(e) =>
                            updateSupplierRow(index, "supplier_cost", e.target.value)
                          }
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
                            onChange={(e) =>
                              updateSupplierRow(index, "markup", e.target.value)
                            }
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
                            onChange={(e) =>
                              updateSupplierRow(index, "price", e.target.value)
                            }
                            className={supplierRow.pricing_mode === "markup" ? "opacity-70" : ""}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`vat_${index}`}
                          checked={supplierRow.is_vat}
                          onChange={(e) =>
                            updateSupplierRow(index, "is_vat", e.target.checked ? "true" : "")
                          }
                          className="rounded"
                        />
                        <label htmlFor={`vat_${index}`} className="text-xs text-muted-foreground">
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
            {saving ? "Saving..." : isEditMode ? "Update Product" : "Save Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <ProductReferencesModal
      open={referencesModalOpen}
      onOpenChange={setReferencesModalOpen}
      mode="parts"
      onChanged={async () => {
        await onSaved();
        const [unitsRes, partsRes] = await Promise.all([
          api.get("/products/units"),
          api.get("/products/parts"),
        ]);
        const uRows = Array.isArray(unitsRes.data?.data) ? unitsRes.data.data : unitsRes.data;
        setUnits(Array.isArray(uRows) ? uRows : []);
        const pRows = Array.isArray(partsRes.data?.data) ? partsRes.data.data : partsRes.data;
        setParts(
          (Array.isArray(pRows) ? pRows : []).map((row: any) => ({
            id: String(row.id),
            name: String(row.name || ""),
            code: row.code ?? null,
            description: row.description ?? null,
            category_id: String(row.category_id ?? ""),
            category_name: row.category_name ?? null,
          }))
        );
      }}
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
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === ADD_NEW_CATEGORY) {
                    setPendingPartReferenceForm(referenceForm);
                    setReferenceModalType("category");
                    setReferenceForm({
                      name: "",
                      code: "",
                      abbreviation: "",
                      category_id: "",
                      description: "",
                    });
                    return;
                  }

                  setReferenceForm((prev) => ({
                    ...prev,
                    category_id: value,
                  }));
                }}
              >
                <option value="">Select category for this part</option>
                {localCategories.filter((c) => !c.is_spol).map((category) => (
                  <option key={category.id} value={category.id}>
                    {getOptionLabel(category)}
                  </option>
                ))}
                <option value={ADD_NEW_CATEGORY}>+ Add new category</option>
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