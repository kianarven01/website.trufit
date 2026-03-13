import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MasterDetailPanel, ColumnDef } from "@/components/MasterDetailPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Service {
  service: string;
  category: string;
  price: number;
}

interface InterviewFile {
  name: string;
  type: "image" | "pdf";
  url: string;
}

interface JobOrder {
  id: string;
  joNo: string;
  customer: string;
  plateNo: string;
  technician?: string;
  startDate: string;
  status: "pending" | "ongoing" | "completed";
  services: Service[];
  interviews: InterviewFile[];
  paid: number;
}

const dummyJO: JobOrder[] = [
  {
    id: "1",
    joNo: "JO-001",
    customer: "John Doe",
    plateNo: "ABC-1234",
    technician: "",
    startDate: "2026-03-06",
    status: "pending",
    paid: 50,
    services: [
      { service: "Oil Change", category: "Maintenance", price: 40 },
      { service: "Brake Inspection", category: "Inspection", price: 30 },
    ],
    interviews: [
      { name: "Front Damage Photo", type: "image", url: "#" },
      { name: "Inspection Report", type: "pdf", url: "#" },
    ],
  },
  {
    id: "2",
    joNo: "JO-002",
    customer: "Jane Smith",
    plateNo: "XYZ-8891",
    technician: "Mike",
    startDate: "2026-03-05",
    status: "ongoing",
    paid: 0,
    services: [
      { service: "Wheel Alignment", category: "Alignment", price: 60 },
    ],
    interviews: [],
  },
];

const TAX_RATE = 0.12;

const JobOrder: React.FC = () => {
  const [items] = useState<JobOrder[]>(dummyJO);
  const [selected, setSelected] = useState<JobOrder | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return items.filter(
      (i) =>
        i.customer.toLowerCase().includes(search.toLowerCase()) ||
        i.plateNo.toLowerCase().includes(search.toLowerCase()) ||
        i.joNo.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const calcSubtotal = (jo: JobOrder) =>
    jo.services.reduce((a, s) => a + s.price, 0);

  const columns: ColumnDef<JobOrder>[] = [
    {
      key: "joNo",
      label: "JO#",
      render: (j) => <strong>{j.joNo}</strong>,
    },
    {
      key: "customer",
      label: "Customer / Plate",
      render: (j) => (
        <div>
          <div className="font-medium">{j.customer}</div>
          <div className="text-xs text-muted-foreground">{j.plateNo}</div>
        </div>
      ),
    },
    {
      key: "services",
      label: "Services",
      render: (j) => j.services.length,
    },
    {
      key: "technician",
      label: "Technician",
      render: (j) =>
        j.technician ? (
          j.technician
        ) : (
          <Button size="sm" variant="outline">
            Assign
          </Button>
        ),
    },
    {
      key: "startDate",
      label: "Start Date",
    },
    {
      key: "status",
      label: "Status",
      render: (j) => <Badge>{j.status}</Badge>,
    },
    {
      key: "total",
      label: "Total",
      render: (j) => {
        const total = calcSubtotal(j) * (1 + TAX_RATE);
        return `$${total.toFixed(2)}`;
      },
    },
    {
      key: "balance",
      label: "Balance",
      render: (j) => {
        const total = calcSubtotal(j) * (1 + TAX_RATE);
        return `$${(total - j.paid).toFixed(2)}`;
      },
    },
  ];

  const subtotal = selected ? calcSubtotal(selected) : 0;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return (
    <DashboardLayout>
      <MasterDetailPanel<JobOrder>
        title="Job Orders"
        description="Manage active vehicle services"
        items={filtered}
        selectedItem={selected}
        onSelect={setSelected}
        getItemId={(i) => i.id}
        columns={columns}
        onSearch={setSearch}
        onAdd={() => alert("Create JO")}
        addLabel="New JO"
      >
        {selected && (
          <div className="space-y-6">

            <h2 className="text-lg font-bold">{selected.joNo}</h2>

            {/* Services */}
            <div>
              <h3 className="font-semibold mb-2">Services</h3>
              <div className="space-y-2">
                {selected.services.map((s, i) => (
                  <div
                    key={i}
                    className="flex justify-between border rounded-md p-3"
                  >
                    <div>
                      <div className="font-medium">{s.service}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.category}
                      </div>
                    </div>
                    <div>${s.price.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Interview Attachments */}
            <div>
              <h3 className="font-semibold mb-2">Interview Attachments</h3>

              {selected.interviews.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No attachments
                </p>
              )}

              <div className="space-y-2">
                {selected.interviews.map((f, i) => (
                  <div
                    key={i}
                    className="flex justify-between border rounded-md p-3"
                  >
                    <span>{f.name}</span>
                    <Badge variant="secondary">{f.type}</Badge>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </MasterDetailPanel>
    </DashboardLayout>
  );
};

export default JobOrder;