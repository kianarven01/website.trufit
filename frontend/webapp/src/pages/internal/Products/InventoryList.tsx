import { DashboardLayout } from "@/components/DashboardLayout";
import { MasterDetailPanel, FilterOption, ColumnDef } from "@/components/MasterDetailPanel";
import { Button } from "@/components/ui/button";
import { ProductModal } from "@/components/popupModal/ProductCatalog/addProduct";
import { useState, useMemo } from "react";
import { Printer } from "lucide-react";

interface StockMovement {
  id: string;
  date: string;
  type: "IN" | "OUT";
  qty: number;
  reference: string;
}

interface Product {
  id: string;
  image: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  price: number;
  cost: number;
  partNumber: string;
  engineNo: string;
  barcode: string;
  suppliers: string[];
  unit: string;

  minStock: number;
  currentStock: number;

  movements: StockMovement[];
}

const InventoryList: React.FC = () => {
  const [products] = useState<Product[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [filters, setFilters] = useState<Record<string, string>>({
    category: "all",
  });

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
          p.category.toLowerCase().includes(q)
        );
      });
  }, [products, filters, searchQuery]);

  const categoryOptions = useMemo(() => {
    const categories = Array.from(new Set(products.map((p) => p.category)));
    return categories.map((c) => ({ value: c, label: c }));
  }, [products]);

  const filterOptions: FilterOption[] = [
    { key: "category", label: "Category", options: categoryOptions },
  ];

const columns: ColumnDef<Product>[] = [
  {
    key: "product",
    label: "Product Name",
    render: (p) => (
      <div className="flex items-center gap-3">
        <img src={p.image} alt={p.name} className="h-9 w-9 rounded border object-cover" />
        <span className="font-medium">{p.name}</span>
      </div>
    ),
  },
  { key: "sku", label: "SKU", render: (p) => p.sku },

  { key: "unit", label: "Unit", render: (p) => p.unit },

  {
    key: "minStock",
    label: "Min Stock",
    render: (p) => p.minStock,
  },

  {
    key: "currentStock",
    label: "Current Stock",
    render: (p) => (
      <span
        className={`font-medium ${
          p.currentStock <= p.minStock
            ? "text-red-600"
            : "text-green-600"
        }`}
      >
        {p.currentStock}
      </span>
    ),
  },
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
        onFilterChange={(key, value) =>
          setFilters((prev) => ({ ...prev, [key]: value }))
        }
        searchPlaceholder="Search products..."
        onSearch={(query) => setSearchQuery(query)}
      >
        {selectedProduct && (
          <div className="space-y-6 select-none">

          {/* HEADER */}
          <div className="border-b pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{selectedProduct.name}</h2>
              <p className="text-sm text-gray-500">SKU: {selectedProduct.sku}</p>    
            </div> 
            <div className="flex gap-2">
              {/* RESTOCK */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log("Restock product", selectedProduct);
                }}
              >
                Restock
              </Button>

              {/* USE PRODUCT */}
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  console.log("Use product", selectedProduct);
                }}
              >
                Use Product
              </Button>
              </div>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-[260px_1fr] gap-6">

              {/* LEFT SIDE */}
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

                  <button className="p-2 rounded hover:bg-gray-200">
                    <Printer className="h-4 w-4" />
                  </button>
                </div>

              </div>

              {/* PRODUCT DETAILS TABLE */}
              <div className="border rounded-lg bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="w-48 px-4 py-2 font-medium border-r">
                        Category
                      </td>
                      <td className="px-4 py-2">
                        {selectedProduct.category}
                      </td>
                    </tr>

                    <tr className="border-b">
                      <td className="px-4 py-2 font-medium border-r">
                        Unit
                      </td>
                      <td className="px-4 py-2">
                        {selectedProduct.unit}
                      </td>
                    </tr>

                    <tr className="border-b">
                      <td className="px-4 py-2 font-medium border-r">
                        Cost
                      </td>
                      <td className="px-4 py-2">
                        ₱{selectedProduct.cost}
                      </td>
                    </tr>

                    <tr className="border-b">
                      <td className="px-4 py-2 font-medium border-r">
                        Price
                      </td>
                      <td className="px-4 py-2">
                        ₱{selectedProduct.price}
                      </td>
                    </tr>

                    <tr className="border-b">
                      <td className="px-4 py-2 font-medium border-r">
                        Part No.
                      </td>
                      <td className="px-4 py-2">
                        {selectedProduct.partNumber}
                      </td>
                    </tr>

                    <tr className="border-b">
                      <td className="px-4 py-2 font-medium border-r">
                        Engine No.
                      </td>
                      <td className="px-4 py-2">
                        {selectedProduct.engineNo}
                      </td>
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

              {/* SUPPLIERS CARD */}
              <div className="col-span-2 border rounded-lg bg-white">
                <div className="px-4 py-3 border-b font-semibold text-sm text-gray-600">
                  Suppliers
                </div>

                <div className="p-4 flex flex-wrap gap-3">
                  {selectedProduct.suppliers.map((s, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 border rounded-md bg-gray-50 text-sm"
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* MOVEMENT HISTORY */}
                <div className="col-span-2 border rounded-lg bg-white">
                <div className="px-4 py-3 border-b font-semibold text-sm text-gray-600">
                    Movement History
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Type</th>
                        <th className="px-4 py-2 text-left">Qty</th>
                        <th className="px-4 py-2 text-left">Reference</th>
                        </tr>
                    </thead>

                    <tbody>
                        {selectedProduct.movements.map((m) => (
                        <tr key={m.id} className="border-t">
                            <td className="px-4 py-2">{m.date}</td>

                            <td className="px-4 py-2">
                            <span
                                className={`px-2 py-1 rounded text-xs ${
                                m.type === "IN"
                                    ? "bg-green-100 text-green-700"
                                    : m.type === "OUT"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                            >
                                {m.type}
                            </span>
                            </td>

                            <td className="px-4 py-2">{m.qty}</td>

                            <td className="px-4 py-2">{m.reference}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </div>

            </div>
          </div>
        )}
      </MasterDetailPanel>
      <ProductModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        product={editingProduct}
        onSaved={() => {
          console.log("Product added");
          setEditingProduct(null);
        }}
      />
    </DashboardLayout>
  );
};

export default InventoryList;