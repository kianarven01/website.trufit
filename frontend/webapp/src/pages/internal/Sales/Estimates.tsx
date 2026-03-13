import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MasterDetailPanel, ColumnDef } from "@/components/MasterDetailPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";

import { QuotationModal } from "@/components/popupModal/CreateEstimate";
import { FinalizeEstimate } from "@/components/popupModal/FinalizeModal";
import { CalendarClock } from "lucide-react";
import { RefreshCcw } from "react-feather";

interface ServiceItem {
  name: string;
  category: string;
  price: number;
}

interface PartItem {
  name: string;
  img?: string;
  sku?: string;
  currentStock: number;
  unit: string;
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
      { name: "Oil Filter", sku: "OF123", currentStock: 10, unit: "pc", quantity: 1, price: 12 },
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
      { name: "Brake Pads", sku: "BP456", currentStock: 5, unit: "pc", quantity: 2, price: 50 },
    ],
  },
];

const Estimates: React.FC = () => {
  const [estimates, setEstimates] = useState<Estimate[]>(dummyEstimates);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [quotationModalOpen, setQuotationModalOpen] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState<Estimate | null>(null);

  const [finalizeModalOpen, setFinalizeModalOpen] = useState(false);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const calculateTotal = (e: Estimate) => {
    const serviceTotal = e.services.reduce((a, s) => a + s.price, 0);
    const partsTotal = e.parts.reduce((a, p) => a + p.price * p.quantity, 0);
    return serviceTotal + partsTotal;
  };

  const columns: ColumnDef<Estimate>[] = [
    {
      key: "estimateNo",
      label: "Estimate No.",
      render: (e) => <div className="font-semibold">{e.estimateNo}</div>,
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
            <div className="text-xs text-muted-foreground">{d.toLocaleTimeString()}</div>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (e) => <Badge variant={e.status === "draft" ? "secondary" : "default"}>{e.status}</Badge>,
    },
    {
      key: "amount",
      label: "Amount",
      render: (e) => `$${calculateTotal(e).toFixed(2)}`,
    },
  ];

  const handleEstimateSaved = (estimate: Estimate) => {
    setEstimates((prev) => {
      const exists = prev.find((e) => e.id === estimate.id);
      if (exists) return prev.map((e) => (e.id === estimate.id ? estimate : e));
      return [...prev, estimate];
    });
    setSelectedEstimate(estimate);
  };

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
        onAdd={() => {
          setEditingEstimate(null);
          setQuotationModalOpen(true);
        }}
        addLabel="New Estimate"
      >
        {selectedEstimate && (
          <div className="space-y-6">

            {/* Estimate Header */}
            <div className="flex justify-between items-center">
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{selectedEstimate.estimateNo}</h2>
                    <Badge variant={selectedEstimate.status === "draft" ? "secondary" : "default"}>
                      {selectedEstimate.status}
                    </Badge>

                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingEstimate(selectedEstimate);
                        setQuotationModalOpen(true);
                      }}
                    >
                      Edit
                    </Button>

                    {selectedEstimate.status === "draft" && (
                      <Button onClick={() => setFinalizeModalOpen(true)}>
                        Issue Job Order/Sales Order
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex gap-6 mt-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <CalendarClock size={14} />
                      Created:
                      <span className="text-sm text-foreground">
                        {formatDate(selectedEstimate.date)}
                      </span>                      
                    </p>

                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <RefreshCcw size={14} />
                    Last Updated:
                    <span className="text-foreground">{formatDate(selectedEstimate.date)}</span>
                  </p>
                  
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-semibold mb-2">Services</h3>

              <div className="space-y-2">
                {selectedEstimate.services.map((s, i) => (
                  <div key={i} className="flex justify-between border rounded-md p-3">
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.category}</p>
                    </div>

                    <p className="font-semibold">${s.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Parts */}
            <div>
              <h3 className="font-semibold mb-2">Parts</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedEstimate.parts.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex gap-4">
                          {p.img && <img src={p.img} alt={p.name} className="w-10 h-10 rounded"/>}
                          <div>
                            <p className="font-semibold">{p.name}</p>
                            <p className="text-xs text-muted-foreground">
                              In Stock: {p.currentStock} {p.unit}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{p.sku}</TableCell>
                      <TableCell>${p.price.toFixed(2)}</TableCell>
                      <TableCell>{p.quantity}</TableCell>
                      <TableCell>${(p.price * p.quantity).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2 text-sm">
              <div 
                className="flex justify-between"
              >
                <span>Total Services</span>
                <span>${serviceTotal.toFixed(2)}</span>
              </div>

              <div 
                className="flex justify-between"
              >
                <span>Total Parts</span>
                <span>${partsTotal.toFixed(2)}</span>
              </div>
              <div 
                className="flex justify-between"
              >
                <span>Tax (12%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div 
                className="flex justify-between font-bold text-lg"
              >
                <span>Grand Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

          </div>
        )}
      </MasterDetailPanel>

      {/* Quotation Modal */}
      <QuotationModal
        open={quotationModalOpen}
        onOpenChange={setQuotationModalOpen}
        estimate={editingEstimate}
        onSaved={handleEstimateSaved}
      />

      {/* FinalizeEstimate Modal */}
      {selectedEstimate && (
        <FinalizeEstimate
          open={finalizeModalOpen}
          onOpenChange={setFinalizeModalOpen}
          quotation={{
            id: selectedEstimate.id,
            taxRate: 0.12,
            notes: "",
          }}
          totals={{
            totalServices: serviceTotal,
            totalParts: partsTotal,
            subtotal: serviceTotal + partsTotal,
            taxAmount: tax,
            total: grandTotal,
            validJO: selectedEstimate.services.map((s, i) => ({ id: `s-${i}`, service: s.name, amount: s.price })),
            validSO: selectedEstimate.parts.map((p, i) => ({ id: `p-${i}`, itemName: p.name, partNo: p.sku || "", quantity: p.quantity, amount: p.price * p.quantity })),
          }}
          onFinalized={() => {
            setEstimates((prev) =>
              prev.map((e) => (e.id === selectedEstimate.id ? { ...e, status: "issued" } : e))
            );
            setFinalizeModalOpen(false);
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default Estimates;