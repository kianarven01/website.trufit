import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/axios";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, Package } from "lucide-react";

interface ProductListItem {
  id: string;
  name: string;
  SKU: string;
  cost: number;
  description?: string | null;
  image_URL?: string | null;
  barcode?: string | null;
  part_number?: string | null;
  category_id?: number | null;
  category_name?: string | null;
  unit?: string | null;
  unit_name?: string | null;
  supplier_code?: string | null;
  supplier_name?: string | null;
  quantity_on_hand?: number | null;
  sell_price?: number | null;
}

interface CategoryOption {
  id: string;
  name: string;
  code: string;
}

interface VariantOption {
  id: string;
  name: string;
  year: string;
  engine: string;
  transmission: string;
  oilCapacity?: number;
  serviceClass?: string;
}

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();

  const { vehicleModelId, vehicleSlug, variantId, categoryId } = useParams<{
    vehicleModelId: string;
    vehicleSlug: string;
    variantId: string;
    categoryId: string;
  }>();

  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [variants, setVariants] = useState<VariantOption[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const vehicleTitle = useMemo(() => {
    if (!vehicleSlug) return "Vehicle";
    return vehicleSlug
      .split("-")
      .map((s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s))
      .join(" ");
  }, [vehicleSlug]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === categoryId) ?? null,
    [categories, categoryId]
  );

  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === variantId) ?? null,
    [variants, variantId]
  );

  useEffect(() => {
    const fetchPageData = async () => {
      if (!vehicleModelId || !variantId || !categoryId) return;

      setLoading(true);

      try {
        const [categoriesRes, variantsRes, productsRes] = await Promise.all([
          api.get<CategoryOption[] | { data: CategoryOption[] }>("/products/categories"),
          api.get<VariantOption[]>(`/vehicles/models/${vehicleModelId}/variants`),
          api.get<ProductListItem[]>("/products", {
            params: {
              variant_id: variantId,
              category_id: categoryId,
            },
          }),
        ]);

        const fetchedCategories = Array.isArray(categoriesRes.data)
          ? categoriesRes.data
          : categoriesRes.data.data ?? [];

        const fetchedVariants = Array.isArray(variantsRes.data) ? variantsRes.data : [];
        const fetchedProducts = Array.isArray(productsRes.data) ? productsRes.data : [];

        setCategories(fetchedCategories);
        setVariants(fetchedVariants);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Failed to fetch products page data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [vehicleModelId, variantId, categoryId]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;

    return products.filter((product) => {
      return (
        product.name?.toLowerCase().includes(term) ||
        product.SKU?.toLowerCase().includes(term) ||
        product.part_number?.toLowerCase().includes(term) ||
        product.supplier_name?.toLowerCase().includes(term)
      );
    });
  }, [products, search]);

  return (
    <div className="w-full h-full p-4 flex flex-col gap-4 overflow-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate("/webapp/products/product-catalog")}>
              Product Catalog
            </BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() =>
                navigate(`/webapp/products/product-catalog/${vehicleModelId}/${vehicleSlug}`)
              }
            >
              {vehicleTitle}
            </BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbPage>{selectedCategory?.name ?? "Parts List"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">
            {selectedCategory?.name ?? "Parts List"}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
            {selectedVariant && <span>{selectedVariant.name}</span>}
            {selectedCategory?.code && <Badge variant="outline">{selectedCategory.code}</Badge>}
          </div>
        </div>

        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading products...
          </CardContent>
        </Card>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground flex flex-col items-center gap-3">
            <Package className="w-10 h-10 opacity-40" />
            <div>
              <p className="font-medium">No products found</p>
              <p className="text-sm">
                There are no compatible products under this category and variant yet.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition">
              <CardContent className="p-4 flex gap-4">
                <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {product.image_URL ? (
                    <img
                      src={product.image_URL}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-tight">{product.name}</h3>
                    {product.sell_price != null && (
                      <Badge variant="secondary">₱{Number(product.sell_price).toFixed(2)}</Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    SKU: {product.SKU || "—"}
                  </p>

                  {product.part_number && (
                    <p className="text-sm text-muted-foreground">
                      Part No: {product.part_number}
                    </p>
                  )}

                  {product.supplier_name && (
                    <p className="text-sm text-muted-foreground">
                      Supplier: {product.supplier_name}
                    </p>
                  )}

                  {product.description && (
                    <p className="text-sm line-clamp-2 text-muted-foreground">
                      {product.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    {product.unit_name && <Badge variant="outline">{product.unit_name}</Badge>}
                    {product.category_name && (
                      <Badge variant="outline">{product.category_name}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;