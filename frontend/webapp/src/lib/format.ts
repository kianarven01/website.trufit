export const formatPeso = (value: number | null): string => {
  if (value === null) return "No price set";
  return `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};
