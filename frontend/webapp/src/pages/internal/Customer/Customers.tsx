import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Pagination, usePagination } from "@/components/ui/pagination";
import DataToolbar from "@/components/DataToolbar";
import AddCustomer from "@/components/popupModal/addCustomer";

import { ImageIcon } from "lucide-react";


interface Customer {
  id: string;
  name: string;
  address: string;
  mobileNumber: string;
  landline?: string;
  email: string;
  businessPhone?: string;
}

const CustomersList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const navigate = useNavigate();
  const { page, setPage, pageSize, setPageSize, paginate } = usePagination(25);

  // Dummy data
  useEffect(() => {
    const dummy: Customer[] = Array.from({ length: 50 }, (_, i) => ({
      id: `cust-${i + 1}`,
      name: `Customer ${i + 1}`,
      address: `Address ${i + 1}`,
      mobileNumber: `0917-000-000${i}`,
      email: `customer${i + 1}@email.com`,
      vehicles: Array.from({ length: Math.floor(Math.random() * 4) }, (_, j) => ({
        yearMakeModel: `Car ${j + 1}`,
        color: ["Red", "Blue", "Black"][j % 3],
        plateNo: `ABC-${i}${j}`,
        vin: `VIN${i}${j}`,
        kilometers: Math.floor(Math.random() * 100000),
        engineNo: `ENG${i}${j}`,
      })),
    }));

    setCustomers(dummy);
  }, []);

  const filtered = useMemo(() => {
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.mobileNumber.toLowerCase().includes(search.toLowerCase())
    );
  }, [customers, search]);

  const paginated = paginate(filtered);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize, setPage]);

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden">

      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Customer Records</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Toolbar */}
      <DataToolbar
        searchPlaceholder="Search customers..."
        onSearch={setSearch}
        onAdd={() => 
          setCustomerModalOpen(true)
        }
        addLabel="Add Customer"
      />

      {/* Table */}
      {customers.length > 0 ? (
        <ScrollArea className="flex-1 h-0 border rounded-xl px-2 flex flex-col">
          <div className="flex-1 overflow-auto">
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
                {paginated.length > 0 ? (
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
                          <p className="text-xs text-muted-foreground">{c.email}</p>
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
                        <p className="text-sm font-medium">No customers found</p>
                        <p className="text-xs text-muted-foreground">Try adjusting your search</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Sticky Pagination */}
          {filtered.length > 0 && (
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
            <p className="text-sm font-medium">No customers available</p>
            <p className="text-xs text-muted-foreground">Add a customer to get started</p>
          </CardContent>
        </Card>
      )}

      {/* Add / Edit Customer Modal */}
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