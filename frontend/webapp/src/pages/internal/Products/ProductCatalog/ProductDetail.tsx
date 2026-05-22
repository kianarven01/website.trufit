import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductModal from "@/components/popupModal/ProductCatalog/addProduct";
import { Trash2, Pencil, Printer } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import api from "@/api/axios";

interface ProductPrice {
  id?: string;
  product_supplier_id?: string;
  Price?: number | string | null;
  price?: number | string | null;
  Markup?: number | string | null;
  markup?: number | string | null;
  is_active?: boolean;
}

interface ProductSupplier {
  id?: string;
  supplier_id: string | number;
  supplier_cost?: number | string | null;
  is_preferred?: boolean;

  active_price?: ProductPrice | null;
  activePrice?: ProductPrice | null;
  price?: ProductPrice | number | string | null;
  prices?: ProductPrice[];

  supplier?: {
    id?: string | number;
    CompanyName?: string;
    name?: string;
    supplier_code?: string;
  };

  Supplier?: {
    id?: string | number;
    CompanyName?: string;
    name?: string;
    supplier_code?: string;
  };

  supplier_name?: string;
  CompanyName?: string;
}

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
  price: number | null;
  category: string;
  manufacturer: string;
  location?: string;
  barcode?: string;
  categoryId?: string | number | null;
  suppliers?: ProductSupplier[];
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

const fromSlug = (slug?: string) =>
  slug
    ?.split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ") || "";

const normalizeSuppliers = (row: any): ProductSupplier[] => {
  if (Array.isArray(row.suppliers)) return row.suppliers;
  if (Array.isArray(row.product_suppliers)) return row.product_suppliers;
  if (Array.isArray(row.productSuppliers)) return row.productSuppliers;
  if (Array.isArray(row.ProductSuppliers)) return row.ProductSuppliers;

  return [];
};

const getSupplierRowId = (supplier: ProductSupplier) =>
  String(supplier.id || supplier.supplier_id);

const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const formatPeso = (value: number | null) => {
  if (value === null) return "No price set";
  return `₱${value.toFixed(2)}`;
};

const getSupplierName = (supplier: ProductSupplier) => {
  return (
    supplier.supplier?.CompanyName ||
    supplier.supplier?.name ||
    supplier.Supplier?.CompanyName ||
    supplier.Supplier?.name ||
    supplier.supplier_name ||
    supplier.CompanyName ||
    `Supplier #${supplier.supplier_id}`
  );
};

const getActivePrice = (supplier?: ProductSupplier | null): ProductPrice | null => {
  if (!supplier) return null;

  if (supplier.active_price) return supplier.active_price;
  if (supplier.activePrice) return supplier.activePrice;

  if (Array.isArray(supplier.prices)) {
    return (
      supplier.prices.find((price) => price.is_active) ||
      supplier.prices[0] ||
      null
    );
  }

  if (supplier.price && typeof supplier.price === "object") {
    return supplier.price as ProductPrice;
  }

  return null;
};

const getSupplierSellingPrice = (
  supplier?: ProductSupplier | null
): number | null => {
  if (!supplier) return null;

  const activePrice = getActivePrice(supplier);

  if (activePrice) {
    return toNumberOrNull(activePrice.Price ?? activePrice.price);
  }

  if (
    supplier.price !== null &&
    supplier.price !== undefined &&
    typeof supplier.price !== "object"
  ) {
    return toNumberOrNull(supplier.price);
  }

  return null;
};

const getSupplierMarkup = (supplier?: ProductSupplier | null): number | null => {
  if (!supplier) return null;

  const activePrice = getActivePrice(supplier);
  return activePrice
    ? toNumberOrNull(activePrice.Markup ?? activePrice.markup)
    : null;
};

const normalizeProduct = (row: any): Product => ({
  id: String(row.id),
  name: String(row.name || ""),
  sku: String(row.SKU || row.sku || ""),
  image: row.image || row.image_URL || row.image_path || undefined,
  partNumber: String(row.part_number || row.partNumber || ""),
  isOEM: Boolean(row.is_oem || row.isOEM || false),
  oemRef: row.oem_reference_number || row.oemRef || null,
  description: row.description || "-",
  unit: row.unit?.name || row.Unit?.name || row.unit_name || row.unit || "-",
  price: toNumberOrNull(row.selling_price ?? row.price ?? row.sell_price),
  category: row.category?.name || row.Category?.name || row.category_name || "-",
  manufacturer:
    row.manufacturer?.name ||
    row.Manufacturer?.name ||
    row.manufacturer_name ||
    row.brand?.name ||
    row.Brand?.name ||
    row.brand_name ||
    "-",
  location: row.location || row.warehouse_location || "-",
  barcode: row.barcode || "",
  categoryId: row.category_id ?? row.categoryId ?? null,
  suppliers: normalizeSuppliers(row),
  compatibleVehicles: Array.isArray(row.compatibleVehicles)
    ? row.compatibleVehicles
    : [],
  crossReferences: Array.isArray(row.crossReferences) ? row.crossReferences : [],
});

const ProductDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { vehicleSlug, variantSlug, categorySlug, productId } = useParams<{
    vehicleSlug: string;
    variantSlug: string;
    categorySlug: string;
    productId: string;
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

  const [product, setProduct] = useState<Product | null>(
    routeState?.product || null
  );
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [manufacturers, setManufacturers] = useState<SupplierOption[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [loading, setLoading] = useState(!routeState?.product);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");

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

  const loadManufacturers = async () => {
    try {
      const res = await api.get("/products/manufacturers");
      const rows = Array.isArray(res.data?.data) ? res.data.data : res.data;

      setManufacturers(
        (Array.isArray(rows) ? rows : []).map((row: any) => ({
          id: String(row.id),
          name: String(row.name || ""),
          supplier_code: "",
        }))
      );
    } catch (error) {
      console.error("Failed to load manufacturers:", error);
      setManufacturers([]);
    }
  };

  const loadSuppliers = async () => {
    try {
      const res = await api.get("/products/suppliers");
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
      const selectedProductId = routeState?.productId || productId;

      if (selectedProductId) {
        try {
          const byIdRes = await api.get(`/products/${selectedProductId}`);
          const row = byIdRes.data?.data ?? byIdRes.data;

          if (row) {
            setProduct(normalizeProduct(row));
            return;
          }
        } catch (error) {
          console.warn(
            `GET /products/${selectedProductId} failed, falling back to list fetch`,
            error
          );
        }
      }

      const listRes = await api.get("/products", {
        params: {
          vehicle_model_id: routeState?.vehicleId || undefined,
          variant_id: routeState?.variantId || undefined,
          category_id: routeState?.categoryId || undefined,
        },
      });

      const rows = Array.isArray(listRes.data?.data)
        ? listRes.data.data
        : listRes.data;
      const normalized = (Array.isArray(rows) ? rows : []).map(normalizeProduct);

      const found =
        normalized.find((item) => item.id === selectedProductId) || null;

      setProduct(found);
    } catch (error) {
      console.error("Failed to load product detail:", error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.all([loadCategories(), loadManufacturers(), loadSuppliers()]);
    void loadProduct();
  }, [routeState?.productId, productId]);

  useEffect(() => {
    if (!product?.suppliers?.length) {
      setSelectedSupplierId("");
      return;
    }

    const preferredSupplier =
      product.suppliers.find((supplier) => supplier.is_preferred) ||
      product.suppliers[0];

    setSelectedSupplierId(getSupplierRowId(preferredSupplier));
  }, [product]);

  const makeModel = vehicleSlug ? fromSlug(vehicleSlug) : "All Vehicles";
  const variantName = variantSlug ? fromSlug(variantSlug) : "All Variants";
  const categoryName = categorySlug ? fromSlug(categorySlug) : "All Categories";

  const backToProductsPath = useMemo(
    () =>
      vehicleSlug
        ? `/webapp/products/product-catalog/${vehicleSlug}/${variantSlug}/${categorySlug}/products`
        : `/webapp/products/product-catalog/products`,
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

  const selectedSupplier = product.suppliers?.find(
    (supplier) => getSupplierRowId(supplier) === selectedSupplierId
  );

  const selectedSupplierCost = toNumberOrNull(selectedSupplier?.supplier_cost);
  const selectedMarkup = getSupplierMarkup(selectedSupplier);
  const selectedSellingPrice = getSupplierSellingPrice(selectedSupplier);

  return (
    <div className="min-h-screen px-6 py-4 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <div className="lg:col-span-2">
          <Card className="p-6 space-y-6 min-h-[620px] h-full">
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
                <span className="font-medium text-foreground">SKU:</span>{" "}
                {product.sku || "-"}
              </div>
              <div>
                <span className="font-medium text-foreground">Part No:</span>{" "}
                {product.partNumber || "-"}
              </div>
              <div>
                <span className="font-medium text-foreground">Brand:</span>{" "}
                {product.manufacturer || "-"}
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
                <span className="font-medium text-foreground">Category:</span>{" "}
                {product.category || "-"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-stretch">
              <div className="md:col-span-2 flex flex-col h-full gap-4">
                <div className="bg-muted rounded-xl flex-1 min-h-[300px] flex items-center justify-center overflow-hidden">
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

              <Card className="md:col-span-3 p-4 h-full min-h-[440px] flex flex-col">
                <CardContent className="p-0 flex flex-col h-full space-y-4">
                  <h2 className="font-semibold">Product Details</h2>

                  <div className="grid grid-cols-2 gap-y-3 text-sm flex-1">
                    <span className="text-muted-foreground">
                      Selected Supplier
                    </span>
                    <span className="font-medium">
                      {selectedSupplier
                        ? getSupplierName(selectedSupplier)
                        : "No supplier selected"}
                    </span>

                    <Separator className="col-span-2" />

                    <span className="text-muted-foreground">Supplier Cost</span>
                    <span>
                      {selectedSupplierCost !== null
                        ? `₱${selectedSupplierCost.toFixed(2)}`
                        : "-"}
                    </span>

                    <Separator className="col-span-2" />

                    <span className="text-muted-foreground">Markup</span>
                    <span>
                      {selectedMarkup !== null
                        ? `${selectedMarkup.toFixed(2)}%`
                        : "-"}
                    </span>

                    <Separator className="col-span-2" />

                    <span className="text-muted-foreground">Selling Price</span>
                    <span className="font-semibold">
                      {formatPeso(selectedSellingPrice)}
                    </span>

                    <Separator className="col-span-2" />

                    <span className="text-muted-foreground">Stock Unit</span>
                    <span>{product.unit}</span>

                    <Separator className="col-span-2" />

                    <span className="text-muted-foreground">
                      Warehouse Location
                    </span>
                    <span>{product.location || "-"}</span>

                    <Separator className="col-span-2" />

                    <div className="col-span-2 flex flex-col gap-1 mt-auto">
                      <span className="text-muted-foreground">Description</span>
                      <textarea
                        className="w-full border rounded p-2 text-sm h-32 resize-none overflow-auto"
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

        <div className="flex flex-col gap-4 min-h-[620px] h-full">
          <Card className="p-4 flex-1 min-h-0">
            <CardContent className="p-0 space-y-4 h-full flex flex-col">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">Suppliers</h2>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditOpen(true)}
                >
                  + Add Supplier
                </Button>
              </div>

              <div className="flex-1 min-h-0 overflow-auto">
                {product.suppliers && product.suppliers.length > 0 ? (
                  <div className="space-y-2">
                    {product.suppliers.map((supplier) => {
                      const supplierRowId = getSupplierRowId(supplier);
                      const isSelected = supplierRowId === selectedSupplierId;
                      const supplierCost = toNumberOrNull(supplier.supplier_cost);
                      const sellingPrice = getSupplierSellingPrice(supplier);

                      return (
                        <button
                          type="button"
                          key={supplierRowId}
                          onClick={() => setSelectedSupplierId(supplierRowId)}
                          className={`w-full rounded-lg border p-3 text-left transition ${
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-border hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium">
                                {getSupplierName(supplier)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Cost:{" "}
                                {supplierCost !== null
                                  ? `₱${supplierCost.toFixed(2)}`
                                  : "-"}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">
                                Selling Price
                              </p>
                              <p className="text-sm font-semibold">
                                {formatPeso(sellingPrice)}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-xs italic">
                    No suppliers added yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="p-4 flex-1 min-h-0">
            <CardContent className="p-0 space-y-4 h-full flex flex-col">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">Compatible Vehicles</h2>
                <Button size="sm" variant="outline">
                  + Add Vehicle
                </Button>
              </div>

              <div className="text-sm space-y-2 flex-1 min-h-0 overflow-auto">
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

          <Card className="p-4 flex-1 min-h-0">
            <CardContent className="p-0 space-y-4 h-full flex flex-col">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">Cross References</h2>
                <Button size="sm" variant="outline">
                  + Add Reference
                </Button>
              </div>

              <div className="space-y-2 text-sm flex-1 min-h-0 overflow-auto">
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
        categories={categories}
        manufacturers={manufacturers}
        suppliers={suppliers}
        variantId={routeState?.variantId || null}
        categoryId={
          routeState?.categoryId ||
          (product.categoryId ? String(product.categoryId) : null)
        }
        onSaved={async () => {
          await loadProduct();
        }}
      />
    </div>
  );
};

export default ProductDetail;
