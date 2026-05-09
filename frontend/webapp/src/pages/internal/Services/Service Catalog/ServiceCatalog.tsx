import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Pagination, usePagination } from "@/components/ui/pagination";
import DataToolbar from "@/components/DataToolbar";

import { ImageIcon, Library } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ================= STORAGE ================= */
const CATEGORY_KEY = "serviceCategories";
const SERVICE_KEY = "services";

/* ================= TYPES ================= */
interface ServiceCategory {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  serviceCategoryId: string;
  description?: string;
  pricingType: "fixed" | "hourly";
}

/* ================= HELPERS ================= */
const genId = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(27).substring(2);

/* ================= DUMMY SEED ================= */
const seedData = () => {
  if (localStorage.getItem(SERVICE_KEY)) return;

  const categories: ServiceCategory[] = [
    { id: genId(), name: "Maintenance" },
    { id: genId(), name: "Repair" },
    { id: genId(), name: "Detailing" },
    { id: genId(), name: "Inspection" },
  ];

  const services: Service[] = [];

  const names = [
    "Oil Change",
    "Brake Service",
    "Engine Tune-up",
    "Car Wash",
    "Interior Cleaning",
    "Battery Replacement",
    "Tire Rotation",
    "Wheel Alignment",
    "Aircon Cleaning",
    "Full Inspection",
  ];

  for (let i = 0; i < 27; i++) {
    services.push({
      id: genId(),
      name: `${names[i % names.length]} ${i + 1}`,
      serviceCategoryId: categories[i % categories.length].id,
      description: "Standard service package",
      pricingType: i % 2 === 0 ? "fixed" : "hourly",
    });
  }

  localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
  localStorage.setItem(SERVICE_KEY, JSON.stringify(services));
};

/* ================= COMPONENT ================= */
const ServiceCatalogList: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    category: "all",
    pricingType: "all",
  });

  const { page, setPage, pageSize, setPageSize, paginate } =
    usePagination(25);

  /* ================= LOAD ================= */
  useEffect(() => {
    seedData();

    setCategories(JSON.parse(localStorage.getItem(CATEGORY_KEY) || "[]"));
    setServices(JSON.parse(localStorage.getItem(SERVICE_KEY) || "[]"));
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
    { label: "Hourly Rate", value: "hourly" }, 
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

  if (services.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 flex flex-col items-center text-center">
          <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">
            No services available
          </p>
          <p className="text-xs text-muted-foreground">
            Add a service to get started
          </p>
        </CardContent>
      </Card>
    );
  }

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

      <div className="flex-1 flex flex-col border rounded-xl overflow-hidden">
        <ScrollArea className="flex-1 px-3">
          <Table className="table-fixed w-full border-separate border-spacing-y-2">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">Service</TableHead>
                <TableHead className="w-1/4">Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[15%]">Pricing</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.length > 0 ? (
                paginated.map((s) => {
                  const category = categoryMap.get(
                    s.serviceCategoryId
                  );

                  return (
                    <TableRow
                      key={s.id}
                      onClick={() => navigate(`/webapp/services/service-catalog/${s.id}`)}
                      className="rounded-lg border bg-card shadow-sm hover:shadow-md"
                    >
                      <TableCell>
                        {s.name}
                      </TableCell>

                      <TableCell>
                        {category?.name}
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {s.description}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline">
                          {s.pricingType === "hourly"
                            ? "Hourly Rate"
                            : "Fixed Price"}
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
                      <p className="text-sm font-medium">
                        No services found
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your search or filters
                      </p>
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