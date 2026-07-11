import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import CreateSupplierBillModal, { BillPurchaseOrder } from "@/components/purchasing/CreateSupplierBillModal";
import PurchaseStatusBadge from "@/components/purchasing/PurchaseStatusBadge";
import { formatDate, getCleanApiError, getRows, normalizeStatus, getBillStatus } from "@/components/purchasing/purchasingUtils";
import { Pagination, usePagination } from "@/components/ui/pagination";
import DataToolbar from "@/components/DataToolbar";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Eye, Plus, CreditCard, ShieldCheck, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

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
}

export default function SupplierBillsList() {
  const navigate = useNavigate();
  const [bills, setBills] = useState<SupplierBillRow[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<BillPurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);

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
        params: { per_page: 100 },
      });

      const rawPOs = response.data?.purchase_orders || [];
      const eligiblePOs = rawPOs
        .filter((po: any) =>
          ["WAITING_TO_RECEIVE", "PARTIALLY_RECEIVED", "COMPLETED"].includes(
            normalizeStatus(po.status)
          )
        )
        .map((po: any) => {
          const itemsRaw = Array.isArray(po.items) ? po.items : [];
          
          // Compute already billed quantities by PO item ID
          const poBills = rawPOs.flatMap((p: any) => p.supplier_bills || p.supplierBills || []);
          const billItems = poBills
            .filter((b: any) => b.status !== "VOID")
            .flatMap((b: any) => b.items || b.receiptItems || []);

          return {
            id: String(po.id),
            poNumber: String(po.po_number),
            supplierName: String(po.supplier?.CompanyName ?? po.supplier?.name ?? "-"),
            supplierPaymentTerms: String(po.supplier?.payment_terms || "COD"),
            items: itemsRaw.map((item: any) => {
              const product = item.product || {};
              const manufacturer = product.manufacturer?.name || product.manufacturer || product.manufacturer_name || "";
              const manufacturerStr = manufacturer ? ` — ${manufacturer}` : "";
              const productName = `${String(product.name ?? item.product_name ?? "Unnamed Product")}${manufacturerStr}`;
              const sku = product.SKU ?? product.sku ?? item.sku ?? null;
              const partNumber = product.part_number ?? item.part_number ?? null;
              
              // Sum received quantities (net of returns)
              const receiptItems = Array.isArray(item.receipt_items) ? item.receipt_items : [];
              const approvedReceived = receiptItems
                .filter((ri: any) => {
                  const grStatus = normalizeStatus(ri.goods_receipt?.status ?? ri.goodsReceipt?.status);
                  return ["RECEIVED", "PARTIALLY_RETURNED", "RETURNED"].includes(grStatus);
                })
                .reduce((sum: number, ri: any) => {
                  const received = Number(ri.quantity_received || 0);
                  const returned = Number(ri.quantity_returned || 0);
                  return sum + (received - returned);
                }, 0);

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
            }),
          };
        });

      setPurchaseOrders(eligiblePOs);
    } catch (error) {
      console.error("Failed to load purchase orders for billing:", error);
    }
  };

  useEffect(() => {
    void loadBills();
  }, [search, statusFilter, page, pageSize]);

  useEffect(() => {
    if (modalOpen) {
      void loadPurchaseOrders();
    }
  }, [modalOpen]);

  const renderActions = (bill: SupplierBillRow) => {
    return (
      <div className="flex items-center justify-end" onClick={(event) => event.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors outline-none">
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
        ]}
        activeFilters={{ status: statusFilter }}
        onFilterChange={(_, value) => setStatusFilter(value)}
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
                      ₱{bill.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
    </div>
  );
}
