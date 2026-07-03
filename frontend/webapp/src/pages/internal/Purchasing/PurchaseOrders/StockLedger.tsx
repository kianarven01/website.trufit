import { useEffect, useMemo, useState } from "react";
import api from "@/api/axios";
import StockMovementTypeBadge from "@/components/purchasing/StockMovementTypeBadge";
import PurchasingToast, { PurchasingToastType } from "@/components/purchasing/PurchasingToast";
import { formatDate, getCleanApiError, getRows } from "@/components/purchasing/purchasingUtils";
import { TrendingUp, TrendingDown } from "lucide-react";

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

const movementFilters = ["ALL", "IN_RECEIPT", "OUT_SALES", "ADJ_SHRINKAGE", "ADJ_RETURN"];

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
    movementType === "ADJ_SHRINKAGE" ||
    movementType === "OUT_RETURN";

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
  const [toast, setToast] = useState<{
    type: PurchasingToastType;
    title: string;
    message: string;
  } | null>(null);

  const showToast = (type: PurchasingToastType, title: string, message: string) => {
    setToast({ type, title, message });
  };

  const loadStockMovements = async () => {
    setLoading(true);

    try {
      const response = await api.get("/purchasing/stock-movements");
      const rows = getRows(response.data, ["stock_movements", "stockMovements", "movements"]);
      setMovements(rows.map(normalizeStockMovement).filter((movement) => movement.id));
    } catch (error: any) {
      console.error(error);
      showToast("error", "Unable to load stock ledger", getCleanApiError(error, "Failed to load stock ledger."));
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStockMovements();
  }, []);

  const filteredMovements = useMemo(() => {
    const query = search.toLowerCase().trim();

    return movements.filter((movement) => {
      const matchesType = activeType === "ALL" || movement.movementType.toUpperCase() === activeType;
      const matchesSearch =
        !query ||
        `${movement.productName} ${movement.referenceType} ${movement.referenceId} ${movement.notes}`
          .toLowerCase()
          .includes(query);

      return matchesType && matchesSearch;
    });
  }, [movements, activeType, search]);

  return (
    <div className="min-h-full bg-background px-5 py-5 text-foreground">
      {toast && (
        <PurchasingToast type={toast.type} title={toast.title} message={toast.message} duration={4000} onClose={() => setToast(null)} />
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock Ledger</h1>
          <p className="mt-1 text-sm text-muted-foreground">Complete audit trail of all inventory movements</p>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <input
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring lg:w-80"
          placeholder="Search part or reference..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="flex flex-wrap gap-2">
          {movementFilters.map((type) => (
            <button
              key={type}
              type="button"
              className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                activeType === type
                  ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
              onClick={() => setActiveType(type)}
            >
              {type === "ALL" ? "All" : type}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Date</th>
              <th className="px-4 py-3 text-left font-semibold">Part</th>
              <th className="px-4 py-3 text-left font-semibold">Type</th>
              <th className="px-4 py-3 text-right font-semibold">Quantity</th>
              <th className="px-4 py-3 text-left font-semibold">Reference</th>
              <th className="px-4 py-3 text-left font-semibold">Notes</th>
              <th className="px-4 py-3 text-left font-semibold">By</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-8 text-center text-muted-foreground" colSpan={7}>Loading stock ledger...</td>
              </tr>
            ) : filteredMovements.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-muted-foreground" colSpan={7}>No stock movement records found.</td>
              </tr>
            ) : (
              filteredMovements.map((movement) => {
                const quantityDisplay = getQuantityDisplay(
                  movement.movementType.toUpperCase(),
                  Number(movement.quantity || 0)
                );

                return (
                  <tr key={movement.id} className="border-t border-border/60">
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(movement.date)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{movement.productName}</p>
                      {movement.supplierName !== "-" && <p className="text-xs text-muted-foreground">{movement.supplierName}</p>}
                    </td>
                    <td className="px-4 py-3"><StockMovementTypeBadge type={movement.movementType} /></td>
                    <td className="px-4 py-3">
                      <div
                        className={`ml-auto flex w-fit items-center justify-end gap-1 font-semibold ${
                          quantityDisplay.isOut
                            ? "text-red-700 dark:text-red-400"
                            : "text-green-700 dark:text-green-400"
                        }`}
                      >
                        {quantityDisplay.isOut ? (
                          <TrendingDown size={14} strokeWidth={2.4} />
                        ) : (
                          <TrendingUp size={14} strokeWidth={2.4} />
                        )}

                        <span>
                          {quantityDisplay.value > 0
                            ? `+${quantityDisplay.value}`
                            : quantityDisplay.value}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <p>{movement.referenceId}</p>
                      <p className="text-xs">{movement.referenceType}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{movement.notes || "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{movement.createdBy || "-"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockLedger;
