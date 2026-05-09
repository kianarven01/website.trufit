import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

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

/* ================= TYPES ================= */

interface Estimate {
  id: string;
  customer?: any;
  vehicle?: any;
  services: any[];
  parts: any[];
  createdAt?: string;
  updatedAt?: string;
  status: "approved" | "issued";
  total: number;
}

/* ================= STORAGE ================= */

const STORAGE_KEY = "estimates";

/* ================= STATUS CONFIG ================= */

const statusConfig = {
  approved: { label: "Approved", variant: "approved" as const },
  issued: { label: "Issued", variant: "received" as const },
};

/* ================= FILTER ================= */

const statusFilterOptions: FilterOption[] = [
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Approved", value: "approved" },
      { label: "Issued", value: "issued" },
    ],
  },
];

/* ================= COMPONENT ================= */

const Estimates: React.FC = () => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({
    status: "all",
  });

  const navigate = useNavigate();

  const { page, setPage, pageSize, setPageSize, paginate } =
    usePagination(25);

  /* ================= LOAD FROM LOCALSTORAGE ================= */

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      setEstimates([]);
      return;
    }

    try {
      const parsed: Estimate[] = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        setEstimates([]);
        return;
      }

      const normalized = parsed.map((e) => ({
        ...e,
        services: Array.isArray(e.services) ? e.services : [],
        parts: Array.isArray(e.parts) ? e.parts : [],
        total: e.total ?? 0,
        status: e.status ?? "issued",
        createdAt: e.createdAt ?? new Date().toISOString(),
      }));

      setEstimates(normalized);
    } catch (err) {
      console.error("Failed to parse estimates", err);
      setEstimates([]);
    }
  }, []);

  /* ================= SEARCH + FILTER ================= */

  const filtered = useMemo(() => {
    return estimates.filter((e) => {
      const searchMatch =
        `${e.id} ${e.status}`
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

      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Estimates</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

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

      {/* TABLE */}
      {estimates.length > 0 ? (
        <div className="flex-1 flex flex-col border rounded-xl overflow-hidden">

          <ScrollArea className="flex-1 px-3">
            <Table className="table-fixed w-full border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <TableHead>Estimate ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Parts</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.length > 0 ? (
                  paginated.map((e) => {
                    const config = statusConfig[e.status];

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
                        <TableCell>{e.id}</TableCell>

                        <TableCell>
                          {e.createdAt
                            ? new Date(e.createdAt).toLocaleDateString()
                            : "-"}
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
                    <TableCell colSpan={6}>
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