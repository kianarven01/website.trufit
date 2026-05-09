import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

/* ================= STORAGE ================= */
const SERVICE_KEY = "services";
const CATEGORY_KEY = "serviceCategories";
const VEHICLE_SIZE_KEY = "vehicleSizes";
const PRICING_KEY = "servicePricing";

const STORAGE_KEY = "customers";
const VEHICLE_STORAGE_KEY = "vehicles";
const VEHICLE_MODEL_STORAGE_KEY = "vehicleModels";

const PRODUCT_KEY = "products";
const INVENTORY_KEY = "inventory";
const ESTIMATE_KEY = "estimates";
/* ================= TYPES ================= */

interface VehicleModel {
  id: string;
  year: number;
  make: string;
  model: string;
  variant: string;
  serviceClass: string;
}

interface Vehicle {
  id: string;
  customerId: string;
  vehicleModelId: string;
  color: string;
  plateNo: string;
  engineNo: string;
  vin: string;
  registrationNo: string;
  sellingDealer: string;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  mobileNumber: string;
  landline?: string;
  email?: string;
  businessPhone?: string;
}

type PricingType = "fixed" | "hourly rate";

interface Service {
  id: string;
  name: string;
  serviceCategoryId: string;
  description?: string;
  duration?: number;
  pricingType: PricingType;
}

interface VehicleSize {
  id: string;
  name: string;           
  abbreviation: string;
  vehicleTypes: string[];
}

interface ServicePricing {
  id: string;
  serviceId: string;
  vehicleSizeId: string;
  price: number;
}

interface ServiceCategory {
  id: string;
  name: string;
}

interface Product {
  id: string;
  image?: string;
  name: string;
  sku: string;
  price: number;
  unit: string;
}

interface Inventory {
  id: string;
  productId: string;
  quantity_on_hand: number;
}

export interface Estimate {
  id: string;
  customer: Customer;
  vehicle: Vehicle;
  mileage?: number;
  services: EstimateServiceLine[];
  parts: EstimatePartLine[];
  status: "issued" | "approved";
  subtotalServices: number;
  subtotalParts: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface JOServiceLine {
  id: string;
  ServiceTypeId: string;
  amount: number;
}

interface SOPartLine {
  id: string;
  ProductId: string;
  quantity: number | "";
  amount: number;
}


interface EstimateServiceLine extends JOServiceLine {
  service: string;
  category: string;
  estimateDuration: number;
  price: number;
}

interface EstimatePartLine extends SOPartLine {
  name: string;
  sku: string;
  price: number;
  unit: string;
}
                     

const genLineId = () => crypto.randomUUID();

const emptyJOLine = (): JOServiceLine => ({
  id: genLineId(),
  ServiceTypeId: "",
  amount: 0,
});

const emptySOLine = (): SOPartLine => ({
  id: genLineId(),
  ProductId: "",
  quantity: 1,
  amount: 0,
});

interface AddEstimateProps {
  mode?: "create" | "edit";
}

const AddEstimate: React.FC<AddEstimateProps> = ({ mode = "create" }) => {
  const { id: estimateId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleSizes, setVehicleSizes] = useState<VehicleSize[]>([]);
  const [mileage, setMileage] = useState<number>(0);
  // Add Customer Modal
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  // Add Vehicle Modal
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);



  const [notes, setNotes] = useState("");

  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [joLines, setJoLines] = useState<JOServiceLine[]>([emptyJOLine()]);
  const [soLines, setSoLines] = useState<SOPartLine[]>([emptySOLine()]);
  const [pricing, setPricing] = useState<ServicePricing[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);


  const [servicesCatalog, setServicesCatalog] = useState<Service[]>([]);
  const [partsCatalog, setPartsCatalog] = useState<Product[]>([]);


  const servicesMap = useMemo<Record<string, Service>>(() => {
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

  const customerVehicles = vehicles.filter(v => v.customerId === selectedCustomer?.id);


//========= HELPERS ==========//
const getVehicleModel = (vehicle?: Vehicle | null) =>
  vehicleModels.find(vm => vm.id === vehicle?.vehicleModelId);
  
const vm = useMemo(
  () => getVehicleModel(selectedVehicle),
  [selectedVehicle, vehicleModels]
);  

const categoryMap = useMemo<Record<string, ServiceCategory>>(
  () =>
    Object.fromEntries(
      serviceCategories.map(c => [c.id, c])
    ),
  [serviceCategories]
);

const getService = (serviceId: string) =>
  servicesMap[serviceId];

const getServicePrice = (
  serviceId: string,
  vehicle?: Vehicle | null
) => {
  if (!vehicle) return 0;

  const selectedVehicleModel = vehicleModels.find(
    m => m.id === vehicle.vehicleModelId
  );

  if (!selectedVehicleModel) return 0;

  // find matching vehicle size
  const matchedVehicleSize = vehicleSizes.find(vs =>
    vs.vehicleTypes?.some(
      vt =>
        vt.trim().toLowerCase() ===
        (selectedVehicleModel.serviceClass ?? "").trim().toLowerCase()
    )
  );

  if (!matchedVehicleSize) return 0;

  // find pricing for BOTH service + vehicle size
  const matchedPricing = pricing.find(
    p =>
      p.serviceId === serviceId &&
      p.vehicleSizeId === matchedVehicleSize.id
  );

  return matchedPricing?.price || 0;
};

const formatDuration = (minutes?: number) => {
  if (!minutes) return "-";

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hrs && mins) return `${hrs}h ${mins}m`;
  if (hrs) return `${hrs}h`;

  return `${mins}m`;
};


//===============  ==================//  
  const handleAddCustomer = (search: string) => {
    setCustomerSearch(search); // optional prefill
    setCustomerModalOpen(true);
  };

  const handleCustomerSaved = (newCustomer: Customer & { __lastAddedVehicle?: Vehicle }) => {
    setCustomers((prev) => [...prev, newCustomer]);
    setSelectedCustomer(newCustomer);

    // Vehicle selection — use vehicles from state + possible new vehicle
    const relatedVehicles = vehicles.filter(v => v.customerId === newCustomer.id);

    if (newCustomer.__lastAddedVehicle) {
      setSelectedVehicle(newCustomer.__lastAddedVehicle);
    } else if (relatedVehicles.length === 1) {
      setSelectedVehicle(relatedVehicles[0]);
    } else {
      setSelectedVehicle(null); //if multiple vehicles, user must pick
    }
  };

  const handleVehicleSaved = (newVehicle: Vehicle) => {
    setVehicles((prev) => [...prev, newVehicle]);
    setSelectedVehicle(newVehicle);
    setVehicleModalOpen(false);
  };


  //=============== USE EFFECT ==================//

useEffect(() => {
  const existingCustomers = localStorage.getItem(STORAGE_KEY);

  // already seeded
  if (existingCustomers) return;

  // =========================================
  // VEHICLE MODELS
  // =========================================
  const vehicleModels = Array.from({ length: 10 }, (_, i) => ({
    id: `vm-${i + 1}`,
    year: 2020 + (i % 5),
    make: ["Toyota", "Honda", "Ford", "Mitsubishi", "Nissan"][i % 5],
    model: `Model ${i + 1}`,
    variant: `Variant ${i + 1}`,
    serviceClass: ["SUV", "Sedan", "Pickup"][i % 3],
  }));

  // =========================================
  // CUSTOMERS
  // =========================================
  const customers = Array.from({ length: 10 }, (_, i) => ({
    id: `cust-${i + 1}`,
    firstName: "Customer",
    lastName: `${i + 1}`,
    address: `Address ${i + 1}`,
    mobileNumber: `0917000000${i}`,
    landline: `054-881-10${i}`,
    email: `customer${i + 1}@gmail.com`,
    businessPhone: `054-900-10${i}`,
  }));

  // =========================================
  // VEHICLES
  // =========================================
  const vehicles = customers.map((customer, i) => ({
    id: `veh-${i + 1}`,
    customerId: customer.id,
    vehicleModelId: vehicleModels[i].id,
    color: ["White", "Black", "Red", "Blue", "Gray"][i % 5],
    plateNo: `ABC-${1000 + i}`,
    engineNo: `ENG-${i + 1}`,
    vin: `VIN-${i + 1}`,
    registrationNo: `REG-${i + 1}`,
    sellingDealer: `Dealer ${i + 1}`,
    hasWarranty: i % 2 === 0,
  }));

  // =========================================
  // PRODUCTS
  // =========================================
  const products = Array.from({ length: 10 }, (_, i) => ({
    id: `prod-${i + 1}`,
    image: "",
    name: `Product ${i + 1}`,
    sku: `SKU-${i + 1}`,
    price: 100 + i * 50,
    unit: "pc",
  }));

  // =========================================
  // INVENTORY
  // =========================================
  const inventory = products.map((product, i) => ({
    id: `inv-${i + 1}`,
    productId: product.id,
    quantity_on_hand: 10 + i * 5,
  }));

  // =========================================
  // SAVE
  // =========================================
  localStorage.setItem(
    VEHICLE_MODEL_STORAGE_KEY,
    JSON.stringify(vehicleModels)
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(customers)
  );

  localStorage.setItem(
    VEHICLE_STORAGE_KEY,
    JSON.stringify(vehicles)
  );

  localStorage.setItem(
    PRODUCT_KEY,
    JSON.stringify(products)
  );

  localStorage.setItem(
    INVENTORY_KEY,
    JSON.stringify(inventory)
  );

  console.log("✅ Dummy data seeded successfully!");
}, []); // seed once

  // ── Load existing estimate in edit mode ──────────────────────────────────
  useEffect(() => {
    if (mode !== "edit" || !estimateId) return;

    try {
      const stored: Estimate[] = JSON.parse(localStorage.getItem(ESTIMATE_KEY) || "[]");
      const found = stored.find(e => e.id === estimateId);

      if (!found) {
        toast.error("Estimate not found.");
        navigate("/webapp/sales/estimates");
        return;
      }

      setSelectedCustomer(found.customer);
      setSelectedVehicle(found.vehicle);
      setMileage(found.mileage ?? 0);
      setNotes(found.notes ?? "");

      if (found.services.length > 0) {
        setJoLines(
          found.services.map(s => ({
            id: s.id,
            ServiceTypeId: s.ServiceTypeId,
            amount: s.amount,
          }))
        );
      }

      if (found.parts.length > 0) {
        setSoLines(
          found.parts.map(p => ({
            id: p.id,
            ProductId: p.ProductId,
            quantity: p.quantity,
            amount: p.amount,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load estimate for editing", err);
      toast.error("Failed to load estimate.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, estimateId]);


  useEffect(() => {
    try {
      const storedCustomers = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const storedVehicles = JSON.parse(localStorage.getItem(VEHICLE_STORAGE_KEY) || "[]");
      const storedServices = JSON.parse(localStorage.getItem(SERVICE_KEY) || "[]");
      const storedVehicleSizes = JSON.parse(localStorage.getItem(VEHICLE_SIZE_KEY) || "[]");
      const storedProducts = JSON.parse(localStorage.getItem(PRODUCT_KEY) || "[]");
      const storedModels = JSON.parse(localStorage.getItem(VEHICLE_MODEL_STORAGE_KEY) || "[]");
      const storedInventory = JSON.parse(localStorage.getItem(INVENTORY_KEY) || "[]");
      const storedPricing = JSON.parse(localStorage.getItem(PRICING_KEY) || "[]");
      const storedCategories = JSON.parse( localStorage.getItem(CATEGORY_KEY) || "[]");

      setCustomers(Array.isArray(storedCustomers) ? storedCustomers : []);
      setVehicles(Array.isArray(storedVehicles) ? storedVehicles : []);
      setVehicleSizes( Array.isArray(storedVehicleSizes) ? storedVehicleSizes : []);
      setServicesCatalog(Array.isArray(storedServices) ? storedServices : []);
      setPartsCatalog(Array.isArray(storedProducts) ? storedProducts : []);
      setVehicleModels(Array.isArray(storedModels) ? storedModels : []);
      setInventory(Array.isArray(storedInventory) ? storedInventory : []);
      setPricing(Array.isArray(storedPricing) ? storedPricing : []);
      setServiceCategories( Array.isArray(storedCategories) ? storedCategories : []);

    } catch (err) {
      console.error("Failed to load localStorage data", err);
    }
  }, []);


  const updateJO = (
    idx: number,
    serviceId: string
  ) => {
    setJoLines((prev) =>
      prev.map((l, i) => {
        if (i !== idx) return l;

        const service = servicesMap[serviceId];

        if (!service) {
          return {
            ...l,
            ServiceTypeId: serviceId,
            amount: 0,
          };
        }

        const rate = getServicePrice(
          serviceId,
          selectedVehicle
        );

        let amount = 0;

        // fixed pricing
        if (service.pricingType === "fixed") {
          amount = rate;
        }

        // hourly pricing
        else {
          const durationHours =
            (service.duration || 0) / 60;

          amount = rate * durationHours;
        }

        return {
          ...l,
          ServiceTypeId: serviceId,
          amount,
        };
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

          updated.amount = found ? (updated.quantity || 0) * found.price : 0;
        }

        if (field === "quantity") {
          const qty = value === "" ? 0 : Math.max(0, Number(value));
          const found = partsMap[updated.ProductId];

          if (!found) {
            updated.quantity = qty;
            updated.amount = 0;
            return updated;
          }

          const stockEntry = inventory.find(inv => inv.productId === updated.ProductId);
          const availableStock = stockEntry?.quantity_on_hand || 0;

          // Clamp qty to available stock and store the CLAMPED value
          const safeQty = Math.min(qty, availableStock);
          updated.quantity = safeQty;
          updated.amount = safeQty * found.price;
        }

        return updated;
      })
    );
  };


  const totals = useMemo(() => {
    const validJO = joLines.filter((l) => l.ServiceTypeId);
    const validSO = soLines.filter((l) => l.ProductId);

    const totalServices = validJO.reduce(
      (s, l) => s + l.amount,
      0
    );

    const totalParts = validSO.reduce(
      (s, l) => s + l.amount,
      0
    );

    const estimatedMinutes = validJO.reduce(
      (sum, l) => {
        const service = servicesMap[l.ServiceTypeId];

        if (!service?.duration) return sum;

        return sum + service.duration;
      },
      0
    );

    const total = totalServices + totalParts;

    return {
      totalServices,
      totalParts,
      total,
      estimatedMinutes,
      validJO,
      validSO,
    };
  }, [joLines, soLines, servicesMap]);


  const peso = (n: number) =>
    `₱${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;


const saveEstimate = () => {
  // ── 1. Validate first, build object after ───────────────────────────────
  if (!selectedCustomer || !selectedVehicle) {
    toast.error("Please select a customer and vehicle.");
    return;
  }

  // Validate vehicle belongs to the selected customer
  const isValidVehicle = vehicles.some(
    (v) => v.id === selectedVehicle.id && v.customerId === selectedCustomer.id
  );

  if (!isValidVehicle) {
    toast.error("The selected vehicle does not belong to this customer.");
    return;
  }

  if (mileage <= 0) {
    toast.error("Mileage is required.");
    return;
  }

  if (totals.validJO.length === 0 && totals.validSO.length === 0) {
    toast.error("Add at least one service or part.");
    return;
  }

  if (totals.validSO.some((l) => !l.quantity || l.quantity <= 0)) {
    toast.error("All part lines must have a quantity greater than zero.");
    return;
  }

  // ── 2. Build the estimate object ────────────────────────────────────────
  const now = new Date().toISOString();

  let estimates: Estimate[] = [];
  try {
    const existing = JSON.parse(localStorage.getItem(ESTIMATE_KEY) || "[]");
    estimates = Array.isArray(existing) ? existing : [];
  } catch (err) {
    console.error("Invalid localStorage data", err);
    estimates = [];
  }

  const builtServices: EstimateServiceLine[] = joLines
    .filter((l) => l.ServiceTypeId)
    .map((l) => {
      const service = servicesMap[l.ServiceTypeId];
      const category = categoryMap[service?.serviceCategoryId || ""];
      const rate = getServicePrice(l.ServiceTypeId, selectedVehicle);
      return {
        id: l.id,
        ServiceTypeId: l.ServiceTypeId,
        service: service?.name || "",
        category: category?.name || "",
        estimateDuration: service?.duration || 0,
        price: rate,
        amount: l.amount,
      };
    });

  const builtParts: EstimatePartLine[] = soLines
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
        quantity: l.quantity,
        amount: l.amount,
      };
    });

  if (mode === "edit" && estimateId) {
    // ── Edit: find & update existing estimate ────────────────────────────
    const idx = estimates.findIndex((e) => e.id === estimateId);
    if (idx === -1) {
      toast.error("Estimate not found. It may have been deleted.");
      return;
    }

    estimates[idx] = {
      ...estimates[idx],
      customer: selectedCustomer,
      vehicle: selectedVehicle,
      mileage: mileage,
      services: builtServices,
      parts: builtParts,
      subtotalServices: totals.totalServices,
      subtotalParts: totals.totalParts,
      total: totals.total,
      notes: notes || undefined,
      updatedAt: now,
    };

    localStorage.setItem(ESTIMATE_KEY, JSON.stringify(estimates));
    toast.success("Estimate updated successfully!");
  } else {
    // ── Create: append new estimate ──────────────────────────────────────
    const newEstimate: Estimate = {
      id: `EST-${crypto.randomUUID()}`,
      customer: selectedCustomer,
      vehicle: selectedVehicle,
      mileage: mileage,
      services: builtServices,
      parts: builtParts,
      createdAt: now,
      updatedAt: now,
      status: "issued",
      subtotalServices: totals.totalServices,
      subtotalParts: totals.totalParts,
      total: totals.total,
      notes: notes || undefined,
    };

    estimates.push(newEstimate);
    localStorage.setItem(ESTIMATE_KEY, JSON.stringify(estimates));
    toast.success("Estimate created successfully!");
  }

  navigate("/webapp/sales/estimates");
};


  return (
    <div className="w-full h-full pl-4 pr-3 pb-4 flex flex-col gap-4 overflow-y-auto">
      {/* BREADCRUMB */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate("/webapp/sales/estimates")}>Estimates</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{mode === "edit" ? "Edit Estimate" : "New Estimate"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* HEADER */}
      <DataToolbar variant="detail" title={mode === "edit" ? "Edit Estimate" : "Create New Estimate"} />

      <div className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-4">
          {/* CUSTOMER DETAILS */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-blue-500">
                <User className="size-5" />
                <p className="font-semibold text-foreground">Customer Details</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <Label className="text-muted-foreground font-normal text-xs">Full Name</Label>
                  <Combobox
                    value={selectedCustomer?.id || ""}
                    onChange={(val) => {
                      const customer = customers.find(c => c.id === val) || null;

                      setSelectedCustomer(customer);

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
                      label: `${c.firstName} ${c.lastName}`,
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
            </CardContent>
          </Card>

          {/* VEHICLE DETAILS */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-blue-500">
                <Car className="size-5" />
                <p className="font-semibold text-foreground">Vehicle Details</p>
              </div>              
            </CardHeader>
            <CardContent>
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
                        value={vm ? `${vm.year} ${vm.make} ${vm.model}` : ""}
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
                        items={customerVehicles.map(v => {
                          const vm = vehicleModels.find(m => m.id === v.vehicleModelId);
                          return {
                            label: vm ? `${vm.year} ${vm.make} ${vm.model}` : "",
                            value: v.id
                          }
                        })}
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
                      value={vm?.variant || ""}
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
                    type="number"
                    value={mileage}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMileage(Number(val));
                    }}
                  />
                </div>
              </div>                
            </CardContent>          
          </Card>
        </div>
        
        {/* ESTIMATE DETAILS */}
        <div className="grid lg:grid-cols-3 gap-4">
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
                      <TableHead className="text-xs w-[40%]">Service</TableHead>
                      <TableHead className="text-xs ">Est. Duration</TableHead>
                      <TableHead className="text-xs ">Rate</TableHead>
                      <TableHead className="text-xs w-[5%]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {joLines.map((l, idx) => {
                      const service = getService(l.ServiceTypeId);
                      const rate = getServicePrice(l.ServiceTypeId, selectedVehicle);
                    
                      return (
                        <TableRow key={l.id}>
                          <TableCell className="relative overflow-visible">
                            <Combobox
                              showGroupSeparator
                              value={l.ServiceTypeId}
                              onChange={(val) => updateJO(idx, val)}
                              placeholder="Select service"
                              items={[...servicesCatalog]
                                .sort((a, b) => {
                                  const categoryA =
                                    categoryMap[a.serviceCategoryId]?.name || "Uncategorized";

                                  const categoryB =
                                    categoryMap[b.serviceCategoryId]?.name || "Uncategorized";

                                  // sort by category first
                                  const categoryCompare = categoryA.localeCompare(categoryB);

                                  if (categoryCompare !== 0) {
                                    return categoryCompare;
                                  }

                                  // then sort items alphabetically inside category
                                  return (a.name || "").localeCompare(b.name || "");
                                })
                                  .map((s) => {
                                  const price = getServicePrice(
                                    s.id,
                                    selectedVehicle
                                  );

                                  const category =
                                    categoryMap[s.serviceCategoryId];

                                  return {
                                    label: s.name,
                                    value: s.id,

                                    group: category?.name || "Uncategorized",

                                    description: [
                                      formatDuration(s.duration),
                                      `${peso(price)}`,
                                      s.pricingType === "fixed"
                                        ? "Fixed"
                                        : "Hourly",
                                    ]
                                      .filter(Boolean)
                                      .join(" • "),
                                  };
                                })}
                            />
                          </TableCell>
                          <TableCell>
                            {formatDuration(service?.duration)}
                          </TableCell>
                          <TableCell >
                            <div className="flex flex-col">
                              <p>
                                {service
                                  ? service.pricingType === "fixed"
                                    ? `${peso(rate)}`
                                    : `${peso(rate)}`
                                  : "-"}
                              </p>
                              <span className="text-[10px] text-muted-foreground">
                                {service
                                  ? service.pricingType === "fixed"
                                    ? "Fixed"
                                    : "hourly rate"
                                  : ""}                                
                              </span>
                            </div>
                          </TableCell>                          
                          <TableCell>
                            {joLines.length > 1 && (
                              <Button size="icon_xs" variant="ghost" onClick={() => removeJOLine(idx)}>
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
                      <TableHead className="text-xs w-[20%]">Unit Price</TableHead>
                      <TableHead className="text-xs w-[15%]">Qty</TableHead>
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
                          <TableCell>{peso(
                            partsMap[l.ProductId]?.price || 0
                          )}</TableCell>                          
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
                                if (!/^\d*$/.test(val)) return;
                                updateSO(idx, "quantity", val === "" ? "" : Number(val));
                              }}
                            />
                          </TableCell> 
                          <TableCell>{peso(l.amount)}</TableCell>
                          <TableCell>
                            {soLines.length > 1 && (
                              <Button size="icon_xs" variant="ghost" onClick={() => removeSOLine(idx)}>
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
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Estimated Duration</span>
                      <span>{formatDuration(totals.estimatedMinutes)}</span>
                    </div>
                    <Separator/>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Services Subtotal</span>
                      <span>{peso(totals.totalServices)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Parts Subtotal</span>
                      <span>{peso(totals.totalParts)}</span>
                    </div>
                  </div>

                  <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                    <div className="flex justify-between items-end text-primary">
                      <span className="text-xs font-bold uppercase">Grand Total</span>
                      <span className="text-2xl font-bold tracking-wide">{peso(totals.total)}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Internal Notes</Label>
                    <Textarea 
                    value={notes} 
                      onChange={e => setNotes(e.target.value)} 
                      placeholder="Terms, warranty info, etc..." 
                      rows={4} 
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
                        !mileage ||
                        (totals.validJO.length === 0 && totals.validSO.length === 0) 
                      }
                    >
                      {mode === "edit" ? "Save Changes" : "Issue Estimate"}
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
                Creating an estimate will not affect inventory until it has been approved by the customer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEstimate;