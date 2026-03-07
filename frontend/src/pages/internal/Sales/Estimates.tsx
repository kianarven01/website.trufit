import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MasterDetailPanel, ColumnDef } from "@/components/MasterDetailPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ServiceItem {
  name: string;
  category: string;
  price: number;
}

interface PartItem {
  name: string;
  barcode: string;
  quantity: number;
  price: number;
}

interface Estimate {
  id: string;
  estimateNo: string;
  services: ServiceItem[];
  parts: PartItem[];
  date: string;
  status: "draft" | "issued";
}

const dummyEstimates: Estimate[] = [
  {
    id: "1",
    estimateNo: "EST-001",
    date: "2026-03-06T10:30:00",
    status: "draft",
    services: [
      { name: "Oil Change", category: "Maintenance", price: 40 },
      { name: "Brake Inspection", category: "Inspection", price: 30 },
    ],
    parts: [
      { name: "Oil Filter", barcode: "OF123", quantity: 1, price: 12 },
    ],
  },
  {
    id: "2",
    estimateNo: "EST-002",
    date: "2026-03-05T15:10:00",
    status: "issued",
    services: [
      { name: "Wheel Alignment", category: "Alignment", price: 60 },
    ],
    parts: [
      { name: "Brake Pads", barcode: "BP456", quantity: 2, price: 50 },
    ],
  },
];

const Estimates: React.FC = () => {
  const [estimates, setEstimates] = useState<Estimate[]>(dummyEstimates);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const calculateTotal = (e: Estimate) => {
    const serviceTotal = e.services.reduce((a, s) => a + s.price, 0);
    const partsTotal = e.parts.reduce((a, p) => a + p.price * p.quantity, 0);
    return serviceTotal + partsTotal;
  };

  const columns: ColumnDef<Estimate>[] = [
    {
      key: "estimateNo",
      label: "Estimate No.",
      render: (e) => (
        <div className="font-semibold">{e.estimateNo}</div>
      ),
    },
    {
      key: "services",
      label: "Service",
      render: (e) => `${e.services.length} service(s)`,
    },
    {
      key: "parts",
      label: "Parts",
      render: (e) => `${e.parts.length} part(s)`,
    },
    {
      key: "date",
      label: "Date",
      render: (e) => {
        const d = new Date(e.date);
        return (
          <div>
            <div>{d.toLocaleDateString()}</div>
            <div className="text-xs text-muted-foreground">
              {d.toLocaleTimeString()}
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (e) => (
        <Badge variant={e.status === "draft" ? "secondary" : "default"}>
          {e.status}
        </Badge>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (e) => `$${calculateTotal(e).toFixed(2)}`,
    },
  ];

  const filteredEstimates = useMemo(() => {
    return estimates.filter((e) =>
      e.estimateNo.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [estimates, searchQuery]);

  const serviceTotal = selectedEstimate
    ? selectedEstimate.services.reduce((a, s) => a + s.price, 0)
    : 0;

  const partsTotal = selectedEstimate
    ? selectedEstimate.parts.reduce((a, p) => a + p.price * p.quantity, 0)
    : 0;

  const tax = (serviceTotal + partsTotal) * 0.12;
  const grandTotal = serviceTotal + partsTotal + tax;

  return (
    <DashboardLayout>
      <MasterDetailPanel<Estimate>
        title="Estimates"
        description="Manage service estimates"
        items={filteredEstimates}
        selectedItem={selectedEstimate}
        onSelect={setSelectedEstimate}
        getItemId={(e) => e.id}
        columns={columns}
        onSearch={setSearchQuery}
        onAdd={() => alert("Create new estimate")}
        addLabel="New Estimate"
      >
        {selectedEstimate && (
          <div className="space-y-6">

            {/* Estimate Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">
                  {selectedEstimate.estimateNo}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Created {new Date(selectedEstimate.date).toLocaleString()}
                </p>
              </div>

              <Badge variant={selectedEstimate.status === "draft" ? "secondary" : "default"}>
                {selectedEstimate.status}
              </Badge>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-semibold mb-2">Services</h3>

              <div className="space-y-2">
                {selectedEstimate.services.map((s, i) => (
                  <div
                    key={i}
                    className="flex justify-between border rounded-md p-3"
                  >
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.category}
                      </p>
                    </div>

                    <p className="font-semibold">${s.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Parts */}
            <div>
              <h3 className="font-semibold mb-2">Parts</h3>

              <div className="space-y-2">
                {selectedEstimate.parts.map((p, i) => (
                  <div
                    key={i}
                    className="flex justify-between border rounded-md p-3"
                  >
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Barcode: {p.barcode} • Qty: {p.quantity}
                      </p>
                    </div>

                    <p className="font-semibold">
                      ${(p.price * p.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Services</span>
                <span>${serviceTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Total Parts</span>
                <span>${partsTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Tax (12%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between font-bold text-lg">
                <span>Grand Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline">Edit</Button>

              {selectedEstimate.status === "draft" && (
                <Button>
                  Issue Estimate
                </Button>
              )}
            </div>

          </div>
        )}
      </MasterDetailPanel>
    </DashboardLayout>
  );
};

export default Estimates;