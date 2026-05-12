import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scrollArea";
import { ImagePlus, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onsaved?: (data: any) => void; // ✅ optional callback when product is saved
}

const ProductModal: React.FC<ProductModalProps> = ({ open, onOpenChange, onsaved }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isOEM, setIsOEM] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Form states
  const [form, setForm] = useState<any>({});

  // Pricing states
  const [costPrice, setCostPrice] = useState<number>(0);
  const [markup, setMarkup] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);

  const [costInput, setCostInput] = useState<string>("");
  const [markupInput, setMarkupInput] = useState<string>("");

  // Auto compute selling price
  useEffect(() => {
    const calculated = costPrice + (costPrice * markup) / 100;
    setSellingPrice(Number.isNaN(calculated) ? 0 : Number(calculated.toFixed(2)));
  }, [costPrice, markup]);

  const formatNumber = (num: number) =>
    num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setForm((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    setCostInput(raw);

    const num = parseFloat(raw);
    setCostPrice(Number.isNaN(num) ? 0 : num);
  };

  const handleCostBlur = () => {
    if (costInput === "") return;
    setCostInput(formatNumber(costPrice));
  };

  const handleMarkupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    setMarkupInput(raw);

    const num = parseFloat(raw);
    setMarkup(Number.isNaN(num) ? 0 : num);
  };

  const handleMarkupBlur = () => {
    if (markupInput === "") return;
    setMarkupInput(markup.toFixed(2));
  };

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Max 2MB only");
      return;
    }

    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // SAVE FUNCTION
  const handleSave = () => {
    const product = {
      id: `prod-${Date.now()}`, // unique id
      ...form,
      image: imagePreview,
      isOEM,
      costPrice,
      markup,
      price: sellingPrice, // renamed for table display
      createdAt: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem("products") || "[]");
    existing.push(product);
    localStorage.setItem("products", JSON.stringify(existing));

    if (onsaved) onsaved(product); // notify parent to update state

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-4xl p-4">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            <div
              className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 h-52 cursor-pointer transition
                ${isDragging ? "border-primary bg-primary/10" : "bg-muted/50 hover:border-primary hover:bg-primary/5"}`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setIsDragging(false);
                }
              }}
            >
              <div className="w-45 h-40 flex items-center justify-center pointer-events-none">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <div className="flex flex-col items-center text-sm text-muted-foreground">
                    <ImagePlus className="mb-2 h-6 w-6" />
                    <span>Click or drag image here</span>
                  </div>
                )}
              </div>

              {imagePreview && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 pointer-events-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImagePreview(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageChange}
                accept="image/*"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" placeholder="Enter product name" onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input id="sku" placeholder="Stock Keeping Unit" onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label>Part No.</Label>
                <Input id="partNumber" placeholder="Manufacturer Part #" onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label>Part</Label>
                <Input id="part" placeholder="Select Part" onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Input id="category" placeholder="Select Category" onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label>Barcode</Label>
                <Input id="barcode" placeholder="EAN/UPC" onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label>Unit</Label>
                <Input id="unit" placeholder="pcs, kg, etc." onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label>Manufacturer</Label>
                <Input id="manufacturer" onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label>Warehouse Location</Label>
                <Input id="location" placeholder="e.g. Aisle 3 - Rack B" onChange={handleChange} />
              </div>
            </div>

            <div className="flex flex-col space-y-4 p-4 border rounded-lg bg-slate-50/50">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="oem"
                  checked={isOEM}
                  onCheckedChange={(checked) => setIsOEM(checked as boolean)}
                />
                <Label htmlFor="oem">OEM Product</Label>
              </div>

              {isOEM && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                  <Label>OEM Reference Number</Label>
                  <Input id="oemRef" placeholder="Enter original reference" onChange={handleChange} />
                </div>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Cost Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₱</span>
                  <Input
                    type="text"
                    value={costInput}
                    onChange={handleCostChange}
                    onBlur={handleCostBlur}
                    className="pl-7"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Markup (%)</Label>
                <Input
                  type="text"
                  value={markupInput}
                  onChange={handleMarkupChange}
                  onBlur={handleMarkupBlur}
                />
              </div>

              <div className="space-y-2">
                <Label>Selling Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₱</span>
                  <Input
                    type="text"
                    value={formatNumber(sellingPrice)}
                    readOnly
                    className="pl-7 bg-muted cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Supplier</Label>
              <Input id="supplier" placeholder="Search suppliers..." onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                id="description"
                placeholder="Detailed product specifications..."
                className="min-h-[100px]"
                onChange={handleChange}
              />
            </div>

          </div>
        </ScrollArea>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save Product</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;