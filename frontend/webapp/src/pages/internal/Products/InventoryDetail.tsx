import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ImageIcon,
  Package,
  Warehouse,
  AlertTriangle,
  ShoppingCart,
} from "lucide-react";
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
  supplier_id?: string | number;
  supplier_cost?: number | string | null;
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

interface InventoryDetailItem {
  id: string;
  image?: string;
  name: string;
  brand: string;
  sku: string;
  partNumber: string;
  partName: string;
  category: string;
  unitName: string;
  unitAbbreviation?: string | null;
  quantityOnHand: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderLevel: number | null;
  reorderQty: number | null;
  locationId?: string | null;
  description: string;
  suppliers: ProductSupplier[];
}

const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
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
    `Supplier #${supplier.supplier_id || "-"}`
  );
};

const getActivePrice = (supplier?: ProductSupplier | null): ProductPrice | null => {
  if (!supplier) return null;

  if (supplier.active_price) return supplier.active_price;
  if (supplier.activePrice) return supplier.activePrice;

  if (Array.isArray(supplier.prices)) {
    return supplier.prices.find((price) => price.is_active) || supplier.prices[0] || null;
  }

  if (supplier.price && typeof supplier.price === "object") {
    return supplier.price as ProductPrice;
  }

  return null;
};

const getSupplierSellingPrice = (supplier?: ProductSupplier | null): number | null => {
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
  const activePrice = getActivePrice(supplier);
  return activePrice ? toNumberOrNull(activePrice.Markup ?? activePrice.markup) : null;
};

const normalizeSuppliers = (row: any): ProductSupplier[] => {
  if (Array.isArray(row.suppliers)) return row.suppliers;
  if (Array.isArray(row.product_suppliers)) return row.product_suppliers;
  if (Array.isArray(row.productSuppliers)) return row.productSuppliers;
  if (Array.isArray(row.ProductSuppliers)) return row.ProductSuppliers;

  return [];
};

const normalizeInventoryDetail = (row: any): InventoryDetailItem => {
  const product = row.product || {};
  const quantityOnHand = Number(row.quantity_on_hand ?? row.stock ?? 0);
  const reservedQuantity = Number(row.reserved_quantity ?? 0);

  return {
    id: String(row.id),

    // Image comes from the related product returned by GET /api/inventory/{id}
    image:
      product.image_URL ||
      product.image_url ||
      product.image_path ||
      product.image ||
      row.image_URL ||
      row.image_url ||
      row.image_path ||
      row.image ||
      undefined,

    name: String(product.name || row.name || ""),
    brand:
      product.manufacturer_name ||
      product.manufacturer?.name ||
      product.Manufacturer?.name ||
      row.manufacturer_name ||
      row.manufacturer?.name ||
      row.Manufacturer?.name ||
      row.brand_name ||
      row.brand?.name ||
      "-",
    sku: String(product.SKU || product.sku || row.SKU || row.sku || ""),
    partNumber: String(
      product.part_number ||
        product.partNumber ||
        row.part_number ||
        row.partNumber ||
        ""
    ),
    partName:
      product.part_name ||
      product.part?.name ||
      product.Part?.name ||
      row.part_name ||
      row.part?.name ||
      row.Part?.name ||
      "-",
    category:
      product.category_name ||
      product.category?.name ||
      product.Category?.name ||
      row.category_name ||
      row.category?.name ||
      row.Category?.name ||
      "-",
    unitName:
      product.unit_name ||
      product.unit?.name ||
      product.Unit?.name ||
      row.unit_name ||
      row.unit?.name ||
      row.Unit?.name ||
      row.unit ||
      "-",
    unitAbbreviation:
      product.unit_abbreviation ||
      product.unitAbbreviation ||
      product.unit?.abbreviation ||
      product.Unit?.abbreviation ||
      row.unit_abbreviation ||
      row.unitAbbreviation ||
      row.unit?.abbreviation ||
      row.Unit?.abbreviation ||
      null,
    quantityOnHand,
    reservedQuantity,
    availableQuantity: Number(
      row.available_quantity ?? Math.max(quantityOnHand - reservedQuantity, 0)
    ),
    reorderLevel: toNumberOrNull(row.reorder_level),
    reorderQty: toNumberOrNull(row.reorder_qty),
    locationId: row.location_id || null,
    description: product.description || row.description || "-",
    suppliers: normalizeSuppliers(row),
  };
};

const getStockStatus = (item: InventoryDetailItem) => {
  if (item.quantityOnHand === 0) {
    return {
      label: "Out of Stock",
      className: "bg-red-100/10 text-red-400 border border-red-500/20",
    };
  }

  if (
    item.reorderLevel !== null &&
    item.reorderLevel > 0 &&
    item.quantityOnHand <= item.reorderLevel
  ) {
    return {
      label: "Low Stock",
      className: "bg-yellow-100/10 text-yellow-400 border border-yellow-500/20",
    };
  }

  return {
    label: "In Stock",
    className: "bg-green-100/10 text-green-400 border border-green-500/20",
  };
};

const InventoryDetail: React.FC = () => {
  const navigate = useNavigate();
  const { productId: inventoryId } = useParams<{ productId: string }>();

  const [item, setItem] = useState<InventoryDetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  const loadInventoryDetail = async () => {
    if (!inventoryId) return;

    setLoading(true);

    try {
      const res = await api.get(`/inventory/${inventoryId}`);
      const row = res.data?.data ?? res.data;

      setItem(normalizeInventoryDetail(row));
      setImgError(false);
    } catch (error) {
      console.error("Failed to load inventory detail:", error);
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInventoryDetail();
  }, [inventoryId]);

  const supplierPriceRange = useMemo(() => {
    const prices =
      item?.suppliers
        .map((supplier) => getSupplierSellingPrice(supplier))
        .filter((price): price is number => price !== null) || [];

    if (prices.length === 0) return "No price set";

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    if (min === max) return formatPeso(min);

    return `${formatPeso(min)} - ${formatPeso(max)}`;
  }, [item]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 text-sm text-muted-foreground">Loading inventory item...</div>
      </DashboardLayout>
    );
  }

  if (!item) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">Inventory item not found.</p>
          <Button variant="outline" onClick={() => navigate("/webapp/products/inventory")}>
            Back to Inventory
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const status = getStockStatus(item);
  const unitDisplay = item.unitAbbreviation
    ? `${item.unitName} (${item.unitAbbreviation})`
    : item.unitName;

  return (
    <DashboardLayout>
      <div className="min-h-screen p-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/webapp/products/inventory")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <div>
              <p className="text-xs text-muted-foreground">Products / Inventory</p>
              <h1 className="text-xl font-semibold">{item.name}</h1>
            </div>
          </div>

          <Badge className={status.className}>{status.label}</Badge>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
          <Card className="xl:col-span-2 p-5 min-h-[580px]">
            <CardContent className="p-0 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
                <div className="md:col-span-2 space-y-4">
                  <div className="h-72 rounded-xl border border-border/60 bg-muted/30 flex items-center justify-center overflow-hidden">
                    {item.image && !imgError ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="flex flex-col items-center text-muted-foreground">
                        <ImageIcon className="w-8 h-8 mb-2" />
                        <span className="text-sm">No Image</span>
                      </div>
                    )}
                  </div>

                  <Card className="p-4">
                    <CardContent className="p-0 space-y-3">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <h2 className="font-semibold text-sm">Product Info</h2>
                      </div>

                      <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <span className="text-muted-foreground">SKU</span>
                        <span>{item.sku || "-"}</span>

                        <span className="text-muted-foreground">Part No.</span>
                        <span>{item.partNumber || "-"}</span>

                        <span className="text-muted-foreground">Brand</span>
                        <span>{item.brand}</span>

                        <span className="text-muted-foreground">Part Type</span>
                        <span>{item.partName}</span>

                        <span className="text-muted-foreground">Category</span>
                        <span>{item.category}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="md:col-span-3 p-4 min-h-[430px]">
                  <CardContent className="p-0 space-y-4">
                    <div className="flex items-center gap-2">
                      <Warehouse className="w-4 h-4 text-muted-foreground" />
                      <h2 className="font-semibold">Inventory Details</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                      <span className="text-muted-foreground">Quantity on Hand</span>
                      <span className="font-semibold">{item.quantityOnHand}</span>
                      <Separator className="col-span-2" />

                      <span className="text-muted-foreground">Reserved Quantity</span>
                      <span>{item.reservedQuantity}</span>
                      <Separator className="col-span-2" />

                      <span className="text-muted-foreground">Available Quantity</span>
                      <span className="font-semibold">{item.availableQuantity}</span>
                      <Separator className="col-span-2" />

                      <span className="text-muted-foreground">Reorder Level</span>
                      <span>{item.reorderLevel ?? "-"}</span>
                      <Separator className="col-span-2" />

                      <span className="text-muted-foreground">Reorder Quantity</span>
                      <span>{item.reorderQty ?? "-"}</span>
                      <Separator className="col-span-2" />

                      <span className="text-muted-foreground">Unit</span>
                      <span>{unitDisplay}</span>
                      <Separator className="col-span-2" />

                      <span className="text-muted-foreground">Location</span>
                      <span className="break-all">{item.locationId || "-"}</span>
                      <Separator className="col-span-2" />

                      <span className="text-muted-foreground">Supplier Price Range</span>
                      <span className="font-semibold">{supplierPriceRange}</span>
                    </div>

                    <div className="rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground flex gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <p>
                        Selling price is read from supplier pricing/ProductPrice. Inventory should
                        stay focused on stock quantities.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="p-4">
                <CardContent className="p-0 space-y-2">
                  <h2 className="font-semibold text-sm">Description</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4 min-h-[580px]">
            <Card className="p-4 flex-1 min-h-0">
              <CardContent className="p-0 h-full flex flex-col space-y-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                  <h2 className="font-semibold">Supplier Pricing</h2>
                </div>

                {item.suppliers.length > 0 ? (
                  <div className="space-y-2 overflow-auto pr-1">
                    {item.suppliers.map((supplier) => {
                      const supplierCost = toNumberOrNull(supplier.supplier_cost);
                      const sellingPrice = getSupplierSellingPrice(supplier);
                      const markup = getSupplierMarkup(supplier);

                      return (
                        <div
                          key={String(supplier.id || supplier.supplier_id)}
                          className="rounded-lg border border-border/60 p-3 bg-card/60"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium">{getSupplierName(supplier)}</p>
                              <p className="text-xs text-muted-foreground">
                                Cost: {supplierCost !== null ? formatPeso(supplierCost) : "-"}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Price</p>
                              <p className="text-sm font-semibold">{formatPeso(sellingPrice)}</p>
                            </div>
                          </div>

                          <div className="mt-2 text-xs text-muted-foreground">
                            Markup: {markup !== null ? `${markup.toFixed(2)}%` : "-"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No supplier pricing added yet.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="p-4 flex-1 min-h-0">
              <CardContent className="p-0 h-full flex flex-col space-y-4">
                <h2 className="font-semibold">Stock Planning</h2>

                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <span className="text-muted-foreground">Current Stock</span>
                  <span className="font-semibold">{item.quantityOnHand}</span>

                  <span className="text-muted-foreground">Reserved</span>
                  <span>{item.reservedQuantity}</span>

                  <span className="text-muted-foreground">Available</span>
                  <span>{item.availableQuantity}</span>

                  <span className="text-muted-foreground">Reorder At</span>
                  <span>{item.reorderLevel ?? "-"}</span>

                  <span className="text-muted-foreground">Suggested Reorder</span>
                  <span>{item.reorderQty ?? "-"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InventoryDetail;
