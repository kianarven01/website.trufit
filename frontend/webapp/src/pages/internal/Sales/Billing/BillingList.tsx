import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
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
import { Badge } from "@/components/ui/badge";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { Receipt } from "lucide-react";
import api from "@/api/axios";
import { toast } from "sonner";
import TableSkeleton from "@/components/ui/TableSkeleton";

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
  poid?: string;
  estimateNo?: string;
  items: BillingItem[];
  tax: number;
  total: number;
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
];

const mapBillingStatement = (b: any): BillingStatement => {
  const customer = b.customer || {};
  const vehicle = b.vehicle || {};
  const salesOrder = b.salesOrder || {};
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
    vehicleMileage: Number(vehicle.mileage) || 0,
    date: b.Date || new Date().toISOString(),
    status: b.status || "Unpaid",
    soid: salesOrder.so_number || b.SOID || "—",
    joid: b.jobOrder?.jo_number || b.JOID || "—",
    items: [],
    tax: Number(b.tax) || 0,
    total: Number(b.Total) || 0,
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
  });
  const navigate = useNavigate();

  const { page, setPage, pageSize, setPageSize } = usePagination(25);

  const fetchStatements = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        search: search || undefined,
        status: filters.status === "all" ? undefined : filters.status,
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
  }, [search, filters.status, page, pageSize]);

  useEffect(() => {
    fetchStatements();
  }, [fetchStatements]);

  useEffect(() => {
    setPage(1);
  }, [search, filters.status, setPage]);

  const filtered = statements;
  const paginated = statements;

  const getStatusBadge = (status: BillingStatement["status"]) => {
    switch (status) {
      case "Paid":
        return <Badge variant="approved">Paid</Badge>;
      case "Partially Paid":
        return <Badge variant="received">Partially Paid</Badge>;
      case "Unpaid":
        return <Badge variant="for-approval">Unpaid</Badge>;
      case "Cancelled":
        return <Badge variant="cancelled">Cancelled</Badge>;
      default:
        return <Badge variant="default">Draft</Badge>;
    }
  };

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden">
      <DataToolbar
        searchPlaceholder="Search bills, customers, plate number..."
        onSearch={setSearch}
        filters={statusFilterOptions}
        activeFilters={filters}
        onFilterChange={(key, value) =>
          setFilters((prev) => ({ ...prev, [key]: value }))
        }
        onAdd={() => navigate("/webapp/sales/billing/create")}
        addLabel="Create Bill"
      />

      {isLoading ? (
        <div className="flex-1 flex flex-col justify-start py-4">
          <TableSkeleton
            columns={9}
            rows={8}
          />
        </div>
      ) : statements.length > 0 ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl overflow-hidden bg-background">
          <ScrollArea className="flex-1 px-3">
            <Table className="table-fixed w-full min-w-[1100px] border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-[11%]">Bill ID</TableHead>
                  <TableHead className="text-center w-[10%]">Date</TableHead>
                  <TableHead className="text-center w-[18%]">Customer</TableHead>
                  <TableHead className="text-center w-[10%]">Plate Number</TableHead>
                  <TableHead className="text-center w-[11%]">Ref SO</TableHead>
                  <TableHead className="text-center w-[11%]">Ref JO</TableHead>
                  <TableHead className="text-center w-[11%]">Total</TableHead>
                  <TableHead className="text-center w-[11%]">Paid / Balance</TableHead>
                  <TableHead className="text-center w-[10%]">Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.length > 0 ? (
                  paginated.map((s) => {
                    const paidAmount = s.payments.reduce((sum, p) => sum + p.amount, 0);
                    const balance = s.total - paidAmount;

                    return (
                      <TableRow
                        key={s.id}
                        onClick={() => navigate(`/webapp/sales/billing/${s.id}`)}
                        className={cn(
                          "cursor-pointer bg-card border rounded-lg hover:bg-accent/30 text-center"
                        )}
                      >
                        <TableCell className="font-mono font-bold text-center text-primary">
                          {s.billNumber || s.id.substring(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {new Date(s.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {s.customerName}
                        </TableCell>
                        <TableCell className="text-center">
                          {s.vehiclePlate ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                              {s.vehiclePlate}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center font-semibold text-muted-foreground">
                          {s.soid || "—"}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {s.joid && s.joid !== "—" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              {s.joid}
                            </span>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          ₱ {s.total.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center text-xs">
                          <div className="flex flex-col items-center">
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              Paid: ₱{paidAmount.toLocaleString()}
                            </span>
                            <span className="text-muted-foreground">
                              Due: ₱{Math.max(0, balance).toLocaleString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(s.status)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <div className="py-16 flex flex-col items-center text-center">
                        <Receipt className="h-8 w-8 mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">No billing records found</p>
                        <p className="text-xs text-muted-foreground">
                          Try adjusting your search query or filters
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
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
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center">
            <Receipt className="h-8 w-8 mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">No billing statements available</p>
            <p className="text-xs text-muted-foreground">
              Create a new bill to get started
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BillingList;
