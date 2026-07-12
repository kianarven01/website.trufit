import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import PurchaseStatusBadge from "@/components/purchasing/PurchaseStatusBadge";
import { formatDate, getCleanApiError, getBillStatus, formatCurrency } from "@/components/purchasing/purchasingUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scrollArea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, CreditCard, MoreVertical, Printer, ShieldCheck, AlertTriangle, Calendar, FileText, Ban, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface BillItem {
  id: string;
  productName: string;
  sku?: string | null;
  partNumber?: string | null;
  quantityBilled: number;
  unitPrice: number;
  lineTotal: number;
  poItemUnitCost: number;
  poItemQuantityReceived: number;
}

interface BillDetail {
  id: string;
  billNumber: string;
  purchaseOrderId: string;
  poNumber: string;
  supplierName: string;
  status: string;
  billDate: string;
  dueDate: string;
  totalAmount: number;
  notes?: string | null;
  createdByName?: string | null;
  approvedByName?: string | null;
  paidByName?: string | null;
  paidAt?: string | null;
  createdAt: string;
  items: BillItem[];
}

export default function SupplierBillDetail() {
  const { billId } = useParams<{ billId: string }>();
  const navigate = useNavigate();
  const [bill, setBill] = useState<BillDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Dialog controls
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [showVoidDialog, setShowVoidDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  /* PDF preview */
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);

  const handlePreviewPDF = useCallback(async () => {
    if (!billId) return;
    setIsLoadingPdf(true);
    setShowPdfPreview(true);
    try {
      const response = await api.get(`/purchasing/supplier-bills/${billId}/download-pdf`, { responseType: 'blob' });
      if (pdfBlobUrl) window.URL.revokeObjectURL(pdfBlobUrl);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      setPdfBlobUrl(url);
    } catch {
      toast.error("Failed to load PDF preview.");
    } finally {
      setIsLoadingPdf(false);
    }
  }, [billId, pdfBlobUrl]);

  const loadBillDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/purchasing/supplier-bills/${billId}`);
      const raw = response.data?.supplier_bill;
      if (!raw) throw new Error("Supplier bill not found.");

      const formattedItems = (raw.items || []).map((item: any) => {
        const poItem = item.purchase_order_item || item.purchaseOrderItem || {};
        
        // Sum received quantities (net of returns) for the PO item
        const rawReceiptItems = poItem.receiptItems ?? poItem.receipt_items;
        const receiptItems = Array.isArray(rawReceiptItems) ? rawReceiptItems : [];
        const netReceived = receiptItems
          .filter((ri: any) => {
            const gr = ri.goodsReceipt ?? ri.goods_receipt ?? ri.goods_receipts ?? ri.goodsReceipts;
            const grStatus = String(gr?.status ?? "").toUpperCase();
            return ["RECEIVED", "PARTIALLY_RETURNED", "RETURNED"].includes(grStatus);
          })
          .reduce((sum: number, ri: any) => {
            const received = Number(ri.quantity_received ?? ri.quantityReceived ?? 0);
            const returned = Number(ri.quantity_returned ?? ri.quantityReturned ?? 0);
            return sum + (received - returned);
          }, 0);

        return {
          id: String(item.id),
          productName: String(item.product?.name ?? "Unnamed Product"),
          sku: item.product?.SKU ?? item.product?.sku ?? null,
          partNumber: item.product?.part_number ?? item.product?.partNumber ?? null,
          quantityBilled: Number(item.quantity_billed),
          unitPrice: parseFloat(item.unit_price) || 0,
          lineTotal: parseFloat(item.line_total) || 0,
          poItemUnitCost: parseFloat(poItem.unit_cost) || 0,
          poItemQuantityReceived: netReceived,
        };
      });

      // Set dynamic breadcrumb label
      sessionStorage.setItem(`breadcrumb-/webapp/purchasing/supplier-bills/${billId}`, `Invoice: ${raw.bill_number}`);
      window.dispatchEvent(new Event("breadcrumb-update"));

      setBill({
        id: String(raw.id),
        billNumber: raw.bill_number,
        purchaseOrderId: String(raw.purchase_order_id),
        poNumber: String(raw.purchase_order?.po_number ?? "-"),
        supplierName: String(raw.purchase_order?.supplier?.CompanyName ?? raw.purchase_order?.supplier?.name ?? "-"),
        status: String(raw.status).toUpperCase(),
        billDate: raw.bill_date,
        dueDate: raw.due_date,
        totalAmount: parseFloat(raw.total_amount) || 0,
        notes: raw.notes,
        createdByName: raw.createdByName,
        approvedByName: raw.approvedByName,
        paidByName: raw.paidByName,
        paidAt: raw.paid_at,
        createdAt: raw.created_at,
        items: formattedItems,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load supplier bill details.");
      navigate("/webapp/purchasing/supplier-bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (billId) {
      void loadBillDetails();
    }
    return () => {
      sessionStorage.removeItem(`breadcrumb-/webapp/purchasing/supplier-bills/${billId}`);
      window.dispatchEvent(new Event("breadcrumb-update"));
    };
  }, [billId]);

  // Actions
  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const response = await api.post(`/purchasing/supplier-bills/${billId}/approve`);
      toast.success(response.data?.message || "Invoice discrepancy approved.");
      setShowApproveDialog(false);
      void loadBillDetails();
    } catch (error: any) {
      toast.error(getCleanApiError(error));
    } finally {
      setActionLoading(false);
    }
  };

  const handlePay = async () => {
    setActionLoading(true);
    try {
      const response = await api.post(`/purchasing/supplier-bills/${billId}/pay`);
      toast.success(response.data?.message || "Invoice payment recorded successfully.");
      setShowPayDialog(false);
      void loadBillDetails();
    } catch (error: any) {
      toast.error(getCleanApiError(error));
    } finally {
      setActionLoading(false);
    }
  };

  const handleVoid = async () => {
    setActionLoading(true);
    try {
      const response = await api.post(`/purchasing/supplier-bills/${billId}/void`);
      toast.success(response.data?.message || "Supplier bill voided.");
      setShowVoidDialog(false);
      void loadBillDetails();
    } catch (error: any) {
      toast.error(getCleanApiError(error));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-background text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading invoice details...
        </div>
      </div>
    );
  }

  if (!bill) return null;

  return (
    <div className="w-full h-full px-6 pt-3 pb-6 flex flex-col gap-4 overflow-hidden bg-background text-foreground">
      {/* HEADER */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0" data-no-print>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex w-fit items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
            onClick={() => navigate("/webapp/purchasing/supplier-bills")}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted" onClick={handlePreviewPDF}>
            <Printer size={16} /> Print
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {bill.status === "MATCH_EXCEPTION" && (
            <button
              type="button"
              onClick={() => setShowApproveDialog(true)}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Override & Approve
            </button>
          )}

          {bill.status === "AWAITING_PAYMENT" && (
            <button
              type="button"
              onClick={() => setShowPayDialog(true)}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Record Payment
            </button>
          )}

          {["DRAFT", "MATCH_EXCEPTION", "AWAITING_PAYMENT", "PAID"].includes(bill.status) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="inline-flex items-center justify-center rounded-md border border-border px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">
                  <MoreVertical size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowVoidDialog(true)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                  Void Bill
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="flex-1 flex flex-col min-h-0 space-y-4">
        {bill.status === "MATCH_EXCEPTION" && (
          <div className="rounded-lg border border-red-250 bg-red-50/10 p-4 text-sm text-red-800 flex gap-3 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-300 shrink-0">
            <AlertTriangle size={18} className="shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <strong className="block text-md font-semibold mb-1">3-Way Match Exception Discovered</strong>
              <span>
                One or more lines on this invoice have quantities or unit costs that deviate from the Purchase Order and Goods Receipt data. Finance must review and override these discrepancies before a payment can be logged.
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 items-stretch min-h-0">
          {/* Left Column: Metadata & Activity */}
          <div className="lg:col-span-1 flex flex-col gap-4 min-h-0">
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold tracking-tight text-foreground">{bill.billNumber}</CardTitle>
                  <PurchaseStatusBadge status={getBillStatus(bill.status, bill.dueDate)} />
                </div>
                <p className="text-xs text-muted-foreground">Supplier: <span className="font-semibold text-foreground">{bill.supplierName}</span></p>
              </CardHeader>
              <CardContent className="flex-1 space-y-5 overflow-auto">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Invoice Date</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(bill.billDate)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Due Date</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(bill.dueDate)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Purchase Order</p>
                  <button
                    type="button"
                    className="font-bold text-blue-600 hover:underline block text-left"
                    onClick={() => bill.purchaseOrderId && navigate(`/webapp/purchasing/purchase-orders/${bill.purchaseOrderId}`)}
                  >
                    {bill.poNumber}
                  </button>
                </div>
                <div className="space-y-1 border-t border-border/60 pt-3">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Total Amount</p>
                  <p className="text-xl font-bold text-foreground">
                    {formatCurrency(bill.totalAmount)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-none flex flex-col min-h-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Created By</p>
                  <p className="text-sm font-medium text-foreground">{bill.createdByName || "System"}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(bill.createdAt)}</p>
                </div>

                {bill.approvedByName && (
                  <div className="space-y-1 border-t border-border/60 pt-2">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Approved By</p>
                    <p className="text-sm font-medium text-foreground">{bill.approvedByName}</p>
                  </div>
                )}

                {bill.paidByName && (
                  <div className="space-y-1 border-t border-border/60 pt-2">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Paid By</p>
                    <p className="text-sm font-medium text-foreground">{bill.paidByName}</p>
                    <p className="text-xs text-muted-foreground">{bill.paidAt ? formatDate(bill.paidAt) : ""}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Matched Line Items Table */}
          <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Matched Invoice Line Items</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 overflow-hidden p-0 flex flex-col">
                <div className="flex flex-col flex-1 border rounded-lg mx-4 mb-4 overflow-hidden">
                  <Table className="table-fixed w-full">
                    <TableHeader className="bg-muted/50">
                      <TableRow className="border-b hover:bg-transparent">
                        <TableHead className="w-[22%] py-3 text-center font-medium">Product</TableHead>
                        <TableHead className="w-[12%] text-center py-3 font-medium">Part Number</TableHead>
                        <TableHead className="w-[11%] text-center py-3 font-medium">Billed Qty</TableHead>
                        <TableHead className="w-[11%] text-center py-3 font-medium">Net Received</TableHead>
                        <TableHead className="w-[13%] text-right py-3 font-medium">Invoiced Price</TableHead>
                        <TableHead className="w-[13%] text-right py-3 font-medium">PO Cost</TableHead>
                        <TableHead className="w-[18%] py-3 text-center font-medium">Line Total</TableHead>
                      </TableRow>
                    </TableHeader>
                  </Table>
                  <ScrollArea className="flex-1">
                    <Table className="table-fixed w-full">
                      <TableBody>
                        {bill.items.length === 0 ? (
                          <TableRow className="hover:bg-transparent">
                            <TableCell className="px-4 py-6 text-center text-muted-foreground" colSpan={7}>
                              No billing items found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          bill.items.map((item) => {
                            const qtyMismatch = item.quantityBilled > item.poItemQuantityReceived;
                            const priceMismatch = Math.abs(item.unitPrice - item.poItemUnitCost) > 0.01;

                            return (
                              <TableRow
                                key={item.id}
                                className="hover:bg-transparent border-b last:border-b-0"
                              >
                                <TableCell className="w-[22%] py-3 pl-4 text-left">
                                  <p className="font-semibold text-foreground text-sm">{item.productName}</p>
                                  {item.sku && <p className="text-[11px] text-muted-foreground leading-none mt-0.5">{item.sku}</p>}
                                  {(qtyMismatch || priceMismatch) && (
                                    <span className="block text-xs font-medium text-red-600 dark:text-red-400 mt-1 leading-normal">
                                      {qtyMismatch && `• Billed quantity (${item.quantityBilled}) exceeds net received (${item.poItemQuantityReceived}). `}
                                      {priceMismatch && `• Price (₱${item.unitPrice}) differs from PO (₱${item.poItemUnitCost}).`}
                                    </span>
                                  )}
                                </TableCell>
                                
                                <TableCell className="w-[12%] text-center text-muted-foreground py-3">
                                  {item.partNumber || "-"}
                                </TableCell>
                                
                                <TableCell className={`w-[11%] text-center py-3 ${qtyMismatch ? "font-bold text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
                                  {item.quantityBilled}
                                </TableCell>

                                <TableCell className="w-[11%] text-center text-muted-foreground font-medium py-3">
                                  {item.poItemQuantityReceived}
                                </TableCell>
                                
                                <TableCell className={`w-[13%] text-right py-3 ${priceMismatch ? "font-bold text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
                                  {formatCurrency(item.unitPrice)}
                                </TableCell>

                                <TableCell className="w-[13%] text-right text-muted-foreground py-3">
                                  {formatCurrency(item.poItemUnitCost)}
                                </TableCell>

                                <TableCell className="w-[18%] text-center font-bold text-foreground py-3">
                                  {formatCurrency(item.lineTotal)}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>

            {bill.notes && (
              <Card className="flex-none p-4">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-1.5">
                  <FileText size={14} /> Notes
                </h3>
                <p className="text-sm text-foreground whitespace-pre-line bg-muted/20 p-3 rounded-lg border border-border/40">
                  {bill.notes}
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* APPROVE OVERRIDE DIALOG */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Override Discrepancy & Approve?</AlertDialogTitle>
            <AlertDialogDescription>
              This will override the quantity/price match exceptions and approve this supplier invoice for payment. This action will be recorded in the audit trail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={actionLoading}
              onClick={handleApprove}
            >
              {actionLoading ? "Processing..." : "Confirm Override"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PAY BILL DIALOG */}
      <AlertDialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Record Payment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this invoice of <strong>{formatCurrency(bill.totalAmount)}</strong> as paid?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={actionLoading} onClick={handlePay}>
              {actionLoading ? "Processing..." : "Confirm Payment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* VOID BILL DIALOG */}
      <AlertDialog open={showVoidDialog} onOpenChange={setShowVoidDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Void Supplier Bill?</AlertDialogTitle>
            <AlertDialogDescription>
              This will void the recorded invoice. This action is permanent and cannot be undone. Billed quantities will be restored back to the Purchase Order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-white"
              disabled={actionLoading}
              onClick={handleVoid}
            >
              {actionLoading ? "Processing..." : "Confirm Void"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            <DialogTitle className="text-lg font-semibold">
              Bill Preview — {bill?.billNumber || "Supplier Bill"}
            </DialogTitle>
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
                title="Bill PDF Preview"
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
}
