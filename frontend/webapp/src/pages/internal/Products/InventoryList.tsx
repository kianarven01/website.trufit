import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/DashboardLayout";
import DataToolbar from "@/components/DataToolbar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { ImageIcon, Ellipsis, Plus, SlidersHorizontal, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import api from "@/api/axios";
import AppToast, { AppToastType } from "@/components/ui/AppToast";
import { formatPeso, toNumberOrNull } from "@/lib/format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StockMovementTypeBadge from "@/components/purchasing/StockMovementTypeBadge";
import { format } from "date-fns";

/* ================= TYPES ================= */
interface InventoryItem {
  id: string;
  productId: string;
  image?: string;
  name: string;
  brand: string;
  sku: string;
  partNumber: string;
  unit: string;
  stock: number;
  reservedQuantity: number;
  reorderLevel: number;
  reorderQty: number;
  sellingPrice: number | null;
  statusValue: string;
  isArchived: boolean;
  categoryIsSpol: boolean;
  locationId: string | null;
  binId: string | null;
  binName: string | null;
}

interface SundriesMovement {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  product_brand: string;
  quantity: number;
  notes: string | null;
  created_by: string | null;
  created_at: string | null;
}

interface SundriesProduct {
  id: string;
  name: string;
  stock: number;
}


/* ================= COMPONENT ================= */
const Inventory: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"inventory" | "sundries">("inventory");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({ archived: "false" });
  const [imgError, setImgError] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    type: AppToastType;
    title: string;
    message: string;
  } | null>(null);

  // Adjust stock modal state
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustProductId, setAdjustProductId] = useState<string>("");
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReservedQty, setAdjustReservedQty] = useState<number>(0);
  const [adjustReorderLevel, setAdjustReorderLevel] = useState<number>(5);
  const [adjustReorderQty, setAdjustReorderQty] = useState<number>(10);
  const [isSavingAdjust, setIsSavingAdjust] = useState(false);
  const [adjustBinId, setAdjustBinId] = useState<string | null>(null);

  // Sundries state
  const [sundriesMovements, setSundriesMovements] = useState<SundriesMovement[]>([]);
  const [sundriesLoading, setSundriesLoading] = useState(false);
  const [sundriesSearch, setSundriesSearch] = useState("");
  const [isSundriesModalOpen, setIsSundriesModalOpen] = useState(false);
  const [sundriesProducts, setSundriesProducts] = useState<SundriesProduct[]>([]);
  const [sundriesProductId, setSundriesProductId] = useState<string>("");
  const [sundriesQty, setSundriesQty] = useState<number>(1);
  const [sundriesNotes, setSundriesNotes] = useState<string>("");
  const [isSavingSundries, setIsSavingSundries] = useState(false);
  const [reverseMovement, setReverseMovement] = useState<SundriesMovement | null>(null);
  const [sundriesDateFrom, setSundriesDateFrom] = useState<string>("");
  const [sundriesDateTo, setSundriesDateTo] = useState<string>("");
  const [showSundriesFilter, setShowSundriesFilter] = useState(false);

  const { page, setPage, pageSize, setPageSize, paginate } = usePagination(25);

  /* ================= LOAD ================= */
  const loadInventory = async () => {
    setLoading(true);

    try {
      const params: Record<string, string> = {};

      const archivedFilter = activeFilters.archived;
      if (archivedFilter === "true") {
        params.archived = "1";
      }

      const res = await api.get("/inventory", { params });

      const rows = Array.isArray(res.data?.data) ? res.data.data : res.data;

      const normalized: InventoryItem[] = (Array.isArray(rows) ? rows : []).map(
        (row: any) => {
          const product = row.product || {};

          const sellingPrice = toNumberOrNull(row.selling_price);

          return {
            id: String(row.product_id || product.id || ""),
            productId: String(row.product_id || product.id || ""),
            image:
              product.image_URL ||
              product.image ||
              product.image_path ||
              undefined,
            name: String(product.name || ""),
            brand:
              product.manufacturer_name ||
              product.manufacturer?.name ||
              "-",
            sku: String(product.SKU || product.sku || ""),
            partNumber: String(product.part_number || ""),
            unit:
              product.unit_abbreviation ||
              product.unitAbbreviation ||
              product.unit?.abbreviation ||
              product.Unit?.abbreviation ||
              product.unit_name ||
              product.unit ||
              "-",
            stock: Number(row.quantity_on_hand ?? 0),
            reservedQuantity: Number(row.reserved_quantity ?? 0),
            reorderLevel: Number(row.reorder_level ?? 5),
            reorderQty: Number(row.reorder_qty ?? 10),
            sellingPrice,
            statusValue: (() => {
              const rawStatus = String(row.status || "").toLowerCase();
              if (rawStatus === "low stock") return "low-stock";
              if (rawStatus === "out of stock") return "out-of-stock";
              if (rawStatus === "in stock") return "in-stock";
              return "in-stock";
            })(),
            isArchived: Boolean(row.is_archived),
            categoryIsSpol: Boolean(product.category?.is_spol || row.category_is_spol),
            locationId: row.location_id || null,
            binId: row.bin_id || null,
            binName: row.bin_name || row.bin?.name || null,
          };
        }
      );

      setItems(normalized);
    } catch (error) {
      console.error("Failed to load inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInventory();
  }, [activeFilters.archived]);

  useEffect(() => {
    setPage(1);
  }, [search, activeFilters, setPage]);

  /* ================= SUNDRIES ================= */
  const loadSundriesMovements = async () => {
    setSundriesLoading(true);
    try {
      const params: Record<string, string> = {};
      if (sundriesDateFrom) params.from = sundriesDateFrom;
      if (sundriesDateTo) params.to = sundriesDateTo;
      const res = await api.get("/inventory/sundries-movements", { params });
      const rows = Array.isArray(res.data?.data) ? res.data.data : [];
      setSundriesMovements(rows);
    } catch (error) {
      console.error("Failed to load sundries movements:", error);
    } finally {
      setSundriesLoading(false);
    }
  };

  const loadSundriesProducts = async () => {
    try {
      const res = await api.get("/inventory", { params: { archived: "false" } });
      const rows = Array.isArray(res.data?.data) ? res.data.data : [];
      const products: SundriesProduct[] = rows
        .filter((row: any) => row.product?.category_is_spol)
        .map((row: any) => ({
          id: String(row.product_id || row.product?.id || ""),
          name: String(row.product?.name || ""),
          stock: Number(row.quantity_on_hand ?? 0),
        }));
      setSundriesProducts(products);
    } catch (error) {
      console.error("Failed to load sundries products:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "sundries") {
      void loadSundriesMovements();
    } else {
      void loadInventory();
    }
  }, [activeTab, sundriesDateFrom, sundriesDateTo]);

  const filteredSundries = useMemo(() => {
    if (!sundriesSearch) return sundriesMovements;
    const q = sundriesSearch.toLowerCase();
    return sundriesMovements.filter(
      (m) =>
        m.product_name.toLowerCase().includes(q) ||
        m.notes?.toLowerCase().includes(q)
    );
  }, [sundriesMovements, sundriesSearch]);

  const handleOpenSundriesModal = async () => {
    await loadSundriesProducts();
    setSundriesProductId("");
    setSundriesQty(1);
    setSundriesNotes("");
    setIsSundriesModalOpen(true);
  };

  const handleSaveSundries = async () => {
    if (!sundriesProductId || sundriesQty < 1) return;
    setIsSavingSundries(true);
    try {
      await api.post("/inventory/deduct-sundries", {
        product_id: sundriesProductId,
        quantity: sundriesQty,
        notes: sundriesNotes || null,
      });
      await Promise.all([loadSundriesMovements(), loadInventory()]);
      setIsSundriesModalOpen(false);
      setToast({ type: "success", title: "Sundries Deducted", message: "Stock has been deducted for sundries usage." });
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to deduct sundries. Please try again.";
      setToast({ type: "error", title: "Deduction Failed", message: msg });
    } finally {
      setIsSavingSundries(false);
    }
  };

  const handleReverseSundries = async (movement: SundriesMovement) => {
    try {
      await api.post(`/inventory/sundries-movements/${movement.id}/reverse`);
      await Promise.all([loadSundriesMovements(), loadInventory()]);
      setToast({
        type: "success",
        title: "Deduction Reversed",
        message: `Successfully returned ${movement.quantity} units of "${movement.product_name}" to stock.`,
      });
    } catch (error: any) {
      console.error("Failed to reverse sundries deduction:", error);
      const msg = error?.response?.data?.message || "Failed to reverse deduction. Please try again.";
      setToast({ type: "error", title: "Reverse Failed", message: msg });
    }
    setReverseMovement(null);
  };

  /* ================= ADJUST STOCK ================= */
  const handleOpenAdjust = (item: InventoryItem) => {
    setAdjustProductId(item.productId);
    setAdjustQty(item.stock);
    setAdjustReservedQty(item.reservedQuantity);
    setAdjustReorderLevel(item.reorderLevel);
    setAdjustReorderQty(item.reorderQty);
    setAdjustBinId(item.binId);
    setIsAdjustOpen(true);
  };

  const handleSaveAdjust = async () => {
    if (!adjustProductId) return;

    setIsSavingAdjust(true);

    try {
      const adjustItem = items.find(i => i.productId === adjustProductId);
      await api.post("/inventory/adjust-stock", {
        product_id: adjustProductId,
        quantity_on_hand: adjustQty,
        reserved_quantity: adjustReservedQty,
        reorder_level: adjustReorderLevel,
        reorder_qty: adjustReorderQty,
        bin_id: adjustBinId,
        location_id: adjustItem?.locationId || null,
      });

      await loadInventory();
      setIsAdjustOpen(false);
      setToast({ type: "success", title: "Stock Adjusted", message: "Inventory stock has been updated." });
    } catch (error) {
      console.error("Failed to adjust stock:", error);
      setToast({ type: "error", title: "Adjust Failed", message: "Failed to adjust stock. Please try again." });
    } finally {
      setIsSavingAdjust(false);
    }
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  /* ================= FORCE DELETE ================= */
  const handleForceDelete = async (item: InventoryItem) => {
    try {
      await api.delete(`/products/${item.productId}/force`);
      await loadInventory();
      setToast({ type: "success", title: "Product Deleted", message: `"${item.name}" has been permanently deleted.` });
    } catch (error) {
      console.error("Failed to delete product:", error);
      setToast({ type: "error", title: "Delete Failed", message: "Failed to delete product. Please try again." });
    }
    setConfirmDeleteId(null);
  };

  /* ================= RESTORE ================= */
  const handleRestore = async (item: InventoryItem) => {
    try {
      await api.patch(`/products/${item.productId}/restore`);
      await loadInventory();
      setToast({ type: "success", title: "Product Restored", message: `"${item.name}" has been restored.` });
    } catch (error) {
      console.error("Failed to restore product:", error);
      setToast({ type: "error", title: "Restore Failed", message: "Failed to restore product. Please try again." });
    }
  };

  /* ================= FILTER ================= */
  const filtered = useMemo(() => items.filter((p) => {
    const matchesSearch = `${p.name} ${p.brand} ${p.sku} ${p.partNumber}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const statusFilter = activeFilters.status;
    const matchesStatus =
      !statusFilter || statusFilter === "all" || p.statusValue === statusFilter;

    const archivedFilter = activeFilters.archived;
    const matchesArchived =
      !archivedFilter ||
      archivedFilter === "all" ||
      archivedFilter === "true" ||
      (archivedFilter === "false" && !p.isArchived);

    return matchesSearch && matchesStatus && matchesArchived;
  }), [items, search, activeFilters]);

  const paginated = paginate(filtered);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 p-4 h-full w-full">
        {toast && (
          <AppToast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={4000}
            onClose={() => setToast(null)}
          />
        )}
        {/* toolbar */}
        {activeTab === "inventory" ? (
          <DataToolbar
            searchPlaceholder="Search inventory..."
            onSearch={setSearch}
            filters={[
              {
                key: "status",
                label: "Status",
                options: [
                  { label: "In Stock", value: "in-stock" },
                  { label: "Low Stock", value: "low-stock" },
                  { label: "Out of Stock", value: "out-of-stock" },
                ],
              },
              {
                key: "archived",
                label: "Archived",
                options: [
                  { label: "Show Archived", value: "true" },
                  { label: "Hide Archived", value: "false" },
                ],
              },
            ]}
            activeFilters={activeFilters}
            onFilterChange={(key, value) =>
              setActiveFilters((prev) => ({ ...prev, [key]: value }))
            }
          />
        ) : (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between gap-3">
              {/* SEARCH + FILTER */}
              <div className="flex items-center gap-2 w-full max-w-sm">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sundries usage..."
                    value={sundriesSearch}
                    onChange={(e) => setSundriesSearch(e.target.value)}
                    className="pl-9 bg-card"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowSundriesFilter(!showSundriesFilter)}
                  className="relative h-9 w-9"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {(sundriesDateFrom || sundriesDateTo) && (
                    <span className="absolute -top-1 -right-1">
                      <Badge className="h-4 min-w-[16px] px-1 text-[10px] font-semibold leading-none flex items-center justify-center rounded-full bg-primary text-primary-foreground">
                        {(sundriesDateFrom ? 1 : 0) + (sundriesDateTo ? 1 : 0)}
                      </Badge>
                    </span>
                  )}
                </Button>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleOpenSundriesModal}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-sm transition text-sm px-4 py-2"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Sundries Usage
                </Button>
              </div>
            </div>

            {/* FILTER PANEL */}
            {showSundriesFilter && (
              <div>
                <hr className="my-1" />
                <div className="flex items-center gap-3 text-sm">
                  <Label className="text-muted-foreground font-medium">From</Label>
                  <Input
                    type="date"
                    className="w-[160px] border border-border/80 rounded-lg bg-background text-foreground focus-visible:ring-blue-900"
                    value={sundriesDateFrom}
                    onChange={(e) => setSundriesDateFrom(e.target.value)}
                  />
                  <Label className="text-muted-foreground font-medium">To</Label>
                  <Input
                    type="date"
                    className="w-[160px] border border-border/80 rounded-lg bg-background text-foreground focus-visible:ring-blue-900"
                    value={sundriesDateTo}
                    onChange={(e) => setSundriesDateTo(e.target.value)}
                  />
                  {(sundriesDateFrom || sundriesDateTo) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setSundriesDateFrom(""); setSundriesDateTo(""); }}
                      className="h-8 gap-1 text-xs text-muted-foreground"
                    >
                      <X className="h-3 w-3" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* tabs */}
        <div className="flex items-center bg-card/60 backdrop-blur-md border border-border/40 rounded-xl p-1 w-fit gap-1 shadow-sm">
          <button
            onClick={() => setActiveTab("inventory")}
            className={cn(
              "px-4 py-1.5 text-xs font-semibold rounded-lg transition",
              activeTab === "inventory"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Inventory
          </button>
          <button
            onClick={() => setActiveTab("sundries")}
            className={cn(
              "px-4 py-1.5 text-xs font-semibold rounded-lg transition",
              activeTab === "sundries"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Sundries Usage
          </button>
        </div>

        {/* ================= TABLE ================= */}
        {activeTab === "inventory" ? (
          loading ? (
            <Card className="bg-card border border-border/40 shadow-sm backdrop-blur-md">
              <CardContent className="py-20 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-muted-foreground text-sm font-medium animate-pulse">
                  Loading inventory...
                </p>
              </CardContent>
            </Card>
          ) : filtered.length > 0 ? (
            <ScrollArea className="flex-1 h-0 border border-border/60 rounded-xl px-2 flex flex-col bg-background shadow-inner">
              <div className="flex-1 overflow-auto">
                <Table className="table-fixed w-full border-separate border-spacing-y-2">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="w-4/12 text-muted-foreground font-semibold">
                        Product
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold">
                        SKU
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold">
                        Part No.
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold">
                        Type
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold">
                        Price
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold">
                        Stock
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold">
                        Unit
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold">
                        Status
                      </TableHead>
                      <TableHead className="w-[8%] text-muted-foreground font-semibold" />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filtered.length > 0 &&
                      paginated.map((p) => {
                        const status =
                          p.statusValue === "out-of-stock"
                            ? { label: "Out of Stock", className: "bg-red-100/10 text-red-400 border border-red-500/20" }
                            : p.statusValue === "low-stock"
                            ? { label: "Low Stock", className: "bg-yellow-100/10 text-yellow-400 border border-yellow-500/20" }
                            : { label: "In Stock", className: "bg-green-100/10 text-green-400 border border-green-500/20" };

                        return (
                          <TableRow
                            key={p.id}
                            onClick={() =>
                              navigate(`/webapp/products/inventory/${p.id}`)
                            }
                            className={cn(
                              "cursor-pointer transition-all rounded-lg border border-border/60 bg-card shadow-sm hover:shadow-md",
                              "hover:bg-accent/30"
                            )}
                          >
                            {/* PRODUCT */}
                            <TableCell className="py-2">
                              <div className="flex items-center gap-3">
                                {p.image && !imgError[p.id] ? (
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    className="w-12 h-10 rounded-md object-cover border border-border/40"
                                    onError={() =>
                                      setImgError((prev) => ({
                                        ...prev,
                                        [p.id]: true,
                                      }))
                                    }
                                  />
                                ) : (
                                  <div className="w-12 h-10 flex items-center justify-center rounded-md border border-border/40 bg-muted/30">
                                    <ImageIcon className="w-5 h-5 text-muted-foreground/60" />
                                  </div>
                                )}

                                <div className="flex flex-col">
                                  <span className="font-medium text-foreground text-sm leading-tight">
                                    {p.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {p.brand}
                                  </span>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="text-foreground/80 text-sm">
                              {p.sku}
                            </TableCell>

                            <TableCell className="text-foreground/80 text-sm">
                              {p.partNumber}
                            </TableCell>

                            {/* TYPE */}
                            <TableCell>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.categoryIsSpol ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                                {p.categoryIsSpol ? "Supplies & Oils" : "Part"}
                              </span>
                            </TableCell>

                            {/* PRICE */}
                            <TableCell>
                              <span className="font-medium text-foreground text-sm">
                                {formatPeso(p.sellingPrice)}
                              </span>
                            </TableCell>

                            {/* STOCK */}
                            <TableCell>
                              <span className="font-semibold text-foreground text-sm">
                                {p.stock}
                              </span>
                            </TableCell>

                            <TableCell className="text-foreground/80 text-sm">
                              {p.unit}
                            </TableCell>

                            {/* STATUS */}
                            <TableCell>
                              <span
                                className={cn(
                                  "text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 w-fit",
                                  status.className
                                )}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                {status.label}
                              </span>
                            </TableCell>

                            <TableCell
                              className="text-right"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon_xs"
                                    className="hover:bg-accent/40"
                                  >
                                    <Ellipsis className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="bg-card border border-border/40 shadow-xl rounded-xl p-1 min-w-[120px]"
                                >
                                  {p.isArchived ? (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => handleRestore(p)}
                                        className="cursor-pointer font-medium text-xs rounded-lg hover:bg-accent/40 px-3 py-2 transition"
                                      >
                                        Restore
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => setConfirmDeleteId(p.id)}
                                        className="cursor-pointer font-medium text-xs rounded-lg hover:bg-red-100 text-red-600 px-3 py-2 transition"
                                      >
                                        Delete Permanently
                                      </DropdownMenuItem>
                                    </>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={() => handleOpenAdjust(p)}
                                      className="cursor-pointer font-medium text-xs rounded-lg hover:bg-accent/40 px-3 py-2 transition"
                                    >
                                      Adjust Stock
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>

              {/* ================= PAGINATION ================= */}
              {filtered.length > pageSize && (
                <div className="sticky bottom-0 bg-background z-10 py-2 border-t border-border/40">
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
            <Card className="bg-card border border-border/40 shadow-sm backdrop-blur-md">
              <CardContent className="py-20 flex flex-col items-center text-center">
                <ImageIcon className="h-8 w-8 mb-2 text-muted-foreground/60" />
                <p className="text-sm font-semibold text-foreground">
                  No inventory available
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add suppliers to products to create inventory rows
                </p>
              </CardContent>
            </Card>
          )
        ) : (
          /* ================= SUNDRIES USAGE TABLE ================= */
          sundriesLoading ? (
            <Card className="bg-card border border-border/40 shadow-sm backdrop-blur-md">
              <CardContent className="py-20 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-muted-foreground text-sm font-medium animate-pulse">
                  Loading sundries usage...
                </p>
              </CardContent>
            </Card>
          ) : filteredSundries.length > 0 ? (
            <ScrollArea className="flex-1 h-0 border border-border/60 rounded-xl px-2 flex flex-col bg-background shadow-inner">
              <div className="flex-1 overflow-auto">
                <Table className="table-fixed w-full border-separate border-spacing-y-2">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="text-muted-foreground font-semibold">
                        Date
                      </TableHead>
                      <TableHead className="w-4/12 text-muted-foreground font-semibold">
                        Product
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold">
                        Type
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold">
                        Qty Used
                      </TableHead>
                      <TableHead className="text-muted-foreground font-semibold">
                        Notes
                      </TableHead>
                      <TableHead className="w-[8%] text-muted-foreground font-semibold" />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredSundries.map((m) => (
                      <TableRow
                        key={m.id}
                        className="rounded-lg border border-border/60 bg-card shadow-sm hover:shadow-md hover:bg-accent/30 transition-all"
                      >
                        <TableCell className="text-foreground/80 text-sm">
                          {m.created_at
                            ? format(new Date(m.created_at), "MMM d, yyyy h:mm a")
                            : "-"}
                        </TableCell>

                        <TableCell className="py-2">
                          <div className="flex items-center gap-3">
                            {m.product_image ? (
                              <img
                                src={m.product_image}
                                alt={m.product_name}
                                className="w-10 h-8 rounded-md object-cover border border-border/40"
                              />
                            ) : (
                              <div className="w-10 h-8 flex items-center justify-center rounded-md border border-border/40 bg-muted/30">
                                <ImageIcon className="w-4 h-4 text-muted-foreground/60" />
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground text-sm leading-tight">
                                {m.product_name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {m.product_brand}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <StockMovementTypeBadge type="OUT_SUNDRIES" />
                        </TableCell>

                        <TableCell>
                          <span className="font-semibold text-foreground text-sm">
                            {m.quantity}
                          </span>
                        </TableCell>

                        <TableCell className="text-foreground/80 text-sm max-w-[200px] truncate">
                          {m.notes || "-"}
                        </TableCell>

                        <TableCell
                          className="text-right"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon_xs"
                                className="hover:bg-accent/40"
                              >
                                <Ellipsis className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-card border border-border/40 shadow-xl rounded-xl p-1 min-w-[120px]"
                            >
                              <DropdownMenuItem
                                onClick={() => setReverseMovement(m)}
                                className="cursor-pointer font-medium text-xs rounded-lg hover:bg-red-100 text-red-600 px-3 py-2 transition"
                              >
                                Reverse
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          ) : (
            <Card className="bg-card border border-border/40 shadow-sm backdrop-blur-md">
              <CardContent className="py-20 flex flex-col items-center text-center">
                <ImageIcon className="h-8 w-8 mb-2 text-muted-foreground/60" />
                <p className="text-sm font-semibold text-foreground">
                  No sundries usage recorded
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Click "Add Sundries Usage" to deduct items from inventory
                </p>
              </CardContent>
            </Card>
          )
        )}
      </div>

      {/* ================= ADJUST STOCK MODAL ================= */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="sm:max-w-[475px] bg-card border border-border/40 shadow-2xl rounded-2xl p-6 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
              Adjust Stock — {items.find(i => i.productId === adjustProductId)?.name ?? ""}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-5 py-4 text-sm">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="adjust-qty"
                className="text-right text-muted-foreground font-medium"
              >
                Stock Count
              </Label>
              <Input
                id="adjust-qty"
                type="number"
                min="0"
                className="col-span-3 border border-border/80 rounded-lg bg-background text-foreground focus-visible:ring-blue-900"
                value={adjustQty}
                onChange={(e) => {
                  const newQty = Math.max(0, parseInt(e.target.value) || 0);
                  setAdjustQty(newQty);
                  setAdjustReservedQty((prev) => Math.min(prev, newQty));
                }}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="adjust-reserved"
                className="text-right text-muted-foreground font-medium"
              >
                Reserved
              </Label>
              <Input
                id="adjust-reserved"
                type="number"
                min="0"
                max={adjustQty}
                className="col-span-3 border border-border/80 rounded-lg bg-background text-foreground focus-visible:ring-blue-900"
                value={adjustReservedQty}
                onChange={(e) =>
                  setAdjustReservedQty(
                    Math.max(0, Math.min(adjustQty, parseInt(e.target.value) || 0))
                  )
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="adjust-reorder-level"
                className="text-right text-muted-foreground font-medium"
              >
                Reorder Level
              </Label>
              <Input
                id="adjust-reorder-level"
                type="number"
                min="0"
                className="col-span-3 border border-border/80 rounded-lg bg-background text-foreground focus-visible:ring-blue-900"
                value={adjustReorderLevel}
                onChange={(e) =>
                  setAdjustReorderLevel(
                    Math.max(0, parseInt(e.target.value) || 0)
                  )
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="adjust-reorder-qty"
                className="text-right text-muted-foreground font-medium"
              >
                Reorder Qty
              </Label>
              <Input
                id="adjust-reorder-qty"
                type="number"
                min="0"
                className="col-span-3 border border-border/80 rounded-lg bg-background text-foreground focus-visible:ring-blue-900"
                value={adjustReorderQty}
                onChange={(e) =>
                  setAdjustReorderQty(
                    Math.max(0, parseInt(e.target.value) || 0)
                  )
                }
              />
            </div>
          </div>

          <DialogFooter className="gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsAdjustOpen(false)}
              disabled={isSavingAdjust}
              className="border-border/80 hover:bg-accent/40 text-sm px-4 py-2"
            >
              Cancel
            </Button>

            <Button
              onClick={handleSaveAdjust}
              disabled={isSavingAdjust || !adjustProductId}
              className="bg-blue-900 hover:bg-blue-800 text-white font-medium shadow-sm transition text-sm px-4 py-2"
            >
              {isSavingAdjust ? "Saving..." : "Save Adjustments"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================= SUNDRIES USAGE MODAL ================= */}
      <Dialog open={isSundriesModalOpen} onOpenChange={setIsSundriesModalOpen}>
        <DialogContent className="sm:max-w-[475px] bg-card border border-border/40 shadow-2xl rounded-2xl p-6 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
              Add Sundries Usage
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-5 py-4 text-sm">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-muted-foreground font-medium">
                Product
              </Label>
              <div className="col-span-3">
                <Select value={sundriesProductId} onValueChange={setSundriesProductId}>
                  <SelectTrigger className="border border-border/80 rounded-lg bg-background text-foreground focus:ring-blue-900">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border border-border/40 shadow-xl rounded-xl max-h-[300px] overflow-auto">
                    {sundriesProducts.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-sm">
                        {p.name} (Stock: {p.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="sundries-qty"
                className="text-right text-muted-foreground font-medium"
              >
                Quantity
              </Label>
              <Input
                id="sundries-qty"
                type="number"
                min="1"
                className="col-span-3 border border-border/80 rounded-lg bg-background text-foreground focus-visible:ring-blue-900"
                value={sundriesQty}
                onChange={(e) =>
                  setSundriesQty(Math.max(1, parseInt(e.target.value) || 1))
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="sundries-notes"
                className="text-right text-muted-foreground font-medium"
              >
                Notes
              </Label>
              <Input
                id="sundries-notes"
                placeholder="Optional: what was it used for?"
                className="col-span-3 border border-border/80 rounded-lg bg-background text-foreground focus-visible:ring-blue-900"
                value={sundriesNotes}
                onChange={(e) => setSundriesNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsSundriesModalOpen(false)}
              disabled={isSavingSundries}
              className="border-border/80 hover:bg-accent/40 text-sm px-4 py-2"
            >
              Cancel
            </Button>

            <Button
              onClick={handleSaveSundries}
              disabled={isSavingSundries || !sundriesProductId || sundriesQty < 1}
              className="bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-sm transition text-sm px-4 py-2"
            >
              {isSavingSundries ? "Saving..." : "Deduct Stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Force Delete Confirmation */}
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const item = items.find((i) => i.id === confirmDeleteId);
                if (item) void handleForceDelete(item);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reverse Deduction Confirmation */}
      <AlertDialog open={!!reverseMovement} onOpenChange={(open) => !open && setReverseMovement(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reverse Sundries Deduction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reverse the deduction of {reverseMovement?.quantity} units of "{reverseMovement?.product_name}"? This will return the quantity back to inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (reverseMovement) void handleReverseSundries(reverseMovement);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reverse Deduction
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Inventory;
