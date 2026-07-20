import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import DataToolbar from "@/components/DataToolbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Combobox from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import CustomerFormModal from "@/components/popupModal/Customers/addCustomer";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  User,
  Car,
  Box,
  Fuel,
  ArrowLeft,
  CheckCircle2,
  Calculator,
} from "lucide-react";
import api from "@/api/axios";

/* TYPES */
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
  plateNo: string;
  year?: string;
  make?: string;
  model?: string;
  variant?: string;
  color?: string;
  engineNo?: string;
  vin?: string;
  registrationNo?: string;
  mileage?: number;
}

interface Product {
  id: string;
  productId?: string;
  name: string;
  sku: string;
  partNumber?: string;
  manufacturer?: string;
  price: number;
  unit: string;
  quantityOnHand: number | null;
  reorderLevel: number | null;
  categoryIsSpol?: boolean;
  categoryName?: string;
  taxCode?: string;
}

interface SalesOrderLine {
  id: string;
  ProductId: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  needsOrdering: boolean;
  isSpol?: boolean;
  taxCode?: string;
  categoryName?: string;
}

interface SalesOrderFormProps {
  mode?: "create" | "edit";
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const SUNDRIES_CATEGORY_NAME = "Sundries";

const emptyLine = (isSpol = false): SalesOrderLine => ({
  id: generateId(),
  ProductId: "",
  quantity: 1,
  unitPrice: 0,
  amount: 0,
  needsOrdering: false,
  isSpol,
  taxCode: undefined,
  categoryName: undefined,
});

const SalesOrderForm: React.FC<SalesOrderFormProps> = ({ mode = "create" }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<SalesOrderLine[]>([emptyLine()]);
  const [mileage, setMileage] = useState<string>("");

  const [partsCatalog, setPartsCatalog] = useState<Product[]>([]);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");

  const partsMap = useMemo(() => {
    return Object.fromEntries(partsCatalog.map((p) => [p.id, p]));
  }, [partsCatalog]);

  const customerVehicles = useMemo(() => {
    return vehicles.filter(
      (v) => String(v.customerId) === String(selectedCustomer?.id),
    );
  }, [vehicles, selectedCustomer]);

  const peso = (n: number) =>
    `₱${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getStockStatus = (p: Product | undefined) => {
    if (!p) return null;
    const qoh = p.quantityOnHand;
    if (qoh === null)
      return {
        label: "Not Tracked",
        color: "text-gray-400",
        bg: "bg-gray-100 dark:bg-gray-800",
      };
    if (qoh <= 0)
      return {
        label: "Out of Stock",
        color: "text-red-600",
        bg: "bg-red-50 dark:bg-red-950",
      };
    if (p.reorderLevel && qoh <= p.reorderLevel)
      return {
        label: `Low (${qoh})`,
        color: "text-amber-600",
        bg: "bg-amber-50 dark:bg-amber-950",
      };
    return {
      label: `In Stock (${qoh})`,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-950",
    };
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        const promises = [api.get("/customers"), api.get("/inventory"), api.get("/products")];

        if (mode === "edit" && id) {
          promises.push(api.get(`/sales-orders/${id}`));
        }

        const results = await Promise.all(promises);

        const customersRes = results[0];
        const productsRes = results[1];
        const allProductsRes = results[2];
        const orderRes = mode === "edit" && id ? results[3] : null;

        const dbCustomers = customersRes.data.data || [];
        const dbProducts = Array.isArray(productsRes.data)
          ? productsRes.data
          : productsRes.data.data || [];

        const allVehicles: Vehicle[] = [];
        const normalizedCustomers: Customer[] = dbCustomers.map((c: any) => {
          if (Array.isArray(c.vehicles)) {
            c.vehicles.forEach((v: any) => {
              allVehicles.push({
                id: String(v.id),
                customerId: String(c.customer_id),
                plateNo: v.plate_number || "",
                year: v.year_model || "",
                make: v.make || "",
                model: v.model || "",
                variant: v.variant || "",
                color: v.color || "",
                engineNo: v.engine_number || "",
                vin: v.VIN || "",
                registrationNo: v.registration_number || "",
                mileage: v.mileage ?? undefined,
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

        const normalizedParts: Product[] = dbProducts.map((row: any) => {
          const product = row.product || {};
          const productSuppliers = product.product_suppliers || product.productSuppliers || [];
          const firstSupplier = productSuppliers[0];
          const taxCode = firstSupplier?.is_vat ? 'VAT' : 'Non-VAT';
          return {
            id: String(row.id),
            productId: String(product.id || ""),
            name: product.name || "",
            sku: product.SKU || "",
            partNumber: product.part_number || "",
            manufacturer: product.manufacturer_name || "",
            price: Number(row.selling_price || 0),
            unit: product.unit?.name || "pc",
            quantityOnHand: Number(row.quantity_on_hand ?? 0),
            reorderLevel: Number(row.reorder_level ?? 5),
            categoryIsSpol: Boolean(product.category_is_spol || product.category?.is_spol || row.category_is_spol),
            categoryName: product.category_name || product.category?.name || null,
            taxCode,
          };
        });

        const dbAllProducts = Array.isArray(allProductsRes.data)
          ? allProductsRes.data
          : allProductsRes.data?.data || [];
        const inventoryProductIds = new Set(normalizedParts.map(p => p.productId));
        const sundriesProducts: Product[] = dbAllProducts
          .filter((p: any) => p.category_is_spol && !inventoryProductIds.has(String(p.id)))
          .map((p: any) => {
            const suppliers = p.suppliers || [];
            const firstSupplier = suppliers[0];
            const taxCode = firstSupplier?.is_vat ? 'VAT' : 'Non-VAT';
            const price = Number(p.preferred_selling_price || firstSupplier?.active_price?.Price || 0);
            return {
              id: String(p.id),
              productId: String(p.id),
              name: p.name || "",
              sku: p.sku || p.SKU || "",
              partNumber: p.part_number || "",
              manufacturer: p.manufacturer_name || "",
              price,
              unit: p.unit_name || "pc",
              quantityOnHand: null,
              reorderLevel: null,
              categoryIsSpol: true,
              categoryName: p.category_name || null,
              taxCode,
            };
          });
        normalizedParts.push(...sundriesProducts);

        setCustomers(normalizedCustomers);
        setVehicles(allVehicles);
        setPartsCatalog(normalizedParts);

        if (orderRes && orderRes.data.data) {
          const o = orderRes.data.data;
          setNotes(o.remarks || "");

          if (o.so_number) {
            sessionStorage.setItem(
              `breadcrumb-/webapp/sales/sales-orders/${id}`,
              o.so_number,
            );
            sessionStorage.setItem(
              `breadcrumb-${location.pathname}`,
              o.so_number,
            );
            window.dispatchEvent(new Event("breadcrumb-update"));
          }

          if (o.mileage != null) {
            setMileage(String(o.mileage));
          }

          const cust = o.customer;
          if (cust) {
            setSelectedCustomer({
              id: String(cust.customer_id),
              firstName: cust.first_name || "",
              lastName: cust.last_name || "",
              address: cust.address || "",
              mobileNumber: cust.mobile_number || "",
              landline: cust.landline || "",
              email: cust.email || "",
              businessPhone: cust.business || "",
            });
          }

          const veh = o.vehicle;
          if (veh) {
            setSelectedVehicle({
              id: String(veh.id),
              customerId: String(o.customerID),
              plateNo: veh.plate_number || "",
              year: veh.year_model || "",
              make: veh.make || "",
              model: veh.model || "",
              variant: veh.variant || "",
              color: veh.color || "",
              engineNo: veh.engine_number || "",
              vin: veh.VIN || "",
              registrationNo: veh.registration_number || "",
              mileage: veh.mileage ?? undefined,
            });
          }

          const items = Array.isArray(o.items) ? o.items : [];
          if (items.length > 0) {
            setLines(
              items.map((i: any) => {
                const matchPart = normalizedParts.find(
                  (np) => np.productId === i.ProductID,
                );
                const taxCode = i.TaxAtSale
                  ? (i.TaxAtSale === 'NON_VAT' ? 'Non-VAT' : 'VAT')
                  : (matchPart?.taxCode ?? undefined);
                return {
                  id: i.id,
                  ProductId: matchPart ? matchPart.id : "",
                  quantity: Number(i.quantity) || 1,
                  unitPrice: Number(i.UnitPrice) || 0,
                  amount: Number(i.SubTotal) || 0,
                  needsOrdering: Boolean(i.needs_ordering),
                  isSpol: matchPart ? Boolean(matchPart.categoryIsSpol) : false,
                  taxCode,
                  categoryName: matchPart?.categoryName ?? undefined,
                };
              }),
            );
          }
        }
      } catch (err: any) {
        console.error("Failed to load catalog or form details", err);
        toast.error("Failed to load catalogs");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();

    if (mode === "create") {
      sessionStorage.setItem(
        `breadcrumb-${location.pathname}`,
        "Create Sales Order",
      );
      window.dispatchEvent(new Event("breadcrumb-update"));
    }

    return () => {
      if (mode === "create") {
        sessionStorage.removeItem(`breadcrumb-${location.pathname}`);
      } else if (id) {
        sessionStorage.removeItem(
          `breadcrumb-/webapp/sales/sales-orders/${id}`,
        );
        sessionStorage.removeItem(`breadcrumb-${location.pathname}`);
      }
      window.dispatchEvent(new Event("breadcrumb-update"));
    };
  }, [mode, id]);

  const addPartLine = () => setLines((prev) => [...prev, emptyLine(false)]);
  const addSpolLine = () => setLines((prev) => [...prev, emptyLine(true)]);

  const removeLine = (lineId: string, isSpol = false) => {
    setLines((prev) => {
      const next = prev.filter((l) => l.id !== lineId);
      return next.length > 0 ? next : [emptyLine(isSpol)];
    });
  };

  const updateLine = (lineId: string, field: keyof SalesOrderLine, value: any) => {
    if (field === "ProductId" && value) {
      const duplicateIdx = lines.findIndex((l) => l.id !== lineId && l.ProductId === value);
      if (duplicateIdx !== -1) {
        toast.warning("This product is already in the list.");
        return;
      }
    }

    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== lineId) return l;

        const updated = { ...l, [field]: value };

        if (field === "ProductId") {
          const product = partsMap[value];
          const isSundries = product?.categoryName === SUNDRIES_CATEGORY_NAME;
          updated.unitPrice = product ? product.price : 0;
          updated.quantity = isSundries ? 1 : updated.quantity;
          updated.amount = (Number(updated.quantity) || 0) * updated.unitPrice;
          updated.taxCode = isSundries ? 'VAT' : (product ? product.taxCode : undefined);
          updated.categoryName = product ? product.categoryName : undefined;
          if (product && !isSundries) {
            const qoh = product.quantityOnHand ?? 0;
            updated.needsOrdering = updated.quantity > qoh;
          }
        }

        if (field === "quantity") {
          const qty = Number(value) || 0;
          updated.quantity = qty;
          updated.amount = qty * updated.unitPrice;

          const product = partsMap[updated.ProductId];
          if (product) {
            const qoh = product.quantityOnHand ?? 0;
            updated.needsOrdering = qty > qoh;
          }
        }

        if (field === "unitPrice") {
          const price = Number(value) || 0;
          updated.unitPrice = price;
          updated.amount = (Number(updated.quantity) || 0) * price;
        }

        return updated;
      }),
    );
  };

  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  const total = subtotal;

  const handleAddCustomer = (search: string) => {
    setCustomerSearch(search);
    setCustomerModalOpen(true);
  };

  const handleCustomerSaved = (newCustomer: any) => {
    const normalized: Customer = {
      id: String(newCustomer.customer_id),
      firstName: newCustomer.first_name || "",
      lastName: newCustomer.last_name || "",
      address: newCustomer.address || "",
      mobileNumber: newCustomer.mobile_number || "",
      landline: newCustomer.landline || "",
      email: newCustomer.email || "",
      businessPhone: newCustomer.business || "",
    };

    const newVehs: Vehicle[] = [];
    if (Array.isArray(newCustomer.vehicles)) {
      newCustomer.vehicles.forEach((v: any) => {
        newVehs.push({
          id: String(v.id),
          customerId: String(newCustomer.customer_id),
          plateNo: v.plate_number || "",
          year: v.year_model || "",
          make: v.make || "",
          model: v.model || "",
          variant: v.variant || "",
          color: v.color || "",
          engineNo: v.engine_number || "",
          vin: v.VIN || "",
          registrationNo: v.registration_number || "",
          mileage: v.mileage ?? undefined,
        });
      });
    }

    setCustomers((prev) => [...prev, normalized]);
    setVehicles((prev) => [...prev, ...newVehs]);
    setSelectedCustomer(normalized);

    if (newVehs.length > 0) {
      setSelectedVehicle(newVehs[0]);
    } else {
      setSelectedVehicle(null);
    }
  };

  const handleSave = async () => {
    if (!selectedCustomer) {
      toast.error("Please select a customer.");
      return;
    }

    const validLines = lines.filter((l) => l.ProductId);
    if (validLines.length === 0) {
      toast.error("Add at least one product line.");
      return;
    }

    const payload = {
      customer_id: selectedCustomer.id,
      vehicle_id: selectedVehicle ? selectedVehicle.id : null,
      mileage: mileage ? Number(mileage) : null,
      notes,
      items: validLines.map((l) => {
        const catalogProduct = partsMap[l.ProductId];
        return {
          product_id: catalogProduct ? catalogProduct.productId : null,
          quantity: l.quantity,
          unit_price: l.unitPrice,
          needs_ordering: l.needsOrdering,
          tax_at_sale: l.taxCode === 'VAT' ? 'VAT' : 'NON_VAT',
        };
      }),
    };

    try {
      setIsSaving(true);
      if (mode === "edit" && id) {
        await api.put(`/sales-orders/${id}`, payload);
        toast.success("Sales Order updated successfully!");
        navigate(`/webapp/sales/sales-orders/${id}`);
      } else {
        await api.post("/sales-orders", payload);
        toast.success("Sales Order created successfully!");
        navigate("/webapp/sales/sales-orders");
      }
    } catch (err: any) {
      console.error("Failed to save Sales Order", err);
      toast.error(err.response?.data?.message || "Failed to save Sales Order");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Loading form details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full pl-4 pr-3 pb-4 flex flex-col gap-4 overflow-y-auto">
      <DataToolbar
        variant="detail"
        actions={
          <div className="flex items-center gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                mode === "edit" && id
                  ? navigate(`/webapp/sales/sales-orders/${id}`)
                  : navigate("/webapp/sales/sales-orders")
              }
              disabled={isSaving}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div className="ml-auto">
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Save Sales Order
              </Button>
            </div>
          </div>
        }
      />

      <div className="space-y-6">
        {/* TOP ROW: CUSTOMER AND VEHICLE DETAILS SIDE-BY-SIDE */}
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
                        customers.find((c) => c.id === val) || null;
                      setSelectedCustomer(customer);
                      if (customer) {
                        const related = vehicles.filter(
                          (v) => String(v.customerId) === String(customer.id),
                        );
                        if (related.length === 1) {
                          setSelectedVehicle(related[0]);
                          setMileage(
                            related[0]?.mileage != null
                              ? String(related[0].mileage)
                              : "",
                          );
                        } else {
                          setSelectedVehicle(null);
                          setMileage("");
                        }
                      } else {
                        setSelectedVehicle(null);
                        setMileage("");
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
                  <Label className="text-muted-foreground font-normal text-xs">
                    Address
                  </Label>
                  <Input value={selectedCustomer?.address || ""} readOnly />
                </div>
                <div className="grid sm:grid-cols-2 gap-y-2 gap-x-4">
                  <div>
                    <Label className="text-muted-foreground font-normal text-xs">
                      Email Address
                    </Label>
                    <Input value={selectedCustomer?.email || ""} readOnly />
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
                    <Input value={selectedCustomer?.landline || ""} readOnly />
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
                      <Input
                        value=""
                        placeholder="Select customer first"
                        disabled
                      />
                    ) : (
                      <Combobox
                        value={selectedVehicle?.id || ""}
                        onChange={(val) => {
                          const vehicle =
                            customerVehicles.find((v) => v.id === val) || null;
                          setSelectedVehicle(vehicle);
                          setMileage(
                            vehicle?.mileage != null
                              ? String(vehicle.mileage)
                              : "",
                          );
                        }}
                        items={[
                          { label: "No Vehicle (Optional)", value: "" },
                          ...customerVehicles.map((v) => ({
                            label: `${v.year || ""} ${v.make || ""} ${v.model || ""} (${v.plateNo})`,
                            value: v.id,
                          })),
                        ]}
                        placeholder="Select vehicle"
                      />
                    )}
                  </div>
                  <div>
                    <Label className="text-muted-foreground font-normal text-xs">
                      Variant
                    </Label>
                    <Input value={selectedVehicle?.variant || ""} readOnly />
                  </div>
                  <div>
                    <Label className="text-muted-foreground font-normal text-xs">
                      Color
                    </Label>
                    <Input value={selectedVehicle?.color || ""} readOnly />
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground font-normal text-xs">
                    Plate No.
                  </Label>
                  <Input value={selectedVehicle?.plateNo || ""} readOnly />
                </div>
                <div>
                  <Label className="text-muted-foreground font-normal text-xs">
                    Engine No.
                  </Label>
                  <Input value={selectedVehicle?.engineNo || ""} readOnly />
                </div>
                <div>
                  <Label className="text-muted-foreground font-normal text-xs">
                    Chassis No. (VIN)
                  </Label>
                  <Input value={selectedVehicle?.vin || ""} readOnly />
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
                    Mileage
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={mileage}
                    onChange={(e) => {
                      const v = e.target.value;
                      setMileage(
                        v === "" ? "" : String(Math.max(0, Number(v))),
                      );
                    }}
                    disabled={!selectedVehicle}
                    placeholder={
                      selectedVehicle ? "Optional" : "Select vehicle first"
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* BOTTOM ROW: PARTS CATALOG TABLE & SUMMARY */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* PARTS TABLE (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-6">
            {/* PARTS TABLE */}
            <div className="rounded-lg border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Box className="size-5 text-blue-600" />
                  <h2 className="text-sm font-semibold text-foreground">
                    Parts Catalog
                  </h2>
                </div>
                <Button
                  size="sm"
                  onClick={addPartLine}
                  className="h-7 gap-1 text-xs"
                >
                  <Plus className="h-3 w-3" /> Add Part
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[420px] overflow-y-auto">
                  <Table className="[&_tr]:hover:!bg-transparent">
                    <TableHeader className="sticky top-0 z-10 bg-background">
                      <TableRow className="bg-muted/50 text-center">
                        <TableHead className="text-xs text-center w-[24%]">
                          Item Name
                        </TableHead>
                        <TableHead className="text-xs text-center w-[10%]">
                          Part Number
                        </TableHead>
                        <TableHead className="text-xs text-center w-[8%]">
                          Tax Code
                        </TableHead>
                        <TableHead className="text-xs text-center w-[11%]">
                          Stock Status
                        </TableHead>
                        <TableHead className="text-xs w-[12%] text-center">
                          Unit Price
                        </TableHead>
                        <TableHead className="text-xs w-[7%] text-center">
                          Quantity
                        </TableHead>
                        <TableHead className="text-xs w-[10%] text-center">
                          Amount
                        </TableHead>
                        <TableHead className="text-xs text-center w-[10%]">
                          Needs Order
                        </TableHead>
                        <TableHead className="text-xs w-[4%]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lines.filter(l => !l.isSpol).length > 0 ? (
                        lines.filter(l => !l.isSpol).map((l) => {
                          const product = partsMap[l.ProductId];
                          const stockStatus = getStockStatus(product);

                          return (
                            <TableRow key={l.id} className="hover:bg-transparent">
                              <TableCell>
                                <Combobox
                                  value={l.ProductId}
                                  onChange={(val) =>
                                    updateLine(l.id, "ProductId", val)
                                  }
                                  items={partsCatalog.filter(p => !p.categoryIsSpol).map((p) => ({
                                    label: p.manufacturer
                                      ? `${p.manufacturer} ${p.name} - Part No: ${p.partNumber || p.sku || "—"}`
                                      : `${p.name} - Part No: ${p.partNumber || p.sku || "—"}`,
                                    value: p.id,
                                    description: `${peso(p.price)}${p.quantityOnHand != null ? ` · Stock: ${p.quantityOnHand}` : ""}`,
                                  }))}
                                  placeholder="Select part"
                                />
                              </TableCell>
                              <TableCell className="text-center font-mono font-medium text-xs text-muted-foreground">
                                {product?.partNumber || product?.sku || "—"}
                              </TableCell>
                              <TableCell className="text-center">
                                {l.taxCode ? (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${l.taxCode === 'VAT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                                    {l.taxCode}
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {stockStatus ? (
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${stockStatus.bg} ${stockStatus.color}`}
                                  >
                                    {stockStatus.label}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground text-xs">
                                    —
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-center font-semibold">
                                {peso(product?.price || 0)}
                              </TableCell>
                              <TableCell className="text-center">
                                <Input
                                  type="number"
                                  value={
                                    l.quantity === 0 ? "" : String(l.quantity)
                                  }
                                  onChange={(e) =>
                                    updateLine(
                                      l.id,
                                      "quantity",
                                      Number(e.target.value),
                                    )
                                  }
                                  min={1}
                                  className="text-center"
                                  placeholder="0"
                                />
                              </TableCell>
                              <TableCell className="text-center font-bold">
                                {peso(l.amount)}
                              </TableCell>
                              <TableCell className="text-center">
                                <input
                                  type="checkbox"
                                  checked={l.needsOrdering}
                                  onChange={(e) =>
                                    updateLine(
                                      l.id,
                                      "needsOrdering",
                                      e.target.checked,
                                    )
                                  }
                                  className="rounded border-input text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeLine(l.id, false)}
                                  className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">
                            No parts added.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* SPOL TABLE */}
            <div className="rounded-lg border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fuel className="size-5 text-green-600" />
                  <h2 className="text-sm font-semibold text-foreground">
                    Supplies, Petrol, Oils, and Lubricants
                  </h2>
                </div>
                <Button
                  size="sm"
                  onClick={addSpolLine}
                  className="h-7 gap-1 text-xs"
                >
                  <Plus className="h-3 w-3" /> Add Supply
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[420px] overflow-y-auto">
                  <Table className="[&_tr]:hover:!bg-transparent">
                    <TableHeader className="sticky top-0 z-10 bg-background">
                      <TableRow className="bg-muted/50 text-center">
                        <TableHead className="text-xs text-center w-[24%]">
                          Item Name
                        </TableHead>
                        <TableHead className="text-xs text-center w-[10%]">
                          Part Number
                        </TableHead>
                        <TableHead className="text-xs text-center w-[8%]">
                          Tax Code
                        </TableHead>
                        <TableHead className="text-xs text-center w-[11%]">
                          Stock Status
                        </TableHead>
                        <TableHead className="text-xs w-[12%] text-center">
                          Unit Price
                        </TableHead>
                        <TableHead className="text-xs w-[7%] text-center">
                          Quantity
                        </TableHead>
                        <TableHead className="text-xs w-[10%] text-center">
                          Amount
                        </TableHead>
                        <TableHead className="text-xs text-center w-[10%]">
                          Needs Order
                        </TableHead>
                        <TableHead className="text-xs w-[4%]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lines.filter(l => l.isSpol).length > 0 ? (
                        lines.filter(l => l.isSpol).map((l) => {
                          const product = partsMap[l.ProductId];
                          const stockStatus = getStockStatus(product);
                          const isSundries = l.categoryName === SUNDRIES_CATEGORY_NAME;

                          return (
                            <TableRow key={l.id} className="hover:bg-transparent">
                              <TableCell>
                                <Combobox
                                  value={l.ProductId}
                                  onChange={(val) =>
                                    updateLine(l.id, "ProductId", val)
                                  }
                                  items={partsCatalog.filter(p => p.categoryIsSpol).map((p) => ({
                                    label: p.manufacturer
                                      ? `${p.manufacturer} ${p.name} - Part No: ${p.partNumber || p.sku || "—"}`
                                      : `${p.name} - Part No: ${p.partNumber || p.sku || "—"}`,
                                    value: p.id,
                                    description: `${peso(p.price)}${p.quantityOnHand != null ? ` · Stock: ${p.quantityOnHand}` : ""}`,
                                  }))}
                                  placeholder="Select supply/lubricant"
                                />
                              </TableCell>
                              <TableCell className="text-center font-mono font-medium text-xs text-muted-foreground">
                                {product?.partNumber || product?.sku || "—"}
                              </TableCell>
                              <TableCell className="text-center">
                                {isSundries ? (
                                  <select
                                    value={l.taxCode === 'Non-VAT' ? 'NON_VAT' : 'VAT'}
                                    onChange={(e) =>
                                      updateLine(l.id, "taxCode", e.target.value === 'NON_VAT' ? 'Non-VAT' : 'VAT')
                                    }
                                    className="text-[11px] border border-border rounded px-1.5 py-0.5 bg-background text-foreground cursor-pointer"
                                  >
                                    <option value="VAT">VAT</option>
                                    <option value="NON_VAT">Non-VAT</option>
                                  </select>
                                ) : l.taxCode ? (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${l.taxCode === 'VAT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                                    {l.taxCode}
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {isSundries ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                                    Sundries
                                  </span>
                                ) : stockStatus ? (
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${stockStatus.bg} ${stockStatus.color}`}
                                  >
                                    {stockStatus.label}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground text-xs">
                                    —
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {isSundries ? (
                                  <Input
                                    type="number"
                                    value={l.unitPrice === 0 ? "" : String(l.unitPrice)}
                                    onChange={(e) =>
                                      updateLine(l.id, "unitPrice", Number(e.target.value))
                                    }
                                    min={0}
                                    className="text-center font-semibold"
                                    placeholder="0"
                                  />
                                ) : (
                                  <span className="font-semibold">{peso(product?.price || 0)}</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {isSundries ? (
                                  <span className="text-sm text-muted-foreground font-medium px-2">—</span>
                                ) : (
                                  <Input
                                    type="number"
                                    value={
                                      l.quantity === 0 ? "" : String(l.quantity)
                                    }
                                    onChange={(e) =>
                                      updateLine(
                                        l.id,
                                        "quantity",
                                        Number(e.target.value),
                                      )
                                    }
                                    min={1}
                                    className="text-center"
                                    placeholder="0"
                                  />
                                )}
                              </TableCell>
                              <TableCell className="text-center font-bold">
                                {peso(l.amount)}
                              </TableCell>
                              <TableCell className="text-center">
                                {isSundries ? (
                                  <span className="text-xs text-muted-foreground">—</span>
                                ) : (
                                  <input
                                    type="checkbox"
                                    checked={l.needsOrdering}
                                    onChange={(e) =>
                                      updateLine(
                                        l.id,
                                        "needsOrdering",
                                        e.target.checked,
                                      )
                                    }
                                    className="rounded border-input text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                                  />
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeLine(l.id, true)}
                                  className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">
                            No supplies added.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>

          {/* ORDER SUMMARY (lg:col-span-1) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <Card className="shadow-lg border-primary/20">
                <CardHeader className="bg-primary/5 py-4 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="size-5 text-blue-900" />
                    <h2 className="font-semibold text-foreground">
                      Order Summary
                    </h2>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="bg-primary/10 p-3 rounded-lg border border-primary/20 space-y-2">
                    <div className="flex justify-between items-end text-primary">
                      <span className="text-xs font-bold uppercase">
                        Total Parts Cost
                      </span>
                      <span className="text-2xl font-bold tracking-wide">
                        {peso(total)}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div>
                      <Label>Notes & Remarks</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Enter terms, payment details, or client reminders"
                        rows={4}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
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

export default SalesOrderForm;
