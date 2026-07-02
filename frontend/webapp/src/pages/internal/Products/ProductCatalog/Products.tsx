import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import DataToolbar, { FilterOption } from "@/components/DataToolbar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { ImageIcon } from "lucide-react";
import ProductModal from "@/components/popupModal/ProductCatalog/addProduct";
import api from "@/api/axios";
import AppToast, { AppToastType } from "@/components/ui/AppToast";

interface Product {
  id: string;
  image?: string;
  name: string;
  brand: string;
  manufacturer: string;
  supplier: string;
  sku: string;
  partNumber: string;
  unit: string;
  unitAbbreviation?: string | null;
  price: number;
  cost?: number;
  description?: string;
  barcode?: string;
  categoryId?: string | number | null;
  category?: string;
  supplierCode?: string;

  fitmentType?: "direct" | "equivalent" | "unfiltered";
  equivalentToProductId?: string | null;
  equivalentToProductName?: string | null;
  equivalenceNotes?: string | null;
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

interface VariantInfo {
  id: string;
  name: string;
}

const slugify = (str: string) =>
  str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

const fromSlug = (slug?: string) =>
  slug
    ?.split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ") || "";

const getRows = (payload: any): any[] => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload)) return payload;
  return [];
};

const toNumberOrZero = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getProductSellingPrice = (row: any): number => {
  const directPrice =
    row.selling_price ??
    row.price ??
    row.sell_price ??
    row.active_price?.Price ??
    row.active_price?.price ??
    row.activePrice?.Price ??
    row.activePrice?.price;

  if (directPrice !== null && directPrice !== undefined && directPrice !== "") {
    return toNumberOrZero(directPrice);
  }

  const suppliers = Array.isArray(row.suppliers)
    ? row.suppliers
    : Array.isArray(row.product_suppliers)
      ? row.product_suppliers
      : Array.isArray(row.productSuppliers)
        ? row.productSuppliers
        : [];

  const firstSupplierWithPrice = suppliers.find((supplier: any) => {
    const activePrice = supplier.active_price || supplier.activePrice;
    return (
      activePrice?.Price !== undefined ||
      activePrice?.price !== undefined ||
      supplier.price?.Price !== undefined ||
      supplier.price?.price !== undefined ||
      (supplier.price !== undefined && typeof supplier.price !== "object")
    );
  });

  if (!firstSupplierWithPrice) return 0;

  const activePrice =
    firstSupplierWithPrice.active_price ||
    firstSupplierWithPrice.activePrice ||
    (typeof firstSupplierWithPrice.price === "object"
      ? firstSupplierWithPrice.price
      : null);

  return toNumberOrZero(
    activePrice?.Price ??
      activePrice?.price ??
      firstSupplierWithPrice.price ??
      0
  );
};


const normalizeProduct = (row: any): Product => {
  const suppliers = Array.isArray(row.suppliers)
    ? row.suppliers
    : Array.isArray(row.product_suppliers)
      ? row.product_suppliers
      : Array.isArray(row.productSuppliers)
        ? row.productSuppliers
        : [];

  const firstSupplier = suppliers[0];

  return {
    id: String(row.id),
    image: row.image || row.image_URL || row.image_path || undefined,
    name: String(row.name || ""),
    brand:
      row.brand?.name ||
      row.Brand?.name ||
      row.brand_name ||
      row.manufacturer_name ||
      row.manufacturer ||
      "",
    manufacturer:
      row.manufacturer_name ||
      row.manufacturer ||
      row.manufacturer?.name ||
      row.Manufacturer?.name ||
      row.brand?.name ||
      row.Brand?.name ||
      row.brand_name ||
      "",
    supplier:
      row.supplier?.CompanyName ||
      row.Supplier?.CompanyName ||
      row.supplier_name ||
      row.supplier ||
      firstSupplier?.supplier?.CompanyName ||
      firstSupplier?.supplier?.name ||
      "",
    sku: String(row.SKU || row.sku || ""),
    partNumber: String(row.part_number || row.partNumber || ""),
    unit:
      row.unit?.name ||
      row.Unit?.name ||
      row.unit_name ||
      row.unit ||
      "",
    unitAbbreviation:
      row.unit?.abbreviation ||
      row.Unit?.abbreviation ||
      row.unit_abbreviation ||
      row.unitAbbreviation ||
      null,
    price: getProductSellingPrice(row),
    cost: toNumberOrZero(row.cost ?? firstSupplier?.supplier_cost ?? 0),
    description: row.description || "",
    barcode: row.barcode || "",
    categoryId: row.category_id ?? row.categoryId ?? null,
    category:
      row.category?.name || row.Category?.name || row.category_name || "",
    supplierCode:
      row.supplier_code ||
      row.supplier?.supplier_code ||
      row.Supplier?.supplier_code ||
      firstSupplier?.supplier?.supplier_code ||
      "",

    fitmentType: row.fitment_type || row.fitmentType || "unfiltered",
    equivalentToProductId:
      row.equivalent_to_product_id || row.equivalentToProductId || null,
    equivalentToProductName:
      row.equivalent_to_product_name || row.equivalentToProductName || null,
    equivalenceNotes: row.equivalence_notes || row.equivalenceNotes || null,
  };
};

const FitmentBadge = ({
  product,
}: {
  product: Product;
}) => {
  if (product.fitmentType === "direct") {
    return (
      <span className="w-fit rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">
        Direct fit
      </span>
    );
  }

  if (product.fitmentType === "equivalent") {
    return (
      <span className="w-fit rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700">
        {product.equivalentToProductName
          ? `Equivalent to ${product.equivalentToProductName}`
          : "Equivalent fit"}
      </span>
    );
  }

  return null;
};

const ProductsList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { vehicleSlug, variantSlug, categorySlug } = useParams<{
    vehicleSlug: string;
    variantSlug: string;
    categorySlug: string;
  }>();

  const isGeneralView = !vehicleSlug;

  const routeState = location.state as
    | {
        vehicleId?: string;
        vehicle?: { id: string; makeName: string; model: string };
        variantId?: string;
        variant?: VariantInfo;
        categoryId?: string;
        category?: CategoryOption;
        toast?: {
          type: AppToastType;
          title: string;
          message: string;
        };
      }
    | undefined;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [manufacturers, setManufacturers] = useState<SupplierOption[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [variants, setVariants] = useState<VariantInfo[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    type: AppToastType;
    title: string;
    message: string;
  } | null>(null);

  const [filtersState, setFiltersState] = useState<Record<string, string>>({
    manufacturer: "all",
    supplier: "all",
  });

  const [imgError, setImgError] = useState<Record<string, boolean>>({});
  const { page, setPage, pageSize, setPageSize, paginate } = usePagination(25);
  const [openModal, setOpenModal] = useState(false);

  const [resolvedVehicleId, setResolvedVehicleId] = useState<string | null>(
    routeState?.vehicleId || null
  );
  const [resolvedVariantId, setResolvedVariantId] = useState<string | null>(
    routeState?.variantId || null
  );
  const [resolvedCategoryId, setResolvedCategoryId] = useState<string | null>(
    routeState?.categoryId || null
  );

  useEffect(() => {
    if (!routeState?.toast) return;

    setToast(routeState.toast);

    const { toast: _toast, ...restState } = routeState;

    navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: Object.keys(restState).length > 0 ? restState : null,
    });
  }, [routeState?.toast, location.pathname, location.search, navigate]);

  const makeModel = vehicleSlug ? fromSlug(vehicleSlug) : "All Vehicles";
  const variantName = routeState?.variant?.name || (variantSlug ? fromSlug(variantSlug) : "All Variants");
  const categoryName =
    routeState?.category?.name || (categorySlug ? fromSlug(categorySlug) : "All Categories");

  const loadVehiclesAndResolveIds = async () => {
    const vehiclesRes = await api.get("/vehicles");
    const vehicleRows = getRows(vehiclesRes.data);

    const normalizedVehicles = (Array.isArray(vehicleRows) ? vehicleRows : []).map(
      (row: any) => ({
        id: String(row.id),
        makeName: String(
          row.makeName ||
            row.make ||
            row.make_name ||
            row.Manufacturer?.name ||
            row.manufacturer ||
            "Unknown"
        ),
        model: String(row.model || row.Model || ""),
      })
    );

    const matchedVehicle =
      routeState?.vehicle ||
      normalizedVehicles.find(
        (vehicle: any) =>
          `${slugify(vehicle.makeName)}-${slugify(vehicle.model)}` === vehicleSlug
      );

    const vehicleId = matchedVehicle?.id ? String(matchedVehicle.id) : null;
    setResolvedVehicleId(vehicleId);

    if (!vehicleId) {
      setResolvedVariantId(null);
      return;
    }

    const variantsRes = await api.get(`/vehicles/models/${vehicleId}/variants`);
    const variantRows = getRows(variantsRes.data);

    const normalizedVariants: VariantInfo[] = (Array.isArray(variantRows)
      ? variantRows
      : []
    ).map((row: any) => ({
      id: String(row.id),
      name: String(row.name || row.variant || row.variant_name || ""),
    }));

    setVariants(normalizedVariants);

    const matchedVariant =
      routeState?.variant ||
      normalizedVariants.find((variant) => slugify(variant.name) === variantSlug);

    setResolvedVariantId(matchedVariant?.id ? String(matchedVariant.id) : null);
  };

  const loadCategories = async () => {
    const res = await api.get("/products/categories");
    const rows = getRows(res.data);

    const normalized: CategoryOption[] = (Array.isArray(rows) ? rows : []).map(
      (row: any) => ({
        id: String(row.id),
        name: String(row.name),
        code: row.code || undefined,
      })
    );

    setCategories(normalized);

    const matchedCategory =
      routeState?.category ||
      normalized.find((category) => slugify(category.name) === categorySlug);

    setResolvedCategoryId(matchedCategory?.id ? String(matchedCategory.id) : null);
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
          name: String(row.name || row.CompanyName || ""),
        }))
      );
    } catch (error) {
      console.error("Failed to load suppliers:", error);
      setSuppliers([]);
    }
  };

  const loadProducts = async (
    vehicleId?: string | null,
    variantId?: string | null,
    categoryId?: string | null
  ) => {
    const params: Record<string, string> = {};

    if (vehicleId) params.vehicle_model_id = vehicleId;
    if (variantId) params.variant_id = variantId;
    if (categoryId) params.category_id = categoryId;

    const res = await api.get("/products", { params });
    const rows = getRows(res.data);
    setProducts((Array.isArray(rows) ? rows : []).map(normalizeProduct));
  };

  const loadPageData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCategories(),
        loadManufacturers(),
        loadSuppliers(),
        vehicleSlug ? loadVehiclesAndResolveIds() : Promise.resolve(),
      ]);
      if (isGeneralView) {
        await loadProducts(null, null, null);
      }
    } catch (error) {
      console.error("Failed initial load on products page:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPageData();
  }, [vehicleSlug, variantSlug, categorySlug]);

  useEffect(() => {
    if (isGeneralView) return;
    if (resolvedVehicleId === null && resolvedVariantId === null && resolvedCategoryId === null) {
      return;
    }

    void loadProducts(resolvedVehicleId, resolvedVariantId, resolvedCategoryId);
  }, [resolvedVehicleId, resolvedVariantId, resolvedCategoryId, isGeneralView]);

  useEffect(() => {
    setPage(1);
  }, [search, filtersState]);

  const manufacturerOptions = Array.from(
    new Set(products.map((product) => product.manufacturer).filter(Boolean))
  ).map((m) => ({ label: m, value: m }));

  const supplierOptions = Array.from(
    new Set(products.map((product) => product.supplier).filter(Boolean))
  ).map((s) => ({ label: s, value: s }));

  const filters: FilterOption[] = [
    {
      key: "manufacturer",
      label: "Manufacturer",
      options: manufacturerOptions,
    },
    {
      key: "supplier",
      label: "Supplier",
      options: supplierOptions,
    },
  ];

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = `${product.name} ${product.brand} ${product.sku} ${product.partNumber}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesManufacturer =
        filtersState.manufacturer === "all" ||
        product.manufacturer === filtersState.manufacturer;

      const matchesSupplier =
        filtersState.supplier === "all" ||
        product.supplier === filtersState.supplier;

      return matchesSearch && matchesManufacturer && matchesSupplier;
    });
  }, [products, search, filtersState]);

  const paginated = paginate(filtered);

  const refreshProducts = async () => {
    await loadProducts(resolvedVehicleId, resolvedVariantId, resolvedCategoryId);
  };

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden">
       {toast && (
        <AppToast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={4000}
          onClose={() => setToast(null)}
        />
      )}

      <DataToolbar
        searchPlaceholder={isGeneralView ? "Search all products..." : `Search ${categoryName} products...`}
        onSearch={setSearch}
        filters={filters}
        activeFilters={filtersState}
        onFilterChange={(key, value) =>
          setFiltersState((prev) => ({ ...prev, [key]: value }))
        }
        onAdd={() => setOpenModal(true)}
        addLabel="Add Product"
      />

      <div className="flex items-center bg-card/60 backdrop-blur-md border border-border/40 rounded-xl p-1 w-fit gap-1 shadow-sm">
        <button
          onClick={() => {
            if (!isGeneralView) {
              navigate("/webapp/products/product-catalog");
            }
          }}
          className={cn(
            "px-4 py-1.5 text-xs font-semibold rounded-lg transition",
            isGeneralView
              ? "bg-blue-900 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Browse All Products
        </button>
        <button
          onClick={() => navigate("/webapp/products/product-catalog/vehicles")}
          className={cn(
            "px-4 py-1.5 text-xs font-semibold rounded-lg transition",
            !isGeneralView
              ? "bg-blue-900 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Browse by Vehicle
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl px-2 overflow-hidden bg-background">
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">
              Loading products...
            </p>
          </div>
        </div>
      ) : products.length > 0 ? (
        <ScrollArea className="flex-1 h-0 border border-border/60 rounded-xl px-2 flex flex-col bg-background">
          <div className="flex-1 overflow-auto">
            <Table className="table-fixed w-full border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/6">Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Part Number</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Selling Price</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.length > 0 ? (
                  paginated.map((product) => (
                    <TableRow
                      key={product.id}
                      onClick={() => {
                        const path = isGeneralView
                          ? `/webapp/products/product-catalog/products/${product.id}`
                          : `/webapp/products/product-catalog/${vehicleSlug}/${variantSlug}/${categorySlug}/products/${product.id}`;
                        navigate(path, {
                          state: {
                            productId: product.id,
                            product,
                            vehicleId: resolvedVehicleId,
                            variantId: resolvedVariantId,
                            categoryId: resolvedCategoryId,
                            vehicleSlug,
                            variantSlug,
                            categorySlug,
                          },
                        });
                      }}
                      className={cn(
                        "cursor-pointer transition-all rounded-lg border border-border/60 bg-card shadow-sm hover:shadow-md",
                        "hover:bg-accent/30"
                      )}
                    >
                      <TableCell className="py-2">
                        <div className="flex items-center gap-3">
                          {product.image && !imgError[product.id] ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-10 rounded-md object-cover border"
                              onError={() =>
                                setImgError((prev) => ({
                                  ...prev,
                                  [product.id]: true,
                                }))
                              }
                            />
                          ) : (
                            <div className="w-12 h-10 flex items-center justify-center rounded-md border">
                              <ImageIcon className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}

                          <div className="flex flex-col gap-1">
                            <span className="font-medium">{product.name}</span>
                            <span className="text-[11px] text-muted-foreground leading-none">
                              {product.manufacturer || product.brand || "-"}
                            </span>
                            <FitmentBadge product={product} />
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>{product.sku || "-"}</TableCell>
                      <TableCell>{product.partNumber || "-"}</TableCell>
                      <TableCell>{product.unitAbbreviation || product.unit || "-"}</TableCell>
                      <TableCell>₱ {Number(product.price || 0).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="py-16 flex flex-col items-center text-center">
                        <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">No products found</p>
                        <p className="text-xs text-muted-foreground">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {filtered.length > 25 && (
            <div className="sticky bottom-0 bg-background z-10">
              <Pagination
                totalItems={filtered.length}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          )}
        </ScrollArea>
      ) : (
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center">
            <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">No products available</p>
            <p className="text-xs text-muted-foreground">
              Add a product to get started
            </p>
          </CardContent>
        </Card>
      )}

      <ProductModal
        open={openModal}
        onOpenChange={setOpenModal}
        categories={categories}
        manufacturers={manufacturers}
        suppliers={suppliers}
        variantId={resolvedVariantId}
        categoryId={resolvedCategoryId}
        onSaved={refreshProducts}
      />
    </div>
  );
};

export default ProductsList;