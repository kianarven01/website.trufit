import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Badge } from "@/components/ui/badge";
import { X, ImagePlus } from "lucide-react";

/* ---------------- LOCAL TYPES ---------------- */

type ProductStatus = "in-stock" | "low-stock" | "out-of-stock";

interface Product {
  id: string;
  image: string;
  name: string;
  category: string;
  sku: string;
  barcode: string;
  partNumber: string;
  unit: string;
  description: string;
  suppliers: string[];
  cost: number;

}

/* ---------------- MOCK STORE ---------------- */

let PRODUCTS: Product[] = [];

const genProductId = () => `PRD-${Date.now()}`;

const addProduct = (p: Product) => {
  PRODUCTS.push(p);
};

const updateProduct = (id: string, data: Product) => {
  PRODUCTS = PRODUCTS.map(p => (p.id === id ? data : p));
};

/* ---------------- SIMPLE TOAST ---------------- */

const toast = {
  success: (msg: string) => console.log("SUCCESS:", msg),
  error: (msg: string) => console.error("ERROR:", msg),
};

/* ---------------- COMPONENT ---------------- */

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSaved?: () => void;
}

const SUPPLIER_OPTIONS = ["AutoParts Inc.", "BrakeWorld PH", "Oil Masters", "TirePro Corp.", "FilterKing"];
const CATEGORY_OPTIONS = ["Lubricants", "Brakes", "Filters", "Ignition", "Tires", "Accessories", "Suspension", "Electrical"];

export function ProductModal({ open, onOpenChange, product, onSaved }: Props) {
  const isEdit = !!product;

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [unit, setUnit] = useState("");
  const [description, setDescription] = useState("");
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [cost, setCost] = useState(0);
  const [stock, setStock] = useState(0);
  const [reorderPt, setReorderPt] = useState(10);
  const [image, setImage] = useState("");
  const [supplierInput, setSupplierInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && product) {
      setName(product.name);
      setCategory(product.category);
      setSku(product.sku);
      setBarcode(product.barcode);
      setPartNumber(product.partNumber);
      setUnit(product.unit);
      setDescription(product.description);
      setSuppliers([...product.suppliers]);
      setCost(product.cost);
      setImage(product.image);
    } else if (open) {
      setName("");
      setCategory("");
      setSku("");
      setBarcode("");
      setPartNumber("");
      setUnit("Piece");
      setDescription("");
      setSuppliers([]);
      setCost(0);
      setStock(0);
      setReorderPt(10);
      setImage("");
      setSupplierInput("");
    }
  }, [open, product]);

  const addSupplier = (s: string) => {
    const trimmed = s.trim();
    if (trimmed && !suppliers.includes(trimmed)) {
      setSuppliers(prev => [...prev, trimmed]);
    }
    setSupplierInput("");
  };

  const removeSupplier = (s: string) =>
    setSuppliers(prev => prev.filter(x => x !== s));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => setImage(reader.result as string);

    reader.readAsDataURL(file);
  };

  const getStatus = (stk: number, rp: number): ProductStatus => {
    if (stk <= 0) return "out-of-stock";
    if (stk <= rp) return "low-stock";
    return "in-stock";
  };

  const handleSave = () => {
    if (!name.trim() || !sku.trim()) {
      toast.error("Product name and SKU are required");
      return;
    }

    const data: Product = {
      id: product?.id || genProductId(),
      image,
      name: name.trim(),
      category,
      sku: sku.trim(),
      barcode,
      partNumber,
      unit,
      description,
      suppliers,
      cost,
    };

    if (isEdit) {
      updateProduct(data.id, data);
      toast.success("Product updated");
    } else {
      addProduct(data);
      toast.success("Product added");
    }

    onSaved?.();
    onOpenChange(false);
  };

  const filteredSuggestions = SUPPLIER_OPTIONS.filter(s =>
    !suppliers.includes(s) &&
    s.toLowerCase().includes(supplierInput.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0">

        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>{isEdit ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[68vh]">

          <div className="px-6 pb-4 space-y-4">

            {/* Image Upload */}

            <div>

              <Label className="text-xs">Product Image</Label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />

              {image ? (
                <div className="relative w-full h-32 rounded-md border border-border overflow-hidden bg-muted">
                  <img
                    src={image}
                    alt="Product"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImage("");
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
                  onChange={e => setName(e.target.value)}
                  placeholder="Engine Oil 5W-30"
                />
              </div>

              <div>
                <Label className="text-xs">Category</Label>
                <Input
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="Lubricants"
                  list="cat-list"
                />
                <datalist id="cat-list">
                  {CATEGORY_OPTIONS.map(c => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <Label className="text-xs">SKU *</Label>
                <Input
                  value={sku}
                  onChange={e => setSku(e.target.value)}
                  placeholder="LUB-001"
                />
              </div>

              <div>
                <Label className="text-xs">Barcode</Label>
                <Input
                  value={barcode}
                  onChange={e => setBarcode(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-xs">Part Number</Label>
                <Input
                  value={partNumber}
                  onChange={e => setPartNumber(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-xs">Unit</Label>
                <Input
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  placeholder="Piece"
                />
              </div>

              <div>
                <Label className="text-xs">Cost (₱)</Label>
                <Input
                  type="number"
                  value={cost || ""}
                  onChange={e => setCost(Number(e.target.value))}
                />
              </div>

              <div>
                <Label className="text-xs">Reorder Point</Label>
                <Input
                  type="number"
                  value={reorderPt || ""}
                  onChange={e => setReorderPt(Number(e.target.value))}
                />
              </div>

            </div>

            <div>
              <Label className="text-xs">Description</Label>
              <Input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Product description..."
              />
            </div>

            {/* Suppliers */}

            <div>

              <Label className="text-xs">Suppliers</Label>

              <div className="flex flex-wrap gap-1.5 mb-2">

                {suppliers.map(s => (

                  <Badge key={s} variant="secondary" className="gap-1 pr-1">

                    {s}

                    <button
                      onClick={() => removeSupplier(s)}
                      className="ml-0.5 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>

                  </Badge>

                ))}

              </div>

              <div className="relative">

                <Input
                  value={supplierInput}
                  onChange={e => setSupplierInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSupplier(supplierInput);
                    }
                  }}
                  placeholder="Type supplier name & press Enter"
                />

                {supplierInput && filteredSuggestions.length > 0 && (

                  <div className="absolute z-10 top-full left-0 right-0 bg-popover border border-border rounded-md mt-1 shadow-md max-h-32 overflow-auto">

                    {filteredSuggestions.map(s => (

                      <button
                        key={s}
                        onClick={() => addSupplier(s)}
                        className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                      >
                        {s}
                      </button>

                    ))}

                  </div>

                )}

              </div>

            </div>

          </div>

        </ScrollArea>

        <DialogFooter className="px-6 pb-6 pt-2">

          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button onClick={handleSave}>
            {isEdit ? "Update" : "Add Product"}
          </Button>

        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}