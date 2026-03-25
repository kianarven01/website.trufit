import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
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
import { ScrollArea } from "@/components/ui/scrollArea";
import { Pagination, usePagination } from "@/components/ui/pagination";

import SupplierModal from "@/components/popupModal/Purchasing/addSupplier";
import { ImageIcon } from "lucide-react";

/* TYPES */
interface Supplier {
  id: string;
  name: string;
  supplierCode: string;
  email: string;
  phone: string;
  contactPerson: string;
  viber: string;
  isVAT: boolean;
  vatRate: number;
}

const STORAGE_KEY = "suppliers";

/* DUMMY */
const generateDummySuppliers = (): Supplier[] => {
  return Array.from({ length: 30 }, (_, i) => ({
    id: `sup-${i + 1}`,
    name: `Supplier ${i + 1}`,
    supplierCode: `SUP-${String(i + 1).padStart(3, "0")}`,
    email: `supplier${i + 1}@example.com`,
    phone: `0917${String(1000000 + i)}`,
    contactPerson: `Contact ${i + 1}`,
    viber: `0917${String(2000000 + i)}`,
    isVAT: i % 2 === 0,
    vatRate: i % 2 === 0 ? 12 : 0,
  }));
};

const SupplierList: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const navigate = useNavigate();

  /* PAGINATION */
  const { page, setPage, pageSize, setPageSize, paginate } = usePagination(25);

  /* LOAD */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored);

      if (parsed.length === 0) {
        const dummy = generateDummySuppliers();
        setSuppliers(dummy);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dummy));
      } else {
        setSuppliers(parsed);
      }
    } else {
      const dummy = generateDummySuppliers();
      setSuppliers(dummy);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dummy));
    }
  }, []);

  /* SAVE */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
  }, [suppliers]);

  /* RESET PAGE ON SEARCH */
  useEffect(() => {
    setPage(1);
  }, [search]);

  /* FILTER */
  const filtered = suppliers.filter((s) =>
    `${s.name} ${s.supplierCode} ${s.email} ${s.phone} ${s.contactPerson} ${s.viber}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const paginated = paginate(filtered);

  const handleSaveSupplier = (newSupplier: Supplier) => {
    setSuppliers((prev) => {
      const exists = prev.find((s) => s.id === newSupplier.id);

      if (exists) {
        return prev.map((s) =>
          s.id === newSupplier.id ? newSupplier : s
        );
      }

      return [newSupplier, ...prev];
    });
  };

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden select-none">

      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Suppliers</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Toolbar */}
      <DataToolbar
        searchPlaceholder="Search suppliers..."
        onSearch={setSearch}
        onAdd={() => {
          setEditingSupplier(null);
          setOpen(true);
        }}
        addLabel="Add Supplier"
      />

      {/* TABLE */}
      {suppliers.length > 0 ? (
        <ScrollArea className="flex-1 h-0 border rounded-xl px-2 flex flex-col">
          
          <div className="flex-1 overflow-auto">
            <Table className="table-fixed w-full border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Viber</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.length > 0 ? (
                  paginated.map((s) => (
                    <TableRow
                      key={s.id}
                      onClick={() =>
                        navigate(`/webapp/purchasing/suppliers/${s.id}`)
                      }
                      className={cn(
                        "cursor-pointer transition-all rounded-lg border border-border/60 bg-card shadow-sm hover:shadow-md",
                        "hover:bg-accent/30"
                      )}
                    >
                      <TableCell
                        className={cn(
                          "py-0.5"
                        )}
                      >
                        <div>
                          <p className="font-medium text-sm">{s.name}</p>
                          <p className="text-[12px] text-muted-foreground">
                            {s.supplierCode}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{s.viber}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>{s.phone}</TableCell>
                      <TableCell>{s.contactPerson}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="py-16 flex flex-col items-center text-center">
                        <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">No suppliers found</p>
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

          {/* Pagination */}
          {filtered.length > pageSize && (
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
              No current suppliers available
            </p>
            <p className="text-xs text-muted-foreground">
              Add a new supplier to get started
            </p>
          </CardContent>
        </Card>
      )}

      <SupplierModal
        open={open}
        onOpenChange={setOpen}
        supplier={editingSupplier}
        onSaved={handleSaveSupplier}
      />
    </div>
  );
};

export default SupplierList;