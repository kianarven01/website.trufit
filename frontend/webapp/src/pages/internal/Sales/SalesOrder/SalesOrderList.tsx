import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
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
import { ScrollArea } from "@/components/ui/scrollArea";
import { Badge } from "@/components/ui/badge";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { ImageIcon } from "lucide-react";

/* ================= STORAGE ================= */

const STORAGE_KEY = "salesOrders";

/* ================= TYPES ================= */

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  mobileNumber: string;
  landline?: string;
  email?: string;
  businessPhone?: string;
}

interface Vehicle {
  id: string;
  customerId: string;
  vehicleModelId: string;
  color: string;
  plateNo: string;
  engineNo: string;
  vin: string;
  registrationNo: string;
  sellingDealer: string;
}

interface SalesOrderPartLine {
  id: string;
  ProductId: string;
  name: string;
  sku: string;
  price: number;
  unit: string;
  quantity: number | "";
  amount: number;
}

interface SalesOrder {
  id: string;
  salesOrderNo: string;
  customer: Customer;
  vehicle?: Vehicle | null;
  mileage?: number;
  parts: SalesOrderPartLine[];
  subtotalParts: number;
  total: number;
  notes?: string;
  status: "issued" | "partially fulfilled" |"fulfilled" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

/* ================= COMPONENT ================= */

const SalesOrderList: React.FC = () => {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { page, setPage, pageSize, setPageSize, paginate } =
    usePagination(25);

  /* ================= LOAD ================= */

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        setOrders(parsed || []);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error(
        "Failed to load sales orders:",
        err
      );

      setOrders([]);
    }
  }, []);

  /* ================= SEARCH ================= */

  useEffect(() => {
    setPage(1);
  }, [search, setPage]);

  /* ================= FILTER ================= */

  const filtered = orders.filter((o) => {
    const customerName = `
      ${o.customer?.firstName || ""}
      ${o.customer?.lastName || ""}
    `;

    return `
      ${o.salesOrderNo || ""}
      ${customerName}
      ${o.vehicle?.plateNo || ""}
      ${o.status || ""}
    `
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const paginated = paginate(filtered);

  /* ================= UI ================= */

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden">
      <DataToolbar
        searchPlaceholder="Search sales orders..."
        onSearch={setSearch}
        onAdd={() =>
          navigate(
            "/webapp/sales/sales-orders/new-sales-order"
          )
        }
        addLabel="Create Order"
      />

      {orders.length > 0 ? (
        <div className="flex-1 flex flex-col border rounded-xl overflow-hidden">
          <ScrollArea className="flex-1 px-3">
            <Table className="table-fixed w-full border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <TableHead>SO #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Plate No.</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-center">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.length > 0 ? (
                  paginated.map((o) => {
                    const partsCount =
                      o.parts?.length || 0;

                    const total = Number(
                      o.total || 0
                    );

                    return (
                      <TableRow
                        key={o.id}
                        onClick={() =>
                          navigate(
                            `/webapp/sales/sales-orders/${o.id}`
                          )
                        }
                        className={cn(
                          "cursor-pointer bg-card border rounded-lg hover:bg-accent/30"
                        )}
                      >
                        {/* SO NUMBER */}
                        <TableCell className="font-medium">
                          {o.salesOrderNo}
                        </TableCell>

                        {/* DATE */}
                        <TableCell>
                          {o.createdAt
                            ? new Date(
                                o.createdAt
                              ).toLocaleDateString()
                            : "-"}
                        </TableCell>

                        {/* CUSTOMER */}
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {o.customer?.firstName}{" "}{o.customer?.lastName}
                            </span>

                            <span className="text-xs text-muted-foreground">
                              {
                                o.customer
                                  ?.mobileNumber
                              }
                            </span>
                          </div>
                        </TableCell>

                        {/* PLATE */}
                        <TableCell>
                          {o.vehicle?.plateNo ||
                            "-"}
                        </TableCell>

                        {/* ITEMS */}
                        <TableCell>
                          {partsCount}
                        </TableCell>

                        {/* TOTAL */}
                        <TableCell>
                          ₱{" "}
                          {total.toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </TableCell>

                        {/* STATUS */}
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              o.status ===
                              "fulfilled"
                                ? "approved"
                                : "secondary"
                            }
                            className="w-24 justify-center capitalize"
                          >
                            {o.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="py-16 flex flex-col items-center text-center">
                        <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />

                        <p className="text-sm font-medium">
                          No sales orders found
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Try adjusting your filters
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>

          {/* PAGINATION */}
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
            <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />

            <p className="text-sm font-medium">
              No sales order records available
            </p>

            <p className="text-xs text-muted-foreground">
              Create a sales order to get started
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SalesOrderList;