import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Pagination, usePagination } from "@/components/ui/pagination";
import SupplierModal from "@/components/popupModal/Purchasing/addSupplier"; 
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

import { Mail, Phone, User, MessageCircle, Edit, Trash2, Percent } from "lucide-react";

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

interface Transaction {
  id: string;
  date: string;
  time: string;
  partsOrdered: number;
  amount: number;
  status: string;
}

interface Product {
  id: string;
  name: string;
  partNumber: string;
  price: number;
  stock: number;
}

const STORAGE_KEY = "suppliers";

const generateDummyTransactions = (): Transaction[] =>
  Array.from({ length: 10 }, (_, i) => ({
    id: `txn-${i}`,
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString(),
    partsOrdered: Math.floor(Math.random() * 10),
    amount: Math.floor(Math.random() * 10000),
    status: i % 2 === 0 ? "Completed" : "Pending",
  }));

const generateDummyProducts = (): Product[] =>
  Array.from({ length: 12 }, (_, i) => ({
    id: `prod-${i}`,
    name: `Part ${i + 1}`,
    partNumber: `PRT-${1000 + i}`,
    price: Math.floor(Math.random() * 5000),
    stock: Math.floor(Math.random() * 50),
  }));

const SupplierDetails: React.FC = () => {
  const { supplierId } = useParams<{ supplierId: string }>();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { page, setPage, pageSize, setPageSize, paginate } = usePagination(25);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const parsed: Supplier[] = JSON.parse(stored);
    const found = parsed.find((s) => s.id === supplierId);
    if (found) setSupplier(found);
  }, [supplierId]);

  useEffect(() => {
    setTransactions(generateDummyTransactions());
    setProducts(generateDummyProducts());
  }, []);

  const handleSaveSupplier = (updated: Supplier) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const suppliers: Supplier[] = stored ? JSON.parse(stored) : [];

    const updatedList = suppliers.map((s) =>
      s.id === updated.id ? updated : s
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    setSupplier(updated);
  };

  const handleDeleteSupplier = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const suppliers: Supplier[] = stored ? JSON.parse(stored) : [];

    const updatedList = suppliers.filter((s) => s.id !== supplier!.id);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    toast.success("Supplier deleted.");
    navigate("/webapp/purchasing/suppliers");
  };

  const formatPHPhone = (phone: string) => {
    if (!phone) return "";
    let cleaned = phone.replace(/\D/g, "");

    if (cleaned.startsWith("09")) {
      cleaned = "63" + cleaned.slice(1);
    }

    if (cleaned.startsWith("63") && cleaned.length === 12) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }

    return phone;
  };

  if (!supplier) {
    return (
      <div className="p-6 text-center">
        <p className="text-lg font-medium text-red-500">Supplier not found</p>
        <button
          onClick={() => navigate("/webapp/purchasing/suppliers")}
          className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          ← Back to Suppliers
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden">

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate("/webapp/purchasing/suppliers")}> 
              Suppliers
            </BreadcrumbLink>    
          </BreadcrumbItem>

          <BreadcrumbSeparator />
          
          <BreadcrumbItem>
            <BreadcrumbPage>{supplier.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-5 gap-6 flex-1 min-h-0">

        {/* LEFT */}
        <div className="col-span-2 flex flex-col min-h-0">
          <Card className="flex flex-col h-fit">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-lg font-bold">{supplier.name}</h1>
                  <p className="text-xs text-gray-500">{supplier.supplierCode}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon_xs"
                    onClick={() => setIsEditOpen(true)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon_xs" 
                    className="text-destructive"
                    onClick={() => setIsDeleteOpen(true)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">

              {[{
                label: "Contact Person",
                icon: User,
                value: supplier.contactPerson || "No contact person available",
                clickable: false
              }, {
                label: "Email",
                icon: Mail,
                value: supplier.email || "No email available",
                clickable: !!supplier.email,
                action: () => supplier.email && window.open(`mailto:${supplier.email}`)
              }, {
                label: "Phone",
                icon: Phone,
                value: supplier.phone ? formatPHPhone(supplier.phone) : "No phone number available",
                clickable: !!supplier.phone,
                action: () => supplier.phone && window.open(`tel:${supplier.phone}`)
              }, {
                label: "Viber",
                icon: MessageCircle,
                value: supplier.viber || "No Viber available",
                clickable: !!supplier.viber,
                action: () => supplier.viber && window.open(`viber://chat?number=${supplier.viber}`)
              }, {
                label: "Tax",
                icon: Percent,
                value: "",
                clickable: false,
                isTax: true
              }].map((field: any, i) => (
                <div key={i} className="space-y-1">
                  <Label>{field.label}</Label>
                  <div className="relative">
                    <field.icon
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    />

                    {field.isTax ? (
                      <div className="flex items-center pl-9 h-9 border rounded-md">
                        {supplier.isVAT ? (
                          `${supplier.vatRate}% VAT applied`
                        ) : (
                          "Non-VAT supplier"
                        )}
                      </div>
                    ) : (
                      <Input
                        value={field.value}
                        readOnly
                        onClick={field.action}
                        className={`pl-9 ${field.clickable ? "cursor-pointer" : "text-foreground"}`}
                      />
                    )}
                  </div>
                </div>
              ))}

            </CardContent>

            <CardFooter>
              <Button className="w-full">Contact Supplier</Button>
            </CardFooter>
          </Card>
        </div>

        {/* RIGHT unchanged */}
        {/* (kept exactly as-is) */}

        <div className="col-span-3 flex flex-col min-h-0">
          <Card className="flex flex-col flex-1 min-h-0">

            <Tabs defaultValue="transactions" className="flex flex-col flex-1 min-h-0 p-4">

              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
                <TabsTrigger value="products">Supplied Products ({products.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="transactions" className="flex-1 min-h-0 mt-4">
                <div className="h-full overflow-hidden">
                  <div className="h-full overflow-y-auto">
                    <Table className="table-fixed w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Purchase Date</TableHead>
                          <TableHead>Parts Ordered</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {transactions.slice(0, 10).map((txn) => (
                          <TableRow key={txn.id}>
                            <TableCell>
                              <div>
                                <p className="text-sm font-medium leading-none">{txn.date}</p>
                                <p className="text-xs text-muted-foreground">{txn.time}</p>
                              </div>
                            </TableCell>
                            <TableCell>{txn.partsOrdered}</TableCell>
                            <TableCell>{txn.amount}</TableCell>
                            <TableCell>
                              <Badge>{txn.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>

                    </Table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="products" className="flex-1 min-h-0 mt-4">
                <div className="h-full overflow-hidden flex flex-col">
                  <div className="flex-1 overflow-y-auto">
                    <Table className="table-fixed w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product Name</TableHead>
                          <TableHead>Part Number</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {paginate(products).map((prod) => (
                          <TableRow key={prod.id}>
                            <TableCell className="truncate">{prod.name}</TableCell>
                            <TableCell>{prod.partNumber}</TableCell>
                            <TableCell>{prod.price}</TableCell>
                            <TableCell>{prod.stock}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {products.length > 25 && (
                    <div className="mt-2">
                      <Pagination
                        totalItems={products.length}
                        page={page}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

            </Tabs>
          </Card>
        </div>

      </div>

      <SupplierModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        supplier={supplier}
        onSaved={handleSaveSupplier}
      />      

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-semibold">{supplier.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleDeleteSupplier}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SupplierDetails;