import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
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
  Fuel,
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
  PackageCheck,
  PackageX,
  Plus,
  AlertTriangle,
} from "lucide-react";
import DataToolbar from "@/components/DataToolbar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
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
  customName?: string | null;
  isLinked?: boolean;
  manufacturer: string;
  sku: string;
  taxCode: string | null;
  qty: number;
  price: number;
  amount: number;
  needsOrdering: boolean;
  quantityOnHand: number | null;
  reservedQuantity: number | null;
  isIssued: boolean;
  quantityIssued: number;
  quantityReturned: number;
  isSpol: boolean;
  categoryName?: string | null;
  isTentative?: boolean;
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
  completedByName?: string;
  startedByName?: string;
  submittedAt?: string;
  approvedAt?: string;
  cancelledAt?: string;
  startedAt?: string;
  completedAt?: string;
  archived?: boolean;
  estimate_id?: string;
  estimate?: { id: string; estimate_number?: string };
  has_tentative_items?: boolean;
  tentative_count?: number;
  tentative_estimate_items?: Array<{
    id: string;
    product_id: string;
    product_name: string;
    part_number: string;
    manufacturer: string;
    quantity: number;
    unit_price: number;
    is_sundries: boolean;
  }>;
  job_order?: { id: string; jo_number: string; status: string } | null;
  billing_statement?: { id: string; bill_number?: string; status?: string } | null;
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
  const [selectedParts, setSelectedParts] = useState<Set<string>>(new Set());
  const [selectedSpol, setSelectedSpol] = useState<Set<string>>(new Set());
  const [estimateItemsModalOpen, setEstimateItemsModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkingItemId, setLinkingItemId] = useState<string | null>(null);
  const [linkSearchQuery, setLinkSearchQuery] = useState("");
  const [linkProducts, setLinkProducts] = useState<any[]>([]);
  const [linkConfirmProduct, setLinkConfirmProduct] = useState<any>(null);
  const [availableEstimateItems, setAvailableEstimateItems] = useState<any[]>([]);
  const [selectedEstimateItems, setSelectedEstimateItems] = useState<Set<string>>(new Set());
  const [isLoadingEstimateItems, setIsLoadingEstimateItems] = useState(false);
  const [isAddingItems, setIsAddingItems] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnType, setReturnType] = useState<"parts" | "spol">("parts");
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
        const isSundries = product?.category?.name === 'Sundries';
        let quantityOnHand: number | null = null;
        let reservedQuantity: number | null = null;
        if (!isSundries) {
          if (product?.inventory_rows?.length) {
            const total = product.inventory_rows.reduce(
              (sum: number, row: any) => sum + Number(row.quantity_on_hand ?? 0),
              0
            );
            quantityOnHand = total;
            reservedQuantity = product.inventory_rows.reduce(
              (sum: number, row: any) => sum + Number(row.reserved_quantity ?? 0),
              0
            );
          } else if (product?.product_suppliers?.length) {
            const total = product.product_suppliers.reduce(
              (sum: number, ps: any) => sum + Number(ps.inventory?.quantity_on_hand ?? 0),
              0
            );
            quantityOnHand = total;
            reservedQuantity = product.product_suppliers.reduce(
              (sum: number, ps: any) => sum + Number(ps.inventory?.reserved_quantity ?? 0),
              0
            );
          }
        }
        return {
          id: i.id,
          name: i.custom_name || product?.name || "Unknown Product",
          customName: i.custom_name || null,
          isLinked: Boolean(i.custom_name) && Boolean(i.ProductID),
          manufacturer: product?.manufacturer?.name || "",
          sku: product?.part_number || product?.SKU || "—",
          taxCode: i.TaxAtSale
            ? (i.TaxAtSale === 'NON_VAT' ? 'Non-VAT' : 'VAT')
            : (product?.product_suppliers?.[0]?.is_vat ? 'VAT' : 'Non-VAT'),
          qty: Number(i.quantity) || 0,
          price: Number(i.UnitPrice) || 0,
          amount: Number(i.SubTotal) || 0,
          needsOrdering: Boolean(i.needs_ordering),
          quantityOnHand,
          reservedQuantity,
          isIssued: Boolean(i.is_issued),
          quantityIssued: Number(i.quantity_issued) || 0,
          quantityReturned: Number(i.quantity_returned) || 0,
          isSpol: Boolean(product?.category?.is_spol),
          categoryName: product?.category?.name || null,
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
        archived: !!o.deleted_at,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
        createdByName: o.createdByName,
        submittedByName: o.submittedByName,
        approvedByName: o.approvedByName,
        cancelledByName: o.cancelledByName,
        completedByName: o.completedByName,
        startedByName: o.startedByName,
        submittedAt: o.submitted_at,
        approvedAt: o.approved_at,
        cancelledAt: o.cancelled_at,
        startedAt: o.started_at,
        completedAt: o.completed_at,
        estimate_id: o.estimate_id || null,
        estimate: o.estimate || null,
        has_tentative_items: o.has_tentative_items || false,
        tentative_count: o.tentative_count || 0,
        tentative_estimate_items: o.tentative_estimate_items || [],
        job_order: o.job_order || null,
        billing_statement: o.billing_statement ? {
          id: o.billing_statement.id,
          bill_number: o.billing_statement.bill_number,
          status: o.billing_statement.status,
        } : null,
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

  // Clear selections when order data changes (e.g. after estimate edit syncs quantity/issued changes)
  useEffect(() => {
    setSelectedParts(new Set());
    setSelectedSpol(new Set());
  }, [order]);

  const getNeedsOrderingReason = (p: { quantityOnHand: number | null; reservedQuantity: number | null; qty: number }): string => {
    const onHand = p.quantityOnHand ?? 0;
    const reserved = p.reservedQuantity ?? 0;
    const available = onHand - reserved;
    if (onHand === 0) return "No stock on hand";
    if (available <= 0) return "All stock reserved by other orders";
    return `Insufficient: ${available} available, ${p.qty} needed`;
  };

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

  const handleIssueItems = async (type: "parts" | "spol") => {
    const selected = type === "parts" ? selectedParts : selectedSpol;
    if (!order || selected.size === 0) return;
    try {
      setIsSubmitting(true);
      await api.post(`/sales-orders/${order.id}/issue`, {
        item_ids: Array.from(selected),
      });
      toast.success("Items issued successfully. Stock has been deducted.");
      if (type === "parts") setSelectedParts(new Set());
      else setSelectedSpol(new Set());
      fetchOrderDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to issue items");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReturnModal = (type: "parts" | "spol") => {
    if (!order) return;
    const selected = type === "parts" ? selectedParts : selectedSpol;
    const initialQtys: Record<string, number> = {};
    order.products.forEach((p) => {
      if (selected.has(p.id)) {
        initialQtys[p.id] = p.qty - p.quantityReturned;
      }
    });
    setReturnQuantities(initialQtys);
    setReturnType(type);
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
      if (returnType === "parts") setSelectedParts(new Set());
      else setSelectedSpol(new Set());
      setReturnDialogOpen(false);
      fetchOrderDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to return items");
    } finally {
      setIsSubmitting(false);
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
      setEstimateItemsModalOpen(false);
      toast.success(`${selectedEstimateItems.size} item(s) added from estimate.`);
      fetchOrderDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add items");
    } finally {
      setIsAddingItems(false);
    }
  };

  const openLinkModal = async (itemId: string) => {
    setLinkingItemId(itemId);
    setLinkSearchQuery("");
    setLinkConfirmProduct(null);
    setLinkModalOpen(true);
    try {
      const res = await api.get("/products");
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setLinkProducts(data);
    } catch {
      setLinkProducts([]);
    }
  };

  const onLinkProductClick = (product: any) => {
    if (!order || !linkingItemId) return;
    const item = order.products.find(p => p.id === linkingItemId);
    const customPrice = item?.price ?? 0;
    const inventoryPrice = Number(product.preferred_selling_price ?? product.selling_price ?? 0);

    // If custom price is 0, or prices match, link directly
    if (customPrice <= 0 || customPrice === inventoryPrice) {
      handleLinkItem(product.id, customPrice <= 0 ? undefined : true);
    } else {
      // Prices differ — show confirmation
      setLinkConfirmProduct(product);
    }
  };

  const handleLinkItem = async (productId: string, useCustomPrice?: boolean) => {
    if (!order || !linkingItemId) return;
    try {
      const payload: any = { product_id: productId };
      if (useCustomPrice !== undefined) {
        payload.use_custom_price = useCustomPrice;
      }
      await api.post(`/sales-orders/${order.id}/items/${linkingItemId}/link`, payload);
      toast.success("Item linked to inventory product.");
      setLinkModalOpen(false);
      setLinkingItemId(null);
      fetchOrderDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to link item");
    }
  };

  const handleUnlinkItem = async (itemId: string) => {
    if (!order) return;
    try {
      await api.post(`/sales-orders/${order.id}/items/${itemId}/unlink`);
      toast.success("Item unlinked.");
      fetchOrderDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to unlink item");
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

  const items = [
    ...order.products,
    ...(order.tentative_estimate_items || []).map((ti) => ({
      id: `tentative-${ti.id}`,
      name: ti.product_name,
      customName: null as string | null,
      isLinked: false,
      manufacturer: ti.manufacturer,
      sku: ti.part_number,
      taxCode: null as string | null,
      qty: ti.quantity,
      price: ti.unit_price,
      amount: ti.quantity * ti.unit_price,
      needsOrdering: false,
      quantityOnHand: null as number | null,
      reservedQuantity: null as number | null,
      isIssued: false,
      quantityIssued: 0,
      quantityReturned: 0,
      isSpol: ti.is_sundries,
      categoryName: ti.is_sundries ? "Sundries" : null,
      isTentative: true,
    })),
  ];
  const config = statusConfig[order.status] || { label: order.status, variant: "default" };
  const isCounter = order.type === "COUNTER";
  const hasIssuedItems = order.products.some((p) => p.isIssued);
  const isReadyToBill = (isCounter && order.status === "APPROVED") || (!isCounter && order.status === "COMPLETED");
  const isSundries = (p: Product) => p.isSpol && p.categoryName?.toLowerCase() === "sundries";
  const canIssueItem = (p: Product) => !p.isTentative && p.quantityIssued < p.qty && !p.needsOrdering && !isSundries(p);
  const canReturnItem = (p: Product) => p.isIssued && p.quantityReturned < p.quantityIssued;

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
    complete: { action: "complete", label: "Complete", description: "Are you sure you want to mark this Sales Order as completed?" },
    reopen: { action: "reopen", label: "Reopen", description: "Are you sure you want to reopen this Sales Order?" },
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

              {(order.status === "APPROVED" || order.status === "IN_PROGRESS") && (
                <>
                  {order.estimate_id && (
                    <Button variant="outline" size="sm" onClick={openEstimateItemsModal} disabled={isSubmitting}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Item
                    </Button>
                  )}
                </>
              )}

              {order.status === "IN_PROGRESS" && !isCounter && !order.job_order && (
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

              {order.status === "CANCELLED" && !isCounter && (
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
                    Parts
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {!isCounter && (order.status === "APPROVED" || order.status === "IN_PROGRESS" || order.status === "COMPLETED") && (
                    <>
                      {order.status !== "COMPLETED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 text-xs"
                          onClick={() => handleIssueItems("parts")}
                          disabled={isSubmitting || selectedParts.size === 0 || Array.from(selectedParts).every(id => !canIssueItem(order.products.find(p => p.id === id)!))}
                        >
                          <PackageCheck className="h-3 w-3" /> Issue Selected
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1 text-xs"
                        onClick={() => openReturnModal("parts")}
                        disabled={isSubmitting || selectedParts.size === 0}
                      >
                        <PackageX className="h-3 w-3" /> Return Selected
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[420px] overflow-y-auto">
                  <Table className="table-fixed w-full min-w-[800px]">
                    <TableHeader className="sticky top-0 z-10 bg-background">
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[4%] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-input text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                            checked={order.products.filter(p => !p.isSpol && (canIssueItem(p) || canReturnItem(p))).length > 0 && order.products.filter(p => !p.isSpol && (canIssueItem(p) || canReturnItem(p))).every(p => selectedParts.has(p.id))}
                            onChange={(e) => {
                              const selectable = order.products.filter(p => !p.isSpol && (canIssueItem(p) || canReturnItem(p)));
                              if (e.target.checked) {
                                setSelectedParts(new Set(selectable.map(p => p.id)));
                              } else {
                                setSelectedParts(new Set());
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead className="text-xs text-center w-[22%]">Item Name</TableHead>
                        <TableHead className="text-xs text-center w-[12%]">Part Number</TableHead>
                        <TableHead className="text-xs text-center w-[10%]">Tax Code</TableHead>
                        <TableHead className="text-xs text-center w-[12%]">Stock Status</TableHead>
                        <TableHead className="text-xs text-center w-[10%]">Unit Price</TableHead>
                        <TableHead className="text-xs text-center w-[8%]">Quantity</TableHead>
                        <TableHead className="text-xs text-center w-[12%]">Amount</TableHead>
                        <TableHead className="text-xs text-center w-[12%]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.filter(p => !p.isSpol).length > 0 ? (
                        items.filter(p => !p.isSpol).map((p) => {
                          const stockLabel =
                            p.quantityOnHand === null
                              ? null
                              : p.quantityOnHand <= 0
                                ? { text: "Out of Stock", cls: "text-red-600 bg-red-50 border-red-200" }
                                : { text: `In Stock (${p.quantityOnHand})`, cls: "text-green-600 bg-green-50 border-green-200" };
                          const canSelect = !isCounter && (order.status === "APPROVED" || order.status === "IN_PROGRESS") && canIssueItem(p) && (p.quantityOnHand ?? 0) > 0;
                          const canSelectReturn = (order.status === "IN_PROGRESS" || order.status === "COMPLETED") && !isCounter && canReturnItem(p);
                          return (
                            <TableRow key={p.id} className={`hover:bg-transparent ${p.isTentative ? 'opacity-60 bg-amber-50/30 border-l-2 border-l-amber-400' : ''}`}>
                              {!isCounter && (order.status === "APPROVED" || order.status === "IN_PROGRESS" || order.status === "COMPLETED") && (
                                <TableCell className="text-center">
                                  {!p.isTentative ? (
                                    <input
                                      type="checkbox"
                                      className="rounded"
                                      checked={selectedParts.has(p.id)}
                                      disabled={!canSelect && !canSelectReturn}
                                      onChange={() => setSelectedParts(prev => {
                                        const next = new Set(prev);
                                        if (next.has(p.id)) next.delete(p.id);
                                        else next.add(p.id);
                                        return next;
                                      })}
                                    />
                                  ) : (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="inline-flex items-center justify-center w-4 h-4">
                                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent side="right" sideOffset={4}>
                                        <p className="text-xs">Tentative — click "Add Item" to add.</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </TableCell>
                              )}
                              <TableCell className="text-left px-4">
                                <span className="font-medium">{p.manufacturer ? `${p.manufacturer} — ` : ""}{p.name}</span>
                                {p.customName && (
                                  <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded ml-1.5">Custom</span>
                                )}
                                {p.customName && !p.isIssued && (order.status === "APPROVED" || order.status === "IN_PROGRESS") && (
                                  p.isLinked ? (
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="h-5 p-0 ml-2 text-[10px] text-destructive hover:text-destructive"
                                      onClick={() => handleUnlinkItem(p.id)}
                                    >
                                      Unlink
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="h-5 p-0 ml-2 text-[10px]"
                                      onClick={() => openLinkModal(p.id)}
                                    >
                                      Link to Inventory
                                    </Button>
                                  )
                                )}
                              </TableCell>
                              <TableCell className="text-center font-mono font-medium text-xs text-muted-foreground">
                                {p.sku}
                              </TableCell>
                              <TableCell className="text-center">
                                {p.taxCode ? (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${p.taxCode === 'VAT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                                    {p.taxCode}
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
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
                                {p.isTentative ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 cursor-help">
                                        Tentative
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="left" sideOffset={4}>
                                      <p className="text-xs">Tentative — click &quot;Add Item&quot; to add.</p>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : p.isIssued ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                    Issued
                                  </span>
                                ) : p.quantityReturned > 0 && p.quantityReturned === p.qty ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                    Returned
                                  </span>
                                ) : p.needsOrdering ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 cursor-help">
                                        To Order
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {getNeedsOrderingReason(p)}
                                    </TooltipContent>
                                  </Tooltip>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
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
            <div className="rounded-lg border border-border bg-card p-5 space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fuel className="size-5 text-green-600" />
                  <h2 className="text-sm font-semibold text-foreground">
                    Supplies, Petrol, Oils, and Lubricants
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {!isCounter && (order.status === "APPROVED" || order.status === "IN_PROGRESS" || order.status === "COMPLETED") && (
                    <>
                      {order.status !== "COMPLETED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 text-xs"
                          onClick={() => handleIssueItems("spol")}
                          disabled={isSubmitting || selectedSpol.size === 0 || Array.from(selectedSpol).every(id => !canIssueItem(order.products.find(p => p.id === id)!))}
                        >
                          <PackageCheck className="h-3 w-3" /> Issue Selected
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1 text-xs"
                        onClick={() => openReturnModal("spol")}
                        disabled={isSubmitting || selectedSpol.size === 0}
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
                        {!isCounter && (order.status === "APPROVED" || order.status === "IN_PROGRESS" || order.status === "COMPLETED") && (
                          <TableHead className="text-xs text-center w-[4%]">
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={
                                order.products.filter(p => p.isSpol && (canIssueItem(p) || canReturnItem(p))).length > 0 &&
                                order.products.filter(p => p.isSpol && (canIssueItem(p) || canReturnItem(p))).every(p => selectedSpol.has(p.id))
                              }
                              onChange={() => {
                                const selectables = order.products.filter(p => p.isSpol && (canIssueItem(p) || canReturnItem(p)));
                                const allSelected = selectables.length > 0 && selectables.every(p => selectedSpol.has(p.id));
                                setSelectedSpol(prev => {
                                  const next = new Set(prev);
                                  if (allSelected) {
                                    selectables.forEach(p => next.delete(p.id));
                                  } else {
                                    selectables.forEach(p => next.add(p.id));
                                  }
                                  return next;
                                });
                              }}
                            />
                          </TableHead>
                        )}
                        <TableHead className="text-xs text-center w-[22%]">Item Name</TableHead>
                        <TableHead className="text-xs text-center w-[12%]">Part Number</TableHead>
                        <TableHead className="text-xs text-center w-[10%]">Tax Code</TableHead>
                        <TableHead className="text-xs text-center w-[12%]">Stock Status</TableHead>
                        <TableHead className="text-xs text-center w-[10%]">Unit Price</TableHead>
                        <TableHead className="text-xs text-center w-[8%]">Quantity</TableHead>
                        <TableHead className="text-xs text-center w-[12%]">Amount</TableHead>
                        <TableHead className="text-xs text-center w-[12%]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.filter(p => p.isSpol).length > 0 ? (
                        items.filter(p => p.isSpol).map((p) => {
                          const isSundriesItem = p.categoryName === 'Sundries';
                          const stockLabel = isSundriesItem
                            ? { text: "Sundries", cls: "bg-purple-50 text-purple-600 border-purple-200" }
                            : p.quantityOnHand === null
                              ? null
                              : p.quantityOnHand <= 0
                                ? { text: "Out of Stock", cls: "text-red-600 bg-red-50 border-red-200" }
                                : { text: `In Stock (${p.quantityOnHand})`, cls: "text-green-600 bg-green-50 border-green-200" };
                          const canSelect = !isCounter && (order.status === "APPROVED" || order.status === "IN_PROGRESS") && canIssueItem(p) && (p.quantityOnHand ?? 0) > 0;
                          const canSelectReturn = (order.status === "IN_PROGRESS" || order.status === "COMPLETED") && !isCounter && canReturnItem(p);
                          return (
                            <TableRow key={p.id} className="hover:bg-transparent">
                              {!isCounter && (order.status === "APPROVED" || order.status === "IN_PROGRESS" || order.status === "COMPLETED") && (
                                <TableCell className="text-center">
                                  <input
                                    type="checkbox"
                                    className="rounded"
                                    checked={selectedSpol.has(p.id)}
                                    disabled={!canSelect && !canSelectReturn}
                                    onChange={() => setSelectedSpol(prev => {
                                      const next = new Set(prev);
                                      if (next.has(p.id)) next.delete(p.id);
                                      else next.add(p.id);
                                      return next;
                                    })}
                                  />
                                </TableCell>
                              )}
                              <TableCell className="text-left px-4">
                                <span className="font-medium">{p.manufacturer ? `${p.manufacturer} — ` : ""}{p.name}</span>
                                {p.customName && (
                                  <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded ml-1.5">Custom</span>
                                )}
                                {p.customName && !p.isIssued && (order.status === "APPROVED" || order.status === "IN_PROGRESS") && (
                                  p.isLinked ? (
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="h-5 p-0 ml-2 text-[10px] text-destructive hover:text-destructive"
                                      onClick={() => handleUnlinkItem(p.id)}
                                    >
                                      Unlink
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="h-5 p-0 ml-2 text-[10px]"
                                      onClick={() => openLinkModal(p.id)}
                                    >
                                      Link to Inventory
                                    </Button>
                                  )
                                )}
                              </TableCell>
                              <TableCell className="text-center font-mono font-medium text-xs text-muted-foreground">
                                {p.sku}
                              </TableCell>
                              <TableCell className="text-center">
                                {p.taxCode ? (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${p.taxCode === 'VAT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                                    {p.taxCode}
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
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
                                {p.isTentative ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 cursor-help">
                                        Tentative
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="left" sideOffset={4}>
                                      <p className="text-xs">Tentative — click &quot;Add Item&quot; to add.</p>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : p.isIssued ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                    Issued
                                  </span>
                                ) : p.quantityReturned > 0 && p.quantityReturned === p.qty ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                    Returned
                                  </span>
                                ) : p.needsOrdering ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 cursor-help">
                                        To Order
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {getNeedsOrderingReason(p)}
                                    </TooltipContent>
                                  </Tooltip>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
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

                  {isReadyToBill && order.billing_statement && (
                    <div className={cn(
                      "p-3 rounded-lg flex flex-col gap-2 mt-2 border",
                      order.billing_statement.status === "Paid"
                        ? "bg-blue-50/50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/40"
                        : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50"
                    )}>
                      <div className="flex justify-between items-center">
                        <span className={cn(
                          "font-semibold text-xs flex items-center gap-1",
                          order.billing_statement.status === "Paid" ? "text-blue-800 dark:text-blue-400" : "text-emerald-800 dark:text-emerald-400"
                        )}>
                          <CheckCircle2 className="size-3.5" />
                          {order.billing_statement.status === "Paid" ? "Sales Paid" : "Ready for Invoicing"}
                        </span>
                        <Badge className={cn(
                          "text-white border-0 text-[10px] px-1.5 py-0.5",
                          order.billing_statement.status === "Paid" ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"
                        )}>
                          {order.billing_statement.status === "Paid" ? "Billed" : "For Billing"}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          navigate(`/webapp/sales/billing/${order.billing_statement!.id}`);
                        }}
                        className={cn(
                          "w-full text-white font-medium text-xs h-8 flex items-center justify-center gap-1 mt-1 border-0",
                          order.billing_statement.status === "Paid" ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"
                        )}
                      >
                        <FileText className="size-3.5 mr-1" />
                        View Billing Statement
                      </Button>
                    </div>
                  )}

                  {order.estimate && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Estimate Ref.</span>
                      <span
                        className="font-mono text-xs font-medium text-primary cursor-pointer hover:underline"
                        onClick={() => navigate(`/webapp/sales/estimates/${order.estimate!.id}`)}
                      >
                        {order.estimate.estimate_number || "—"}
                      </span>
                    </div>
                  )}

                  {order.job_order && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Job Order</span>
                      <span
                        className="font-mono text-xs font-medium text-primary cursor-pointer hover:underline"
                        onClick={() => navigate(`/webapp/services/job-orders/${order.job_order!.id}`)}
                      >
                        {order.job_order.jo_number}
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

                {order.startedByName && (
                  <div className="flex items-start gap-3">
                    <Play className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Started</p>
                      <p className="font-medium">{order.startedByName}</p>
                      {order.startedAt && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.startedAt).toLocaleDateString("en-PH", {
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
                      <p className="text-xs text-muted-foreground">Completed{order.completedByName ? ` by ${order.completedByName}` : ""}</p>
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
                        <TableHead className="text-xs text-center w-[8%]">Qty</TableHead>
                        <TableHead className="text-xs text-center w-[13%]">Unit Price</TableHead>
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
                          <TableCell className="text-center font-mono text-xs text-muted-foreground">{item.sku || "—"}</TableCell>
                          <TableCell className="text-center font-semibold">{item.quantity}</TableCell>
                          <TableCell className="text-center font-medium">{peso(item.unit_price)}</TableCell>
                          <TableCell className="text-center">
                            {item.needs_ordering ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                To Order
                              </span>
                            ) : item.category_name?.toLowerCase() === "sundries" ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                Sundries
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

      {/* Link Custom Item to Inventory Modal */}
      <Dialog open={linkModalOpen} onOpenChange={(open) => { if (!open) { setLinkConfirmProduct(null); } setLinkModalOpen(open); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Link to Inventory
              {linkingItemId && (() => {
                const item = order?.products.find(p => p.id === linkingItemId);
                return item ? <span className="text-muted-foreground font-normal ml-2">— {item.customName || item.name}</span> : null;
              })()}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {linkConfirmProduct ? (
              // Price confirmation step
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This item has a different price than the inventory product.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Custom Price</div>
                    <div className="text-lg font-bold">{peso(order?.products.find(p => p.id === linkingItemId)?.price ?? 0)}</div>
                  </div>
                  <div className="border rounded-lg p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Inventory Price</div>
                    <div className="text-lg font-bold">{peso(Number(linkConfirmProduct.preferred_selling_price ?? 0))}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleLinkItem(linkConfirmProduct.id, true)}
                  >
                    Use Custom Price
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleLinkItem(linkConfirmProduct.id, false)}
                  >
                    Use Inventory Price
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => setLinkConfirmProduct(null)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              // Product list
              <>
                <Input
                  placeholder="Filter by name, SKU, or manufacturer..."
                  value={linkSearchQuery}
                  onChange={(e) => setLinkSearchQuery(e.target.value)}
                  autoFocus
                />
                {(() => {
                  const filtered = linkProducts.filter((p: any) => {
                    const q = linkSearchQuery.toLowerCase();
                    if (!q) return true;
                    return p.name?.toLowerCase().includes(q)
                      || (p.sku || p.SKU || "").toLowerCase().includes(q)
                      || (p.manufacturer_name || "").toLowerCase().includes(q);
                  });
                  return filtered.length > 0 ? (
                    <div className="border rounded-lg max-h-72 overflow-y-auto">
                      {filtered.map((p: any) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between px-3 py-2 hover:bg-muted cursor-pointer border-b last:border-b-0"
                          onClick={() => onLinkProductClick(p)}
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{p.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {p.sku || p.SKU || "—"} · {p.manufacturer_name || "—"}
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            {p.preferred_selling_price != null && (
                              <div className="text-xs font-medium">₱{Number(p.preferred_selling_price).toLocaleString()}</div>
                            )}
                            <div className="text-[10px]">
                              {p.quantity_on_hand != null ? (
                                p.quantity_on_hand > 0 ? (
                                  <span className="text-green-600">In Stock ({p.quantity_on_hand})</span>
                                ) : (
                                  <span className="text-red-600">Out of Stock</span>
                                )
                              ) : (
                                <span className="text-muted-foreground">Not tracked</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground border border-dashed rounded-lg">
                      <p className="text-sm">{linkSearchQuery ? "No products match your search" : "No products available"}</p>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Return Items Modal */}
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
                    .filter((p) => (returnType === "parts" ? selectedParts : selectedSpol).has(p.id))
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
