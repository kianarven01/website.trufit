import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Pagination, usePagination } from "@/components/ui/pagination";
import DataToolbar from "@/components/DataToolbar";

import { Wrench } from "lucide-react";
import api from "@/api/axios";

/* ================= TYPES ================= */
interface ServiceCategory {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  serviceCategoryId: string;
  category?: string; // from backend ServiceType.category
  tasks?: string[];
  pricingType: "fixed" | "hourly rate";
}

/* ================= COMPONENT ================= */
const ServiceCatalogList: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    category: "all",
    pricingType: "all",
  });

  const { page, setPage, pageSize, setPageSize, paginate } =
    usePagination(25);

  /* ================= LOAD ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch Service Types from backend
        const res = await api.get('/products/service-types');
        const data = res.data.data.map((s: any) => ({
          id: s.id,
          name: s.name,
          category: s.service_category?.name || s.category,
          serviceCategoryId: s.service_category_id ? s.service_category_id.toString() : null,
          tasks: s.tasks || [],
          pricingType: s.pricing_type || "fixed"
        }));
        setServices(data);

        // Fetch actual categories for filtering
        const catRes = await api.get('/products/service-categories');
        setCategories(catRes.data.data.map((c: any) => ({ 
          id: c.id.toString(), 
          name: c.name 
        })));

      } catch (err) {
        console.error("Failed to load services", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ================= MAP ================= */
  const categoryMap = useMemo(() => {
    const map = new Map<string, ServiceCategory>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  /* ================= SEARCH ================= */
  const normalize = (val: string) =>
    (val || "").toLowerCase().trim();

  const filtered = useMemo(() => {
    const q = normalize(search);

    return services.filter((s) => {
      const category = categoryMap.get(s.serviceCategoryId);

      const matchesCategory =
        filters.category === "all" ||
        s.serviceCategoryId === filters.category;

      const matchesPricing =
        filters.pricingType === "all" ||
        s.pricingType === filters.pricingType;

      const textBlob = normalize(`
        ${s.name}
        ${s.tasks?.join(', ')}
        ${category?.name}
      `);

      const matchesSearch = !q || textBlob.includes(q);

      return matchesCategory && matchesPricing && matchesSearch;
    });
  }, [services, categoryMap, search, filters]);

  const paginated = paginate(filtered);

  /* ================= FILTER OPTIONS ================= */
  const categoryOptions = useMemo(
    () =>
      categories.map((c) => ({
        label: c.name,
        value: c.id,
      })),
    [categories]
  );

  const pricingOptions = [
    { label: "Fixed Price", value: "fixed" },
    { label: "Hourly Rate", value: "hourly rate" }, 
  ];

  const toolbarFilters = [
    { key: "category", label: "Category", options: categoryOptions },
    { key: "pricingType", label: "Pricing", options: pricingOptions },
  ];

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  /* ================= UI ================= */

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden">
      <DataToolbar
        searchPlaceholder="Search services..."
        onSearch={setSearch}
        onAdd={() => navigate("/webapp/services/service-catalog/new-service")}
        addLabel="Add Service"
        filters={toolbarFilters}
        onFilterChange={handleFilterChange}
        activeFilters={filters}
      />

      {isLoading ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl px-2 overflow-hidden bg-background">
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading services...</p>
          </div>
        </div>
      ) : filtered.length > 0 ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl overflow-hidden bg-background">
          <ScrollArea className="flex-1 px-3">
            <Table className="table-fixed w-full border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[28%] text-center">Service</TableHead>
                  <TableHead className="w-[22%] text-center">Category</TableHead>
                  <TableHead className="w-[32%] text-center">Tasks</TableHead>
                  <TableHead className="w-[18%] text-center">Pricing</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginated.map((s) => {
                  const category = categoryMap.get(s.serviceCategoryId);
                  return (
                    <TableRow
                      key={s.id}
                      onClick={() => navigate(`/webapp/services/service-catalog/${s.id}`)}
                      className="cursor-pointer transition-all rounded-lg border border-border/60 bg-card shadow-sm hover:shadow-md hover:bg-accent/30"
                    >
                      <TableCell className="py-2.5 text-left pl-8">
                        <span className="font-semibold text-sm">{s.name}</span>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">{s.category || "—"}</TableCell>
                      <TableCell className="text-center text-muted-foreground truncate text-xs">
                        {s.tasks && s.tasks.length > 0 ? s.tasks.join(', ') : "No tasks"}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex w-fit items-center rounded-md border px-2.5 py-1 text-xs font-medium border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          {s.pricingType === "hourly rate" ? "Hourly Rate" : "Fixed Price"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>

          <div className="border-t mx-3">
            <Pagination
              totalItems={filtered.length}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl px-2 overflow-hidden bg-background">
          <div className="py-16 flex flex-col items-center text-center">
            <Wrench className="h-6 w-6 mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">No services found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCatalogList;