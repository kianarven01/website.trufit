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

import CustomerFormModal from "@/components/popupModal/Customers/addCustomer";
import { toast } from "sonner";
import { Plus, Trash2, User, Car, Wrench, Box, Calculator, ChevronDown, ChevronUp, Fuel, Download } from "lucide-react";
import api from "@/api/axios";

/* ================= TYPES ================= */

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
  year?: string;
  make?: string;
  model?: string;
  variant?: string;
}

interface ServicePricing {
  id: string;
  service_type_id: string;
  vehicle_size_name: string;
  price: number;
  vehicle_types?: string[] | string;
  pricing_type: string;
}

interface Service {
  id: string;
  name: string;
  serviceCategoryId: string;
  tasks?: string[];
  duration?: number;
  pricingType: "fixed" | "hourly rate";
  pricings?: ServicePricing[];
}

interface ServiceCategory {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  unit: string;
}

interface JOServiceLine {
  id: string;
  ServiceTypeId: string;
  pricingId?: string; // Tracks the selected pricing row ID!
  manualRate?: number;
  amount: number;
}

interface SOPartLine {
  id: string;
  ProductId: string;
  quantity: number | "";
  amount: number;
}

interface SPOLLine {
  id: string;
  ProductId: string;
  quantity: number | "";
  amount: number;
}

interface AddEstimateProps {
  mode?: "create" | "edit";
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const genLineId = () => generateId();

const emptyJOLine = (): JOServiceLine => ({
  id: genLineId(),
  ServiceTypeId: "",
  pricingId: "",
  manualRate: undefined,
  amount: 0,
});

const emptySOLine = (): SOPartLine => ({
  id: genLineId(),
  ProductId: "",
  quantity: 1,
  amount: 0,
});

const emptySPOLLine = (): SPOLLine => ({
  id: genLineId(),
  ProductId: "",
  quantity: 1,
  amount: 0,
});

const AddEstimate: React.FC<AddEstimateProps> = ({ mode = "create" }) => {
  const { id: estimateId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [mileage, setMileage] = useState<number>(0);
  const [estimateNumber, setEstimateNumber] = useState<string>("");
  
  // Add Customer Modal
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");

  const [notes, setNotes] = useState("");
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [joLines, setJoLines] = useState<JOServiceLine[]>([emptyJOLine()]);
  const [soLines, setSoLines] = useState<SOPartLine[]>([emptySOLine()]);
  const [spolLines, setSpolLines] = useState<SPOLLine[]>([emptySPOLLine()]);
  const [expandedTaskRows, setExpandedTaskRows] = useState<Set<string>>(new Set());

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

  const addSPOLLine = () => setSpolLines((p) => [...p, emptySPOLLine()]);
  const removeSPOLLine = (i: number) => setSpolLines((p) => p.filter((_, idx) => idx !== i));

  const customerVehicles = useMemo(() => {
    return vehicles.filter(v => String(v.customerId) === String(selectedCustomer?.id));
  }, [vehicles, selectedCustomer]);

  const categoryMap = useMemo<Record<string, ServiceCategory>>(
    () =>
      Object.fromEntries(
        serviceCategories.map(c => [c.id, c])
      ),
    [serviceCategories]
  );

  const getService = (serviceId: string) =>
    servicesMap[serviceId];

  // Helper to match pricing based on selected vehicle
  const getMatchingPricing = (service: Service | null, vehicle: Vehicle | null) => {
    if (!service || !service.pricings?.length) return null;

    const validPricings = service.pricings.filter((p: any) => 
      p.pricing_type === service.pricingType || (!p.pricing_type && service.pricingType === 'fixed')
    );

    if (!validPricings.length) return null;
    if (!vehicle) return validPricings[0];

    const make = vehicle.make?.trim().toLowerCase() || "";
    const model = vehicle.model?.trim().toLowerCase() || "";

    // 1) Find pricing that explicitly lists this vehicle variant or type
    const matchedByType = validPricings.find((p: any) => {
      const types = Array.isArray(p.vehicle_types)
        ? p.vehicle_types
        : typeof p.vehicle_types === 'string'
        ? p.vehicle_types.split(',').map((t: string) => t.trim())
        : [];
      return types.some((t: string) => {
        const normalizedT = t.toLowerCase();
        return normalizedT.includes(make) || normalizedT.includes(model);
      });
    });

    if (matchedByType) return matchedByType;

    // 2) Fallback to size category match
    const matchedBySize = validPricings.find((p: any) =>
      p.vehicle_size_name?.trim().toLowerCase() === model.toLowerCase()
    );

    if (matchedBySize) return matchedBySize;

    return validPricings[0];
  };

  const getServicePrice = (
    serviceId: string,
    vehicle?: Vehicle | null
  ) => {
    const service = servicesMap[serviceId];
    if (!service) return 0;
    
    const matched = getMatchingPricing(service, vehicle || null);
    return matched ? Number(matched.price) : Number(0);
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "-";

    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hrs && mins) return `${hrs}h ${mins}m`;
    if (hrs) return `${hrs}h`;

    return `${mins}m`;
  };

  const handleAddCustomer = (search: string) => {
    setCustomerSearch(search);
    setCustomerModalOpen(true);
  };

  const handleCustomerSaved = (newCustomer: any) => {
    const normalizedCust: Customer = {
      id: String(newCustomer.customer_id),
      firstName: newCustomer.first_name || "",
      lastName: newCustomer.last_name || "",
      address: newCustomer.address || "",
      mobileNumber: newCustomer.mobile_number || "",
      landline: newCustomer.landline || "",
      email: newCustomer.email || "",
      businessPhone: newCustomer.business || "",
    };

    const newVehiclesList: Vehicle[] = [];
    if (Array.isArray(newCustomer.vehicles)) {
      newCustomer.vehicles.forEach((v: any) => {
        newVehiclesList.push({
          id: String(v.id),
          customerId: String(newCustomer.customer_id),
          vehicleModelId: String(v.id),
          color: v.color || "",
          plateNo: v.plate_number || "",
          engineNo: v.engine_number || "",
          vin: v.VIN || "",
          registrationNo: v.registration_number || "",
          sellingDealer: v.selling_dealer || "",
          year: v.year_model || "",
          make: v.make || "",
          model: v.model || "",
          variant: v.variant || "",
        });
      });
    }

    setCustomers((prev) => [...prev, normalizedCust]);
    setVehicles((prev) => [...prev, ...newVehiclesList]);
    setSelectedCustomer(normalizedCust);

    if (newVehiclesList.length > 0) {
      setSelectedVehicle(newVehiclesList[0]);
    } else {
      setSelectedVehicle(null);
    }
  };

  // ── Load Catalog Data & Existing Estimate ──────────────────────────────────
  useEffect(() => {
    const loadCatalogData = async () => {
      try {
        setIsLoading(true);
        const [
          customersRes,
          productsRes,
          serviceTypesRes,
          serviceCategoriesRes,
        ] = await Promise.all([
          api.get('/customers'),
          api.get('/products'),
          api.get('/products/service-types'),
          api.get('/products/service-categories'),
        ]);

        const dbCustomers = customersRes.data.data || [];
        const dbProducts = productsRes.data.data || [];
        const dbServiceTypes = serviceTypesRes.data.data || [];
        const dbServiceCategories = serviceCategoriesRes.data.data || [];

        // Flatten vehicles from all customers
        const allVehicles: Vehicle[] = [];
        const normalizedCustomers: Customer[] = dbCustomers.map((c: any) => {
          if (Array.isArray(c.vehicles)) {
            c.vehicles.forEach((v: any) => {
              allVehicles.push({
                id: String(v.id),
                customerId: String(c.customer_id),
                vehicleModelId: String(v.id),
                color: v.color || "",
                plateNo: v.plate_number || "",
                engineNo: v.engine_number || "",
                vin: v.VIN || "",
                registrationNo: v.registration_number || "",
                sellingDealer: v.selling_dealer || "",
                year: v.year_model || "",
                make: v.make || "",
                model: v.model || "",
                variant: v.variant || "",
              });
            });
          }

          return {
            id: String(c.customer_id),
            firstName: c.first_name || "",
            lastName: c.last_name || "",
            address: c.address || "",
            mobileNumber: c.mobile_number || "",
            landline: c.landline || "",
            email: c.email || "",
            businessPhone: c.business || "",
          };
        });

        // Map service catalog
        const normalizedServices: Service[] = dbServiceTypes.map((s: any) => ({
          id: s.id,
          name: s.name,
          serviceCategoryId: s.service_category_id || "",
          tasks: s.tasks || [],
          duration: s.duration || 0,
          pricingType: s.pricing_type || "fixed",
          pricings: s.pricings || [],
        }));

        // Map parts catalog
        const normalizedParts: Product[] = dbProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          sku: p.SKU,
          price: Number(p.sell_price || p.price || 0),
          unit: p.unit?.name || "pc",
        }));

        setCustomers(normalizedCustomers);
        setVehicles(allVehicles);
        setServicesCatalog(normalizedServices);
        setPartsCatalog(normalizedParts);
        setServiceCategories(dbServiceCategories);

      } catch (err) {
        console.error("Failed to load data from backend", err);
        toast.error("Failed to fetch catalog data");
      } finally {
        setIsLoading(false);
      }
    };
    loadCatalogData();
  }, []);

  // Hydrate Estimate in Edit Mode
  useEffect(() => {
    if (mode !== "edit" || !estimateId || !servicesCatalog.length) return;

    const fetchEstimate = async () => {
      try {
        const res = await api.get(`/estimates/${estimateId}`);
        const found = res.data.data;

        if (!found) {
          toast.error("Estimate not found.");
          navigate("/webapp/sales/estimates");
          return;
        }

        if (found.estimate_number) {
          setEstimateNumber(found.estimate_number);
          sessionStorage.setItem(`breadcrumb-/webapp/sales/estimates/${estimateId}`, found.estimate_number);
          window.dispatchEvent(new Event('breadcrumb-update'));
        }

        const cust = found.customer;
        const normalizedCust = cust ? {
          id: String(cust.customer_id),
          firstName: cust.first_name || "",
          lastName: cust.last_name || "",
          address: cust.address || "",
          mobileNumber: cust.mobile_number || "",
          landline: cust.landline || "",
          email: cust.email || "",
          businessPhone: cust.business || "",
        } : null;

        setSelectedCustomer(normalizedCust);

        const veh = found.vehicle;
        const normalizedVeh = veh ? {
          id: String(veh.id),
          customerId: String(found.customer_id),
          vehicleModelId: String(veh.id),
          color: veh.color || "",
          plateNo: veh.plate_number || "",
          engineNo: veh.engine_number || "",
          vin: veh.VIN || "",
          registrationNo: veh.registration_number || "",
          sellingDealer: veh.selling_dealer || "",
          year: veh.year_model || "",
          make: veh.make || "",
          model: veh.model || "",
          variant: veh.variant || "",
        } : null;

        setSelectedVehicle(normalizedVeh);
        setMileage(found.mileage ?? 0);
        setNotes(found.notes ?? "");

        const dbItems = found.items || [];
        const serviceItems = dbItems.filter((i: any) => i.item_type === "service");
        const partItems = dbItems.filter((i: any) => i.item_type === "part");

        if (serviceItems.length > 0) {
          setJoLines(
            serviceItems.map((s: any) => {
              const service = servicesCatalog.find(sc => sc.id === s.service_id);
              const pricingOpt = service?.pricings?.find((p: any) => Number(p.price) === Number(s.unit_price));
              return {
                id: s.id,
                ServiceTypeId: s.service_id,
                pricingId: pricingOpt ? pricingOpt.id : "",
                manualRate: Number(s.unit_price),
                amount: Number(s.subtotal),
              };
            })
          );
        } else {
          setJoLines([emptyJOLine()]);
        }

        if (partItems.length > 0) {
          setSoLines(
            partItems.map((p: any) => ({
              id: p.id,
              ProductId: p.product_id,
              quantity: Number(p.quantity),
              amount: Number(p.subtotal),
            }))
          );
        } else {
          setSoLines([emptySOLine()]);
        }
      } catch (err) {
        console.error("Failed to load estimate for editing", err);
        toast.error("Failed to load estimate.");
      }
    };
    fetchEstimate();
    return () => {
      if (estimateId) {
        sessionStorage.removeItem(`breadcrumb-/webapp/sales/estimates/${estimateId}`);
      }
    };
  }, [mode, estimateId, servicesCatalog]);

  const updateJO = (idx: number, serviceId: string) => {
    if (joLines[idx]?.ServiceTypeId === serviceId) return;

    if (serviceId) {
      const alreadyUsed = joLines.some(
        (l, i) => i !== idx && l.ServiceTypeId === serviceId
      );
      if (alreadyUsed) {
        const svc = servicesMap[serviceId];
        toast.warning(`"${svc?.name ?? "Service"}" is already added.`);

        if (!joLines[idx]?.ServiceTypeId) {
          setJoLines((prev) => prev.filter((_, i) => i !== idx));
        }
        return;
      }
    }

    setJoLines((prev) =>
      prev.map((l, i) => {
        if (i !== idx) return l;

        const service = servicesMap[serviceId];
        if (!service) return { ...l, ServiceTypeId: serviceId, pricingId: "", manualRate: undefined, amount: 0 };

        const matchedPricing = getMatchingPricing(service, selectedVehicle);
        const pricingId = matchedPricing ? matchedPricing.id : "";
        const rate = matchedPricing ? Number(matchedPricing.price) : Number(0);

        const amount =
          service.pricingType === "fixed"
            ? rate
            : rate * ((service.duration || 0) / 60);

        return { ...l, ServiceTypeId: serviceId, pricingId, manualRate: rate, amount };
      })
    );
  };

  const updateJOPricing = (idx: number, pricingId: string) => {
    setJoLines((prev) =>
      prev.map((l, i) => {
        if (i !== idx) return l;

        const service = servicesMap[l.ServiceTypeId];
        if (!service) return l;

        const p = service.pricings?.find((p: any) => p.id === pricingId);
        const rate = p ? Number(p.price) : 0;
        const amount =
          service.pricingType === "fixed"
            ? rate
            : rate * ((service.duration || 0) / 60);

        return { ...l, pricingId, manualRate: rate, amount };
      })
    );
  };

  const updateJORate = (idx: number, rawValue: string) => {
    setJoLines((prev) =>
      prev.map((l, i) => {
        if (i !== idx) return l;

        const manualRate = rawValue === "" ? undefined : Math.max(0, Number(rawValue));
        const service = servicesMap[l.ServiceTypeId];
        const rate = manualRate ?? getServicePrice(l.ServiceTypeId, selectedVehicle);

        const amount = !service
          ? 0
          : service.pricingType === "fixed"
          ? rate
          : rate * ((service.duration || 0) / 60);

        return { ...l, manualRate, amount };
      })
    );
  };

  const updateSO = (idx: number, field: keyof SOPartLine, value: any) => {
    if (field === "ProductId" && value) {
      const existingIdx = soLines.findIndex(
        (l, i) => i !== idx && l.ProductId === value
      );
      if (existingIdx !== -1) {
        const product = partsMap[value];
        const productName = product?.name ?? "Part";
        setSoLines((prev) => {
          const next = prev.filter((_, i) => i !== idx);
          return next.map((l, i) => {
            if (i !== existingIdx - (idx < existingIdx ? 1 : 0)) return l;
            const newQty = (Number(l.quantity) || 0) + 1;
            return { ...l, quantity: newQty, amount: newQty * (product?.price ?? 0) };
          });
        });
        toast.info(`"${productName}" is already added. Quantity increased.`);
        return;
      }
    }

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

          updated.quantity = qty;
          updated.amount = qty * found.price;
        }

        return updated;
      })
    );
  };

  const totals = useMemo(() => {
    const validJO = joLines.filter((l) => l.ServiceTypeId);
    const validSO = soLines.filter((l) => l.ProductId);
    const validSPOL = spolLines.filter((l) => l.ProductId);

    const totalServices = validJO.reduce((s, l) => s + l.amount, 0);
    const totalParts = validSO.reduce((s, l) => s + l.amount, 0);
    const totalSupplies = validSPOL.reduce((s, l) => s + l.amount, 0);

    const estimatedMinutes = validJO.reduce(
      (sum, l) => {
        const service = servicesMap[l.ServiceTypeId];
        if (!service?.duration) return sum;
        return sum + service.duration;
      },
      0
    );

    const total = totalServices + totalParts + totalSupplies;

    return {
      totalServices,
      totalParts,
      totalSupplies,
      total,
      estimatedMinutes,
      validJO,
      validSO,
      validSPOL,
    };
  }, [joLines, soLines, spolLines, servicesMap]);

  const peso = (n: number) =>
    `₱${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const saveEstimate = async () => {
    if (!selectedCustomer || !selectedVehicle) {
      toast.error("Please select a customer and vehicle.");
      return;
    }

    const isValidVehicle = vehicles.some(
      (v) => String(v.id) === String(selectedVehicle.id) && String(v.customerId) === String(selectedCustomer.id)
    );

    if (!isValidVehicle) {
      toast.error("The selected vehicle does not belong to this customer.");
      return;
    }

    if (!mileage || Number(mileage) <= 0) {
      toast.error("Mileage is mandatory and must be greater than zero.");
      return;
    }

    if (totals.validJO.length === 0 && totals.validSO.length === 0 && totals.validSPOL.length === 0) {
      toast.error("Add at least one service or part.");
      return;
    }

    if (totals.validSO.some((l) => !l.quantity || l.quantity <= 0)) {
      toast.error("All part lines must have a quantity greater than zero.");
      return;
    }

    const payloadItems = [
      ...joLines
        .filter((l) => l.ServiceTypeId)
        .map((l) => {
          const rate = l.manualRate ?? getServicePrice(l.ServiceTypeId, selectedVehicle);
          return {
            item_type: "service",
            service_id: l.ServiceTypeId,
            product_id: null,
            quantity: 1,
            unit_price: rate,
            subtotal: l.amount,
          };
        }),
      ...soLines
        .filter((l) => l.ProductId)
        .map((l) => {
          const found = partsMap[l.ProductId];
          const price = found?.price || 0;
          return {
            item_type: "part",
            service_id: null,
            product_id: l.ProductId,
            quantity: Number(l.quantity),
            unit_price: price,
            subtotal: l.amount,
          };
        })
    ];

    const payload = {
      customer_id: Number(selectedCustomer.id),
      vehicle_id: Number(selectedVehicle.id),
      status: mode === "edit" ? undefined : "FOR APPROVAL",
      total_amount: totals.total,
      mileage: Number(mileage),
      items: payloadItems,
    };

    try {
      if (mode === "edit" && estimateId) {
        await api.put(`/estimates/${estimateId}`, payload);
        toast.success("Estimate updated successfully!");
        navigate(`/webapp/sales/estimates`);
      } else {
        await api.post(`/estimates`, payload);
        toast.success("Estimate created successfully!");
        navigate(`/webapp/sales/estimates`);
      }
    } catch (err: any) {
      console.error("Failed to save estimate", err);
      toast.error(err.response?.data?.message || "Failed to save estimate.");
    }
  };

  const handleDownloadPDF = async () => {
    if (!estimateId) return;
    try {
      const response = await api.get(`/estimates/${estimateId}/download-pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileName = estimateNumber 
        ? `${estimateNumber}.pdf` 
        : `estimate-${estimateId.substring(0,8)}.pdf`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 bg-background text-foreground">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading catalog data...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full pl-4 pr-3 pb-4 flex flex-col gap-4 overflow-y-auto">

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

                      const relatedVehicles = vehicles.filter(v => String(v.customerId) === String(customer.id));
                      if (relatedVehicles.length === 0) {
                        setSelectedVehicle(null);
                      } else if (relatedVehicles.length === 1) {
                        setSelectedVehicle(relatedVehicles[0]);
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
                        value={selectedVehicle ? `${selectedVehicle.year || ""} ${selectedVehicle.make || ""} ${selectedVehicle.model || ""}` : ""}
                        readOnly
                      />
                    ) : (
                      <Combobox
                        value={selectedVehicle?.id || ""}
                        onChange={(val) => {
                          const vehicle = customerVehicles.find(v => v.id === val) || null;
                          setSelectedVehicle(vehicle);
                        }}
                        items={customerVehicles.map(v => ({
                          label: `${v.year || ""} ${v.make || ""} ${v.model || ""}`,
                          value: v.id
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
                  <Label className="text-muted-foreground font-normal text-xs">Mileage <span className="text-destructive">*</span></Label>
                  <Input
                    type="number"
                    min={0}
                    value={mileage === 0 ? "" : mileage}
                    placeholder="0"
                    onChange={(e) => setMileage(e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)))}
                    onBlur={(e) => { if (e.target.value === "") setMileage(0); }}
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
                <Button size="sm" onClick={addJOLine} className="h-7 gap-1 text-xs"><Plus className="h-3 w-3" /> Add Service</Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[420px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-background">
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs w-[30%] text-center">Service</TableHead>
                        <TableHead className="text-xs w-[25%] text-center">Pricing</TableHead>
                        <TableHead className="text-xs w-[14%] text-center">Est. Duration</TableHead>
                        <TableHead className="text-xs w-[13%] text-center">Rate</TableHead>
                        <TableHead className="text-xs w-[13%] text-center">Amount</TableHead>
                        <TableHead className="text-xs w-[5%]"></TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {joLines.map((l, idx) => {
                        const service = getService(l.ServiceTypeId);
                        const rate = getServicePrice(l.ServiceTypeId, selectedVehicle);

                        return (
                          <TableRow key={l.id} className="hover:bg-transparent">
                            <TableCell className="relative overflow-visible align-top">
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
                                    const categoryCompare = categoryA.localeCompare(categoryB);
                                    if (categoryCompare !== 0) return categoryCompare;
                                    return (a.name || "").localeCompare(b.name || "");
                                  })
                                  .map((s) => {
                                    const category = categoryMap[s.serviceCategoryId];
                                    return {
                                      label: s.name,
                                      value: s.id,
                                      group: category?.name || "Uncategorized",
                                      description: [
                                        formatDuration(s.duration),
                                        s.pricingType === "fixed" ? "Fixed" : "Hourly",
                                      ]
                                        .filter(Boolean)
                                        .join(" • "),
                                    };
                                  })}
                              />
                              {service?.tasks && service.tasks.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setExpandedTaskRows(prev => {
                                    const next = new Set(prev);
                                    next.has(l.id) ? next.delete(l.id) : next.add(l.id);
                                    return next;
                                  })}
                                  className="mt-3 pt-2 border-t border-border/50 w-full flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  {expandedTaskRows.has(l.id)
                                    ? <ChevronUp className="w-3 h-3" />
                                    : <ChevronDown className="w-3 h-3" />}
                                  {service.tasks.length} task{service.tasks.length !== 1 ? 's' : ''}
                                </button>
                              )}
                              {expandedTaskRows.has(l.id) && service?.tasks && service.tasks.length > 0 && (
                                <ul className="mt-1.5 list-disc pl-4 space-y-0.5 text-[10px] text-muted-foreground">
                                  {service.tasks.map((task, i) => (
                                    <li key={i}>{task}</li>
                                  ))}
                                </ul>
                              )}
                            </TableCell>

                            <TableCell className="align-top text-center">
                              <select
                                className="w-full bg-background border border-input rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-40 disabled:pointer-events-none"
                                value={l.pricingId || ""}
                                disabled={!service}
                                onChange={(e) => {
                                  const selectedPricingId = e.target.value;
                                  updateJOPricing(idx, selectedPricingId);
                                }}
                              >
                                <option value="" disabled={!!service?.pricings?.length}>
                                  {!service ? "Select service first" : service.pricings?.length ? "Select vehicle pricing" : "Default Rate"}
                                </option>
                                {service?.pricings
                                  ?.filter((p: any) => p.pricing_type === service.pricingType || (!p.pricing_type && service.pricingType === 'fixed'))
                                  .map((p: any) => {
                                  const label = `${p.vehicle_size_name} - ₱${Number(p.price).toFixed(2)}`;
                                  return (
                                    <option key={p.id} value={p.id}>
                                      {label}
                                    </option>
                                  );
                                })}
                              </select>
                            </TableCell>

                            <TableCell className="align-top text-center">
                              {service?.duration ? formatDuration(service.duration) : "No Duration"}
                            </TableCell>

                            <TableCell className="align-top">
                              <CurrencyInput
                                value={l.manualRate !== undefined ? l.manualRate : (service ? rate : 0)}
                                onChange={(newRate) => updateJORate(idx, String(newRate))}
                                className={!service ? "opacity-40 pointer-events-none" : ""}
                              />
                            </TableCell>

                            <TableCell className="align-top text-center">
                              {peso(l.amount)}
                            </TableCell>

                            <TableCell className="align-top">
                              {joLines.length > 1 && (
                                <Button
                                  size="icon_xs"
                                  variant="ghost"
                                  onClick={() => removeJOLine(idx)}
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
                  <Box className="size-5 text-orange-500"/>
                  <h2 className="text-sm font-semibold text-foreground">Parts (Sales Order)</h2>                
                </div>
                <Button size="sm" onClick={addSOLine} className="h-7 gap-1 text-xs"><Plus className="h-3 w-3" /> Add Part</Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[420px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-background">
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs text-center">Item Name</TableHead>
                        <TableHead className="text-xs w-[20%] text-center">Unit Price</TableHead>
                        <TableHead className="text-xs w-[15%] text-center">Qty</TableHead>
                        <TableHead className="text-xs w-[20%] text-center">Amount</TableHead>
                        <TableHead className="text-xs w-[5%]"></TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {soLines.map((l, idx) => {
                        return (
                          <TableRow key={l.id} className="hover:bg-transparent">
                            <TableCell>
                              <Combobox
                                value={l.ProductId}
                                onChange={(val) =>
                                  updateSO(idx, "ProductId", val)
                                }
                                items={partsCatalog.map((p) => ({
                                  label: `${p.name} - SKU: ${p.sku}`,
                                  value: p.id,
                                }))}
                                placeholder="Select part"
                              />
                            </TableCell>

                            <TableCell className="text-center">
                              {peso(partsMap[l.ProductId]?.price || 0)}
                            </TableCell>

                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                value={l.quantity === 0 || l.quantity === "" ? "" : String(l.quantity)}
                                placeholder="0"
                                onFocus={() => { if (!l.quantity) updateSO(idx, "quantity", ""); }}
                                onBlur={(e) => { if (e.target.value === "") updateSO(idx, "quantity", 0); }}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (!/^\d*$/.test(val)) return;
                                  updateSO(idx, "quantity", val === "" ? "" : Number(val));
                                }}
                              />
                            </TableCell>

                            <TableCell className="text-center">
                              {peso(l.amount)}
                            </TableCell>

                            <TableCell>
                              {soLines.length > 1 && (
                                <Button
                                  size="icon_xs"
                                  variant="ghost"
                                  onClick={() => removeSOLine(idx)}
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

            {/* SUPPLIES, PETROL, OILS & LUBRICANTS */}
            <div className="rounded-lg border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fuel className="size-5 text-green-600"/>
                  <h2 className="text-sm font-semibold text-foreground">Supplies, Petrol, Oils, and Lubricants</h2>
                </div>
                <Button size="sm" onClick={addSPOLLine} className="h-7 gap-1 text-xs"><Plus className="h-3 w-3" /> Add Item</Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[420px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-background">
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs text-center">Item Name</TableHead>
                        <TableHead className="text-xs w-[20%] text-center">Unit Price</TableHead>
                        <TableHead className="text-xs w-[15%] text-center">Qty</TableHead>
                        <TableHead className="text-xs w-[20%] text-center">Amount</TableHead>
                        <TableHead className="text-xs w-[5%]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {spolLines.map((l, idx) => {
                        return (
                          <TableRow key={l.id} className="hover:bg-transparent">
                            <TableCell>
                              <Combobox
                                value={l.ProductId}
                                onChange={(val) => {
                                  const found = partsMap[val];
                                  setSpolLines(prev => prev.map((line, i) =>
                                    i !== idx ? line : {
                                      ...line,
                                      ProductId: val,
                                      amount: found ? (Number(line.quantity) || 0) * found.price : 0
                                    }
                                  ));
                                }}
                                items={partsCatalog.map((p) => ({
                                  label: `${p.name} - SKU: ${p.sku}`,
                                  value: p.id,
                                }))}
                                placeholder="Select supply / oil / lubricant"
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              {peso(partsMap[l.ProductId]?.price || 0)}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                value={l.quantity === 0 || l.quantity === "" ? "" : String(l.quantity)}
                                placeholder="0"
                                onFocus={() => { if (!l.quantity) setSpolLines(prev => prev.map((line, i) => i !== idx ? line : { ...line, quantity: "" })); }}
                                onBlur={(e) => { if (e.target.value === "") setSpolLines(prev => prev.map((line, i) => i !== idx ? line : { ...line, quantity: 0 })); }}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (!/^\d*$/.test(val)) return;
                                  const qty = val === "" ? "" : Number(val);
                                  const found = partsMap[l.ProductId];
                                  setSpolLines(prev => prev.map((line, i) =>
                                    i !== idx ? line : {
                                      ...line,
                                      quantity: qty,
                                      amount: found && qty !== "" ? Number(qty) * found.price : 0
                                    }
                                  ));
                                }}
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              {peso(l.amount)}
                            </TableCell>
                            <TableCell>
                              {spolLines.length > 1 && (
                                <Button size="icon_xs" variant="ghost" onClick={() => removeSPOLLine(idx)}>
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

          {/* Billing Summary */}
          <div className="">
            <div className="sticky top-6 space-y-4">
              <Card className="shadow-lg border-primary/20">
                <CardHeader className="bg-primary/5 py-4 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="size-5 text-blue-900" />
                    <h2 className="font-semibold text-foreground">Billing Summary</h2>
                  </CardTitle>
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
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Supplies Subtotal</span>
                      <span>{peso(totals.totalSupplies)}</span>
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
                        !mileage || Number(mileage) <= 0 ||
                        (totals.validJO.length === 0 && totals.validSO.length === 0) 
                      }
                    >
                      {mode === "edit" ? "Save Changes" : "Create Estimate"}
                    </Button>
                    {mode === "edit" && (
                      <Button
                        variant="outline"
                        className="w-full shadow-sm"
                        onClick={handleDownloadPDF}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                    )}
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

      {/* Customer Form Modal */}
      <CustomerFormModal
        open={customerModalOpen}
        onOpenChange={setCustomerModalOpen}
        onSaved={handleCustomerSaved}
      />
    </div>
  );
};

export default AddEstimate;