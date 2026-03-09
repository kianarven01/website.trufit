import { DashboardLayout } from "@/components/DashboardLayout";
import {
  MasterDetailPanel,
  FilterOption,
  ColumnDef,
} from "@/components/MasterDetailPanel";
import api from "@/api/axios";
import { useEffect, useMemo, useState } from "react";

interface ProductListItem {
  id: string;
  name: string;
  SKU: string;
  cost: number;
  description?: string | null;
  image_URL?: string | null;
  barcode?: string | null;
  part_number: string;
  category_id?: number | null;
  category_name?: string | null;
  unit: string;
  unit_name?: string | null;
  supplier_code: string;
  supplier_name?: string | null;
  quantity_on_hand?: number | null;
  sell_price?: number | null;
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

interface ProductFormData {
  name: string;
  cost: string;
  description: string;
  image_URL: string;
  category_id: string;
  unit: string;
  barcode: string;
  part_number: string;
  supplier_code: string;
}

const emptyForm: ProductFormData = {
  name: "",
  cost: "",
  description: "",
  image_URL: "",
  category_id: "",
  unit: "",
  barcode: "",
  part_number: "",
  supplier_code: "",
};

const Products: React.FC = () => {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductListItem | null>(
    null
  );

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({
    category: "all",
    supplier: "all",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(emptyForm);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      const data = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];

      setProducts(data);

      if (data.length > 0) {
        setSelectedProduct((prev) => prev ?? data[0]);
      } else {
        setSelectedProduct(null);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products.");
      setProducts([]);
    }
  };

  const fetchReferenceData = async () => {
    try {
      const [categoriesRes, unitsRes, suppliersRes] = await Promise.all([
        api.get("/products/categories"),
        api.get("/products/units"),
        api.get("/products/suppliers"),
      ]);

      const categoriesData = Array.isArray(categoriesRes.data?.data)
        ? categoriesRes.data.data
        : Array.isArray(categoriesRes.data)
        ? categoriesRes.data
        : [];

      const unitsData = Array.isArray(unitsRes.data?.data)
        ? unitsRes.data.data
        : Array.isArray(unitsRes.data)
        ? unitsRes.data
        : [];

      const suppliersData = Array.isArray(suppliersRes.data?.data)
        ? suppliersRes.data.data
        : Array.isArray(suppliersRes.data)
        ? suppliersRes.data
        : [];

      setCategories(categoriesData);
      setUnits(unitsData);
      //setSuppliers(suppliersData);
    } catch (err) {
      console.error("Failed to fetch reference data:", err);
      setError("Failed to load product form options.");
    }
  };

  useEffect(() => {
    const loadPage = async () => {
      setIsLoading(true);
      setError("");

      await Promise.all([fetchProducts(), fetchReferenceData()]);

      setIsLoading(false);
    };

    loadPage();
  }, []);

  const handleInputChange = (
    key: keyof ProductFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const openAddModal = () => {
    setFormData(emptyForm);
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleAddProduct = async () => {
    if (
      !formData.name ||
      !formData.cost ||
      !formData.part_number ||
      !formData.unit ||
      !formData.supplier_code
    ) {
      alert(
        "Please fill in the required fields: Name, Cost, Part Number, Unit, and Supplier."
      );
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        name: formData.name,
        cost: Number(formData.cost),
        description: formData.description || null,
        image_URL: formData.image_URL || null,
        category_id: formData.category_id ? Number(formData.category_id) : null,
        unit: formData.unit,
        barcode: formData.barcode || null,
        part_number: formData.part_number,
        supplier_code: formData.supplier_code,
      };

      await api.post("/products", payload);

      closeAddModal();
      await fetchProducts();
    } catch (err: any) {
      console.error("Failed to add product:", err?.response?.data || err);
      alert(err?.response?.data?.message || "Failed to add product.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (filters.category !== "all") {
          return String(product.category_id) === filters.category;
        }
        return true;
      })
      .filter((product) => {
        if (filters.supplier !== "all") {
          return product.supplier_code === filters.supplier;
        }
        return true;
      })
      .filter((product) => {
        const query = searchQuery.toLowerCase();

        return (
          product.name.toLowerCase().includes(query) ||
          product.SKU.toLowerCase().includes(query) ||
          (product.barcode ?? "").toLowerCase().includes(query) ||
          (product.part_number ?? "").toLowerCase().includes(query) ||
          (product.category_name ?? "").toLowerCase().includes(query) ||
          (product.supplier_name ?? "").toLowerCase().includes(query)
        );
      });
  }, [products, filters.category, filters.supplier, searchQuery]);

  const filterOptions: FilterOption[] = [
    {
      key: "category",
      label: "Category",
      options: categories.map((category) => ({
        value: String(category.id),
        label: category.name,
      })),
    },
    {
      key: "supplier",
      label: "Supplier",
      options: suppliers.map((supplier) => ({
        value: supplier.id,
        label: supplier.CompanyName,
      })),
    },
  ];

  const columns: ColumnDef<ProductListItem>[] = [
    {
      key: "product",
      label: "Product",
      render: (product) => (
        <div className="flex items-center gap-3">
          <img
            src={product.image_URL || "https://via.placeholder.com/40"}
            alt={product.name}
            className="h-10 w-10 rounded object-cover"
          />
          <div className="flex flex-col">
            <span className="font-medium text-slate-900">{product.name}</span>
            <span className="text-xs text-slate-500">
              {product.part_number}
            </span>
          </div>
        </div>
      ),
    },
    { key: "SKU", label: "SKU", render: (product) => product.SKU || "-" },
    {
      key: "category_name",
      label: "Category",
      render: (product) => product.category_name || "-",
    },
    {
      key: "supplier_name",
      label: "Supplier",
      render: (product) => product.supplier_name || "-",
    },
    {
      key: "unit_name",
      label: "Unit",
      render: (product) => product.unit_name || "-",
    },
    {
      key: "cost",
      label: "Cost",
      render: (product) => `₱${Number(product.cost || 0).toFixed(2)}`,
    },
    {
      key: "sell_price",
      label: "Sell Price",
      render: (product) =>
        product.sell_price != null
          ? `₱${Number(product.sell_price).toFixed(2)}`
          : "-",
    },
    {
      key: "quantity_on_hand",
      label: "Stock",
      render: (product) =>
        product.quantity_on_hand != null ? String(product.quantity_on_hand) : "-",
    },
  ];

  return (
    <DashboardLayout>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">
            Manage product master data, pricing, and stock visibility.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Add Product
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <MasterDetailPanel<ProductListItem>
        title="Products"
        description={
          isLoading ? "Loading products..." : "View and manage all products"
        }
        items={filteredProducts}
        selectedItem={selectedProduct}
        onSelect={setSelectedProduct}
        getItemId={(product) => product.id}
        columns={columns}
        filters={filterOptions}
        activeFilters={filters}
        onFilterChange={(key, value) =>
          setFilters((prev) => ({ ...prev, [key]: value }))
        }
        searchPlaceholder="Search by name, SKU, barcode, part number..."
        onSearch={(query) => setSearchQuery(query)}
      >
        {selectedProduct ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{selectedProduct.name}</h2>

            <img
              src={
                selectedProduct.image_URL || "https://via.placeholder.com/240"
              }
              alt={selectedProduct.name}
              className="h-60 w-60 rounded border border-slate-300 object-cover"
            />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">SKU:</span>{" "}
                {selectedProduct.SKU || "-"}
              </div>
              <div>
                <span className="font-semibold">Part Number:</span>{" "}
                {selectedProduct.part_number || "-"}
              </div>
              <div>
                <span className="font-semibold">Category:</span>{" "}
                {selectedProduct.category_name || "-"}
              </div>
              <div>
                <span className="font-semibold">Unit:</span>{" "}
                {selectedProduct.unit_name || "-"}
              </div>
              <div>
                <span className="font-semibold">Barcode:</span>{" "}
                {selectedProduct.barcode || "-"}
              </div>
              <div>
                <span className="font-semibold">Supplier:</span>{" "}
                {selectedProduct.supplier_name || "-"}
              </div>
              <div>
                <span className="font-semibold">Cost:</span> ₱
                {Number(selectedProduct.cost || 0).toFixed(2)}
              </div>
              <div>
                <span className="font-semibold">Sell Price:</span>{" "}
                {selectedProduct.sell_price != null
                  ? `₱${Number(selectedProduct.sell_price).toFixed(2)}`
                  : "-"}
              </div>
              <div>
                <span className="font-semibold">Quantity on Hand:</span>{" "}
                {selectedProduct.quantity_on_hand ?? "-"}
              </div>
              <div>
                <span className="font-semibold">Description:</span>{" "}
                {selectedProduct.description || "-"}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-500">
            {isLoading
              ? "Loading product details..."
              : "Select a product to view details."}
          </div>
        )}
      </MasterDetailPanel>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Add Product</h2>
              <button
                type="button"
                onClick={closeAddModal}
                className="rounded-md px-3 py-1 text-sm text-slate-500 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Product Name *
                </label>
                <input
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter product name"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Cost *
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={formData.cost}
                  onChange={(e) => handleInputChange("cost", e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Category
                </label>
                <select
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={formData.category_id}
                  onChange={(e) =>
                    handleInputChange("category_id", e.target.value)
                  }
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Unit *
                </label>
                <select
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={formData.unit}
                  onChange={(e) => handleInputChange("unit", e.target.value)}
                >
                  <option value="">Select unit</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Supplier *
                </label>
                <select
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={formData.supplier_code}
                  onChange={(e) =>
                    handleInputChange("supplier_code", e.target.value)
                  }
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.CompanyName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Part Number *
                </label>
                <input
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={formData.part_number}
                  onChange={(e) =>
                    handleInputChange("part_number", e.target.value)
                  }
                  placeholder="Enter part number"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Barcode
                </label>
                <input
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={formData.barcode}
                  onChange={(e) =>
                    handleInputChange("barcode", e.target.value)
                  }
                  placeholder="Enter barcode"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Image URL
                </label>
                <input
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={formData.image_URL}
                  onChange={(e) =>
                    handleInputChange("image_URL", e.target.value)
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Enter product description"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeAddModal}
                className="rounded-xl border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddProduct}
                disabled={isSaving}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Products;