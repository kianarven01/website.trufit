import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Send,
  User,
  Car,
  Box,
  Calculator,
  MoreHorizontal,
  Pencil,
  Printer,
  RotateCcw,
  Trash2,
  Clock,
  FileText,
  CircleCheck,
  Play,
  RefreshCw,
  PackageCheck,
  PackageX,
  Plus,
  Import,
} from "lucide-react";
import DataToolbar from "@/components/DataToolbar";
import api from "@/api/axios";
import { toast } from "sonner";

/* TYPES */
interface Customer {
  name: string;
  email: string;
  mobile: string;
  landline?: string;
  business?: string;
  address: string;
}

interface Vehicle {
  year: string;
  make: string;
  model: string;
  variant: string;
  color: string;
  plateNo: string;
  engineNo: string;
  vin: string;
  registrationNo: string;
  mileage: number;
}

interface Product {
  id: string;
  name: string;
  manufacturer: string;
  sku: string;
  qty: number;
  price: number;
  amount: number;
  needsOrdering: boolean;
  quantityOnHand: number | null;
  isIssued: boolean;
}

interface SalesOrder {
  id: string;
  so_number: string;
  status: string;
  type: string;
  customer: Customer;
  vehicle: Vehicle | null;
  products: Product[];
  total: number;
  balance: number;
  remarks?: string;
  mileage?: number;
  createdAt: string;
  updatedAt: string;
  createdByName?: string;
  submittedByName?: string;
  approvedByName?: string;
  cancelledByName?: string;
  submittedAt?: string;
  approvedAt?: string;
  cancelledAt?: string;
  completedAt?: string;
  archived?: boolean;
  estimate_id?: string;
  estimate?: { id: string; estimate_number?: string };
}

const statusConfig: Record<string, { label: string; variant: any }> = {
  DRAFT: { label: "Draft", variant: "default" as const },
  SUBMITTED: { label: "Submitted", variant: "outline" as const },
  APPROVED: { label: "Approved", variant: "approved" as const },
  IN_PROGRESS: { label: "In Progress", variant: "received" as const },
  COMPLETED: { label: "Completed", variant: "approved" as const },
  CANCELLED: { label: "Cancelled", variant: "cancelled" as const },
};

const SalesOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<SalesOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const pdfBlobUrlRef = useRef<string | null>(null);

  const [confirmAction, setConfirmAction] = useState<{ action: string; label: string; description: string; className?: string } | null>(null);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmForceDelete, setConfirmForceDelete] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [estimateItemsModalOpen, setEstimateItemsModalOpen] = useState(false);
  const [availableEstimateItems, setAvailableEstimateItems] = useState<any[]>([]);
  const [selectedEstimateItems, setSelectedEstimateItems] = useState<Set<string>>(new Set());
  const [isLoadingEstimateItems, setIsLoadingEstimateItems] = useState(false);
  const [isAddingItems, setIsAddingItems] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});

  const peso = (n: number) =>
    `₱${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const fetchOrderDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/sales-orders/${id}`);
      const o = res.data.data;

      if (!o) {
        setOrder(null);
        return;
      }

      const orderNumber = o.so_number || o.id.substring(0, 8).toUpperCase();
      sessionStorage.setItem(`breadcrumb-/webapp/sales/sales-orders/${id}`, orderNumber);
      window.dispatchEvent(new Event("breadcrumb-update"));

      const items = Array.isArray(o.items) ? o.items : [];
      const products = items.map((i: any) => {
        const product = i.product;
        let quantityOnHand: number | null = null;
        if (product?.inventory_rows?.length) {
          const total = product.inventory_rows.reduce(
            (sum: number, row: any) => sum + Number(row.quantity_on_hand ?? 0),
            0
          );
          quantityOnHand = total;
        } else if (product?.product_suppliers?.length) {
          const total = product.product_suppliers.reduce(
            (sum: number, ps: any) => sum + Number(ps.inventory?.quantity_on_hand ?? 0),
            0
          );
          quantityOnHand = total;
        }
        return {
          id: i.id,
          name: product?.name || "Unknown Product",
          manufacturer: product?.manufacturer?.name || "",
          sku: product?.part_number || product?.SKU || "—",
          qty: Number(i.quantity) || 0,
          price: Number(i.UnitPrice) || 0,
          amount: Number(i.SubTotal) || 0,
          needsOrdering: Boolean(i.needs_ordering),
          quantityOnHand,
          isIssued: Boolean(i.is_issued),
          quantityReturned: Number(i.quantity_returned) || 0,
        };
      });

      const customer = o.customer
        ? {
            name: `${o.customer.first_name || ""} ${o.customer.last_name || ""}`.trim() || "—",
            email: o.customer.email || "—",
            mobile: o.customer.mobile_number || "—",
            landline: o.customer.landline || "—",
            business: o.customer.business || "—",
            address: o.customer.address || "—",
          }
        : { name: "—", email: "—", mobile: "—", landline: "—", business: "—", address: "—" };

      const vehicle = o.vehicle
        ? {
            year: o.vehicle.year_model || "",
            make: o.vehicle.make || "",
            model: o.vehicle.model || "",
            variant: o.vehicle.variant || "—",
            color: o.vehicle.color || "—",
            plateNo: o.vehicle.plate_number || "—",
            engineNo: o.vehicle.engine_number || "—",
            vin: o.vehicle.VIN || "—",
            registrationNo: o.vehicle.registration_number || "—",
            mileage: Number(o.vehicle.mileage) || 0,
          }
        : null;

      setOrder({
        id: o.id,
        so_number: orderNumber,
        status: o.Status || "DRAFT",
        type: o.type || "COUNTER",
        customer,
        vehicle,
        products,
        total: Number(o.Total) || 0,
        balance: Number(o.Balance) || 0,
        remarks: o.remarks || "",
        mileage: Number(o.mileage) || 0,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
        createdByName: o.createdByName,
        submittedByName: o.submittedByName,
        approvedByName: o.approvedByName,
        cancelledByName: o.cancelledByName,
        submittedAt: o.submitted_at,
        approvedAt: o.approved_at,
        cancelledAt: o.cancelled_at,
        completedAt: o.completed_at,
      });
    } catch (err) {
      console.error("Failed to load Sales Order details", err);
      toast.error("Failed to load Sales Order details");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrderDetails();
    return () => {
      if (id) {
        sessionStorage.removeItem(`breadcrumb-/webapp/sales/sales-orders/${id}`);
        window.dispatchEvent(new Event("breadcrumb-update"));
      }
      if (pdfBlobUrlRef.current) {
        URL.revokeObjectURL(pdfBlobUrlRef.current);
      }
    };
  }, [id]);

  const handleAction = async (action: string) => {
    if (!order) return;
    try {
      setIsSubmitting(true);
      await api.post(`/sales-orders/${order.id}/${action}`);
      const messages: Record<string, string> = {
        submit: "Sales Order submitted for approval.",
        approve: "Sales Order approved & stock reserved.",
        complete: "Sales Order completed.",
        reopen: "Sales Order reopened.",
        cancel: "Sales Order cancelled & stock released.",
        "start-work": "Sales Order work started.",
        void: "Sales Order voided & stock returned to inventory.",
      };
      toast.success(messages[action] || "Action completed.");
      fetchOrderDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${action} Sales Order`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const archiveOrder = async () => {
    if (!order) return;
    try {
      await api.delete(`/sales-orders/${order.id}`);
      toast.success("Sales Order archived.");
      navigate("/webapp/sales/sales-orders");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to archive Sales Order");
    }
  };

  const handleIssueItems = async () => {
    if (!order || selectedItems.size === 0) return;
    try {
      setIsSubmitting(true);
      await api.post(`/sales-orders/${order.id}/issue`, {
        item_ids: Array.from(selectedItems),
      });
      toast.success("Items issued successfully. Stock has been deducted.");
      setSelectedItems(new Set());
      fetchOrderDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to issue items");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReturnModal = () => {
    if (!order) return;
    const initialQtys: Record<string, number> = {};
    order.products.forEach((p) => {
      if (selectedItems.has(p.id)) {
        initialQtys[p.id] = p.qty - p.quantityReturned;
      }
    });
    setReturnQuantities(initialQtys);
    setReturnDialogOpen(true);
  };

  const submitReturnItems = async () => {
    if (!order) return;
    try {
      setIsSubmitting(true);
      const payload = Object.entries(returnQuantities).map(([itemId, qty]) => ({
        id: itemId,
        quantity: qty,
      }));
      await api.post(`/sales-orders/${order.id}/return`, {
        returns: payload,
      });
      toast.success("Items returned successfully. Stock has been restored.");
      setSelectedItems(new Set());
      setReturnDialogOpen(false);
      fetchOrderDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to return items");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const toggleAllItems = () => {
    if (!order) return;
    const selectableItems = order.products.filter(
      (p) => !p.isIssued && !p.needsOrdering && (p.quantityOnHand ?? 0) > 0
    );
    if (selectedItems.size === selectableItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(selectableItems.map((p) => p.id)));
    }
  };

  const openEstimateItemsModal = async () => {
    if (!order) return;
    setEstimateItemsModalOpen(true);
    setSelectedEstimateItems(new Set());
    setIsLoadingEstimateItems(true);
    try {
      const res = await api.get(`/sales-orders/${order.id}/estimate-items`);
      setAvailableEstimateItems(res.data.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load estimate items");
      setEstimateItemsModalOpen(false);
    } finally {
      setIsLoadingEstimateItems(false);
    }
  };

  const toggleEstimateItemSelection = (itemId: string) => {
    setSelectedEstimateItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleAddEstimateItems = async () => {
    if (!order || selectedEstimateItems.size === 0) return;
    setIsAddingItems(true);
    try {
      const res = await api.post(`/sales-orders/${order.id}/add-items`, {
        estimate_item_ids: Array.from(selectedEstimateItems),
      });
      setOrder(res.data.data);
      setEstimateItemsModalOpen(false);
      toast.success(`${selectedEstimateItems.size} item(s) added from estimate.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add items");
    } finally {
      setIsAddingItems(false);
    }
  };

  const restoreOrder = async () => {
    if (!order) return;
    try {
      await api.patch(`/sales-orders/${order.id}/restore`);
      toast.success("Sales Order restored.");
      fetchOrderDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to restore Sales Order");
    }
  };

  const forceDeleteOrder = async () => {
    if (!order) return;
    try {
      await api.delete(`/sales-orders/${order.id}/force`);
      toast.success("Sales Order permanently deleted.");
      navigate("/webapp/sales/sales-orders");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete Sales Order");
    }
  };

  const handlePrint = async () => {
    if (!order) return;
    setPdfDialogOpen(true);
    setPdfBlobUrl(null);
    try {
      const res = await api.get(`/sales-orders/${order.id}/pdf`, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      if (pdfBlobUrlRef.current) {
        URL.revokeObjectURL(pdfBlobUrlRef.current);
      }
      pdfBlobUrlRef.current = url;
      setPdfBlobUrl(url);
    } catch (err) {
      toast.error("Failed to generate PDF");
      setPdfDialogOpen(false);
    }
  };

  const handleClosePdf = () => {
    setPdfDialogOpen(false);
    if (pdfBlobUrlRef.current) {
      URL.revokeObjectURL(pdfBlobUrlRef.current);
      pdfBlobUrlRef.current = null;
      setPdfBlobUrl(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse font-sans">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return <div className="p-6 font-sans">Sales order not found</div>;
  }

  const items = order.products;
  const config = statusConfig[order.status] || { label: order.status, variant: "default" };
  const isCounter = order.type === "COUNTER";
  const hasIssuedItems = order.products.some((p) => p.isIssued);
  const allItemsIssued = order.products.length > 0 && order.products.every((p) => p.isIssued);
  const isReadyToBill = (isCounter && order.status === "APPROVED" && allItemsIssued) || (!isCounter && order.status === "COMPLETED");

  const ACTION_CONFIRMATIONS: Record<string, { action: string; label: string; description: string; className?: string }> = {
    submit: { action: "submit", label: "Submit", description: "Are you sure you want to submit this Sales Order for approval?" },
    approve: {
      action: "approve",
      label: isCounter ? "Approve & Deduct" : "Approve & Reserve",
      description: isCounter
        ? "Are you sure you want to approve this Sales Order? This will immediately deduct inventory stock."
        : "Are you sure you want to approve this Sales Order? This will reserve inventory stock.",
      className: "bg-green-600 text-white hover:bg-green-700",
    },
    "start-work": { action: "start-work", label: "Start Work", description: "Are you sure you want to start work on this Sales Order?" },
    complete: { action: "complete", label: "Complete", description: "Are you sure you want to mark this Sales Order as completed?" },
    reopen: { action: "reopen", label: "Reopen", description: "Are you sure you want to reopen this Sales Order? It will return to In Progress." },
    cancel: { action: "cancel", label: "Cancel Order", description: "Are you sure you want to cancel this Sales Order? Reserved stock will be released.", className: "bg-destructive text-white hover:bg-destructive/90" },
    void: { action: "void", label: "Void Sale", description: "Are you sure you want to void this Sales Order? All issued items will be returned to inventory stock, and the order will be cancelled.", className: "bg-destructive text-white hover:bg-destructive/90" },
  };

  return (
    <div className="w-full h-full pl-4 pr-3 pb-4 flex flex-col gap-4 overflow-y-auto font-sans">
      <DataToolbar
        variant="detail"
        actions={
          <div className="flex items-center gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => navigate("/webapp/sales/sales-orders")} disabled={isSubmitting}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            <div className="ml-auto flex items-center gap-2">
              {order.status === "DRAFT" && (
                <Button size="sm" onClick={() => setConfirmAction(ACTION_CONFIRMATIONS.submit)} disabled={isSubmitting}>
                  <Send className="w-4 h-4 mr-1" />
                  Submit
                </Button>
              )}

              {order.status === "SUBMITTED" && (
                <Button size="sm" onClick={() => setConfirmAction(ACTION_CONFIRMATIONS.approve)} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  {isCounter ? "Approve & Deduct" : "Approve & Reserve"}
                </Button>
              )}

              {order.status === "APPROVED" && (
                <>
                  {!isCounter && (
                    <Button size="sm" onClick={() => setConfirmAction(ACTION_CONFIRMATIONS["start-work"])} disabled={isSubmitting}>
                      <Play className="w-4 h-4 mr-1" />
                      Start Work
                    </Button>
                  )}
                  {order.estimate_id && (
                    <Button variant="outline" size="sm" onClick={openEstimateItemsModal} disabled={isSubmitting}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Item
                    </Button>
                  )}
                </>
              )}

              {order.status === "IN_PROGRESS" && !isCounter && (
                <>
                  <Button size="sm" onClick={() => setConfirmAction(ACTION_CONFIRMATIONS.complete)} disabled={isSubmitting}>
                    <CircleCheck className="w-4 h-4 mr-1" />
                    Complete
                  </Button>
                  {order.estimate_id && (
                    <Button variant="outline" size="sm" onClick={openEstimateItemsModal} disabled={isSubmitting}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Item
                    </Button>
                  )}
                </>
              )}

              {order.status === "COMPLETED" && !isCounter && (
                <Button variant="outline" size="sm" onClick={() => setConfirmAction(ACTION_CONFIRMATIONS.reopen)} disabled={isSubmitting}>
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reopen
                </Button>
              )}

              {hasIssuedItems && ["APPROVED", "IN_PROGRESS", "COMPLETED"].includes(order.status) ? (
                <Button variant="destructive" size="sm" onClick={() => setConfirmAction(ACTION_CONFIRMATIONS.void)} disabled={isSubmitting}>
                  <XCircle className="w-4 h-4 mr-1" />
                  Void Sale
                </Button>
              ) : (
                !["DRAFT", "CANCELLED", "COMPLETED"].includes(order.status) && (
                  <Button variant="destructive" size="sm" onClick={() => setConfirmAction(ACTION_CONFIRMATIONS.cancel)} disabled={isSubmitting}>
                    <XCircle className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                )
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-[100]">
                  {order.status === "COMPLETED" && (
                    <DropdownMenuItem onClick={() => setConfirmAction(hasIssuedItems ? ACTION_CONFIRMATIONS.void : ACTION_CONFIRMATIONS.cancel)} className="text-destructive focus:text-destructive cursor-pointer">
                      <XCircle className="h-4 w-4 mr-2" /> {hasIssuedItems ? "Void Sale" : "Cancel"}
                    </DropdownMenuItem>
                  )}
                  {order.status === "DRAFT" && (
                    <DropdownMenuItem onClick={() => navigate(`/webapp/sales/sales-orders/${order.id}/edit`)}>
                      <Pencil className="h-4 w-4 mr-2" /> Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" /> Print PDF
                  </DropdownMenuItem>
                  {(order.status === "DRAFT" || order.status === "CANCELLED") && (
                    <DropdownMenuItem onClick={() => setConfirmArchive(true)} className="text-destructive focus:text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" /> Archive SO
                    </DropdownMenuItem>
                  )}
                  {order.archived && (
                    <DropdownMenuItem onClick={() => setConfirmForceDelete(true)} className="text-destructive focus:text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete Permanently
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
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
                <p className="font-semibold text-foreground">Customer Details</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <Label className="text-muted-foreground font-normal text-xs">Full Name</Label>
                <Input value={order.customer.name} readOnly />
              </div>
              <div>
                <Label className="text-muted-foreground font-normal text-xs">Address</Label>
                <Input value={order.customer.address} readOnly />
              </div>
              <div className="grid sm:grid-cols-2 gap-y-2 gap-x-4">
                <div>
                  <Label className="text-muted-foreground font-normal text-xs">Email Address</Label>
                  <Input value={order.customer.email} readOnly />
                </div>
                <div>
                  <Label className="text-muted-foreground font-normal text-xs">Phone Number</Label>
                  <Input value={order.customer.mobile} readOnly />
                </div>
                <div>
                  <Label className="text-muted-foreground font-normal text-xs">Landline</Label>
                  <Input value={order.customer.landline || "—"} readOnly />
                </div>
                <div>
                  <Label className="text-muted-foreground font-normal text-xs">Business Number</Label>
                  <Input value={order.customer.business || "—"} readOnly />
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
              {order.vehicle ? (
                <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="sm:col-span-2 grid lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-2">
                      <Label className="text-muted-foreground font-normal text-xs">Year / Make / Model</Label>
                      <Input
                        value={`${order.vehicle.year} ${order.vehicle.make} ${order.vehicle.model}`.trim()}
                        readOnly
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground font-normal text-xs">Variant</Label>
                      <Input value={order.vehicle.variant} readOnly />
                    </div>
                    <div>
                      <Label className="text-muted-foreground font-normal text-xs">Color</Label>
                      <Input value={order.vehicle.color} readOnly />
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground font-normal text-xs">Plate No.</Label>
                    <Input value={order.vehicle.plateNo} readOnly />
                  </div>
                  <div>
                    <Label className="text-muted-foreground font-normal text-xs">Engine No.</Label>
                    <Input value={order.vehicle.engineNo} readOnly />
                  </div>
                  <div>
                    <Label className="text-muted-foreground font-normal text-xs">Chassis No. (VIN)</Label>
                    <Input value={order.vehicle.vin} readOnly />
                  </div>
                  <div>
                    <Label className="text-muted-foreground font-normal text-xs">Registration No.</Label>
                    <Input value={order.vehicle.registrationNo} readOnly />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-muted-foreground font-normal text-xs">Mileage</Label>
                    <Input value={order.mileage ? `${order.mileage.toLocaleString()} km` : "Not Defined"} readOnly />
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-muted-foreground border border-dashed rounded-lg flex flex-col items-center justify-center gap-2">
                  <Car className="size-8 text-muted-foreground/50" />
                  <p className="text-sm font-medium">No Vehicle Linked</p>
                  <p className="text-xs text-muted-foreground/75">This is a standalone counter sale.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* PARTS TABLE + SUMMARY + ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PARTS TABLE */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-lg border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Box className="size-5 text-orange-500" />
                  <h2 className="text-sm font-semibold text-foreground">
                    Reserved Parts & Products
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {(order.status === "APPROVED" || order.status === "IN_PROGRESS" || order.status === "COMPLETED") && (
                    <>
                      {order.status !== "COMPLETED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 text-xs"
                          onClick={handleIssueItems}
                          disabled={isSubmitting || selectedItems.size === 0}
                        >
                          <PackageCheck className="h-3 w-3" /> Issue Selected
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1 text-xs"
                        onClick={openReturnModal}
                        disabled={isSubmitting || selectedItems.size === 0}
                      >
                        <PackageX className="h-3 w-3" /> Return Selected
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[420px] overflow-y-auto">
                  <Table className="[&_tr]:hover:!bg-transparent">
                    <TableHeader className="sticky top-0 z-10 bg-background">
                      <TableRow className="bg-muted/50 text-center">
                        {(order.status === "APPROVED" || order.status === "IN_PROGRESS") && (
                          <TableHead className="text-xs text-center w-[4%]">
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={order.products.filter(p => !p.isIssued && !p.needsOrdering && (p.quantityOnHand ?? 0) > 0).length > 0 && selectedItems.size === order.products.filter(p => !p.isIssued && !p.needsOrdering && (p.quantityOnHand ?? 0) > 0).length}
                              onChange={toggleAllItems}
                            />
                          </TableHead>
                        )}
                        <TableHead className="text-xs text-center w-[25%]">Item Name</TableHead>
                        <TableHead className="text-xs text-center w-[13%]">Part Number</TableHead>
                        <TableHead className="text-xs text-center w-[13%]">Stock Status</TableHead>
                        <TableHead className="text-xs text-center w-[10%]">Unit Price</TableHead>
                        <TableHead className="text-xs text-center w-[8%]">Quantity</TableHead>
                        <TableHead className="text-xs text-center w-[12%]">Amount</TableHead>
                        <TableHead className="text-xs text-center w-[12%]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((p) => {
                        const stockLabel =
                          p.quantityOnHand === null
                            ? null
                            : p.quantityOnHand <= 0
                            ? { text: "Out of Stock", cls: "text-red-600 bg-red-50 border-red-200" }
                            : { text: `In Stock (${p.quantityOnHand})`, cls: "text-green-600 bg-green-50 border-green-200" };
                        const canSelect = (order.status === "APPROVED" || order.status === "IN_PROGRESS") && !p.isIssued && !p.needsOrdering && (p.quantityOnHand ?? 0) > 0;
                        const canSelectReturn = (order.status === "IN_PROGRESS" || order.status === "COMPLETED") && p.isIssued && (p.qty > p.quantityReturned);
                        return (
                        <TableRow key={p.id} className="hover:bg-transparent">
                          {(order.status === "APPROVED" || order.status === "IN_PROGRESS" || order.status === "COMPLETED") && (
                            <TableCell className="text-center">
                              <input
                                type="checkbox"
                                className="rounded"
                                checked={selectedItems.has(p.id)}
                                disabled={!canSelect && !canSelectReturn}
                                onChange={() => toggleItemSelection(p.id)}
                              />
                            </TableCell>
                          )}
                          <TableCell className="text-left px-4">
                            <span className="font-medium">{p.manufacturer ? `${p.manufacturer} — ` : ""}{p.name}</span>
                          </TableCell>
                          <TableCell className="text-center font-mono font-medium text-xs text-muted-foreground">
                            {p.sku}
                          </TableCell>
                          <TableCell className="text-center">
                            {stockLabel ? (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${stockLabel.cls}`}>
                                {stockLabel.text}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center font-medium">{peso(p.price)}</TableCell>
                          <TableCell className="text-center">
                            <div className="font-semibold">{p.qty}</div>
                            {p.quantityReturned > 0 && (
                              <div className="text-[10px] text-rose-600 font-medium">Returned: {p.quantityReturned}</div>
                            )}
                          </TableCell>
                          <TableCell className="text-center font-bold text-primary">{peso(p.amount)}</TableCell>
                          <TableCell className="text-center">
                            {p.isIssued ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                Issued
                              </span>
                            ) : p.quantityReturned > 0 && p.quantityReturned === p.qty ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                Returned
                              </span>
                            ) : p.needsOrdering ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                To Order
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
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

          {/* RIGHT COLUMN: SUMMARY + ACTIVITY */}
          <div className="lg:col-span-1 space-y-4">
            {/* ORDER SUMMARY */}
            <Card className="shadow-lg border-primary/20">
              <CardHeader className="bg-primary/5 py-4 rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="size-5 text-blue-900" />
                  <h2 className="font-semibold text-foreground">Order Summary</h2>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4 text-sm">
                <div className="bg-primary/10 p-3 rounded-lg border border-primary/20 space-y-2">
                  <div className="flex justify-between items-end text-primary">
                    <span className="text-xs font-bold uppercase">Total Parts Cost</span>
                    <span className="text-2xl font-bold tracking-wide">{peso(order.total)}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Status</span>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Type</span>
                    <Badge variant={isCounter ? "outline" : "default"} className={isCounter ? "bg-violet-50 text-violet-700 border-violet-200" : "bg-sky-50 text-sky-700 border-sky-200"}>
                      {isCounter ? "Counter Sale" : "Repair Order"}
                    </Badge>
                  </div>

                  {isReadyToBill && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-3 rounded-lg flex flex-col gap-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-800 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1">
                          <CheckCircle2 className="size-3.5" />
                          Ready for Invoicing
                        </span>
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 text-[10px] px-1.5 py-0.5">
                          To Bill
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/webapp/sales/billing/create?import_so=${order.id}`)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs h-8 flex items-center justify-center gap-1 mt-1"
                      >
                        <Import className="size-3.5 mr-1" />
                        Create Billing Statement
                      </Button>
                    </div>
                  )}

                  {order.estimate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimate Ref.</span>
                      <span className="font-mono text-xs font-medium text-foreground">
                        {order.estimate.estimate_number || order.estimate.id?.substring(0, 8).toUpperCase() || "—"}
                      </span>
                    </div>
                  )}

                  {order.remarks && (
                    <div>
                      <Label className="text-muted-foreground text-xs font-semibold">Notes & Remarks</Label>
                      <p className="text-muted-foreground italic bg-muted/20 p-2.5 rounded border border-border/50 mt-1">
                        {order.remarks}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ACTIVITY CARD */}
            <Card>
              <CardHeader className="bg-primary/5 py-4 rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="size-5 text-blue-900" />
                  <h2 className="font-semibold text-foreground">Activity</h2>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="font-medium">{order.createdByName || "System"}</p>
                    {order.createdAt && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>

                {order.submittedByName && (
                  <div className="flex items-start gap-3">
                    <Send className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Submitted</p>
                      <p className="font-medium">{order.submittedByName}</p>
                      {order.submittedAt && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.submittedAt).toLocaleDateString("en-PH", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {order.approvedByName && (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Approved</p>
                      <p className="font-medium">{order.approvedByName}</p>
                      {order.approvedAt && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.approvedAt).toLocaleDateString("en-PH", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {order.cancelledByName && (
                  <div className="flex items-start gap-3">
                    <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Cancelled</p>
                      <p className="font-medium">{order.cancelledByName}</p>
                      {order.cancelledAt && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.cancelledAt).toLocaleDateString("en-PH", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {order.completedAt && (
                  <div className="flex items-start gap-3">
                    <CircleCheck className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Completed</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.completedAt).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => { if (!open) setConfirmAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm {confirmAction?.label}</AlertDialogTitle>
            <AlertDialogDescription>{confirmAction?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={confirmAction?.className || "bg-blue-600 text-white hover:bg-blue-700"}
              onClick={() => { if (confirmAction) handleAction(confirmAction.action); setConfirmAction(null); }}
            >
              {confirmAction?.label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Dialog */}
      <AlertDialog open={confirmArchive} onOpenChange={setConfirmArchive}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Sales Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive {order.so_number}? It will be hidden from the active list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={archiveOrder}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Force Delete Dialog */}
      <AlertDialog open={confirmForceDelete} onOpenChange={setConfirmForceDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Sales Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete {order.so_number}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={forceDeleteOrder}>
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PDF Preview Dialog */}
      <Dialog open={pdfDialogOpen} onOpenChange={(open) => { if (!open) handleClosePdf(); }}>
        <DialogContent className="max-w-4xl h-[85vh] p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>SO Preview — {order.so_number}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex items-center justify-center" style={{ height: "calc(85vh - 70px)" }}>
            {pdfBlobUrl ? (
              <iframe
                src={pdfBlobUrl}
                className="w-full h-full"
                title="Sales Order PDF"
              />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Generating PDF...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Estimate Items Modal */}
      <Dialog open={estimateItemsModalOpen} onOpenChange={setEstimateItemsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add Items from Estimate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {isLoadingEstimateItems ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : availableEstimateItems.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground border border-dashed rounded-lg">
                <p className="text-sm font-medium">No available items</p>
                <p className="text-xs mt-1">All estimate items are already on this Sales Order.</p>
              </div>
            ) : (
              <>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[5%] text-center">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={selectedEstimateItems.size === availableEstimateItems.length}
                            onChange={() => {
                              if (selectedEstimateItems.size === availableEstimateItems.length) {
                                setSelectedEstimateItems(new Set());
                              } else {
                                setSelectedEstimateItems(new Set(availableEstimateItems.map((i) => i.id)));
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead className="text-xs">Product</TableHead>
                        <TableHead className="text-xs text-center w-[10%]">Part No.</TableHead>
                        <TableHead className="text-xs text-center w-[10%]">Qty</TableHead>
                        <TableHead className="text-xs text-center w-[15%]">Unit Price</TableHead>
                        <TableHead className="text-xs text-center w-[12%]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableEstimateItems.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/30">
                          <TableCell className="text-center">
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={selectedEstimateItems.has(item.id)}
                              onChange={() => toggleEstimateItemSelection(item.id)}
                            />
                          </TableCell>
                          <TableCell className="text-left">
                            <span className="font-medium">
                              {item.manufacturer ? `${item.manufacturer} — ` : ""}{item.product_name}
                            </span>
                          </TableCell>
                          <TableCell className="text-center font-mono text-xs text-muted-foreground">{item.sku}</TableCell>
                          <TableCell className="text-center font-semibold">{item.quantity}</TableCell>
                          <TableCell className="text-center font-medium">{peso(item.unit_price)}</TableCell>
                          <TableCell className="text-center">
                            {item.needs_ordering ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                To Order
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setEstimateItemsModalOpen(false)}>Cancel</Button>
                  <Button
                    size="sm"
                    onClick={handleAddEstimateItems}
                    disabled={isAddingItems || selectedEstimateItems.size === 0}
                  >
                    {isAddingItems ? "Adding..." : `Add ${selectedEstimateItems.size} Item(s)`}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Return Parts Modal */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Return Issued Parts & Products</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">
              Select the quantities you want to return to inventory. Unreturned quantities will remain issued.
            </p>
            <div className="border rounded-lg overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs">Product Name</TableHead>
                    <TableHead className="text-xs text-center w-[30%]">Qty to Return</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.products
                    .filter((p) => selectedItems.has(p.id))
                    .map((p) => {
                      const maxQty = p.qty - p.quantityReturned;
                      const currentVal = returnQuantities[p.id] ?? maxQty;
                      return (
                        <TableRow key={p.id} className="hover:bg-transparent">
                          <TableCell className="text-left font-medium text-xs">
                            {p.name}
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              Issued: {maxQty}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              min={1}
                              max={maxQty}
                              value={currentVal}
                              onChange={(e) => {
                                const val = Math.max(1, Math.min(maxQty, parseInt(e.target.value, 10) || 0));
                                setReturnQuantities((prev) => ({
                                  ...prev,
                                  [p.id]: val,
                                }));
                              }}
                              className="h-8 text-center text-xs font-semibold"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setReturnDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white font-medium"
                onClick={submitReturnItems}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Returning..." : "Confirm Return"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesOrderDetails;
