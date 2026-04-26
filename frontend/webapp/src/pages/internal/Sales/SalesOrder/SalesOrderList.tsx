import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
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

/* TYPES */
interface SalesOrderItem {
  id: string;
  itemName: string;
  image?: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface SalesOrder {
  id: string;
  customer: string;
  customerEmail: string;
  plateNo: string;
  status: "pending" | "approved" | "delivered";
  items: SalesOrderItem[];
}

const STORAGE_KEY = "sales_orders";

/* STATUS CONFIG */
const statusConfig = {
  pending: { variant: "secondary" as const, label: "Pending" },
  approved: { variant: "default" as const, label: "Approved" },
  delivered: { variant: "outline" as const, label: "Delivered" },
};

const SalesOrderList: React.FC = () => {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { page, setPage, pageSize, setPageSize, paginate } = usePagination(25);

  /* LOAD (NO DUMMY DATA) */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setOrders(JSON.parse(stored));
    } else {
      setOrders([]);
    }
  }, []);

  /* SAVE */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  /* SEARCH */
  const filtered = orders.filter((o) =>
    `${o.id} ${o.customer} ${o.plateNo} ${o.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const paginated = paginate(filtered);

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Sales Orders</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Toolbar */}
      <DataToolbar
        searchPlaceholder="Search sales orders..."
        onSearch={setSearch}
        onAdd={() => navigate("/webapp/sales-orders/create")}
        addLabel="Create Order"
      />

      {/* TABLE */}
      {orders.length > 0 ? (
        <ScrollArea className="flex-1 h-0 border rounded-xl px-2 flex flex-col">
          <div className="flex-1 overflow-auto">
            <Table className="table-fixed w-full border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <TableHead>SO #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Plate No.</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.length > 0 ? (
                  paginated.map((o) => {
                    const total = o.items.reduce(
                      (sum, item) => sum + item.amount,
                      0
                    );

                    const { variant, label } = statusConfig[o.status];

                    return (
                      <TableRow
                        key={o.id}
                        onClick={() =>
                          navigate(`/webapp/sales-orders/${o.id}`)
                        }
                        className={cn(
                          "cursor-pointer transition-all rounded-lg border border-border/60 bg-card shadow-sm hover:shadow-md",
                          "hover:bg-accent/30"
                        )}
                      >
                        <TableCell>{o.id}</TableCell>
                        <TableCell>{o.customer}</TableCell>
                        <TableCell>{o.plateNo}</TableCell>
                        <TableCell>{o.items.length}</TableCell>
                        <TableCell>₱ {total.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={variant}>{label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="py-16 flex flex-col items-center text-center">
                        <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          No sales orders found
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Try adjusting your search
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filtered.length > 25 && (
            <div className="sticky bottom-0 bg-background z-10">
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
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center">
            <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">
              No sales orders available
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