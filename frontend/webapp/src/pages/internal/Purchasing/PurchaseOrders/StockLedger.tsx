import { useEffect, useState } from "react";
import api from "@/api/axios";
import PurchasingToast, { PurchasingToastType } from "@/components/purchasing/PurchasingToast";
import { formatDate, getCleanApiError, getRows } from "@/components/purchasing/purchasingUtils";
import { Package, ChevronDown, Check, X } from "lucide-react";
import { Pagination, usePagination } from "@/components/ui/pagination";
import DataToolbar from "@/components/DataToolbar";
import { ScrollArea } from "@/components/ui/scrollArea";
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

  return { value: signedQuantity, isOut };
};

const formatReference = (refId: string, refType: string) => {
  if (refType === "SALES_ORDER" && refId.length > 8) {
    return { display: `SO-${refId.slice(0, 8)}...`, full: refId };
  }
  if (refType === "PURCHASE_ORDER" && refId.length > 8) {
    return { display: `PO-${refId.slice(0, 8)}...`, full: refId };
  }
  if (refType === "GOODS_RECEIPT" && refId.length > 8) {
    return { display: `GR-${refId.slice(0, 8)}...`, full: refId };
  }
  return { display: refId.length > 12 ? refId.slice(0, 12) + "..." : refId, full: refId };
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

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <DataToolbar
            searchPlaceholder="Search part or reference..."
            onSearch={(value) => { setSearch(value); setPage(1); }}
          />
        </div>

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

      {loading ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl px-2 overflow-hidden bg-background">
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading stock ledger...</p>
          </div>
        </div>
      ) : movements.length > 0 ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl overflow-hidden bg-background">
          <ScrollArea className="flex-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Part</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Qty</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Reference</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Notes</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement, idx) => {
                  const quantityDisplay = getQuantityDisplay(movement.movementType, Number(movement.quantity || 0));
                  const ref = formatReference(movement.referenceId, movement.referenceType);

                  return (
                    <tr
                      key={movement.id}
                      className={cn(
                        "border-b border-border/40 hover:bg-accent/30 transition-colors",
                        idx % 2 === 0 ? "bg-card/50" : "bg-background"
                      )}
                    >
                      <td className="py-3 px-4 text-muted-foreground text-xs whitespace-nowrap">{formatDate(movement.date)}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-sm">{movement.productName}</p>
                        {movement.supplierName !== "-" && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">{movement.supplierName}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm capitalize">{movement.movementType.replace(/_/g, " ").toLowerCase()}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={cn(
                            "font-semibold text-sm",
                            quantityDisplay.isOut ? "text-red-600" : "text-green-600"
                          )}
                        >
                          {quantityDisplay.isOut ? "" : "+"}{quantityDisplay.value}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {movement.notes && movement.notes.match(/SO-[\d-]+/) ? (
                          <p className="font-medium text-sm text-foreground">{movement.notes.match(/SO-[\d-]+/)?.[0]}</p>
                        ) : movement.notes && movement.notes.match(/PO-[\d-]+/) ? (
                          <p className="font-medium text-sm text-foreground">{movement.notes.match(/PO-[\d-]+/)?.[0]}</p>
                        ) : (
                          <p className="font-medium text-sm text-foreground" title={ref.full}>{ref.display}</p>
                        )}
                        <p className="text-[11px] text-muted-foreground mt-0.5">{movement.referenceType.replace(/_/g, " ")}</p>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground max-w-[150px] truncate">{movement.notes || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ScrollArea>

          <div className="border-t px-4">
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
            <Package className="h-8 w-8 mb-2 text-muted-foreground/50" />
            <p className="text-sm font-medium">No stock movement records found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockLedger;
