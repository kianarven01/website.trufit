import { useEffect, useState, useMemo } from "react";
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
  status: "Draft" | "Pending" | "Partially Paid" | "Paid" | "Cancelled";
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

const STORAGE_KEY = "billing_statements";

/* Mock Generator if empty */
const generateMockBillingStatements = (): BillingStatement[] => {
  return [
    {
      id: "BILL-1001",
      customerId: "cust-1",
      customerName: "Juan Dela Cruz",
      customerEmail: "juan.delacruz@gmail.com",
      customerMobile: "09171234567",
      customerLandline: "—",
      customerBusiness: "—",
      customerAddress: "123 Mabini St, Manila",
      vehiclePlate: "ABC-1234",
      vehicleInfo: "2021 Toyota Vios 1.5G",
      vehicleYear: "2021",
      vehicleMake: "Toyota",
      vehicleModel: "Vios",
      vehicleVariant: "1.5G",
      vehicleColor: "Red",
      vehicleEngine: "1NZ-FE12345",
      vehicleVIN: "MRH53BT818728",
      vehicleRegistration: "REG-991823",
      vehicleDealer: "Toyota Manila Bay",
      vehicleMileage: 12000,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      status: "Paid",
      soid: "SO-1001",
      joid: "JO-1001",
      poid: "—",
      estimateNo: "EST-1001",
      items: [
        { id: "item-1", name: "Engine Oil Change Service", qty: 1, price: 800, amount: 800, type: "service" },
        { id: "item-2", name: "Fully Synthetic Engine Oil 4L", qty: 1, price: 2500, amount: 2500, type: "part" },
        { id: "item-3", name: "Oil Filter", qty: 1, price: 450, amount: 450, type: "part" }
      ],
      tax: 450,
      total: 4200,
      payments: [
        { id: "pay-1", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), amount: 4200, method: "GCash", referenceNumber: "REF9928172", type: "full" }
      ],
      notes: "Routine PMS done. Client paid via GCash."
    },
    {
      id: "BILL-1002",
      customerId: "cust-2",
      customerName: "Maria Santos",
      customerEmail: "maria.santos@yahoo.com",
      customerMobile: "09189876543",
      customerLandline: "—",
      customerBusiness: "—",
      customerAddress: "456 Rizal Ave, Pasay",
      vehiclePlate: "XYZ-9876",
      vehicleInfo: "2019 Mitsubishi Montero Sport",
      vehicleYear: "2019",
      vehicleMake: "Mitsubishi",
      vehicleModel: "Montero Sport",
      vehicleVariant: "GLS 2WD",
      vehicleColor: "Gray",
      vehicleEngine: "4N15-A1828",
      vehicleVIN: "MNT88A92819B",
      vehicleRegistration: "REG-18239A",
      vehicleDealer: "Mitsubishi Pasay",
      vehicleMileage: 28000,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      status: "Partially Paid",
      soid: "SO-1002",
      joid: "JO-1002",
      poid: "PO-1002",
      estimateNo: "EST-1002",
      items: [
        { id: "item-4", name: "Brake Pad Replacement Service", qty: 2, price: 1200, amount: 2400, type: "service" },
        { id: "item-5", name: "Front Brake Pads (Set)", qty: 1, price: 3800, amount: 3800, type: "part" },
        { id: "item-6", name: "Brake Fluid", qty: 2, price: 350, amount: 700, type: "supply" }
      ],
      tax: 828,
      total: 7728,
      payments: [
        { id: "pay-2", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), amount: 4000, method: "Cash", type: "partial" }
      ],
      notes: "Partially paid downpayment. Rest will be paid upon pickup."
    },
    {
      id: "BILL-1003",
      customerId: "cust-3",
      customerName: "Robert Lim",
      customerEmail: "rlim@corporation.com",
      customerMobile: "09223334444",
      customerLandline: "—",
      customerBusiness: "—",
      customerAddress: "789 Shaw Blvd, Mandaluyong",
      vehiclePlate: "NQR-5544",
      vehicleInfo: "2022 Honda Civic RS",
      vehicleYear: "2022",
      vehicleMake: "Honda",
      vehicleModel: "Civic",
      vehicleVariant: "RS Turbo",
      vehicleColor: "Blue",
      vehicleEngine: "L15B7-8827A",
      vehicleVIN: "HND77S928131",
      vehicleRegistration: "REG-91823A",
      vehicleDealer: "Honda Shaw",
      vehicleMileage: 5000,
      date: new Date().toISOString(),
      status: "Pending",
      soid: "SO-1003",
      joid: "JO-1003",
      poid: "—",
      estimateNo: "EST-1003",
      items: [
        { id: "item-7", name: "Wheel Alignment & Balancing", qty: 1, price: 1500, amount: 1500, type: "service" },
        { id: "item-8", name: "Wheel Weights", qty: 4, price: 100, amount: 400, type: "supply" }
      ],
      tax: 228,
      total: 2128,
      payments: [],
      notes: "Alignment done. Bill issued. Waiting for payment."
    }
  ];
};

const statusFilterOptions: FilterOption[] = [
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Draft", value: "Draft" },
      { label: "Pending", value: "Pending" },
      { label: "Partially Paid", value: "Partially Paid" },
      { label: "Paid", value: "Paid" },
      { label: "Cancelled", value: "Cancelled" },
    ],
  },
];

const BillingList: React.FC = () => {
  const [statements, setStatements] = useState<BillingStatement[]>([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({
    status: "all",
  });
  const navigate = useNavigate();

  const { page, setPage, pageSize, setPageSize, paginate } = usePagination(25);

  /* LOAD */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (!parsed.length) {
        const mock = generateMockBillingStatements();
        setStatements(mock);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mock));
      } else {
        setStatements(parsed);
      }
    } else {
      const mock = generateMockBillingStatements();
      setStatements(mock);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mock));
    }
  }, []);

  /* FILTER & SEARCH */
  const filtered = useMemo(() => {
    return statements.filter((s) => {
      const customerMatch = `${s.id} ${s.customerName} ${s.vehiclePlate} ${s.status} ${s.soid || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const statusMatch =
        filters.status === "all" || s.status === filters.status;

      return customerMatch && statusMatch;
    });
  }, [statements, search, filters]);

  const paginated = paginate(filtered);

  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  const getStatusBadge = (status: BillingStatement["status"]) => {
    switch (status) {
      case "Paid":
        return <Badge variant="approved">Paid</Badge>;
      case "Partially Paid":
        return <Badge variant="received">Partially Paid</Badge>;
      case "Pending":
        return <Badge variant="for-approval">Pending</Badge>;
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

      {statements.length > 0 ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl overflow-hidden bg-background">
          <ScrollArea className="flex-1 px-3">
            <Table className="table-fixed w-full min-w-[1000px] border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-[12%]">Bill ID</TableHead>
                  <TableHead className="text-center w-[12%]">Date</TableHead>
                  <TableHead className="text-center w-[20%]">Customer</TableHead>
                  <TableHead className="text-center w-[12%]">Plate Number</TableHead>
                  <TableHead className="text-center w-[12%]">Ref SO</TableHead>
                  <TableHead className="text-center w-[12%]">Total</TableHead>
                  <TableHead className="text-center w-[12%]">Paid / Balance</TableHead>
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
                          {s.id}
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
                    <TableCell colSpan={8}>
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

          {filtered.length > 25 && (
            <div className="border-t mx-3">
              <Pagination
                totalItems={filtered.length}
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
