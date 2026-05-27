import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DataToolbar from "@/components/DataToolbar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import Combobox from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CurrencyInput from "@/components/ui/currencyInput";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { toast } from "sonner";
import { Plus, Trash2, User, Car, Wrench, Box, Calculator, AlertTriangle } from "lucide-react";

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

const JOB_ORDER_KEY = "jobOrders";
const SALES_ORDER_KEY = "salesOrders";
const PURCHASE_REQUEST_KEY = "purchaseRequests";

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
  partNumber?: string;
  price: number;
  unit: string;
}

interface Inventory {
  id: string;
  productId: string;
  quantity_on_hand: number;
}

interface JOServiceLine {
  id: string;
  ServiceTypeId: string;
  manualRate?: number;
  amount: number;
}

interface JobOrderServiceLine extends JOServiceLine {
  service: string;
  category: string;
  Duration: number;
  price: number;
}

interface SOPartLine {
  id: string;
  ProductId: string;
  quantity: number | "";
  amount: number;
}

interface SalesOrderPartLine extends SOPartLine {
  name: string;
  sku: string;
  price: number;
  unit: string;
}

export interface JobOrder {
  id: string;
  jobOrderNo: string;
  customer: Customer;
  vehicle?: Vehicle | null;
  mileage?: number;
  services: JOServiceLine[];
  subtotalServices: number;
  linkedSO?: string | null;
  total: number;
  notes?: string;
  status: "issued" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface SalesOrder {
  id: string;
  salesOrderNo: string;
  customer: Customer;
  vehicle?: Vehicle | null;
  mileage?: number;
  parts: SalesOrderPartLine[];
  subtotalParts: number;
  linkedJO?: string | null;
  total: number;
  notes?: string;
  status: "issued" | "completed";
  createdAt: string;
  updatedAt: string;
}

interface PurchaseRequestItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  shortage: number;
}

interface PurchaseRequest {
  id: string;
  prNo: string;
  linkedJO?: string | null;
  linkedSO?: string | null;
  customer: Customer;
  vehicle?: Vehicle | null;
  items: PurchaseRequestItem[];
  status: "issued" | "approved" | "completed";
  createdAt: string;
  updatedAt: string;
}

interface JobOrderProps {
  mode?: "create" | "edit";
}

/* ================= HELPERS ================= */

const genLineId = () => crypto.randomUUID();

const emptyJOLine = (): JOServiceLine => ({
  id: genLineId(),
  ServiceTypeId: "",
  manualRate: undefined,
  amount: 0,
});

const emptySOLine = (): SOPartLine => ({
  id: genLineId(),
  ProductId: "",
  quantity: 1,
  amount: 0,
});

const genJobOrderNo = () =>
  `JO-${crypto.randomUUID()
    .replace(/-/g, "")
    .slice(0, 6)
    .toUpperCase()}`;

const genSalesOrderNo = () =>
  `SO-${crypto.randomUUID()
    .replace(/-/g, "")
    .slice(0, 6)
    .toUpperCase()}`;

/* ================= SEED DATA ================= */

const seedServices = () => {
  const existing = localStorage.getItem(SERVICE_KEY);

  if (existing) return;

  const genId = () => crypto.randomUUID();

  /* CATEGORIES */
  const categories: ServiceCategory[] = [
    { id: genId(), name: "Maintenance" },
    { id: genId(), name: "Repair" },
    { id: genId(), name: "Detailing" },
    { id: genId(), name: "Inspection" },
  ];

  /* VEHICLE SIZES */
  const vehicleSizes: VehicleSize[] = [
    {
      id: genId(),
      name: "Small Vehicles",
      abbreviation: "S",
      vehicleTypes: ["Sedan"],
    },
    {
      id: genId(),
      name: "Medium Vehicles",
      abbreviation: "M",
      vehicleTypes: ["SUV"],
    },
    {
      id: genId(),
      name: "Large Vehicles",
      abbreviation: "L",
      vehicleTypes: ["Pickup"],
    },
  ];

  /* SERVICES */
  const serviceTemplates = [
    {
      name: "Oil Change",
      category: "Maintenance",
      duration: 60,
      pricingType: "fixed" as PricingType,
    },
    {
      name: "Brake Service",
      category: "Repair",
      duration: 120,
      pricingType: "hourly rate" as PricingType,
    },
    {
      name: "Engine Tune-up",
      category: "Maintenance",
      duration: 180,
      pricingType: "hourly rate" as PricingType,
    },
    {
      name: "Car Wash",
      category: "Detailing",
      duration: 45,
      pricingType: "fixed" as PricingType,
    },
    {
      name: "Interior Cleaning",
      category: "Detailing",
      duration: 90,
      pricingType: "fixed" as PricingType,
    },
    {
      name: "Battery Replacement",
      category: "Repair",
      duration: 30,
      pricingType: "fixed" as PricingType,
    },
    {
      name: "Wheel Alignment",
      category: "Inspection",
      duration: 60,
      pricingType: "hourly rate" as PricingType,
    },
    {
      name: "Aircon Cleaning",
      category: "Maintenance",
      duration: 120,
      pricingType: "fixed" as PricingType,
    },
  ];

  const services: Service[] = [];
  const pricing: ServicePricing[] = [];

  serviceTemplates.forEach((template, index) => {
    const category = categories.find(
      (c) => c.name === template.category
    );

    if (!category) return;

    const serviceId = genId();

    services.push({
      id: serviceId,
      name: template.name,
      serviceCategoryId: category.id,
      description: "Standard automotive service package",
      duration: template.duration,
      pricingType: template.pricingType,
    });

    vehicleSizes.forEach((size, sizeIndex) => {
      pricing.push({
        id: genId(),
        serviceId,
        vehicleSizeId: size.id,
        price:
          1000 +
          index * 350 +
          sizeIndex * 500,
      });
    });
  });

  localStorage.setItem(
    CATEGORY_KEY,
    JSON.stringify(categories)
  );

  localStorage.setItem(
    VEHICLE_SIZE_KEY,
    JSON.stringify(vehicleSizes)
  );

  localStorage.setItem(
    SERVICE_KEY,
    JSON.stringify(services)
  );

  localStorage.setItem(
    PRICING_KEY,
    JSON.stringify(pricing)
  );
};



const JobOrderForm: React.FC<JobOrderProps> = ({ mode = "create" }) => {
  const { id: jobOrderId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleSizes, setVehicleSizes] = useState<VehicleSize[]>([]);

  const [mileage, setMileage] = useState<number>(0);
  const [notes, setNotes] = useState("");

  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [joLines, setJoLines] = useState<JOServiceLine[]>([emptyJOLine()]);
  const [soLines, setSoLines] = useState<SOPartLine[]>([emptySOLine()]);
  const [pricing, setPricing] = useState<ServicePricing[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [servicesCatalog, setServicesCatalog] = useState<Service[]>([]);
  const [partsCatalog, setPartsCatalog] = useState<Product[]>([]);

  /* ================= MAPS ================= */

  const servicesMap = useMemo<Record<string, Service>>(() => {
    return Object.fromEntries(
      servicesCatalog.map((s) => [s.id, s])
    );
  }, [servicesCatalog]);

  const partsMap = useMemo<Record<string, Product>>(() => {
    return Object.fromEntries(
      partsCatalog.map((p) => [p.id, p])
    );
  }, [partsCatalog]);

  const categoryMap = useMemo<Record<string, ServiceCategory>>(
    () =>
      Object.fromEntries(
        serviceCategories.map((c) => [c.id, c])
      ),
    [serviceCategories]
  );

  /* ================= HELPERS ================= */

  const customerVehicles = vehicles.filter(
    (v) => v.customerId === selectedCustomer?.id
  );

  const getVehicleModel = (vehicle?: Vehicle | null) =>
    vehicleModels.find(
      (vm) => vm.id === vehicle?.vehicleModelId
    );

  const vm = useMemo(
    () => getVehicleModel(selectedVehicle),
    [selectedVehicle, vehicleModels]
  );

  const getService = (serviceId: string) =>
    servicesMap[serviceId];

  const getServicePrice = (
    serviceId: string,
    vehicle?: Vehicle | null
  ) => {
    if (!vehicle) return 0;

    const selectedVehicleModel = vehicleModels.find(
      (m) => m.id === vehicle.vehicleModelId
    );

    if (!selectedVehicleModel) return 0;

    const matchedVehicleSize = vehicleSizes.find((vs) =>
      vs.vehicleTypes?.some(
        (vt) =>
          vt.trim().toLowerCase() ===
          (
            selectedVehicleModel.serviceClass ?? ""
          ).trim().toLowerCase()
      )
    );

    if (!matchedVehicleSize) return 0;

    const matchedPricing = pricing.find(
      (p) =>
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

  const peso = (n: number) =>
    `₱${n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  /* ================= LOAD ================= */

  useEffect(() => {
    seedServices();
    try {
      const storedCustomers = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const storedVehicles = JSON.parse(localStorage.getItem(VEHICLE_STORAGE_KEY) || "[]");
      const storedServices = JSON.parse(localStorage.getItem(SERVICE_KEY) || "[]");
      const storedVehicleSizes = JSON.parse(localStorage.getItem(VEHICLE_SIZE_KEY) || "[]");
      const storedProducts = JSON.parse(localStorage.getItem(PRODUCT_KEY) || "[]");
      const storedModels = JSON.parse(localStorage.getItem(VEHICLE_MODEL_STORAGE_KEY) || "[]");
      const storedInventory = JSON.parse(localStorage.getItem(INVENTORY_KEY) || "[]");
      const storedPricing = JSON.parse(localStorage.getItem(PRICING_KEY) || "[]");
      const storedCategories = JSON.parse(localStorage.getItem(CATEGORY_KEY) || "[]");

      setCustomers(Array.isArray(storedCustomers) ? storedCustomers : []);
      setVehicles(Array.isArray(storedVehicles) ? storedVehicles : []);
      setVehicleSizes(Array.isArray(storedVehicleSizes) ? storedVehicleSizes : []);
      setServicesCatalog(Array.isArray(storedServices) ? storedServices : []);
      setPartsCatalog(Array.isArray(storedProducts) ? storedProducts : []);
      setVehicleModels(Array.isArray(storedModels) ? storedModels : []);
      setInventory(Array.isArray(storedInventory) ? storedInventory : []);
      setPricing(Array.isArray(storedPricing) ? storedPricing : []);
      setServiceCategories(Array.isArray(storedCategories) ? storedCategories : []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  /* ================= EDIT ================= */

  useEffect(() => {
    if (mode !== "edit" || !jobOrderId) return;

    try {
      const stored: JobOrder[] = JSON.parse(localStorage.getItem(JOB_ORDER_KEY) || "[]");

      const found = stored.find((j) => j.id === jobOrderId);

      if (!found) {
        toast.error("Job order not found.");
        navigate("/webapp/service/job-orders");
        return;
      }

      setSelectedCustomer(found.customer || null);
      setSelectedVehicle(found.vehicle || null);
      setMileage(found.mileage || 0);
      setNotes(found.notes || "");

      if (found.services.length > 0) {
        setJoLines(
          found.services.map((s: any) => ({
            id: s.id,
            ServiceTypeId: s.ServiceTypeId,
            manualRate: s.price,
            amount: s.amount,
          }))
        );
      }

      if (found.linkedSO) {
        const salesOrders: SalesOrder[] = JSON.parse(
          localStorage.getItem(SALES_ORDER_KEY) || "[]"
        );

        const linkedSO = salesOrders.find(
          (so) => so.id === found.linkedSO
        );

        if (linkedSO?.parts?.length) {
          setSoLines(
            linkedSO.parts.map((p) => ({
              id: p.id,
              ProductId: p.ProductId,
              quantity: p.quantity,
              amount: p.amount,
            }))
          );
        } else {
          setSoLines([emptySOLine()]);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load job order.");
    }
  }, [mode, jobOrderId, navigate]);

  /* ================= JO ================= */

  const addJOLine = () =>
    setJoLines((p) => [...p, emptyJOLine()]);

  const removeJOLine = (i: number) =>
    setJoLines((p) =>
      p.filter((_, idx) => idx !== i)
    );

  const updateJO = (
    idx: number,
    serviceId: string
  ) => {
    if (joLines[idx]?.ServiceTypeId === serviceId)
      return;

    if (serviceId) {
      const alreadyUsed = joLines.some(
        (l, i) =>
          i !== idx &&
          l.ServiceTypeId === serviceId
      );

      if (alreadyUsed) {
        const svc = servicesMap[serviceId];

        toast.warning(
          `"${svc?.name ?? "Service"}" is already added.`
        );

        return;
      }
    }

    setJoLines((prev) =>
      prev.map((l, i) => {
        if (i !== idx) return l;

        const service = servicesMap[serviceId];

        if (!service) {
          return {
            ...l,
            ServiceTypeId: serviceId,
            manualRate: undefined,
            amount: 0,
          };
        }

        const catalogRate = getServicePrice(
          serviceId,
          selectedVehicle
        );

        const amount =
          service.pricingType === "fixed"
            ? catalogRate
            : catalogRate *
              ((service.duration || 0) / 60);

        return {
          ...l,
          ServiceTypeId: serviceId,
          manualRate: undefined,
          amount,
        };
      })
    );
  };

  const updateJORate = (
    idx: number,
    rawValue: string
  ) => {
    setJoLines((prev) =>
      prev.map((l, i) => {
        if (i !== idx) return l;

        const manualRate =
          rawValue === ""
            ? undefined
            : Math.max(0, Number(rawValue));

        const service =
          servicesMap[l.ServiceTypeId];

        const rate =
          manualRate ??
          getServicePrice(
            l.ServiceTypeId,
            selectedVehicle
          );

        const amount = !service
          ? 0
          : service.pricingType === "fixed"
          ? rate
          : rate *
            ((service.duration || 0) / 60);

        return {
          ...l,
          manualRate,
          amount,
        };
      })
    );
  };

  /* ================= SO ================= */

  const addSOLine = () =>
    setSoLines((p) => [...p, emptySOLine()]);

  const removeSOLine = (i: number) => {
    setSoLines((prev) => {
      if (prev.length === 1) {
        return [emptySOLine()];
      }

      return prev.filter((_, idx) => idx !== i);
    });
  };

  const updateSO = (
    idx: number,
    field: keyof SOPartLine,
    value: any
  ) => {

    // DUPLICATE MERGE
    if (field === "ProductId" && value) {
      const existingIdx = soLines.findIndex(
        (l, i) =>
          i !== idx &&
          l.ProductId === value
      );

      if (existingIdx !== -1) {
        const product = partsMap[value];

        setSoLines((prev) => {
          const next = prev.filter(
            (_, i) => i !== idx
          );

          return next.map((l, i) => {

            if (
              i !==
              existingIdx -
                (idx < existingIdx ? 1 : 0)
            ) {
              return l;
            }

            const qty =
              (Number(l.quantity) || 0) + 1;

            return {
              ...l,
              quantity: qty,
              amount: qty * (product?.price || 0),
            };
          });
        });

        toast.info(
          `"${product?.name}" already exists. Quantity increased.`
        );

        return;
      }
    }

    setSoLines((prev) =>
      prev.map((l, i) => {

        if (i !== idx) return l;

        let updated = {
          ...l,
          [field]: value,
        };

        // PRODUCT CHANGE
        if (field === "ProductId") {
          const found = partsMap[value];
          const stockEntry = inventory.find(
            (inv) => inv.productId === value
          );

          const availableStock = stockEntry?.quantity_on_hand || 0;
          const initialQty = availableStock > 0 ? 1 : 0;

          updated.quantity = initialQty;
          updated.amount = initialQty * (found?.price || 0);
        }

        // QUANTITY CHANGE
        if (field === "quantity") {
          const qty =
            value === ""
              ? 0
              : Math.max(0, Number(value));

          const found = partsMap[updated.ProductId];
          updated.quantity = qty;
          updated.amount = qty * (found?.price || 0);
        }

        return updated;
      })
    );
  };

  /* ================= TOTALS ================= */

  const totals = useMemo(() => {
    const validJO = joLines.filter((l) => l.ServiceTypeId);
    const validSO = soLines.filter((l) => l.ProductId);
    const totalServices = validJO.reduce((s, l) => s + l.amount, 0);
    const totalParts = validSO.reduce((s, l) => s + l.amount, 0);

    const estimatedMinutes = validJO.reduce(
      (sum, l) => {
        const service = servicesMap[l.ServiceTypeId];
        if (!service?.duration) return sum;
        return sum + service.duration;
      }, 0
    );

    return {
      validJO,
      validSO,
      totalServices,
      totalParts,
      estimatedMinutes,
      total: totalServices + totalParts,
    };
  }, [joLines, soLines, servicesMap]);


  const insufficientStockItems = useMemo(() => {
    return soLines
      .filter((line) => {

        if (!line.ProductId) return false;

        const stockEntry = inventory.find(
          (inv) => inv.productId === line.ProductId
        );

        const availableStock =
          stockEntry?.quantity_on_hand || 0;

        return Number(line.quantity) > availableStock;
      })
      .map((line) => partsMap[line.ProductId]?.name)
      .filter(Boolean);

  }, [soLines, inventory, partsMap]);

  /* ================= SAVE ================= */

  const saveJobOrder = () => {
    if (!selectedCustomer || !selectedVehicle) {
      toast.error("Please select a customer and vehicle.");
      return;
    }

    if (mileage <= 0) {toast.error("Mileage is required.");
      return;
    }

    if (totals.validJO.length === 0) {
      toast.error("Add at least one service.");
      return;
    }

    const now = new Date().toISOString();
    let jobOrders: JobOrder[] = [];
    let salesOrders: SalesOrder[] = [];

    try {
      jobOrders = JSON.parse(localStorage.getItem(JOB_ORDER_KEY) || "[]");
      salesOrders = JSON.parse(localStorage.getItem(SALES_ORDER_KEY) || "[]");
    } catch {
      jobOrders = [];
      salesOrders = [];
    }

    const builtServices: JobOrderServiceLine[] =
      totals.validJO.map((l) => {
        const service = servicesMap[l.ServiceTypeId];
        const category = categoryMap[service?.serviceCategoryId || ""];

        const rate = l.manualRate ?? getServicePrice(l.ServiceTypeId, selectedVehicle);

        return {
          id: l.id,
          ServiceTypeId: l.ServiceTypeId,
          service: service?.name || "",
          category: category?.name || "",
          Duration: service?.duration || 0,
          price: rate,
          amount: l.amount,
          manualRate: l.manualRate,
        };
      });

    const builtParts: SalesOrderPartLine[] = totals.validSO.map((l) => {
        const found = partsMap[l.ProductId];

        return {
          id: l.id,
          ProductId: l.ProductId,
          quantity: l.quantity,
          amount: l.amount,
          name: found?.name || "",
          sku: found?.sku || "",
          price: found?.price || 0,
          unit: found?.unit || "",
        };
      });

      let linkedSOId: string | null = null;

      const existingJobOrder =
        mode === "edit" && jobOrderId
          ? jobOrders.find((j) => j.id === jobOrderId)
          : null;

      if (builtParts.length > 0) {
        // UPDATE EXISTING LINKED SO
        if (
          existingJobOrder?.linkedSO
        ) {

          const soIdx = salesOrders.findIndex(
            (s) => s.id === existingJobOrder.linkedSO
          );

          if (soIdx !== -1) {

            salesOrders[soIdx] = { ...salesOrders[soIdx],
              linkedJO: existingJobOrder.id,
              customer: selectedCustomer,
              vehicle: selectedVehicle,
              mileage,
              parts: builtParts,
              subtotalParts: totals.totalParts,
              total: totals.totalParts,
              notes: notes || undefined,
              updatedAt: now,
            };

            linkedSOId = salesOrders[soIdx].id;
          }

        } else {

          // CREATE NEW SO
          const salesOrder: SalesOrder = {
            id: crypto.randomUUID(),
            salesOrderNo: genSalesOrderNo(),
            linkedJO:
              mode === "edit"
                ? jobOrderId
                : null,

            customer: selectedCustomer,
            vehicle: selectedVehicle,
            mileage,
            parts: builtParts,
            subtotalParts: totals.totalParts,
            total: totals.totalParts,
            notes: notes || undefined,
            status: "issued",
            createdAt: now,
            updatedAt: now,
          };

          salesOrders.push(salesOrder);
          linkedSOId = salesOrder.id;
        }

        localStorage.setItem( SALES_ORDER_KEY, JSON.stringify(salesOrders));
      }


      // PURCHASE REQUEST CREEATION
      const insufficientItems = builtParts
        .map((part) => {
          const stockEntry = inventory.find(
            (inv) =>
              inv.productId === part.ProductId
          );

          const available = stockEntry?.quantity_on_hand || 0;
          const shortage = Number(part.quantity) - available;
          if (shortage <= 0) return null;

          return {
            id: crypto.randomUUID(),
            productId: part.ProductId,
            name: part.name,
            sku: part.sku,
            quantity: Number(part.quantity),
            shortage,
          };
        })
        .filter(Boolean);

      if (insufficientItems.length > 0) {
        let purchaseRequests = [];

        try {
          purchaseRequests = JSON.parse(localStorage.getItem(PURCHASE_REQUEST_KEY) || "[]");
        } catch {
          purchaseRequests = [];
        }

        const purchaseRequest: PurchaseRequest = {

          id: crypto.randomUUID(),

          prNo: `PR-${crypto.randomUUID()
            .replace(/-/g, "")
            .slice(0, 6)
            .toUpperCase()}`,

          linkedJO:
            mode === "edit"
              ? jobOrderId
              : null,
          linkedSO: linkedSOId,
          customer: selectedCustomer,
          vehicle: selectedVehicle,
          items: insufficientItems as PurchaseRequestItem[],

          status: "issued",
          createdAt: now,
          updatedAt: now,
        };

        purchaseRequests.push(purchaseRequest);
        localStorage.setItem(PURCHASE_REQUEST_KEY, JSON.stringify(purchaseRequests));

        toast.warning(
          "Purchase request created automatically due to insufficient inventory."
        );
      }



    if (mode === "edit" && jobOrderId) {const idx = jobOrders.findIndex((j) => j.id === jobOrderId);

      if (idx === -1) {
        toast.error("Job order not found.");
        return;
      }

      jobOrders[idx] = {
        ...jobOrders[idx],
        customer: selectedCustomer,
        vehicle: selectedVehicle,
        mileage,
        services: builtServices,
        subtotalServices:
          totals.totalServices,
        linkedSO: linkedSOId,
        total: totals.total,
        notes: notes || undefined,
        updatedAt: now,
      };

      localStorage.setItem(JOB_ORDER_KEY, JSON.stringify(jobOrders));
      toast.success( "Job order updated successfully!");
      navigate(`/webapp/service/job-orders/${jobOrderId}`);

    } else {
      const newJobOrder: JobOrder = {
        id: crypto.randomUUID(),
        jobOrderNo: genJobOrderNo(),
        customer: selectedCustomer,
        vehicle: selectedVehicle,
        mileage,
        services: builtServices,
        subtotalServices: totals.totalServices,
        linkedSO: linkedSOId,
        total: totals.total,
        notes: notes || undefined,
        status: "issued",
        createdAt: now,
        updatedAt: now,
      };

      jobOrders.push(newJobOrder);
      localStorage.setItem( JOB_ORDER_KEY, JSON.stringify(jobOrders));
      toast.success("Job order created successfully!");
      navigate("/webapp/service/job-orders");
    }

  };

  return (
    <div className="w-full h-full pl-4 pr-3 pb-4 flex flex-col gap-4 overflow-y-auto">

      {/* HEADER */}

      <DataToolbar
        variant="detail"
        title={
          mode === "edit"
            ? "Edit Job Order"
            : "Create New Job Order"
        }
      />

      <div className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-4">

          {/* CUSTOMER DETAILS */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-blue-500">
                <User className="size-5" />
                <p className="font-semibold text-foreground">
                  Customer Details
                </p>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-2">
                <div>
                  <Label className="text-muted-foreground font-normal text-xs">
                    Full Name
                  </Label>
                  <Combobox
                    value={selectedCustomer?.id || ""}
                    onChange={(val) => {
                      const customer =
                        customers.find(
                          (c) => c.id === val
                        ) || null;

                      setSelectedCustomer(customer);

                      if (!customer) {
                        setSelectedVehicle(null);
                        return;
                      }

                      const customerVehicles =
                        vehicles.filter(
                          (v) =>
                            v.customerId === customer.id
                        );

                      if (
                        customerVehicles.length === 0
                      ) {
                        setSelectedVehicle(null);
                      } else if (
                        customerVehicles.length === 1
                      ) {
                        setSelectedVehicle(
                          customerVehicles[0]
                        );
                      } else {
                        setSelectedVehicle(null);
                      }
                    }}
                    items={customers.map((c) => ({
                      label: `${c.firstName} ${c.lastName}`,
                      value: c.id,
                    }))}
                    placeholder="Select customer"
                  />
                </div>

                <div>
                  <Label className="text-muted-foreground font-normal text-xs">
                    Address
                  </Label>
                  <Input
                    value={selectedCustomer?.address || ""}
                    readOnly
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-y-2 gap-x-4">
                  <div>
                    <Label className="text-muted-foreground font-normal text-xs">
                      Email Address
                    </Label>
                    <Input
                      value={selectedCustomer?.email || ""}
                      readOnly
                    />
                  </div>

                  <div>
                    <Label className="text-muted-foreground font-normal text-xs">
                      Phone Number
                    </Label>
                    <Input
                      value={selectedCustomer?.mobileNumber || ""}
                      readOnly
                    />
                  </div>

                  <div>
                    <Label className="text-muted-foreground font-normal text-xs">
                      Landline
                    </Label>
                    <Input
                      value={selectedCustomer?.landline || ""}
                      readOnly
                    />
                  </div>

                  <div>
                    <Label className="text-muted-foreground font-normal text-xs">
                      Business Number
                    </Label>
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
                <p className="font-semibold text-foreground">
                  Vehicle Details
                </p>
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
                      <Input
                        value=""
                        placeholder="Select customer first"
                        disabled
                      />
                    ) : customerVehicles.length ===
                      1 ? (
                      <Input
                        value={
                          vm
                            ? `${vm.year} ${vm.make} ${vm.model}`
                            : ""
                        }
                        readOnly
                      />
                    ) : (
                      <Combobox
                        value={selectedVehicle?.id || ""}
                        onChange={(val) => {
                          const vehicle =
                            customerVehicles.find(
                              (v) => v.id === val
                            ) || null;

                          setSelectedVehicle(vehicle);
                        }}
                        items={customerVehicles.map(
                          (v) => {
                            const vm =
                              vehicleModels.find(
                                (m) =>
                                  m.id ===
                                  v.vehicleModelId
                              );

                            return {
                              label: vm
                                ? `${vm.year} ${vm.make} ${vm.model}`
                                : "",
                              value: v.id,
                            };
                          }
                        )}
                        placeholder="Select vehicle"
                      />
                    )}
                  </div>

                  <div>
                    <Label className="text-muted-foreground font-normal text-xs">
                      Variant
                    </Label>
                    <Input
                      value={vm?.variant || ""}
                      readOnly
                    />
                  </div>

                  <div>
                    <Label className="text-muted-foreground font-normal text-xs">
                      Color
                    </Label>
                    <Input
                      value={selectedVehicle?.color || ""}
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground font-normal text-xs">
                    Plate No.
                  </Label>
                  <Input
                    value={selectedVehicle?.plateNo || ""}
                    readOnly
                  />
                </div>

                <div>
                  <Label className="text-muted-foreground font-normal text-xs">
                    Engine No.
                  </Label>
                  <Input
                    value={selectedVehicle?.engineNo || ""}
                    readOnly
                  />
                </div>

                <div>
                  <Label className="text-muted-foreground font-normal text-xs">
                    Chassis No. (VIN)
                  </Label>
                  <Input
                    value={selectedVehicle?.vin || ""}
                    readOnly
                  />
                </div>

                <div>
                  <Label className="text-muted-foreground font-normal text-xs">
                    Registration No.
                  </Label>
                  <Input
                    value={selectedVehicle?.registrationNo || ""}
                    readOnly
                  />
                </div>

                <div>
                  <Label className="text-muted-foreground font-normal text-xs">
                    Selling Dealer
                  </Label>
                  <Input
                    value={selectedVehicle?.sellingDealer ||""}
                    readOnly
                  />
                </div>

                <div>
                  <Label className="text-muted-foreground font-normal text-xs">
                    Mileage (KM)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={
                      mileage === 0 ? "" : mileage
                    }
                    placeholder="0"
                    onChange={(e) =>
                      setMileage(
                        e.target.value === ""
                          ? 0
                          : Math.max(
                              0,
                              Number(e.target.value)
                            )
                      )
                    }
                    onBlur={(e) => {
                      if (e.target.value === "")
                        setMileage(0);
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* MAIN */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-6">

            {/* SERVICES */}
            <div className="rounded-lg border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 ">
                  <Wrench className="size-5 text-blue-500" />
                  <h2 className="text-sm font-semibold text-foreground">
                    Services (Job Order)
                  </h2>
                </div>

                <Button
                  size="sm"
                  onClick={addJOLine}
                  className="h-7 gap-1 text-xs"
                >
                  <Plus className="h-3 w-3" /> Add Service
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[420px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-background">
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs w-[40%]">Service</TableHead>
                        <TableHead className="text-xs w-[19%]">Est. Duration</TableHead>
                        <TableHead className="text-xs w-[16%]">Rate (₱)</TableHead>
                        <TableHead className="text-xs w-[20%]">Amount</TableHead>
                        <TableHead className="text-xs w-[5%]" />
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
                                onChange={(val) =>
                                  updateJO(idx, val)
                                }
                                placeholder="Select service"
                                items={[
                                  ...servicesCatalog,
                                ]
                                  .sort((a, b) => {
                                    const categoryA = categoryMap[a.serviceCategoryId]
                                      ?.name || "Uncategorized";

                                    const categoryB = categoryMap[b.serviceCategoryId]
                                      ?.name || "Uncategorized";

                                    const categoryCompare = categoryA.localeCompare(categoryB);

                                    if (categoryCompare !== 0) {
                                      return categoryCompare;
                                    }

                                    return (a.name || "").localeCompare(b.name || "");
                                  })
                                  .map((s) => {
                                    const price = getServicePrice(s.id, selectedVehicle);
                                    const category = categoryMap[ s.serviceCategoryId ];

                                    return {
                                      label: s.name,
                                      value: s.id,

                                      group:
                                        category?.name || "Uncategorized",

                                      description: [
                                        formatDuration(s.duration),
                                        `${peso(price)}`,
                                        s.pricingType ===
                                        "fixed"
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

                            <TableCell>
                              <div className="flex flex-col gap-0.5">
                                <CurrencyInput
                                  value={
                                    l.manualRate !==
                                    undefined
                                      ? l.manualRate
                                      : service
                                      ? rate
                                      : 0
                                  }
                                  onChange={(newRate) =>
                                    updateJORate(idx, String(newRate))
                                  }
                                  className={
                                    !service
                                      ? "opacity-40 pointer-events-none"
                                      : ""
                                  }
                                />

                                <span className="text-[10px] text-muted-foreground">
                                  {service
                                    ? service.pricingType ===
                                      "fixed"
                                      ? "Fixed"
                                      : "Per hr"
                                    : ""}
                                </span>
                              </div>
                            </TableCell>

                            <TableCell>
                              {service? peso(l.amount): "—"}
                            </TableCell>

                            <TableCell>
                              {joLines.length > 1 && (
                                <Button
                                  size="icon_xs"
                                  variant="ghost"
                                  onClick={() =>
                                    removeJOLine(idx)
                                  }
                                >
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

            {/* PARTS */}
            <div className="rounded-lg border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 ">
                  <Box className="size-5 text-orange-500" />
                  <h2 className="text-sm font-semibold text-foreground">
                    Parts (Sales Order)
                  </h2>
                </div>

                <Button
                  size="sm"
                  onClick={addSOLine}
                  className="h-7 gap-1 text-xs"
                >
                  <Plus className="h-3 w-3" /> Add Part
                </Button>
              </div>

              {insufficientStockItems.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground border rounded-lg p-3 bg-amber-50 border-amber-300">
                  <AlertTriangle className="size-5 text-amber-500 shrink-0" />

                  <p className="text-amber-500">
                    {insufficientStockItems.length === 1 ? (
                      <>
                        <span className="font-medium">
                          {insufficientStockItems[0]}
                        </span>{" "}
                        is out of stock. A purchase request will be created automatically upon job order issuance.
                      </>
                    ) : (
                      <>
                        Some items are out of stock. A purchase request will be created automatically upon job order issuance.
                      </>
                    )}
                  </p>
                </div>
              )}
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[420px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-background">
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs">Item Name</TableHead>
                        <TableHead className="text-xs w-[18%]">Unit Price</TableHead>
                        <TableHead className="text-xs w-[18%]">Qty</TableHead>
                        <TableHead className="text-xs w-[18%]">Amount</TableHead>
                        <TableHead className="text-xs w-[5%]" />
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {soLines.map((l, idx) => {
                        const product = partsMap[l.ProductId];

                        const stockEntry = inventory.find(
                          (inv) => inv.productId === l.ProductId
                        );

                        const availableStock =
                          stockEntry?.quantity_on_hand || 0;

                        return (
                          <TableRow key={l.id}>
                            {/* ITEM */}
                            <TableCell>
                              <Combobox
                                value={l.ProductId}
                                onChange={(val) =>
                                  updateSO(idx, "ProductId", val)
                                }
                                items={[...partsCatalog]
                                  .sort((a, b) => a.name.localeCompare(b.name))
                                  .map((p) => {
                                    const descParts = [];
                                    if (p.sku) descParts.push(`SKU: ${p.sku}`);
                                    if (p.partNumber) descParts.push(`Part No: ${p.partNumber}`);
                                    return {
                                      label: p.name,
                                      description: descParts.join(" • ") || undefined,
                                      value: p.id,
                                    };
                                })}
                                placeholder="Select part"
                              />
                            </TableCell>
                            <TableCell>{peso(product?.price || 0)}</TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Input
                                  type="number"
                                  min={0}
                                  value={
                                    l.quantity === 0 ||
                                    l.quantity === ""
                                      ? ""
                                      : String(l.quantity)
                                  }
                                  placeholder="0"
                                  disabled={!l.ProductId}
                                  onChange={(e) => {
                                    const val = e.target.value;

                                    if (!/^\d*$/.test(val))
                                      return;

                                    updateSO(
                                      idx,
                                      "quantity",
                                      val === ""
                                        ? ""
                                        : Number(val)
                                    );
                                  }}
                                />

                                {l.ProductId && (
                                  Number(l.quantity) > availableStock ? (
                                    <div className="flex items-center gap-1 text-[11px] text-amber-500">
                                      <AlertTriangle className="h-3 w-3" />
                                      <span>Insufficient stock</span>
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-muted-foreground">
                                      Stock: {availableStock}{" "}
                                      {product?.unit || "units"}
                                    </span>
                                  )
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{peso(l.amount)}</TableCell>
                            <TableCell>
                              {soLines.length > 1 && (
                                <Button
                                  size="icon_xs"
                                  variant="ghost"
                                  onClick={() =>
                                    removeSOLine(idx)
                                  }
                                >
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

          </div>

          {/* SUMMARY */}
          <div className="">
            <div className="sticky top-6 space-y-4">
              <Card className="shadow-lg border-primary/20">
                <CardHeader className="bg-primary/5 py-4 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="size-5 text-blue-900" />
                    <h2 className="font-semibold text-foreground">
                      Billing Summary
                    </h2>
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span> Estimated Duration</span>
                      <span>
                        {formatDuration(totals.estimatedMinutes)}
                      </span>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Services Subtotal</span>
                      <span>{peso(totals.totalServices)}</span>
                    </div>

                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Parts Subtotal</span>
                      <span>{peso(totals.totalParts)} </span>
                    </div>
                  </div>

                  <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                    <div className="flex justify-between items-end text-primary">
                      <span className="text-xs font-bold uppercase">
                        Grand Total
                      </span>
                      <span className="text-2xl font-bold tracking-wide">
                        {peso(totals.total)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Internal Notes
                    </Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Terms, warranty info, etc..."
                      rows={4}
                      className="resize-none text-xs bg-background"
                    />
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      className="w-full shadow-md"
                      size="lg"
                      onClick={saveJobOrder}
                      disabled={
                        !selectedCustomer ||
                        !selectedVehicle ||
                        !mileage ||
                        totals.validJO.length === 0
                      }
                    >
                      {mode === "edit"
                        ? "Save Changes"
                        : "Issue Job Order"}
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
                Creating a job order will separately
                create an optional linked sales order
                if parts are included.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default JobOrderForm;