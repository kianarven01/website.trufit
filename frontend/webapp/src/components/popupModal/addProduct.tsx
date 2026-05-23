import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scrollArea";
import { X, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/axios";

interface CategoryOption {
  id: number;
  name: string;
  code: string;
}

interface UnitOption {
  id: string;
  name: string;
}

interface SupplierOption {
  id: string;
  CompanyName: string;
  supplier_code: string;
}

interface ProductModalItem {
  id: string;
  image: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  cost: number;
  partNumber: string;
  barcode: string;
  supplierName: string;
  unit: string;
  categoryId?: number | null;
  supplierCode: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductModalItem | null;
  categories: CategoryOption[];
  units: UnitOption[];
  suppliers: SupplierOption[];
  onSaved: () => void | Promise<void>;
}

export function ProductModal({
  open,
  onOpenChange,
  product,
  categories,
  units,
  suppliers,
  onSaved,
}: Props) {
  const isEdit = !!product;

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [unitId, setUnitId] = useState("");
  const [description, setDescription] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [cost, setCost] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    if (product) {
      setName(product.name ?? "");
      setCategoryId(product.categoryId != null ? String(product.categoryId) : "");
      setSku(product.sku ?? "");
      setBarcode(product.barcode ?? "");
      setPartNumber(product.partNumber ?? "");
      setUnitId(product.unit ?? "");
      setDescription(product.description ?? "");
      setSupplierId(product.supplierCode ?? "");
      setCost(product.cost != null ? String(product.cost) : "");
      setImageUrl(product.image ?? "");
    } else {
      setName("");
      setCategoryId("");
      setSku("");
      setBarcode("");
      setPartNumber("");
      setUnitId("");
      setDescription("");
      setSupplierId("");
      setCost("");
      setImageUrl("");
    }
  }, [open, product]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Product name is required.");
      return;
    }

    if (!partNumber.trim()) {
      toast.error("Part number is required.");
      return;
    }

    if (!unitId) {
      toast.error("Unit of measure is required.");
      return;
    }

    if (!supplierId) {
      toast.error("Supplier is required.");
      return;
    }

    if (!cost || Number.isNaN(Number(cost))) {
      toast.error("Valid cost is required.");
      return;
    }

    const payload = {
      name: name.trim(),
      SKU: sku.trim() || null,
      cost: Number(cost),
      description: description.trim() || null,
      image_URL: imageUrl.trim() || null,
      category_id: categoryId ? Number(categoryId) : null,
      unit: unitId,
      barcode: barcode.trim() || null,
      part_number: partNumber.trim(),
      supplier_code: supplierId,
    };

    setIsSaving(true);

    try {
      if (isEdit && product?.id) {
        await api.put(`/products/${product.id}`, payload);
        toast.success("Product updated successfully.");
      } else {
        await api.post("/products", payload);
        toast.success("Product added successfully.");
      }

      await onSaved();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Failed to save product:", err?.response?.data || err);
      toast.error(err?.response?.data?.message || "Failed to save product.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>{isEdit ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[68vh]">
          <div className="px-6 pb-4 space-y-4">
            <div>
              <Label className="text-xs">Product Image</Label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />

              {imageUrl ? (
                <div className="relative w-full h-32 rounded-md border border-border overflow-hidden bg-muted">
                  <img
                    src={imageUrl}
                    alt="Product"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 rounded-md border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center gap-1.5 hover:border-primary/50 hover:bg-muted transition-colors"
                >
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Click to upload image
                  </span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs">Product Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <Label className="text-xs">Category</Label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs">SKU</Label>
                <Input
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="SKU"
                />
              </div>

              <div>
                <Label className="text-xs">Barcode</Label>
                <Input
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Barcode"
                />
              </div>

              <div>
                <Label className="text-xs">Part Number *</Label>
                <Input
                  value={partNumber}
                  onChange={(e) => setPartNumber(e.target.value)}
                  placeholder="Part number"
                />
              </div>

              <div>
                <Label className="text-xs">Unit *</Label>
                <select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select unit</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs">Supplier *</Label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.CompanyName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs">Cost (₱) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Image URL</Label>
              <Input
                value={imageUrl.startsWith("data:") ? "" : imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <Label className="text-xs">Description</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product description..."
                className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 pb-6 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : isEdit ? "Update" : "Add Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}