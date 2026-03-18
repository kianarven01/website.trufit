import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import DataToolbar from "@/components/DataToolbar";
import { Card, CardContent } from "@/components/ui/card";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

import { ProductModal } from "@/components/popupModal/ProductCatalog/addProduct";
import { Image as ImageIcon } from "lucide-react";

interface Variant {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface Part {
  id: string;
  name: string;
  sku: string;
  price: number;
  unit: string;
  image?: string;
  brandId: string;
  variantId: string;
  categoryId: string;
}

const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const { vehicleSlug, variantId, categoryId } = useParams<{
    vehicleSlug: string;
    variantId: string;
    categoryId: string;
  }>();

  const [variant, setVariant] = useState<Variant>();
  const [category, setCategory] = useState<Category>();
  const [supplier, setSupplier] = useState<Supplier[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [filteredParts, setFilteredParts] = useState<Part[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!vehicleSlug || !variantId || !categoryId) {
    return <div className="p-4">Invalid route</div>;
  }

  

  const [make, model] = vehicleSlug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));

  // Load parts, variant, category
  useEffect(() => {
    const variants: Variant[] = JSON.parse(localStorage.getItem("variants") || "[]");
    const categories: Category[] = JSON.parse(localStorage.getItem("categories") || "[]");
    const suppliers: Supplier[] = JSON.parse(localStorage.getItem("suppliers") || "[]");
    const savedParts: Part[] = JSON.parse(localStorage.getItem("parts") || "[]");

    const foundVariant = variants.find((v) => v.id === variantId);
    const foundCategory = categories.find((c) => c.id === categoryId);

    if (!foundVariant || !foundCategory) {
      navigate("/webapp/products/product-catalog");
      return;
    }

    setVariant(foundVariant);
    setCategory(foundCategory);
    setSupplier(suppliers);

    const filtered = savedParts.filter(
      (p) => p.variantId === variantId && p.categoryId === categoryId
    );

    setParts(filtered);
    setFilteredParts(filtered);
  }, [variantId, categoryId, navigate]);

  // Search filter
  useEffect(() => {
    setFilteredParts(
      parts.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, parts]);

  const handleAddPart = (newPart: Part) => {
    const savedParts: Part[] = JSON.parse(localStorage.getItem("parts") || "[]");
    const updatedParts = [...savedParts, newPart];
    localStorage.setItem("parts", JSON.stringify(updatedParts));

    const filtered = updatedParts.filter(
      (p) => p.variantId === variantId && p.categoryId === categoryId
    );

    setParts(filtered);
    setFilteredParts(filtered);
    setIsModalOpen(false);
  };

  if (!variant || !category) return null;

  return (
    <div className="w-full h-full p-4 flex flex-col space-y-4">

      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate("/webapp/products/product-catalog")}>
              Product Catalog
            </BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate("/webapp/products/product-catalog")}>
              {make} {model}
            </BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate(`/webapp/products/product-catalog/${vehicleSlug}`)}>
              {variant.name}
            </BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate(`/webapp/products/product-catalog/${vehicleSlug}`)}>
              {category.name}
            </BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>Products</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Toolbar */}
      <DataToolbar
        searchPlaceholder="Search parts..."
        onSearch={(v) => setSearchQuery(v)}
        onAdd={() => setIsModalOpen(true)}
        addLabel="Add Part"
      />

      {/*Products Table */}
      {filteredParts.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Part Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Unit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredParts.map((part) => (
              <TableRow key={part.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {part.image ? (
                      <img
                        src={part.image}
                        alt={part.name}
                        className="h-8 w-8 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <span className="font-medium">{part.name}</span>
                      <p className="text-muted-foreground text-xs">
                        {part.brandId}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{part.sku}</TableCell>
                <TableCell>${part.price.toFixed(2)}</TableCell>
                <TableCell>{part.unit}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/*Empty state */}
      {filteredParts.length === 0 && (
        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No products found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search or add a new product.
            </p>
          </CardContent>
        </Card>
      )}

      {/*Add Product Modal */}
      {isModalOpen && (
        <ProductModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          product={null}
          categories={[
            { id: category.id, name: category.name, code: category.id },
          ]}
          suppliers={supplier.map((s) => ({ id: s.id, name: s.name, supplier_code: s.id }))}
          onSaved={() => Promise.resolve()}
        />
      )}
    </div>
  );
};

export default ProductList;