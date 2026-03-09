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
  mobileNumber: string;
  landline?: string;
  businessPhone?: string;
  address: string;
}

interface Vehicle {
  yearMakeModel: string;
  color: string;
  plateNo: string;
  vin: string;
  kilometers: number;
  engineNo: string;
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
      mobileNumber: "09123456789",
      address: "Somewhere in Manila",
    },
    vehicle: {
      yearMakeModel: "2020 Toyota Camry",
      color: "White",
      plateNo: "ABC-1234",
      vin: "1HGCM82633A004352",
      kilometers: 15000,
      engineNo: "ENG123456",
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

function Detail({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      {children || <p className="font-medium text-foreground">{value}</p>}
    </div>
  );
}

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
      label: "Customer",
      render: (s) => (
        <div>
          <div className="font-medium">{s.customer.name}</div>
          <div className="text-xs text-muted-foreground">
            {s.customer.email}
          </div>
        </div>
      ),
    },
    {
      key: "plateNo",
      label: "Plate No.",
      render: (s) => s.vehicle.plateNo,
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
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold">{selected.soNo}</h2>

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

              <Button>Generate Invoice</Button>
            </div>

            {/* CUSTOMER + VEHICLE */}
            <div className="grid grid-cols-2 gap-20 border rounded-lg p-4">

              <div>
                <h3 className="font-semibold mb-3">Customer Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <Detail label="Name" value={selected.customer.name} />
                  <Detail label="Mobile" value={selected.customer.mobileNumber} />
                  <Detail label="Landline" value={selected.customer.landline || "—"} />
                  <Detail label="Email" value={selected.customer.email} />
                  <Detail label="Business Phone" value={selected.customer.businessPhone || "—"} />
                  <Detail label="Address" value={selected.customer.address} />
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Vehicle Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <Detail label="Year Make Model" value={selected.vehicle.yearMakeModel} />
                  <Detail label="Color" value={selected.vehicle.color} />
                  <Detail label="Plate" value={selected.vehicle.plateNo} />
                  <Detail label="VIN" value={selected.vehicle.vin} />
                  <Detail label="Engine No" value={selected.vehicle.engineNo} />
                  <Detail label="Kilometers" value={`${selected.vehicle.kilometers} km`} />
                </div>
              </div>

            </div>

            {/* PARTS */}
            <div className="space-y-3">

              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Parts</h3>
                <Button variant="outline" size="sm">
                  Edit Parts
                </Button>
              </div>

              <Table>
                <TableHeader>
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
                      <TableCell>
                        <div className="flex gap-4 items-center">
                          <img
                            src={placeholder}
                            alt={p.name}
                            className="w-10 h-10 rounded"
                          />
                          <div>
                            <p className="font-semibold">{p.name}</p>
                            <span className="text-xs text-muted-foreground">
                              In stock: 82 pcs
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>{p.sku}</TableCell>
                      <TableCell>{p.quantity} {p.unit}</TableCell>
                      <TableCell>${p.price}</TableCell>

                      <TableCell className="text-right">
                        ${(p.quantity * p.price).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

            </div>

            {/* PAYMENT + SUMMARY */}
            <div className="grid grid-cols-2 gap-6">

              {/* PAYMENT HISTORY */}
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold">Payment History</h3>

                {selected.payments.map((p, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-sm border-b pb-2"
                  >
                    <span>{p.date}</span>
                    <span>${p.amount}</span>
                    <span className="text-muted-foreground">
                      Balance: ${p.remaining.toFixed(2)}
                    </span>
                  </div>
                ))}

                <div className="flex gap-2 pt-2">
                  <Input
                    placeholder="Payment amount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                  <Button onClick={addPayment}>Add</Button>
                </div>
              </div>

              {/* SUMMARY */}
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
              </div>

            </div>

          </div>
        )}
      </MasterDetailPanel>
    </DashboardLayout>
  );
};

export default SalesOrder;