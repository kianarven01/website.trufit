import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, XCircle } from "lucide-react";
import DataToolbar from "@/components/DataToolbar";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { PurchaseOrderModal } from "@/components/popupModal/Purchasing/addPO";
import CancelPurchaseOrderDialog from "@/components/popupModal/AlertDialog/CancelPO";


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
  status: "for-approval" | "pending" | "approved" | "cancelled" | "in-transit" | "received" | "delivered";
  notes?: string;
  requestedBy: string;
  linkedSO?: string | null;
  linkedJO?: string | null;
  items: PurchaseOrderItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

/* STORAGE */
const STORAGE_KEY = "purchase_orders";

/* STATUS STYLE */
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


/* DUMMY DATA */
const generateDummyOrders = (): PurchaseOrder[] => {
  return Array.from({ length: 10 }, (_, i) => {
    const items: PurchaseOrderItem[] = Array.from({ length: 15 }, (_, j) => {
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
    });

    const now = new Date();
    const createdAt = new Date(
      now.getTime() - Math.random() * 5 * 86400000
    );
    const updatedAt = new Date(
      createdAt.getTime() + Math.random() * 3 * 86400000
    );

    return {
      id: `po-${i + 1}`,
      supplier: `Supplier ${i + 1}`,
      orderDate: now.toISOString().split("T")[0],
      requestedShipDate: new Date(
        now.getTime() + 3 * 86400000
      ).toISOString().split("T")[0],
      eta:
        i % 2 === 0
          ? new Date(now.getTime() + 7 * 86400000)
              .toISOString()
              .split("T")[0]
          : null,
      status: ["pending", "approved", "in-transit", "received", "cancelled"][
        i % 5
      ] as PurchaseOrder["status"],
      notes: i % 2 === 0 ? "Handle with care" : "",
      requestedBy: "Juan Dela Cruz",
      linkedSO: i % 3 === 0 ? `SO-${i + 100}` : null,
      linkedJO: i % 4 === 0 ? `JO-${i + 100}` : null,
      items,
      total: items.reduce((sum, i) => sum + i.amount, 0),
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
  });
};

const PurchaseOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);

  const { page, setPage, pageSize, setPageSize, paginate } =
    usePagination(10);



  /* SAFE DATA */
  const items = order?.items ?? [];

  const paginatedItems = paginate(items);

  const total = items.reduce((sum, i) => sum + i.amount, 0);

  /* LOAD DATA */
  useEffect(() => {
    let stored = localStorage.getItem(STORAGE_KEY);

    let parsed: PurchaseOrder[];

    if (!stored) {
      parsed = generateDummyOrders();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } else {
      parsed = JSON.parse(stored);
    }

    const found = parsed.find((o) => o.id === id) || null;
    setOrder(found);
  }, [id]);

  useEffect(() => {
    setPage(1);
  }, [pageSize, setPage]);

  const handleApprove = () => {
    if (!order) return;

    const updatedAt = new Date().toISOString();

    // update localStorage
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as PurchaseOrder[];
    const updated = stored.map((o) =>
      o.id === order.id
        ? { ...o, status: "approved", updatedAt }
        : o
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // update local state
    setOrder({ ...order, status: "approved", updatedAt });
  };


  const formatDateOnly = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const formatTimeOnly = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleTimeString("en-PH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* EMPTY STATE */
  if (!order) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Purchase order not found</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-y-auto">
      {/* BREADCRUMB */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() =>
                navigate("/webapp/purchasing/purchase-orders")
              }
            >
              Purchase Orders
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{order.id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* HEADER */}
      <DataToolbar
        variant="detail"
        title={order.id}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>

            {order.status !== "cancelled" &&
              order.status !== "received" && (
                <>
                  <Button 
                    size="sm"
                    onClick={() => setOpenModal(true)}
                  >
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm" 
                    variant="destructive"
                    onClick={() => setOpenCancel(true)}
                  >
                    <XCircle className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                </>
              )}
          </>
        }
      />

      {/* GRID */}
      <div className="grid grid-cols-3 gap-6">
        {/* LEFT */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">
              Order Information
            </h2>
          </CardHeader>

          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between">
              <p className="text-muted-foreground">Status</p>
              <Badge variant={statusConfig[order.status].variant}>
                {statusConfig[order.status].label}
              </Badge>
            </div>


            <Separator />

            <div className="flex justify-between">
              <p className="text-muted-foreground">Supplier</p>
              <span>{order.supplier}</span>
            </div>

            <div className="flex justify-between">
              <p className="text-muted-foreground">Order Date</p>
              <span>{formatDateOnly(order.orderDate)}</span>
            </div>

            <div className="flex justify-between">
              <p className="text-muted-foreground">
                Requested Ship Date
              </p>
              <span>{formatDateOnly(order.requestedShipDate)}</span>
            </div>

            <div className="flex justify-between">
              <p className="text-muted-foreground">ETA</p>
              <span>{order.eta ? formatDateOnly(order.eta) : "—"}</span>
            </div>

            <Separator />

            <div className="flex justify-between">
              <p className="text-muted-foreground">
                Requested By
              </p>
              <span>{order.requestedBy}</span>
            </div>

            <div className="flex justify-between">
              <p className="text-muted-foreground">
                Linked SO
              </p>
              <span>{order.linkedSO || "—"}</span>
            </div>

            <div className="flex justify-between">
              <p className="text-muted-foreground">
                Linked JO
              </p>
              <span>{order.linkedJO || "—"}</span>
            </div>            

            <Separator />

            <div className="flex justify-between">
              <p className="text-muted-foreground">Created</p>
              <div className="flex flex-col">
                <span>{formatDateOnly(order.createdAt)}</span>
                <span className="text-muted-foreground text-xs" > {formatTimeOnly(order.createdAt)}</span>
              </div>
            </div>

            <div className="flex justify-between">
              <p className="text-muted-foreground">Updated</p>
              <div className="flex flex-col">
                <span>{formatDateOnly(order.updatedAt)}</span>
                <span className="text-muted-foreground text-xs" > {formatTimeOnly(order.updatedAt)}</span>
              </div>
            </div>

            <Separator />
            {order.status === "for-approval" && (
              <Button
                size="sm"
                className="w-full"
                onClick={handleApprove}
              >
                Approve Purchase Order
              </Button>
            )}

          </CardContent>
        </Card>

        {/* RIGHT */}
        <div className="col-span-2 flex flex-col gap-4">
          {/* ITEMS */}
          <Card className="flex flex-col">
            <CardHeader>
              <h2 className="text-lg font-semibold">
                Items ({items.length})
              </h2>
            </CardHeader>

            <CardContent className="p-0">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="w-2/5">Item</TableHead>
                    <TableHead className="w-1/5">Unit Price</TableHead>
                    <TableHead className="w-1/5 text-center">Qty</TableHead>
                    <TableHead className="w-1/5">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginatedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          {item.itemName}
                          <p className="text-muted-foreground text-xs">
                            {item.sku}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{item.unitPrice}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell>
                        ₱{item.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>

            {/* FOOTER */}
            <div className="border-t">
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <p className="text-muted-foreground text-xs">
                  Overall Purchase Total
                </p>
                <p className="text-lg font-semibold">
                  ₱{total.toLocaleString()}
                </p>
              </div>

              <Pagination
                totalItems={items.length}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={[5, 10]}
              />
            </div>
          </Card>

          {/* REMARKS */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Notes</h2>
            </CardHeader>
            <CardContent>
              <p>{order.notes || "No notes provided."}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <PurchaseOrderModal
        open={openModal}
        onOpenChange={setOpenModal}
        initialData={order}
        onSave={(updatedData) => {
          if (!order) return;

          // update localStorage
          const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as PurchaseOrder[];

          const updatedList = stored.map((o) =>
            o.id === updatedData.id
              ? {
                  ...updatedData,
                  updatedAt: new Date().toISOString(), // ensure updated timestamp
                }
              : o
          );

          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

          // update UI immediately
          setOrder({
            ...updatedData,
            updatedAt: new Date().toISOString(),
          });

          setOpenModal(false);
        }}
      />

      <CancelPurchaseOrderDialog
        open={openCancel}
        onOpenChange={setOpenCancel}
        order={order}
        onConfirm={() => {
          if (!order) return;

          const updatedAt = new Date().toISOString();

          const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

          const updated = stored.map((o: PurchaseOrder) =>
            o.id === order.id
              ? { ...o, status: "cancelled", updatedAt }
              : o
          );

          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

          setOrder({ ...order, status: "cancelled", updatedAt });
          setOpenCancel(false);
        }}
      />

    </div>
  );
};

export default PurchaseOrderDetails;