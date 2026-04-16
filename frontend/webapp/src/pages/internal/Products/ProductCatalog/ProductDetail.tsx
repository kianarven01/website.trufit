import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import ProductModal from "@/components/popupModal/ProductCatalog/addProduct";
import { Trash2, Pencil, Printer } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import api from "@/api/axios";

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
  categoryId?: string | number | null;
  supplierCode?: string;
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

interface CategoryOption {
  id: string;
  name: string;
  code?: string;
}

interface SupplierOption {
  id: string;
  name: string;
  supplier_code?: string;
}

const slugify = (str: string) =>
  str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

const fromSlug = (slug?: string) =>
  slug
    ?.split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ") || "";

const normalizeProduct = (row: any): Product => ({
  id: String(row.id),
  name: String(row.name || ""),
  sku: String(row.SKU || row.sku || ""),
  image: row.image || row.image_URL || undefined,
  partNumber: String(row.part_number || row.partNumber || ""),
  isOEM: Boolean(row.is_oem || row.isOEM || false),
  oemRef: row.oem_reference_number || row.oemRef || null,
  description: row.description || "-",
  unit:
    row.unit?.name ||
    row.Unit?.name ||
    row.unit_name ||
    row.unit ||
    "-",
  costPrice: Number(row.cost || row.costPrice || 0),
  price: Number(row.selling_price || row.price || row.sell_price || 0),
  category:
    row.category?.name || row.Category?.name || row.category_name || "-",
  manufacturer:
    row.manufacturer ||
    row.brand?.name ||
    row.Brand?.name ||
    row.brand_name ||
    "-",
  location: row.location || row.warehouse_location || "-",
  barcode: row.barcode || "",
  supplier:
    row.supplier?.CompanyName ||
    row.Supplier?.CompanyName ||
    row.supplier_name ||
    row.supplier ||
    "-",
  categoryId: row.category_id ?? row.categoryId ?? null,
  supplierCode:
    row.supplier_code ||
    row.supplier?.supplier_code ||
    row.Supplier?.supplier_code ||
    "",
  compatibleVehicles: Array.isArray(row.compatibleVehicles)
    ? row.compatibleVehicles
    : [],
  crossReferences: Array.isArray(row.crossReferences)
    ? row.crossReferences
    : [],
});

const ProductDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  const routeState = location.state as
    | {
        productId?: string;
        product?: Product;
        vehicleId?: string;
        variantId?: string;
        categoryId?: string;
      }
    | undefined;

  const [product, setProduct] = useState<Product | null>(routeState?.product || null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [loading, setLoading] = useState(!routeState?.product);

  const loadCategories = async () => {
    const res = await api.get("/products/categories");
    const rows = Array.isArray(res.data?.data) ? res.data.data : res.data;

    setCategories(
      (Array.isArray(rows) ? rows : []).map((row: any) => ({
        id: String(row.id),
        name: String(row.name),
        code: row.code || undefined,
      }))
    );
  };

  const loadSuppliers = async () => {
    try {
      const res = await api.get("/suppliers");
      const rows = Array.isArray(res.data?.data) ? res.data.data : res.data;

      setSuppliers(
        (Array.isArray(rows) ? rows : []).map((row: any) => ({
          id: String(row.id),
          name: String(row.CompanyName || row.name || ""),
          supplier_code: row.supplier_code || "",
        }))
      );
    } catch (error) {
      console.error("Failed to load suppliers:", error);
      setSuppliers([]);
    }
  };

  const loadProduct = async () => {
    setLoading(true);

    try {
      if (routeState?.productId) {
        try {
          const byIdRes = await api.get(`/products/${routeState.productId}`);
          const row = byIdRes.data?.data ?? byIdRes.data;

          if (row) {
            setProduct(normalizeProduct(row));
            return;
          }
        } catch (error) {
          console.warn("GET /products/:id failed, falling back to list fetch", error);
        }
      }

      const listRes = await api.get("/products", {
        params: {
          vehicle_model_id: routeState?.vehicleId || undefined,
          variant_id: routeState?.variantId || undefined,
          category_id: routeState?.categoryId || undefined,
        },
      });

      const rows = Array.isArray(listRes.data?.data) ? listRes.data.data : listRes.data;
      const normalized = (Array.isArray(rows) ? rows : []).map(normalizeProduct);

      const found =
        normalized.find((item) => item.id === routeState?.productId) ||
        normalized.find((item) => slugify(item.name) === productNameSlug) ||
        null;

      setProduct(found);
    } catch (error) {
      console.error("Failed to load product detail:", error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.all([loadCategories(), loadSuppliers()]);
    void loadProduct();
  }, [routeState?.productId, productNameSlug]);

  const makeModel = vehicleSlug ? fromSlug(vehicleSlug) : "";
  const variantName = variantSlug ? fromSlug(variantSlug) : "Variant";
  const categoryName = categorySlug ? fromSlug(categorySlug) : "Category";

  const backToProductsPath = useMemo(
    () =>
      `/webapp/products/product-catalog/${vehicleSlug}/${variantSlug}/${categorySlug}/products`,
    [vehicleSlug, variantSlug, categorySlug]
  );

  if (loading) {
    return (
      <div className="px-6 py-4 text-center text-muted-foreground">
        <p>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="px-6 py-4 text-center text-muted-foreground">
        <p>No product found.</p>
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate(backToProductsPath)}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-4 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate("/webapp/products/product-catalog")}>
              Product Catalog
            </BreadcrumbLink>
          </BreadcrumbItem>

          {vehicleSlug && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() =>
                    navigate(`/webapp/products/product-catalog/${vehicleSlug}`, {
                      state: {
                        vehicleId: routeState?.vehicleId,
                        variantId: routeState?.variantId,
                        categoryId: routeState?.categoryId,
                      },
                    })
                  }
                >
                  {makeModel}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}

          {variantSlug && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() =>
                    navigate(`/webapp/products/product-catalog/${vehicleSlug}`, {
                      state: {
                        vehicleId: routeState?.vehicleId,
                        variantId: routeState?.variantId,
                        categoryId: routeState?.categoryId,
                      },
                    })
                  }
                >
                  {variantName}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}

          {categorySlug && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() =>
                    navigate(`/webapp/products/product-catalog/${vehicleSlug}`, {
                      state: {
                        vehicleId: routeState?.vehicleId,
                        variantId: routeState?.variantId,
                        categoryId: routeState?.categoryId,
                      },
                    })
                  }
                >
                  {categoryName}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}

          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate(backToProductsPath)}>
              Products
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold">{product.name}</h1>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
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

            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div>
                <span className="font-medium text-foreground">SKU:</span> {product.sku || "-"}
              </div>
              <div>
                <span className="font-medium text-foreground">Part No:</span> {product.partNumber || "-"}
              </div>
              <div>
                <span className="font-medium text-foreground">Brand:</span> {product.manufacturer || "-"}
              </div>
              {product.isOEM && (
                <div>
                  <span className="font-medium text-foreground">OEM Reference:</span> {product.oemRef || "-"}
                </div>
              )}
              <div>
                <span className="font-medium text-foreground">Category:</span> {product.category || "-"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-stretch">
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

                    <span className="text-muted-foreground">Warehouse Location</span>
                    <span>{product.location || "-"}</span>

                    <Separator className="col-span-2" />

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

        <div className="space-y-6 flex flex-col">
          <Card className="flex-1 p-4">
            <CardContent className="p-0 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">Compatible Vehicles</h2>
                <Button size="sm" variant="outline">
                  + Add Vehicle
                </Button>
              </div>

              <div className="text-sm space-y-2">
                {product.compatibleVehicles && product.compatibleVehicles.length > 0 ? (
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

          <Card className="flex-1 p-4">
            <CardContent className="p-0 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">Cross References</h2>
                <Button size="sm" variant="outline">
                  + Add Reference
                </Button>
              </div>

              <div className="space-y-2 text-sm">
                {product.crossReferences && product.crossReferences.length > 0 ? (
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
        product={{
          id: product.id,
          image: product.image || "",
          name: product.name,
          sku: product.sku,
          category: product.category,
          description: product.description,
          cost: product.costPrice,
          price: product.price,
          partNumber: product.partNumber,
          barcode: product.barcode || "",
          supplierName: product.supplier || "",
          unit: product.unit,
          categoryId: product.categoryId ?? null,
          supplierCode: product.supplierCode || "",
        }}
        categories={categories}
        suppliers={suppliers}
        onSaved={async () => {
          await loadProduct();
        }}
      />
    </div>
  );
};

export default ProductDetail;