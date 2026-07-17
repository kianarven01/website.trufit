import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import DataToolbar from "@/components/DataToolbar";
import {
  ArrowLeft,
  CreditCard,
  Printer,
  User,
  Car,
  Wrench,
  Box,
  Fuel,
  Calculator,
  FileText,
  Archive,
  RotateCcw,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { BillingStatement, PaymentEntry, BillingItem } from "./BillingList";
import api from "@/api/axios";

const mapBillingStatement = (b: any): BillingStatement => {
  const customer = b.customer || {};
  const vehicle = b.vehicle || {};
  const salesOrder = b.sales_order || b.salesOrder || {};
  const jobOrder = b.job_order || b.jobOrder || {};
  const payments = Array.isArray(b.payments) ? b.payments : [];

  // Prefer billing items from BillingStatementItems table, fallback to SO items for backward compatibility
  const billingItems = Array.isArray(b.items) && b.items.length > 0
    ? b.items
    : Array.isArray(salesOrder.items)
      ? salesOrder.items
      : [];

  const items: BillingItem[] = billingItems.map((i: any) => ({
    id: i.id,
    name: i.product?.name || i.name || "Unknown Product",
    qty: Number(i.quantity ?? i.Quantity) || 1,
    price: Number(i.UnitPrice ?? i.price) || 0,
    amount: Number(i.SubTotal ?? i.amount) || 0,
    type: (i.type || "part") as "service" | "part" | "supply"
  }));

  return {
    id: b.id,
    billNumber: b.bill_number || "",
    customerId: String(customer.customer_id || ""),
    customerName: `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || "—",
    customerEmail: customer.email || "—",
    customerMobile: customer.mobile_number || "—",
    customerLandline: customer.landline || "—",
    customerBusiness: customer.business || "—",
    customerAddress: customer.address || "—",
    vehiclePlate: vehicle.plate_number || "",
    vehicleInfo: `${vehicle.year_model || ""} ${vehicle.make || ""} ${vehicle.model || ""} ${vehicle.variant || ""}`.trim() || "",
    vehicleYear: vehicle.year_model || "",
    vehicleMake: vehicle.make || "",
    vehicleModel: vehicle.model || "",
    vehicleVariant: vehicle.variant || "",
    vehicleColor: vehicle.color || "",
    vehicleEngine: vehicle.engine_number || "",
    vehicleVIN: vehicle.VIN || "",
    vehicleRegistration: vehicle.registration_number || "",
    vehicleDealer: vehicle.selling_dealer || "",
    vehicleMileage: Number(vehicle.mileage) || 0,
    date: b.Date || new Date().toISOString(),
    status: b.status || "Unpaid",
    soid: salesOrder.so_number || b.SOID || "—",
    joid: jobOrder.jo_number || b.JOID || "—",
    estimateNo: salesOrder.estimate?.estimate_number || null,
    poid: salesOrder.po_number || null,
    items,
    tax: Number(b.tax) || 0,
    total: Number(b.Total) || 0,
    discountType: b.discount_type || null,
    discountValue: Number(b.discount_value) || 0,
    payments: payments.map((p: any) => ({
      id: p.id,
      date: p.Date || new Date().toISOString(),
      amount: Number(p.Amount) || 0,
      method: p.PaymentMethod || "Cash",
      referenceNumber: p.ReferenceNumber || undefined,
      type: p.Type || "partial"
    })),
    notes: b.notes || ""
  };
};

const BillingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [statement, setStatement] = useState<BillingStatement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isArchived, setIsArchived] = useState(false);

  // Payment Dialog States
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<string>("");
  const [payMethod, setPayMethod] = useState<string>("Cash");
  const [payRef, setPayRef] = useState<string>("");

  // Discount Edit States
  const [editDiscountType, setEditDiscountType] = useState<string>("");
  const [editDiscountValue, setEditDiscountValue] = useState<string>("");

  // Notes Edit State
  const [editNotes, setEditNotes] = useState<string>("");

  // Invoice Print Dialog State
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  const fetchStatement = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/billing-statements/${id}`);
      const b = res.data.data;
      if (b) {
        const mapped = mapBillingStatement(b);
        setStatement(mapped);
        setIsArchived(!!b.deleted_at);
        setEditDiscountType(mapped.discountType || "");
        setEditDiscountValue(mapped.discountValue ? String(mapped.discountValue) : "");
        setEditNotes(mapped.notes || "");
        const paid = mapped.payments.reduce((sum: number, p: PaymentEntry) => sum + p.amount, 0);
        setPayAmount((mapped.total - paid).toString());

        const billNumber = mapped.billNumber || b.id.substring(0, 8).toUpperCase();
        sessionStorage.setItem(`breadcrumb-/webapp/sales/billing/${id}`, billNumber);
        window.dispatchEvent(new Event("breadcrumb-update"));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load billing statement");
    } finally {
      setIsLoading(false);
    }
  };

  // Load statement
  useEffect(() => {
    fetchStatement();
    return () => {
      if (id) {
        sessionStorage.removeItem(`breadcrumb-/webapp/sales/billing/${id}`);
        window.dispatchEvent(new Event("breadcrumb-update"));
      }
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Loading billing statement...
          </p>
        </div>
      </div>
    );
  }

  if (!statement) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-muted-foreground">Billing Statement not found</p>
        <Button onClick={() => navigate("/webapp/sales/billing")}>
          Back to Billing List
        </Button>
      </div>
    );
  }

  // Filter items by type
  const serviceItems = statement.items.filter((i) => i.type === "service");
  const partItems = statement.items.filter((i) => i.type === "part");
  const supplyItems = statement.items.filter((i) => i.type === "supply");

  // Sums for billing summary layout
  const totalServices = serviceItems.reduce((sum: number, item: BillingItem) => sum + item.amount, 0);
  const totalParts = partItems.reduce((sum: number, item: BillingItem) => sum + item.amount, 0);
  const totalSupplies = supplyItems.reduce((sum: number, item: BillingItem) => sum + item.amount, 0);

  const subtotal = statement.items.reduce((sum: number, item: BillingItem) => sum + item.amount, 0);
  const paidAmount = statement.payments.reduce((sum: number, p: PaymentEntry) => sum + p.amount, 0);

  // Compute discount amount (uses live edit state, not saved API state)
  const activeDiscountType = editDiscountType || statement.discountType;
  const activeDiscountValue = editDiscountValue ? parseFloat(editDiscountValue) : (statement.discountValue || 0);
  const discountAmount = activeDiscountType === 'fixed'
    ? activeDiscountValue
    : activeDiscountType === 'percent'
      ? Math.round(subtotal * (activeDiscountValue / 100) * 100) / 100
      : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount);
  const balance = grandTotal - paidAmount;

  const peso = (amount: number) => `₱${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Handle Recording Payment
  const handleRecordPayment = async () => {
    const parsedAmount = parseFloat(payAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    if (parsedAmount > balance) {
      toast.error(`Payment amount cannot exceed the remaining balance of ₱${balance.toLocaleString()}`);
      return;
    }

    try {
      // Save discount first if changed
      const discountType = editDiscountType || null;
      const discountValue = parseFloat(editDiscountValue) || 0;
      if (discountType !== statement.discountType || discountValue !== (statement.discountValue || 0)) {
        await api.patch(`/billing-statements/${id}/discount`, {
          discount_type: discountType,
          discount_value: discountValue,
        });
      }

      await api.post(`/billing-statements/${id}/payments`, {
        amount: parsedAmount,
        method: payMethod,
        reference_number: payRef || null,
        type: parsedAmount >= balance ? "full" : "partial"
      });
      setPayRef("");
      setIsPaymentOpen(false);
      toast.success("Payment recorded successfully!");
      fetchStatement();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to record payment");
    }
  };

  // Handle Saving Notes (on blur)
  const handleSaveNotes = async () => {
    if (editNotes === (statement.notes || "")) return;
    try {
      await api.patch(`/billing-statements/${id}/notes`, { notes: editNotes || null });
      setStatement({ ...statement, notes: editNotes || undefined });
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update notes");
    }
  };

  // Archive Billing Statement
  const handleArchive = async () => {
    try {
      await api.delete(`/billing-statements/${id}`);
      toast.success("Billing statement archived successfully");
      navigate("/webapp/sales/billing");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to archive billing statement");
    }
  };

  // Restore Billing Statement
  const handleRestore = async () => {
    try {
      await api.patch(`/billing-statements/${id}/restore`);
      toast.success("Billing statement restored successfully");
      fetchStatement();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to restore billing statement");
    }
  };

  // Permanently Delete Billing Statement
  const handleForceDelete = async () => {
    if (!window.confirm("This will permanently delete this billing statement and all associated payments. This action cannot be undone. Continue?")) {
      return;
    }
    try {
      await api.delete(`/billing-statements/${id}/force`);
      toast.success("Billing statement permanently deleted");
      navigate("/webapp/sales/billing");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete billing statement");
    }
  };

  const getStatusBadge = (status: BillingStatement["status"]) => {
    switch (status) {
      case "Paid":
        return <Badge variant="approved">Paid</Badge>;
      case "Partially Paid":
        return <Badge variant="received">Partially Paid</Badge>;
      case "Unpaid":
        return <Badge variant="for-approval">Unpaid</Badge>;
      case "Cancelled":
        return <Badge variant="cancelled">Cancelled</Badge>;
      default:
        return <Badge variant="default">Draft</Badge>;
    }
  };

  return (
    <>
      <div className="w-full h-full pl-4 pr-3 pb-4 flex flex-col gap-4 overflow-y-auto">
        {/* HEADER */}
        <DataToolbar
          variant="detail"
          title={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/webapp/sales/billing")}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          }
          actions={
            <div className="flex items-center gap-2">
              {isArchived ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRestore}
                  >
                    <RotateCcw className="w-4 h-4 mr-1.5" />
                    Restore
                  </Button>
                  {statement.status === "Cancelled" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleForceDelete}
                    >
                      <Trash2 className="w-4 h-4 mr-1.5" />
                      Delete Permanently
                    </Button>
                  )}
                </>
              ) : (
                <>
                  {statement.status === "Cancelled" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleArchive}
                      className="text-orange-600 border-orange-300 hover:bg-orange-50"
                    >
                      <Archive className="w-4 h-4 mr-1.5" />
                      Archive
                    </Button>
                  )}
                </>
              )}
            </div>
          }
        />

        {isArchived && (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-orange-300 bg-orange-50 text-orange-800">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">This billing statement has been archived.</p>
              <p className="text-xs text-orange-600">Archived records are hidden from the active billing list. You can restore it or delete it permanently.</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* CUSTOMER + VEHICLE DETAILS SIDE-BY-SIDE */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* CUSTOMER DETAILS */}
            <Card>
              <CardHeader className="py-4">
                <div className="flex items-center gap-2 text-blue-500">
                  <User className="size-5" />
                  <p className="font-semibold text-foreground">Customer Details</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <Label className="text-muted-foreground font-normal text-xs">Full Name</Label>
                    <Input value={statement.customerName || "—"} readOnly />
                  </div>
                  <div>
                    <Label className="text-muted-foreground font-normal text-xs">Address</Label>
                    <Input value={statement.customerAddress || "—"} readOnly />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-y-2 gap-x-4">
                    <div>
                      <Label className="text-muted-foreground font-normal text-xs">Email Address</Label>
                      <Input value={statement.customerEmail || "—"} readOnly />
                    </div>
                    <div>
                      <Label className="text-muted-foreground font-normal text-xs">Phone Number</Label>
                      <Input value={statement.customerMobile || "—"} readOnly />
                    </div>
                    <div>
                      <Label className="text-muted-foreground font-normal text-xs">Landline</Label>
                      <Input value={statement.customerLandline || "—"} readOnly />
                    </div>
                    <div>
                      <Label className="text-muted-foreground font-normal text-xs">Business Number</Label>
                      <Input value={statement.customerBusiness || "—"} readOnly />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* VEHICLE DETAILS */}
            <Card>
              <CardHeader className="py-4">
                <div className="flex items-center gap-2 text-blue-500">
                  <Car className="size-5" />
                  <p className="font-semibold text-foreground">Vehicle Details</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2">
                  <div className="sm:col-span-2 grid lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-2">
                      <Label className="text-muted-foreground font-normal text-xs">Year / Make / Model</Label>
                      <Input
                        value={
                          statement.vehicleYear || statement.vehicleMake || statement.vehicleModel
                            ? [statement.vehicleYear, statement.vehicleMake, statement.vehicleModel].filter(Boolean).join(" ")
                            : ""
                        }
                        readOnly
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground font-normal text-xs">Variant</Label>
                      <Input value={statement.vehicleVariant || ""} readOnly />
                    </div>
                    <div>
                      <Label className="text-muted-foreground font-normal text-xs">Color</Label>
                      <Input value={statement.vehicleColor || ""} readOnly />
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground font-normal text-xs">Plate No.</Label>
                    <Input value={statement.vehiclePlate || ""} readOnly />
                  </div>
                  <div>
                    <Label className="text-muted-foreground font-normal text-xs">Engine No.</Label>
                    <Input value={statement.vehicleEngine || ""} readOnly />
                  </div>
                  <div>
                    <Label className="text-muted-foreground font-normal text-xs">Chassis No. (VIN)</Label>
                    <Input value={statement.vehicleVIN || ""} readOnly />
                  </div>
                  <div>
                    <Label className="text-muted-foreground font-normal text-xs">Registration No.</Label>
                    <Input value={statement.vehicleRegistration || ""} readOnly />
                  </div>
                  <div>
                    <Label className="text-muted-foreground font-normal text-xs">Selling Dealer</Label>
                    <Input value={statement.vehicleDealer || ""} readOnly />
                  </div>
                  <div>
                    <Label className="text-muted-foreground font-normal text-xs">Mileage</Label>
                    <Input value={statement.vehicleMileage ? `${statement.vehicleMileage}` : ""} readOnly />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* BOTTOM SECTION */}
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-6">
              
              {/* ========== SERVICES (JOB ORDER) ========== */}
              <div className="rounded-lg border border-border bg-card p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Wrench className="size-5 text-blue-500" />
                  <h2 className="text-sm font-semibold text-foreground">Services (Job Order)</h2>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table className="[&_tr]:hover:!bg-transparent text-center">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs text-center">Service</TableHead>
                        <TableHead className="text-xs w-[25%] text-center">Unit Price</TableHead>
                        <TableHead className="text-xs w-[15%] text-center">Qty</TableHead>
                        <TableHead className="text-xs w-[25%] text-center">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {serviceItems.length > 0 ? (
                        serviceItems.map((item) => (
                          <TableRow key={item.id} className="hover:bg-transparent text-center">
                            <TableCell className="font-medium text-center">{item.name}</TableCell>
                            <TableCell className="text-center">{peso(item.price)}</TableCell>
                            <TableCell className="text-center">{item.qty}</TableCell>
                            <TableCell className="text-center font-semibold">{peso(item.amount)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">
                            No services added.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* ========== PARTS (SALES ORDER) ========== */}
              <div className="rounded-lg border border-border bg-card p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Box className="size-5 text-orange-500" />
                  <h2 className="text-sm font-semibold text-foreground">Parts (Sales Order)</h2>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table className="[&_tr]:hover:!bg-transparent text-center">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs text-center">Part Name</TableHead>
                        <TableHead className="text-xs w-[25%] text-center">Unit Price</TableHead>
                        <TableHead className="text-xs w-[15%] text-center">Qty</TableHead>
                        <TableHead className="text-xs w-[25%] text-center">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {partItems.length > 0 ? (
                        partItems.map((item) => (
                          <TableRow key={item.id} className="hover:bg-transparent text-center">
                            <TableCell className="font-medium text-center">{item.name}</TableCell>
                            <TableCell className="text-center">{peso(item.price)}</TableCell>
                            <TableCell className="text-center">{item.qty}</TableCell>
                            <TableCell className="text-center font-semibold">{peso(item.amount)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">
                            No parts added.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* ========== SUPPLIES, PETROL, OILS & LUBRICANTS ========== */}
              <div className="rounded-lg border border-border bg-card p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Fuel className="size-5 text-green-600" />
                  <h2 className="text-sm font-semibold text-foreground">Supplies, Petrol, Oils, and Lubricants</h2>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table className="[&_tr]:hover:!bg-transparent text-center">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs text-center">Item Name</TableHead>
                        <TableHead className="text-xs w-[25%] text-center">Unit Price</TableHead>
                        <TableHead className="text-xs w-[15%] text-center">Qty</TableHead>
                        <TableHead className="text-xs w-[25%] text-center">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supplyItems.length > 0 ? (
                        supplyItems.map((item) => (
                          <TableRow key={item.id} className="hover:bg-transparent text-center">
                            <TableCell className="font-medium text-center">{item.name}</TableCell>
                            <TableCell className="text-center">{peso(item.price)}</TableCell>
                            <TableCell className="text-center">{item.qty}</TableCell>
                            <TableCell className="text-center font-semibold">{peso(item.amount)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">
                            No supplies added.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* ========== PAYMENT HISTORY ========== */}
              <div className="rounded-lg border border-border bg-card p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="size-5 text-emerald-600" />
                  <h2 className="text-sm font-semibold text-foreground">Payment History</h2>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table className="[&_tr]:hover:!bg-transparent text-center">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs text-center pl-4">Date</TableHead>
                        <TableHead className="text-xs text-center">Method</TableHead>
                        <TableHead className="text-xs text-center">Reference No.</TableHead>
                        <TableHead className="text-xs text-center">Type</TableHead>
                        <TableHead className="text-xs text-center pr-4">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {statement.payments.length > 0 ? (
                        statement.payments.map((p) => (
                          <TableRow key={p.id} className="hover:bg-transparent text-center">
                            <TableCell className="pl-4 text-xs text-center">
                              {new Date(p.date).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-center font-medium">{p.method}</TableCell>
                            <TableCell className="text-center font-mono text-xs">
                              {p.referenceNumber || "—"}
                            </TableCell>
                            <TableCell className="text-center capitalize text-xs">
                              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                                {p.type}
                              </span>
                            </TableCell>
                            <TableCell className="text-center pr-4 font-bold text-emerald-600 dark:text-emerald-400">
                              {peso(p.amount)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                            No payments recorded yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

            </div>

            {/* ========== RIGHT SIDEBAR (SUMMARY + REFERENCES) ========== */}
            <div className="space-y-4">
              
              {/* DOCUMENT REFERENCES CARD */}
              {((statement.estimateNo && statement.estimateNo !== "—") ||
                (statement.soid && statement.soid !== "—") ||
                (statement.joid && statement.joid !== "—") ||
                (statement.poid && statement.poid !== "—")) && (
                <Card className="shadow-lg border-muted">
                  <CardHeader className="bg-muted/10 py-4 rounded-t-lg">
                    <div className="flex items-center gap-2 text-primary">
                      <FileText className="size-5" />
                      <h2 className="font-semibold text-foreground text-sm">Document References</h2>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-3.5 text-xs">
                    {statement.estimateNo && statement.estimateNo !== "—" && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Estimate Ref</span>
                        <span className="font-mono font-bold text-primary bg-primary/5 px-2.5 py-1 rounded border border-primary/10">
                          {statement.estimateNo}
                        </span>
                      </div>
                    )}
                    {statement.soid && statement.soid !== "—" && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Sales Order (SO)</span>
                        <span className="font-mono font-bold text-primary bg-primary/5 px-2.5 py-1 rounded border border-primary/10">
                          {statement.soid}
                        </span>
                      </div>
                    )}
                    {statement.joid && statement.joid !== "—" && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Job Order (JO)</span>
                        <span className="font-mono font-bold text-primary bg-primary/5 px-2.5 py-1 rounded border border-primary/10">
                          {statement.joid}
                        </span>
                      </div>
                    )}
                    {statement.poid && statement.poid !== "—" && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Purchase Order (PO)</span>
                        <span className="font-mono font-bold text-primary bg-primary/5 px-2.5 py-1 rounded border border-primary/10">
                          {statement.poid}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* BILLING SUMMARY CARD */}
              <Card className="shadow-lg border-primary/20">
                <CardHeader className="bg-primary/5 py-4 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="size-5 text-blue-900" />
                    <h2 className="font-semibold text-foreground text-sm">Billing Summary</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-2.5 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Services Subtotal</span>
                      <span>{peso(totalServices)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Parts Subtotal</span>
                      <span>{peso(totalParts)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Supplies Subtotal</span>
                      <span>{peso(totalSupplies)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount {activeDiscountType === 'percent' ? `(${activeDiscountValue}%)` : ''}</span>
                        <span>-{peso(discountAmount)}</span>
                      </div>
                    )}
                  </div>

                  {/* Discount Input */}
                  {statement.status !== "Paid" && statement.status !== "Cancelled" && (
                    <div className="border-t pt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Apply Discount</Label>
                      </div>
                      <div className="flex gap-2">
                        <Select value={editDiscountType} onValueChange={setEditDiscountType}>
                          <SelectTrigger className="w-[100px] h-9 text-xs">
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                          <SelectContent className="z-[150]">
                            <SelectItem value="fixed">₱ Fixed</SelectItem>
                            <SelectItem value="percent">% Percent</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          className="h-9 text-xs flex-1"
                          placeholder="0"
                          min={0}
                          max={editDiscountType === 'percent' ? 100 : undefined}
                          value={editDiscountValue}
                          onChange={(e) => setEditDiscountValue(e.target.value)}
                          disabled={!editDiscountType}
                        />
                      </div>
                    </div>
                  )}

                  <div className="bg-primary/10 p-3 rounded-lg border border-primary/20 space-y-2 text-sm">
                    <div className="flex justify-between items-end text-primary">
                      <span className="text-xs font-bold uppercase">Grand Total</span>
                      <span className="text-xl font-bold tracking-wide">{peso(grandTotal)}</span>
                    </div>
                    <Separator className="bg-primary/20" />
                    <div className="flex justify-between items-end text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span className="text-xs font-bold uppercase">Amount Paid</span>
                      <span className="text-sm font-bold">{peso(paidAmount)}</span>
                    </div>
                    <Separator className="bg-primary/20" />
                    <div className="flex justify-between items-end text-blue-950 dark:text-blue-200 font-bold">
                      <span className="text-xs uppercase">Balance Due</span>
                      <span className="text-2xl tracking-wide">{peso(Math.max(0, balance))}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 text-xs">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Billing Notes</Label>
                    <textarea
                      className="w-full p-3 bg-background border rounded-md text-muted-foreground text-xs leading-relaxed resize-none"
                      rows={3}
                      placeholder="Add repair recommendations, notes, or remarks..."
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      onBlur={handleSaveNotes}
                    />
                  </div>

                  <div className="space-y-2.5 pt-2 text-xs text-muted-foreground border-t">
                    <div className="flex justify-between items-center">
                      <span>Status</span>
                      {getStatusBadge(statement.status)}
                    </div>
                    <div className="flex justify-between">
                      <span>Date Issued</span>
                      <span>{new Date(statement.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    {statement.status !== "Paid" && statement.status !== "Cancelled" && (
                      <Button
                        className="w-full shadow-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                        size="lg"
                        onClick={() => setIsPaymentOpen(true)}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Record Payment
                      </Button>
                    )}
                    <Button
                      className="w-full shadow-md"
                      size="lg"
                      variant="outline"
                      onClick={() => setIsPrintOpen(true)}
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Preview Invoice
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <p className="text-xs text-center text-muted-foreground px-4">
                Billing statements reflect standard parts, services, and local taxes.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* RECORD PAYMENT DIALOG */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-[425px] z-[120]">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment received for statement {statement.billNumber || statement.id.substring(0, 8).toUpperCase()}. Remaining balance is {peso(balance)}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pay-amount">Payment Amount (₱) *</Label>
              <Input
                id="pay-amount"
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                max={balance}
                min={0.01}
                step="any"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pay-method">Payment Method *</Label>
              <Select value={payMethod} onValueChange={setPayMethod}>
                <SelectTrigger id="pay-method" className="w-full bg-card">
                  <SelectValue placeholder="Select Method..." />
                </SelectTrigger>
                <SelectContent className="z-[150]">
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="GCash">GCash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pay-ref">Reference / Check Number</Label>
              <Input
                id="pay-ref"
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                placeholder="e.g. GCash Ref No or Check No"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordPayment} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Save Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* INVOICE PRINT / PREVIEW DIALOG */}
      <Dialog open={isPrintOpen} onOpenChange={setIsPrintOpen}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden z-[120]">
          <DialogHeader className="px-6 py-4 border-b bg-background shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold">
                Invoice Preview — {statement.billNumber || statement.id.substring(0, 8).toUpperCase()}
              </DialogTitle>
              <Button
                size="sm"
                className="mr-8 flex items-center gap-1.5"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4" />
                Print Invoice
              </Button>
            </div>
          </DialogHeader>

          {/* PRINT BODY */}
          <div className="flex-1 overflow-y-auto p-8 bg-white text-zinc-900 printable-area">
            {/* Header */}
            <div className="flex justify-between items-start border-b pb-6">
              <div>
                <h1 className="text-2xl font-black tracking-wide text-primary">TRUFIT AUTO CENTER</h1>
                <p className="text-xs text-zinc-500 mt-1">
                  123 Auto Service Drive, Metro Manila<br />
                  Phone: (02) 8123-4567 | Mobile: 0917-888-9999<br />
                  Email: billing@trufitautocenter.com
                </p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-zinc-800">OFFICIAL INVOICE</h2>
                <p className="text-sm font-mono mt-1 text-primary font-bold">{statement.billNumber || statement.id.substring(0, 8).toUpperCase()}</p>
                <p className="text-xs text-zinc-500 mt-1">Date Issued: {new Date(statement.date).toLocaleDateString()}</p>
                <div className="mt-2">
                  <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-zinc-100 border border-zinc-200">
                    Status: {statement.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Billed To / Vehicle Details */}
            <div className="grid grid-cols-2 gap-8 py-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">BILLED TO:</h3>
                <div className="font-bold text-sm mt-1">{statement.customerName}</div>
                <div className="text-xs text-zinc-600 mt-0.5">{statement.customerEmail || "—"}</div>
                <div className="text-xs text-zinc-600">{statement.customerMobile || "—"}</div>
                <div className="text-xs text-zinc-600">{statement.customerAddress || "—"}</div>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">VEHICLE DETAILS:</h3>
                <div className="font-semibold text-sm mt-1">{statement.vehicleInfo || "—"}</div>
                <div className="text-xs text-zinc-600 mt-0.5">Plate Number: <span className="font-bold">{statement.vehiclePlate || "—"}</span></div>
                {statement.soid && statement.soid !== "—" && (
                  <div className="text-xs text-zinc-600 mt-0.5">Sales Order: <span className="font-mono">{statement.soid}</span></div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full border-collapse mt-4 text-sm">
              <thead>
                <tr className="border-b-2 border-zinc-200 bg-zinc-50 text-zinc-600">
                  <th className="py-2 text-left font-bold">Item Description</th>
                  <th className="py-2 text-center font-bold w-[12%]">Type</th>
                  <th className="py-2 text-right font-bold w-[18%]">Unit Price</th>
                  <th className="py-2 text-center font-bold w-[10%]">Qty</th>
                  <th className="py-2 text-right font-bold w-[20%]">Amount</th>
                </tr>
              </thead>
              <tbody>
                {statement.items.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-100">
                    <td className="py-3 font-medium text-zinc-800">{item.name}</td>
                    <td className="py-3 text-center capitalize text-xs text-zinc-500">{item.type}</td>
                    <td className="py-3 text-right text-zinc-600">₱{item.price.toLocaleString()}</td>
                    <td className="py-3 text-center text-zinc-600">{item.qty}</td>
                    <td className="py-3 text-right font-bold text-zinc-900">₱{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total Block */}
            <div className="flex justify-between items-start mt-8 pt-4 border-t">
              <div className="w-[50%]">
                {statement.notes && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Notes & Payment Instructions:</h4>
                    <p className="text-xs text-zinc-600 mt-1 whitespace-pre-line bg-zinc-50 p-3 rounded-lg border border-zinc-100">{statement.notes}</p>
                  </div>
                )}
              </div>
              <div className="w-[40%] space-y-2 text-sm text-right">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Subtotal:</span>
                  <span className="font-medium">₱{subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="text-zinc-500">Discount{statement.discountType === 'percent' ? ` (${statement.discountValue}%)` : ''}:</span>
                    <span className="font-medium">-₱{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg text-primary border-t pt-2 mt-1">
                  <span>Grand Total:</span>
                  <span>₱{grandTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-emerald-600">
                  <span>Amount Paid:</span>
                  <span>₱{paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-extrabold text-xl text-primary border-t pt-2">
                  <span>Balance Due:</span>
                  <span>₱{Math.max(0, balance).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Signature Area */}
            <div className="grid grid-cols-2 gap-12 mt-16 text-center text-xs text-zinc-500">
              <div>
                <div className="border-b w-48 mx-auto pb-8"></div>
                <p className="mt-2 font-medium">Prepared By</p>
              </div>
              <div>
                <div className="border-b w-48 mx-auto pb-8"></div>
                <p className="mt-2 font-medium">Customer's Signature</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BillingDetail;
