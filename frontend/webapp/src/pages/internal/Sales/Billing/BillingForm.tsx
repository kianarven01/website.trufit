import React, { useState, useEffect } from "react";
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
  const [salesOrders, setSalesOrders] = useState<ImportedSalesOrder[]>([]);
  const [selectedSOId, setSelectedSOId] = useState<string>("");

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
  const [status, setStatus] = useState<BillingStatement["status"]>("Pending");
  const [items, setItems] = useState<BillingItem[]>([]);
  const [taxRate, setTaxRate] = useState(12);

  // Add Item States
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(0);
  const [newItemType, setNewItemType] = useState<BillingItem["type"]>("part");

  // Load Sales Orders for Import & Set dynamic breadcrumb
  useEffect(() => {
    const stored = localStorage.getItem("sales_orders");
    if (stored) {
      setSalesOrders(JSON.parse(stored));
    }

    sessionStorage.setItem("breadcrumb-/webapp/sales/billing/create", "Create Billing Statement");
    window.dispatchEvent(new Event("breadcrumb-update"));

    return () => {
      sessionStorage.removeItem("breadcrumb-/webapp/sales/billing/create");
      window.dispatchEvent(new Event("breadcrumb-update"));
    };
  }, []);

  // Handle importing a Sales Order
  const handleImportSalesOrder = (soId: string) => {
    if (!soId) return;
    const so = salesOrders.find((o) => o.id === soId);
    if (!so) return;

    setSelectedSOId(soId);
    setSoid(so.id);
    setJoid(so.id.replace("SO-", "JO-"));
    setEstimateNo(so.id.replace("SO-", "EST-"));
    setPoid("—");

    setCustomerName(so.customer.name);
    setCustomerEmail(so.customer.email);
    setCustomerMobile(so.customer.mobile);
    setCustomerLandline("—");
    setCustomerBusiness("—");
    setCustomerAddress(so.customer.address);

    setVehiclePlate(so.vehicle.plateNo);
    setVehicleYear(so.vehicle.year);
    setVehicleMake(so.vehicle.make);
    setVehicleModel(so.vehicle.model);
    setVehicleVariant(so.vehicle.variant);
    setVehicleColor("—");
    setVehicleEngine("—");
    setVehicleVIN("—");
    setVehicleRegistration("—");
    setVehicleDealer("—");
    setVehicleMileage(so.vehicle.mileage);
    
    // Map SO products to billing items
    const billingItems: BillingItem[] = so.products.map((p, idx) => ({
      id: p.id || `so-item-${idx}`,
      name: p.name,
      qty: p.qty,
      price: p.price,
      amount: p.amount,
      type: "part"
    }));
    setItems(billingItems);
    toast.success(`Successfully imported items from Sales Order ${so.id}`);
  };

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

  // Handle Save
  const handleSave = () => {
    if (!customerName.trim()) {
      toast.error("Customer Name is required");
      return;
    }
    if (!vehiclePlate.trim()) {
      toast.error("Vehicle Plate Number is required");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one item to the billing statement");
      return;
    }

    const storedBills = JSON.parse(localStorage.getItem("billing_statements") || "[]");
    
    // Generate new Bill ID
    const nextNum = storedBills.length ? Math.max(...storedBills.map((b: any) => {
      const match = b.id.match(/\d+/);
      return match ? parseInt(match[0], 10) : 1000;
    })) + 1 : 1001;
    
    const newBill: BillingStatement = {
      id: `BILL-${nextNum}`,
      customerId: `cust-${nextNum}`,
      customerName,
      customerEmail,
      customerMobile,
      customerLandline: customerLandline || "—",
      customerBusiness: customerBusiness || "—",
      customerAddress,
      vehiclePlate,
      vehicleInfo: `${vehicleYear} ${vehicleMake} ${vehicleModel} ${vehicleVariant}`.trim() || "—",
      vehicleYear,
      vehicleMake,
      vehicleModel,
      vehicleVariant,
      vehicleColor: vehicleColor || "—",
      vehicleEngine: vehicleEngine || "—",
      vehicleVIN: vehicleVIN || "—",
      vehicleRegistration: vehicleRegistration || "—",
      vehicleDealer: vehicleDealer || "—",
      vehicleMileage,
      date: new Date().toISOString(),
      status,
      soid: soid || undefined,
      joid: joid || undefined,
      poid: poid || undefined,
      estimateNo: estimateNo || undefined,
      items,
      tax,
      total,
      payments: [],
      notes
    };

    storedBills.push(newBill);
    localStorage.setItem("billing_statements", JSON.stringify(storedBills));
    toast.success(`Billing Statement ${newBill.id} created successfully`);
    navigate("/webapp/sales/billing");
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
            <Button size="sm" onClick={handleSave}>
              Save Billing Statement
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
                  {salesOrders.map((so) => (
                    <SelectItem key={so.id} value={so.id}>
                      {so.id} — {so.customer.name} ({so.vehicle.plateNo})
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
                  <Input
                    id="cust-name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer's name"
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
                  <Input
                    id="veh-plate"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    placeholder="ABC-1234"
                  />
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
