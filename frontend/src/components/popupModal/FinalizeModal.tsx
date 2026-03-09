import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  address?: string;
  mobile?: string;
  landline?: string;
  email?: string;
  businessNo?: string;
  vehicles?: Vehicle[];
}

interface Vehicle {
  id: string;
  yearMakeModel: string;
  color?: string;
  plateNo?: string;
  vin?: string;
  kilometers?: number;
  engineNo?: string;
}

interface JOServiceLine {
  id: string;
  service: string;
  amount: number;
}

interface SOPartLine {
  id: string;
  itemName: string;
  partNo: string;
  quantity: number;
  amount: number;
}

interface Totals {
  totalServices: number;
  totalParts: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  validJO: JOServiceLine[];
  validSO: SOPartLine[];
}

interface Quotation {
  id: string;
  notes?: string;
  taxRate: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation: Quotation;
  totals: Totals;
  onFinalized: () => void;
}

export function FinalizeEstimate({ open, onOpenChange, quotation, totals, onFinalized }: Props) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [landline, setLandline] = useState("");
  const [email, setEmail] = useState("");
  const [businessNo, setBusinessNo] = useState("");

  const [vYearMakeModel, setVYearMakeModel] = useState("");
  const [vColor, setVColor] = useState("");
  const [vPlateNo, setVPlateNo] = useState("");
  const [vVin, setVVin] = useState("");
  const [vKilometers, setVKilometers] = useState(0);
  const [vEngineNo, setVEngineNo] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");

  const [suggestionsVisible, setSuggestionsVisible] = useState(false);

  // Dummy customers for demo
  const CUSTOMERS: Customer[] = [
    { id: "c1", name: "Juan Dela Cruz", mobile: "0917-123-4567", vehicles: [{ id: "v1", yearMakeModel: "2020 Toyota Vios", plateNo: "ABC123" }] },
    { id: "c2", name: "Maria Santos", mobile: "0917-987-6543", vehicles: [{ id: "v2", yearMakeModel: "2019 Honda Civic", plateNo: "XYZ789" }] },
  ];

  const filteredCustomers = CUSTOMERS.filter(c => c.name.toLowerCase().includes(name.toLowerCase()));

  const customerVehicles = CUSTOMERS.find(c => c.name === name)?.vehicles || [];

  const handleCustomerSelect = (customer: Customer) => {
    setName(customer.name);
    setAddress(customer.address || "");
    setMobile(customer.mobile || "");
    setLandline(customer.landline || "");
    setEmail(customer.email || "");
    setBusinessNo(customer.businessNo || "");

    if (customer.vehicles && customer.vehicles.length > 0) {
      setSelectedVehicleId(customer.vehicles[0].id);
      const v = customer.vehicles[0];
      setVYearMakeModel(v.yearMakeModel);
      setVColor(v.color || "");
      setVPlateNo(v.plateNo || "");
      setVVin(v.vin || "");
      setVKilometers(v.kilometers || 0);
      setVEngineNo(v.engineNo || "");
    }

    setSuggestionsVisible(false);
  };

  const handleVehicleChange = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    const v = customerVehicles.find(v => v.id === vehicleId);
    if (v) {
      setVYearMakeModel(v.yearMakeModel);
      setVColor(v.color || "");
      setVPlateNo(v.plateNo || "");
      setVVin(v.vin || "");
      setVKilometers(v.kilometers || 0);
      setVEngineNo(v.engineNo || "");
    }
  };

  const handleFinalize = () => {
    onFinalized();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Finalize — Assign Customer & Vehicle</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="px-6 pb-4 space-y-4">
            {/* Out of stock warning */}
            {totals.validSO.length > 0 && (
              <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                  <span className="text-sm font-semibold text-foreground">Insufficient Stock</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Parts display only for demo. No backend actions.
                </p>
                <Button>Request Parts</Button>
              </div>
            )}

            {/* CUSTOMER DETAILS */}
            <div className="space-y-2 relative">
              <p className="text-xs font-semibold text-muted-foreground">Customer Info</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2 relative">
                  <Label className="text-xs">Name *</Label>
                  <Input
                    value={name}
                    onChange={e => {
                      setName(e.target.value);
                      setSuggestionsVisible(true);
                    }}
                    placeholder="Customer Name"
                  />
                  {suggestionsVisible && filteredCustomers.length > 0 && (
                    <div className="border rounded-md mt-1 bg-white z-10 absolute max-h-40 overflow-y-auto w-full shadow">
                      {filteredCustomers.map(c => (
                        <div
                          key={c.id}
                          className="px-3 py-1 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => handleCustomerSelect(c)}
                        >
                          {c.name} — {c.mobile}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="col-span-2"><Label className="text-xs">Address</Label><Input value={address} onChange={e => setAddress(e.target.value)} /></div>
                <div><Label className="text-xs">Mobile *</Label><Input value={mobile} onChange={e => setMobile(e.target.value)} /></div>
                <div><Label className="text-xs">Landline</Label><Input value={landline} onChange={e => setLandline(e.target.value)} /></div>
                <div><Label className="text-xs">Email</Label><Input value={email} onChange={e => setEmail(e.target.value)} /></div>
                <div><Label className="text-xs">Business No.</Label><Input value={businessNo} onChange={e => setBusinessNo(e.target.value)} /></div>
              </div>
            </div>

            <Separator />

            {/* VEHICLE DETAILS */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Vehicle Info</p>
              {customerVehicles.length > 0 && (
                <Select value={selectedVehicleId} onValueChange={handleVehicleChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {customerVehicles.map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.yearMakeModel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="col-span-2"><Label className="text-xs">Year/Make/Model *</Label><Input value={vYearMakeModel} onChange={e => setVYearMakeModel(e.target.value)} /></div>
                <div><Label className="text-xs">Color</Label><Input value={vColor} onChange={e => setVColor(e.target.value)} /></div>
                <div><Label className="text-xs">Plate No.</Label><Input value={vPlateNo} onChange={e => setVPlateNo(e.target.value)} /></div>
                <div><Label className="text-xs">VIN</Label><Input value={vVin} onChange={e => setVVin(e.target.value)} /></div>
                <div><Label className="text-xs">Kilometers</Label><Input type="number" value={vKilometers || ""} onChange={e => setVKilometers(Number(e.target.value))} /></div>
                <div className="col-span-2"><Label className="text-xs">Engine No.</Label><Input value={vEngineNo} onChange={e => setVEngineNo(e.target.value)} /></div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 pb-6 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Back</Button>
          <Button onClick={handleFinalize}>Finalize & Issue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}