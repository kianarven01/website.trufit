import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import DataToolbar, { FilterOption } from "@/components/DataToolbar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Badge } from "@/components/ui/badge";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { ImageIcon } from "lucide-react";

/* ================= TYPES ================= */
interface Product {
  id: string;
  image?: string;
  name: string;
  brand: string;
  manufacturer: string;
  supplier: string;
  sku: string;
  partNumber: string;
  unit: string;
  price: number;
}

/* ================= HELPERS ================= */
const fromSlug = (slug?: string) =>
  slug
    ?.split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ") || "";

/* ================= COMPONENT ================= */
const ProductsList: React.FC = () => {
  const navigate = useNavigate();
  const { vehicleSlug, variantSlug, categorySlug } = useParams<{
  vehicleSlug: string;
  variantSlug: string;
  categorySlug: string;
}>();

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  const [filtersState, setFiltersState] = useState<Record<string, string>>({
    manufacturer: "all",
    supplier: "all",
  });

  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  const { page, setPage, pageSize, setPageSize, paginate } =
    usePagination(25);

  const STORAGE_KEY =
    variantSlug && categorySlug
      ? `products_${variantSlug}_${categorySlug}`
      : "products_temp";


  /* ================= DUMMY DATA ================= */
  const generateDummyProducts = (): Product[] => {
    const manufacturers = ["Bosch", "Denso", "NGK"];
    const suppliers = ["AutoHub", "PartsPro", "SpeedZone"];

    return Array.from({ length: 60 }, (_, i) => ({
      id: `prod-${i + 1}`,
      image: i % 3 === 0 ? "" : `https://via.placeholder.com/40`,
      name: `Product ${i + 1}`,
      brand: ["Toyota", "Honda"][i % 2],
      manufacturer: manufacturers[i % manufacturers.length],
      supplier: suppliers[i % suppliers.length],
      sku: `SKU-${1000 + i}`,
      partNumber: `PRT-${1000 + i}`,
      unit: ["pcs", "set", "box"][i % 3],
      price: Math.floor(Math.random() * 5000) + 500,
    }));
  };

  /* ================= LOAD ================= */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored);

      if (!parsed.length) {
        const dummy = generateDummyProducts();
        setProducts(dummy);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dummy));
      } else {
        setProducts(parsed);
      }
    } else {
      const dummy = generateDummyProducts();
      setProducts(dummy);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dummy));
    }
  }, [STORAGE_KEY]);

  /* ================= SAVE ================= */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products, STORAGE_KEY]);

  useEffect(() => {
    setPage(1);
  }, [search, filtersState]);

  /* ================= FILTER OPTIONS ================= */
  const manufacturerOptions = Array.from(
    new Set(products.map((p) => p.manufacturer))
  ).map((m) => ({ label: m, value: m }));

  const supplierOptions = Array.from(
    new Set(products.map((p) => p.supplier))
  ).map((s) => ({ label: s, value: s }));

  const filters: FilterOption[] = [
    {
      key: "manufacturer",
      label: "Manufacturer",
      options: manufacturerOptions,
    },
    {
      key: "supplier",
      label: "Supplier",
      options: supplierOptions,
    },
  ];

  /* ================= FILTER LOGIC ================= */
  const filtered = products.filter((p) => {
    const matchesSearch = `${p.name} ${p.brand} ${p.sku} ${p.partNumber}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesManufacturer =
      filtersState.manufacturer === "all" ||
      p.manufacturer === filtersState.manufacturer;

    const matchesSupplier =
      filtersState.supplier === "all" ||
      p.supplier === filtersState.supplier;

    return matchesSearch && matchesManufacturer && matchesSupplier;
  });

  const paginated = paginate(filtered);

  /* ================= BREADCRUMB ================= */
  const [make, model] = vehicleSlug
    ? vehicleSlug
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    : ["", ""];
     
  const variantName = variantSlug ? fromSlug(variantSlug) : "Variant";
  const categoryName = categorySlug ? fromSlug(categorySlug) : "Category";
      

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden">
      
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate("/webapp/products/product-catalog")}>
              Product Catalog
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate("/webapp/products/product-catalog")}>
              {`${make} ${model}`}
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate(`/webapp/products/product-catalog/${vehicleSlug}`)}>
              {variantName}
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate(`/webapp/products/product-catalog/${vehicleSlug}`)}>
              {categoryName}
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>Products</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Toolbar */}
      <DataToolbar
        searchPlaceholder={`Search ${categoryName} products...`}
        onSearch={setSearch}
        filters={filters}
        activeFilters={filtersState}
        onFilterChange={(key, value) =>
          setFiltersState((prev) => ({ ...prev, [key]: value }))
        }
        onAdd={() => console.log("open add product modal")}
        addLabel="Add Product"
      />

      {/* TABLE */}
      {products.length > 0 ? (
        <ScrollArea className="flex-1 h-0 border rounded-xl px-2 flex flex-col">
          <div className="flex-1 overflow-auto">
            <Table className="table-fixed w-full border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/6">Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Part Number</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Selling Price</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.length > 0 ? (
                  paginated.map((p) => (
                    <TableRow
                      key={p.id}
                      onClick={() => navigate(`/webapp/products/${p.id}`)}
                      className={cn(
                        "cursor-pointer transition-all rounded-lg border border-border/60 bg-card shadow-sm hover:shadow-md",
                        "hover:bg-accent/30"
                      )}
                    >
                      {/* PRODUCT CELL */}
                      <TableCell className="py-2">
                        <div className="flex items-center gap-3">
                          
                          {/* IMAGE / PLACEHOLDER */}
                          {p.image && !imgError[p.id] ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-12 h-10 rounded-md object-cover border"
                            />
                          ) : (
                            <div className="w-12 h-10 flex items-center justify-center rounded-md border">
                              <ImageIcon className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}

                          {/* TEXT */}
                          <div className="flex flex-col">
                            <span className="font-medium">{p.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {p.brand}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>{p.sku}</TableCell>

                      <TableCell> {p.partNumber} </TableCell>

                      <TableCell>{p.unit}</TableCell>

                      <TableCell>
                        ₱ {p.price.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="py-16 flex flex-col items-center text-center">
                        <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          No products found
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
          </div>

          {/* PAGINATION */}
          {filtered.length > 25 && (
            <div className="sticky bottom-0 bg-background z-10">
              <Pagination
                totalItems={filtered.length}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          )}
        </ScrollArea>
      ) : (
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center">
            <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">
              No products available
            </p>
            <p className="text-xs text-muted-foreground">
              Add a product to get started
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductsList;