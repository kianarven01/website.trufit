import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import DataToolbar, { FilterOption } from "@/components/DataToolbar";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Receipt, MoreVertical, Eye, Archive, RotateCcw, Trash2 } from "lucide-react";
import api from "@/api/axios";
import { toast } from "sonner";
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

/* TYPES */
export interface BillingItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  amount: number;
  type: "service" | "part" | "supply";
}

export interface PaymentEntry {
  id: string;
  date: string;
  amount: number;
  method: string;
  referenceNumber?: string;
  type: "down" | "partial" | "full";
}

export interface BillingStatement {
  id: string;
  billNumber?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  customerLandline?: string;
  customerBusiness?: string;
  customerAddress: string;
  vehiclePlate: string;
  vehicleInfo: string;
  vehicleYear?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleVariant?: string;
  vehicleColor?: string;
  vehicleEngine?: string;
  vehicleVIN?: string;
  vehicleRegistration?: string;
  vehicleDealer?: string;
  vehicleMileage?: number;
  date: string;
  status: "Draft" | "Unpaid" | "Partially Paid" | "Paid" | "Cancelled";
  soid?: string;
  joid?: string;
  estimateNo?: string;
  items: BillingItem[];
  tax: number;
  total: number;
  discountType?: string | null;
  discountValue?: number;
  payments: PaymentEntry[];
  notes?: string;
}

const statusFilterOptions: FilterOption[] = [
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Draft", value: "Draft" },
      { label: "Unpaid", value: "Unpaid" },
      { label: "Partially Paid", value: "Partially Paid" },
      { label: "Paid", value: "Paid" },
      { label: "Cancelled", value: "Cancelled" },
    ],
  },
  {
    key: "archived",
    label: "Archived",
    options: [
      { label: "Show Archived", value: "true" },
    ],
  },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  Draft: {
    label: "Draft",
    className: "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  },
  Unpaid: {
    label: "Unpaid",
    className: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  },
  "Partially Paid": {
    label: "Partial",
    className: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  Paid: {
    label: "Paid",
    className: "border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
  Cancelled: {
    label: "Cancelled",
    className: "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300",
  },
};

const formatCurrency = (n: number) => `₱${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const mapBillingStatement = (b: any): BillingStatement => {
  const customer = b.customer || {};
  const vehicle = b.vehicle || {};
  const salesOrder = b.sales_order || b.salesOrder || {};
  const jobOrder = b.job_order || b.jobOrder || {};
  const payments = Array.isArray(b.payments) ? b.payments : [];

  return {
    id: b.id,
    billNumber: b.bill_number || "",
    customerId: String(customer.customer_id || ""),
    customerName: `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || "—",
    customerEmail: customer.email || "—",
    customerMobile: customer.mobile_number || "—",
    customerLandline: customer.landline || "—",
    customerBusiness: customer.business || "—",
    customerAddress: customer.address || "—",
    vehiclePlate: vehicle.plate_number || "—",
    vehicleInfo: `${vehicle.year_model || ""} ${vehicle.make || ""} ${vehicle.model || ""} ${vehicle.variant || ""}`.trim() || "—",
    vehicleYear: vehicle.year_model || "—",
    vehicleMake: vehicle.make || "—",
    vehicleModel: vehicle.model || "—",
    vehicleVariant: vehicle.variant || "—",
    vehicleColor: vehicle.color || "—",
    vehicleEngine: vehicle.engine_number || "—",
    vehicleVIN: vehicle.VIN || "—",
    vehicleRegistration: vehicle.registration_number || "—",
    vehicleMileage: Number(salesOrder.mileage) || Number(salesOrder.estimate?.mileage) || Number(vehicle.mileage) || 0,
    date: b.Date || new Date().toISOString(),
    status: b.status || "Unpaid",
    soid: salesOrder.so_number || b.SOID || "—",
    joid: jobOrder.jo_number || b.JOID || "—",
    items: [],
    tax: Number(b.tax) || 0,
    total: Number(b.Total) || 0,
    discountType: b.discount_type || null,
    discountValue: Number(b.discount_value) || 0,
    payments: payments.map((p: any) => ({
      id: p.id,
      date: p.Date || new Date().toISOString(),
      amount: Number(p.Amount) || 0,
      method: p.PaymentMethod || "Cash",
      referenceNumber: p.ReferenceNumber || undefined,
      type: p.Type || "partial"
    })),
    notes: b.notes || ""
  };
};

const BillingList: React.FC = () => {
  const [statements, setStatements] = useState<BillingStatement[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({
    status: "all",
    archived: "all",
  });
  const navigate = useNavigate();
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<BillingStatement | null>(null);

  const { page, setPage, pageSize, setPageSize } = usePagination(25);

  const fetchStatements = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        search: search || undefined,
        status: filters.status === "all" ? undefined : filters.status,
        archived: filters.archived === "true" ? "true" : undefined,
        page,
        per_page: pageSize
      };
      const res = await api.get("/billing-statements", { params });
      const data = res.data;
      const itemsList = Array.isArray(data.data) ? data.data : [];
      setStatements(itemsList.map(mapBillingStatement));
      setTotalItems(data.total || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load billing statements");
    } finally {
      setIsLoading(false);
    }
  }, [search, filters.status, filters.archived, page, pageSize]);

  useEffect(() => {
    fetchStatements();
  }, [fetchStatements]);

  useEffect(() => {
    setPage(1);
  }, [search, filters.status, filters.archived, setPage]);

  const isArchivedView = filters.archived === "true";

  const handleArchive = async (s: BillingStatement) => {
    try {
      await api.delete(`/billing-statements/${s.id}`);
      toast.success("Billing statement archived");
      fetchStatements();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to archive");
    }
  };

  const handleRestore = async (s: BillingStatement) => {
    try {
      await api.patch(`/billing-statements/${s.id}/restore`);
      toast.success("Billing statement restored");
      fetchStatements();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to restore");
    }
  };

  const handleForceDelete = async (s: BillingStatement) => {
    try {
      await api.delete(`/billing-statements/${s.id}/force`);
      toast.success("Billing statement permanently deleted");
      fetchStatements();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <>
      <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden">
        <DataToolbar
          searchPlaceholder="Search bills, customers..."
          onSearch={setSearch}
          filters={statusFilterOptions}
          activeFilters={filters}
          onFilterChange={(key, value) =>
            setFilters((prev) => ({ ...prev, [key]: value }))
          }
        />

        {isLoading ? (
          <div className="flex-1 flex flex-col border border-border/60 rounded-xl px-2 overflow-hidden bg-background">
            <div className="flex-1 flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium text-muted-foreground animate-pulse">
                Loading billing statements...
              </p>
            </div>
          </div>
        ) : statements.length > 0 ? (
          <div className="flex-1 flex flex-col border border-border/60 rounded-xl overflow-hidden bg-background">
            <ScrollArea className="flex-1 px-3">
              <Table className="table-fixed w-full border-separate border-spacing-y-2">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[18%] text-center">Bill ID</TableHead>
                    <TableHead className="w-[22%] text-center">Customer</TableHead>
                    <TableHead className="w-[18%] text-center">Date</TableHead>
                    <TableHead className="w-[18%] text-center">Total</TableHead>
                    <TableHead className="w-[14%] text-center">Status</TableHead>
                    <TableHead className="w-[10%] text-right pr-6"></TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {statements.map((s) => {
                    const paidAmount = s.payments.reduce((sum, p) => sum + p.amount, 0);
                    const discountAmount = s.discountType === 'fixed'
                      ? (s.discountValue ?? 0)
                      : s.discountType === 'percent'
                        ? Math.round(s.total * (s.discountValue ?? 0) / 100 * 100) / 100
                        : 0;
                    const effectiveTotal = s.total - discountAmount;

                    const config = statusConfig[s.status] || { label: s.status, className: "border-slate-300 bg-slate-100 text-slate-700" };

                    return (
                      <TableRow
                        key={s.id}
                        onClick={() => navigate(`/webapp/sales/billing/${s.id}`)}
                        className={cn(
                          "cursor-pointer transition-all rounded-lg border border-border/60 bg-card shadow-sm hover:shadow-md",
                          "hover:bg-accent/30"
                        )}
                      >
                        <TableCell className="py-2.5 text-left pl-8">
                          <span className="font-semibold text-sm font-mono">{s.billNumber || s.id.substring(0, 8).toUpperCase()}</span>
                        </TableCell>
                        <TableCell className="text-center font-medium">{s.customerName}</TableCell>
                        <TableCell className="text-center text-muted-foreground">{formatDate(s.date)}</TableCell>
                        <TableCell className="text-center font-semibold text-foreground">
                          {formatCurrency(effectiveTotal)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <span className={`inline-flex w-fit items-center rounded-md border px-2.5 py-1 text-xs font-medium ${config.className}`}>
                              {config.label}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button type="button" className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors outline-none">
                                <MoreVertical size={16} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem onClick={() => navigate(`/webapp/sales/billing/${s.id}`)} className="cursor-pointer">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {isArchivedView ? (
                                <>
                                  <DropdownMenuItem onClick={() => handleRestore(s)} className="cursor-pointer">
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Restore
                                  </DropdownMenuItem>
                                  {s.status === "Cancelled" && (
                                    <DropdownMenuItem onClick={() => setConfirmDeleteTarget(s)} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete Permanently
                                    </DropdownMenuItem>
                                  )}
                                </>
                              ) : (
                                s.status === "Cancelled" && (
                                  <DropdownMenuItem onClick={() => handleArchive(s)} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                                    <Archive className="w-4 h-4 mr-2" />
                                    Archive Bill
                                  </DropdownMenuItem>
                                )
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>

            {totalItems > pageSize && (
              <div className="border-t mx-3">
                <Pagination
                  totalItems={totalItems}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col border border-border/60 rounded-xl px-2 overflow-hidden bg-background">
            <div className="py-16 flex flex-col items-center text-center">
              <Receipt className="h-6 w-6 mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">No billing statements found</p>
              <p className="text-xs text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          </div>
        )}
      </div>

      {/* CONFIRM PERMANENT DELETE */}
      <AlertDialog open={!!confirmDeleteTarget} onOpenChange={(open) => !open && setConfirmDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Permanently</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete this billing statement? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (confirmDeleteTarget) handleForceDelete(confirmDeleteTarget); setConfirmDeleteTarget(null); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BillingList;
