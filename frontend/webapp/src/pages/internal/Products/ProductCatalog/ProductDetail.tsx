import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductModal from "@/components/popupModal/ProductCatalog/addProduct";
import SpolProductModal from "@/components/popupModal/ProductCatalog/spolProduct";
import { ArrowLeft, AlertTriangle, Trash2, Pencil, Printer } from "lucide-react";
import AppToast, { AppToastType } from "@/components/ui/AppToast";
import { Separator } from "@/components/ui/separator";
import AddProductSupplierModal from "@/components/popupModal/ProductCatalog/addProductSupplier";
import AddVehicleCompatibility from "@/components/popupModal/ProductCatalog/addVehicleCompatibility";
import api from "@/api/axios";
import Barcode from "react-barcode";
import { formatPeso, toNumberOrNull } from "@/lib/format";
import { getRows } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  stock_quantity?: number;

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
  partId?: string | number | null;
  manufacturerId?: string | number | null;
  unitId?: string | number | null;
  oemRef?: string | null;
  description: string;
  unit: string;
  unitAbbreviation?: string | null;
  price: number | null;
  category: string;
  categoryIsSpol: boolean;
  manufacturer: string;
  barcode?: string;
  categoryId?: string | number | null;
  preferredSupplierId?: string | null;
  suppliers?: ProductSupplier[];
  compatibleVehicles?: {
    id?: string;
    make: string;
    model: string;
    variant: string;
    year: string;
    notes?: string;
  }[];
  crossReferences?: {
    type: string;
    reference: string;
  }[];
}

interface EquivalentProduct {
  id: string;
  name: string;
  sku: string;
  partNumber: string;
  manufacturer: string;
}

interface EquivalentGroup {
  id: string;
  name: string;
  partId?: string | number | null;
  notes?: string | null;
  products: EquivalentProduct[];
  equivalentProducts: EquivalentProduct[];
}

interface CategoryOption {
  id: string;
  name: string;
  code?: string;
  is_spol?: boolean;
}

interface ManufacturerOption {
  id: string;
  name: string;
}

interface SupplierOption {
  id: string;
  name: string;
}

const BARCODE_LABEL_COUNT = 40;

const getVehicleLabel = (variant: any): string => {
  if (!variant) return "-";

  const make =
    variant.make ||
    variant.make_name ||
    variant.Manufacturer?.name ||
    variant.manufacturer ||
    variant.vehicle_model?.make ||
    "";

  const model =
    variant.model ||
    variant.model_name ||
    variant.vehicle_model?.model ||
    variant.VehicleModel?.model ||
    "";

  const variantName =
    variant.name ||
    variant.variant ||
    variant.variant_name ||
    variant.engine ||
    "";

  const year =
    variant.year ||
    variant.year_range ||
    variant.model_year ||
    "";

  return [make, model, variantName, year].filter(Boolean).join(" ") || "-";
};

const normalizeCompatibleVehicles = (row: any) => {
  const compatibilities = Array.isArray(row.compatible_vehicles)
    ? row.compatible_vehicles
    : Array.isArray(row.vehicle_compatibilities)
      ? row.vehicle_compatibilities
      : Array.isArray(row.compatibleVehicles)
        ? row.compatibleVehicles
        : [];

  return compatibilities.map((compatibility: any) => {
    const variant =
      compatibility.vehicle_variant ||
      compatibility.vehicleVariant ||
      compatibility.variant ||
      compatibility;

    return {
      id: String(compatibility.id || compatibility.car_variant_id || variant?.id || `${getVehicleLabel(variant)}-${Math.random()}`),
      make:
        variant?.make ||
        variant?.make_name ||
        variant?.Manufacturer?.name ||
        variant?.manufacturer ||
        variant?.vehicle_model?.make ||
        "-",
      model:
        variant?.model ||
        variant?.model_name ||
        variant?.vehicle_model?.model ||
        variant?.VehicleModel?.model ||
        "-",
      variant:
        variant?.name ||
        variant?.variant ||
        variant?.variant_name ||
        variant?.engine ||
        getVehicleLabel(variant),
      year:
        variant?.year ||
        variant?.year_range ||
        variant?.model_year ||
        "-",
      notes: compatibility.notes || "",
    };
  });
};


const normalizeSuppliers = (row: any): ProductSupplier[] => {
  if (Array.isArray(row.suppliers)) return row.suppliers;
  if (Array.isArray(row.product_suppliers)) return row.product_suppliers;
  if (Array.isArray(row.productSuppliers)) return row.productSuppliers;
  if (Array.isArray(row.ProductSuppliers)) return row.ProductSuppliers;

  return [];
};

const getSupplierRowId = (supplier: ProductSupplier) =>
  String(supplier.id || supplier.supplier_id);

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
  partId:
    row.part_id ??
    row.partId ??
    row.part?.id ??
    row.Part?.id ??
    null,
  manufacturerId:
    row.manufacturer_id ??
    row.manufacturerId ??
    row.manufacturer?.id ??
    row.Manufacturer?.id ??
    row.brand?.id ??
    row.Brand?.id ??
    null,
  unitId:
    row.unit_id ??
    row.unitId ??
    row.unit?.id ??
    row.Unit?.id ??
    row.unitRelation?.id ??
    (typeof row.unit === "number" || typeof row.unit === "string"
      ? row.unit
      : null),
  oemRef: row.oem_reference_number || row.oemRef || null,
  description: row.description || "-",
  unit: row.unit?.name || row.Unit?.name || row.unit_name || row.unit || "-",
  unitAbbreviation:
    row.unit?.abbreviation ||
    row.Unit?.abbreviation ||
    row.unit_abbreviation ||
    row.unitAbbreviation ||
    null,
  price: toNumberOrNull(row.selling_price ?? row.preferred_selling_price ?? row.price ?? row.sell_price),
  category: row.category?.name || row.Category?.name || row.category_name || "-",
  categoryIsSpol: Boolean(row.category_is_spol),
  manufacturer:
    row.manufacturer?.name ||
    row.Manufacturer?.name ||
    row.manufacturer_name ||
    row.brand?.name ||
    row.Brand?.name ||
    row.brand_name ||
    "-",
  barcode: row.barcode || "",
  categoryId: row.category_id ?? row.categoryId ?? null,
  preferredSupplierId: row.preferred_supplier_id ?? row.preferredSupplierId ?? null,
  suppliers: normalizeSuppliers(row),
  compatibleVehicles: normalizeCompatibleVehicles(row),
  crossReferences: Array.isArray(row.crossReferences) ? row.crossReferences : [],
});

const normalizeEquivalentProduct = (row: any): EquivalentProduct => ({
  id: String(row.id),
  name: String(row.name || ""),
  sku: String(row.SKU || row.sku || ""),
  partNumber: String(row.part_number || row.partNumber || ""),
  manufacturer:
    row.manufacturer ||
    row.manufacturer_name ||
    row.Manufacturer?.name ||
    row.brand?.name ||
    row.Brand?.name ||
    "-",
});

const normalizeEquivalentGroup = (row: any): EquivalentGroup => {
  const equivalentRows = Array.isArray(row.equivalent_products)
    ? row.equivalent_products
    : Array.isArray(row.equivalentProducts)
    ? row.equivalentProducts
    : [];

  const productRows = Array.isArray(row.products) ? row.products : [];

  return {
    id: String(row.id),
    name: String(row.name || "Equivalent Group"),
    partId: row.part_id ?? row.partId ?? null,
    notes: row.notes || null,
    products: productRows.map(normalizeEquivalentProduct),
    equivalentProducts: equivalentRows.map(normalizeEquivalentProduct),
  };
};

const ProductDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSpolEditOpen, setIsSpolEditOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isPrintingBarcodeLabels, setIsPrintingBarcodeLabels] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [editingPriceSupplierId, setEditingPriceSupplierId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");
  const [editMarkup, setEditMarkup] = useState<string>("");
  const [editPricingMode, setEditPricingMode] = useState<"manual" | "markup">("manual");
  const [isSavingPrice, setIsSavingPrice] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [isSavingDescription, setIsSavingDescription] = useState(false);
  const [confirmRemoveSupplierId, setConfirmRemoveSupplierId] = useState<string | null>(null);
  const [confirmRemoveVehicleId, setConfirmRemoveVehicleId] = useState<string | null>(null);
  const [confirmRemoveEquivalent, setConfirmRemoveEquivalent] = useState<{ groupId: string; equivalentProductId: string } | null>(null);
  
  const [toast, setToast] = useState<{
    type: AppToastType;
    title: string;
    message: string;
  } | null>(null);

  const showToast = (
    type: AppToastType,
    title: string,
    message: string
  ) => {
    setToast({ type, title, message });
  };


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
        productName?: string;
        breadcrumbLabel?: string;
        vehicleId?: string;
        variantId?: string;
        categoryId?: string;
      }
    | undefined;

  const [product, setProduct] = useState<Product | null>(
    routeState?.product || null
  );
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [manufacturers, setManufacturers] = useState<ManufacturerOption[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [loading, setLoading] = useState(!routeState?.product);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [equivalentGroups, setEquivalentGroups] = useState<EquivalentGroup[]>([]);
  const [equivalentCandidates, setEquivalentCandidates] = useState<EquivalentProduct[]>([]);
  const [isEquivalentOpen, setIsEquivalentOpen] = useState(false);
  const [equivalentSearch, setEquivalentSearch] = useState("");
  const [equivalentGroupName, setEquivalentGroupName] = useState("");
  const [equivalentNotes, setEquivalentNotes] = useState("");
  const [selectedEquivalentIds, setSelectedEquivalentIds] = useState<string[]>([]);
  const [equivalentSaving, setEquivalentSaving] = useState(false);
  const [equivalentLoading, setEquivalentLoading] = useState(false);
  const [vehicleSyncing, setVehicleSyncing] = useState(false);

  const loadCategories = async () => {
    try {
      const res = await api.get("/products/categories");
      const rows = getRows(res.data);

      setCategories(
        (Array.isArray(rows) ? rows : []).map((row: any) => ({
          id: String(row.id),
          name: String(row.name),
          code: row.code || undefined,
          is_spol: Boolean(row.is_spol),
        }))
      );
    } catch (error) {
      console.error("Failed to load categories:", error);
      setToast({ type: "error", title: "Error", message: "Failed to load categories." });
      setCategories([]);
    }
  };

  const loadManufacturers = async () => {
    try {
      const res = await api.get("/products/manufacturers");
      const rows = getRows(res.data);

      setManufacturers(
        (Array.isArray(rows) ? rows : []).map((row: any) => ({
          id: String(row.id),
          name: String(row.name || ""),
        }))
      );
    } catch (error) {
      console.error("Failed to load manufacturers:", error);
      setToast({ type: "error", title: "Error", message: "Failed to load manufacturers." });
      setManufacturers([]);
    }
  };

  const loadSuppliers = async () => {
    try {
      const res = await api.get("/products/suppliers");
      const rows = getRows(res.data);

      setSuppliers(
        (Array.isArray(rows) ? rows : []).map((row: any) => ({
          id: String(row.id),
          name: String(row.CompanyName || row.name || ""),
          supplier_code: row.supplier_code || "",
        }))
      );
    } catch (error) {
      console.error("Failed to load suppliers:", error);
      setToast({ type: "error", title: "Error", message: "Failed to load suppliers." });
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
          console.error(
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

      const rows = getRows(listRes.data);
      const normalized = rows.map(normalizeProduct);

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

  

  const loadEquivalentGroups = async (id: string) => {
    try {
      const res = await api.get(`/products/${id}/equivalent-groups`);
      const rows = Array.isArray(res.data?.groups) ? res.data.groups : [];
      setEquivalentGroups(rows.map(normalizeEquivalentGroup));
    } catch (error) {
      console.error("Failed to load equivalent groups:", error);
      setToast({ type: "error", title: "Error", message: "Failed to load equivalent groups." });
      setEquivalentGroups([]);
    }
  };

  const loadEquivalentCandidates = async () => {
    if (!product?.id) return;

    setEquivalentLoading(true);

    try {
      const res = await api.get(`/products/${product.id}/equivalent-candidates`, {
        params: { search: equivalentSearch || undefined },
      });

      const rows = getRows(res.data);
      const alreadyLinkedIds = new Set(
        equivalentGroups.flatMap((group) =>
          group.products.map((equivalentProduct) => equivalentProduct.id)
        )
      );

      const normalizedCandidates: EquivalentProduct[] = rows.map(normalizeEquivalentProduct);

      setEquivalentCandidates(
        normalizedCandidates.filter((candidate: EquivalentProduct) => {
          return !alreadyLinkedIds.has(candidate.id);
        })
      );
    } catch (error) {
      console.error("Failed to load equivalent candidates:", error);
      setToast({ type: "error", title: "Error", message: "Failed to load equivalent candidates." });
      setEquivalentCandidates([]);
    } finally {
      setEquivalentLoading(false);
    }
  };

  const openEquivalentModal = () => {
    setEquivalentGroupName(product ? `${product.name} Equivalent Group` : "");
    setEquivalentNotes("");
    setEquivalentSearch("");
    setSelectedEquivalentIds([]);
    setIsEquivalentOpen(true);
  };

  const toggleEquivalentSelection = (id: string) => {
    setSelectedEquivalentIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id]
    );
  };

  const handleCreateEquivalentGroup = async () => {
    if (!product?.id) return;

    setEquivalentSaving(true);

    try {
      await api.post(`/products/${product.id}/equivalent-groups`, {
        name: equivalentGroupName.trim() || `${product.name} Equivalent Group`,
        notes: equivalentNotes.trim() || null,
        equivalent_product_ids: selectedEquivalentIds,
      });

      setIsEquivalentOpen(false);
      await loadEquivalentGroups(product.id);
    } catch (error: any) {
      console.error("Failed to create equivalent group:", error);
      showToast("error", "Save Failed", error?.response?.data?.message || "Failed to save equivalent products. Please check the selected products.");
    } finally {
      setEquivalentSaving(false);
    }
  };

  const handleRemoveEquivalent = async (groupId: string, equivalentProductId: string) => {
    if (!product?.id) return;

    try {
      await api.delete(
        `/products/equivalent-groups/${groupId}/items/${equivalentProductId}`
      );

      await loadEquivalentGroups(product.id);
    } catch (error: any) {
      console.error("Failed to remove equivalent product:", error);
      showToast("error", "Remove Failed", error?.response?.data?.message || "Failed to remove equivalent product.");
    }
  };

  const handleRemoveSupplier = async (supplierRowId: string) => {
    if (!product?.id) return;

    try {
      const res = await api.delete(`/products/${product.id}/suppliers/${supplierRowId}`);
      
      showToast("success", "Supplier removed", "Supplier was successfully removed from the product.");
      await loadProduct();
    } catch (error: any) {
      console.error("Failed to remove supplier:", error);
      const errorMsg = error?.response?.data?.message || "Failed to remove supplier from product.";
      showToast("error", "Failed to remove supplier", errorMsg);
    }
    setConfirmRemoveSupplierId(null);
  };

  const handleStartEditPrice = (supplier: ProductSupplier) => {
    const currentPrice = getSupplierSellingPrice(supplier);
    const currentMarkup = getSupplierMarkup(supplier);

    setEditPrice(currentPrice !== null ? String(currentPrice) : "");
    setEditMarkup(currentMarkup !== null ? String(currentMarkup) : "");
    setEditPricingMode(currentMarkup !== null && currentPrice === null ? "markup" : "manual");
    setEditingPriceSupplierId(getSupplierRowId(supplier));
  };

  const handleCancelEditPrice = () => {
    setEditingPriceSupplierId(null);
    setEditPrice("");
    setEditMarkup("");
    setEditPricingMode("manual");
  };

  const handleStartEditDescription = () => {
    setEditDescription(product?.description || "");
    setIsEditingDescription(true);
  };

  const handleCancelEditDescription = () => {
    setIsEditingDescription(false);
    setEditDescription("");
  };

  const handleSaveDescription = async () => {
    if (!product?.id) return;

    setIsSavingDescription(true);
    try {
      await api.put(`/products/${product.id}`, { description: editDescription });
      showToast("success", "Description Updated", "Product description has been updated.");
      setIsEditingDescription(false);
      await loadProduct();
    } catch (error: any) {
      console.error("Failed to update description:", error);
      showToast("error", "Update Failed", error?.response?.data?.message || "Failed to update description.");
    } finally {
      setIsSavingDescription(false);
    }
  };

  const handleSavePrice = async () => {
    if (!product?.id || !editingPriceSupplierId) return;

    const priceVal = editPricingMode === "manual" ? toNumberOrNull(editPrice) : null;
    const markupVal = editPricingMode === "markup" ? toNumberOrNull(editMarkup) : null;

    setIsSavingPrice(true);
    try {
      await api.put(`/products/${product.id}/suppliers/${editingPriceSupplierId}`, {
        price: priceVal,
        markup: markupVal,
      });
      showToast("success", "Price Updated", "Supplier price has been updated.");
      setEditingPriceSupplierId(null);
      await loadProduct();
    } catch (error: any) {
      console.error("Failed to update price:", error);
      const errorMsg = error?.response?.data?.message || "Failed to update price.";
      showToast("error", "Update Failed", errorMsg);
    } finally {
      setIsSavingPrice(false);
    }
  };

  const handleRemoveVehicleCompatibility = async (compatibilityId: string) => {
    if (!product?.id) return;

    try {
      await api.delete(`/products/${product.id}/vehicle-compatibilities/${compatibilityId}`);
      
      showToast("success", "Vehicle compatibility removed", "Vehicle compatibility was successfully removed.");
      await loadProduct();
      await loadEquivalentGroups(product.id);
    } catch (error: any) {
      console.error("Failed to remove vehicle compatibility:", error);
      const errorMsg = error?.response?.data?.message || "Failed to remove vehicle compatibility.";
      showToast("error", "Failed to remove vehicle", errorMsg);
    }
    setConfirmRemoveVehicleId(null);
  };

  const handleSetPreferredSupplier = async (productSupplierId: string) => {
    if (!product?.id) return;

    try {
      await api.patch(`/products/${product.id}`, {
        preferred_supplier_id: productSupplierId,
      });

      const chosenSupplier = product?.suppliers?.find(
        (s) => (s.id ?? s.supplier_id) === productSupplierId
      );
      const chosenStock = chosenSupplier?.stock_quantity ?? 0;
      const hasOtherSupplierWithStock = product?.suppliers?.some(
        (s) => (s.id ?? s.supplier_id) !== productSupplierId && (s.stock_quantity ?? 0) > 0
      ) ?? false;

      await loadProduct();

      if (chosenStock <= 0 && hasOtherSupplierWithStock) {
        showToast(
          "info",
          "Preferred supplier saved",
          "This supplier has no stock. The system will display the supplier with available stock instead."
        );
      } else {
        showToast("success", "Preferred supplier updated", "The preferred supplier has been set successfully.");
      }
    } catch (error: any) {
      console.error("Failed to set preferred supplier:", error);
      const errorMsg = error?.response?.data?.message || "Failed to update preferred supplier.";
      showToast("error", "Failed to update preferred supplier", errorMsg);
    }
  };

  const handleSyncVehicleCompatibility = async () => {
    if (!product?.id) return;

    setVehicleSyncing(true);

    try {
      const res = await api.post(
        `/products/${product.id}/vehicle-compatibilities/sync-equivalents`
      );

      showToast("success", "Sync Complete", res.data?.message || `Vehicle compatibility synced. Added ${res.data?.synced_count ?? 0} records.`);

      await loadProduct();
      await loadEquivalentGroups(product.id);
    } catch (error: any) {
      console.error("Failed to sync vehicle compatibility:", error);
      showToast("error", "Sync Failed", error?.response?.data?.message || "Failed to sync vehicle compatibility to equivalents.");
    } finally {
      setVehicleSyncing(false);
    }
  };

  useEffect(() => {
    void Promise.all([loadCategories(), loadManufacturers(), loadSuppliers()]);
    void loadProduct();
  }, [routeState?.productId, productId]);

  useEffect(() => {
    if (!product?.name) return;

    const breadcrumbKey = `breadcrumb-${location.pathname}`;
    sessionStorage.setItem(breadcrumbKey, product.name);

    const currentState = (location.state || {}) as Record<string, any>;

    if (
      currentState.productName === product.name &&
      currentState.breadcrumbLabel === product.name
    ) {
      window.dispatchEvent(new Event("breadcrumb-update"));
      return;
    }

    navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: {
        ...currentState,
        productName: product.name,
        breadcrumbLabel: product.name,
      },
    });

    window.dispatchEvent(new Event("breadcrumb-update"));
  }, [product?.name, location.pathname, location.search, location.state, navigate]);

  useEffect(() => {
    if (!product?.id) {
      setEquivalentGroups([]);
      return;
    }

    void loadEquivalentGroups(product.id);
  }, [product?.id]);

  useEffect(() => {
    if (!isEquivalentOpen || !product?.id) return;

    void loadEquivalentCandidates();
  }, [isEquivalentOpen, product?.id, equivalentSearch]);

  useEffect(() => {
    const handleAfterPrint = () => {
      setIsPrintingBarcodeLabels(false);
    };

    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  useEffect(() => {
    if (!product?.suppliers?.length) {
      setSelectedSupplierId("");
      return;
    }

    // Only reset if current selection is not in the supplier list
    const currentStillValid = product.suppliers.some(
      (s) => getSupplierRowId(s) === selectedSupplierId
    );

    if (!currentStillValid) {
      const preferredSupplier =
        product.suppliers.find((supplier) => supplier.is_preferred) ||
        product.suppliers[0];
      setSelectedSupplierId(getSupplierRowId(preferredSupplier));
    }
  }, [product]);

  const backToProductsPath = useMemo(
    () =>
      vehicleSlug
        ? `/webapp/products/product-catalog/vehicles/${vehicleSlug}/${variantSlug}/${categorySlug}/products`
        : `/webapp/products/product-catalog/products`,
    [vehicleSlug, variantSlug, categorySlug]
  );
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(backToProductsPath);
  };

  if (loading) {
    return (
      <div className="px-6 py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="px-6 py-4 text-center text-muted-foreground">
        <p>No product found.</p>
        <div className="mt-4">
          <Button variant="outline" onClick={handleBack}>
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
  const barcodeValue = product.barcode || product.sku || "";

  const editProductInitialData = {
    id: product.id,
    name: product.name,
    SKU: product.sku,
    sku: product.sku,
    description:
      product.description && product.description !== "-"
        ? product.description
        : "",
    image_path: product.image || null,
    barcode: product.barcode || "",
    part_number: product.partNumber || "",
    part_id: product.partId || null,
    category_id: product.categoryId || null,
    manufacturer_id: product.manufacturerId || null,
    unit: product.unitId || null,
  };

  const handlePrintBarcodeLabels = () => {
    if (!barcodeValue) {
      showToast("warning", "No Barcode", "No barcode or SKU available to print.");
      return;
    }

    setIsPrintingBarcodeLabels(true);

    window.setTimeout(() => {
      window.print();
    }, 150);
  };

  const openDeleteModal = () => {
    setDeleteError("");
    setIsDeleteOpen(true);
  };

  const isSundriesProduct = product?.category === "Sundries";
  const isSpolProduct = Boolean(product?.categoryIsSpol);

  const handleArchiveProduct = async () => {
    if (!product?.id) return;

    setIsDeleting(true);
    setDeleteError("");

    try {
      if (isSundriesProduct) {
        await api.delete(`/products/${product.id}/force`);

        setIsDeleteOpen(false);

        navigate(backToProductsPath, {
          replace: true,
          state: {
            toast: {
              type: "success",
              title: "Product deleted",
              message: `${product.name} was permanently deleted.`,
            },
          },
        });
      } else {
        await api.delete(`/products/${product.id}`);

        setIsDeleteOpen(false);

        navigate(backToProductsPath, {
          replace: true,
          state: {
            toast: {
              type: "success",
              title: "Product archived",
              message: `${product.name} was removed from the active product list.`,
            },
          },
        });
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        (isSundriesProduct
          ? "Failed to delete product. Please try again."
          : "Failed to archive product. Please try again.");

      const toastType: AppToastType =
        message.toLowerCase().includes("stock") ||
        message.toLowerCase().includes("reserved") ||
        message.toLowerCase().includes("supplier")
          ? "warning"
          : message.toLowerCase().includes("already archived")
            ? "info"
            : "error";

      setDeleteError(message);

      showToast(
        toastType,
        toastType === "warning"
          ? message.toLowerCase().includes("supplier")
            ? "Product still has suppliers"
            : "Product still has stock"
          : toastType === "info"
            ? "Product already archived"
            : isSundriesProduct
              ? "Unable to delete product"
              : "Unable to archive product",
        message
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto px-6 pt-1 pb-6 flex flex-col gap-6">
      {toast && (
        <AppToast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      <style>{`
        @media screen {
          #barcode-label-sheet {
            display: none;
          }
        }

        @media print {
          @page {
            size: A4;
            margin: 8mm;
          }

          body * {
            visibility: hidden !important;
          }

          #barcode-label-sheet,
          #barcode-label-sheet * {
            visibility: visible !important;
          }

          #barcode-label-sheet {
            display: block !important;
            position: absolute !important;
            inset: 0 auto auto 0 !important;
            width: 100% !important;
            min-height: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }

          .barcode-label-page {
            display: grid !important;
            grid-template-columns: repeat(4, 1fr);
            grid-auto-rows: 25mm;
            gap: 3mm;
            width: 100%;
            box-sizing: border-box;
            page-break-inside: avoid;
          }

          .barcode-sticker {
            box-sizing: border-box;
            border: 1px dashed #bdbdbd;
            border-radius: 3mm;
            padding: 2mm;
            overflow: hidden;
            display: flex !important;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            background: #ffffff !important;
            color: #000000 !important;
          }

          .barcode-sticker-title {
            width: 100%;
            font-size: 8px;
            line-height: 1.1;
            font-weight: 700;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .barcode-sticker-meta {
            width: 100%;
            font-size: 7px;
            line-height: 1.1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .barcode-sticker svg {
            max-width: 100%;
            height: auto;
          }
        }
      `}</style>

      {isPrintingBarcodeLabels && barcodeValue && (
        <div id="barcode-label-sheet">
          <div className="barcode-label-page">
            {Array.from({ length: BARCODE_LABEL_COUNT }).map((_, index) => (
              <div className="barcode-sticker" key={`barcode-label-${index}`}>
                <div className="barcode-sticker-title">{product.name}</div>
                <div className="barcode-sticker-meta">
                  SKU: {product.sku || "-"} • Part No: {product.partNumber || "-"}
                </div>
                <Barcode
                  value={barcodeValue}
                  format="CODE128"
                  width={1}
                  height={28}
                  displayValue={true}
                  fontSize={8}
                  margin={1}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Product Header and Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <Button
          variant="outline"
          size="sm"
          type="button"
          className="w-fit flex items-center gap-2"
          onClick={handleBack}
        >
          <ArrowLeft size={16} />
          Back
        </Button>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            type="button"
            className="flex items-center gap-2"
            onClick={() => isSpolProduct ? setIsSpolEditOpen(true) : setIsEditOpen(true)}
          >
            <Pencil size={16} />
            Edit Product
          </Button>

          <Button
            size="sm"
            type="button"
            variant="destructive"
            className="flex items-center gap-2"
            onClick={openDeleteModal}
          >
            <Trash2 size={16} />
            Remove Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 items-stretch">
        <div className="lg:col-span-2 h-full">
          <Card className="p-6 flex flex-col gap-6 h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold">{product.name}</h1>
              </div>
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
              <div>
                <span className="font-medium text-foreground">Category:</span>{" "}
                {product.category || "-"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch flex-1">
              <div className="flex flex-col h-full gap-4">
                <div className="bg-muted rounded-xl flex-1 flex items-center justify-center overflow-hidden">
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

                <div className="flex items-center justify-between bg-foreground/5 rounded-xl py-2 px-4 gap-3">
                  <div className="flex flex-1 justify-center overflow-hidden">
                    {barcodeValue ? (
                      <div className="bg-background rounded-md border px-3 py-2 max-w-full overflow-hidden flex justify-center">
                        <Barcode
                          value={barcodeValue}
                          format="CODE128"
                          width={1.4}
                          height={45}
                          displayValue={true}
                          fontSize={12}
                          margin={4}
                        />
                      </div>
                    ) : (
                      <div className="rounded-md border border-dashed px-4 py-3 text-xs text-muted-foreground">
                        No barcode saved
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    onClick={handlePrintBarcodeLabels}
                    title="Print barcode labels"
                  >
                    <Printer />
                  </Button>
                </div>
              </div>

              <Card className="p-4 h-full flex flex-col">
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
                        ? formatPeso(selectedSupplierCost)
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
                    <span>
                      {product.unitAbbreviation
                        ? `${product.unit} (${product.unitAbbreviation})`
                        : product.unit}
                    </span>

                    <Separator className="col-span-2" />

                    <div className="col-span-2 flex flex-col gap-2 mt-auto">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Description</span>
                        {!isEditingDescription && (
                          <button
                            type="button"
                            onClick={handleStartEditDescription}
                            className="text-xs text-muted-foreground hover:text-foreground transition"
                          >
                            Edit
                          </button>
                        )}
                      </div>

                      {isEditingDescription ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="rounded-xl border border-border bg-background p-4 min-h-[90px] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Enter description..."
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => void handleSaveDescription()}
                              disabled={isSavingDescription}
                              className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
                            >
                              {isSavingDescription ? "Saving..." : "Save"}
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEditDescription}
                              className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-border bg-muted/20 p-4 min-h-[90px]">
                          <p className="text-sm whitespace-pre-wrap text-foreground">
                            {product.description && product.description.trim()
                              ? product.description
                              : "-"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          {!isSundriesProduct && (
          <Card className="p-4">
            <CardContent className="p-0 space-y-4 flex flex-col">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">Suppliers</h2>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddSupplierOpen(true)}
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
                      const isPreferred = supplierRowId === product.preferredSupplierId;
                      const supplierCost = toNumberOrNull(supplier.supplier_cost);
                      const sellingPrice = getSupplierSellingPrice(supplier);

                      return (
                        <div key={supplierRowId} className="relative group/supplier">
                          <button
                            type="button"
                            onClick={() => setSelectedSupplierId(supplierRowId)}
                            className={`w-full rounded-lg border p-3 pr-20 text-left transition ${
                              isSelected
                                ? "border-primary bg-primary/10"
                                : "border-border hover:bg-muted"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium">
                                    {getSupplierName(supplier)}
                                  </p>
                                  {isPreferred && (
                                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                                      Preferred
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>
                                    Cost:{" "}
                                    {supplierCost !== null
                                      ? formatPeso(supplierCost)
                                      : "-"}
                                  </span>
                                  <span>•</span>
                                  <span>Stock: {supplier.stock_quantity ?? 0}</span>
                                </div>
                              </div>

                              <div className="text-right">
                                {editingPriceSupplierId === supplierRowId ? (
                                  <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center gap-1 text-[10px]">
                                      <button
                                        type="button"
                                        onClick={() => setEditPricingMode("manual")}
                                        className={`px-1 py-0.5 rounded ${editPricingMode === "manual" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                                      >
                                        Manual
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditPricingMode("markup")}
                                        className={`px-1 py-0.5 rounded ${editPricingMode === "markup" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                                      >
                                        Markup
                                      </button>
                                    </div>
                                    {editPricingMode === "manual" ? (
                                      <input
                                        type="number"
                                        value={editPrice}
                                        onChange={(e) => setEditPrice(e.target.value)}
                                        className="w-24 text-right text-sm font-semibold border rounded px-1 py-0.5 bg-background"
                                        placeholder="Price"
                                        min="0"
                                        step="0.01"
                                      />
                                    ) : (
                                      <div className="flex items-center gap-1 justify-end">
                                        <input
                                          type="number"
                                          value={editMarkup}
                                          onChange={(e) => setEditMarkup(e.target.value)}
                                          className="w-16 text-right text-xs border rounded px-1 py-0.5 bg-background"
                                          placeholder="%"
                                          step="0.01"
                                        />
                                        <span className="text-[10px]">%</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1 justify-end">
                                      <button
                                        type="button"
                                        onClick={() => void handleSavePrice()}
                                        disabled={isSavingPrice}
                                        className="text-[10px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
                                      >
                                        {isSavingPrice ? "..." : "Save"}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={handleCancelEditPrice}
                                        className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:bg-muted/80"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="group/price flex items-center gap-1">
                                    <p className="text-xs text-muted-foreground">
                                      Selling Price
                                    </p>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartEditPrice(supplier);
                                      }}
                                      className="p-0.5 rounded hover:bg-blue-500/10 text-muted-foreground hover:text-blue-500 transition opacity-0 group-hover/price:opacity-100"
                                      title="Edit selling price"
                                    >
                                      <Pencil size={12} />
                                    </button>
                                  </div>
                                )}
                                {editingPriceSupplierId !== supplierRowId && (
                                  <p className="text-sm font-semibold">
                                    {formatPeso(sellingPrice)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                          <div className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center gap-1 opacity-0 group-hover/supplier:opacity-100 transition-opacity">
                            {!isPreferred && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleSetPreferredSupplier(supplierRowId);
                                }}
                                className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition"
                                title="Set as preferred supplier"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                </svg>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmRemoveSupplierId(supplierRowId);
                              }}
                              className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"
                              title="Remove supplier"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
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
          )}

          {!isSpolProduct && (
          <Card className="p-4 flex-1 min-h-0">
            <CardContent className="p-0 space-y-4 h-full flex flex-col">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">Compatible Vehicles</h2>
                <Button size="sm" variant="outline" onClick={() => setIsAddVehicleOpen(true)}>
                  + Add Vehicle
                </Button>
              </div>

              <div className="text-sm space-y-2 flex-1 min-h-0 overflow-auto">
                {product.compatibleVehicles &&
                product.compatibleVehicles.length > 0 ? (
                  product.compatibleVehicles.map((vehicle, idx) => (
                    <div
                      key={vehicle.id || idx}
                      className="flex items-center justify-between gap-2 text-xs border-b pb-2"
                    >
                      <div className="grid grid-cols-4 gap-2 flex-1">
                        <span>{vehicle.make}</span>
                        <span>{vehicle.model}</span>
                        <span>{vehicle.variant}</span>
                        <span>
                          {vehicle.year}
                          {vehicle.notes ? (
                            <span className="block text-[10px] text-muted-foreground">
                              {vehicle.notes}
                            </span>
                          ) : null}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => vehicle.id && setConfirmRemoveVehicleId(vehicle.id)}
                        className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition shrink-0"
                        title="Remove compatibility"
                      >
                        <Trash2 size={14} />
                      </button>
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
          )}

          {!isSpolProduct && (
          <Card className="p-4 flex-1 min-h-0">
            <CardContent className="p-0 space-y-4 h-full flex flex-col">
              <div className="flex justify-between items-center gap-2">
                <h2 className="font-semibold">Equivalent Products</h2>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSyncVehicleCompatibility}
                    disabled={vehicleSyncing || equivalentGroups.length === 0}
                  >
                    {vehicleSyncing ? "Syncing..." : "Sync Vehicles"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={openEquivalentModal}>
                    + Add Equivalent
                  </Button>
                </div>
              </div>

              <div className="space-y-3 text-sm flex-1 min-h-0 overflow-auto">
                {equivalentGroups.length > 0 ? (
                  equivalentGroups.map((group) => {
                    const equivalentProducts = group.equivalentProducts.length
                      ? group.equivalentProducts
                      : group.products.filter(
                          (equivalentProduct) => equivalentProduct.id !== product.id
                        );

                    return (
                      <div key={group.id} className="rounded-lg border border-border p-3 space-y-2">
                        <div>
                          <p className="text-sm font-medium">{group.name}</p>
                          {group.notes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {group.notes}
                            </p>
                          )}
                        </div>

                        {equivalentProducts.length > 0 ? (
                          <div className="space-y-2">
                            {equivalentProducts.map((equivalentProduct) => (
                              <div
                                key={equivalentProduct.id}
                                className="flex items-center justify-between gap-3 rounded-md bg-muted/30 px-3 py-2"
                              >
                                <div className="min-w-0">
                                  <p className="text-xs font-medium truncate">
                                    {equivalentProduct.name}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground truncate">
                                    SKU: {equivalentProduct.sku || "-"} • Part No: {equivalentProduct.partNumber || "-"}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground truncate">
                                    Brand: {equivalentProduct.manufacturer || "-"}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    title="Remove equivalent product"
                                    onClick={() =>
                                      setConfirmRemoveEquivalent({ groupId: group.id, equivalentProductId: equivalentProduct.id })
                                    }
                                  >
                                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-xs italic">
                            This group has no other equivalent products yet.
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-muted-foreground text-xs italic">
                    No equivalent products added yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          )}
        </div>
      </div>


      {isEquivalentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-2xl rounded-xl border border-border bg-background p-5 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Add Equivalent Products</h2>
                <p className="text-sm text-muted-foreground">
                  Only products with the same part type can be added.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEquivalentOpen(false)}
              >
                Close
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Group Name</label>
                <input
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none"
                  value={equivalentGroupName}
                  onChange={(event) => setEquivalentGroupName(event.target.value)}
                  placeholder="Example: Toyota Vios Oil Filter Group"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Search Products</label>
                <input
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none"
                  value={equivalentSearch}
                  onChange={(event) => setEquivalentSearch(event.target.value)}
                  placeholder="Search name, SKU, part no, barcode"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Notes</label>
              <textarea
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none min-h-[70px] resize-none"
                value={equivalentNotes}
                onChange={(event) => setEquivalentNotes(event.target.value)}
                placeholder="Optional notes about fitment or engine series"
              />
            </div>

            <div className="rounded-lg border border-border max-h-72 overflow-auto">
              {equivalentLoading ? (
                <div className="p-4 text-sm text-muted-foreground">
                  Loading matching products...
                </div>
              ) : equivalentCandidates.length > 0 ? (
                equivalentCandidates.map((candidate) => {
                  const selected = selectedEquivalentIds.includes(candidate.id);

                  return (
                    <button
                      type="button"
                      key={candidate.id}
                      onClick={() => toggleEquivalentSelection(candidate.id)}
                      className={`w-full text-left px-4 py-3 border-b border-border last:border-b-0 transition ${
                        selected ? "bg-primary/10" : "hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {candidate.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            SKU: {candidate.sku || "-"} • Part No: {candidate.partNumber || "-"} • Brand: {candidate.manufacturer || "-"}
                          </p>
                        </div>

                        <Badge variant={selected ? "default" : "secondary"}>
                          {selected ? "Selected" : "Available"}
                        </Badge>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-sm text-muted-foreground">
                  No matching equivalent products found. Add another product with the same part type first.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Selected products: {selectedEquivalentIds.length}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEquivalentOpen(false)}
                  disabled={equivalentSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateEquivalentGroup}
                  disabled={equivalentSaving || selectedEquivalentIds.length === 0}
                >
                  {equivalentSaving ? "Saving..." : "Save Equivalents"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-background p-5 shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-destructive/10 p-2 text-destructive">
                <AlertTriangle size={22} />
              </div>

              <div className="space-y-1">
                <h2 className="text-lg font-semibold">
                  {isSundriesProduct ? "Delete Product?" : "Remove Product?"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isSundriesProduct
                    ? "This will permanently delete the product. This action cannot be undone."
                    : "This will archive the product and hide it from the product list. The product record will still remain in the database."}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-sm font-medium">{product.name}</p>
              <p className="text-xs text-muted-foreground">
                SKU: {product.sku || "-"} • Part No: {product.partNumber || "-"}
              </p>
            </div>

            {deleteError && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                type="button"
                onClick={handleArchiveProduct}
                disabled={isDeleting}
              >
                {isDeleting
                  ? (isSundriesProduct ? "Deleting..." : "Removing...")
                  : (isSundriesProduct ? "Delete Permanently" : "Remove Product")}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ProductModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        mode="edit"
        product={editProductInitialData}
        categories={categories}
        manufacturers={manufacturers}
        suppliers={suppliers}
        variantId={routeState?.variantId || null}
        categoryId={
          routeState?.categoryId ||
          (product.categoryId ? String(product.categoryId) : null)
        }
        onSaved={async () => {
          setIsEditOpen(false);
          await loadProduct();

          showToast(
            "success",
            "Product updated",
            `${product.name} was updated successfully.`
          );
        }}
        onError={(message: string) => {
          showToast(
            "error",
            "Unable to update product",
            message || "Failed to update product. Please try again."
          );
        }}
      />

      <SpolProductModal
        open={isSpolEditOpen}
        onOpenChange={setIsSpolEditOpen}
        mode="edit"
        product={product}
        categories={categories}
        manufacturers={manufacturers}
        suppliers={suppliers}
        onSaved={async () => {
          setIsSpolEditOpen(false);
          await loadProduct();
          showToast(
            "success",
            "Product updated",
            `${product.name} was updated successfully.`
          );
        }}
        onError={(message: string) => {
          showToast(
            "error",
            "Unable to update product",
            message || "Failed to update product. Please try again."
          );
        }}
      />

      <AddProductSupplierModal
        open={isAddSupplierOpen}
        onOpenChange={setIsAddSupplierOpen}
        productId={product.id}
        suppliers={suppliers}
        existingSupplierIds={product?.suppliers?.map((s: any) => s.supplier_id || s.id) || []}
        onSaved={async () => {
          await loadProduct();
        }}
      />

      <AddVehicleCompatibility
        open={isAddVehicleOpen}
        onOpenChange={setIsAddVehicleOpen}
        productId={product.id}
        onSaved={async () => {
          await loadProduct();
          await loadEquivalentGroups(product.id);
        }}
      />

      {/* Remove Supplier Confirmation */}
      <AlertDialog open={!!confirmRemoveSupplierId} onOpenChange={(open) => !open && setConfirmRemoveSupplierId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this supplier from the product?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmRemoveSupplierId) void handleRemoveSupplier(confirmRemoveSupplierId);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Vehicle Compatibility Confirmation */}
      <AlertDialog open={!!confirmRemoveVehicleId} onOpenChange={(open) => !open && setConfirmRemoveVehicleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Vehicle Compatibility</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this vehicle compatibility?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmRemoveVehicleId) void handleRemoveVehicleCompatibility(confirmRemoveVehicleId);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Equivalent Product Confirmation */}
      <AlertDialog open={!!confirmRemoveEquivalent} onOpenChange={(open) => !open && setConfirmRemoveEquivalent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Equivalent Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this equivalent product from the group?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmRemoveEquivalent) void handleRemoveEquivalent(confirmRemoveEquivalent.groupId, confirmRemoveEquivalent.equivalentProductId);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductDetail;
