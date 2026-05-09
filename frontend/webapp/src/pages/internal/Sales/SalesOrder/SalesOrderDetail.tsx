// Sales Order Details (based on PurchaseOrderDetails UI)

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
import { ArrowLeft } from "lucide-react";
import DataToolbar from "@/components/DataToolbar";
import { Pagination, usePagination } from "@/components/ui/pagination";

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
  linkedJO?: string | null;
  products: Product[];
  tax: number;
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

const STORAGE_KEY = "sales_orders";

const SalesOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<SalesOrder | null>(null);

  const { page, setPage, pageSize, setPageSize, paginate } = usePagination(10);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const found = stored.find((o: SalesOrder) => o.id === id);
    setOrder(found || null);
  }, [id]);

  if (!order) {
    return <div className="p-6">Sales order not found</div>;
  }

  const items = order.products;
  const paginatedItems = paginate(items);

  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const total = subtotal + order.tax;
  const paid = order.payments.reduce((s, p) => s + p.amount, 0);
  const balance = total - paid;

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-y-auto">
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
              <ArrowLeft className="w-4 h-4 mr-1" /> 
              Back
            </Button> 
            <Button
              size="sm"
              onClick={() => navigate(`/webapp/sales/sales-orders/${order.id}/edit-estimate`)}
            >
              Edit    
            </Button>
            <Button
              variant="destructive"
              size="sm"
            >
              Generate Invoice
            </Button>         
          </>

        }
      />

      <div className="grid grid-cols-3 gap-6">
        {/* LEFT */}
        <Card>
          <CardHeader className="justify-between">
            <h2 className="text-lg font-semibold">Sales Order Information</h2>
            <Badge>{order.status}</Badge>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">

            <div className="space-y-4">
              <p className="text-muted-foreground">Customer Details</p>
              <div className="flex justify-between">
                <p className="text-muted-foreground">Name</p>
                <span>{order.customer.name}</span>
              </div>     
              <div className="flex justify-between">
                <p className="text-muted-foreground">Email</p>
                <span>{order.customer.email}</span>
              </div>   
              <div className="flex justify-between">
                <p className="text-muted-foreground">Mobile</p>
                <span>{order.customer.mobile}</span>
              </div>
              <div className="flex justify-between">
                <p className="text-muted-foreground">Address</p>
                <p>{order.customer.address}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <p className="text-muted-foreground">Vehicle Details</p>
              <div className="flex justify-between">
                <p className="text-muted-foreground">Vehicle</p>
                <span>{order.vehicle.year} {order.vehicle.make} {order.vehicle.model}</span>
              </div>     
              <div className="flex justify-between">
                <p className="text-muted-foreground">Variant</p>
                <span>{order.vehicle.variant}</span>
              </div>   
              <div className="flex justify-between">
                <p className="text-muted-foreground">Plate No.</p>
                <span>{order.vehicle.plateNo}</span>
              </div>
              <div className="flex justify-between">
                <p className="text-muted-foreground">Mileage</p>
                <p>{order.vehicle.mileage}</p>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between">
              <span>Linked JO</span>
              <span>{order.linkedJO || "—"}</span>
            </div>

            <Separator />

            <div className="flex justify-between">
              <span>Total</span>
              <span>₱{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid</span>
              <span>₱{paid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Balance</span>
              <span>₱{balance.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT */}
        <div className="col-span-2 flex flex-col gap-4">
          {/* PRODUCTS */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Products</h2>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.price}</TableCell>
                      <TableCell>{p.qty}</TableCell>
                      <TableCell>₱{p.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>

            <div className="border-t p-4 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₱{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>₱{order.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>₱{total.toLocaleString()}</span>
              </div>

              <Pagination
                totalItems={items.length}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          </Card>

          {/* PAYMENT HISTORY */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Payment History</h2>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {order.payments.length === 0 ? (
                <p>No payments yet</p>
              ) : (
                order.payments.map((p) => (
                  <div key={p.id} className="flex justify-between">
                    <span>{p.method}</span>
                    <span>₱{p.amount}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SalesOrderDetails;
