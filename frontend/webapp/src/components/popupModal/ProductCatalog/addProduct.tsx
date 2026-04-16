import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Combobox from "@/components/ui/combobox";
import api from "@/api/axios";

export interface ProductModalCategory {
  id: string;
  name: string;
  code?: string;
}

export interface ProductModalSupplier {
  id: string;
  name: string;
  supplier_code?: string;
}

export interface ProductModalProduct {
  id?: string;
  image?: string;
  name: string;
  sku: string;
  category?: string;
  description?: string;
  cost?: number;
  price?: number;
  partNumber: string;
  barcode?: string;
  supplierName?: string;
  unit?: string;
  categoryId?: string | number | null;
  supplierCode?: string;
}

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductModalProduct | null;
  categories: ProductModalCategory[];
  suppliers: ProductModalSupplier[];
  onSaved: () => Promise<void> | void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  open,
  onOpenChange,
  product,
  categories,
  suppliers,
  onSaved,
}) => {
  const [image, setImage] = useState("");
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [barcode, setBarcode] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [unit, setUnit] = useState("");
  const [cost, setCost] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedCategory = useMemo(() => {
    if (!categories.length) return null;

    if (product?.categoryId != null) {
      const byId = categories.find(
        (category) => String(category.id) === String(product.categoryId)
      );
      if (byId) return byId;
    }

    if (product?.category) {
      const byName = categories.find((category) => category.name === product.category);
      if (byName) return byName;
    }

    return null;
  }, [categories, product]);

  const selectedSupplier = useMemo(() => {
    if (!suppliers.length) return null;

    if (product?.supplierCode) {
      const byCode = suppliers.find(
        (supplier) => supplier.supplier_code === product.supplierCode
      );
      if (byCode) return byCode;
    }

    if (product?.supplierName) {
      const byName = suppliers.find((supplier) => supplier.name === product.supplierName);
      if (byName) return byName;
    }

    return null;
  }, [suppliers, product]);

  useEffect(() => {
    if (open) {
      setImage(product?.image || "");
      setName(product?.name || "");
      setSku(product?.sku || "");
      setPartNumber(product?.partNumber || "");
      setBarcode(product?.barcode || "");
      setCategoryName(selectedCategory?.name || "");
      setSupplierName(selectedSupplier?.name || "");
      setUnit(product?.unit || "");
      setCost(product?.cost !== undefined ? String(product.cost) : "");
      setPrice(product?.price !== undefined ? String(product.price) : "");
      setDescription(product?.description || "");
    } else {
      setImage("");
      setName("");
      setSku("");
      setPartNumber("");
      setBarcode("");
      setCategoryName("");
      setSupplierName("");
      setUnit("");
      setCost("");
      setPrice("");
      setDescription("");
    }
  }, [open, product, selectedCategory, selectedSupplier]);

  const handleSave = async () => {
    if (!name.trim() || !partNumber.trim()) return;

    const chosenCategory =
      categories.find((category) => category.name === categoryName) || null;

    const chosenSupplier =
      suppliers.find((supplier) => supplier.name === supplierName) || null;

    const payload = {
      name: name.trim(),
      SKU: sku.trim() || null,
      part_number: partNumber.trim(),
      barcode: barcode.trim() || null,
      description: description.trim() || null,
      cost: cost.trim() ? Number(cost) : 0,
      selling_price: price.trim() ? Number(price) : 0,
      image_URL: image.trim() || null,
      category_id: chosenCategory ? chosenCategory.id : null,
      supplier_id: chosenSupplier ? chosenSupplier.id : null,
      unit: unit.trim() || null,
    };

    try {
      setSaving(true);

      if (product?.id) {
        await api.put(`/products/${product.id}`, payload);
      } else {
        await api.post("/products", payload);
      }

      await onSaved();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save product:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {product ? "Edit Product" : "Add Product"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Product Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">SKU</label>
            <Input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Enter SKU"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Part Number</label>
            <Input
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
              placeholder="Enter part number"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Barcode</label>
            <Input
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Enter barcode"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Unit</label>
            <Input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. pc, set, box"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Combobox
              items={categories.map((category) => category.name)}
              value={categoryName}
              onChange={setCategoryName}
              placeholder="Select category"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Supplier</label>
            <Combobox
              items={suppliers.map((supplier) => supplier.name)}
              value={supplierName}
              onChange={setSupplierName}
              placeholder="Select supplier"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Cost</label>
            <Input
              type="number"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Selling Price</label>
            <Input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Image URL</label>
            <Input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Paste image URL"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full min-h-[120px] rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim() || !partNumber.trim()}>
            {saving ? "Saving..." : product ? "Save Changes" : "Add Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;