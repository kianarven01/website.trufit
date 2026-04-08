import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DataToolbar from "@/components/DataToolbar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import Combobox from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import CustomerFormModal from "@/components/popupModal/Customers/addCustomer";

import { Plus, Trash2, User, Car, Wrench, Box, Percent, Banknote, Calculator } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
  mobileNumber: string;
  landline?: string;
  businessPhone?: string;
  vehicles: Vehicle[];
}

interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  variant: string;
  color: string;
  plateNo: string;
  engineNo: string;
  vin: string;
  registrationNo: string;
  sellingDealer: string;
  hasWarranty?: boolean;
  mileage?: number;
}

interface ServiceItem {
  name: string;
  category: string;
  price: number;
}

interface PartItem {
  name: string;
  sku: string;
  quantity: number;
  price: number;
  unit: string;
  currentStock: number;
}

export interface Estimate {
  id: string;
  estimateNo: string;
  services: ServiceItem[];
  parts: PartItem[];
  date: string;
  lastEdited?: string;
  status: "issued" | "approved";
}

interface JOServiceLine {
  id: string;
  service: string;
  category: string;
  hourlyRate: number;
  hours: number;
  amount: number;
}

interface SOPartLine {
  id: string;
  itemName: string;
  partNo: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface ServiceCatalog {
  name: string;
  category: string;
  hourlyRate: number;
}

interface PartCatalog {
  name: string;
  sku: string;
  price: number;
}

/* STORAGE */
const STORAGE_KEY = "estimates";


let lineId = 100;
const genLineId = () => `LN-${lineId++}`;

const emptyJOLine = (): JOServiceLine => ({
  id: genLineId(),
  service: "",
  category: "",
  hourlyRate: 0,
  hours: 1,
  amount: 0,
});

const emptySOLine = (): SOPartLine => ({
  id: genLineId(),
  itemName: "",
  partNo: "",
  quantity: 1,
  unitPrice: 0,
  amount: 0,
});

const AddEstimate: React.FC = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Add Customer Modal
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");

  const [date, setDate] = useState(new Date().toISOString());
  const [notes, setNotes] = useState("");

  const [serviceTaxType, setServiceTaxType] = useState<"₱" | "%">("%");
  const [serviceTaxValue, setServiceTaxValue] = useState(0);

  const [partsTaxType, setPartsTaxType] = useState<"₱" | "%">("%");
  const [partsTaxValue, setPartsTaxValue] = useState(0);

  const [joLines, setJoLines] = useState<JOServiceLine[]>([emptyJOLine()]);
  const [soLines, setSoLines] = useState<SOPartLine[]>([emptySOLine()]);

  const [servicesCatalog, setServicesCatalog] = useState<ServiceCatalog[]>([]);
  const [partsCatalog, setPartsCatalog] = useState<PartCatalog[]>([]);

  const handleAddCustomer = (search: string) => {
    setCustomerSearch(search); // optional prefill
    setCustomerModalOpen(true);
  };

  const handleCustomerSaved = (newCustomer: Customer & { __lastAddedVehicle?: Vehicle }) => {
    setCustomers((prev) => [...prev, newCustomer]);

    // auto select new customer
    setSelectedCustomer(newCustomer);

    // auto select vehicle if exists
    if (newCustomer.__lastAddedVehicle) {
      setSelectedVehicle(newCustomer.__lastAddedVehicle);
    } else if (newCustomer.vehicles.length === 1) {
      setSelectedVehicle(newCustomer.vehicles[0]);
    } else {
      setSelectedVehicle(null);
    }
  };


useEffect(() => {
  setCustomers([
    {
      id: "1",
      name: "Juan Dela Cruz",
      email: "juan@email.com",
      address: "QC",
      mobileNumber: "09123456789",
      landline: "02-12345678",
      businessPhone: "02-12345678",
      vehicles: [
        {
          id: "v1",
          year: 2020,
          make: "Toyota",
          model: "Vios",
          variant: "G",
          color: "Red",
          plateNo: "ABC123",
          engineNo: "ENG001",
          vin: "VIN001",
          registrationNo: "REG001",
          sellingDealer: "Toyota QC",
        },
        {
          id: "v2",
          year: 2021,
          make: "Honda",
          model: "Civic",
          variant: "G",
          color: "Blue",
          plateNo: "DEF456",
          engineNo: "ENG002",
          vin: "VIN002",
          registrationNo: "REG002",
          sellingDealer: "Honda QC",
        },
      ],
    },
  ]);
}, []);


  useEffect(() => {
    // replace with API calls
    setServicesCatalog([
      { name: "Oil Change", category: "Maintenance", hourlyRate: 1500 },
      { name: "Brake Cleaning", category: "Brake", hourlyRate: 1200 },
      { name: "Wheel Alignment", category: "Suspension", hourlyRate: 1800 },
    ]);

    setPartsCatalog([
      { name: "Oil Filter", sku: "OF-100", price: 450 },
      { name: "Air Filter", sku: "AF-220", price: 650 },
      { name: "Brake Pad", sku: "BP-330", price: 2200 },
    ]);
  }, []);

  const updateJO = (idx: number, field: keyof JOServiceLine, value: any) => {
    setJoLines((prev) =>
      prev.map((l, i) => {
        if (i !== idx) return l;

        let updated = { ...l, [field]: value };

        if (field === "service") {
          const found = servicesCatalog.find((s) => s.name.toLowerCase() === value.toLowerCase());
          if (found) {
            updated.category = found.category;
            updated.hourlyRate = found.hourlyRate;
          } else if (!value) {
            updated.category = "";
            updated.hourlyRate = 0;
          }
        }

        // recalc amount
        updated.amount = updated.hourlyRate * updated.hours;
        return updated;
      })
    );
  };

  const updateSO = (idx: number, field: keyof SOPartLine, value: any) => {
    setSoLines((prev) =>
      prev.map((l, i) => {
        if (i !== idx) return l;

        let updated = { ...l, [field]: value };

        if (field === "itemName") {
          const found = partsCatalog.find((p) => p.name.toLowerCase() === value.toLowerCase());
          if (found) {
            updated.partNo = found.sku;
            updated.unitPrice = found.price;
          } else if (!value) {
            updated.partNo = "";
            updated.unitPrice = 0;
          }
        }

        if (field === "quantity") {
          updated.quantity = Math.max(1, Number(value));
        }

        updated.amount = updated.quantity * updated.unitPrice;
        return updated;
      })
    );
  };

  const addJOLine = () => setJoLines((p) => [...p, emptyJOLine()]);
  const removeJOLine = (i: number) => setJoLines((p) => p.filter((_, idx) => idx !== i));

  const addSOLine = () => setSoLines((p) => [...p, emptySOLine()]);
  const removeSOLine = (i: number) => setSoLines((p) => p.filter((_, idx) => idx !== i));

  const totals = useMemo(() => {
    const validJO = joLines.filter((l) => l.service.trim());
    const validSO = soLines.filter((l) => l.itemName.trim());

    const totalServices = validJO.reduce((s, l) => s + l.amount, 0);
    const totalParts = validSO.reduce((s, l) => s + l.amount, 0);

    const serviceTax = serviceTaxType === "%" ? totalServices * ((serviceTaxValue || 0) / 100) : (serviceTaxValue || 0);
    const partsTax = partsTaxType === "%" ? totalParts * ((partsTaxValue || 0) / 100) : (partsTaxValue || 0);

    const subtotal = totalServices + totalParts;
    const totalTax = serviceTax + partsTax;
    const total = subtotal + totalTax;

    return { totalServices, totalParts, subtotal, serviceTax, partsTax, totalTax, total, validJO, validSO };
  }, [joLines, soLines, serviceTaxType, serviceTaxValue, partsTaxType, partsTaxValue]);

  const peso = (n: number) =>
    `₱${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const renderTaxControl = (type: "₱" | "%", setType: (t: "₱" | "%") => void, value: number, setValue: (v: number) => void) => (
    <div className="flex items-center gap-2">
      <div className="inline-flex rounded-md border border-border overflow-hidden">
        <button type="button" onClick={() => setType("%")} className={`flex items-center gap-1 px-3 h-7 text-xs transition ${type === "%" ? "bg-primary text-primary-foreground" : "bg-background text-foreground"}`}>
          <Percent className="h-3 w-3" />
        </button>
        <button type="button" onClick={() => setType("₱")} className={`flex items-center gap-1 px-3 h-7 text-xs border-l border-border transition ${type === "₱" ? "bg-primary text-primary-foreground" : "bg-background text-foreground"}`}>
          <Banknote className="h-3 w-3" />
        </button>
      </div>
      {type === "₱" ? (
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₱</span>
          <Input type="number" value={value || ""} onChange={e => setValue(Number(e.target.value))} className="w-24 h-7 pl-6 text-sm" />
        </div>
      ) : (
        <div className="relative">
          <Input type="number" value={value || ""} onChange={e => setValue(Number(e.target.value))} className="w-24 h-7 pr-6 text-right text-sm" />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
        </div>
      )}
    </div>
  );

  const saveEstimate = () => {
    const now = new Date().toISOString();
    const newEstimate: Estimate = {
      id: `EST-${Date.now()}`,
      estimateNo: `EST-${Date.now()}`,
      date: now,
      lastEdited: now,
      status: "issued",
      services: joLines.map((l) => ({ name: l.service, category: l.category, price: l.amount })),
      parts: soLines.map((l) => ({ name: l.itemName, sku: l.partNo, quantity: l.quantity, unit: "pc", price: l.unitPrice, currentStock: 0 })),
    };
    console.log("Saved Estimate:", newEstimate);
  };

  const calculateDropdown = (el: HTMLInputElement | null) => {
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, width: rect.width };
  };

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-y-auto">
      {/* BREADCRUMB */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate(-1)}>Purchase Orders</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Add Estimate</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* HEADER */}
      <DataToolbar variant="detail" title="Create New Estimate" />

      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6 flex flex-col lg:flex-row gap-6">
          {/* CUSTOMER DETAILS */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-blue-500">
              <User className="size-5" />
              <p className="font-semibold text-foreground">Customer Details</p>
            </div>

            <div className="space-y-2">
              <div>
                <Label className="text-muted-foreground font-normal text-xs">Full Name</Label>
                  <Combobox
                    value={selectedCustomer?.id || ""}
                    onChange={(val) => {
                      const customer = customers.find((c) => c.id === val) || null;
                      setSelectedCustomer(customer);

                      if (customer?.vehicles.length === 1) {
                        setSelectedVehicle(customer.vehicles[0]);
                      } else {
                        setSelectedVehicle(null);
                      }
                    }}
                    items={customers.map((c) => ({
                      label: c.name,
                      value: c.id,
                    }))}
                    placeholder="Select customer"
                    allowAdd
                    addLabel="customer"
                    onAdd={handleAddCustomer}
                  />
              </div>
              <div>
                <Label className="text-muted-foreground font-normal text-xs">Address</Label>
                <Input
                  value={selectedCustomer?.address || ""}
                  readOnly
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-y-2 gap-x-4">
                <div>
                  <Label className="text-muted-foreground font-normal text-xs">Email Address</Label>
                  <Input
                    value={selectedCustomer?.email || ""}
                    readOnly
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground font-normal text-xs">Phone Number</Label>
                  <Input
                    value={selectedCustomer?.mobileNumber || ""}
                    readOnly
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground font-normal text-xs">Landline</Label>
                  <Input
                    value={selectedCustomer?.landline || ""}
                    readOnly
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground font-normal text-xs">Business Number</Label>
                  <Input
                    value={selectedCustomer?.businessPhone || ""}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SEPARATOR */}
          <div className="hidden lg:block border-l border-border" />

          {/* VEHICLE DETAILS */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-blue-500">
              <Car className="size-5" />
              <p className="font-semibold text-foreground">Vehicle Details</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2">
              <div className="sm:col-span-2 grid lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                  <Label className="text-muted-foreground font-normal text-xs">
                    Year / Make / Model
                  </Label>

                  {/* NO CUSTOMER */}
                  {!selectedCustomer && (
                    <Input value="" placeholder="Select customer first" disabled />
                  )}

                  {/* ONE VEHICLE → READ ONLY */}
                  {selectedCustomer && selectedCustomer.vehicles.length === 1 && (
                    <Input
                      value={`${selectedCustomer.vehicles[0].year} ${selectedCustomer.vehicles[0].make} ${selectedCustomer.vehicles[0].model}`}
                      readOnly
                    />
                  )}

                  {/* MULTIPLE VEHICLES → COMBOBOX */}
                  {selectedCustomer && selectedCustomer.vehicles.length > 1 && (
                    <Combobox
                      value={selectedVehicle?.id || ""}
                      onChange={(val) => {
                        const vehicle =
                          selectedCustomer.vehicles.find(v => v.id === val) || null;
                        setSelectedVehicle(vehicle);
                      }}
                      items={selectedCustomer.vehicles.map(v => ({
                        label: `${v.year} ${v.make} ${v.model}`,
                        value: v.id,
                      }))}
                      placeholder="Select vehicle"
                    />
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground font-normal text-xs">Variant</Label>
                  <Input
                    value={selectedVehicle?.variant || ""}
                    readOnly
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground font-normal text-xs">Color</Label>
                  <Input
                    value={selectedVehicle?.color || ""}
                    readOnly
                  />
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground font-normal text-xs">Plate No.</Label>
                <Input
                  value={selectedVehicle?.plateNo || ""}
                  readOnly
                />
              </div>
              <div>
                <Label className="text-muted-foreground font-normal text-xs">Engine No.</Label>
                <Input
                  value={selectedVehicle?.engineNo || ""}
                  readOnly
                />
              </div>
              <div>
                <Label className="text-muted-foreground font-normal text-xs">Chassis No. (VIN)</Label>
                <Input
                  value={selectedVehicle?.vin || ""}
                  readOnly
                />
              </div>
              <div>
                <Label className="text-muted-foreground font-normal text-xs">Registration No.</Label>
                <Input
                  value={selectedVehicle?.registrationNo || ""}
                  readOnly
                />
              </div>
              <div>
                <Label className="text-muted-foreground font-normal text-xs">Selling Dealer</Label>
                <Input
                  value={selectedVehicle?.sellingDealer || ""}
                  readOnly
                />
              </div>
              <div>
                <Label className="text-muted-foreground font-normal text-xs">Mileage</Label>
                <Input
                  required
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* ESTIMATE DETAILS */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* SERVICES */}
            <div className="rounded-lg border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 ">
                  <Wrench className="size-5 text-blue-500"/>
                  <h2 className="text-sm font-semibold text-foreground">Services (Job Order)</h2>                
                </div>
                <Button variant="outline" size="sm" onClick={addJOLine} className="h-7 gap-1 text-xs"><Plus className="h-3 w-3" /> Add Service</Button>
              </div>
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs">Service</TableHead>
                      <TableHead className="text-xs w-[20%]">Hourly Rate</TableHead>
                      <TableHead className="text-xs w-[15%]">Hours</TableHead>
                      <TableHead className="text-xs w-[20%]">Amount</TableHead>
                      <TableHead className="text-xs w-[5%]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {joLines.map((l, idx) => {
                      const filtered = servicesCatalog.filter((s) => s.name.toLowerCase().includes(l.service.toLowerCase()));
                      return (
                        <TableRow key={l.id}>
                          <TableCell className="relative overflow-visible">
                            <Combobox
                              value={l.service}
                              onChange={(val) => updateJO(idx, "service", val)}
                              items={servicesCatalog.map((s) => ({
                                label: `${s.name} - ₱${s.hourlyRate.toLocaleString()}`,
                                value: s.name,
                              }))}
                              placeholder="Select service"
                              allowAdd={true}
                              addLabel="service"
                              onAdd={(val) => updateJO(idx, "service", val)}
                            />
                          </TableCell>
                          <TableCell>{peso(l.hourlyRate)}</TableCell>
                          <TableCell>
                            <Input value={l.hours} onChange={(e) => updateJO(idx, "hours", e.target.value)} />
                          </TableCell>
                          <TableCell>{peso(l.amount)}</TableCell>
                          <TableCell>
                            {joLines.length > 1 && (
                              <Button size="icon" variant="ghost" onClick={() => removeJOLine(idx)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>          
            </div>

            {/* PARTS */}
            <div className="rounded-lg border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 ">
                  <Box className="size-5 text-orange-500"/>
                  <h2 className="text-sm font-semibold text-foreground">Parts (Sales Order)</h2>                
                </div>
                <Button variant="outline" size="sm" onClick={addSOLine} className="h-7 gap-1 text-xs"><Plus className="h-3 w-3" /> Add Part</Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs">Item Name</TableHead>
                      <TableHead className="text-xs w-[15%]">Qty</TableHead>
                      <TableHead className="text-xs w-[20%]">Unit Price</TableHead>
                      <TableHead className="text-xs w-[20%]">Amount</TableHead>
                      <TableHead className="text-xs w-[5%]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {soLines.map((l, idx) => {
                      const filtered = partsCatalog.filter((p) => p.name.toLowerCase().includes(l.itemName.toLowerCase()));
                      return (
                        <TableRow key={l.id}>
                          <TableCell>
                            <Combobox
                              value={l.itemName}
                              onChange={(val) => updateSO(idx, "itemName", val)}
                              items={partsCatalog.map((p) => ({
                                label: `${p.name} - SKU: ${p.sku}`,
                                value: p.name,
                              }))}
                              placeholder="Select part"
                              allowAdd={true}
                              addLabel="part"
                              onAdd={(val) => updateSO(idx, "itemName", val)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input type="number" value={l.quantity} onChange={(e) => updateSO(idx, "quantity", Number(e.target.value))} />
                          </TableCell>
                          <TableCell>{peso(l.unitPrice)}</TableCell>
                          <TableCell>{peso(l.amount)}</TableCell>
                          <TableCell>
                            {soLines.length > 1 && (
                              <Button size="icon" variant="ghost" onClick={() => removeSOLine(idx)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Billing Summary */}
          <div className="">
            <div className="sticky top-6 space-y-4">
              <Card className="shadow-lg border-primary/20">
                <CardHeader className="bg-primary/5 py-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2"><Calculator className="h-4 w-4" /> Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs text-muted-foreground"><span>Services Subtotal</span><span>{peso(totals.totalServices)}</span></div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-medium text-blue-600 uppercase">Service Tax</span>
                      {renderTaxControl(serviceTaxType, setServiceTaxType, serviceTaxValue, setServiceTaxValue)}
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-xs text-muted-foreground"><span>Parts Subtotal</span><span>{peso(totals.totalParts)}</span></div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-medium text-amber-600 uppercase">Parts Tax</span>
                      {renderTaxControl(partsTaxType, setPartsTaxType, partsTaxValue, setPartsTaxValue)}
                    </div>
                  </div>

                  <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                    <div className="flex justify-between items-end text-primary">
                      <span className="text-xs font-bold uppercase">Grand Total</span>
                      <span className="text-2xl font-black tracking-tight">{peso(totals.total)}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Internal Notes</Label>
                    <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Terms, warranty info, etc..." rows={3} className="resize-none text-xs bg-background" />
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <Button className="w-full shadow-md" size="lg">Issue Estimate</Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">Generate Invoice</Button>
                      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-destructive hover:bg-destructive/10">Discard</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <p className="text-xs text-center text-muted-foreground px-4">
                Creating an estimate will not affect inventory until it is converted to a Job Order.
              </p>
            </div>
          </div>
        </div>
      </div>

      <CustomerFormModal
        open={customerModalOpen}
        onOpenChange={setCustomerModalOpen}
        onSaved={handleCustomerSaved}
      />

    </div>
  );
};

export default AddEstimate;