import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import DataToolbar from "@/components/DataToolbar";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ArrowLeft, Plus, Trash2, Import } from "lucide-react";
import { toast } from "sonner";
import { BillingStatement, BillingItem } from "./BillingList";
import api from "@/api/axios";
import Combobox from "@/components/ui/combobox";

interface ImportedSalesOrder {
  id: string;
  status: string;
  customer: {
    name: string;
    email: string;
    mobile: string;
    address: string;
  };
  vehicle: {
    year: string;
    make: string;
    model: string;
    variant: string;
    plateNo: string;
    mileage: number;
  };
  products: {
    id: string;
    name: string;
    qty: number;
    price: number;
    amount: number;
  }[];
  tax: number;
  payments: any[];
  createdAt: string;
}

const BillingForm: React.FC = () => {
  const navigate = useNavigate();
  const importedSOIdRef = useRef<string>("");
  const isImportingRef = useRef<boolean>(false);
  const [salesOrders, setSalesOrders] = useState<ImportedSalesOrder[]>([]);
  const [selectedSOId, setSelectedSOId] = useState<string>("");
  const [customerId, setCustomerId] = useState<string>("");
  const [vehicleId, setVehicleId] = useState<string>("");
  const [dbCustomers, setDbCustomers] = useState<any[]>([]);
  const [dbVehicles, setDbVehicles] = useState<any[]>([]);

  // Customer Fields
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerLandline, setCustomerLandline] = useState("");
  const [customerBusiness, setCustomerBusiness] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  // Vehicle Fields
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleVariant, setVehicleVariant] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehicleEngine, setVehicleEngine] = useState("");
  const [vehicleVIN, setVehicleVIN] = useState("");
  const [vehicleRegistration, setVehicleRegistration] = useState("");
  const [vehicleDealer, setVehicleDealer] = useState("");
  const [vehicleMileage, setVehicleMileage] = useState<number>(0);

  // Document References / Placeholders
  const [estimateNo, setEstimateNo] = useState("");
  const [soid, setSoid] = useState("");
  const [joid, setJoid] = useState("");
  const [poid, setPoid] = useState("");

  // Form Utilities
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<BillingStatement["status"]>("Unpaid");
  const [items, setItems] = useState<BillingItem[]>([]);
  const [taxRate, setTaxRate] = useState(12);

  // Add Item States
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(0);
  const [newItemType, setNewItemType] = useState<BillingItem["type"]>("part");

  // Handle importing a Sales Order
  const handleImportSalesOrder = async (soId: string) => {
    if (!soId) return;
    if (importedSOIdRef.current === soId || isImportingRef.current) return;
    try {
      isImportingRef.current = true;
      importedSOIdRef.current = soId;
      toast.info("Loading Sales Order items...");
      const res = await api.get(`/sales-orders/${soId}`);
      const so = res.data.data;
      if (!so) return;

      setSelectedSOId(soId);
      setSoid(so.so_number || so.id.substring(0, 8).toUpperCase());
      setJoid("—");
      setEstimateNo(so.estimate_id ? "EST-REF" : "—");
      setPoid("—");

      const customerName = so.customer ? `${so.customer.first_name || ""} ${so.customer.last_name || ""}`.trim() : "—";
      setCustomerName(customerName);
      setCustomerEmail(so.customer?.email || "—");
      setCustomerMobile(so.customer?.mobile_number || "—");
      setCustomerLandline("—");
      setCustomerBusiness("—");
      setCustomerAddress(so.customer?.address || "—");

      setVehiclePlate(so.vehicle?.plate_number || "—");
      setVehicleYear(so.vehicle?.year_model || "—");
      setVehicleMake(so.vehicle?.make || "—");
      setVehicleModel(so.vehicle?.model || "—");
      setVehicleVariant(so.vehicle?.variant || "—");
      setVehicleColor(so.vehicle?.color || "—");
      setVehicleEngine("—");
      setVehicleVIN("—");
      setVehicleRegistration("—");
      setVehicleDealer("—");
      setVehicleMileage(Number(so.vehicle?.mileage) || 0);

      setCustomerId(so.customer ? String(so.customer.customer_id) : "");
      setVehicleId(so.vehicle ? String(so.vehicle.id) : "");

      const itemsList = Array.isArray(so.items) ? so.items : [];
      const billingItems: BillingItem[] = itemsList.map((p: any, idx: number) => ({
        id: p.id || `so-item-${idx}`,
        name: p.product?.name || "Unknown Product",
        qty: Number(p.quantity) || 1,
        price: Number(p.UnitPrice) || 0,
        amount: Number(p.SubTotal) || 0,
        type: "part"
      }));
      setItems(billingItems);
      toast.success(`Successfully imported items from Sales Order ${so.so_number || soId}`);
    } catch (err) {
      console.error("Failed to import Sales Order details", err);
      toast.error("Failed to import Sales Order details");
    } finally {
      isImportingRef.current = false;
    }
  };

  // Load Sales Orders for Import & Set dynamic breadcrumb
  useEffect(() => {
    const fetchSOList = async () => {
      try {
        const res = await api.get("/sales-orders");
        const data = res.data.data;
        if (Array.isArray(data)) {
          const normalized = data.map((o: any) => {
            const customerName = o.customer ? `${o.customer.first_name || ""} ${o.customer.last_name || ""}`.trim() : "—";
            const plateNo = o.vehicle ? o.vehicle.plate_number : "—";
            return {
              id: o.id,
              so_number: o.so_number || o.id.substring(0, 8).toUpperCase(),
              customerName,
              plateNo,
            };
          });
          setSalesOrders(normalized as any);

          // Auto-import if query parameter 'import_so' is present
          const params = new URLSearchParams(window.location.search);
          const importSoId = params.get("import_so");
          if (importSoId) {
            // Find if the SO ID exists in the fetched list to verify validity
            const exists = normalized.some((so) => so.id === importSoId);
            if (exists) {
              // Remove query parameter from URL immediately to prevent duplicate triggers
              const url = new URL(window.location.href);
              url.searchParams.delete("import_so");
              window.history.replaceState({}, document.title, url.pathname + url.search);

              handleImportSalesOrder(importSoId);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load Sales Orders for Billing", err);
      }
    };
    const fetchCustomers = async () => {
      try {
        const res = await api.get("/customers");
        const dbCusts = res.data.data || [];
        setDbCustomers(dbCusts);

        const allVehs: any[] = [];
        dbCusts.forEach((c: any) => {
          if (Array.isArray(c.vehicles)) {
            c.vehicles.forEach((v: any) => {
              allVehs.push({
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
                mileage: v.mileage ?? 0,
              });
            });
          }
        });
        setDbVehicles(allVehs);
      } catch (err) {
        console.error("Failed to load customers for Billing", err);
      }
    };

    fetchSOList();
    fetchCustomers();

    sessionStorage.setItem("breadcrumb-/webapp/sales/billing/create", "Create Billing Statement");
    window.dispatchEvent(new Event("breadcrumb-update"));

    return () => {
      sessionStorage.removeItem("breadcrumb-/webapp/sales/billing/create");
      window.dispatchEvent(new Event("breadcrumb-update"));
    };
  }, []);

  // Add manual item
  const handleAddItem = () => {
    if (!newItemName.trim()) {
      toast.error("Item name cannot be empty");
      return;
    }
    if (newItemQty <= 0) {
      toast.error("Quantity must be greater than zero");
      return;
    }
    if (newItemPrice < 0) {
      toast.error("Price cannot be negative");
      return;
    }

    const newItem: BillingItem = {
      id: `custom-item-${Date.now()}`,
      name: newItemName,
      qty: newItemQty,
      price: newItemPrice,
      amount: newItemQty * newItemPrice,
      type: newItemType
    };

    setItems([...items, newItem]);
    setNewItemName("");
    setNewItemQty(1);
    setNewItemPrice(0);
    toast.success("Item added");
  };

  // Remove manual item
  const handleRemoveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const tax = Math.round(subtotal * (taxRate / 100));
  const total = subtotal + tax;

  const [isSaving, setIsSaving] = useState(false);

  // Handle Save
  const handleSave = async () => {
    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one item to the billing statement");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        customer_id: customerId,
        vehicle_id: vehicleId || null,
        so_id: selectedSOId || null,
        date: new Date().toISOString(),
        total: total,
        tax: tax,
        notes: notes,
        items: items.map((item) => ({
          name: item.name,
          qty: item.qty,
          price: item.price,
          amount: item.amount,
          type: item.type,
        })),
      };

      const res = await api.post("/billing-statements", payload);
      const bill = res.data.data;
      toast.success(`Billing Statement ${bill.bill_number} created successfully`);
      navigate("/webapp/sales/billing");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create billing statement");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-y-auto">
      <DataToolbar
        variant="detail"
        title=""
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/webapp/sales/billing")}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Billing Statement"}
            </Button>
          </div>
        }
      />

      {/* IMPORT SALES ORDER BLOCK */}
      {salesOrders.length > 0 && (
        <Card className="border border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Import className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold text-sm">Import from Sales Order</p>
                <p className="text-xs text-muted-foreground">Select an existing sales order to automatically load details</p>
              </div>
            </div>
            <div className="w-full sm:w-64">
              <Select value={selectedSOId} onValueChange={handleImportSalesOrder}>
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="Select Sales Order..." />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  {salesOrders.map((so: any) => (
                    <SelectItem key={so.id} value={so.id}>
                      {so.so_number} — {so.customerName} ({so.plateNo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* FORM LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* CUSTOMER DETAILS */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold">Customer Details</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cust-name">Full Name *</Label>
                  <Combobox
                    value={customerId}
                    onChange={(val) => {
                      setCustomerId(val);
                      const customer = dbCustomers.find((c) => String(c.customer_id) === val);
                      if (customer) {
                        const name = `${customer.first_name || ""} ${customer.last_name || ""}`.trim();
                        setCustomerName(name);
                        setCustomerEmail(customer.email || "");
                        setCustomerMobile(customer.mobile_number || "");
                        setCustomerAddress(customer.address || "");
                        setCustomerLandline(customer.landline || "");
                        setCustomerBusiness(customer.business || "");

                        // Auto select vehicle if customer has exactly 1 vehicle
                        const relatedVehs = dbVehicles.filter((v) => v.customerId === val);
                        if (relatedVehs.length === 1) {
                          const v = relatedVehs[0];
                          setVehicleId(v.id);
                          setVehiclePlate(v.plateNo);
                          setVehicleYear(v.year);
                          setVehicleMake(v.make);
                          setVehicleModel(v.model);
                          setVehicleVariant(v.variant);
                          setVehicleColor(v.color);
                          setVehicleEngine(v.engineNo);
                          setVehicleVIN(v.vin);
                          setVehicleRegistration(v.registrationNo);
                          setVehicleMileage(v.mileage);
                        } else {
                          setVehicleId("");
                          setVehiclePlate("");
                          setVehicleYear("");
                          setVehicleMake("");
                          setVehicleModel("");
                          setVehicleVariant("");
                          setVehicleColor("");
                          setVehicleEngine("");
                          setVehicleVIN("");
                          setVehicleRegistration("");
                          setVehicleMileage(0);
                        }
                      } else {
                        setCustomerId("");
                        setCustomerName("");
                        setCustomerEmail("");
                        setCustomerMobile("");
                        setCustomerAddress("");
                        setCustomerLandline("");
                        setCustomerBusiness("");

                        setVehicleId("");
                        setVehiclePlate("");
                        setVehicleYear("");
                        setVehicleMake("");
                        setVehicleModel("");
                        setVehicleVariant("");
                        setVehicleColor("");
                        setVehicleEngine("");
                        setVehicleVIN("");
                        setVehicleRegistration("");
                        setVehicleMileage(0);
                      }
                    }}
                    items={dbCustomers.map((c) => ({
                      label: `${c.first_name || ""} ${c.last_name || ""}`.trim(),
                      value: String(c.customer_id),
                    }))}
                    placeholder="Select customer"
                  />
                </div>
                <div>
                  <Label htmlFor="cust-address">Address</Label>
                  <Input
                    id="cust-address"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Street, City, Province"
                  />
                </div>
                <div>
                  <Label htmlFor="cust-email">Email Address</Label>
                  <Input
                    id="cust-email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="cust-mobile">Phone / Mobile Number</Label>
                  <Input
                    id="cust-mobile"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    placeholder="09XXXXXXXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="cust-landline">Landline</Label>
                  <Input
                    id="cust-landline"
                    value={customerLandline}
                    onChange={(e) => setCustomerLandline(e.target.value)}
                    placeholder="e.g. (02) 8123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="cust-business">Business Number</Label>
                  <Input
                    id="cust-business"
                    value={customerBusiness}
                    onChange={(e) => setCustomerBusiness(e.target.value)}
                    placeholder="e.g. BIZ-82812"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* VEHICLE DETAILS */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold">Vehicle Details</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="veh-year">Year</Label>
                  <Input
                    id="veh-year"
                    value={vehicleYear}
                    onChange={(e) => setVehicleYear(e.target.value)}
                    placeholder="e.g. 2020"
                  />
                </div>
                <div>
                  <Label htmlFor="veh-make">Make</Label>
                  <Input
                    id="veh-make"
                    value={vehicleMake}
                    onChange={(e) => setVehicleMake(e.target.value)}
                    placeholder="e.g. Toyota"
                  />
                </div>
                <div>
                  <Label htmlFor="veh-model">Model</Label>
                  <Input
                    id="veh-model"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="e.g. Vios"
                  />
                </div>
                <div>
                  <Label htmlFor="veh-variant">Variant</Label>
                  <Input
                    id="veh-variant"
                    value={vehicleVariant}
                    onChange={(e) => setVehicleVariant(e.target.value)}
                    placeholder="e.g. 1.5G"
                  />
                </div>
                <div>
                  <Label htmlFor="veh-color">Color</Label>
                  <Input
                    id="veh-color"
                    value={vehicleColor}
                    onChange={(e) => setVehicleColor(e.target.value)}
                    placeholder="e.g. Red"
                  />
                </div>
                <div>
                  <Label htmlFor="veh-plate">Plate Number *</Label>
                  {!customerId ? (
                    <Input
                      value=""
                      placeholder="Select customer first"
                      disabled
                    />
                  ) : (
                    <Combobox
                      value={vehicleId}
                      onChange={(val) => {
                        setVehicleId(val);
                        const v = dbVehicles.find((v) => v.id === val);
                        if (v) {
                          setVehiclePlate(v.plateNo);
                          setVehicleYear(v.year);
                          setVehicleMake(v.make);
                          setVehicleModel(v.model);
                          setVehicleVariant(v.variant);
                          setVehicleColor(v.color);
                          setVehicleEngine(v.engineNo);
                          setVehicleVIN(v.vin);
                          setVehicleRegistration(v.registrationNo);
                          setVehicleMileage(v.mileage);
                        } else {
                          setVehiclePlate("");
                          setVehicleYear("");
                          setVehicleMake("");
                          setVehicleModel("");
                          setVehicleVariant("");
                          setVehicleColor("");
                          setVehicleEngine("");
                          setVehicleVIN("");
                          setVehicleRegistration("");
                          setVehicleMileage(0);
                        }
                      }}
                      items={[
                        { label: "No Vehicle (Optional)", value: "" },
                        ...dbVehicles
                          .filter((v) => v.customerId === customerId)
                          .map((v) => ({
                            label: `${v.year || ""} ${v.make || ""} ${v.model || ""} (${v.plateNo})`,
                            value: v.id,
                          })),
                      ]}
                      placeholder="Select vehicle"
                    />
                  )}
                </div>
                <div>
                  <Label htmlFor="veh-engine">Engine Number</Label>
                  <Input
                    id="veh-engine"
                    value={vehicleEngine}
                    onChange={(e) => setVehicleEngine(e.target.value)}
                    placeholder="e.g. 1NZ-FE12345"
                  />
                </div>
                <div>
                  <Label htmlFor="veh-vin">Chassis No. (VIN)</Label>
                  <Input
                    id="veh-vin"
                    value={vehicleVIN}
                    onChange={(e) => setVehicleVIN(e.target.value)}
                    placeholder="VIN characters"
                  />
                </div>
                <div>
                  <Label htmlFor="veh-registration">Registration Number</Label>
                  <Input
                    id="veh-registration"
                    value={vehicleRegistration}
                    onChange={(e) => setVehicleRegistration(e.target.value)}
                    placeholder="REG No"
                  />
                </div>
                <div>
                  <Label htmlFor="veh-dealer">Selling Dealer</Label>
                  <Input
                    id="veh-dealer"
                    value={vehicleDealer}
                    onChange={(e) => setVehicleDealer(e.target.value)}
                    placeholder="Dealer branch"
                  />
                </div>
                <div>
                  <Label htmlFor="veh-mileage">Mileage (km)</Label>
                  <Input
                    id="veh-mileage"
                    type="number"
                    value={vehicleMileage}
                    onChange={(e) => setVehicleMileage(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* LINE ITEMS */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold">Bill Line Items</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Manual Add Line Item Form */}
              <div className="grid sm:grid-cols-4 gap-3 bg-muted/20 p-3 rounded-lg border border-dashed border-border">
                <div className="sm:col-span-2">
                  <Label className="text-xs">Item Description</Label>
                  <Input
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Enter service name, part name, or supply description"
                  />
                </div>
                <div>
                  <Label className="text-xs">Quantity</Label>
                  <Input
                    type="number"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    min={1}
                  />
                </div>
                <div>
                  <Label className="text-xs">Unit Price (₱)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                      min={0}
                    />
                    <Button onClick={handleAddItem} variant="outline" className="shrink-0 h-9 px-3">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border rounded-lg overflow-hidden mt-4">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[15%] text-center">Type</TableHead>
                      <TableHead className="w-[12%] text-center">Price</TableHead>
                      <TableHead className="w-[12%] text-center">Qty</TableHead>
                      <TableHead className="w-[15%] text-center">Amount</TableHead>
                      <TableHead className="w-[8%] text-center"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length > 0 ? (
                      items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-center capitalize">
                            <span className="inline-block text-[11px] px-2 py-0.5 font-semibold bg-secondary rounded text-secondary-foreground">
                              {item.type}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">₱{item.price.toLocaleString()}</TableCell>
                          <TableCell className="text-center">{item.qty}</TableCell>
                          <TableCell className="text-center font-bold">₱{item.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              onClick={() => handleRemoveItem(item.id)}
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8 text-sm">
                          No items added yet. Add items above or import a Sales Order.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* BILL SUMMARY RIGHT */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader className="bg-muted/30">
              <h2 className="text-sm font-semibold">Bill Details</h2>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="bill-status">Initial Status</Label>
                  <Select value={status} onValueChange={(val) => setStatus(val as BillingStatement["status"])}>
                    <SelectTrigger id="bill-status" className="bg-card">
                      <SelectValue placeholder="Select Status..." />
                    </SelectTrigger>
                    <SelectContent className="z-[100]">
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Pending">Pending / Unpaid</SelectItem>
                      <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ref-est">Linked Estimate No (Optional)</Label>
                  <Input
                    id="ref-est"
                    value={estimateNo}
                    onChange={(e) => setEstimateNo(e.target.value)}
                    placeholder="e.g. EST-203702-001"
                  />
                </div>

                <div>
                  <Label htmlFor="ref-soid">Linked Sales Order ID (Optional)</Label>
                  <Input
                    id="ref-soid"
                    value={soid}
                    onChange={(e) => setSoid(e.target.value)}
                    placeholder="e.g. SO-1001"
                  />
                </div>

                <div>
                  <Label htmlFor="ref-joid">Linked Job Order ID (Optional)</Label>
                  <Input
                    id="ref-joid"
                    value={joid}
                    onChange={(e) => setJoid(e.target.value)}
                    placeholder="e.g. JO-1024"
                  />
                </div>

                <div>
                  <Label htmlFor="ref-poid">Linked Purchase Order ID (Optional)</Label>
                  <Input
                    id="ref-poid"
                    value={poid}
                    onChange={(e) => setPoid(e.target.value)}
                    placeholder="e.g. PO-1052"
                  />
                </div>

                <div>
                  <Label htmlFor="tax-rate">VAT Rate (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₱{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>VAT ({taxRate}%)</span>
                  <span>₱{tax.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg text-primary">
                  <span>Grand Total</span>
                  <span>₱{total.toLocaleString()}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="bill-notes">Billing Notes / Terms</Label>
                <Textarea
                  id="bill-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter invoice terms, bank payment details, or client reminders"
                  rows={4}
                />
              </div>

              <div className="pt-2">
                <Button className="w-full" onClick={handleSave}>
                  Save Billing Statement
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BillingForm;
