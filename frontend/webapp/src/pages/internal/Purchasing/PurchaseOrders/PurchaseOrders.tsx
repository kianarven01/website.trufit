import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import NewPurchaseOrderModal from "@/components/purchasing/NewPurchaseOrderModal";
import PurchaseStatusBadge from "@/components/purchasing/PurchaseStatusBadge";
import PurchasingToast, { PurchasingToastType } from "@/components/purchasing/PurchasingToast";
import { formatCurrency, formatDate, getCleanApiError, getRows, normalizeStatus } from "@/components/purchasing/purchasingUtils";

interface PurchaseOrderRow {
  id: string;
  poNumber: string;
  supplierName: string;
  orderDate: string | null;
  expectedDelivery: string | null;
  totalAmount: number;
  status: string;
}

const filterTabs = [
  { label: "All", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Approved", value: "APPROVED" },
  { label: "Partially Received", value: "PARTIALLY_RECEIVED" },
  { label: "Received", value: "RECEIVED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const normalizePurchaseOrder = (row: any): PurchaseOrderRow => ({
  id: String(row.id ?? ""),
  poNumber: String(row.po_number ?? row.poNumber ?? row.id ?? "-"),
  supplierName: String(
    row.supplier?.name ??
      row.supplier?.CompanyName ??
      row.supplier_name ??
      row.supplierName ??
      "-"
  ),
  orderDate: row.order_date ?? row.orderDate ?? row.created_at ?? null,
  expectedDelivery: row.request_ship_date ?? row.expected_delivery_date ?? row.eta ?? null,
  totalAmount: Number(row.total_amount ?? row.totalAmount ?? row.total ?? 0),
  status: normalizeStatus(row.status),
});

const PurchaseOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<PurchaseOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toast, setToast] = useState<{
    type: PurchasingToastType;
    title: string;
    message: string;
  } | null>(null);

  const showToast = (type: PurchasingToastType, title: string, message: string) => {
    setToast({ type, title, message });
  };

  const loadPurchaseOrders = async () => {
    setLoading(true);

    try {
      const response = await api.get("/purchasing/purchase-orders");
      const rows = getRows(response.data, ["purchase_orders", "purchaseOrders"]);
      setOrders(rows.map(normalizePurchaseOrder).filter((order) => order.id));
    } catch (error: any) {
      console.error(error);
      showToast("error", "Unable to load purchase orders", getCleanApiError(error, "Failed to load purchase orders."));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPurchaseOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = activeFilter === "ALL" || normalizeStatus(order.status) === activeFilter;
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        `${order.poNumber} ${order.supplierName} ${order.status}`.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [orders, activeFilter, search]);

  const runPoAction = async (order: PurchaseOrderRow, action: "submit" | "approve" | "cancel") => {
    const labels = {
      submit: "submitted",
      approve: "approved",
      cancel: "cancelled",
    };

    try {
      await api.post(`/purchasing/purchase-orders/${order.id}/${action}`);
      showToast("success", "Purchase order updated", `${order.poNumber} was ${labels[action]} successfully.`);
      await loadPurchaseOrders();
    } catch (error: any) {
      console.error(error);
      showToast("error", "Unable to update purchase order", getCleanApiError(error, "Failed to update purchase order."));
    }
  };

  const renderActions = (order: PurchaseOrderRow) => {
    const status = normalizeStatus(order.status);

    return (
      <div className="flex flex-wrap items-center gap-2" onClick={(event) => event.stopPropagation()}>
        {status === "DRAFT" && (
          <>
            <button className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20" onClick={() => runPoAction(order, "submit")}>
              Submit
            </button>
            <button className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20" onClick={() => runPoAction(order, "cancel")}>
              Cancel
            </button>
          </>
        )}

        {status === "SUBMITTED" && (
          <>
            <button className="rounded-md border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/20" onClick={() => runPoAction(order, "approve")}>
              Approve
            </button>
            <button className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20" onClick={() => runPoAction(order, "cancel")}>
              Cancel
            </button>
          </>
        )}

        {status === "APPROVED" && (
          <button className="rounded-md border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-900/20" onClick={() => navigate(`/webapp/purchasing/purchase-orders/${order.id}`)}>
            Create Receipt
          </button>
        )}

        {status === "PARTIALLY_RECEIVED" && (
          <button className="rounded-md border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-900/20" onClick={() => navigate(`/webapp/purchasing/purchase-orders/${order.id}`)}>
            Create Receipt
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-full bg-background px-5 py-5 text-foreground">
      {toast && (
        <PurchasingToast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={4000}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">{orders.length} total orders</p>
        </div>

        <button
          type="button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus size={17} /> New PO
        </button>
      </div>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                activeFilter === tab.value
                  ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
              onClick={() => setActiveFilter(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring lg:w-80"
          placeholder="Search PO number or supplier..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">PO Number</th>
              <th className="px-4 py-3 text-left font-semibold">Supplier</th>
              <th className="px-4 py-3 text-left font-semibold">Date</th>
              <th className="px-4 py-3 text-right font-semibold">Total</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-8 text-center text-muted-foreground" colSpan={6}>
                  Loading purchase orders...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-muted-foreground" colSpan={6}>
                  No purchase orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="cursor-pointer border-t border-border/60 hover:bg-muted/40"
                  onClick={() => navigate(`/webapp/purchasing/purchase-orders/${order.id}`)}
                >
                  <td className="px-4 py-3 font-medium">{order.poNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{order.supplierName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(order.orderDate)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-4 py-3"><PurchaseStatusBadge status={order.status} /></td>
                  <td className="px-4 py-3">{renderActions(order)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <NewPurchaseOrderModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSaved={async () => {
          showToast("success", "Purchase order created", "The purchase order was saved as draft.");
          await loadPurchaseOrders();
        }}
        onError={(message) => showToast("error", "Unable to save purchase order", message)}
      />
    </div>
  );
};

export default PurchaseOrders;
