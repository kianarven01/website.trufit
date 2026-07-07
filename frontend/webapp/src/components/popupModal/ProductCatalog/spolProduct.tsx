import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
}

interface ProductSupplierInput {
  supplier_id: string;
  supplier_cost: string;
}

interface SpolProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  categories,
  manufacturers,
  suppliers,
  onSaved,
  onError,
}: SpolProductModalProps) {
  const [saving, setSaving] = useState(false);
  const [units, setUnits] = useState<Option[]>([]);
  const [referencesModalOpen, setReferencesModalOpen] = useState(false);
  const [localManufacturers, setLocalManufacturers] = useState<Option[]>(manufacturers);

  const [referenceModalType, setReferenceModalType] = useState<ReferenceModalType>(null);
  const [savingReference, setSavingReference] = useState(false);
  const [referenceForm, setReferenceForm] = useState({ name: "", code: "", abbreviation: "" });

  const [form, setForm] = useState({
    name: "",
    category_id: "",
    unit: "",
    selling_price: "",
    description: "",
    manufacturer_id: "",
    part_number: "",
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
    return (c as any).is_spol === true || (c as any).is_spol === "true";
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
    if (!open) {
      setForm({
        name: "",
        category_id: "",
        unit: "",
        selling_price: "",
        description: "",
        manufacturer_id: "",
        part_number: "",
      });
      setProductSuppliers([]);
      setShowInlineCategoryForm(false);
      setInlineCategoryName("");
      setReferenceModalType(null);
      setSavingReference(false);
    }
  }, [open]);

  const getOptionLabel = (option: Option) => {
    return option.name || option.CompanyName || option.company_name || option.label || "Unnamed";
  };

  const hasSuppliers = productSuppliers.length > 0 &&
    productSuppliers.some((s) => String(s.supplier_id || "").trim() !== "");

  const isSundriesCategory = spolCategories.some(
    (c) => String(c.id) === String(form.category_id) && c.name === "Sundries"
  );

  const canSave = form.name.trim() && form.category_id && (isSundriesCategory || form.unit);

  const addSupplierRow = () => {
    setProductSuppliers((prev) => [...prev, { supplier_id: "", supplier_cost: "" }]);
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
    if (!name) { alert("Name is required."); return; }
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
      payload.append("category_id", form.category_id);
      payload.append("unit", form.unit);
      payload.append("is_spol", "true");
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

      const validSuppliers = productSuppliers.filter((s) => {
        const id = String(s.supplier_id || "").trim();
        return id !== "" && id !== "0";
      });

      validSuppliers.forEach((supplier, index) => {
        payload.append(`suppliers[${index}][supplier_id]`, String(supplier.supplier_id).trim());
        if (supplier.supplier_cost.trim() !== "") {
          payload.append(`suppliers[${index}][supplier_cost]`, supplier.supplier_cost.trim());
        }
      });

      await api.post("/products", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await onSaved();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to save SPOL product:", error);
      const message = error?.response?.data?.message || "Failed to save product.";
      if (onError) {
        onError(message);
      } else {
        alert(message);
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
          setForm({
            name: "",
            category_id: "",
            unit: "",
            selling_price: "",
            description: "",
            manufacturer_id: "",
            part_number: "",
          });
          setProductSuppliers([]);
          setShowInlineCategoryForm(false);
          setInlineCategoryName("");
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add SPOL Product</DialogTitle>
          <button
            type="button"
            className="text-xs font-medium text-primary hover:underline self-end"
            onClick={() => setReferencesModalOpen(true)}
          >
            Manage SPOL References
          </button>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">
              Product Name <span className="text-destructive">*</span>
            </span>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Sundries, Brake Cleaner"
            />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">
              Category <span className="text-destructive">*</span>
            </span>
            <select
              className="w-full border rounded-md px-3 py-2 bg-background text-sm"
              value={showInlineCategoryForm ? ADD_NEW_CATEGORY : form.category_id}
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
              <option value="">Select SPOL category</option>
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
                    SPOL
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
                        alert(err?.response?.data?.message || "Failed to create category.");
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

          <div className="grid grid-cols-2 gap-4">
            {!isSundriesCategory && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Unit <span className="text-destructive">*</span>
                </span>
                <select
                  className="w-full border rounded-md px-3 py-2 bg-background text-sm"
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

            <div className="space-y-1">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            {!isSundriesCategory && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Manufacturer
                </span>
                <select
                  className="w-full border rounded-md px-3 py-2 bg-background text-sm"
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

            <div className="space-y-1">
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

          <div className="space-y-1">
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
          <div className="border rounded-xl p-4 space-y-3">
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
              <div className="space-y-3">
                {productSuppliers.map((supplierRow, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-center">
                    <select
                      className="col-span-6 border rounded-md px-3 py-2 bg-background text-sm"
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
                    <Input
                      className="col-span-5"
                      placeholder="Supplier cost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={supplierRow.supplier_cost}
                      onChange={(e) => updateSupplierRow(index, "supplier_cost", e.target.value)}
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
