import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
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

interface ProductCategory {
  id: string;
  name: string;
  code?: string | null;
  products_count?: number;
  parts_count?: number;
}

interface ManageProductCategoriesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged?: (categories: ProductCategory[]) => void;
}

export default function ManageProductCategories({
  open,
  onOpenChange,
  onChanged,
}: ManageProductCategoriesProps) {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  const loadCategories = async () => {
    setLoading(true);

    try {
      const res = await api.get("/products/categories");
      const rows = Array.isArray(res.data?.data) ? res.data.data : res.data;

      const normalized = (Array.isArray(rows) ? rows : []).map((row: any) => ({
        id: String(row.id),
        name: String(row.name || ""),
        code: row.code ?? null,
        products_count: Number(row.products_count || 0),
        parts_count: Number(row.parts_count || 0),
      }));

      setCategories(normalized);
      onChanged?.(normalized);
    } catch (error) {
      console.error("Failed to load product categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    void loadCategories();
  }, [open]);

  const startEdit = (category: ProductCategory) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditCode(category.code || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditCode("");
  };

  const saveEdit = async (categoryId: string) => {
    const name = editName.trim();

    if (!name) {
      alert("Category name is required.");
      return;
    }

    setSaving(true);

    try {
      await api.put(`/products/categories/${categoryId}`, {
        name,
        code: editCode.trim() || undefined,
      });

      await loadCategories();
      cancelEdit();
    } catch (error: any) {
      console.error("Failed to update category:", error);
      alert(
        error?.response?.data?.message ||
          "Failed to update product category."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (category: ProductCategory) => {
    const usedCount = Number(category.products_count || 0) + Number(category.parts_count || 0);

    if (usedCount > 0) {
      alert(
        "This category is currently used by products or parts and cannot be deleted."
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete product category "${category.name}"?`
    );

    if (!confirmed) return;

    setSaving(true);

    try {
      await api.delete(`/products/categories/${category.id}`);
      await loadCategories();
    } catch (error: any) {
      console.error("Failed to delete category:", error);
      alert(
        error?.response?.data?.message ||
          "Failed to delete product category."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          cancelEdit();
        }

        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Product Categories</DialogTitle>
        </DialogHeader>

        <div className="rounded-lg border overflow-hidden">
          <div className="grid grid-cols-12 gap-3 bg-muted/40 px-4 py-3 text-xs font-medium text-muted-foreground">
            <div className="col-span-4">Category Name</div>
            <div className="col-span-2">Code</div>
            <div className="col-span-2">Products</div>
            <div className="col-span-2">Parts</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {loading ? (
            <div className="px-4 py-6 text-sm text-muted-foreground">
              Loading categories...
            </div>
          ) : sortedCategories.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted-foreground">
              No product categories yet.
            </div>
          ) : (
            <div className="divide-y">
              {sortedCategories.map((category) => {
                const isEditing = editingId === category.id;
                const usedCount =
                  Number(category.products_count || 0) +
                  Number(category.parts_count || 0);

                return (
                  <div
                    key={category.id}
                    className="grid grid-cols-12 gap-3 items-center px-4 py-3 text-sm"
                  >
                    <div className="col-span-4">
                      {isEditing ? (
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Category name"
                        />
                      ) : (
                        <span className="font-medium">{category.name}</span>
                      )}
                    </div>

                    <div className="col-span-2">
                      {isEditing ? (
                        <Input
                          value={editCode}
                          onChange={(e) =>
                            setEditCode(e.target.value.toUpperCase())
                          }
                          placeholder="Code"
                        />
                      ) : (
                        <span className="text-muted-foreground">
                          {category.code || "-"}
                        </span>
                      )}
                    </div>

                    <div className="col-span-2 text-muted-foreground">
                      {category.products_count || 0}
                    </div>

                    <div className="col-span-2 text-muted-foreground">
                      {category.parts_count || 0}
                    </div>

                    <div className="col-span-2 flex justify-end gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => saveEdit(category.id)}
                            disabled={saving}
                          >
                            Save
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                            disabled={saving}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => startEdit(category)}
                            disabled={saving}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteCategory(category)}
                            disabled={saving || usedCount > 0}
                            title={
                              usedCount > 0
                                ? "Category is used and cannot be deleted"
                                : "Delete category"
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
