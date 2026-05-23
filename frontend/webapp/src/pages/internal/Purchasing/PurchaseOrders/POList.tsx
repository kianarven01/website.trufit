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
import { PurchaseOrderModal } from "@/components/popupModal/Purchasing/addPO";
import { ImageIcon } from "lucide-react";

/* TYPES */
interface PurchaseOrderItem {
  id: string;
  itemName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface PurchaseOrder {
  id: string;
  supplier: string;
  orderDate: string;
  requestedShipDate: string;
  eta?: string | null;
  status:
    | "for-approval"
    | "pending"
    | "approved"
    | "cancelled"
    | "in-transit"
    | "received"
    | "delivered";
  notes?: string;
  requestedBy: string;
  linkedSO?: string | null;
  linkedJO?: string | null;
  items: PurchaseOrderItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "purchase_orders";

/* DUMMY DATA */
const generateDummyOrders = (): PurchaseOrder[] => {
  return Array.from({ length: 26 }, (_, i) => {
    const items = Array.from(
      { length: Math.floor(Math.random() * 16) + 15 },
      (_, j) => {
        const qty = Math.floor(Math.random() * 10) + 1;
        const price = Math.floor(Math.random() * 2000) + 200;

        return {
          id: `item-${i}-${j}`,
          itemName: `Item ${j + 1}`,
          sku: `SKU-${i}${j}`,
          unitPrice: price,
          quantity: qty,
          amount: qty * price,
        };
      }
    );

    return {
      id: `po-${i + 1}`,
      supplier: `Supplier ${i + 1}`,
      orderDate: new Date().toISOString().split("T")[0],
      requestedShipDate: new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split("T")[0],
      eta:
        i % 2 === 0
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0]
          : null,
      status: [
        "for-approval",
        "pending",
        "approved",
        "in-transit",
        "received",
        "delivered",
        "cancelled",
      ][i % 7] as PurchaseOrder["status"],
      notes: i % 2 === 0 ? "Handle with care" : "",
      requestedBy: "Juan Dela Cruz",
      items,
      total: items.reduce((s, i) => s + i.amount, 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
};

/* STATUS CONFIG */
const statusConfig: Record<
  PurchaseOrder["status"],
  { variant: PurchaseOrder["status"]; label: string }
> = {
  "for-approval": { variant: "for-approval", label: "For Approval" },
  pending: { variant: "pending", label: "Pending" },
  approved: { variant: "approved", label: "Approved" },
  "in-transit": { variant: "in-transit", label: "In Transit" },
  received: { variant: "received", label: "Received" },
  cancelled: { variant: "cancelled", label: "Cancelled" },
  delivered: { variant: "delivered", label: "Delivered" },
};

const PurchaseOrderList: React.FC = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { page, setPage, pageSize, setPageSize, paginate } =
    usePagination(25);

  const [openModal, setOpenModal] = useState(false);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);

  /* LOAD */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored);

      if (!parsed.length) {
        const dummy = generateDummyOrders();
        setOrders(dummy);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dummy));
      } else {
        setOrders(parsed);
      }
    } else {
      const dummy = generateDummyOrders();
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

  /* SEARCH */
  const filtered = orders.filter((o) =>
    `${o.id} ${o.supplier} ${o.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const paginated = paginate(filtered);

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden">

      {/* Toolbar */}
      <DataToolbar
        searchPlaceholder="Search purchase orders..."
        onSearch={setSearch}
        onAdd={() => {
          setOpenModal(true);
          setEditingPO(null);
        }}
        addLabel="Create Order"
      />

      {/* TABLE + PAGINATION CONTAINER */}
      {orders.length > 0 ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl overflow-hidden bg-background">

          {/* Scrollable Table */}
          <ScrollArea className="flex-1 px-3">
            <Table className="table-fixed w-full border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.length > 0 ? (
                  paginated.map((o) => {
                    const { variant, label } = statusConfig[o.status];

                    return (
                      <TableRow
                        key={o.id}
                        onClick={() =>
                          navigate(
                            `/webapp/purchasing/purchase-orders/${o.id}`
                          )
                        }
                        className={cn(
                          "cursor-pointer transition-all rounded-lg border border-border/60 bg-card shadow-sm hover:shadow-md",
                          "hover:bg-accent/30"
                        )}
                      >
                        <TableCell>{o.supplier}</TableCell>
                        <TableCell>{o.orderDate}</TableCell>
                        <TableCell>{o.items.length}</TableCell>
                        <TableCell>
                          ₱ {o.total.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={variant}>{label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="py-16 flex flex-col items-center text-center">
                        <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          No purchase orders found
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
          </ScrollArea>

          {/* ✅ ALWAYS BOTTOM */}
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
              No purchase orders available
            </p>
            <p className="text-xs text-muted-foreground">
              Create a purchase order to get started
            </p>
          </CardContent>
        </Card>
      )}

      {/* MODAL */}
      <PurchaseOrderModal
        open={openModal}
        onOpenChange={setOpenModal}
        initialData={editingPO}
        onSave={(data) => {
          setOrders((prev) => {
            const exists = prev.find((p) => p.id === data.id);

            if (exists) {
              return prev.map((p) => (p.id === data.id ? data : p));
            }

            return [data, ...prev];
          });
        }}
      />
    </div>
  );
};

export default PurchaseOrderList;