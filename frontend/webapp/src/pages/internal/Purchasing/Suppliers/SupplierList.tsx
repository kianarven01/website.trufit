import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

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
import api from "@/api/axios";

/* TYPES */
interface Supplier {
  id: string;
  name: string;
  supplierCode: string;
  email: string;
  phone: string;
  contactPerson: string;
  viber: string;
  address: string;
}

const SupplierList: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const navigate = useNavigate();

  const { page, setPage, pageSize, setPageSize, paginate } = usePagination(25);

  const [isLoading, setIsLoading] = useState(true);

  /* LOAD */
  const loadSuppliers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/suppliers');
      const rows = Array.isArray(res.data?.data) ? res.data.data : res.data;
      setSuppliers(rows);
    } catch (error) {
      console.error("Failed to load suppliers:", error);
      setSuppliers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSuppliers();
  }, []);

  /* FILTER */
const filtered = suppliers.filter((s) => {
  const q = search.toLowerCase().trim();

  if (!q) return true;

  return (
    s.name?.toLowerCase().includes(q) ||
    s.supplierCode?.toLowerCase().includes(q) ||
    s.email?.toLowerCase().includes(q) ||
    s.phone?.toLowerCase().includes(q) ||
    s.viber?.toLowerCase().includes(q) ||
    s.contactPerson?.toLowerCase().includes(q)
  );
}  );

  const paginated = paginate(filtered);

  /* SAVE / UPDATE */
  const handleSaveSupplier = async (newSupplier: Supplier) => {
    try {
      if (editingSupplier) {
        await api.put(`/suppliers/${newSupplier.id}`, newSupplier);
      } else {
        await api.post('/suppliers', newSupplier);
      }
      await loadSuppliers();
    } catch (error) {
      console.error("Failed to save supplier:", error);
      throw error;
    }
  };

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden select-none">
      {/* Toolbar */}

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

      {/* TABLE + PAGINATION */}
      {isLoading ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl px-2 overflow-hidden bg-background">
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">
              Loading suppliers...
            </p>
          </div>
        </div>
      ) : suppliers.length > 0 ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl overflow-hidden bg-background">

          {/* Scrollable Table */}
          <ScrollArea className="flex-1 px-3">
            <Table className="table-fixed w-full border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-[25%]">Supplier</TableHead>
                  <TableHead className="text-center w-[15%]">Viber</TableHead>
                  <TableHead className="text-center w-[25%]">Email</TableHead>
                  <TableHead className="text-center w-[15%]">Phone</TableHead>
                  <TableHead className="text-center w-[20%]">Contact</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginated.length > 0 ? (
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
                      <TableCell className="py-2">
                        <div className="flex flex-col items-start pl-4">
                          <p className="font-semibold text-foreground text-sm">{s.name}</p>
                          <p className="text-[11px] text-muted-foreground leading-none mt-0.5">
                            {s.supplierCode}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{s.viber || "-"}</TableCell>
                      <TableCell className="text-center">{s.email || "-"}</TableCell>
                      <TableCell className="text-center">{s.phone || "-"}</TableCell>
                      <TableCell className="text-center">{s.contactPerson || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="py-16 flex flex-col items-center text-center">
                        <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          No suppliers found
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
          </ScrollArea>

          <div className="border-t px-4">
            <Pagination
              totalItems={filtered.length}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </div>
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