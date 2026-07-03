export type PurchaseStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "PARTIALLY_RECEIVED"
  | "RECEIVED"
  | "CANCELLED"
  | "PARTIALLY_RETURNED"
  | "RETURNED"
  | string;

interface PurchaseStatusBadgeProps {
  status?: PurchaseStatus | null;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: {
    label: "Draft",
    className: "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  },
  SUBMITTED: {
    label: "Submitted",
    className: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  APPROVED: {
    label: "Approved",
    className: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  },
  PARTIALLY_RECEIVED: {
    label: "Partially Received",
    className: "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  },
  RECEIVED: {
    label: "Received",
    className: "border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300",
  },
  PARTIALLY_RETURNED: {
    label: "Partially Returned",
    className: "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  },
  RETURNED: {
    label: "Returned",
    className: "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  },
};

const toLabel = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const PurchaseStatusBadge = ({ status }: PurchaseStatusBadgeProps) => {
  const normalized = String(status || "DRAFT").toUpperCase();
  const config = statusConfig[normalized] || {
    label: toLabel(normalized),
    className: "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  };

  return (
    <span className={`inline-flex w-fit items-center rounded-md border px-2.5 py-1 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

export default PurchaseStatusBadge;
