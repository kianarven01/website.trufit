export const formatCurrency = (value: number | string | null | undefined) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

export const formatDate = (value: string | Date | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export const getRows = (data: any, keys: string[] = []): any[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  if (Array.isArray(data?.rows)) return data.rows;
  return [];
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

export const isActionStatus = (status: unknown, allowed: string[]) =>
  allowed.includes(normalizeStatus(status));
