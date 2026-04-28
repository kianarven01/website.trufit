import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardTitle, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import DataToolbar from "@/components/DataToolbar";
import { Pagination, usePagination } from "@/components/ui/pagination";
import SupplierModal from "@/components/popupModal/Purchasing/addSupplier"; 
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import ContactSupplierModal from "@/components/popupModal/Purchasing/contactSupplier";

import { ScrollArea } from "@/components/ui/scrollArea";
import { toast } from "sonner";

import { ArrowLeft, Pencil, XCircle, Mail, Phone, User, MessageCircle, Edit, Trash2, Percent } from "lucide-react";

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

interface Product {
  id: string;
  name: string;
  partNumber: string;
  price: number;
  stock: number;
}

const STORAGE_KEY = "suppliers";


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
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const { page, setPage, pageSize, setPageSize, paginate } = usePagination(25);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const parsed: Supplier[] = JSON.parse(stored);
    const found = parsed.find((s) => s.id === supplierId);
    if (found) setSupplier(found);
  }, [supplierId]);

  useEffect(() => {
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
      
    {/* TOOLBAR */}
    <DataToolbar
      variant="detail"
      actions={
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil className="w-4 h-4 mr-1" />
              Edit Service
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={() => setIsDeleteOpen(true)}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Remove Service
            </Button>
          </div>
        </div>
      }
    />

      <div className="grid grid-cols-6 gap-6 flex-1 min-h-0">

        <div className="col-span-2 flex flex-col min-h-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{supplier.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{supplier.supplierCode}</p>
            </CardHeader>

            <CardContent className="space-y-5">

              {/* Contact Person */}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Contact Person
                </p>
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  <p className="text-sm">
                    {supplier.contactPerson || "—"}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Email
                </p>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  <p className="text-sm">{supplier.email || "—"}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Phone
                </p>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  <p className="text-sm">
                    {supplier.phone ? formatPHPhone(supplier.phone) : "—"}
                  </p>
                </div>
              </div>

              {/* Viber */}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Viber
                </p>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <p className="text-sm">{supplier.viber || "—"}</p>
                </div>
              </div>

              {/* Tax */}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Tax
                </p>
                <div className="flex items-center gap-2">
                  <Percent className="w-3.5 h-3.5" />
                  <p className="text-sm">
                    {supplier.isVAT
                      ? `${supplier.vatRate}% VAT applied`
                      : "Non-VAT supplier"}
                  </p>
                </div>
              </div>

            </CardContent>

            <CardFooter>
              <Button 
              className="w-full"
              onClick={() => setIsContactOpen(true)}
            >
              Contact Supplier
            </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="col-span-4 flex flex-col min-h-0">
          <Card className="flex flex-col flex-1 min-h-0">
            <CardHeader>
              <CardTitle className="text-lg">
                Supplied Products ({products.length})
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col flex-1 overflow-hidden p-0">
              {products.length > 0 ? (
                <div className="flex flex-col flex-1 border rounded-lg mx-4 mb-4 overflow-hidden">
                  
                  <Table className="table-fixed w-full">
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[40%]">Product Name</TableHead>
                        <TableHead className="w-[20%]">Part Number</TableHead>
                        <TableHead className="w-[20%]">Price</TableHead>
                        <TableHead className="w-[20%]">Stock</TableHead>
                      </TableRow>
                    </TableHeader>
                  </Table>

                  {/* SCROLLABLE BODY */}
                  <ScrollArea className="flex-1">
                    <Table className="table-fixed w-full">
                      <TableBody>
                        {paginate(products).map((prod, index) => (
                          <TableRow key={prod.id}>
                            <TableCell className="w-[40%] truncate">
                              {prod.name}
                            </TableCell>
                            <TableCell className="w-[20%]">
                              {prod.partNumber}
                            </TableCell>
                            <TableCell className="w-[20%]">
                              {prod.price}
                            </TableCell>
                            <TableCell className="w-[20%]">
                              {prod.stock}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>

                  {products.length > pageSize && (
                    <Pagination
                      totalItems={products.length}
                      page={page}
                      pageSize={pageSize}
                      onPageChange={setPage}
                      onPageSizeChange={setPageSize}
                    />
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                  No supplied products available.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      <SupplierModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        supplier={supplier}
        onSaved={handleSaveSupplier}
      />      

      <ContactSupplierModal
        open={isContactOpen}
        onOpenChange={setIsContactOpen}
        supplier={{
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          viber: supplier.viber,
        }}
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