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

/* TYPES */
interface Customer {
  name: string;
  email: string;
  mobile: string;
  address: string;
}

interface Vehicle {
  year: string;
  make: string;
  model: string;
  variant: string;
  plateNo: string;
  mileage: number;
}

interface Product {
  id: string;
  name: string;
  qty: number;
  price: number;
  amount: number;
}

interface Payment {
  id: string;
  date: string;
  amount: number;
  method: string;
}

interface SalesOrder {
  id: string;
  status: "pending" | "partial" | "paid";
  customer: Customer;
  vehicle: Vehicle;
  products: Product[];
  tax: number;
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "sales_orders";

/* DUMMY */
const generateDummySalesOrders = (): SalesOrder[] => {
  return Array.from({ length: 30 }, (_, i) => {
    const products = Array.from({ length: 3 }, (_, j) => {
      const qty = Math.floor(Math.random() * 5) + 1;
      const price = Math.floor(Math.random() * 3000) + 500;

      return {
        id: `prod-${i}-${j}`,
        name: `Product ${j + 1}`,
        qty,
        price,
        amount: qty * price,
      };
    });

    return {
      id: `SO-${1000 + i}`,
      status: ["pending", "partial", "paid"][i % 3] as "pending" | "partial" | "paid",
      customer: {
        name: `Customer ${i + 1}`,
        email: `customer${i + 1}@mail.com`,
        mobile: "09123456789",
        address: "Sample Address",
      },
      vehicle: {
        year: "2020",
        make: "Toyota",
        model: "Vios",
        variant: "G",
        plateNo: `ABC-${Math.floor(1000 + Math.random() * 9000)}`,
        mileage: 12000,
      },
      products,
      tax: 500,
      payments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
};

const SalesOrderList: React.FC = () => {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { page, setPage, pageSize, setPageSize, paginate } =
    usePagination(25);

  /* LOAD */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored);
      if (!parsed.length) {
        const dummy = generateDummySalesOrders();
        setOrders(dummy);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dummy));
      } else {
        setOrders(parsed);
      }
    } else {
      const dummy = generateDummySalesOrders();
      setOrders(dummy);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dummy));
    }
  }, []);

  /* SAVE */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  /* FILTER */
  const filtered = orders.filter((o) =>
    `${o.id} ${o.customer.name} ${o.vehicle.plateNo} ${o.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const paginated = paginate(filtered);

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden">
      <DataToolbar
        searchPlaceholder="Search sales orders..."
        onSearch={setSearch}
        onAdd={() => navigate("/webapp/sales/sales-orders/create")}
        addLabel="Create Order"
      />

      {orders.length > 0 ? (
        <div className="flex-1 flex flex-col border rounded-xl px-2 overflow-hidden">

          {/* Scrollable Table */}
          <ScrollArea className="flex-1">
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
                    const total =
                      o.products.reduce((s, p) => s + p.amount, 0) + o.tax;

                    return (
                      <TableRow
                        key={o.id}
                        onClick={() =>
                          navigate(`/webapp/sales/sales-orders/${o.id}`)
                        }
                        className={cn(
                          "cursor-pointer rounded-lg border shadow-sm hover:bg-accent/30"
                        )}
                      >
                        <TableCell>{o.id}</TableCell>
                        <TableCell>{o.customer.name}</TableCell>
                        <TableCell>{o.vehicle.plateNo}</TableCell>
                        <TableCell>{o.products.length}</TableCell>
                        <TableCell>₱ {total.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge>{o.status}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="py-16 text-center">
                        <ImageIcon className="mx-auto mb-2" />
                        No sales orders found
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>

          {/* Pagination */}
          {filtered.length > 25 && (
            <div className="border-t bg-background">
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
          <CardContent className="py-16 text-center">
            <ImageIcon className="mx-auto mb-2" />
            No sales orders available
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SalesOrderList;