import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import CreateSupplierBillModal, { BillPurchaseOrder } from "@/components/purchasing/CreateSupplierBillModal";
import PurchaseStatusBadge from "@/components/purchasing/PurchaseStatusBadge";
import { formatDate, getCleanApiError, normalizeStatus, getBillStatus, getApprovedReceivedQuantity, formatCurrency } from "@/components/purchasing/purchasingUtils";
import { Pagination, usePagination } from "@/components/ui/pagination";
import DataToolbar from "@/components/DataToolbar";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Eye, Plus, CreditCard, ShieldCheck, MoreVertical, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface SupplierBillRow {
  id: string;
  billNumber: string;
  poId: string;
  poNumber: string;
  supplierName: string;
  billDate: string;
  dueDate: string;
  totalAmount: number;
  status: string;
  notes?: string | null;
  deletedAt?: string | null;
}

export default function SupplierBillsList() {
  const navigate = useNavigate();
  const [bills, setBills] = useState<SupplierBillRow[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<BillPurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showArchived, setShowArchived] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<SupplierBillRow | null>(null);
  const [confirmForceDelete, setConfirmForceDelete] = useState<SupplierBillRow | null>(null);

  // Pagination hook
  const { page, setPage, pageSize, setPageSize } = usePagination(25);
  const [totalCount, setTotalCount] = useState(0);

  // Load Bills
  const loadBills = async () => {
    setLoading(true);
    try {
      const response = await api.get("/purchasing/supplier-bills", {
        params: {
          search,
          status: statusFilter,
          page: page,
          per_page: pageSize,
          archived: showArchived ? "true" : undefined,
        },
      });

      const rawBills = response.data?.supplier_bills || [];
      const formatted = rawBills.map((row: any) => ({
        id: String(row.id),
        billNumber: row.bill_number,
        poId: String(row.purchase_order_id),
        poNumber: String(row.purchase_order?.po_number ?? "-"),
        supplierName: String(row.purchase_order?.supplier?.CompanyName ?? row.purchase_order?.supplier?.name ?? "-"),
        billDate: row.bill_date,
        dueDate: row.due_date,
        totalAmount: parseFloat(row.total_amount) || 0,
        status: String(row.status).toUpperCase(),
        notes: row.notes,
        deletedAt: row.deleted_at ?? null,
      }));

      setBills(formatted);
      setTotalCount(response.data?.pagination?.total ?? formatted.length);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load supplier bills.");
    } finally {
      setLoading(false);
    }
  };

  // Load Purchase Orders for Modal dropdown selection
  const loadPurchaseOrders = async () => {
    try {
      const response = await api.get("/purchasing/purchase-orders", {
        params: {
          status: "WAITING_TO_RECEIVE,PARTIALLY_RECEIVED,COMPLETED,CLOSED",
          per_page: 200,
        },
      });

      const rawPOs = response.data?.purchase_orders || [];
      const eligiblePOs = rawPOs
        .flatMap((po: any) => {
          if (!["WAITING_TO_RECEIVE", "PARTIALLY_RECEIVED", "COMPLETED", "CLOSED"].includes(normalizeStatus(po.status))) return [];
          const itemsRaw = Array.isArray(po.items) ? po.items : [];
          
          // Compute already billed quantities by PO item ID
          const poBills = po.supplier_bills || po.supplierBills || [];
          const billItems = poBills
            .filter((b: any) => b.status !== "VOID")
            .flatMap((b: any) => b.items || b.receiptItems || []);

          return [{
            id: String(po.id),
            poNumber: String(po.po_number),
            supplierName: String(po.supplier?.CompanyName ?? po.supplier?.name ?? "-"),
            supplierPaymentTerms: String(po.supplier?.payment_terms ?? "NONE"),
            items: itemsRaw
              .map((item: any) => {
                const product = item.product || {};
                const productName = product.name ?? item.product_name ?? "Unnamed Product";
                const sku = product.SKU ?? product.sku ?? item.sku ?? "-";
                const partNumber = product.part_number ?? item.part_number ?? "-";

                const approvedReceived = getApprovedReceivedQuantity(item);

                // Sum already billed quantities
                const totalBilled = billItems
                  .filter((bi: any) => {
                    const targetId = bi.purchase_order_item_id ?? bi.purchaseOrderItemId;
                    return String(targetId) === String(item.id);
                  })
                  .reduce((sum: number, bi: any) => {
                    const qty = bi.quantity_billed ?? bi.quantityBilled ?? 0;
                    return sum + Number(qty);
                  }, 0);

                return {
                  id: String(item.id),
                  productId: String(item.product_id),
                  productName,
                  sku,
                  partNumber,
                  quantityOrdered: Number(item.quantity_ordered),
                  quantityReceived: approvedReceived,
                  unitCost: Number(item.unit_cost),
                  quantityBilled: totalBilled,
                };
              })
              .filter((item) => item.quantityReceived > 0),
          }];
        });

      setPurchaseOrders(eligiblePOs);
    } catch (error) {
      console.error("Failed to load purchase orders for billing:", error);
    }
  };

  useEffect(() => {
    void loadBills();
  }, [search, statusFilter, page, pageSize, showArchived]);

  useEffect(() => {
    if (modalOpen) {
      void loadPurchaseOrders();
    }
  }, [modalOpen]);

  const archiveBill = async (bill: SupplierBillRow) => {
    try {
      await api.delete(`/purchasing/supplier-bills/${bill.id}`);
      toast.success(`Supplier bill ${bill.billNumber} was archived successfully.`);
      await loadBills();
    } catch (error: any) {
      console.error(error);
      toast.error(getCleanApiError(error, "Failed to archive supplier bill."));
    }
  };

  const handleRestore = async (bill: SupplierBillRow) => {
    try {
      await api.patch(`/purchasing/supplier-bills/${bill.id}/restore`);
      toast.success(`Supplier bill ${bill.billNumber} has been restored.`);
      await loadBills();
    } catch (error: any) {
      console.error(error);
      toast.error(getCleanApiError(error, "Failed to restore supplier bill."));
    }
  };

  const handleForceDelete = async (bill: SupplierBillRow) => {
    try {
      await api.delete(`/purchasing/supplier-bills/${bill.id}/force`);
      toast.success(`Supplier bill ${bill.billNumber} was permanently deleted.`);
      await loadBills();
    } catch (error: any) {
      console.error(error);
      toast.error(getCleanApiError(error, "Failed to permanently delete supplier bill."));
    }
  };

  const renderActions = (bill: SupplierBillRow) => {
    const status = bill.status.toUpperCase();

    return (
      <div className="flex items-center justify-end" onClick={(event) => event.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors outline-none">
              <MoreVertical size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => navigate(`/webapp/purchasing/supplier-bills/${bill.id}`)}
              className="cursor-pointer"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            {bill.deletedAt ? (
              <>
                <DropdownMenuItem onClick={() => handleRestore(bill)} className="cursor-pointer">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Restore
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setConfirmForceDelete(bill)} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Permanently
                </DropdownMenuItem>
              </>
            ) : (
              <>
                {(status === "DRAFT" || status === "VOID") && (
                  <DropdownMenuItem onClick={() => setConfirmDelete(bill)} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Archive Bill
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden select-none bg-background text-foreground">
      {/* TOOLBAR */}
      <DataToolbar
        searchPlaceholder="Search by invoice number, PO, or supplier..."
        onSearch={setSearch}
        onAdd={() => setModalOpen(true)}
        addLabel="Record Supplier Bill"
        addButtonClassName="bg-blue-600 hover:bg-blue-700 text-white"
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { value: "ALL", label: "All Statuses" },
              { value: "MATCH_EXCEPTION", label: "Match Exceptions" },
              { value: "AWAITING_PAYMENT", label: "Awaiting Payment" },
              { value: "PAID", label: "Paid" },
              { value: "VOID", label: "Void" },
            ],
          },
          {
            key: "archived",
            label: "Archived",
            options: [
              { value: "true", label: "Show Archived" },
              { value: "false", label: "Hide Archived" },
            ],
          },
        ]}
        activeFilters={{
          status: statusFilter,
          archived: showArchived ? "true" : "false",
        }}
        onFilterChange={(key, value) => {
          setPage(1);
          if (key === "status") {
            setStatusFilter(value);
          } else if (key === "archived") {
            setShowArchived(value === "true");
          }
        }}
      />

      {/* Table Container */}
      {loading ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl px-2 overflow-hidden bg-background">
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">
              Loading supplier bills...
            </p>
          </div>
        </div>
      ) : bills.length > 0 ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl overflow-hidden bg-background">
          <ScrollArea className="flex-1 px-3">
            <Table className="table-fixed w-full border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[12%] text-left pl-8">Invoice #</TableHead>
                  <TableHead className="w-[15%] text-center">PO Number</TableHead>
                  <TableHead className="w-[23%] text-center">Supplier</TableHead>
                  <TableHead className="w-[13%] text-center">Invoice Date</TableHead>
                  <TableHead className="w-[13%] text-center">Due Date</TableHead>
                  <TableHead className="w-[14%] text-center">Invoice Amount</TableHead>
                  <TableHead className="w-[10%] text-center">Status</TableHead>
                  <TableHead className="w-[10%] text-right pr-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow
                    key={bill.id}
                    onClick={() => navigate(`/webapp/purchasing/supplier-bills/${bill.id}`)}
                    className={cn(
                      "cursor-pointer transition-all rounded-lg border border-border/60 bg-card shadow-sm hover:shadow-md",
                      "hover:bg-accent/30"
                    )}
                  >
                    <TableCell className="py-2.5 text-left pl-8 font-semibold text-foreground">{bill.billNumber}</TableCell>
                    <TableCell className="text-center font-medium" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/webapp/purchasing/purchase-orders/${bill.poId}`)}
                        className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {bill.poNumber}
                      </button>
                    </TableCell>
                    <TableCell className="text-center font-medium">{bill.supplierName}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{formatDate(bill.billDate)}</TableCell>
                    <TableCell className="text-center text-muted-foreground font-medium">{formatDate(bill.dueDate)}</TableCell>
                    <TableCell className="text-center font-semibold text-foreground">
                      {formatCurrency(bill.totalAmount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <PurchaseStatusBadge status={getBillStatus(bill.status, bill.dueDate)} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                      {renderActions(bill)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={totalCount}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl px-2 overflow-hidden bg-background">
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-muted-foreground text-sm">
            No supplier bills found.
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      <CreateSupplierBillModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        purchaseOrders={purchaseOrders}
        onSaved={() => { void loadBills(); }}
      />

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => { if (!open) setConfirmDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Supplier Bill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive Supplier Bill {confirmDelete?.billNumber}? It will be hidden from the active list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => { if (confirmDelete) void archiveBill(confirmDelete); setConfirmDelete(null); }}
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Force Delete Confirmation Dialog */}
      <AlertDialog open={!!confirmForceDelete} onOpenChange={(open) => { if (!open) setConfirmForceDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Supplier Bill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete Supplier Bill {confirmForceDelete?.billNumber}? This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => { if (confirmForceDelete) void handleForceDelete(confirmForceDelete); setConfirmForceDelete(null); }}
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
