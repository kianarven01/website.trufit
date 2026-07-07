import { useEffect, useState } from "react";
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
import { ImageIcon, Ellipsis } from "lucide-react";
import api from "@/api/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

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

/* ================= COMPONENT ================= */
const Inventory: React.FC = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [imgError, setImgError] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  // Adjust stock modal state
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustProductId, setAdjustProductId] = useState<string>("");
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReservedQty, setAdjustReservedQty] = useState<number>(0);
  const [adjustReorderLevel, setAdjustReorderLevel] = useState<number>(5);
  const [adjustReorderQty, setAdjustReorderQty] = useState<number>(10);
  const [isSavingAdjust, setIsSavingAdjust] = useState(false);

  const { page, setPage, pageSize, setPageSize, paginate } = usePagination(25);

  /* ================= LOAD ================= */
  const loadInventory = async () => {
    setLoading(true);

    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;

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
            id: String(row.product_id),
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
            statusValue: row.status === "Low Stock" ? "low-stock" : row.status === "Out of Stock" ? "out-of-stock" : "in-stock",
            isArchived: Boolean(row.is_archived),
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
  }, []);

  useEffect(() => {
    void loadInventory();
  }, [activeFilters.archived]);

  useEffect(() => {
    setPage(1);
  }, [search, setPage]);

  /* ================= ADJUST STOCK ================= */
  const handleOpenAdjust = (item: InventoryItem) => {
    setAdjustProductId(item.productId);
    setAdjustQty(item.stock);
    setAdjustReservedQty(item.reservedQuantity);
    setAdjustReorderLevel(item.reorderLevel);
    setAdjustReorderQty(item.reorderQty);
    setIsAdjustOpen(true);
  };

  const handleOpenAdjustNew = () => {
    const firstItem = items[0];

    if (firstItem) {
      setAdjustProductId(firstItem.productId);
      setAdjustQty(firstItem.stock);
      setAdjustReservedQty(firstItem.reservedQuantity);
      setAdjustReorderLevel(firstItem.reorderLevel);
      setAdjustReorderQty(firstItem.reorderQty);
    } else {
      setAdjustProductId("");
      setAdjustQty(0);
      setAdjustReservedQty(0);
      setAdjustReorderLevel(5);
      setAdjustReorderQty(10);
    }

    setIsAdjustOpen(true);
  };

  const handleSaveAdjust = async () => {
    if (!adjustProductId) return;

    setIsSavingAdjust(true);

    try {
      await api.post("/inventory/adjust-stock", {
        product_id: adjustProductId,
        quantity_on_hand: adjustQty,
        reserved_quantity: adjustReservedQty,
        reorder_level: adjustReorderLevel,
        reorder_qty: adjustReorderQty,
      });

      await loadInventory();
      setIsAdjustOpen(false);
    } catch (error) {
      console.error("Failed to adjust stock:", error);
    } finally {
      setIsSavingAdjust(false);
    }
  };

  /* ================= FORCE DELETE ================= */
  const handleForceDelete = async (item: InventoryItem) => {
    if (!window.confirm(`Permanently delete "${item.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/products/${item.productId}/force`);
      await loadInventory();
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  /* ================= RESTORE ================= */
  const handleRestore = async (item: InventoryItem) => {
    try {
      await api.patch(`/products/${item.productId}/restore`);
      await loadInventory();
    } catch (error) {
      console.error("Failed to restore product:", error);
    }
  };

  /* ================= FILTER ================= */
  const filtered = items.filter((p) => {
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
  });

  const paginated = paginate(filtered);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 p-4 h-full w-full">
        {/* toolbar */}
        <DataToolbar
          searchPlaceholder="Search inventory..."
          onSearch={setSearch}
          onAdd={handleOpenAdjustNew}
          addLabel="Adjust Stock"
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

        {/* ================= TABLE ================= */}
        {loading ? (
          <Card className="bg-card border border-border/40 shadow-sm backdrop-blur-md">
            <CardContent className="py-20 flex flex-col items-center justify-center">
              <p className="text-muted-foreground text-sm font-medium">
                Loading inventory...
              </p>
            </CardContent>
          </Card>
        ) : items.length > 0 ? (
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
                  {filtered.length > 0 ? (
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
                                      onClick={() => handleForceDelete(p)}
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
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <div className="py-16 flex flex-col items-center text-center">
                          <ImageIcon className="h-8 w-8 mb-2 text-muted-foreground/60" />
                          <p className="text-sm font-semibold text-foreground">
                            No inventory found
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Try adjusting your search query
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* ================= PAGINATION ================= */}
            {filtered.length > 25 && (
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
        )}
      </div>

      {/* ================= ADJUST STOCK MODAL ================= */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="sm:max-w-[475px] bg-card border border-border/40 shadow-2xl rounded-2xl p-6 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
              Adjust Inventory Stock
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
                onChange={(e) =>
                  setAdjustQty(Math.max(0, parseInt(e.target.value) || 0))
                }
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
                className="col-span-3 border border-border/80 rounded-lg bg-background text-foreground focus-visible:ring-blue-900"
                value={adjustReservedQty}
                onChange={(e) =>
                  setAdjustReservedQty(
                    Math.max(0, parseInt(e.target.value) || 0)
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
    </DashboardLayout>
  );
};

export default Inventory;
