import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MasterDetailPanel, ColumnDef } from "@/components/MasterDetailPanel";

import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import placeholder from "@/assets/temporary_bg.jpeg";

interface Payment {
  date: string;
  amount: number;
  remaining: number;
}

interface Part {
  name: string;
  sku: string;
  quantity: number;
  price: number;
  unit: string;
  batchLocation?: string;
  image?: string;
}

interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Vehicle {
  make: string;
  model: string;
  year: string;
  color: string;
  plateNo: string;
}

interface SalesOrder {
  id: string;
  soNo: string;
  customer: Customer;
  vehicle: Vehicle;
  status: "pending" | "paid" | "partial";
  parts: Part[];
  payments: Payment[];
  date: string;
}

const TAX_RATE = 0.12;

const dummySO: SalesOrder[] = [
  {
    id: "1",
    soNo: "SO-001",
    status: "partial",
    date: "2026-03-06",
    customer: {
      name: "John Doe",
      email: "john@gmail.com",
      phone: "09123456789",
      address: "Manila",
    },
    vehicle: {
      make: "Toyota",
      model: "Vios",
      year: "2019",
      color: "White",
      plateNo: "ABC-1234",
    },
    parts: [
      {
        name: "Oil Filter",
        sku: "OF-100",
        quantity: 1,
        price: 12,
        unit: "pc",
        batchLocation: "A1-02",
      },
      {
        name: "Brake Pad",
        sku: "BP-200",
        quantity: 2,
        price: 45,
        unit: "set",
        batchLocation: "B3-01",
      },
    ],
    payments: [
      {
        date: "2026-03-06 10:30",
        amount: 20,
        remaining: 80,
      },
    ],
  },
];

const SalesOrder: React.FC = () => {
  const [items, setItems] = useState<SalesOrder[]>(dummySO);
  const [selected, setSelected] = useState<SalesOrder | null>(null);
  const [search, setSearch] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  const filtered = useMemo(() => {
    return items.filter(
      (i) =>
        i.customer.name.toLowerCase().includes(search.toLowerCase()) ||
        i.soNo.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const calcSubtotal = (so: SalesOrder) =>
    so.parts.reduce((a, p) => a + p.price * p.quantity, 0);

  const columns: ColumnDef<SalesOrder>[] = [
    {
      key: "soNo",
      label: "SO#",
      render: (s) => <strong>{s.soNo}</strong>,
    },
    {
      key: "customer",
      label: "Customer / Plate",
      render: (s) => (
        <div>
          <div className="font-medium">{s.customer.name}</div>
          <div className="text-xs text-muted-foreground">
            {s.vehicle.plateNo}
          </div>
        </div>
      ),
    },
    {
      key: "parts",
      label: "Parts",
      render: (s) => s.parts.length,
    },
    {
      key: "status",
      label: "Status",
      render: (s) => (
        <Badge
          className={
            s.status === "paid"
              ? "bg-green-100 text-green-700"
              : s.status === "partial"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }
        >
          {s.status}
        </Badge>
      ),
    },
    {
      key: "total",
      label: "Total",
      render: (s) => {
        const total = calcSubtotal(s) * (1 + TAX_RATE);
        return `$${total.toFixed(2)}`;
      },
    },
  ];

  const subtotal = selected ? calcSubtotal(selected) : 0;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const paid =
    selected?.payments.reduce((sum, p) => sum + p.amount, 0) || 0;

  const balance = total - paid;

  const paymentStatus =
    balance <= 0 ? "paid" : paid > 0 ? "partial" : "pending";

  const addPayment = () => {
    if (!selected || !paymentAmount) return;

    const amount = Number(paymentAmount);

    const newRemaining = balance - amount;

    const newPayment: Payment = {
      date: new Date().toLocaleString(),
      amount,
      remaining: newRemaining,
    };

    const updated = items.map((so) =>
      so.id === selected.id
        ? { ...so, payments: [...so.payments, newPayment] }
        : so
    );

    setItems(updated);
    setSelected(updated.find((s) => s.id === selected.id)!);
    setPaymentAmount("");
  };



  return (
    <DashboardLayout>
      <MasterDetailPanel<SalesOrder>
        title="Sales Orders"
        description="Parts sales orders"
        items={filtered}
        selectedItem={selected}
        onSelect={setSelected}
        getItemId={(i) => i.id}
        columns={columns}
        onSearch={setSearch}
        addLabel="New SO"
      >
        {selected && (
          <div className="space-y-6">

            {/* HEADER */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold">{selected.soNo}</h2>
                <p className="text-sm text-muted-foreground">
                  Date: {selected.date}
                </p>
              </div>

              <Button>
                Generate Invoice
              </Button>
            </div>

            {/* CUSTOMER + VEHICLE */}
            <div className="grid grid-cols-2 gap-6 border rounded-lg p-4">
              <div>
                <h3 className="font-semibold mb-2">Customer Details</h3>
                <p>{selected.customer.name}</p>
                <p className="text-sm">{selected.customer.email}</p>
                <p className="text-sm">{selected.customer.phone}</p>
                <p className="text-sm">{selected.customer.address}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Vehicle Details</h3>
                <p>
                  {selected.vehicle.year} {selected.vehicle.make}{" "}
                  {selected.vehicle.model}
                </p>
                <p className="text-sm">Color: {selected.vehicle.color}</p>
                <p className="text-sm">Plate: {selected.vehicle.plateNo}</p>
              </div>
            </div>

            {/* PARTS TABLE */}
            
            <Table>
              <TableHeader>
            {/* ACTIONS */}
                <div className="flex gap-2">
                <button className="border rounded-md px-3 py-1">
                    Add Parts
                </button>
                <button className="border rounded-md px-3 py-1">
                    Scan to Add
                </button>
                </div>
                <TableRow>
                  <TableHead>Part</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {selected.parts.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">
                      <div className="flex gap-4">
                        <img
                          src={placeholder}
                          className="w-10 h-10 rounded"
                        />
                        <div>
                          <p className="font-semibold">{p.name}</p>
                          <span className="text-xs text-muted-foreground">
                            In stock: 82pcs
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {p.sku}
                    </TableCell>

                    <TableCell>
                      {p.quantity} {p.unit}
                    </TableCell>

                    <TableCell>${p.price}</TableCell>

                    <TableCell className="text-right">
                      ${(p.quantity * p.price).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* PAYMENT + SUMMARY */}
            <div className="grid grid-cols-2 gap-6">

              {/* PAYMENT HISTORY */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Payment History</h3>
                </div>

                {selected.payments.map((p, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-sm border-b pb-1"
                  >
                    <span>{p.date}</span>
                    <span>${p.amount}</span>
                    <span className="text-muted-foreground">
                      Balance: ${p.remaining.toFixed(2)}
                    </span>
                  </div>
                ))}

                {/* ADD PAYMENT */}
                <div className="flex gap-2 pt-2">
                  <Input
                    placeholder="Payment amount"
                    value={paymentAmount}
                    onChange={(e) =>
                      setPaymentAmount(e.target.value)
                    }
                  />
                  <Button onClick={addPayment}>Add</Button>
                </div>
              </div>

              {/* BILLING SUMMARY */}
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Paid</span>
                  <span>${paid.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Balance</span>
                  <span>${balance.toFixed(2)}</span>
                </div>

                <Badge
                  className={
                    paymentStatus === "paid"
                      ? "bg-green-100 text-green-700"
                      : paymentStatus === "partial"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }
                >
                  {paymentStatus}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </MasterDetailPanel>
    </DashboardLayout>
  );
};

export default SalesOrder;