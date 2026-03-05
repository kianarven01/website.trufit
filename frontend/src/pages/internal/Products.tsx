import { DashboardLayout } from "@/components/DashboardLayout";
import { MasterDetailPanel, FilterOption, ColumnDef } from "@/components/MasterDetailPanel";
import { useState, useMemo } from "react";

interface Product {
  id: number;
  image: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  barcode: string;
  manufacturer: string;
  unit: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      image: "https://via.placeholder.com/40",
      name: "Widget A",
      sku: "WGT-A-001",
      category: "Widgets",
      description: "High-quality widget for everyday use",
      barcode: "1234567890123",
      manufacturer: "Widget Corp",
      unit: "pcs",
    },
    {
      id: 2,
      image: "https://via.placeholder.com/40",
      name: "Gadget B",
      sku: "GDT-B-002",
      category: "Gadgets",
      description: "Reliable gadget for tech enthusiasts",
      barcode: "9876543210987",
      manufacturer: "Gadget Co",
      unit: "pcs",
    },
    // Add more dummy products here
  ]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({
    category: "all",
    manufacturer: "all",
  });

  // Filter + search logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (filters.category && filters.category !== "all") {
          return p.category === filters.category;
        }
        return true;
      })
      .filter((p) => {
        if (filters.manufacturer && filters.manufacturer !== "all") {
          return p.manufacturer === filters.manufacturer;
        }
        return true;
      })
      .filter((p) => {
        const query = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
        );
      });
  }, [products, filters.category, filters.manufacturer, searchQuery]);

  // Dynamic filter options
  const categoryOptions = useMemo(() => {
    const categories = Array.from(new Set(products.map((p) => p.category)));
    return categories.map((c) => ({ value: c, label: c }));
  }, [products]);

  const manufacturerOptions = useMemo(() => {
    const manufacturers = Array.from(new Set(products.map((p) => p.manufacturer)));
    return manufacturers.map((m) => ({ value: m, label: m }));
  }, [products]);

  const filterOptions: FilterOption[] = [
    { key: "category", label: "Category", options: categoryOptions },
    { key: "manufacturer", label: "Manufacturer", options: manufacturerOptions },
  ];

  // Table columns
  const columns: ColumnDef<Product>[] = [
    {
      key: "image",
      label: "Image",
      render: (p) => <img src={p.image} alt={p.name} className="h-8 w-8 object-cover rounded" />,
    },
    { key: "name", label: "Product Name", render: (p) => p.name },
    { key: "sku", label: "SKU", render: (p) => p.sku },
    { key: "category", label: "Category", render: (p) => p.category },
    { key: "description", label: "Description", render: (p) => p.description },
    { key: "barcode", label: "Barcode", render: (p) => p.barcode },
    { key: "manufacturer", label: "Manufacturer", render: (p) => p.manufacturer },
    { key: "unit", label: "Unit", render: (p) => p.unit },
  ];

  return (
    <DashboardLayout>
      <MasterDetailPanel<Product>
        title="Products"
        description="Manage all product details"
        items={filteredProducts}
        selectedItem={selectedProduct}
        onSelect={setSelectedProduct}
        getItemId={(p) => p.id.toString()}
        columns={columns}
        filters={filterOptions}
        activeFilters={filters}
        onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        searchPlaceholder="Search products..."
        onSearch={(query) => setSearchQuery(query)}
        addLabel="Add Product"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{selectedProduct.name}</h2>
            <img src={selectedProduct.image} alt={selectedProduct.name} className="h-20 w-20 object-cover rounded" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-semibold">SKU:</span> {selectedProduct.sku}</div>
              <div><span className="font-semibold">Category:</span> {selectedProduct.category}</div>
              <div><span className="font-semibold">Description:</span> {selectedProduct.description}</div>
              <div><span className="font-semibold">Barcode:</span> {selectedProduct.barcode}</div>
              <div><span className="font-semibold">Manufacturer:</span> {selectedProduct.manufacturer}</div>
              <div><span className="font-semibold">Unit:</span> {selectedProduct.unit}</div>
            </div>
          </div>
        )}
      </MasterDetailPanel>
    </DashboardLayout>
  );
};

export default Products;