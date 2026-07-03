interface StockMovementTypeBadgeProps {
  type?: string | null;
}

const movementConfig: Record<string, { label: string; className: string }> = {
  IN_RECEIPT: {
    label: "IN_RECEIPT",
    className: "border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
  OUT_SALES: {
    label: "OUT_SALES",
    className: "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300",
  },
  ADJ_SHRINKAGE: {
    label: "ADJ_SHRINKAGE",
    className: "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  },
  ADJ_RETURN: {
    label: "ADJ_RETURN",
    className: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
};

const StockMovementTypeBadge = ({ type }: StockMovementTypeBadgeProps) => {
  const normalized = String(type || "-").toUpperCase();
  const config = movementConfig[normalized] || {
    label: normalized,
    className: "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  };

  return (
    <span className={`inline-flex w-fit items-center rounded-md border px-2.5 py-1 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

export default StockMovementTypeBadge;
