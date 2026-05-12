import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductModal from "@/components/popupModal/ProductCatalog/addProduct";

import { Trash2, Pencil, Printer } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Product {
  id: string;
  name: string;
  sku: string;
  image?: string;
  partNumber: string;
  isOEM: boolean;
  oemRef?: string | null;
  description: string;
  unit: string;
  costPrice: number;
  price: number;
  category: string;
  manufacturer: string;
  location?: string;
  barcode?: string;
  supplier?: string;
  compatibleVehicles?: {
    make: string;
    model: string;
    variant: string;
    year: string;
  }[];
  crossReferences?: {
    type: string;
    reference: string;
  }[];
}

const slugify = (str: string) =>
  str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

const fromSlug = (slug?: string) =>
  slug
    ?.split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ") || "";

const ProductDetail: React.FC = () => {
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const {
    vehicleSlug,
    variantSlug,
    categorySlug,
    productNameSlug,
  } = useParams<{
    vehicleSlug: string;
    variantSlug: string;
    categorySlug: string;
    productNameSlug: string;
  }>();

  const [product, setProduct] = useState<Product | null>(null);

  const STORAGE_KEY =
    vehicleSlug && variantSlug && categorySlug
      ? `products_${vehicleSlug}_${variantSlug}_${categorySlug}`
      : "products_temp";

  useEffect(() => {
    const products: Product[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    const found = products.find(
      (p) => slugify(p.name) === productNameSlug
    );

    if (found) {
      setProduct({
        ...found,
        costPrice: found.costPrice ?? 0,
        price: found.price ?? 0,
        unit: found.unit ?? "-",
        supplier: found.supplier ?? "-",
        description: found.description ?? "-",
        compatibleVehicles: found.compatibleVehicles ?? [],
        crossReferences: found.crossReferences ?? [],
      });
    } else {
      setProduct(null);
    }
  }, [STORAGE_KEY, productNameSlug]);

  if (!product) {
    return (
      <div className="px-6 py-4 text-center text-muted-foreground">
        <p>No product found.</p>
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() =>
              navigate(
                `/webapp/products/product-catalog${
                  vehicleSlug ? `/${vehicleSlug}` : ""
                }${variantSlug ? `/${variantSlug}` : ""}${
                  categorySlug ? `/${categorySlug}` : ""
                }`
              )
            }
          >
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-4 space-y-6">
      {/* Toolbar */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold">{product.name}</h1>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700"
                >
                  In Stock
                </Badge>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setIsEditOpen(true)}
              >
                <Pencil size={16} /> Edit Product
              </Button>
            </div>

            {/* SKU Row */}
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div>
                <span className="font-medium text-foreground">SKU:</span>{" "}
                {product.sku}
              </div>
              <div>
                <span className="font-medium text-foreground">
                  Part No:
                </span>{" "}
                {product.partNumber}
              </div>
              <div>
                <span className="font-medium text-foreground">
                  Brand:
                </span>{" "}
                {product.manufacturer}
              </div>
              {product.isOEM && (
                <div>
                  <span className="font-medium text-foreground">
                    OEM Reference:
                  </span>{" "}
                  {product.oemRef || "-"}
                </div>
              )}
              <div>
                <span className="font-medium text-foreground">
                  Category:
                </span>{" "}
                {product.category}
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-stretch">
              {/* Image Section */}
              <div className="md:col-span-2 flex flex-col h-full gap-4">
                <div className="bg-muted rounded-xl flex-1 min-h-[200px] flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-muted-foreground">No Image</span>
                  )}
                </div>

                {/* Barcode */}
                <div className="flex items-center justify-between bg-foreground/5 rounded-xl py-2 px-4">
                  <div className="flex flex-col items-center">
                    <img
                      src="/images/placeholder.png"
                      alt="barcode"
                      className="border w-44 h-12 object-contain"
                    />
                    <span className="text-sm text-muted-foreground tracking-widest">
                      {product.barcode || "N/A"}
                    </span>
                  </div>
                  <Button variant="outline" size="icon">
                    <Printer />
                  </Button>
                </div>
              </div>

              {/* Product Details */}
              <Card className="md:col-span-3 p-4 h-full flex flex-col">
                <CardContent className="p-0 flex flex-col h-full space-y-4">
                  <h2 className="font-semibold">Product Details</h2>

                  <div className="grid grid-cols-2 gap-y-3 text-sm flex-1">
                    <span className="text-muted-foreground">Cost Price</span>
                    <span>₱{product.costPrice?.toFixed(2) ?? "0.00"}</span>

                    <Separator className="col-span-2" />

                    <span className="text-muted-foreground">Selling Price</span>
                    <span>₱{product.price?.toFixed(2) ?? "0.00"}</span>

                    <Separator className="col-span-2" />

                    <span className="text-muted-foreground">Stock Unit</span>
                    <span>{product.unit}</span>

                    <Separator className="col-span-2" />

                    <span className="text-muted-foreground">Supplier</span>
                    <span>{product.supplier}</span>

                    <Separator className="col-span-2" />

                    <span className="text-muted-foreground">
                      Warehouse Location
                    </span>
                    <span>{product.location || "-"}</span>

                    <Separator className="col-span-2" />

                    {/* Description */}
                    <div className="col-span-2 flex flex-col gap-1 mt-auto">
                      <span className="text-muted-foreground">Description</span>
                      <textarea
                        className="w-full border rounded p-2 text-sm h-28 resize-none overflow-auto"
                        value={product.description}
                        readOnly
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Card>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6 flex flex-col">
          {/* Compatible Vehicles Card */}
          <Card className="flex-1 p-4">
            <CardContent className="p-0 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">Compatible Vehicles</h2>
                <Button size="sm" variant="outline">
                  + Add Vehicle
                </Button>
              </div>

              <div className="text-sm space-y-2">
                {product.compatibleVehicles &&
                product.compatibleVehicles.length > 0 ? (
                  product.compatibleVehicles.map((vehicle, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-4 gap-2 text-xs border-b pb-2"
                    >
                      <span>{vehicle.make}</span>
                      <span>{vehicle.model}</span>
                      <span>{vehicle.variant}</span>
                      <span>{vehicle.year}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground text-xs italic">
                    No compatible vehicles added yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cross References Card */}
          <Card className="flex-1 p-4">
            <CardContent className="p-0 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">Cross References</h2>
                <Button size="sm" variant="outline">
                  + Add Reference
                </Button>
              </div>

              <div className="space-y-2 text-sm">
                {product.crossReferences &&
                product.crossReferences.length > 0 ? (
                  product.crossReferences.map((ref, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center border-b pb-2"
                    >
                      <div className="flex gap-6 text-xs">
                        <span className="w-24">{ref.type}</span>
                        <span>{ref.reference}</span>
                      </div>
                      <Trash2 className="w-4 h-4 text-muted-foreground cursor-pointer" />
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground text-xs italic">
                    No cross references added yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ProductModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onsaved={(updatedProduct) => {
          setProduct(updatedProduct);

          const products: Product[] = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
          );

          const updatedProducts = products.map((p) =>
            p.id === updatedProduct.id ? updatedProduct : p
          );

          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
        }}
      />


    </div>
  );
};

export default ProductDetail;