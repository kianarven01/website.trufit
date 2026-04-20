import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
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
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Pagination, usePagination } from "@/components/ui/pagination";
import DataToolbar from "@/components/DataToolbar";
import AddCustomer from "@/components/popupModal/Customers/addCustomer";
import { ImageIcon } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  address: string;
  mobileNumber: string;
  landline?: string;
  email?: string;
  businessPhone?: string;
}

interface VehicleModel {
  id: string;
  year: number;
  make: string;
  model: string;
  variant: string;
}

interface Vehicle {
  id: string;
  customerId: string;
  vehicleModelId: string;
  color: string;
  plateNo: string;
  engineNo: string;
  vin: string;
  registrationNo: string;
  sellingDealer: string;
  hasWarranty?: boolean;
}

const STORAGE_KEY = "customers";

/* ✅ DUMMY DATA */
const generateDummyCustomers = (): Customer[] => {
  return Array.from({ length: 30 }, (_, i) => ({
    id: `cust-${i + 1}`,
    name: `Customer ${i + 1}`,
    address: `Street ${i + 1}, City`,
    mobileNumber: `0917${String(1000000 + i)}`,
    landline: i % 2 === 0 ? `02-${String(8000000 + i)}` : "",
    email: `customer${i + 1}@mail.com`,
    businessPhone: `02-${String(7000000 + i)}`,
  }));
};

const CustomersList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const navigate = useNavigate();

  const { page, setPage, pageSize, setPageSize, paginate } =
    usePagination(25);

  /* ✅ LOAD WITH AUTO-SEED */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed: Customer[] = JSON.parse(stored);

        if (!parsed.length) {
          const dummy = generateDummyCustomers();
          setCustomers(dummy);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dummy));
        } else {
          setCustomers(parsed);
        }
      } else {
        const dummy = generateDummyCustomers();
        setCustomers(dummy);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dummy));
      }
    } catch (err) {
      console.error("Failed to load customers", err);

      const dummy = generateDummyCustomers();
      setCustomers(dummy);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dummy));
    }
  }, []);

  /* SAVE */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  }, [customers]);

  /* FILTER */
  const filtered = useMemo(() => {
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.mobileNumber.toLowerCase().includes(search.toLowerCase())
    );
  }, [customers, search]);

  const paginated = paginate(filtered);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Customer Records</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <DataToolbar
        searchPlaceholder="Search customers..."
        onSearch={setSearch}
        onAdd={() => setCustomerModalOpen(true)}
        addLabel="Add Customer"
      />

      {customers.length > 0 ? (
        <div className="flex-1 flex flex-col border rounded-xl px-2 overflow-hidden">

          <ScrollArea className="flex-1">
            <Table className="table-fixed w-full border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4">Name</TableHead>
                  <TableHead className="w-1/4">Address</TableHead>
                  <TableHead className="w-1/5">Mobile</TableHead>
                  <TableHead className="w-1/5">Landline</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.length > 0 ? (
                  paginated.map((c) => (
                    <TableRow
                      key={c.id}
                      onClick={() => navigate(`${c.id}`)}
                      className={cn(
                        "cursor-pointer transition-all rounded-lg border border-border/60 bg-card shadow-sm hover:shadow-md",
                        "hover:bg-accent/30"
                      )}
                    >
                      <TableCell className="py-0.5">
                        <div className="flex flex-col">
                          <p className="font-medium">{c.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{c.address}</TableCell>
                      <TableCell>{c.mobileNumber}</TableCell>
                      <TableCell>{c.landline || "—"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="py-16 flex flex-col items-center text-center">
                        <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          No customers found
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

          {filtered.length > 0 && (
            <div className="border-t bg-background">
              <Pagination
                totalItems={filtered.length}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center">
            <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">No customers available</p>
            <p className="text-xs text-muted-foreground">
              Add a customer to get started
            </p>
          </CardContent>
        </Card>
      )}

      <AddCustomer
        open={customerModalOpen}
        onOpenChange={setCustomerModalOpen}
        onSaved={(newCustomer: Customer) => {
          setCustomers((prev) => [newCustomer, ...prev]);
        }}
      />
    </div>
  );
};

export default CustomersList;