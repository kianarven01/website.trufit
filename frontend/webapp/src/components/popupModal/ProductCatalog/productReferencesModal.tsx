import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, X, Plus } from "lucide-react";
import { toast } from "sonner";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Tab = "parts" | "categories" | "manufacturers" | "units";

interface Part {
  id: string;
  name: string;
  code: string | null;
  description?: string | null;
  category_id?: string | null;
  category_name?: string | null;
  products_count?: number;
}

interface Category {
  id: string;
  name: string;
  is_spol: boolean;
  products_count?: number;
  parts_count?: number;
}

interface Manufacturer {
  id: string;
  name: string;
  code: string | null;
  type?: string | null;
  products_count?: number;
  parts_count?: number;
}

interface Unit {
  id: string;
  name: string;
  abbreviation: string | null;
}

interface ProductReferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged?: () => void;
  mode?: "parts" | "spol";
}

export default function ProductReferencesModal({
  open,
  onOpenChange,
  onChanged,
  mode = "parts",
}: ProductReferencesModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>(mode === "spol" ? "categories" : "parts");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [parts, setParts] = useState<Part[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddNew, setShowAddNew] = useState(false);

  const [partForm, setPartForm] = useState({ name: "", description: "", category_id: "" });
  const [categoryForm, setCategoryForm] = useState({ name: "", is_spol: false });
  const [manufacturerForm, setManufacturerForm] = useState({ name: "", type: "" });
  const [unitForm, setUnitForm] = useState({ name: "", abbreviation: "" });

  const [partEditForm, setPartEditForm] = useState({ name: "", description: "", category_id: "" });
  const [categoryEditForm, setCategoryEditForm] = useState({ name: "" });
  const [manufacturerEditForm, setManufacturerEditForm] = useState({ name: "", type: "" });
  const [unitEditForm, setUnitEditForm] = useState({ name: "", abbreviation: "" });

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; name: string } | null>(null);

  const resetState = () => {
    setActiveTab(mode === "spol" ? "categories" : "parts");
    setEditingId(null);
    setSearchQuery("");
    setShowAddNew(false);
    setDeleteConfirm(null);
    setPartForm({ name: "", description: "", category_id: "" });
    setCategoryForm({ name: "", is_spol: mode === "spol" });
    setManufacturerForm({ name: "", type: "" });
    setUnitForm({ name: "", abbreviation: "" });
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [partsRes, catsRes, mfgsRes, unitsRes] = await Promise.all([
        api.get("/products/parts"),
        api.get("/products/categories"),
        api.get("/products/manufacturers"),
        api.get("/products/units"),
      ]);

      const pRows = Array.isArray(partsRes.data?.data) ? partsRes.data.data : partsRes.data;
      setParts(Array.isArray(pRows) ? pRows.map((r: any) => ({
        id: String(r.id),
        name: String(r.name || ""),
        code: r.code ?? null,
        description: r.description ?? null,
        category_id: r.category_id ? String(r.category_id) : null,
        category_name: r.category_name ?? null,
        products_count: Number(r.products_count || 0),
      })) : []);

      const cRows = Array.isArray(catsRes.data?.data) ? catsRes.data.data : catsRes.data;
      setCategories(Array.isArray(cRows) ? cRows.map((r: any) => ({
        id: String(r.id),
        name: String(r.name || ""),
        is_spol: Boolean(r.is_spol),
        products_count: Number(r.products_count || 0),
        parts_count: Number(r.parts_count || 0),
      })) : []);

      const mRows = Array.isArray(mfgsRes.data?.data) ? mfgsRes.data.data : mfgsRes.data;
      setManufacturers(Array.isArray(mRows) ? mRows.map((r: any) => ({
        id: String(r.id),
        name: String(r.name || ""),
        code: r.code ?? null,
        type: r.type ?? null,
        products_count: Number(r.products_count || 0),
        parts_count: Number(r.parts_count || 0),
      })) : []);

      const uRows = Array.isArray(unitsRes.data?.data) ? unitsRes.data.data : unitsRes.data;
      setUnits(Array.isArray(uRows) ? uRows.map((r: any) => ({
        id: String(r.id),
        name: String(r.name || ""),
        abbreviation: r.abbreviation ?? null,
      })) : []);
    } catch (err) {
      console.error("Failed to load references:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    void loadAll();
  }, [open]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (activeTab === "parts") return parts.filter(p => p.name.toLowerCase().includes(q) || p.code?.toLowerCase().includes(q));
    if (activeTab === "categories") {
      const modeCategories = mode === "spol"
        ? categories.filter(c => c.is_spol)
        : categories.filter(c => !c.is_spol);
      return modeCategories.filter(c => c.name.toLowerCase().includes(q));
    }
    if (activeTab === "manufacturers") return manufacturers.filter(m => m.name.toLowerCase().includes(q) || m.code?.toLowerCase().includes(q));
    return units.filter(u => u.name.toLowerCase().includes(q) || u.abbreviation?.toLowerCase().includes(q));
  }, [activeTab, parts, categories, manufacturers, units, searchQuery, mode]);

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setShowAddNew(false);
    if (activeTab === "parts") {
      setPartEditForm({ name: item.name, description: item.description || "", category_id: item.category_id || "" });
    } else if (activeTab === "categories") {
      setCategoryEditForm({ name: item.name });
    } else if (activeTab === "manufacturers") {
      setManufacturerEditForm({ name: item.name, type: item.type || "" });
    } else {
      setUnitEditForm({ name: item.name, abbreviation: item.abbreviation || "" });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowAddNew(false);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      if (activeTab === "parts" && editingId) {
        await api.put(`/products/parts/${editingId}`, { name: partEditForm.name, description: partEditForm.description || undefined, category_id: partEditForm.category_id || undefined });
      } else if (activeTab === "categories" && editingId) {
        await api.put(`/products/categories/${editingId}`, { name: categoryEditForm.name });
      } else if (activeTab === "manufacturers" && editingId) {
        await api.put(`/products/manufacturers/${editingId}`, { name: manufacturerEditForm.name, type: manufacturerEditForm.type || undefined });
      } else if (activeTab === "units" && editingId) {
        await api.put(`/products/units/${editingId}`, { name: unitEditForm.name, abbreviation: unitEditForm.abbreviation || undefined });
      }
      await loadAll();
      cancelEdit();
      onChanged?.();
    } catch (err: any) {
      console.error("Failed to save:", err);
      toast.error(err?.response?.data?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const saveAddNew = async () => {
    setSaving(true);
    try {
      if (activeTab === "parts") {
        if (!partForm.name.trim()) { toast.error("Part name is required."); setSaving(false); return; }
        await api.post("/products/parts", { name: partForm.name, description: partForm.description || undefined, category_id: partForm.category_id || undefined });
      } else if (activeTab === "categories") {
        if (!categoryForm.name.trim()) { toast.error("Category name is required."); setSaving(false); return; }
        await api.post("/products/categories", { name: categoryForm.name, is_spol: mode === "spol" });
      } else if (activeTab === "manufacturers") {
        if (!manufacturerForm.name.trim()) { toast.error("Manufacturer name is required."); setSaving(false); return; }
        await api.post("/products/manufacturers", { name: manufacturerForm.name, type: manufacturerForm.type || undefined });
      } else {
        if (!unitForm.name.trim()) { toast.error("Unit name is required."); setSaving(false); return; }
        await api.post("/products/units", { name: unitForm.name, abbreviation: unitForm.abbreviation || undefined });
      }
      await loadAll();
      setShowAddNew(false);
      if (activeTab === "parts") setPartForm({ name: "", description: "", category_id: "" });
      if (activeTab === "categories") setCategoryForm({ name: "", is_spol: mode === "spol" });
      if (activeTab === "manufacturers") setManufacturerForm({ name: "", type: "" });
      if (activeTab === "units") setUnitForm({ name: "", abbreviation: "" });
      onChanged?.();
    } catch (err: any) {
      console.error("Failed to create:", err);
      toast.error(err?.response?.data?.message || "Failed to create.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (type: string, id: string, name: string) => {
    setEditingId(null);
    setShowAddNew(false);
    setDeleteConfirm({ type, id, name });
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    setSaving(true);
    try {
      const endpoint = deleteConfirm.type === "parts" ? `/products/parts/${deleteConfirm.id}`
        : deleteConfirm.type === "categories" ? `/products/categories/${deleteConfirm.id}`
        : deleteConfirm.type === "manufacturers" ? `/products/manufacturers/${deleteConfirm.id}`
        : `/products/units/${deleteConfirm.id}`;
      await api.delete(endpoint);
      await loadAll();
      setDeleteConfirm(null);
      onChanged?.();
    } catch (err: any) {
      console.error("Failed to delete:", err);
      toast.error(err?.response?.data?.message || "Failed to delete.");
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = mode === "spol"
    ? [
        { key: "categories", label: "Categories" },
        { key: "manufacturers", label: "Manufacturers" },
        { key: "units", label: "Units" },
      ]
    : [
        { key: "parts", label: "Parts" },
        { key: "categories", label: "Categories" },
        { key: "manufacturers", label: "Manufacturers" },
        { key: "units", label: "Units" },
      ];

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) resetState();
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        {deleteConfirm ? (
          <>
            <DialogHeader>
              <DialogTitle>Delete {deleteConfirm.type.slice(0, -1)}?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <span className="font-semibold">{deleteConfirm.name}</span>? This cannot be undone.
            </p>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={saving}>Cancel</Button>
              <Button variant="destructive" onClick={executeDelete} disabled={saving}>
                {saving ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{mode === "spol" ? "Supplies & Oils References" : "Product References"}</DialogTitle>
            </DialogHeader>

            <div className="flex gap-1 border-b">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => { setActiveTab(tab.key); cancelEdit(); setSearchQuery(""); }}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 py-3">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => { setShowAddNew(true); setEditingId(null); }}
                disabled={showAddNew}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add New
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto rounded-lg border min-h-0">
              {loading ? (
                <div className="px-4 py-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Loading...
                </div>
              ) : filtered.length === 0 ? (
                <div className="px-4 py-6 text-sm text-muted-foreground">
                  {searchQuery ? "No results found." : `No ${activeTab} yet.`}
                </div>
              ) : (
                <div className="divide-y">
                  {activeTab === "parts" && (filtered as Part[]).map((item) => {
                    const isEditing = editingId === item.id;
                    return (
                      <div key={item.id} className="grid grid-cols-12 gap-3 items-center px-4 py-3 text-sm">
                        <div className="col-span-3">
                          {isEditing ? (
                            <Input value={partEditForm.name} onChange={(e) => setPartEditForm({ ...partEditForm, name: e.target.value })} placeholder="Part name" />
                          ) : (
                            <span className="font-medium">{item.name}</span>
                          )}
                        </div>
                        <div className="col-span-2">
                          {isEditing ? (
                            <Input value={partEditForm.description} onChange={(e) => setPartEditForm({ ...partEditForm, description: e.target.value })} placeholder="Description" />
                          ) : (
                            <span className="text-muted-foreground truncate">{item.description || "-"}</span>
                          )}
                        </div>
                        <div className="col-span-2">
                          {isEditing ? (
                            <Select value={partEditForm.category_id} onValueChange={(v) => setPartEditForm({ ...partEditForm, category_id: v })}>
                              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                              <SelectContent>
                                {categories.filter(c => !c.is_spol).map((c) => (
                                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-muted-foreground">{item.category_name || "-"}</span>
                          )}
                        </div>
                        <div className="col-span-2 text-muted-foreground">{item.products_count || 0}</div>
                        <div className="col-span-3 flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <Button size="sm" onClick={saveEdit} disabled={saving}>Save</Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit} disabled={saving}><X className="w-4 h-4" /></Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => startEdit(item)} disabled={saving}><Pencil className="w-4 h-4" /></Button>
                              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => confirmDelete("parts", item.id, item.name)} disabled={saving}><Trash2 className="w-4 h-4" /></Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {activeTab === "categories" && (filtered as Category[]).map((item) => {
                    const isEditing = editingId === item.id;
                    return (
                      <div key={item.id} className="grid grid-cols-12 gap-3 items-center px-4 py-3 text-sm">
                        <div className="col-span-5">
                          {isEditing ? (
                            <Input value={categoryEditForm.name} onChange={(e) => setCategoryEditForm({ ...categoryEditForm, name: e.target.value })} placeholder="Category name" />
                          ) : (
                            <span className="font-medium">{item.name}</span>
                          )}
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-medium ${item.is_spol ? "text-blue-600" : "text-muted-foreground"}`}>
                              {item.is_spol ? "Supplies & Oils" : "Parts"}
                            </span>
                            {item.name === "Sundries" && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                                System
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="col-span-3 text-muted-foreground">
                          {item.products_count || 0}P / {item.parts_count || 0}Pt
                        </div>
                        <div className="col-span-2 flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <Button size="sm" onClick={saveEdit} disabled={saving}>Save</Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit} disabled={saving}><X className="w-4 h-4" /></Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => startEdit(item)} disabled={saving || item.name === "Sundries"} title={item.name === "Sundries" ? "System category cannot be edited" : "Edit category"}><Pencil className="w-4 h-4" /></Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={() => confirmDelete("categories", item.id, item.name)}
                                disabled={saving || item.name === "Sundries" || (item.products_count || 0) > 0 || (item.parts_count || 0) > 0}
                                title={item.name === "Sundries" ? "System category cannot be deleted" : (item.products_count || 0) > 0 || (item.parts_count || 0) > 0 ? "Reassign or remove products/parts first" : "Delete category"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {activeTab === "manufacturers" && (filtered as Manufacturer[]).map((item) => {
                    const isEditing = editingId === item.id;
                    const isLinked = (item.products_count || 0) > 0 || (item.parts_count || 0) > 0;
                    return (
                      <div key={item.id} className="grid grid-cols-12 gap-3 items-center px-4 py-3 text-sm">
                        <div className="col-span-4">
                          {isEditing ? (
                            <Input value={manufacturerEditForm.name} onChange={(e) => setManufacturerEditForm({ ...manufacturerEditForm, name: e.target.value })} placeholder="Manufacturer name" />
                          ) : (
                            <span className="font-medium">{item.name}</span>
                          )}
                        </div>
                        <div className="col-span-2">
                          {isEditing ? (
                            <Input value={manufacturerEditForm.type} onChange={(e) => setManufacturerEditForm({ ...manufacturerEditForm, type: e.target.value })} placeholder="Type" />
                          ) : (
                            <span className="text-muted-foreground">{item.type || "-"}</span>
                          )}
                        </div>
                        <div className="col-span-2 text-muted-foreground">{item.code || "-"}</div>
                        <div className="col-span-2 text-muted-foreground">
                          {item.products_count || 0}P / {item.parts_count || 0}Pt
                        </div>
                        <div className="col-span-2 flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <Button size="sm" onClick={saveEdit} disabled={saving}>Save</Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit} disabled={saving}><X className="w-4 h-4" /></Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEdit(item)}
                                disabled={saving || isLinked}
                                title={isLinked ? `Connected to ${item.products_count || 0} product(s) and ${item.parts_count || 0} part(s)` : "Edit manufacturer"}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={() => confirmDelete("manufacturers", item.id, item.name)}
                                disabled={saving || isLinked}
                                title={isLinked ? `Connected to ${item.products_count || 0} product(s) and ${item.parts_count || 0} part(s)` : "Delete manufacturer"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {activeTab === "units" && (filtered as Unit[]).map((item) => {
                    const isEditing = editingId === item.id;
                    return (
                      <div key={item.id} className="grid grid-cols-12 gap-3 items-center px-4 py-3 text-sm">
                        <div className="col-span-5">
                          {isEditing ? (
                            <Input value={unitEditForm.name} onChange={(e) => setUnitEditForm({ ...unitEditForm, name: e.target.value })} placeholder="Unit name" />
                          ) : (
                            <span className="font-medium">{item.name}</span>
                          )}
                        </div>
                        <div className="col-span-4">
                          {isEditing ? (
                            <Input value={unitEditForm.abbreviation} onChange={(e) => setUnitEditForm({ ...unitEditForm, abbreviation: e.target.value })} placeholder="Abbreviation" />
                          ) : (
                            <span className="text-muted-foreground">{item.abbreviation || "-"}</span>
                          )}
                        </div>
                        <div className="col-span-3 flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <Button size="sm" onClick={saveEdit} disabled={saving}>Save</Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit} disabled={saving}><X className="w-4 h-4" /></Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => startEdit(item)} disabled={saving}><Pencil className="w-4 h-4" /></Button>
                              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => confirmDelete("units", item.id, item.name)} disabled={saving}><Trash2 className="w-4 h-4" /></Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {showAddNew && (
              <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
                <div className="text-sm font-medium">
                  Add New {activeTab === "parts" ? "Part" : activeTab === "categories" ? "Category" : activeTab === "manufacturers" ? "Manufacturer" : "Unit"}
                </div>
                {activeTab === "parts" && (
                  <div className="grid grid-cols-3 gap-3">
                    <Input value={partForm.name} onChange={(e) => setPartForm({ ...partForm, name: e.target.value })} placeholder="Part name *" />
                    <Input value={partForm.description} onChange={(e) => setPartForm({ ...partForm, description: e.target.value })} placeholder="Description" />
                    <Select value={partForm.category_id} onValueChange={(v) => setPartForm({ ...partForm, category_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => !c.is_spol).map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {activeTab === "categories" && (
                  <div className="grid grid-cols-1 gap-3">
                    <Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="Category name *" />
                  </div>
                )}
                {activeTab === "manufacturers" && (
                  <div className="grid grid-cols-2 gap-3">
                    <Input value={manufacturerForm.name} onChange={(e) => setManufacturerForm({ ...manufacturerForm, name: e.target.value })} placeholder="Manufacturer name *" />
                    <Input value={manufacturerForm.type} onChange={(e) => setManufacturerForm({ ...manufacturerForm, type: e.target.value })} placeholder="Type" />
                  </div>
                )}
                {activeTab === "units" && (
                  <div className="grid grid-cols-2 gap-3">
                    <Input value={unitForm.name} onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })} placeholder="Unit name *" />
                    <Input value={unitForm.abbreviation} onChange={(e) => setUnitForm({ ...unitForm, abbreviation: e.target.value })} placeholder="Abbreviation" />
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowAddNew(false)} disabled={saving}>Cancel</Button>
                  <Button size="sm" onClick={saveAddNew} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
