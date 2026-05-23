import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Pagination, usePagination } from "@/components/ui/pagination";
import DataToolbar from "@/components/DataToolbar";

import { ImageIcon } from "lucide-react";
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
  description?: string;
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
          description: s.description || "No description provided",
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
        ${s.description}
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

      <div className="flex-1 flex flex-col border border-border/60 rounded-xl overflow-hidden bg-background">
        <ScrollArea className="flex-1 px-3">
          <Table className="table-fixed w-full border-separate border-spacing-y-2">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4 text-center">Service</TableHead>
                <TableHead className="w-1/4 text-center">Category</TableHead>
                <TableHead className="text-center">Description</TableHead>
                <TableHead className="w-[15%] text-center">Pricing</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="py-20 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                      <p className="text-sm font-medium text-muted-foreground animate-pulse">
                        Loading services...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="py-16 flex flex-col items-center text-center">
                      <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">No services available</p>
                      <p className="text-xs text-muted-foreground">Add a service to get started</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length > 0 ? (
                paginated.map((s) => {
                  const category = categoryMap.get(s.serviceCategoryId);

                  return (
                    <TableRow
                      key={s.id}
                      onClick={() => navigate(`/webapp/services/service-catalog/${s.id}`)}
                      className="rounded-lg border bg-card shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <TableCell className="font-medium text-center">{s.name}</TableCell>
                      <TableCell className="text-center">{s.category || "—"}</TableCell>
                      <TableCell className="text-muted-foreground truncate text-center">{s.description}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {s.pricingType === "hourly rate" ? "Hourly Rate" : "Fixed Price"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="py-16 flex flex-col items-center text-center">
                      <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">No services found</p>
                      <p className="text-xs text-muted-foreground">Try adjusting your search or filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        {filtered.length > 0 && (
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
    </div>
  );
};

export default ServiceCatalogList;