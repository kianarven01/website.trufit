import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/DashboardLayout";
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
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { ImageIcon, Ellipsis } from "lucide-react";

/* ================= TYPES ================= */
interface InventoryItem {
  id: string;
  image?: string;
  name: string;
  brand: string;
  sku: string;
  partNumber: string;
  unit: string;
  stock: number;
}

/* ================= STOCK STATUS ================= */
const getStockStatus = (stock: number) => {
  if (stock === 0) {
    return {
      label: "Out of Stock",
      value: "out-of-stock",
      className: "bg-red-100 text-red-600",
    };
  }
  if (stock <= 5) {
    return {
      label: "Near Out",
      value: "near-out",
      className: "bg-orange-100 text-orange-600",
    };
  }
  if (stock <= 10) {
    return {
      label: "Low Stock",
      value: "low-stock",
      className: "bg-yellow-100 text-yellow-600",
    };
  }
  return {
    label: "In Stock",
    value: "in-stock",
    className: "bg-green-100 text-green-600",
  };
};

/* ================= COMPONENT ================= */
const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  const { page, setPage, pageSize, setPageSize, paginate } =
    usePagination(25);

  const STORAGE_KEY = "inventory_items";

  /* ================= DUMMY DATA ================= */
const generatePartNumber = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  const randomLetters = Array.from({ length: 3 }, () =>
    letters[Math.floor(Math.random() * letters.length)]
  ).join("");

  const randomNumbers = Array.from({ length: 5 }, () =>
    numbers[Math.floor(Math.random() * numbers.length)]
  ).join("");

  return `${randomLetters}-${randomNumbers}`; 
  // Example: ABC-48291
};

  const generateDummy = (): InventoryItem[] => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: `inv-${i + 1}`,
      image: i % 3 === 0 ? "" : `https://via.placeholder.com/40`,
      name: `Product ${i + 1}`,
      brand: ["Toyota", "Honda"][i % 2],
      sku: `SKU-${1000 + i}`,
      partNumber: generatePartNumber(), 
      unit: ["pcs", "box", "set"][i % 3],
      stock: Math.floor(Math.random() * 20),
    }));
  };

  /* ================= LOAD ================= */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored);
      if (!parsed.length) {
        const dummy = generateDummy();
        setItems(dummy);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dummy));
      } else {
        setItems(parsed);
      }
    } else {
      const dummy = generateDummy();
      setItems(dummy);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dummy));
    }
  }, []);

  /* ================= SAVE ================= */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  /* ================= FILTER ================= */
  const filtered = items.filter((p) =>
    `${p.name} ${p.brand} ${p.sku} ${p.partNumber}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const paginated = paginate(filtered);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 p-4 h-full w-full">
        
        {/* toolbar */}

        {/* toolbar */}
        <DataToolbar
          searchPlaceholder="Search inventory..."
          onSearch={setSearch}
          onAdd={() => console.log("adjust stock")}
          addLabel="Adjust Stock"
        />

        {/* ================= TABLE ================= */}
        {items.length > 0 ? (
          <ScrollArea className="flex-1 h-0 border rounded-xl px-2 flex flex-col">
            <div className="flex-1 overflow-auto">
              <Table className="table-fixed w-full border-separate border-spacing-y-2">
                
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-3/12">Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Part No.</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[8%]" />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filtered.length > 0 ? (
                    paginated.map((p) => {
                      const status = getStockStatus(p.stock);

                      return (
                        <TableRow
                          key={p.id}
                          className={cn(
                            "transition-all rounded-lg border border-border/60 bg-card shadow-sm hover:shadow-md",
                            "hover:bg-accent/30"
                          )}
                        >
                          {/* PRODUCT */}
                          <TableCell className="py-2">
                            <div className="flex items-center gap-3">
                              {p.image && !imgError[p.id] ? (
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-12 h-10 rounded-md object-cover border"
                                  onError={() =>
                                    setImgError((prev) => ({
                                      ...prev,
                                      [p.id]: true,
                                    }))
                                  }
                                />
                              ) : (
                                <div className="w-12 h-10 flex items-center justify-center rounded-md border">
                                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                                </div>
                              )}

                              <div className="flex flex-col">
                                <span className="font-medium">{p.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {p.brand}
                                </span>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>{p.sku}</TableCell>
                          <TableCell>{p.partNumber}</TableCell>

                          {/* STOCK */}
                          <TableCell>
                            <span className="font-medium">{p.stock}</span>
                          </TableCell>

                          <TableCell>{p.unit}</TableCell>

                          {/* STATUS */}
                          <TableCell>
                            <span
                              className={cn(
                                "text-xs px-2 py-0.5 rounded-full flex items-center gap-1 w-fit",
                                status.className
                              )}
                            >
                              <span className=" rounded-full bg-current" />
                              {status.label}
                            </span>
                          </TableCell>
                            
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="icon_xs"
                            >
                              <Ellipsis className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <div className="py-16 flex flex-col items-center text-center">
                          <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            No inventory found
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Try adjusting your search
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* ================= PAGINATION ================= */}
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
                No inventory available
              </p>
              <p className="text-xs text-muted-foreground">
                Adjust stock to get started
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Inventory;