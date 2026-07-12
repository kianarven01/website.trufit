import { getRows } from "@/lib/api";

export { getRows };

const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export const formatCurrency = (value: number | string | null | undefined) =>
  currencyFormatter.format(Number(value || 0));

export const formatDate = (value: string | Date | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return dateFormatter.format(date);
};

export const getCleanApiError = (error: any, fallback = "Something went wrong. Please try again.") => {
  const validationErrors = error?.response?.data?.errors;
  if (validationErrors) return Object.values(validationErrors).flat().join(" ");

  const rawMessage = error?.response?.data?.message || error?.response?.data?.error || fallback;

  if (
    String(rawMessage).includes("SQLSTATE") ||
    String(rawMessage).includes("pgsql") ||
    String(rawMessage).includes("current transaction is aborted")
  ) {
    return fallback;
  }

  return rawMessage;
};

export const normalizeStatus = (status: unknown) => String(status || "DRAFT").toUpperCase();

export const getBillStatus = (status: string | null | undefined, dueDate: string | null | undefined): string => {
  const normStatus = String(status || "DRAFT").toUpperCase();
  if ((normStatus === "AWAITING_PAYMENT" || normStatus === "MATCH_EXCEPTION") && dueDate) {
    const todayStr = new Date().toISOString().split("T")[0];
    const cleanDueDate = String(dueDate).split(" ")[0]; // strip time if present
    if (todayStr > cleanDueDate) {
      return "OVERDUE";
    }
  }
  return normStatus;
};

export const getApprovedReceivedQuantity = (row: any) => {
  const receiptItems = Array.isArray(row.receipt_items)
    ? row.receipt_items
    : Array.isArray(row.receiptItems)
      ? row.receiptItems
      : [];

  return receiptItems
    .filter((receiptItem: any) => {
      const status = normalizeStatus(receiptItem.goods_receipt?.status ?? receiptItem.goodsReceipt?.status);
      return status === "RECEIVED" || status === "PARTIALLY_RETURNED";
    })
    .reduce((sum: number, receiptItem: any) => {
      const received = Number(receiptItem.quantity_received || 0);
      const returned = Number(receiptItem.quantity_returned || receiptItem.quantityReturned || 0);
      return sum + (received - returned);
    }, 0);
};

export interface PurchaseOrderRow {
  id: string;
  poNumber: string;
  supplierName: string;
  orderDate: string | null;
  expectedDelivery: string | null;
  totalAmount: number;
  receivedAmount: number;
  status: string;
  deletedAt?: string | null;
}

export const normalizePurchaseOrderRow = (row: any): PurchaseOrderRow => ({
  id: String(row.id ?? ""),
  poNumber: String(row.po_number ?? row.poNumber ?? row.id ?? "-"),
  supplierName: String(
    row.supplier?.name ??
      row.supplier?.CompanyName ??
      row.supplier_name ??
      row.supplierName ??
      "-"
  ),
  orderDate: row.order_date ?? row.orderDate ?? row.created_at ?? null,
  expectedDelivery: row.request_ship_date ?? row.expected_delivery_date ?? row.eta ?? null,
  totalAmount: Number(row.total_amount ?? row.totalAmount ?? row.total ?? 0),
  receivedAmount: Number(row.received_amount ?? row.receivedAmount ?? 0),
  status: normalizeStatus(row.status),
  deletedAt: row.deleted_at ?? null,
});

export interface GoodsReceiptRow {
  id: string;
  receiptNumber: string;
  poNumber: string;
  supplierName: string;
  receivedAt: string | null;
  status: string;
  notes?: string | null;
  deletedAt?: string | null;
}

export const normalizeGoodsReceiptRow = (row: any): GoodsReceiptRow => ({
  id: String(row.id ?? ""),
  receiptNumber: String(row.receipt_number ?? row.receiptNumber ?? row.id ?? "-"),
  poNumber: String(row.purchase_order?.po_number ?? row.purchaseOrder?.poNumber ?? row.po_number ?? "-"),
  supplierName: String(
    row.purchase_order?.supplier?.name ??
      row.purchase_order?.supplier?.CompanyName ??
      row.purchaseOrder?.supplier?.name ??
      row.supplier_name ??
      "-"
  ),
  receivedAt: row.received_at ?? row.receivedAt ?? row.created_at ?? null,
  status: normalizeStatus(row.status),
  notes: row.notes ?? null,
  deletedAt: row.deleted_at ?? null,
});
