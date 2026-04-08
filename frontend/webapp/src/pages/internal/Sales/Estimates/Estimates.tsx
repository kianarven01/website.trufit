import { useEffect, useState } from "react";
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

/* TYPES */
interface ServiceItem {
  id: string;
  name: string;
  category: string;
  vehicleSize: string;
  hourlyRate: number;
}

interface PartItem {
  id: string;
  image?: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  unit: string;
  currentStock: number;
}

interface Estimate {
  id: string;
  estimateNo: string;
  services: ServiceItem[];
  parts: PartItem[];
  date: string;
  status: "approved" | "issued";
  total: number;
}

/* STORAGE */
const STORAGE_KEY = "estimates";

/* DUMMY DATA */
const generateDummyEstimates = (): Estimate[] => {
  return Array.from({ length: 26 }, (_, i) => {
    const services = Array.from(
      { length: Math.floor(Math.random() * 5) + 1 },
      (_, j) => ({
        name: `Service ${j + 1}`,
        category: "General",
        price: Math.floor(Math.random() * 2000) + 500,
      })
    );

    const parts = Array.from(
      { length: Math.floor(Math.random() * 5) + 1 },
      (_, j) => {
        const qty = Math.floor(Math.random() * 5) + 1;
        const price = Math.floor(Math.random() * 1500) + 200;

        return {
          name: `Part ${j + 1}`,
          sku: `SKU-${i}${j}`,
          currentStock: 10,
          unit: "pcs",
          quantity: qty,
          price,
        };
      }
    );

    const total =
      services.reduce((s, x) => s + x.price, 0) +
      parts.reduce((s, x) => s + x.price * x.quantity, 0);

    return {
      id: `est-${i + 1}`,
      estimateNo: `EST-${1000 + i}`,
      services,
      parts,
      date: new Date().toISOString().split("T")[0],
      status: i % 2 === 0 ? "approved" : "issued",
      total,
    };
  });
};

/* STATUS CONFIG */
type BadgeVariant = "approved" | "received";

const statusConfig: Record<
  Estimate["status"],
  { variant: BadgeVariant; label: string }
> = {
  approved: { variant: "approved", label: "Approved" },
  issued: { variant: "received", label: "Issued" },
};

/* STATUS FILTER OPTIONS */
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

const Estimates: React.FC = () => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({
    status: "all",
  });
  const navigate = useNavigate();

  const { page, setPage, pageSize, setPageSize, paginate } =
    usePagination(25);

  /* LOAD */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored);

      if (!parsed.length) {
        const dummy = generateDummyEstimates();
        setEstimates(dummy);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dummy));
      } else {
        setEstimates(parsed);
      }
    } else {
      const dummy = generateDummyEstimates();
      setEstimates(dummy);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dummy));
    }
  }, []);

  /* SAVE */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estimates));
  }, [estimates]);

  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  /* FILTERED + SEARCHED DATA */
  const filtered = estimates.filter((e) => {
    const matchesSearch = `${e.estimateNo} ${e.status}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      filters.status === "all" || e.status === filters.status;

    return matchesSearch && matchesStatus;
  });

  const paginated = paginate(filtered);

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
        onAdd={() => {
          navigate("/webapp/sales/estimates/new-estimate");
        }}
        addLabel="Create Estimate"
      />

      {/* TABLE + PAGINATION */}
      {estimates.length > 0 ? (
        <div className="flex-1 flex flex-col border rounded-xl overflow-hidden">

          <ScrollArea className="flex-1 px-3">
            <Table className="table-fixed w-full border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <TableHead>Estimate No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="lg:w-[15%] text-center">Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.length > 0 ? (
                  paginated.map((e) => {
                    const { variant, label } = statusConfig[e.status];

                    return (
                      <TableRow
                        key={e.id}
                        onClick={() =>
                          navigate(`/webapp/sales/estimates/${e.id}`)
                        }
                        className={cn(
                          "cursor-pointer transition-all rounded-lg border border-border/60 bg-card shadow-sm hover:shadow-md",
                          "hover:bg-accent/30"
                        )}
                      >
                        <TableCell>{e.estimateNo}</TableCell>
                        <TableCell>{e.date}</TableCell>
                        <TableCell>{e.services.length}</TableCell>
                        <TableCell>{e.parts.length}</TableCell>
                        <TableCell>
                          ₱ {e.total.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={variant} className="lg:w-1/2 justify-center">{label}</Badge>
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
                          Try adjusting your search
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>

          {filtered.length > 25 && (
            <div className="border-t bg-background">
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