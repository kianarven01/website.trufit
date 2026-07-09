import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ImageIcon,
  Package,
  Warehouse,
  Car,
  Repeat,
  Pencil,
  Check,
  X,
  Loader2,
} from "lucide-react";
import api from "@/api/axios";
import { formatPeso, toNumberOrNull } from "@/lib/format";

interface InventoryDetailItem {
  id: string;
  inventoryId: string;
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
  locationName?: string | null;
  binId?: string | null;
  binName?: string | null;
  description: string;
  sellingPrice: number | null;
  compatibleVehicles: CompatibleVehicle[];
  equivalentGroups: EquivalentGroup[];
}

interface CompatibleVehicle {
  id: string;
  car_variant_id: string;
  notes?: string;
  vehicle_variant?: {
    id: string;
    variant_name: string;
    variant?: string;
    year?: string;
    model?: string;
    make?: string;
    vehicle_model?: {
      id: string;
      model: string;
      make?: string;
    };
  };
  name?: string;
}

interface EquivalentGroup {
  id: string;
  name: string;
  notes?: string;
  products: EquivalentProduct[];
}

interface EquivalentProduct {
  id: string;
  name: string;
  SKU?: string;
  part_number?: string;
  manufacturer_name?: string;
  quantity_on_hand?: number;
}

interface WarehouseOption {
  id: string;
  code: string;
  name: string;
  bins: BinOption[];
}

interface BinOption {
  id: string;
  code: string;
  name: string | null;
}

const normalizeInventoryDetail = (row: any): InventoryDetailItem => {
  const product = row.product || {};
  const quantityOnHand = Number(row.quantity_on_hand ?? row.stock ?? 0);
  const reservedQuantity = Number(row.reserved_quantity ?? 0);

  return {
    id: String(row.product_id || product.id || ""),
    inventoryId: String(row.id),

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
    locationName: row.location_name || row.location_id || null,
    binId: row.bin_id || null,
    binName: row.bin_name || row.bin?.name || null,
    description: product.description || row.description || "-",
    sellingPrice: toNumberOrNull(row.selling_price),
    compatibleVehicles: Array.isArray(row.compatible_vehicles)
      ? row.compatible_vehicles
      : [],
    equivalentGroups: Array.isArray(row.equivalent_groups)
      ? row.equivalent_groups
      : [],
  };
};

const getVehicleLabel = (vehicle: CompatibleVehicle): string => {
  const variant = vehicle.vehicle_variant;
  if (!variant) return vehicle.name || "-";

  const make =
    variant.make ||
    variant.vehicle_model?.make ||
    "";

  const model =
    variant.model ||
    variant.vehicle_model?.model ||
    "";

  const variantName =
    variant.variant_name ||
    variant.variant ||
    "";

  const year = variant.year || "";

  return [make, model, variantName, year].filter(Boolean).join(" ") || "-";
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
  const location = useLocation();
  const { productId: inventoryId } = useParams<{ productId: string }>();

  const [item, setItem] = useState<InventoryDetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [editWarehouseId, setEditWarehouseId] = useState<string>("");
  const [editBinId, setEditBinId] = useState<string>("__none__");
  const [isSavingLocation, setIsSavingLocation] = useState(false);

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

  const loadWarehouses = useCallback(async () => {
    try {
      const res = await api.get("/warehouses");
      const rows = Array.isArray(res.data?.data) ? res.data.data : [];
      setWarehouses(rows);
    } catch (error) {
      console.error("Failed to load warehouses:", error);
    }
  }, []);

  const handleStartEditLocation = async () => {
    if (warehouses.length === 0) {
      await loadWarehouses();
    }
    setEditWarehouseId(item?.locationId || "");
    setEditBinId(item?.binId || "__none__");
    setIsEditingLocation(true);
  };

  const handleSaveLocation = async () => {
    if (!item || !editWarehouseId) return;
    setIsSavingLocation(true);
    try {
      const payload: Record<string, string> = { location_id: editWarehouseId };
      if (editBinId && editBinId !== "__none__") {
        payload.bin_id = editBinId;
      } else {
        payload.bin_id = "";
      }
      const res = await api.put(`/inventory/${item.inventoryId}/location`, payload);
      const updated = res.data?.data;
      if (updated) {
        setItem(normalizeInventoryDetail(updated));
      }
      setIsEditingLocation(false);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to update location.";
      console.error("Location update failed:", msg);
    } finally {
      setIsSavingLocation(false);
    }
  };

  const handleCancelEditLocation = () => {
    setIsEditingLocation(false);
  };

  const selectedWarehouse = warehouses.find((w) => w.id === editWarehouseId);
  const availableBins = selectedWarehouse?.bins || [];

  useEffect(() => {
    void loadInventoryDetail();
  }, [inventoryId]);

  useEffect(() => {
    if (!item?.name) return;

    const breadcrumbKey = `breadcrumb-${location.pathname}`;
    sessionStorage.setItem(breadcrumbKey, item.name);

    const currentState = (location.state || {}) as Record<string, any>;

    if (
      currentState.breadcrumbLabel === item.name
    ) {
      window.dispatchEvent(new Event("breadcrumb-update"));
      return;
    }

    navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: {
        ...currentState,
        breadcrumbLabel: item.name,
      },
    });

    window.dispatchEvent(new Event("breadcrumb-update"));
  }, [item?.name, location.pathname, location.search, location.state, navigate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading inventory item...</p>
        </div>
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
      <div className="p-6 space-y-5 h-full flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between gap-3 shrink-0">
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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch flex-1">
          <Card className="xl:col-span-2 p-5">
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
                      {isEditingLocation ? (
                        <div className="flex flex-col gap-2">
                          <Select
                            value={editWarehouseId}
                            onValueChange={(val) => {
                              setEditWarehouseId(val);
                              setEditBinId("__none__");
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select warehouse" />
                            </SelectTrigger>
                            <SelectContent>
                              {warehouses.map((w) => (
                                <SelectItem key={w.id} value={w.id}>
                                  {w.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {availableBins.length > 0 && (
                            <Select
                              value={editBinId}
                              onValueChange={setEditBinId}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select bin (optional)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">No bin</SelectItem>
                                {availableBins.map((b) => (
                                  <SelectItem key={b.id} value={b.id}>
                                    {b.code}{b.name ? ` — ${b.name}` : ""}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              onClick={handleSaveLocation}
                              disabled={isSavingLocation || !editWarehouseId}
                              className="h-7 px-2 text-xs"
                            >
                              {isSavingLocation ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEditLocation}
                              disabled={isSavingLocation}
                              className="h-7 px-2 text-xs"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>
                            {item.locationName || "-"}
                            {item.binName && (
                              <span className="text-muted-foreground"> &rarr; {item.binName}</span>
                            )}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleStartEditLocation}
                            className="h-6 w-6 p-0"
                          >
                            <Pencil className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        </div>
                      )}
                      <Separator className="col-span-2" />

                      <span className="text-muted-foreground">Selling Price</span>
                      <span className="font-semibold">{formatPeso(item.sellingPrice)}</span>
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

          <div className="flex flex-col gap-4">
            {/* Compatible Vehicles */}
            <Card className="p-4 flex-1 min-h-0">
              <CardContent className="p-0 h-full flex flex-col space-y-4">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-muted-foreground" />
                  <h2 className="font-semibold">Compatible Vehicles</h2>
                </div>

                {item.compatibleVehicles.length > 0 ? (
                  <div className="space-y-2 overflow-auto pr-1">
                    {item.compatibleVehicles.map((vehicle, idx) => (
                      <div
                        key={vehicle.id || idx}
                        className="rounded-lg border border-border/60 p-3 bg-card/60"
                      >
                        <p className="text-sm font-medium">
                          {getVehicleLabel(vehicle)}
                        </p>
                        {vehicle.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {vehicle.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No compatible vehicles added yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Equivalent Parts */}
            <Card className="p-4 flex-1 min-h-0">
              <CardContent className="p-0 h-full flex flex-col space-y-4">
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-muted-foreground" />
                  <h2 className="font-semibold">Equivalent Parts</h2>
                </div>

                {item.equivalentGroups.length > 0 ? (
                  <div className="space-y-3 overflow-auto pr-1">
                    {item.equivalentGroups.map((group) => (
                      <div key={group.id} className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          {group.name}
                        </p>
                        {group.products.length > 0 ? (
                          group.products.map((product) => (
                            <div
                              key={product.id}
                              className="rounded-lg border border-border/60 p-3 bg-card/60"
                            >
                              <p className="text-sm font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                SKU: {product.SKU || "-"} • Part No: {product.part_number || "-"}
                              </p>
                              {product.manufacturer_name && (
                                <p className="text-xs text-muted-foreground">
                                  Brand: {product.manufacturer_name}
                                </p>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground italic">
                            No equivalent products in this group.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No equivalent parts added yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Stock Planning */}
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
