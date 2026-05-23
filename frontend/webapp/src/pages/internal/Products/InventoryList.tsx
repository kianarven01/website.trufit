import { useEffect, useState } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

/* ================= TYPES ================= */
interface InventoryItem {
  id: string;
  image?: string;
  name: string;
  brand: string;
  sku: string;
  partNumber: string;
  unit: string;
  stock: number;
  sellPrice: number;
}

/* ================= STOCK STATUS ================= */
const getStockStatus = (stock: number) => {
  if (stock === 0) {
    return {
      label: "Out of Stock",
      value: "out-of-stock",
      className: "bg-red-100/10 text-red-400 border border-red-500/20",
    };
  }
  if (stock <= 5) {
    return {
      label: "Low Stock",
      value: "low-stock",
      className: "bg-yellow-100/10 text-yellow-400 border border-yellow-500/20",
    };
  }
  return {
    label: "In Stock",
    value: "in-stock",
    className: "bg-green-100/10 text-green-400 border border-green-500/20",
  };
};

/* ================= COMPONENT ================= */
const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [imgError, setImgError] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  // Adjust stock modal state
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState<InventoryItem | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustPrice, setAdjustPrice] = useState<number>(0);
  const [adjustProductId, setAdjustProductId] = useState<string>("");
  const [isSavingAdjust, setIsSavingAdjust] = useState(false);

  const { page, setPage, pageSize, setPageSize, paginate } = usePagination(25);

  /* ================= LOAD ================= */
  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products");
      const rows = Array.isArray(res.data?.data) ? res.data.data : res.data;
      const normalized: InventoryItem[] = (Array.isArray(rows) ? rows : []).map((row: any) => ({
        id: String(row.id),
        image: row.image_URL || row.image_path || undefined,
        name: String(row.name || ""),
        brand: row.manufacturer_name || "-",
        sku: String(row.SKU || row.sku || ""),
        partNumber: String(row.part_number || ""),
        unit: row.unit_name || row.unit || "pcs",
        stock: Number(row.quantity_on_hand ?? 0),
        sellPrice: Number(row.sell_price ?? 0),
      }));
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
    setPage(1);
  }, [search]);

  // Adjust stock handler
  const handleOpenAdjust = (item: InventoryItem) => {
    setSelectedProductForAdjust(item);
    setAdjustProductId(item.id);
    setAdjustQty(item.stock);
    setAdjustPrice(item.sellPrice);
    setIsAdjustOpen(true);
  };

  const handleOpenAdjustNew = () => {
    setSelectedProductForAdjust(null);
    setAdjustProductId(items[0]?.id || "");
    setAdjustQty(0);
    setAdjustPrice(items[0]?.sellPrice ?? 0);
    setIsAdjustOpen(true);
  };

  useEffect(() => {
    if (!selectedProductForAdjust && adjustProductId) {
      const prod = items.find((x) => x.id === adjustProductId);
      if (prod) {
        setAdjustQty(prod.stock);
        setAdjustPrice(prod.sellPrice);
      }
    }
  }, [adjustProductId, selectedProductForAdjust, items]);

  const handleSaveAdjust = async () => {
    if (!adjustProductId) return;
    setIsSavingAdjust(true);
    try {
      await api.post(`/products/${adjustProductId}/adjust-stock`, {
        quantity_on_hand: adjustQty,
        sell_price: adjustPrice,
      });
      await loadInventory();
      setIsAdjustOpen(false);
    } catch (error) {
      console.error("Failed to adjust stock:", error);
    } finally {
      setIsSavingAdjust(false);
    }
  };

  /* ================= FILTER ================= */
  const filtered = items.filter((p) =>
    `${p.name} ${p.brand} ${p.sku} ${p.partNumber}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

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
        />

        {/* ================= TABLE ================= */}
        {loading ? (
          <Card className="bg-card border border-border/40 shadow-sm backdrop-blur-md">
            <CardContent className="py-20 flex flex-col items-center justify-center">
              <p className="text-muted-foreground text-sm font-medium">Loading inventory...</p>
            </CardContent>
          </Card>
        ) : items.length > 0 ? (
          <ScrollArea className="flex-1 h-0 border border-border/60 rounded-xl px-2 flex flex-col bg-background shadow-inner">
            <div className="flex-1 overflow-auto">
              <Table className="table-fixed w-full border-separate border-spacing-y-2">
                
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="w-4/12 text-muted-foreground font-semibold">Product</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">SKU</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Part No.</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Stock</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Price</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Unit</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                    <TableHead className="w-[8%] text-muted-foreground font-semibold" />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filtered.length > 0 ? (
                    paginated.map((p) => {
                      const status = getStockStatus(p.stock);

                      return (
                        <TableRow
                          key={p.id}
                          className={cn(
                            "transition-all rounded-lg border border-border/60 bg-card shadow-sm hover:shadow-md",
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
                                <span className="font-medium text-foreground text-sm leading-tight">{p.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {p.brand}
                                </span>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="text-foreground/80 text-sm">{p.sku}</TableCell>
                          <TableCell className="text-foreground/80 text-sm">{p.partNumber}</TableCell>

                          {/* STOCK */}
                          <TableCell>
                            <span className="font-semibold text-foreground text-sm">{p.stock}</span>
                          </TableCell>

                          {/* PRICE */}
                          <TableCell>
                            <span className="font-medium text-foreground text-sm">₱{p.sellPrice.toFixed(2)}</span>
                          </TableCell>

                          <TableCell className="text-foreground/80 text-sm">{p.unit}</TableCell>

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
                            
                          <TableCell className="text-right">
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
                              <DropdownMenuContent align="end" className="bg-card border border-border/40 shadow-xl rounded-xl p-1 min-w-[120px]">
                                <DropdownMenuItem
                                  onClick={() => handleOpenAdjust(p)}
                                  className="cursor-pointer font-medium text-xs rounded-lg hover:bg-accent/40 px-3 py-2 transition"
                                >
                                  Adjust Stock
                                </DropdownMenuItem>
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
                Adjust stock to populate inventory items
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ================= ADJUST STOCK MODAL ================= */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border border-border/40 shadow-2xl rounded-2xl p-6 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
              Adjust Inventory Stock
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-4 text-sm">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="adjust-product" className="text-right text-muted-foreground font-medium">
                Product
              </Label>
              <select
                id="adjust-product"
                className="col-span-3 border border-border/80 rounded-lg px-3 py-2 bg-background text-foreground focus:ring-1 focus:ring-blue-900 transition text-sm"
                value={adjustProductId}
                onChange={(e) => setAdjustProductId(e.target.value)}
                disabled={!!selectedProductForAdjust}
              >
                {items.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name} ({prod.sku})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="adjust-qty" className="text-right text-muted-foreground font-medium">
                Stock Count
              </Label>
              <Input
                id="adjust-qty"
                type="number"
                min="0"
                className="col-span-3 border border-border/80 rounded-lg bg-background text-foreground focus-visible:ring-blue-900"
                value={adjustQty}
                onChange={(e) => setAdjustQty(Math.max(0, parseInt(e.target.value) || 0))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="adjust-price" className="text-right text-muted-foreground font-medium">
                Selling Price
              </Label>
              <Input
                id="adjust-price"
                type="number"
                min="0"
                step="0.01"
                className="col-span-3 border border-border/80 rounded-lg bg-background text-foreground focus-visible:ring-blue-900"
                value={adjustPrice}
                onChange={(e) => setAdjustPrice(Math.max(0, parseFloat(e.target.value) || 0))}
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