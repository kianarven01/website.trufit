import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CircleCheck, MoreVertical, Pencil, Printer, ReceiptText, Trash2, XCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/axios";
import CreateGoodsReceiptModal, { ReceiptPurchaseOrder } from "@/components/purchasing/CreateGoodsReceiptModal";
import NewPurchaseOrderModal from "@/components/purchasing/NewPurchaseOrderModal";
import PurchaseOrderItemsTable from "@/components/purchasing/PurchaseOrderItemsTable";
import PurchaseStatusBadge from "@/components/purchasing/PurchaseStatusBadge";
import { toast } from "sonner";
import { formatCurrency, formatDate, getCleanApiError, getApprovedReceivedQuantity, normalizeStatus } from "@/components/purchasing/purchasingUtils";
import DetailSkeleton from "@/components/ui/DetailSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scrollArea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface PurchaseOrderItemRow {
  id: string;
  productId: string;
  productSupplierId: string;
  productName: string;
  sku: string | null;
  partNumber: string | null;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  lineTotal: number;
}

interface PurchaseOrderDetailModel {
  id: string;
  poNumber: string;
  supplierName: string;
  supplierId?: string | null;
  orderDate: string | null;
  expectedDelivery: string | null;
  status: string;
  remarks?: string | null;
  totalAmount: number;
  createdByName: string | null;
  submittedByName: string | null;
  approvedByName: string | null;
  cancelledByName: string | null;
  receivedAmount: number;
  items: PurchaseOrderItemRow[];
  receiptModalItems: ReceiptPurchaseOrder["items"];
  goodsReceipts: Array<{
    id: string;
    receiptNumber: string;
    status: string;
    receivedAt: string | null;
  }>;
}

const normalizePurchaseOrder = (row: any): PurchaseOrderDetailModel => {
  const itemsRaw = Array.isArray(row.items) ? row.items : [];
  const goodsReceiptsRaw = Array.isArray(row.goods_receipts)
    ? row.goods_receipts
    : Array.isArray(row.goodsReceipts)
      ? row.goodsReceipts
      : [];

  const items = itemsRaw.map((item: any) => {
    const product = item.product || {};
    const quantityOrdered = Number(item.quantity_ordered ?? item.quantityOrdered ?? 0);
    const quantityReceived = Number(item.quantity_received ?? item.quantityReceived ?? getApprovedReceivedQuantity(item));
    const unitCost = Number(item.unit_cost ?? item.unitCost ?? 0);
    const lineTotal = Number(item.line_total ?? item.lineTotal ?? quantityOrdered * unitCost);

    const manufacturer = product.manufacturer?.name || product.manufacturer || product.manufacturer_name || "";
    const manufacturerStr = manufacturer ? ` — ${manufacturer}` : "";
    const productName = `${String(product.name ?? item.product_name ?? item.productName ?? "Unnamed Product")}${manufacturerStr}`;

    return {
      id: String(item.id ?? ""),
      productId: String(item.product_id ?? item.productId ?? ""),
      productSupplierId: String(item.product_supplier_id ?? item.productSupplierId ?? ""),
      productName,
      sku: product.SKU ?? product.sku ?? item.sku ?? null,
      partNumber: product.part_number ?? item.part_number ?? null,
      quantityOrdered,
      quantityReceived,
      unitCost,
      lineTotal,
    };
  });

  const receiptModalItems = itemsRaw.map((item: any) => {
    const product = item.product || {};
    const quantityOrdered = Number(item.quantity_ordered ?? item.quantityOrdered ?? 0);
    const quantityReceived = Number(item.quantity_received ?? item.quantityReceived ?? getApprovedReceivedQuantity(item));

    const manufacturer = product.manufacturer?.name || product.manufacturer || product.manufacturer_name || "";
    const manufacturerStr = manufacturer ? ` — ${manufacturer}` : "";
    const productName = `${String(product.name ?? item.product_name ?? item.productName ?? "Unnamed Product")}${manufacturerStr}`;

    return {
      id: String(item.id ?? ""),
      productId: String(item.product_id ?? item.productId ?? product.id ?? ""),
      productName,
      productSupplierId: String(item.product_supplier_id ?? item.productSupplierId ?? ""),
      quantityOrdered,
      quantityReceived,
    };
  });

  return {
    id: String(row.id ?? ""),
    poNumber: String(row.po_number ?? row.poNumber ?? row.id ?? "-"),
    supplierName: String(row.supplier?.name ?? row.supplier?.CompanyName ?? row.supplier_name ?? row.supplierName ?? "-"),
    supplierId: row.supplier_id ?? row.supplierId ?? row.supplier?.id ?? null,
    orderDate: row.order_date ?? row.orderDate ?? row.created_at ?? null,
    expectedDelivery: row.request_ship_date ?? row.expected_delivery_date ?? row.eta ?? null,
    status: normalizeStatus(row.status),
    remarks: row.remarks ?? row.notes ?? null,
    totalAmount: Number(row.total_amount ?? row.totalAmount ?? row.total ?? 0),
    createdByName: row.created_by_name ?? row.createdByName ?? null,
    submittedByName: row.submitted_by_name ?? row.submittedByName ?? null,
    approvedByName: row.approved_by_name ?? row.approvedByName ?? null,
    cancelledByName: row.cancelled_by_name ?? row.cancelledByName ?? null,
    receivedAmount: Number(row.received_amount ?? row.receivedAmount ?? 0),
    items,
    receiptModalItems,
    goodsReceipts: goodsReceiptsRaw.map((receipt: any) => ({
      id: String(receipt.id ?? ""),
      receiptNumber: String(receipt.receipt_number ?? receipt.receiptNumber ?? receipt.id ?? "-"),
      status: normalizeStatus(receipt.status),
      receivedAt: receipt.received_at ?? receipt.receivedAt ?? receipt.created_at ?? null,
    })),
  };
};

const PurchaseOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrderDetailModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ action: "submit" | "approve" | "cancel"; label: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmReopen, setConfirmReopen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const loadPurchaseOrder = async () => {
    if (!id) return;

    setLoading(true);

    try {
      const response = await api.get(`/purchasing/purchase-orders/${id}`);
      const row = response.data?.purchase_order || response.data?.purchaseOrder || response.data?.data || response.data;
      const po = normalizePurchaseOrder(row);
      setPurchaseOrder(po);
      sessionStorage.setItem(`breadcrumb-/webapp/purchasing/purchase-orders/${id}`, po.poNumber);
      window.dispatchEvent(new Event('breadcrumb-update'));
    } catch (error: any) {
      console.error(error);
      toast.error("Unable to load purchase order", { description: getCleanApiError(error, "Failed to load purchase order.") });
      setPurchaseOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPurchaseOrder();

    return () => {
      sessionStorage.removeItem(`breadcrumb-/webapp/purchasing/purchase-orders/${id}`);
      window.dispatchEvent(new Event('breadcrumb-update'));
    };
  }, [id]);

  const receiptPurchaseOrder = useMemo<ReceiptPurchaseOrder | null>(() => {
    if (!purchaseOrder) return null;

    return {
      id: purchaseOrder.id,
      poNumber: purchaseOrder.poNumber,
      supplierName: purchaseOrder.supplierName,
      status: purchaseOrder.status,
      items: purchaseOrder.receiptModalItems,
    };
  }, [purchaseOrder]);

  const runPoAction = async (action: "submit" | "approve" | "cancel") => {
    if (!purchaseOrder) return;

    const labels = {
      submit: "submitted",
      approve: "approved",
      cancel: "cancelled",
    };

    try {
      setActionLoading(true);
      await api.post(`/purchasing/purchase-orders/${purchaseOrder.id}/${action}`);
      toast.success("Purchase order updated", { description: `${purchaseOrder.poNumber} was ${labels[action]} successfully.` });
      await loadPurchaseOrder();
    } catch (error: any) {
      console.error(error);
      toast.error("Unable to update purchase order", { description: getCleanApiError(error, "Failed to update purchase order.") });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => window.print();

  const handleDelete = async () => {
    if (!purchaseOrder) return;

    try {
      setActionLoading(true);
      await api.delete(`/purchasing/purchase-orders/${purchaseOrder.id}`);
      toast.success("Purchase order deleted", { description: `${purchaseOrder.poNumber} was deleted successfully.` });
      navigate("/webapp/purchasing/purchase-orders");
    } catch (error: any) {
      console.error(error);
      toast.error("Unable to delete purchase order", { description: getCleanApiError(error, "Failed to delete purchase order.") });
    } finally {
      setActionLoading(false);
    }
  };

  const closePurchaseOrder = async () => {
    if (!purchaseOrder) return;

    try {
      setActionLoading(true);
      await api.post(`/purchasing/purchase-orders/${purchaseOrder.id}/close`);
      toast.success("Purchase order closed", { description: `${purchaseOrder.poNumber} was closed successfully.` });
      await loadPurchaseOrder();
    } catch (error: any) {
      console.error(error);
      toast.error("Unable to close purchase order", { description: getCleanApiError(error, "Failed to close purchase order.") });
    } finally {
      setActionLoading(false);
    }
  };

  const reopenPurchaseOrder = async () => {
    if (!purchaseOrder) return;

    try {
      setActionLoading(true);
      await api.post(`/purchasing/purchase-orders/${purchaseOrder.id}/reopen`);
      toast.success("Purchase order reopened", { description: `${purchaseOrder.poNumber} was reopened successfully.` });
      await loadPurchaseOrder();
    } catch (error: any) {
      console.error(error);
      toast.error("Unable to reopen purchase order", { description: getCleanApiError(error, "Failed to reopen purchase order.") });
    } finally {
      setActionLoading(false);
    }
  };

  const status = normalizeStatus(purchaseOrder?.status);

  const receivedValue = useMemo(() => {
    if (!purchaseOrder) return 0;
    return purchaseOrder.receivedAmount;
  }, [purchaseOrder]);
  const canSubmit = status === "DRAFT";
  const canApprove = status === "SUBMITTED";
  const canCancel = ["DRAFT", "SUBMITTED", "WAITING_TO_RECEIVE", "PARTIALLY_RECEIVED"].includes(status);
  const hasActiveReceipt = purchaseOrder?.goodsReceipts?.some((r) => {
    const s = normalizeStatus(r.status);
    return s === "DRAFT" || s === "SUBMITTED";
  }) ?? false;
  const canCreateReceipt = ["WAITING_TO_RECEIVE", "PARTIALLY_RECEIVED"].includes(status) && !hasActiveReceipt;
  const canEdit = status === "DRAFT";
  const canDelete = status === "DRAFT";

  return (
    <div className="w-full h-full px-6 pt-3 pb-6 flex flex-col gap-4 overflow-hidden select-none bg-background text-foreground">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex w-fit items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
            onClick={() => navigate("/webapp/purchasing/purchase-orders")}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted" onClick={handlePrint}>
            <Printer size={16} /> Print
          </button>
        </div>

        {purchaseOrder && (
          <div className="flex flex-wrap items-center gap-2">
            {canSubmit && (
              <button type="button" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700" onClick={() => setConfirmAction({ action: "submit", label: "submit" })} disabled={actionLoading}>
                Submit PO
              </button>
            )}
            {canApprove && (
              <button type="button" className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700" onClick={() => setConfirmAction({ action: "approve", label: "approve" })} disabled={actionLoading}>
                Approve PO
              </button>
            )}
            {canCreateReceipt && (
              <button type="button" className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700" onClick={() => setReceiptModalOpen(true)}>
                <ReceiptText size={16} /> Create Goods Receipt
              </button>
            )}
            {status === "CLOSED" && (
              <button type="button" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700" onClick={() => setConfirmReopen(true)} disabled={actionLoading}>
                Reopen PO
              </button>
            )}

            {/* Overflow menu for secondary actions */}
            {(canEdit || canDelete || canCancel || (status === "PARTIALLY_RECEIVED" || status === "WAITING_TO_RECEIVE")) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="inline-flex items-center justify-center rounded-md border border-border px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted" disabled={actionLoading}>
                    <MoreVertical size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEdit && (
                    <DropdownMenuItem onClick={() => setEditModalOpen(true)}>
                      <Pencil size={14} className="mr-2" /> Edit PO
                    </DropdownMenuItem>
                  )}
                  {canCancel && (
                    <DropdownMenuItem onClick={() => setConfirmAction({ action: "cancel", label: "cancel" })} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                      <XCircle size={14} className="mr-2" /> Cancel PO
                    </DropdownMenuItem>
                  )}
                  {(status === "PARTIALLY_RECEIVED" || status === "WAITING_TO_RECEIVE") && (
                    <DropdownMenuItem onClick={() => setConfirmClose(true)} className="text-amber-600 dark:text-amber-400 focus:bg-amber-500/10">
                      <CircleCheck size={14} className="mr-2" /> Close PO
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem onClick={() => setConfirmDelete(true)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                      <Trash2 size={14} className="mr-2" /> Delete PO
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <DetailSkeleton />
      ) : !purchaseOrder ? (
        <div className="rounded-xl border border-border bg-background p-8 text-center text-muted-foreground">Purchase order not found.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 items-stretch min-h-0">
          {/* Left Column: PO Info Card */}
          <div className="lg:col-span-1 flex flex-col gap-4 min-h-0">
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold tracking-tight text-foreground">{purchaseOrder.poNumber}</CardTitle>
                  <PurchaseStatusBadge status={purchaseOrder.status} />
                </div>
                <p className="text-xs text-muted-foreground">Supplier: <span className="font-semibold text-foreground">{purchaseOrder.supplierName}</span></p>
              </CardHeader>
              <CardContent className="flex-1 space-y-5 overflow-auto">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Order Date</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(purchaseOrder.orderDate)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Expected Delivery</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(purchaseOrder.expectedDelivery)}</p>
                </div>
                 <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Total Amount</p>
                  <p className="font-extrabold text-blue-600 dark:text-blue-400 text-lg">{formatCurrency(purchaseOrder.totalAmount)}</p>
                </div>
                {receivedValue > 0 && (
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Received Value (Owed)</p>
                    <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-lg">{formatCurrency(receivedValue)}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Remarks</p>
                  <p className="text-sm text-foreground/80 italic">{purchaseOrder.remarks || "-"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Left Column: PO Activity Card */}
            <Card className="flex-none flex flex-col min-h-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Created By</p>
                  <p className="text-sm font-medium text-foreground">{purchaseOrder.createdByName || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Submitted By</p>
                  <p className="text-sm font-medium text-foreground">{purchaseOrder.submittedByName || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Approved By</p>
                  <p className="text-sm font-medium text-foreground">{purchaseOrder.approvedByName || "-"}</p>
                </div>
                {purchaseOrder.cancelledByName && (
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Cancelled By</p>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">{purchaseOrder.cancelledByName}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Tables */}
          <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
            {/* Line Items Section */}
            <Card className="flex-[3] flex flex-col min-h-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Line Items</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 overflow-hidden p-0 flex flex-col">
                <PurchaseOrderItemsTable items={purchaseOrder.items} />
              </CardContent>
            </Card>

            {/* Goods Receipts Section */}
            <Card className="flex-[2] flex flex-col min-h-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Goods Receipts</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 overflow-hidden p-0 flex flex-col">
                <div className="flex flex-col flex-1 border rounded-lg mx-4 mb-4 overflow-hidden">
                  <Table className="table-fixed w-full">
                    <TableHeader className="bg-muted/50">
                      <TableRow className="border-b">
                        <TableHead className="w-[30%] text-center py-3">Receipt #</TableHead>
                        <TableHead className="w-[45%] text-center py-3">Date</TableHead>
                        <TableHead className="w-[25%] text-center py-3">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                  </Table>
                  <ScrollArea className="flex-1">
                    <Table className="table-fixed w-full">
                      <TableBody>
                        {purchaseOrder.goodsReceipts.length === 0 ? (
                          <TableRow>
                            <TableCell className="px-4 py-6 text-center text-muted-foreground" colSpan={3}>
                              No goods receipts yet.
                            </TableCell>
                          </TableRow>
                        ) : (
                          purchaseOrder.goodsReceipts.map((receipt) => (
                            <TableRow
                              key={receipt.id}
                              className="cursor-pointer transition-all hover:bg-accent/30 border-b last:border-b-0"
                              onClick={() => navigate(`/webapp/purchasing/goods-receipts/${receipt.id}`)}
                            >
                              <TableCell className="w-[30%] text-center py-2.5">
                                <span className="font-semibold text-sm">{receipt.receiptNumber}</span>
                              </TableCell>
                              <TableCell className="w-[45%] text-center text-muted-foreground">{formatDate(receipt.receivedAt)}</TableCell>
                              <TableCell className="w-[25%] text-center">
                                <div className="flex justify-center">
                                  <PurchaseStatusBadge status={receipt.status} />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <AlertDialog open={!!confirmAction} onOpenChange={(open) => { if (!open) setConfirmAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.action === "submit" && "Submit Purchase Order"}
              {confirmAction?.action === "approve" && "Approve Purchase Order"}
              {confirmAction?.action === "cancel" && "Cancel Purchase Order"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.action === "cancel"
                ? "This will cancel the PO, void any draft receipts and bills, and reverse all received stock. This action cannot be undone."
                : `Are you sure you want to ${confirmAction?.action} ${purchaseOrder?.poNumber}? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={confirmAction?.action === "cancel" ? "bg-destructive text-white hover:bg-destructive/90" : "bg-blue-600 text-white hover:bg-blue-700"}
              onClick={() => { if (confirmAction) void runPoAction(confirmAction.action); setConfirmAction(null); }}
              disabled={actionLoading}
            >
              {confirmAction?.action === "submit" ? "Submit" : confirmAction?.action === "approve" ? "Approve" : "Cancel PO"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {purchaseOrder?.poNumber}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={handleDelete} disabled={actionLoading}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmClose} onOpenChange={setConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close Purchase Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close {purchaseOrder?.poNumber}? This will mark it as Closed and prevent any further Goods Receipts from being created.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-amber-600 text-white hover:bg-amber-700" onClick={closePurchaseOrder} disabled={actionLoading}>
              Close PO
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmReopen} onOpenChange={setConfirmReopen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reopen Purchase Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reopen {purchaseOrder?.poNumber}? This will make the PO active again and allow you to record new Goods Receipts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-blue-600 text-white hover:bg-blue-700" onClick={reopenPurchaseOrder} disabled={actionLoading}>
              Reopen PO
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <NewPurchaseOrderModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        editPurchaseOrder={purchaseOrder ? {
          id: purchaseOrder.id,
          supplierId: purchaseOrder.supplierId ?? "",
          orderDate: purchaseOrder.orderDate ?? "",
          requestShipDate: purchaseOrder.expectedDelivery ?? "",
          remarks: purchaseOrder.remarks ?? "",
          items: purchaseOrder.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            productSupplierId: item.productSupplierId,
            quantity: String(item.quantityOrdered),
            unitCost: String(item.unitCost),
          })),
        } : undefined}
        onSaved={async () => {
          toast.success("Purchase order updated", { description: "The purchase order was updated successfully." });
          await loadPurchaseOrder();
        }}
        onError={(message) => toast.error("Unable to update purchase order", { description: message })}
      />

      <CreateGoodsReceiptModal
        open={receiptModalOpen}
        onOpenChange={setReceiptModalOpen}
        purchaseOrder={receiptPurchaseOrder}
        onSaved={async () => {
          toast.success("Goods receipt saved", { description: "The goods receipt was created successfully." });
          await loadPurchaseOrder();
        }}
        onError={(message) => toast.error("Unable to save goods receipt", { description: message })}
      />
    </div>
  );
};

export default PurchaseOrderDetail;
