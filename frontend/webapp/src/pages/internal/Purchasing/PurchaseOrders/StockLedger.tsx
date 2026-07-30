import { useEffect, useState } from "react";
import api from "@/api/axios";
import StockMovementTypeBadge from "@/components/purchasing/StockMovementTypeBadge";
import PurchasingToast, { PurchasingToastType } from "@/components/purchasing/PurchasingToast";
import { formatDate, getCleanApiError, getRows } from "@/components/purchasing/purchasingUtils";
import { TrendingUp, TrendingDown, ImageIcon, ChevronDown, Check, X } from "lucide-react";
import { Pagination, usePagination } from "@/components/ui/pagination";
import DataToolbar from "@/components/DataToolbar";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StockMovementRow {
  id: string;
  date: string | null;
  productName: string;
  supplierName: string;
  movementType: string;
  quantity: number;
  referenceType: string;
  referenceId: string;
  notes?: string | null;
  createdBy?: string | null;
}

const movementFilters = [
  { value: "ALL", label: "All Types" },
  { value: "IN_RECEIPT", label: "In Receipt" },
  { value: "OUT_SALES", label: "Out - Sales" },
  { value: "OUT_SUNDRIES", label: "Out - Sundries" },
  { value: "ADJUSTMENT_IN", label: "Adjustment In" },
  { value: "ADJUSTMENT_OUT", label: "Adjustment Out" },
  { value: "RETURN", label: "Return" },
];

const normalizeStockMovement = (row: any): StockMovementRow => ({
  id: String(row.id ?? ""),
  date: row.created_at ?? row.createdAt ?? row.movement_date ?? null,
  productName: String(row.product?.name ?? row.product_name ?? row.productName ?? row.inventory?.product?.name ?? "-"),
  supplierName: String(row.product_supplier?.supplier?.name ?? row.productSupplier?.supplier?.name ?? row.supplier_name ?? "-"),
  movementType: String(row.movement_type ?? row.movementType ?? "-"),
  quantity: Number(row.quantity ?? 0),
  referenceType: String(row.reference_type ?? row.referenceType ?? "-"),
  referenceId: String(row.reference_id ?? row.referenceId ?? "-"),
  notes: row.notes ?? null,
  createdBy: row.created_by ?? row.createdBy ?? null,
});

const getQuantityDisplay = (movementType: string, quantity: number) => {
  const isOut =
    movementType === "OUT_SALES" ||
    movementType === "ADJUSTMENT_OUT" ||
    movementType === "OUT_SUNDRIES" ||
    movementType === "RETURN";

  const signedQuantity = isOut ? -Math.abs(quantity) : Math.abs(quantity);

  return {
    value: signedQuantity,
    isOut,
  };
};

const StockLedger = () => {
  const [movements, setMovements] = useState<StockMovementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("ALL");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [toast, setToast] = useState<{
    type: PurchasingToastType;
    title: string;
    message: string;
  } | null>(null);

  const { page, setPage, pageSize, setPageSize } = usePagination(25);
  const [totalItems, setTotalItems] = useState(0);

  const showToast = (type: PurchasingToastType, title: string, message: string) => {
    setToast({ type, title, message });
  };

  const loadStockMovements = async () => {
    setLoading(true);

    try {
      const response = await api.get("/purchasing/stock-movements", {
        params: {
          page,
          per_page: pageSize,
          search: search || undefined,
          type: activeType !== "ALL" ? activeType : undefined,
        },
      });
      const rows = getRows(response.data, ["stock_movements", "stockMovements", "movements"]);
      setMovements(rows.map(normalizeStockMovement).filter((movement) => movement.id));
      setTotalItems(response.data?.pagination?.total ?? rows.length);
    } catch (error: any) {
      console.error(error);
      showToast("error", "Unable to load stock ledger", getCleanApiError(error, "Failed to load stock ledger."));
      setMovements([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStockMovements();
  }, [page, pageSize, activeType, search]);

  const activeTypeLabel = movementFilters.find((f) => f.value === activeType)?.label || "All Types";

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden select-none bg-background text-foreground">
      {toast && (
        <PurchasingToast type={toast.type} title={toast.title} message={toast.message} duration={4000} onClose={() => setToast(null)} />
      )}

      {/* Toolbar with dropdown filter */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <DataToolbar
            searchPlaceholder="Search part or reference..."
            onSearch={(value) => { setSearch(value); setPage(1); }}
          />
        </div>

        {/* Type Filter Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
            className="gap-2 h-9"
          >
            {activeTypeLabel}
            <ChevronDown className={cn("h-4 w-4 transition-transform", showTypeDropdown && "rotate-180")} />
          </Button>

          {showTypeDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowTypeDropdown(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-52 bg-popover border border-border rounded-xl shadow-xl py-1 animate-in fade-in slide-in-from-top-2">
                {movementFilters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left",
                      activeType === filter.value
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-accent"
                    )}
                    onClick={() => {
                      setActiveType(filter.value);
                      setShowTypeDropdown(false);
                      setPage(1);
                    }}
                  >
                    <Check className={cn("h-4 w-4 shrink-0", activeType === filter.value ? "opacity-100" : "opacity-0")} />
                    {filter.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {activeType !== "ALL" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setActiveType("ALL"); setPage(1); }}
            className="gap-1 h-9 text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Table Container */}
      {loading ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl px-2 overflow-hidden bg-background">
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">
              Loading stock ledger...
            </p>
          </div>
        </div>
      ) : movements.length > 0 ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl overflow-hidden bg-background">
          <ScrollArea className="flex-1 px-3">
            <Table className="table-fixed w-full border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[15%]">Date</TableHead>
                  <TableHead className="w-[25%]">Part</TableHead>
                  <TableHead className="w-[15%]">Type</TableHead>
                  <TableHead className="w-[12%] text-right">Quantity</TableHead>
                  <TableHead className="w-[18%]">Reference</TableHead>
                  <TableHead className="w-[15%]">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => {
                  const quantityDisplay = getQuantityDisplay(
                    movement.movementType,
                    Number(movement.quantity || 0)
                  );

                  return (
                    <TableRow key={movement.id} className="border-t border-border/60">
                      <TableCell className="text-muted-foreground">{formatDate(movement.date)}</TableCell>
                      <TableCell>
                        <p className="font-semibold text-sm">{movement.productName}</p>
                        {movement.supplierName !== "-" && <p className="text-[11px] text-muted-foreground leading-none mt-0.5">{movement.supplierName}</p>}
                      </TableCell>
                      <TableCell><StockMovementTypeBadge type={movement.movementType} /></TableCell>
                      <TableCell>
                        <div
                          className={`flex items-center justify-end gap-1 font-semibold text-sm ${
                            quantityDisplay.isOut
                              ? "text-red-700 dark:text-red-400"
                              : "text-green-700 dark:text-green-400"
                          }`}
                        >
                          {quantityDisplay.isOut ? (
                            <TrendingDown size={14} />
                          ) : (
                            <TrendingUp size={14} />
                          )}
                          <span>
                            {quantityDisplay.value > 0
                              ? `+${quantityDisplay.value}`
                              : quantityDisplay.value}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <p className="font-medium text-sm text-foreground">{movement.referenceId}</p>
                        <p className="text-[11px] leading-none mt-0.5">{movement.referenceType}</p>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{movement.notes || "-"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>

          <div className="border-t mx-3">
            <Pagination
              totalItems={totalItems}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl px-2 overflow-hidden bg-background">
          <div className="py-16 flex flex-col items-center text-center">
            <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">No stock movement records found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockLedger;
