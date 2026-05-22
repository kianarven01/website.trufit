import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DataToolbar from "@/components/DataToolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Combobox from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import { Checkbox } from "@/components/ui/checkbox";
import { Box, Calculator, Car, Plus, AlertTriangle, Trash2, User } from "lucide-react";

/* ================= STORAGE ================= */

const STORAGE_KEY = "customers";
const VEHICLE_STORAGE_KEY = "vehicles";
const VEHICLE_MODEL_STORAGE_KEY = "vehicleModels";

const PRODUCT_KEY = "products";
const INVENTORY_KEY = "inventory";

const SALES_ORDER_KEY = "salesOrders";

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

export interface SalesOrder {
  id: string;
  salesOrderNo: string;
  customer: Customer;
  vehicle?: Vehicle | null;
  mileage?: number;
  parts: SalesOrderPartLine[];
  subtotalParts: number;
  total: number;
  notes?: string;
  status: "issued" | "completed";
  createdAt: string;
  updatedAt: string;
}

/* ================= HELPERS ================= */

const genLineId = () => crypto.randomUUID();

const emptySOLine = (): SOPartLine => ({
  id: genLineId(),
  ProductId: "",
  quantity: 0,
  amount: 0,
});

const genSalesOrderNo = () =>
  `SO-${crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()}`;

interface SalesOrderProps {
  mode?: "create" | "edit";
}

const SalesOrderForm: React.FC<SalesOrderProps> = ({
  mode = "create",
}) => {
  const navigate = useNavigate();

  const { id: salesOrderId } = useParams<{ id: string }>();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  const [partsCatalog, setPartsCatalog] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [includeVehicle, setIncludeVehicle] = useState(false);

  const [mileage, setMileage] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [soLines, setSoLines] = useState<SOPartLine[]>([
    emptySOLine(),
  ]);



  const partsMap = useMemo<Record<string, Product>>(() => {
    return Object.fromEntries(
      partsCatalog.map((p) => [p.id, p])
    );
  }, [partsCatalog]);

  const customerVehicles = vehicles.filter( (v) => v.customerId === selectedCustomer?.id );

  const getVehicleModel = (vehicle?: Vehicle | null) =>
    vehicleModels.find(
      (vm) => vm.id === vehicle?.vehicleModelId
    );

  const vm = useMemo(
    () => getVehicleModel(selectedVehicle),
    [selectedVehicle, vehicleModels]
  );

  const peso = (n: number) =>
    `₱${n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  /* ================= LOAD ================= */

  useEffect(() => {
    try {
      const storedCustomers = JSON.parse( localStorage.getItem(STORAGE_KEY) || "[]" );
      const storedVehicles = JSON.parse( localStorage.getItem(VEHICLE_STORAGE_KEY) || "[]" );
      const storedModels = JSON.parse( localStorage.getItem(VEHICLE_MODEL_STORAGE_KEY) || "[]" );
      const storedProducts = JSON.parse( localStorage.getItem(PRODUCT_KEY) || "[]" );
      const storedInventory = JSON.parse( localStorage.getItem(INVENTORY_KEY) || "[]" );

      setCustomers( Array.isArray(storedCustomers) ? storedCustomers : [] );
      setVehicles( Array.isArray(storedVehicles) ? storedVehicles : [] );
      setVehicleModels( Array.isArray(storedModels) ? storedModels : [] );
      setPartsCatalog( Array.isArray(storedProducts) ? storedProducts : [] );
      setInventory( Array.isArray(storedInventory) ? storedInventory : [] );
    } catch (err) {
      console.error("Failed to load localStorage", err);
    }
  }, []);

  /* ================= EDIT MODE ================= */

  useEffect(() => {
    if (mode !== "edit" || !salesOrderId) return;

    try {
      const stored: SalesOrder[] = JSON.parse(
        localStorage.getItem(SALES_ORDER_KEY) || "[]"
      );

      const found = stored.find(
        (s) => s.id === salesOrderId
      );

      if (!found) {
        toast.error("Sales order not found.");
        navigate("/webapp/sales/sales-orders");
        return;
      }

      setSelectedCustomer(found.customer);
      if (found.vehicle) {
        setSelectedVehicle(found.vehicle);
        setIncludeVehicle(true);
      } else {
        setSelectedVehicle(null);
        setIncludeVehicle(false);
      }

      setMileage(found.mileage ?? 0);

      setNotes(found.notes ?? "");

      if (found.parts.length > 0) {
        setSoLines(
          found.parts.map((p) => ({
            id: p.id,
            ProductId: p.ProductId,
            quantity: p.quantity,
            amount: p.amount,
          }))
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load sales order.");
    }
  }, [mode, salesOrderId, navigate]);


  /* ================= PARTS ================= */

  const addSOLine = () =>
    setSoLines((prev) => [...prev, emptySOLine()]);

  const removeSOLine = (idx: number) =>
    setSoLines((prev) =>
      prev.filter((_, i) => i !== idx)
    );

  const updateSO = (
    idx: number,
    field: keyof SOPartLine,
    value: any
  ) => {
    // Duplicate guard
    if (field === "ProductId" && value) {
      const existingIdx = soLines.findIndex(
        (l, i) =>
          i !== idx && l.ProductId === value
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
            )
              return l;

            const qty =
              (Number(l.quantity) || 0) + 1;

            return {
              ...l,
              quantity: qty,
              amount:
                qty * (product?.price || 0),
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

        if (field === "ProductId") {
          const found = partsMap[value];

          const stockEntry = inventory.find(
            (inv) => inv.productId === value
          );

          const availableStock =
            stockEntry?.quantity_on_hand || 0;

          // auto-set qty to 1 when selecting a product
          // but only if stock exists
          const initialQty =
            availableStock > 0 ? 1 : 0;

          updated.quantity = initialQty;

          updated.amount =
            initialQty * (found?.price || 0);
        }

        if (field === "quantity") {
          const qty =
            value === ""
              ? 0
              : Math.max(0, Number(value));

          const found =
            partsMap[updated.ProductId];

          updated.quantity = qty;

          updated.amount =
            qty * (found?.price || 0);
        }

        return updated;
      })
    );
  };

  /* ================= TOTALS ================= */

  const totals = useMemo(() => {
    const validSO = soLines.filter(
      (l) => l.ProductId
    );

    const totalParts = validSO.reduce(
      (sum, l) => sum + l.amount,
      0
    );

    return {
      validSO,
      totalParts,
      total: totalParts,
    };
  }, [soLines]);

  /* ================= SAVE ================= */

  const saveSalesOrder = () => {
    if (!selectedCustomer) {
      toast.error("Please select a customer.");
      return;
    }

    if (includeVehicle && !selectedVehicle) {
      toast.error(
        "Please select a vehicle or uncheck 'Include Vehicle Information'."
      );
      return;
    }

    if (totals.validSO.length === 0) {
      toast.error("Add at least one part.");
      return;
    }

    const now = new Date().toISOString();

    let salesOrders: SalesOrder[] = [];

    try {
      const existing = JSON.parse(localStorage.getItem(SALES_ORDER_KEY) || "[]");

      salesOrders = Array.isArray(existing)
        ? existing
        : [];
    } catch {
      salesOrders = [];
    }

    const builtParts: SalesOrderPartLine[] =
      soLines
        .filter((l) => l.ProductId)
        .map((l) => {
          const found =
            partsMap[l.ProductId];

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

    if (mode === "edit" && salesOrderId) {
      const idx = salesOrders.findIndex((s) => s.id === salesOrderId);

      if (idx === -1) {
        toast.error("Sales order not found.");

        return;
      }

      salesOrders[idx] = {
        ...salesOrders[idx],
        customer: selectedCustomer,
        vehicle: includeVehicle ? selectedVehicle : null,
        mileage: includeVehicle ? mileage : undefined,
        parts: builtParts,
        subtotalParts:
          totals.totalParts,
        total: totals.total,
        notes: notes || undefined,
        updatedAt: now,
      };

      localStorage.setItem(SALES_ORDER_KEY, JSON.stringify(salesOrders));
      toast.success("Sales order updated successfully!");
      navigate( `/webapp/sales/sales-orders/${salesOrderId}`);

    } else {
      const newSalesOrder: SalesOrder = {
        id: crypto.randomUUID(),
        salesOrderNo:
          genSalesOrderNo(),
        customer: selectedCustomer,
        vehicle: includeVehicle ? selectedVehicle : null,
        mileage: includeVehicle ? mileage : undefined,
        parts: builtParts,
        subtotalParts:
          totals.totalParts,
        total: totals.total,
        notes: notes || undefined,
        status: "issued",
        createdAt: now,
        updatedAt: now,
      };

      salesOrders.push(newSalesOrder);

      localStorage.setItem(SALES_ORDER_KEY, JSON.stringify(salesOrders));
      toast.success("Sales order created successfully!");
      navigate("/webapp/sales/sales-orders");
    }
  };

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

  return (
    <div className="w-full h-full pl-4 pr-3 pb-4 flex flex-col gap-4 overflow-y-auto">

      {/* HEADER */}
      <DataToolbar
        variant="detail"
        title={ mode === "edit"
            ? "Edit Sales Order"
            : "Create New Sales Order"
        }
      />

      <div className="space-y-6">
        <div className= "grid lg:grid-cols-2 gap-4">
          {/* CUSTOMER DETAILS */}
          <Card>
            <CardHeader className="pb-3">
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
                  <Label className="text-muted-foreground font-normal text-xs">Full Name</Label>
                  <Combobox
                    value={selectedCustomer?.id || ""}
                    onChange={(val) => {
                      const customer =
                        customers.find((c) => c.id === val) || null;

                      setSelectedCustomer(customer);

                      if (!customer) {
                        setSelectedVehicle(null);
                        return;
                      }

                      const customerVehicles = vehicles.filter(
                        (v) => v.customerId === customer.id
                      );

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
                    <Label className="text-muted-foreground font-normal text-xs"> Business Number</Label>
                    <Input
                      value={selectedCustomer?.businessPhone || ""}
                      readOnly
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="include-vehicle"
                    checked={includeVehicle}
                    onCheckedChange={(c) => setIncludeVehicle(!!c)}
                  />
                  <Label htmlFor="include-vehicle" className="text-sm cursor-pointer font-medium text-blue-500">
                    Include Vehicle Information
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* VEHICLE */}
          <Card
            className={`
              relative overflow-hidden transition-all duration-200
              ${!includeVehicle 
                ? "opacity-50 grayscale-[0.2] pointer-events-none select-none" 
                : ""
              }
            `}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-500">
                  <Car className="size-5" />
                  <p className="font-semibold text-foreground">
                    Vehicle Details
                  </p>
                </div>
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
                    ) : customerVehicles.length === 1 ? (
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
                        items={customerVehicles.map((v) => {
                          const vm = vehicleModels.find(
                            (m) =>
                              m.id === v.vehicleModelId
                          );

                          return {
                            label: vm
                              ? `${vm.year} ${vm.make} ${vm.model}`
                              : "",
                            value: v.id,
                          };
                        })}
                        placeholder="Select vehicle"
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
                    min={0}
                    value={mileage === 0 ? "" : mileage}
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
                      if (e.target.value === "") {
                        setMileage(0);
                      }
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PARTS + SUMMARY */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* PARTS */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
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
                  <Plus className="h-3 w-3" />
                  Add Part
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
                        is out of stock. A purchase request will be created automatically upon sales order issuance.
                      </>
                    ) : (
                      <>
                        Some items are out of stock. A purchase request will be created automatically upon sales order issuance.
                      </>
                    )}
                  </p>
                </div>
              )}
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[450px] overflow-y-auto">
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


                            {/* UNIT PRICE */}
                            <TableCell>
                              {peso(product?.price || 0)}
                            </TableCell>

                            {/* QUANTITY */}
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

                            {/* AMOUNT */}
                            <TableCell>
                              {peso(l.amount)}
                            </TableCell>

                            {/* REMOVE */}
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
          <div>
            <div className="sticky top-6">
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
                      <span>Subtotal</span>
                      <span>{peso(totals.totalParts)}</span>
                    </div>
                  </div>

                  <Separator />

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
                      onChange={(e) =>
                        setNotes(
                          e.target.value
                        )
                      }
                      placeholder="Terms, warranty info, etc..."
                      rows={4}
                      className="resize-none text-xs bg-background"
                    />
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      className="w-full shadow-md"
                      size="lg"
                      onClick={saveSalesOrder}
                      disabled={
                        !selectedCustomer ||
                        totals.validSO
                          .length === 0
                      }
                    >
                      {mode === "edit"
                        ? "Save Changes"
                        : "Issue Sales Order"}
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

              <p className="text-xs text-center text-muted-foreground px-4 mt-3">
                Issuing a sales order will reserve the selected inventory items.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SalesOrderForm;