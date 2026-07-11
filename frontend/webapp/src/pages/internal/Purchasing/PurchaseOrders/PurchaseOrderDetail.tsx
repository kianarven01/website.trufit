import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Pencil, Printer, ReceiptText, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/axios";
import CreateGoodsReceiptModal, { ReceiptPurchaseOrder } from "@/components/purchasing/CreateGoodsReceiptModal";
import NewPurchaseOrderModal from "@/components/purchasing/NewPurchaseOrderModal";
import PurchaseOrderItemsTable from "@/components/purchasing/PurchaseOrderItemsTable";
import PurchaseStatusBadge from "@/components/purchasing/PurchaseStatusBadge";
import PurchasingToast, { PurchasingToastType } from "@/components/purchasing/PurchasingToast";
import { formatCurrency, formatDate, getCleanApiError, normalizeStatus } from "@/components/purchasing/purchasingUtils";
import DetailSkeleton from "@/components/ui/DetailSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scrollArea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
  items: PurchaseOrderItemRow[];
  receiptModalItems: ReceiptPurchaseOrder["items"];
  goodsReceipts: Array<{
    id: string;
    receiptNumber: string;
    status: string;
    receivedAt: string | null;
  }>;
}

const getApprovedReceivedQuantity = (row: any) => {
  const receiptItems = Array.isArray(row.receipt_items)
    ? row.receipt_items
    : Array.isArray(row.receiptItems)
      ? row.receiptItems
      : [];

  return receiptItems
    .filter((receiptItem: any) => {
      const status = normalizeStatus(receiptItem.goods_receipt?.status ?? receiptItem.goodsReceipt?.status);
      return status === "RECEIVED" || status === "PARTIALLY_RETURNED" || status === "RETURNED";
    })
    .reduce((sum: number, receiptItem: any) => {
      const received = Number(receiptItem.quantity_received || 0);
      const returned = Number(receiptItem.quantity_returned || receiptItem.quantityReturned || 0);
      return sum + (received - returned);
    }, 0);
};

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
  const [toast, setToast] = useState<{
    type: PurchasingToastType;
    title: string;
    message: string;
  } | null>(null);

  const showToast = (type: PurchasingToastType, title: string, message: string) => {
    setToast({ type, title, message });
  };

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
      showToast("error", "Unable to load purchase order", getCleanApiError(error, "Failed to load purchase order."));
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
      await api.post(`/purchasing/purchase-orders/${purchaseOrder.id}/${action}`);
      showToast("success", "Purchase order updated", `${purchaseOrder.poNumber} was ${labels[action]} successfully.`);
      await loadPurchaseOrder();
    } catch (error: any) {
      console.error(error);
      showToast("error", "Unable to update purchase order", getCleanApiError(error, "Failed to update purchase order."));
    }
  };

  const handlePrint = () => window.print();

  const handleDelete = async () => {
    if (!purchaseOrder) return;

    try {
      await api.delete(`/purchasing/purchase-orders/${purchaseOrder.id}`);
      showToast("success", "Purchase order deleted", `${purchaseOrder.poNumber} was deleted successfully.`);
      navigate("/webapp/purchasing/purchase-orders");
    } catch (error: any) {
      console.error(error);
      showToast("error", "Unable to delete purchase order", getCleanApiError(error, "Failed to delete purchase order."));
    }
  };

  const closePurchaseOrder = async () => {
    if (!purchaseOrder) return;

    try {
      await api.post(`/purchasing/purchase-orders/${purchaseOrder.id}/close`);
      showToast("success", "Purchase order closed", `${purchaseOrder.poNumber} was closed successfully.`);
      await loadPurchaseOrder();
    } catch (error: any) {
      console.error(error);
      showToast("error", "Unable to close purchase order", getCleanApiError(error, "Failed to close purchase order."));
    }
  };

  const reopenPurchaseOrder = async () => {
    if (!purchaseOrder) return;

    try {
      await api.post(`/purchasing/purchase-orders/${purchaseOrder.id}/reopen`);
      showToast("success", "Purchase order reopened", `${purchaseOrder.poNumber} was reopened successfully.`);
      await loadPurchaseOrder();
    } catch (error: any) {
      console.error(error);
      showToast("error", "Unable to reopen purchase order", getCleanApiError(error, "Failed to reopen purchase order."));
    }
  };

  const status = normalizeStatus(purchaseOrder?.status);

  const receivedValue = useMemo(() => {
    if (!purchaseOrder) return 0;
    return purchaseOrder.items.reduce((sum, item) => sum + (item.quantityReceived * item.unitCost), 0);
  }, [purchaseOrder]);
  const canSubmit = status === "DRAFT";
  const canApprove = status === "SUBMITTED";
  const canCancel = ["DRAFT", "SUBMITTED", "APPROVED"].includes(status);
  const hasDraftReceipt = purchaseOrder?.goodsReceipts?.some((r) => normalizeStatus(r.status) === "DRAFT") ?? false;
  const canCreateReceipt = ["APPROVED", "PARTIALLY_RECEIVED", "RETURNED"].includes(status) && !hasDraftReceipt;
  const canEdit = status === "DRAFT";
  const canDelete = status === "DRAFT";

  return (
    <div className="w-full h-full px-6 pt-3 pb-6 flex flex-col gap-4 overflow-hidden select-none bg-background text-foreground">
      {toast && (
        <PurchasingToast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={4000}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          className="inline-flex w-fit items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
          onClick={() => navigate("/webapp/purchasing/purchase-orders")}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {purchaseOrder && (
          <div className="flex flex-wrap items-center gap-2">
            {canEdit && (
              <button className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-muted" onClick={() => setEditModalOpen(true)}>
                <Pencil size={16} /> Edit PO
              </button>
            )}
            {canDelete && (
              <button className="inline-flex items-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20" onClick={() => setConfirmDelete(true)}>
                <Trash2 size={16} /> Delete PO
              </button>
            )}
            {canSubmit && (
              <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700" onClick={() => setConfirmAction({ action: "submit", label: "submit" })}>
                Submit PO
              </button>
            )}
            {canApprove && (
              <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700" onClick={() => setConfirmAction({ action: "approve", label: "approve" })}>
                Approve PO
              </button>
            )}
            {canCancel && (
              <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700" onClick={() => setConfirmAction({ action: "cancel", label: "cancel" })}>
                Cancel PO
              </button>
            )}
            {status === "PARTIALLY_RECEIVED" && (
              <button className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700" onClick={() => setConfirmClose(true)}>
                Close PO
              </button>
            )}
            {status === "CLOSED" && (
              <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700" onClick={() => setConfirmReopen(true)}>
                Reopen PO
              </button>
            )}
            <button className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-muted" onClick={handlePrint}>
              <Printer size={16} /> Print PO
            </button>
            {canCreateReceipt && (
              <button className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600" onClick={() => setReceiptModalOpen(true)}>
                <ReceiptText size={16} /> Create Goods Receipt
              </button>
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
              Are you sure you want to {confirmAction?.action} {purchaseOrder?.poNumber}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={confirmAction?.action === "cancel" ? "bg-destructive text-white hover:bg-destructive/90" : "bg-blue-600 text-white hover:bg-blue-700"}
              onClick={() => { if (confirmAction) void runPoAction(confirmAction.action); setConfirmAction(null); }}
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
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={handleDelete}>
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
              Are you sure you want to close {purchaseOrder?.poNumber}? This will mark it as Completed and prevent any further Goods Receipts from being created.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction className="bg-amber-600 text-white hover:bg-amber-700" onClick={closePurchaseOrder}>
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
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction className="bg-blue-600 text-white hover:bg-blue-700" onClick={reopenPurchaseOrder}>
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
          showToast("success", "Purchase order updated", "The purchase order was updated successfully.");
          await loadPurchaseOrder();
        }}
        onError={(message) => showToast("error", "Unable to update purchase order", message)}
      />

      <CreateGoodsReceiptModal
        open={receiptModalOpen}
        onOpenChange={setReceiptModalOpen}
        purchaseOrder={receiptPurchaseOrder}
        onSaved={async () => {
          showToast("success", "Goods receipt saved", "The goods receipt was created successfully.");
          await loadPurchaseOrder();
        }}
        onError={(message) => showToast("error", "Unable to save goods receipt", message)}
      />
    </div>
  );
};

export default PurchaseOrderDetail;
