import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import CustomerFormModal from "@/components/popupModal/Customers/addCustomer";
import { toast } from "sonner";
import { Plus, Trash2, User, Car, Wrench, Box, Calculator, ChevronDown, ChevronUp, Fuel, Eye } from "lucide-react";
import api from "@/api/axios";
import ConfirmDialog from "@/components/popupModal/AlertDialog/ConfirmDialog";

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
  origin?: string;
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
  partNumber?: string;
  manufacturer?: string;
  description?: string;
  price: number;
  unit: string;
  quantityOnHand: number | null;
  reservedQuantity: number | null;
  reorderLevel: number | null;
  productId?: string;
  supplierName?: string;
  categoryIsSpol?: boolean;
  categoryId?: number | null;
  categoryName?: string | null;
}

interface JOServiceLine {
  id: string;
  ServiceTypeId: string;
  pricingId?: string; // Tracks the selected pricing row ID!
  manualRate?: number;
  customName?: string;
  amount: number;
  isTentative: boolean;
}

interface SOPartLine {
  id: string;
  ProductId: string;
  quantity: number | "";
  amount: number;
  needsOrdering: boolean;
  customName?: string;
  manualPrice?: number;
  isTentative: boolean;
}

interface SPOLLine {
  id: string;
  ProductId: string;
  quantity: number | "";
  amount: number;
  needsOrdering: boolean;
  customName?: string;
  manualPrice?: number;
  isTentative: boolean;
}



interface AddEstimateProps {
  mode?: "create" | "edit";
}

const SUNDRIES_CATEGORY_NAME = "Sundries";

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
  isTentative: false,
});

const emptyCustomJOLine = (): JOServiceLine => ({
  id: genLineId(),
  ServiceTypeId: "",
  pricingId: "",
  manualRate: 0,
  customName: "",
  amount: 0,
  isTentative: false,
});

const emptySOLine = (): SOPartLine => ({
  id: genLineId(),
  ProductId: "",
  quantity: 1,
  amount: 0,
  needsOrdering: false,
  isTentative: false,
});

const emptyCustomSOLine = (): SOPartLine => ({
  id: genLineId(),
  ProductId: "",
  quantity: 1,
  amount: 0,
  needsOrdering: true,
  customName: "",
  manualPrice: 0,
  isTentative: false,
});

const emptySPOLLine = (): SPOLLine => ({
  id: genLineId(),
  ProductId: "",
  quantity: 1,
  amount: 0,
  needsOrdering: false,
  isTentative: false,
});

const emptyCustomSPOLLine = (): SPOLLine => ({
  id: genLineId(),
  ProductId: "",
  quantity: 1,
  amount: 0,
  needsOrdering: true,
  customName: "",
  manualPrice: 0,
  isTentative: false,
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

  const [notes, setNotes] = useState("");
  const [downpayment, setDownpayment] = useState<number>(0);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [joLines, setJoLines] = useState<JOServiceLine[]>([emptyJOLine()]);
  const [soLines, setSoLines] = useState<SOPartLine[]>([emptySOLine()]);
  const [spolLines, setSpolLines] = useState<SPOLLine[]>([emptySPOLLine()]);
  const [expandedTaskRows, setExpandedTaskRows] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [includePartNumbers, setIncludePartNumbers] = useState(false);
  const [includeTentative, setIncludeTentative] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [shortageItems, setShortageItems] = useState<string[]>([]);

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

  const partsOnly = useMemo(() => partsCatalog.filter(p => !p.categoryIsSpol), [partsCatalog]);
  const spolOnly = useMemo(() => partsCatalog.filter(p => p.categoryIsSpol), [partsCatalog]);

  const getStockStatus = (product: Product | undefined) => {
    if (!product) return null;
    if (product.quantityOnHand === null) return { label: "Not Tracked", color: "text-gray-400", bg: "bg-gray-100 dark:bg-gray-800" };
    if (product.quantityOnHand <= 0) return { label: "Out of Stock", color: "text-red-600", bg: "bg-red-50 dark:bg-red-950" };
    if (product.reorderLevel && product.quantityOnHand <= product.reorderLevel)
      return { label: `Low (${product.quantityOnHand})`, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" };
    return { label: `In Stock (${product.quantityOnHand})`, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950" };
  };

  const addJOLine = () => setJoLines((p) => [...p, emptyJOLine()]);
  const addCustomJOLine = () => setJoLines((p) => [...p, emptyCustomJOLine()]);
  const removeJOLine = (i: number) => setJoLines((p) => p.filter((_, idx) => idx !== i));

  const addSOLine = () => setSoLines((p) => [...p, emptySOLine()]);
  const addCustomSOLine = () => setSoLines((p) => [...p, emptyCustomSOLine()]);
  const removeSOLine = (i: number) => setSoLines((p) => p.filter((_, idx) => idx !== i));

  const addSPOLLine = () => setSpolLines((p) => [...p, emptySPOLLine()]);
  const addCustomSPOLLine = () => setSpolLines((p) => [...p, emptyCustomSPOLLine()]);
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
      origin: newCustomer.origin || "appointment",
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

  // ── Load Catalog Data & Hydrate Existing Estimate ─────────────────────────
  useEffect(() => {
    const loadCatalogAndEstimate = async () => {
      try {
        setIsLoading(true);

        const promises: Promise<any>[] = [
          api.get('/customers'),
          api.get('/inventory'),
          api.get('/products'),
          api.get('/products/service-types'),
          api.get('/products/service-categories'),
        ];

        if (mode === "edit" && estimateId) {
          promises.push(api.get(`/estimates/${estimateId}`));
        }

        const results = await Promise.all(promises);

        const customersRes = results[0];
        const productsRes = results[1];
        const allProductsRes = results[2];
        const serviceTypesRes = results[3];
        const serviceCategoriesRes = results[4];
        const estimateRes = mode === "edit" && estimateId ? results[5] : null;

        const dbCustomers = customersRes.data.data || [];
        const dbProducts = Array.isArray(productsRes.data)
          ? productsRes.data
          : productsRes.data.data || [];
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
            origin: c.origin || "appointment",
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

        // Map parts catalog using inventory data
        const normalizedParts: Product[] = dbProducts.map((row: any) => {
          const product = row.product || {};
          const supplierPrice = row.active_price?.Price;
          const price = Number(row.selling_price || supplierPrice || 0);
          const supplierName = row.supplier?.CompanyName || row.supplier?.name || row.supplier_name || "";
          return {
            id: String(row.id),
            productId: String(product.id || ""),
            name: product.name || "",
            sku: product.SKU || "",
            partNumber: product.part_number || product.partNumber || "",
            manufacturer: product.manufacturer_name || "",
            price,
            unit: product.unit_name || product.unit?.name || "pc",
            quantityOnHand: Number(row.quantity_on_hand ?? 0),
            reservedQuantity: Number(row.reserved_quantity ?? 0),
            reorderLevel: Number(row.reorder_level ?? 5),
            supplierName,
            categoryIsSpol: Boolean(row.product?.category_is_spol),
            categoryId: row.product?.category_id ?? null,
            categoryName: row.product?.category_name ?? null,
          };
        });

        const mappedServiceCategories: ServiceCategory[] = dbServiceCategories.map((c: any) => ({
          id: c.id,
          name: c.name,
        }));

        // Merge Sundries products not already in inventory (system-seeded category)
        const dbAllProducts = Array.isArray(allProductsRes.data)
          ? allProductsRes.data
          : allProductsRes.data?.data || [];
        const inventoryProductIds = new Set(normalizedParts.map(p => p.productId));
        const sundriesProducts: Product[] = dbAllProducts
          .filter((p: any) => p.category_is_spol && !inventoryProductIds.has(String(p.id)))
          .map((p: any) => {
            const suppliers = p.suppliers || [];
            const firstSupplier = suppliers[0];
            const price = Number(p.preferred_selling_price || firstSupplier?.active_price?.Price || 0);
            return {
              id: String(p.id),
              productId: String(p.id),
              name: p.name || "",
              sku: p.sku || p.SKU || "",
              partNumber: p.part_number || "",
              manufacturer: p.manufacturer_name || "",
              description: p.description || "",
              price,
              unit: p.unit_name || "pc",
              quantityOnHand: null,
              reservedQuantity: null,
              reorderLevel: null,
              categoryIsSpol: true,
              categoryName: p.category_name || null,
            };
          });
        normalizedParts.push(...sundriesProducts);

        setCustomers(normalizedCustomers);
        setVehicles(allVehicles);
        setServicesCatalog(normalizedServices);
        setPartsCatalog(normalizedParts);
        setServiceCategories(mappedServiceCategories);

        // Hydrate estimate data if in edit mode
        if (estimateRes) {
          const found = estimateRes.data.data;

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
            origin: cust.origin || "appointment",
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
          setDownpayment(Number(found.downpayment_amount) || 0);

          const dbItems = found.items || [];
          const serviceItems = dbItems.filter((i: any) => i.item_type === "service");
          const partItems = dbItems.filter((i: any) => i.item_type === "part");
          const spolItems = dbItems.filter((i: any) => i.item_type === "supply");

          if (serviceItems.length > 0) {
            setJoLines(
              serviceItems.map((s: any) => {
                const service = normalizedServices.find(sc => sc.id === s.service_id);
                const pricingOpt = service?.pricings?.find((p: any) => Number(p.price) === Number(s.unit_price));
                return {
                  id: s.id,
                  ServiceTypeId: s.service_id,
                  pricingId: pricingOpt ? pricingOpt.id : "",
                  manualRate: Number(s.unit_price),
                  amount: Number(s.subtotal),
                  isTentative: s.is_tentative ?? false,
                };
              })
            );
          } else {
            setJoLines([emptyJOLine()]);
          }

          if (partItems.length > 0) {
            setSoLines(
              partItems.map((p: any) => {
                const matchedInventoryItem = normalizedParts.find(np => np.productId === p.product_id);
                return {
                  id: p.id,
                  ProductId: matchedInventoryItem ? matchedInventoryItem.id : (p.product_id || ""),
                  quantity: Number(p.quantity),
                  amount: Number(p.subtotal),
                  needsOrdering: p.needs_ordering ?? false,
                  customName: p.custom_name || undefined,
                  isTentative: p.is_tentative ?? false,
                };
              })
            );
          } else {
            setSoLines([emptySOLine()]);
          }

          if (spolItems.length > 0) {
            setSpolLines(
              spolItems.map((p: any) => {
                const matchedInventoryItem = normalizedParts.find(np => np.productId === p.product_id);
                return {
                  id: p.id,
                  ProductId: matchedInventoryItem ? matchedInventoryItem.id : (p.product_id || ""),
                  quantity: Number(p.quantity),
                  amount: Number(p.subtotal),
                  manualPrice: Number(p.unit_price) || 0,
                  needsOrdering: p.needs_ordering ?? false,
                  customName: p.custom_name || undefined,
                  isTentative: p.is_tentative ?? false,
                };
              })
            );
          } else {
            setSpolLines([emptySPOLLine()]);
          }
        }
      } catch (err: any) {
        console.error("Failed to load catalog or estimate data", err);
        toast.error("Failed to load data: " + (err.message || err));
      } finally {
        setIsLoading(false);
      }
    };

    loadCatalogAndEstimate();

    if (mode === "create") {
      sessionStorage.setItem("breadcrumb-/webapp/sales/estimates/new-estimate", "Create New Estimate");
      window.dispatchEvent(new Event("breadcrumb-update"));
    }

    return () => {
      if (estimateId) {
        sessionStorage.removeItem(`breadcrumb-/webapp/sales/estimates/${estimateId}`);
      }
      if (mode === "create") {
        sessionStorage.removeItem("breadcrumb-/webapp/sales/estimates/new-estimate");
      }
      window.dispatchEvent(new Event("breadcrumb-update"));
    };
  }, [mode, estimateId]);

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
          ? (manualRate ?? 0)
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
        (l, i) => i !== idx && l.ProductId === value && l.customName === undefined
      );
      if (existingIdx !== -1) {
        const product = partsMap[value];
        const productName = product?.name ?? "Part";
        toast.warning(`"${productName}" is already in the list.`);
        return;
      }
    }

    setSoLines((prev) =>
      prev.map((l, i) => {
        if (i !== idx) return l;

        let updated = { ...l, [field]: value };

        if (field === "ProductId") {
          const found = partsMap[value];
          updated.amount = found ? (Number(updated.quantity) || 0) * found.price : 0;
          if (found) {
            const qty = Number(updated.quantity) || 0;
            const availableStock = (found.quantityOnHand ?? 0) - (found.reservedQuantity ?? 0);
            updated.needsOrdering = updated.isTentative ? false : (availableStock <= 0 || qty > availableStock);
          }
        }

        if (field === "quantity") {
          const qty = value === "" ? 0 : Math.max(0, Number(value));
          if (updated.customName !== undefined) {
            updated.quantity = qty;
            updated.amount = qty * (updated.manualPrice || 0);
          } else {
            const found = partsMap[updated.ProductId];
            updated.quantity = qty;
            updated.amount = found ? qty * found.price : 0;
            if (found) {
              const availableStock = (found.quantityOnHand ?? 0) - (found.reservedQuantity ?? 0);
              updated.needsOrdering = updated.isTentative ? false : (availableStock <= 0 || qty > availableStock);
            }
          }
        }

        if (field === "manualPrice") {
          const price = value === "" ? 0 : Math.max(0, Number(value));
          updated.manualPrice = price;
          updated.amount = (Number(updated.quantity) || 0) * price;
        }

        if (field === "customName") {
          updated.customName = value;
        }

        if (field === "needsOrdering") {
          updated.needsOrdering = !!value;
        }

        return updated;
      })
    );
  };

  const updateSPOL = (idx: number, field: keyof SPOLLine, value: any) => {
    if (field === "ProductId" && value) {
      const product = partsMap[value];
      const isSundries = product?.categoryName === SUNDRIES_CATEGORY_NAME;

      // Block duplicate product
      const existingIdx = spolLines.findIndex(
        (l, i) => i !== idx && l.ProductId === value && l.customName === undefined
      );
      if (existingIdx !== -1) {
        const productName = product?.name ?? "Supply";
        toast.warning(`"${productName}" is already in the list.`);
        return;
      }

      // Block multiple Sundries items (only 1 allowed)
      if (isSundries) {
        const hasSundries = spolLines.some(
          (l, i) => i !== idx && l.customName === undefined &&
            partsMap[l.ProductId]?.categoryName === SUNDRIES_CATEGORY_NAME
        );
        if (hasSundries) {
          toast.warning("Only one Sundries item is allowed.");
          return;
        }
      }
    }

    setSpolLines((prev) =>
      prev.map((l, i) => {
        if (i !== idx) return l;

        let updated = { ...l, [field]: value };

        if (field === "ProductId") {
          const found = partsMap[value];
          const isSundries = found?.categoryName === SUNDRIES_CATEGORY_NAME;
          if (isSundries) {
            updated.quantity = 1;
            updated.manualPrice = found?.price || 0;
            updated.amount = found?.price || 0;
            updated.needsOrdering = false;
          } else {
            updated.amount = found ? (Number(updated.quantity) || 0) * found.price : 0;
            if (found) {
              const qty = Number(updated.quantity) || 0;
              const availableStock = (found.quantityOnHand ?? 0) - (found.reservedQuantity ?? 0);
              updated.needsOrdering = updated.isTentative ? false : (availableStock <= 0 || qty > availableStock);
            }
          }
        }

        if (field === "manualPrice") {
          const price = Number(value) || 0;
          updated.manualPrice = price;
          updated.amount = (Number(updated.quantity) || 0) * price;
        }

        if (field === "quantity") {
          const qty = value === "" ? 0 : Math.max(0, Number(value));
          if (updated.customName !== undefined) {
            updated.quantity = qty;
            updated.amount = qty * (updated.manualPrice || 0);
          } else {
            const found = partsMap[updated.ProductId];
            const isSundries = found?.categoryName === SUNDRIES_CATEGORY_NAME;
            updated.quantity = isSundries ? 1 : qty;
            updated.amount = found ? (isSundries ? 1 : qty) * (updated.manualPrice || found.price || 0) : 0;
            if (!isSundries && found) {
              const availableStock = (found.quantityOnHand ?? 0) - (found.reservedQuantity ?? 0);
              updated.needsOrdering = updated.isTentative ? false : (availableStock <= 0 || qty > availableStock);
            }
          }
        }

        if (field === "needsOrdering") {
          updated.needsOrdering = !!value;
        }

        if (field === "isTentative") {
          updated.isTentative = !!value;
        }

        return updated;
      })
    );
  };

  const totals = useMemo(() => {
    const validJO = joLines.filter((l) => l.ServiceTypeId || (l.customName !== undefined && l.customName.trim() !== ""));
    const validSO = soLines.filter((l) => l.ProductId || (l.customName !== undefined && l.customName.trim() !== ""));
    const validSPOL = spolLines.filter((l) => l.ProductId || (l.customName !== undefined && l.customName.trim() !== ""));

    const totalServices = validJO.reduce((s, l) => s + l.amount, 0);
    const totalParts = validSO.reduce((s, l) => s + l.amount, 0);
    const totalSupplies = validSPOL.reduce((s, l) => s + l.amount, 0);

    // Tentative-only subtotals
    const tentativeServices = validJO.filter(l => l.isTentative).reduce((s, l) => s + l.amount, 0);
    const tentativeParts = validSO.filter(l => l.isTentative).reduce((s, l) => s + l.amount, 0);
    const tentativeSupplies = validSPOL.filter(l => l.isTentative).reduce((s, l) => s + l.amount, 0);
    const tentativeTotal = tentativeServices + tentativeParts + tentativeSupplies;

    const estimatedMinutes = validJO.reduce(
      (sum, l) => {
        const service = servicesMap[l.ServiceTypeId];
        if (!service?.duration) return sum;
        return sum + service.duration;
      },
      0
    );

    // total includes everything; baseTotal excludes tentative
    const total = totalServices + totalParts + totalSupplies;
    const baseTotal = total - tentativeTotal;

    return {
      totalServices,
      totalParts,
      totalSupplies,
      total,
      baseTotal,
      tentativeTotal,
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

    if (totals.validSPOL.some((l) => !l.quantity || l.quantity <= 0)) {
      toast.error("All supply lines must have a quantity greater than zero.");
      return;
    }

    const payloadItems = [
      ...joLines
        .filter((l) => l.ServiceTypeId || (l.customName !== undefined && l.customName.trim() !== ""))
        .map((l) => {
          if (l.customName !== undefined) {
            return {
              item_type: "service",
              service_id: null,
              product_id: null,
              quantity: 1,
              unit_price: Number(l.manualRate || 0),
              subtotal: l.amount,
              needs_ordering: false,
              custom_name: l.customName,
              is_tentative: l.isTentative,
            };
          }
          const rate = l.manualRate ?? getServicePrice(l.ServiceTypeId, selectedVehicle);
          return {
            item_type: "service",
            service_id: l.ServiceTypeId,
            product_id: null,
            quantity: 1,
            unit_price: rate,
            subtotal: l.amount,
            needs_ordering: false,
            custom_name: null,
            is_tentative: l.isTentative,
          };
        }),
      ...soLines
        .filter((l) => l.ProductId || (l.customName !== undefined && l.customName.trim() !== ""))
        .map((l) => {
          if (l.customName !== undefined) {
            return {
              item_type: "part",
              service_id: null,
              product_id: null,
              quantity: Number(l.quantity),
              unit_price: Number(l.manualPrice || 0),
              subtotal: l.amount,
              needs_ordering: l.needsOrdering,
              custom_name: l.customName,
              is_tentative: l.isTentative,
            };
          }
          const found = partsMap[l.ProductId];
          const price = found?.price || 0;
          return {
            item_type: "part",
            service_id: null,
            product_id: found?.productId || l.ProductId,
            quantity: Number(l.quantity),
            unit_price: price,
            subtotal: l.amount,
            needs_ordering: l.needsOrdering,
            custom_name: null,
            is_tentative: l.isTentative,
          };
        }),
      ...spolLines
        .filter((l) => l.ProductId || (l.customName !== undefined && l.customName.trim() !== ""))
        .map((l) => {
          if (l.customName !== undefined) {
            return {
              item_type: "supply",
              service_id: null,
              product_id: null,
              quantity: Number(l.quantity),
              unit_price: Number(l.manualPrice || 0),
              subtotal: l.amount,
              needs_ordering: l.needsOrdering,
              custom_name: l.customName,
              is_tentative: l.isTentative,
            };
          }
          const found = partsMap[l.ProductId];
          const isSundries = found?.categoryName === SUNDRIES_CATEGORY_NAME;
          const price = isSundries ? (l.manualPrice || found?.price || 0) : (found?.price || 0);
          return {
            item_type: "supply",
            service_id: null,
            product_id: found?.productId || l.ProductId,
            quantity: Number(l.quantity),
            unit_price: price,
            subtotal: l.amount,
            needs_ordering: isSundries ? false : l.needsOrdering,
            custom_name: null,
            is_tentative: l.isTentative,
          };
        })
    ];

    const payload = {
      customer_id: Number(selectedCustomer.id),
      vehicle_id: Number(selectedVehicle.id),
      status: mode === "edit" ? undefined : "FOR APPROVAL",
      total_amount: totals.total,
      mileage: Number(mileage),
      notes: notes,
      downpayment_amount: mode === "edit" ? downpayment : undefined,
      items: payloadItems,
    };

    setIsSaving(true);
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
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreSaveEstimate = () => {
    if (!selectedCustomer || !selectedVehicle) {
      toast.error("Please select a customer and vehicle.");
      return;
    }

    if (selectedCustomer.origin === 'appointment') {
      toast.error("Cannot create estimate: This customer profile is incomplete.");
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

    if (totals.validSPOL.some((l) => !l.quantity || l.quantity <= 0)) {
      toast.error("All supply lines must have a quantity greater than zero.");
      return;
    }

    const uncheckedShortageList = soLines
      .concat(spolLines as any)
      .filter((l) => {
        if (l.customName !== undefined || !l.ProductId) return false;
        const prod = partsMap[l.ProductId];
        if (!prod || prod.quantityOnHand === null) return false;
        return Number(l.quantity) > prod.quantityOnHand && !l.needsOrdering;
      })
      .map((l) => {
        const prod = partsMap[l.ProductId];
        return `${prod?.name || "Part"} (Requested: ${l.quantity}, Stock: ${prod?.quantityOnHand})`;
      });

    if (uncheckedShortageList.length > 0) {
      setShortageItems(uncheckedShortageList);
      setShowConfirmModal(true);
    } else {
      saveEstimate();
    }
  };

  const fetchPdfBlob = useCallback(async (hidePartNumber: boolean, incTentative: boolean) => {
    if (!estimateId) return;
    setIsLoadingPdf(true);
    try {
      const response = await api.get(`/estimates/${estimateId}/download-pdf`, {
        params: { 
          hide_part_number: hidePartNumber,
          include_tentative: incTentative,
        },
        responseType: 'blob',
      });
      if (pdfBlobUrl) window.URL.revokeObjectURL(pdfBlobUrl);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      setPdfBlobUrl(url);
    } catch (error) {
      console.error("Error loading PDF:", error);
      toast.error("Failed to load PDF preview.");
    } finally {
      setIsLoadingPdf(false);
    }
  }, [estimateId, pdfBlobUrl]);

  const handlePreviewPDF = async () => {
    setShowPdfPreview(true);
    await fetchPdfBlob(!includePartNumbers, includeTentative);
  };


  // Re-fetch PDF when part numbers or tentative toggles change while preview is open
  useEffect(() => {
    if (showPdfPreview && estimateId) {
      fetchPdfBlob(!includePartNumbers, includeTentative);
    }
  }, [includePartNumbers, includeTentative]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) window.URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [pdfBlobUrl]);

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
      <DataToolbar variant="detail" title={mode === "edit" ? "Edit Estimate" : ""} />

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
                  <Wrench className="size-5 text-blue-500" />
                  <h2 className="text-sm font-semibold text-foreground">Services (Job Order)</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={addJOLine} className="h-7 gap-1 text-xs"><Plus className="h-3 w-3" /> Add Service</Button>
                  <Button size="sm" variant="outline" onClick={addCustomJOLine} className="h-7 gap-1 text-xs"><Plus className="h-3 w-3" /> Add Custom Service</Button>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[420px] overflow-y-auto">
                  <Table className="[&_tr]:hover:!bg-transparent">
                    <TableHeader className="sticky top-0 z-10 bg-background">
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs w-[28%] text-center">Service</TableHead>
                        <TableHead className="text-xs w-[23%] text-center">Pricing</TableHead>
                        <TableHead className="text-xs w-[12%] text-center">Est. Duration</TableHead>
                        <TableHead className="text-xs w-[11%] text-center">Rate</TableHead>
                        <TableHead className="text-xs w-[11%] text-center">Amount</TableHead>
                        <TableHead className="text-xs w-[10%] text-center">Tentative</TableHead>
                        <TableHead className="text-xs w-[5%]"></TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {joLines.map((l, idx) => {
                        const isCustom = l.customName !== undefined;
                        const service = getService(l.ServiceTypeId);
                        const rate = getServicePrice(l.ServiceTypeId, selectedVehicle);

                        return (
                          <TableRow key={l.id} className="hover:bg-transparent">
                            <TableCell className="relative overflow-visible align-top">
                              {isCustom ? (
                                <Input
                                  value={l.customName || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setJoLines((prev) => prev.map((line, i) => i === idx ? { ...line, customName: val } : line));
                                  }}
                                  placeholder="Enter custom service name..."
                                />
                              ) : (
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
                              )}
                              {!isCustom && service?.tasks && service.tasks.length > 0 && (
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
                              {!isCustom && expandedTaskRows.has(l.id) && service?.tasks && service.tasks.length > 0 && (
                                <ul className="mt-1.5 list-disc pl-4 space-y-0.5 text-[10px] text-muted-foreground">
                                  {service.tasks.map((task, i) => (
                                    <li key={i}>{task}</li>
                                  ))}
                                </ul>
                              )}
                            </TableCell>

                            <TableCell className="align-top text-center">
                              {isCustom ? (
                                <span className="text-xs text-muted-foreground">—</span>
                              ) : (
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
                              )}
                            </TableCell>

                            <TableCell className="align-top text-center">
                              {isCustom ? (
                                <span className="text-xs text-muted-foreground">—</span>
                              ) : (
                                service?.duration ? formatDuration(service.duration) : "No Duration"
                              )}
                            </TableCell>

                            <TableCell className="align-top">
                              <CurrencyInput
                                value={l.manualRate !== undefined ? l.manualRate : (service ? rate : 0)}
                                onChange={(newRate) => updateJORate(idx, String(newRate))}
                                className={!service && !isCustom ? "opacity-40 pointer-events-none" : ""}
                              />
                            </TableCell>

                            <TableCell className="align-top text-center">
                              {peso(l.amount)}
                            </TableCell>

                            <TableCell className="align-top text-center">
                              <input
                                type="checkbox"
                                checked={l.isTentative}
                                onChange={(e) => setJoLines(prev => prev.map((line, i) => i === idx ? { ...line, isTentative: e.target.checked } : line))}
                                className="rounded border-input text-amber-500 focus:ring-amber-500 h-4 w-4 cursor-pointer"
                              />
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
                  <Box className="size-5 text-orange-500" />
                  <h2 className="text-sm font-semibold text-foreground">Parts (Sales Order)</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={addSOLine} className="h-7 gap-1 text-xs"><Plus className="h-3 w-3" /> Add Part</Button>
                  <Button size="sm" variant="outline" onClick={addCustomSOLine} className="h-7 gap-1 text-xs"><Plus className="h-3 w-3" /> Add Custom Part</Button>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[420px] overflow-y-auto">
                  <Table className="[&_tr]:hover:!bg-transparent">
                    <TableHeader className="sticky top-0 z-10 bg-background">
                      <TableRow className="bg-muted/50 text-center">
                        <TableHead className="text-xs text-center w-[20%]">Item Name</TableHead>
                        <TableHead className="text-xs text-center w-[12%]">Part Number</TableHead>
                        <TableHead className="text-xs text-center w-[10%]">Stock Status</TableHead>
                        <TableHead className="text-xs w-[13%] text-center">Unit Price</TableHead>
                        <TableHead className="text-xs w-[8%] text-center">Quantity</TableHead>
                        <TableHead className="text-xs w-[10%] text-center">Amount</TableHead>
                        <TableHead className="text-xs text-center w-[9%]">Needs Order</TableHead>
                        <TableHead className="text-xs w-[9%] text-center">Tentative</TableHead>
                        <TableHead className="text-xs w-[4%]"></TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {soLines.map((l, idx) => {
                        const isCustom = l.customName !== undefined;
                        const product = partsMap[l.ProductId];
                        const stockStatus = getStockStatus(product);

                        return (
                          <TableRow key={l.id} className="hover:bg-transparent">
                            <TableCell>
                              {isCustom ? (
                                <Input
                                  value={l.customName || ""}
                                  onChange={(e) => updateSO(idx, "customName", e.target.value)}
                                  placeholder="Enter custom part name..."
                                />
                              ) : (
                                <Combobox
                                  value={l.ProductId}
                                  onChange={(val) => updateSO(idx, "ProductId", val)}
                                  items={partsOnly.map((p) => ({
                                    label: p.manufacturer
                                      ? `${p.manufacturer} ${p.name} - Part No: ${p.partNumber || p.sku || "—"}`
                                      : `${p.name} - Part No: ${p.partNumber || p.sku || "—"}`,
                                    value: p.id,
                                    description: `${peso(p.price)}${p.quantityOnHand != null ? ` · Stock: ${p.quantityOnHand}` : ""}`,
                                  }))}
                                  placeholder="Select part"
                                />
                              )}
                            </TableCell>

                            <TableCell className="text-center font-mono font-medium text-xs text-muted-foreground">
                              {isCustom ? "—" : (product?.partNumber || product?.sku || "—")}
                            </TableCell>

                            <TableCell className="text-center">
                              {isCustom ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                                  Custom Item
                                </span>
                              ) : stockStatus ? (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                                  {stockStatus.label}
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </TableCell>

                            <TableCell className="text-center">
                              {isCustom ? (
                                <CurrencyInput
                                  value={l.manualPrice || 0}
                                  onChange={(val) => updateSO(idx, "manualPrice", val)}
                                />
                              ) : (
                                peso(product?.price || 0)
                              )}
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

                            <TableCell className="text-center">
                              <input
                                type="checkbox"
                                checked={l.needsOrdering}
                                disabled={l.isTentative || (() => {
                                  const p = partsMap[l.ProductId];
                                  if (!p) return false;
                                  const avail = (p.quantityOnHand ?? 0) - (p.reservedQuantity ?? 0);
                                  return avail >= Number(l.quantity);
                                })()}
                                onChange={(e) => updateSO(idx, "needsOrdering", e.target.checked)}
                                className="rounded border-input text-primary focus:ring-primary h-4 w-4 cursor-pointer disabled:opacity-40"
                              />
                            </TableCell>

                            <TableCell className="text-center">
                              <input
                                type="checkbox"
                                checked={l.isTentative}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setSoLines(prev => prev.map((line, i) => {
                                    if (i !== idx) return line;
                                    let needsOrdering = line.needsOrdering;
                                    if (checked) {
                                      needsOrdering = false;
                                    } else {
                                      if (line.customName !== undefined) {
                                        needsOrdering = true;
                                      } else {
                                        const found = partsMap[line.ProductId];
                                        if (found) {
                                          const qty = Number(line.quantity || 0);
                                          const availableStock = (found.quantityOnHand ?? 0) - (found.reservedQuantity ?? 0);
                                          needsOrdering = availableStock <= 0 || qty > availableStock;
                                        }
                                      }
                                    }
                                    return { ...line, isTentative: checked, needsOrdering };
                                  }));
                                }}
                                className="rounded border-input text-amber-500 focus:ring-amber-500 h-4 w-4 cursor-pointer"
                              />
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
                  <Fuel className="size-5 text-green-600" />
                  <h2 className="text-sm font-semibold text-foreground">Supplies, Petrol, Oils, and Lubricants</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={addSPOLLine} className="h-7 gap-1 text-xs"><Plus className="h-3 w-3" /> Add Supply</Button>
                  <Button size="sm" variant="outline" onClick={addCustomSPOLLine} className="h-7 gap-1 text-xs"><Plus className="h-3 w-3" /> Add Custom Supply</Button>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[420px] overflow-y-auto">
                  <Table className="[&_tr]:hover:!bg-transparent">
                    <TableHeader className="sticky top-0 z-10 bg-background">
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs text-center w-[26%]">Item Name</TableHead>
                        <TableHead className="text-xs text-center w-[12%]">Stock Status</TableHead>
                        <TableHead className="text-xs w-[13%] text-center">Unit Price</TableHead>
                        <TableHead className="text-xs w-[9%] text-center">Quantity</TableHead>
                        <TableHead className="text-xs w-[10%] text-center">Amount</TableHead>
                        <TableHead className="text-xs text-center w-[10%]">Needs Order</TableHead>
                        <TableHead className="text-xs w-[10%] text-center">Tentative</TableHead>
                        <TableHead className="text-xs w-[5%]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {spolLines.map((l, idx) => {
                        const isCustom = l.customName !== undefined;
                        const product = partsMap[l.ProductId];
                        const stockStatus = getStockStatus(product);
                        const isSundries = !isCustom && product?.categoryName === SUNDRIES_CATEGORY_NAME;

                        return (
                          <TableRow key={l.id} className="hover:bg-transparent">
                            <TableCell>
                              {isCustom ? (
                                <Input
                                  value={l.customName || ""}
                                  onChange={(e) => updateSPOL(idx, "customName", e.target.value)}
                                  placeholder="Enter custom supply name..."
                                />
                              ) : (
                                <Combobox
                                  value={l.ProductId}
                                  onChange={(val) => updateSPOL(idx, "ProductId", val)}
                                  items={spolOnly.map((p) => {
                                    const isSundries = p.categoryName === SUNDRIES_CATEGORY_NAME;
                                    return {
                                      label: p.manufacturer
                                        ? `${p.manufacturer} ${p.name} - Part No: ${p.partNumber || p.sku || "—"}`
                                        : `${p.name} - Part No: ${p.partNumber || p.sku || "—"}`,
                                      value: p.id,
                                      description: isSundries && p.description
                                        ? p.description
                                        : `${peso(p.price)}${p.quantityOnHand != null ? ` · Stock: ${p.quantityOnHand}` : ""}`,
                                    };
                                  })}
                                  placeholder="Select supply / oil / lubricant"
                                />
                              )}
                            </TableCell>

                            <TableCell className="text-center">
                              {isCustom ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                                  Custom Item
                                </span>
                              ) : isSundries ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                                  Sundries
                                </span>
                              ) : stockStatus ? (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                                  {stockStatus.label}
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </TableCell>

                            <TableCell className="text-center">
                              {isCustom ? (
                                <CurrencyInput
                                  value={l.manualPrice || 0}
                                  onChange={(val) => updateSPOL(idx, "manualPrice", val)}
                                />
                              ) : isSundries ? (
                                <CurrencyInput
                                  value={l.manualPrice || 0}
                                  onChange={(val) => updateSPOL(idx, "manualPrice", val)}
                                />
                              ) : (
                                peso(product?.price || 0)
                              )}
                            </TableCell>

                            <TableCell>
                              {isSundries ? (
                                <span className="text-sm text-muted-foreground font-medium px-2">1</span>
                              ) : (
                                <Input
                                  type="number"
                                  min={0}
                                  value={l.quantity === 0 || l.quantity === "" ? "" : String(l.quantity)}
                                  placeholder="0"
                                  onFocus={() => { if (!l.quantity) updateSPOL(idx, "quantity", ""); }}
                                  onBlur={(e) => { if (e.target.value === "") updateSPOL(idx, "quantity", 0); }}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (!/^\d*$/.test(val)) return;
                                    updateSPOL(idx, "quantity", val === "" ? "" : Number(val));
                                  }}
                                />
                              )}
                            </TableCell>

                            <TableCell className="text-center">
                              {peso(l.amount)}
                            </TableCell>

                            <TableCell className="text-center">
                              {isSundries ? (
                                <span className="text-muted-foreground text-xs">—</span>
                              ) : (
                                <input
                                  type="checkbox"
                                  checked={l.needsOrdering}
                                  disabled={l.isTentative || (() => {
                                    const p = partsMap[l.ProductId];
                                    if (!p) return false;
                                    const avail = (p.quantityOnHand ?? 0) - (p.reservedQuantity ?? 0);
                                    return avail >= Number(l.quantity);
                                  })()}
                                  onChange={(e) => updateSPOL(idx, "needsOrdering", e.target.checked)}
                                  className="rounded border-input text-primary focus:ring-primary h-4 w-4 cursor-pointer disabled:opacity-40"
                                />
                              )}
                            </TableCell>

                            <TableCell className="text-center">
                              {isSundries ? (
                                <span className="text-xs text-muted-foreground">—</span>
                              ) : (
                                <input
                                  type="checkbox"
                                  checked={l.isTentative}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setSpolLines(prev => prev.map((line, i) => {
                                      if (i !== idx) return line;
                                      let needsOrdering = line.needsOrdering;
                                      if (checked) {
                                        needsOrdering = false;
                                      } else {
                                        if (line.customName !== undefined) {
                                          needsOrdering = true;
                                        } else {
                                          const found = partsMap[line.ProductId];
                                          if (found) {
                                            const qty = Number(line.quantity || 0);
                                            const availableStock = (found.quantityOnHand ?? 0) - (found.reservedQuantity ?? 0);
                                            needsOrdering = availableStock <= 0 || qty > availableStock;
                                          }
                                        }
                                      }
                                      return { ...line, isTentative: checked, needsOrdering };
                                    }));
                                  }}
                                  className="rounded border-input text-amber-500 focus:ring-amber-500 h-4 w-4 cursor-pointer"
                                />
                              )}
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
                    <Separator />
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

                  <div className="bg-primary/10 p-3 rounded-lg border border-primary/20 space-y-2">
                    <div className="flex justify-between items-end text-primary">
                      <span className="text-xs font-bold uppercase">Grand Total (Confirmed)</span>
                      <span className="text-2xl font-bold tracking-wide">{peso(totals.baseTotal)}</span>
                    </div>
                    {totals.tentativeTotal > 0 && (
                      <>
                        <Separator className="bg-primary/20" />
                        <div className="flex justify-between items-end text-amber-600 dark:text-amber-400">
                          <span className="text-[10px] font-semibold uppercase">Tentative Items</span>
                          <span className="text-sm font-semibold">+{peso(totals.tentativeTotal)}</span>
                        </div>
                        <div className="flex justify-between items-end text-muted-foreground">
                          <span className="text-[10px] font-medium uppercase">Grand Total (incl. Tentative)</span>
                          <span className="text-lg font-bold">{peso(totals.total)}</span>
                        </div>
                      </>
                    )}
                    {mode === "edit" && (
                      <>
                        <Separator className="bg-primary/20" />
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>Downpayment</span>
                          <div className="w-32 flex flex-col items-end">
                            <CurrencyInput
                              value={downpayment}
                              onChange={(val) => setDownpayment(val ?? 0)}
                              className="bg-white dark:bg-zinc-900 border-2 border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 shadow-md font-semibold text-blue-900 dark:text-blue-100"
                            />
                            {downpayment > totals.total && (
                              <p className="text-[10px] text-red-600 font-medium text-right mt-1 animate-pulse">
                                Cannot exceed Grand Total
                              </p>
                            )}
                          </div>
                        </div>
                        <Separator className="bg-primary/20" />
                        <div className="flex justify-between items-end text-primary">
                          <span className="text-xs font-bold uppercase">Balance Due</span>
                          <span className="text-2xl font-bold tracking-wide">
                            {peso(Math.max(0, totals.baseTotal - downpayment))}
                          </span>
                        </div>
                        {totals.tentativeTotal > 0 && (
                          <div className="flex justify-between items-end text-muted-foreground">
                            <span className="text-[10px] font-medium uppercase">Balance Due (incl. Tentative)</span>
                            <span className="text-lg font-bold">
                              {peso(Math.max(0, totals.total - downpayment))}
                            </span>
                          </div>
                        )}
                      </>
                    )}
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
                      onClick={handlePreSaveEstimate}
                      disabled={
                        isSaving ||
                        !selectedCustomer ||
                        !selectedVehicle ||
                        !mileage || Number(mileage) <= 0 ||
                        (totals.validJO.length === 0 && totals.validSO.length === 0 && totals.validSPOL.length === 0) ||
                        (mode === "edit" && downpayment > totals.total)
                      }
                    >
                      {isSaving ? "Saving..." : mode === "edit" ? "Save Changes" : "Create Estimate"}
                    </Button>
                    {mode === "edit" && (
                      <>
                        <Button
                          variant="outline"
                          className="w-full shadow-sm"
                          onClick={handlePreviewPDF}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview PDF
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(-1)}
                      className="text-destructive hover:bg-destructive/10"
                      disabled={isSaving}
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

      {/* Shortage Override confirmation dialog */}
      <ConfirmDialog
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        title="Proceed with Unordered Shortages?"
        description={
          <div className="space-y-2 text-left">
            <p className="text-sm">
              The following items have insufficient stock but are NOT flagged for ordering. You may be planning to outsource them:
            </p>
            <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
              {shortageItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <p className="text-sm font-medium mt-2">Do you want to proceed and save this estimate?</p>
          </div>
        }
        confirmLabel="Proceed"
        cancelLabel="Cancel"
        onConfirm={() => {
          setShowConfirmModal(false);
          saveEstimate();
        }}
      />

      {/* ========== PDF PREVIEW DIALOG ========== */}
      <Dialog open={showPdfPreview} onOpenChange={(open) => {
        setShowPdfPreview(open);
        if (!open && pdfBlobUrl) {
          window.URL.revokeObjectURL(pdfBlobUrl);
          setPdfBlobUrl(null);
        }
      }}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b bg-background shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold">
                PDF Preview — {estimateNumber || "Estimate"}
              </DialogTitle>
              <div className="flex items-center gap-4 mr-8">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="preview-include-part-numbers-form"
                    checked={includePartNumbers}
                    onCheckedChange={(checked) => setIncludePartNumbers(!!checked)}
                  />
                  <label htmlFor="preview-include-part-numbers-form" className="text-xs text-muted-foreground cursor-pointer select-none whitespace-nowrap">
                    Include Part Numbers
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="preview-include-tentative-form"
                    checked={includeTentative}
                    onCheckedChange={(checked) => setIncludeTentative(!!checked)}
                  />
                  <label htmlFor="preview-include-tentative-form" className="text-xs text-muted-foreground cursor-pointer select-none whitespace-nowrap">
                    Include Tentative Items
                  </label>
                </div>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 min-h-0 bg-muted/30">
            {isLoadingPdf ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground animate-pulse">Generating PDF...</p>
                </div>
              </div>
            ) : pdfBlobUrl ? (
              <iframe
                src={pdfBlobUrl}
                className="w-full h-full border-0"
                title="Estimate PDF Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">No preview available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddEstimate;