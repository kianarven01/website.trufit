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
import AddCustomerVehicle from "@/components/popupModal/Customers/addCustomerVehicle";
import { toast } from "sonner";
import { Plus, Trash2, User, Car, Wrench, Box, Percent, Banknote, Calculator } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
  mobileNumber: string;
  landline?: string;
  businessPhone?: string;
}

interface Vehicle {
  id: string;
  customerId: string;
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

interface ServiceType {
  id: string;
  name: string;
  category: string;
  hourlyRate: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  unit: string;
  currentStock: number;
}

export interface Estimate {
  id: string;
  customer: Customer;
  vehicle: Vehicle;
  services: JOServiceLine[];
  parts: SOPartLine[];
  createdAt: string;
  lastEdited?: string;
  status: "issued" | "approved";
  subtotalServices: number;
  subtotalParts: number;
  serviceTax: number;
  partsTax: number;  
  total: number;
  notes?: string;
}

interface JOServiceLine {
  id: string;
  ServiceTypeId: string;
  name: string;
  category: string;
  hourlyRate: number;
  hours: number | ""; 
  amount: number;
}

interface SOPartLine {
  id: string;
  ProductId: string;
  name: string;
  sku: string;
  unit: string;
  price: number;
  quantity: number | "";
  amount: number;
}


/* STORAGE */
const STORAGE_KEY = "estimates";


const genLineId = () => crypto.randomUUID();

const emptyJOLine = (): JOServiceLine => ({
  id: genLineId(),
  ServiceTypeId: "",
  name: "",
  category: "",
  hourlyRate: 0,
  hours: 1,
  amount: 0,
});

const emptySOLine = (): SOPartLine => ({
  id: genLineId(),
  ProductId: "",
  name: "",
  sku: "",
  unit: "",
  price: 0,
  quantity: 1,
  amount: 0,
});

const AddEstimate: React.FC = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Add Customer Modal
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  // Add Vehicle Modal
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);

  const [date, setDate] = useState(new Date().toISOString());
  const [notes, setNotes] = useState("");

  const [serviceTaxType, setServiceTaxType] = useState<"₱" | "%">("%");
  const [serviceTaxValue, setServiceTaxValue] = useState(0);

  const [partsTaxType, setPartsTaxType] = useState<"₱" | "%">("%");
  const [partsTaxValue, setPartsTaxValue] = useState(0);

  const [joLines, setJoLines] = useState<JOServiceLine[]>([emptyJOLine()]);
  const [soLines, setSoLines] = useState<SOPartLine[]>([emptySOLine()]);

  const [servicesCatalog, setServicesCatalog] = useState<ServiceType[]>([]);
  const [partsCatalog, setPartsCatalog] = useState<Product[]>([]);

  const servicesMap = useMemo<Record<string, ServiceType>>(() => {
    return Object.fromEntries(
      servicesCatalog.map(s => [s.id, s])
    );
  }, [servicesCatalog]);

  const partsMap = useMemo<Record<string, Product>>(() => {
    return Object.fromEntries(
      partsCatalog.map(p => [p.id, p])
    );
  }, [partsCatalog]);

  const addJOLine = () => setJoLines((p) => [...p, emptyJOLine()]);
  const removeJOLine = (i: number) => setJoLines((p) => p.filter((_, idx) => idx !== i));

  const addSOLine = () => setSoLines((p) => [...p, emptySOLine()]);
  const removeSOLine = (i: number) => setSoLines((p) => p.filter((_, idx) => idx !== i));

  const getCustomerVehicles = (customerId: string) => vehicles.filter(v => v.customerId === customerId);
  const customerVehicles = vehicles.filter(v => v.customerId === selectedCustomer?.id);



  const handleAddCustomer = (search: string) => {
    setCustomerSearch(search); // optional prefill
    setCustomerModalOpen(true);
  };

  const handleCustomerSaved = (newCustomer: Customer & { __lastAddedVehicle?: Vehicle }) => {
    setCustomers((prev) => [...prev, newCustomer]);
    setSelectedCustomer(newCustomer);

    // Vehicle selection
    const relatedVehicles = getCustomerVehicles(newCustomer.id);

    if (newCustomer.__lastAddedVehicle) {
      setSelectedVehicle(newCustomer.__lastAddedVehicle);
    } else if (relatedVehicles.length === 1) {
      setSelectedVehicle(relatedVehicles[0]);
    } else {
      setSelectedVehicle(null); //if multiple vehicles, user must pick
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
    },
  ]);
}, []);


  useEffect(() => {
    // replace with API calls
    setServicesCatalog([
      { id: "1", name: "Oil Change", category: "Maintenance", hourlyRate: 1500 },
      { id: "2", name: "Brake Cleaning", category: "Brake", hourlyRate: 1200 },
      { id: "3", name: "Wheel Alignment", category: "Suspension", hourlyRate: 1800 },
    ]);

    setPartsCatalog([
      { id: "1", name: "Oil Filter", sku: "OF-100", price: 450, unit: "piece", currentStock: 10 },
      { id: "2", name: "Air Filter", sku: "AF-220", price: 650, unit: "piece", currentStock: 5 },
      { id: "3", name: "Brake Pad", sku: "BP-330", price: 2200, unit: "piece", currentStock: 3 },
    ]);
  }, []);


  const updateJO = (idx: number, field: keyof JOServiceLine, value: any) => {
    setJoLines((prev) =>
      prev.map((l, i) => {
        if (i !== idx) return l;

        let updated = { ...l, [field]: value };

        if (field === "ServiceTypeId") {
          const found = servicesMap[value];

          if (found) {
            updated.name = found.name;
            updated.category = found.category;
            updated.hourlyRate = found.hourlyRate;
            updated.amount = (updated.hours || 0) * found.hourlyRate;
          } else {
            updated.name = "";
            updated.category = "";
            updated.hourlyRate = 0;
            updated.amount = 0;
          }
        }

        if (field === "hours") {
          const hours = value === "" ? 0 : Math.max(0, Number(value));
          const found = servicesMap[updated.ServiceTypeId];

          updated.hours = hours;

          if (!found) {
            updated.amount = 0;
            return updated;
          }

          updated.amount = hours * found.hourlyRate;
        }

        return updated;
      })
    );
  };

  const updateSO = (idx: number, field: keyof SOPartLine, value: any) => {
    setSoLines((prev) =>
      prev.map((l, i) => {
        if (i !== idx) return l;

        let updated = { ...l, [field]: value };

        if (field === "ProductId") {
          const found = partsMap[value];

          if (found) {
            updated.name = found.name;
            updated.sku = found.sku;
            updated.unit = found.unit;
            updated.price = found.price;
            updated.amount = (updated.quantity || 0) * found.price;
          } else {
            updated.name = "";
            updated.sku = "";
            updated.unit = "";
            updated.price = 0;
            updated.amount = 0;
          }
        }

        if (field === "quantity") {
          const qty = value === "" ? 0 : Math.max(0, Number(value));
          const found = partsMap[updated.ProductId];

          updated.quantity = qty;

          if (!found) {
            updated.amount = 0;
            return updated;
          }

          const safeQty = Math.min(qty, found.currentStock);
          updated.amount = safeQty * found.price;
        }

        return updated;
      })
    );
  };


  const totals = useMemo(() => {
    const validJO = joLines.filter((l) => l.ServiceTypeId);
    const validSO = soLines.filter((l) => l.ProductId);

    const totalServices = validJO.reduce((s, l) => s + l.amount, 0);
    const totalParts = validSO.reduce((s, l) => s + l.amount, 0);

    const serviceTax = serviceTaxType === "%" ? totalServices * ((serviceTaxValue || 0) / 100) : (serviceTaxValue || 0);
    const partsTax = partsTaxType === "%" ? totalParts * ((partsTaxValue || 0) / 100) : (partsTaxValue || 0);

    const subtotal = totalServices + totalParts;
    const totalTax = serviceTax + partsTax;
    const total = subtotal + totalTax;

    return { totalServices, totalParts, subtotal, serviceTax, partsTax, totalTax, total, validJO, validSO };
  }, [joLines, soLines, serviceTaxType, serviceTaxValue, partsTaxType, partsTaxValue]);

  const toNumber = (val: string, max = Infinity) => {
    const num = parseFloat(val);
    if (isNaN(num)) return 0;
    return Math.min(Math.max(0, num), max);
  };

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
          <Input type="number" value={value || ""} onChange={e => setValue(toNumber(e.target.value))} className="w-24 h-7 pl-6 text-sm" />
        </div>
      ) : (
        <div className="relative">
          <Input type="number" value={value || ""} onChange={e => setValue(toNumber(e.target.value, type === "%" ? 100 : 100000))} className="w-24 h-7 pr-6 text-right text-sm" />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
        </div>
      )}
    </div>
  );

const saveEstimate = () => {
  if (!selectedCustomer || !selectedVehicle) {
    alert("Select customer and vehicle.");
    return;
  }

  // validate relationship via customerId
  const isValidVehicle = vehicles.some(
    (v) =>
      v.id === selectedVehicle.id &&
      v.customerId === selectedCustomer.id
  );

  if (!isValidVehicle) {
    alert("Invalid vehicle for selected customer.");
    return;
  }

  const now = new Date().toISOString();

  const newEstimate: Estimate = {
    id: `EST-${crypto.randomUUID()}`,
    customer: selectedCustomer,
    vehicle: selectedVehicle,
    services: joLines
      .filter((l) => l.ServiceTypeId)
      .map((l) => {
        const found = servicesMap[l.ServiceTypeId];

        return {
          id: l.id,
          ServiceTypeId: l.ServiceTypeId,
          name: found?.name || "",
          category: found?.category || "",
          hourlyRate: found?.hourlyRate || 0,
          hours: l.hours,
          amount: l.amount,
        };
      }),
    parts: soLines
      .filter((l) => l.ProductId)
      .map((l) => {
        const found = partsMap[l.ProductId];

        return {
          id: l.id,
          ProductId: l.ProductId,
          name: found?.name || "",
          sku: found?.sku || "",
          price: found?.price || 0,
          unit: found?.unit || "",
          currentStock: found?.currentStock || 0,
          quantity: l.quantity,
          amount: l.amount,
        };
      }),
    createdAt: now,
    lastEdited: now,
    status: "issued",
    subtotalServices: totals.totalServices,
    subtotalParts: totals.totalParts,
    serviceTax: totals.serviceTax,
    partsTax: totals.partsTax,
    total: totals.total,
    notes: notes || undefined,
  };

  if (totals.validJO.length === 0 && totals.validSO.length === 0) {
    alert("Add at least one service or part.");
    return;
  }

  if (totals.validJO.some(l => !l.hours || l.hours <= 0) || totals.validSO.some(l => !l.quantity || l.quantity <= 0)) {
    alert("Ensure all services/parts is not empty.");
    return;
}

  let estimates: Estimate[] = [];
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    estimates = Array.isArray(existing) ? existing : [];
  } catch (err) {
    console.error("Invalid localStorage data", err);
    estimates = [];
  }

  estimates.push(newEstimate);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(estimates));

  console.log("Estimate saved to localStorage:", newEstimate);
  alert("Estimate successfully created!");
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
                  value={selectedCustomer?.name || ""} 
                  onChange={(val) => {
                    const customer = customers.find(c => c.id === val) || null;

                    setSelectedCustomer(customer);

                    // Normalize vehicle selection
                    if (!customer) {
                      setSelectedVehicle(null);
                      return;
                    }

                    const customerVehicles = vehicles.filter(v => v.customerId === customer.id);
                    
                    if (customerVehicles.length === 0) {
                      setSelectedVehicle(null);
                    } else if (customerVehicles.length === 1) {
                      setSelectedVehicle(customerVehicles[0]);
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

                  {!selectedCustomer ? (
                    <Input value="" placeholder="Select customer first" disabled />
                  ) : customerVehicles.length === 1 ? (
                    <Input
                      value={`${customerVehicles[0].year} ${customerVehicles[0].make} ${customerVehicles[0].model}`}
                      readOnly
                    />
                  ) : (
                    <Combobox
                      value={selectedVehicle?.id || ""}
                      onChange={(val) => {
                        const vehicle =
                          customerVehicles.find(v => v.id === val) || null;
                        setSelectedVehicle(vehicle);
                      }}
                      items={customerVehicles.map(v => ({
                        label: `${v.year} ${v.make} ${v.model}`,
                        value: v.id,
                      }))}
                      placeholder={
                        customerVehicles.length === 0
                          ? "Select vehicle"
                          : "Select vehicle"
                      }
                      allowAdd
                      addLabel="vehicle"
                      onAdd={() => {
                        setVehicleModalOpen(true);
                      }}
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
                      return (
                        <TableRow key={l.id}>
                          <TableCell className="relative overflow-visible">
                            <Combobox
                              value={l.ServiceTypeId}
                              onChange={(val) => updateJO(idx, "ServiceTypeId", val)}
                              items={servicesCatalog.map((s) => ({
                                label: `${s.name} - ₱${s.hourlyRate.toLocaleString()}`,
                                value: s.id,
                              }))}
                              placeholder="Select service"
                            />
                          </TableCell>
                          <TableCell>{peso(
                            servicesMap[l.ServiceTypeId]?.hourlyRate || 0
                          )}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              value={l.hours === 0 ? "0" : String(l.hours)}
                              onFocus={(e) => {
                                if (l.hours === 0) { updateJO(idx, "hours", ""); }
                              }}
                              onBlur={(e) => {
                                const val = e.target.value;

                                if (val === "" || Number(val) === 0) { updateJO(idx, "hours", 0); }
                              }}
                              onChange={(e) => {
                                const val = e.target.value;
                                // block negative sign
                                if (val.includes("-")) return;
                                updateJO(idx, "hours", val === "" ? "" : Number(val));
                              }}
                            />
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
                      return (
                        <TableRow key={l.id}>
                          <TableCell>
                            <Combobox
                              value={l.ProductId}
                              onChange={(val) => updateSO(idx, "ProductId", val)}
                              items={partsCatalog.map((p) => ({
                                label: `${p.name} - SKU: ${p.sku}`,
                                value: p.id,
                              }))}
                              placeholder="Select part"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              value={l.quantity === 0 ? "0" : String(l.quantity)}
                              onFocus={(e) => {
                                if (l.quantity === 0) { updateSO(idx, "quantity", ""); }
                              }}
                              onBlur={(e) => {
                                const val = e.target.value;
                                if (val === "" || Number(val) === 0) { updateSO(idx, "quantity", 0); }
                              }}
                              onChange={(e) => {
                                const val = e.target.value;
                                // block negative sign
                                if (val.includes("-")) return;
                                updateSO(idx, "quantity", val === "" ? "" : Number(val));
                              }}
                            />
                          </TableCell>
                          <TableCell>{peso(
                            partsMap[l.ProductId]?.price || 0
                          )}</TableCell> 
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
                    <Textarea 
                    value={notes} 
                      onChange={e => setNotes(e.target.value)} 
                      placeholder="Terms, warranty info, etc..." 
                      rows={3} 
                      className="resize-none text-xs bg-background" 
                    />
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      className="w-full shadow-md" 
                      size="lg"
                      onClick={saveEstimate}
                      disabled= {
                        !selectedCustomer || 
                        !selectedVehicle ||
                        (totals.validJO.length === 0 && totals.validSO.length === 0) 
                      }
                    >
                      Issue Estimate
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigate(-1)} 
                      className="text-destructive hover:bg-destructive/10"
                    >
                      Discard
                    </Button>
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


    </div>
  );
};

export default AddEstimate;