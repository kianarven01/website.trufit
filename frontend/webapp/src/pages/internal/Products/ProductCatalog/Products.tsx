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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Variant {
  id: string;
  name: string;
  year: string;
  engine: string;
  transmission: string;
  drivetrain: string;
}

interface Category {
  id: string;
  name: string;
}

interface Part {
  id: string;
  name: string;
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

  // 🚨 Guard: invalid route params
  if (!vehicleSlug || !variantId || !categoryId) {
    return <div className="p-4">Invalid route</div>;
  }

  // Vehicle name
  const [make, model] = vehicleSlug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));

  const [variant, setVariant] = useState<Variant | undefined>();
  const [category, setCategory] = useState<Category | undefined>();
  const [parts, setParts] = useState<Part[]>([]);

  useEffect(() => {
    const variants: Variant[] = JSON.parse(localStorage.getItem("variants") || "[]");
    const categories: Category[] = JSON.parse(localStorage.getItem("categories") || "[]");
    const savedParts: Part[] = JSON.parse(localStorage.getItem("parts") || "[]");

    const foundVariant = variants.find((v) => v.id === variantId);
    const foundCategory = categories.find((c) => c.id === categoryId);

    // 🚨 HARD FAIL → redirect if invalid
    if (!foundVariant || !foundCategory) {
      navigate("/webapp/products/product-catalog");
      return;
    }

    setVariant(foundVariant);
    setCategory(foundCategory);

    const filteredParts = savedParts.filter(
      (p) => p.variantId === variantId && p.categoryId === categoryId
    );

    setParts(filteredParts);
  }, [variantId, categoryId, navigate]);

  // ⛔ Block render until data is valid
  if (!variant || !category) {
    return null; // or loading spinner
  }

  return (
    <div className="w-full h-full p-4 flex flex-col space-y-4">

      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>

          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() =>
                navigate("/webapp/products/product-catalog")
              }
            >
              Product Catalog
            </BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() =>
                navigate("/webapp/products/product-catalog/")
              }
            >
              {make} {model}
            </BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() =>
                navigate(`/webapp/products/product-catalog/${vehicleSlug}`)
              }            
            >
              {variant.name}
            </BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() =>
                navigate(
                  `/webapp/products/product-catalog/${vehicleSlug}`)
              }
            >
              {category.name}
            </BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbPage>
              Products
            </BreadcrumbPage>
          </BreadcrumbItem>

        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Parts List
        </h2>

        <Button
          size="sm"
          onClick={() => {
            console.log("Add part");
          }}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Part
        </Button>
      </div>

      {/* Parts List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            {category.name}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          {parts.length > 0 ? (
            parts.map((part) => (
              <div
                key={part.id}
                className="p-4 border rounded-lg hover:shadow-sm transition"
              >
                <p className="font-medium">{part.name}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              No parts found for this category.
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default ProductList;