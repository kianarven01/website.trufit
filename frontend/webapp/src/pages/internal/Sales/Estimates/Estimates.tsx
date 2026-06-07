import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

import DataToolbar, { FilterOption } from "@/components/DataToolbar";
import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { ImageIcon } from "lucide-react";
import api from "@/api/axios";

/* ================= TYPES ================= */

interface Estimate {
  id: string;
  estimateNo?: string;
  customer?: any;
  vehicle?: any;
  items?: any[];
  services: any[];
  parts: any[];
  createdAt?: string;
  updatedAt?: string;
  status: "approved" | "issued" | "DRAFT" | "APPROVED" | "ISSUED" | "FOR APPROVAL" | "for approval" | "for_approval";
  total: number;
}

/* ================= STATUS CONFIG ================= */

const statusConfig: Record<string, { label: string; variant: any }> = {
  approved: { label: "Approved", variant: "approved" as const },
  issued: { label: "Issued", variant: "received" as const },
  DRAFT: { label: "Draft", variant: "default" as const },
  APPROVED: { label: "Approved", variant: "approved" as const },
  ISSUED: { label: "Issued", variant: "received" as const },
  "FOR APPROVAL": { label: "For Approval", variant: "for-approval" as const },
  "for approval": { label: "For Approval", variant: "for-approval" as const },
  "for_approval": { label: "For Approval", variant: "for-approval" as const },
};

/* ================= FILTER ================= */

const statusFilterOptions: FilterOption[] = [
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Draft", value: "DRAFT" },
      { label: "Approved", value: "APPROVED" },
      { label: "For Approval", value: "FOR APPROVAL" },
      { label: "Issued", value: "ISSUED" },
    ],
  },
];

/* ================= COMPONENT ================= */

const Estimates: React.FC = () => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({
    status: "all",
  });

  const navigate = useNavigate();

  const { page, setPage, pageSize, setPageSize, paginate } =
    usePagination(25);

  /* ================= LOAD FROM API ================= */

  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/estimates');
        const data = res.data.data;

        if (!Array.isArray(data)) {
          setEstimates([]);
          return;
        }

        const normalized: Estimate[] = data.map((e: any) => {
          // Separate items into services and parts based on item_type
          const items = Array.isArray(e.items) ? e.items : [];
          const services = items.filter((i: any) => i.item_type === 'service');
          const parts = items.filter((i: any) => i.item_type === 'part');

          // Build customer name from the relationship
          const customer = e.customer ? {
            firstName: e.customer.first_name || "",
            lastName: e.customer.last_name || "",
          } : null;

          return {
            id: e.id,
            estimateNo: e.id?.substring(0, 8)?.toUpperCase(),
            customer,
            vehicle: e.vehicle || null,
            items,
            services,
            parts,
            total: Number(e.total_amount) || 0,
            status: e.status || "DRAFT",
            createdAt: e.created_at,
            updatedAt: e.updated_at,
          };
        });

        setEstimates(normalized);
      } catch (err) {
        console.error("Failed to load estimates", err);
        setEstimates([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEstimates();
  }, []);

  /* ================= SEARCH + FILTER ================= */

  const filtered = useMemo(() => {
    return estimates.filter((e) => {
      const customerName = e.customer
        ? `${e.customer.firstName ?? ""} ${e.customer.lastName ?? ""}`.trim()
        : "";

      const searchMatch =
        `${e.id} ${e.estimateNo || ""} ${customerName} ${e.status}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const statusMatch =
        filters.status === "all" || e.status === filters.status;

      return searchMatch && statusMatch;
    });
  }, [estimates, search, filters]);

  const paginated = paginate(filtered);

  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  /* ================= UI ================= */

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden">

      {/* Toolbar */}
      <DataToolbar
        searchPlaceholder="Search estimates..."
        onSearch={setSearch}
        filters={statusFilterOptions}
        activeFilters={filters}
        onFilterChange={(key, value) =>
          setFilters((prev) => ({ ...prev, [key]: value }))
        }
        onAdd={() =>
          navigate("/webapp/sales/estimates/new-estimate")
        }
        addLabel="Create Estimate"
      />

      {/* Loading State */}
      {isLoading ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl px-2 overflow-hidden bg-background">
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">
              Loading estimates...
            </p>
          </div>
        </div>
      ) : estimates.length > 0 ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl overflow-hidden bg-background">

          <ScrollArea className="flex-1 px-3">
            <Table className="table-fixed w-full border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <TableHead>Estimate No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Parts</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.length > 0 ? (
                  paginated.map((e) => {
                    const config = statusConfig[e.status] || { label: e.status, variant: "default" };

                    return (
                      <TableRow
                        key={e.id}
                        onClick={() =>
                          navigate(`/webapp/sales/estimates/${e.id}`)
                        }
                        className={cn(
                          "cursor-pointer bg-card border rounded-lg hover:bg-accent/30"
                        )}
                      >
                        {/* EST-XXXXXX code; fall back to raw id for legacy records */}
                        <TableCell className="font-mono font-semibold">
                          {e.estimateNo || e.id}
                        </TableCell>

                        <TableCell>
                          {e.createdAt
                            ? new Date(e.createdAt).toLocaleDateString()
                            : "-"}
                        </TableCell>

                        <TableCell>
                          {e.customer
                            ? `${e.customer.firstName ?? ""} ${e.customer.lastName ?? ""}`.trim() || "—"
                            : "—"}
                        </TableCell>

                        <TableCell>{e.services.length}</TableCell>

                        <TableCell>{e.parts.length}</TableCell>

                        <TableCell>
                          ₱ {Number(e.total).toLocaleString()}
                        </TableCell>

                        <TableCell className="text-center">
                          <Badge
                            variant={config.variant}
                            className="w-24 justify-center"
                          >
                            {config.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="py-16 flex flex-col items-center text-center">
                        <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          No estimate records found
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Try adjusting your filters
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>

          {filtered.length > 25 && (
            <div className="border-t mx-3">
              <Pagination
                totalItems={filtered.length}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center">
            <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">
              No estimate records available
            </p>
            <p className="text-xs text-muted-foreground">
              Create an estimate to get started
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Estimates;