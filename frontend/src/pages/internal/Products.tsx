import { DashboardLayout } from "@/components/DashboardLayout";
import {
  MasterDetailPanel,
  FilterOption,
  ColumnDef,
} from "@/components/MasterDetailPanel";
import { Button } from "@/components/ui/button";
import { ProductModal } from "@/components/popupModal/addProduct";
import { useEffect, useMemo, useState } from "react";
import { Printer } from "lucide-react";
import api from "@/api/axios";

interface ProductApiItem {
  id: string;
  name: string;
  SKU: string;
  cost: number;
  description?: string | null;
  image_URL?: string | null;
  barcode?: string | null;
  part_number: string;
  category_id?: number | null;
  unit: string;
  supplier_code: string;
  category_name?: string | null;
  unit_name?: string | null;
  supplier_name?: string | null;
}

interface Product {
  id: string;
  image: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  cost: number;
  partNumber: string;
  barcode: string;
  supplierName: string;
  unit: string;
  categoryId?: number | null;
  supplierCode: string;
}

interface CategoryOption {
  id: number;
  name: string;
  code: string;
}

interface UnitOption {
  id: string;
  name: string;
}

interface SupplierOption {
  id: string;
  CompanyName: string;
  supplier_code: string;
}

const mapProduct = (item: ProductApiItem): Product => {
  return {
    id: item.id,
    image: item.image_URL || "https://via.placeholder.com/240",
    name: item.name || "",
    sku: item.SKU || "",
    category: item.category_name || "Uncategorized",
    description: item.description || "-",
    cost: Number(item.cost ?? 0),
    partNumber: item.part_number || "-",
    barcode: item.barcode || "-",
    supplierName: item.supplier_name || "-",
    unit: item.unit_name || item.unit || "-",
    categoryId: item.category_id ?? null,
    supplierCode: item.supplier_code,
  };
};

const AvailableProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);

  const [filters, setFilters] = useState<Record<string, string>>({
    category: "all",
  });

  const fetchProducts = async () => {
    try {
      setError("");

      const response = await api.get("/products");
      const rawData: ProductApiItem[] = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];

      const mapped: Product[] = rawData.map(mapProduct);

      setProducts(mapped);
      setSelectedProduct((prev) => {
        if (!mapped.length) return null;
        if (!prev) return mapped[0];
        return mapped.find((p) => p.id === prev.id) || mapped[0];
      });
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products.");
      setProducts([]);
      setSelectedProduct(null);
    }
  };

  const fetchReferenceData = async () => {
    try {
      const [categoriesRes, unitsRes, suppliersRes] = await Promise.all([
        api.get("/products/categories"),
        api.get("/products/units"),
        api.get("/products/suppliers"),
      ]);

      const categoriesData: CategoryOption[] = Array.isArray(categoriesRes.data?.data)
        ? categoriesRes.data.data
        : [];

      const unitsData: UnitOption[] = Array.isArray(unitsRes.data?.data)
        ? unitsRes.data.data
        : [];

      const suppliersData: SupplierOption[] = Array.isArray(suppliersRes.data?.data)
        ? suppliersRes.data.data
        : [];

      setCategories(categoriesData);
      setUnits(unitsData);
      setSuppliers(suppliersData);
    } catch (err) {
      console.error("Failed to fetch reference data:", err);
      setError("Failed to load product form options.");
    }
  };

  useEffect(() => {
    const loadPage = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchReferenceData()]);
      setLoading(false);
    };

    loadPage();
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (filters.category !== "all") return p.category === filters.category;
        return true;
      })
      .filter((p) => {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.partNumber.toLowerCase().includes(q) ||
          p.barcode.toLowerCase().includes(q)
        );
      });
  }, [products, filters.category, searchQuery]);

  const categoryOptions = useMemo(() => {
    return categories.map((category) => ({
      value: category.name,
      label: category.name,
    }));
  }, [categories]);

  const filterOptions: FilterOption[] = [
    { key: "category", label: "Category", options: categoryOptions },
  ];

  const columns: ColumnDef<Product>[] = [
    {
      key: "product",
      label: "Product",
      render: (p: Product) => (
        <div className="flex items-center gap-3">
          <img
            src={p.image}
            alt={p.name}
            className="h-9 w-9 rounded border object-cover"
          />
          <span className="font-medium">{p.name}</span>
        </div>
      ),
    },
    { key: "sku", label: "SKU", render: (p: Product) => p.sku || "-" },
    { key: "category", label: "Category", render: (p: Product) => p.category || "-" },
    { key: "unit", label: "Unit", render: (p: Product) => p.unit || "-" },
    { key: "barcode", label: "Barcode", render: (p: Product) => p.barcode || "-" },
  ];

  return (
    <DashboardLayout>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <MasterDetailPanel<Product>
        title="Products"
        description={loading ? "Loading products..." : "Manage all product details"}
        items={filteredProducts}
        selectedItem={selectedProduct}
        onSelect={setSelectedProduct}
        getItemId={(p) => p.id}
        columns={columns}
        filters={filterOptions}
        activeFilters={filters}
        onFilterChange={(key, value) =>
          setFilters((prev) => ({ ...prev, [key]: value }))
        }
        searchPlaceholder="Search products..."
        onSearch={(query) => setSearchQuery(query)}
        addLabel="Add Product"
        onAdd={() => {
          setEditingProduct(null);
          setModalOpen(true);
        }}
      >
        {selectedProduct ? (
          <div className="space-y-6 select-none">
            <div className="border-b pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{selectedProduct.name}</h2>
                <p className="text-sm text-gray-500">SKU: {selectedProduct.sku}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingProduct(selectedProduct);
                  setModalOpen(true);
                }}
              >
                Edit
              </Button>
            </div>

            <div className="grid grid-cols-[260px_1fr] gap-6">
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-white flex justify-center">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="h-60 object-contain"
                  />
                </div>

                <div className="border rounded-lg p-3 flex justify-between items-center bg-gray-50">
                  <span className="text-xs tracking-widest">
                    {selectedProduct.barcode}
                  </span>

                  <button type="button" className="p-2 rounded hover:bg-gray-200">
                    <Printer className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="border rounded-lg bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="w-48 px-4 py-2 font-medium border-r">
                        Category
                      </td>
                      <td className="px-4 py-2">{selectedProduct.category}</td>
                    </tr>

                    <tr className="border-b">
                      <td className="px-4 py-2 font-medium border-r">Unit</td>
                      <td className="px-4 py-2">{selectedProduct.unit}</td>
                    </tr>

                    <tr className="border-b">
                      <td className="px-4 py-2 font-medium border-r">Cost</td>
                      <td className="px-4 py-2">
                        ₱{selectedProduct.cost.toFixed(2)}
                      </td>
                    </tr>

                    <tr className="border-b">
                      <td className="px-4 py-2 font-medium border-r">
                        Part No.
                      </td>
                      <td className="px-4 py-2">{selectedProduct.partNumber}</td>
                    </tr>

                    <tr className="border-t">
                      <td className="px-4 py-3 font-medium border-r align-top">
                        Description
                      </td>
                      <td className="px-4 py-3 h-[120px] align-top">
                        {selectedProduct.description}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="col-span-2 border rounded-lg bg-white">
                <div className="px-4 py-3 border-b font-semibold text-sm text-gray-600">
                  Supplier
                </div>

                <div className="p-4 flex flex-wrap gap-3">
                  <div className="px-3 py-2 border rounded-md bg-gray-50 text-sm">
                    {selectedProduct.supplierName}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-500">
            {loading ? "Loading product details..." : "Select a product to view details."}
          </div>
        )}
      </MasterDetailPanel>

      <ProductModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        product={editingProduct}
        categories={categories}
        units={units}
        suppliers={suppliers}
        onSaved={async () => {
          await fetchProducts();
          setEditingProduct(null);
        }}
      />
    </DashboardLayout>
  );
};

export default AvailableProducts;