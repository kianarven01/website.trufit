import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardTitle, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Pagination, usePagination } from "@/components/ui/pagination";
import SupplierModal from "@/components/popupModal/Purchasing/addSupplier";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import ContactSupplierModal from "@/components/popupModal/Purchasing/contactSupplier";

import { ScrollArea } from "@/components/ui/scrollArea";
import { toast } from "sonner";

import { ArrowLeft, Pencil, XCircle, Mail, Phone, User, MessageCircle, Edit, Trash2, Percent, Plus, MapPin, ScrollText } from "lucide-react";
import api from "@/api/axios";

interface Supplier {
  id: string;
  name: string;
  supplierCode: string;
  email: string;
  phone: string;
  contactPerson: string;
  viber: string;
  address: string;
  paymentTerms?: string;
}

interface Product {
  id: string;
  name: string;
  partNumber: string;
  sku?: string | null;
  manufacturer?: string | null;
  price: number;
  stock: number;
  isVat?: boolean;
  vatPercent?: number | null;
  sellingPrice?: number | null;
  markup?: number | null;
}




const SupplierDetails: React.FC = () => {
  const { supplierId } = useParams<{ supplierId: string }>();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [isUnlinkOpen, setIsUnlinkOpen] = useState(false);
  const [unlinkProductId, setUnlinkProductId] = useState<string | null>(null);
  const [isCostOpen, setIsCostOpen] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [supplierCost, setSupplierCost] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [markup, setMarkup] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isVat, setIsVat] = useState(false);
  const [vatPercent, setVatPercent] = useState("12");

  const handleCostChange = (val: string) => {
    setSupplierCost(val);
    const costNum = parseFloat(val);
    const priceNum = parseFloat(sellingPrice);
    if (!isNaN(costNum) && costNum > 0 && !isNaN(priceNum)) {
      const calculatedMarkup = ((priceNum - costNum) / costNum) * 100;
      setMarkup(calculatedMarkup.toFixed(2));
    }
  };

  const handleSellingPriceChange = (val: string) => {
    setSellingPrice(val);
    const costNum = parseFloat(supplierCost);
    const priceNum = parseFloat(val);
    if (!isNaN(costNum) && costNum > 0 && !isNaN(priceNum)) {
      const calculatedMarkup = ((priceNum - costNum) / costNum) * 100;
      setMarkup(calculatedMarkup.toFixed(2));
    }
  };

  const handleMarkupChange = (val: string) => {
    setMarkup(val);
    const costNum = parseFloat(supplierCost);
    const markupNum = parseFloat(val);
    if (!isNaN(costNum) && !isNaN(markupNum)) {
      const calculatedPrice = costNum * (1 + markupNum / 100);
      setSellingPrice(calculatedPrice.toFixed(2));
    }
  };

  const { page, setPage, pageSize, setPageSize, paginate } = usePagination(25);

  const [isLoading, setIsLoading] = useState(true);

  const loadSupplier = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/suppliers/${supplierId}`);
      if (res.data?.data) {
        setSupplier(res.data.data);
        setProducts(res.data.data.products || []);

        sessionStorage.setItem(`breadcrumb-/webapp/purchasing/suppliers/${supplierId}`, res.data.data.name || "Supplier");
        window.dispatchEvent(new Event('breadcrumb-update'));
      }
    } catch (error) {
      console.error("Failed to load supplier:", error);
      toast.error("Failed to load supplier details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (supplierId) {
      void loadSupplier();
    }
  }, [supplierId]);



  const handleSaveSupplier = async (updated: Supplier) => {
    try {
      await api.put(`/suppliers/${updated.id}`, updated);
      void loadSupplier();
    } catch (error) {
      console.error("Failed to update supplier:", error);
      throw error;
    }
  };

  const handleDeleteSupplier = async () => {
    try {
      await api.delete(`/suppliers/${supplier!.id}`);
      toast.success("Supplier deleted.");
      navigate("/webapp/purchasing/suppliers");
    } catch (error: any) {
      console.error("Failed to delete supplier:", error);
      toast.error(error?.response?.data?.message || "Failed to delete supplier.");
    }
  };

  const fetchCatalogProducts = async () => {
    try {
      const res = await api.get("/products");
      const rows = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      setCatalogProducts(rows);
    } catch (error) {
      console.error("Failed to load catalog products:", error);
    }
  };

  useEffect(() => {
    if (isLinkOpen) {
      void fetchCatalogProducts();
    }
  }, [isLinkOpen]);

  const handleLinkProduct = async () => {
    if (!selectedProductId || !supplierCost) {
      toast.error("Please select a product and input cost.");
      return;
    }
    try {
      await api.post(`/suppliers/${supplierId}/products`, {
        productId: selectedProductId,
        cost: Number(supplierCost),
        isVat: isVat,
        vatPercent: isVat ? Number(vatPercent) : null,
        sellingPrice: sellingPrice ? Number(sellingPrice) : null,
        markup: markup ? Number(markup) : null
      });
      toast.success("Product linked successfully.");
      setIsLinkOpen(false);
      setSelectedProductId("");
      setSupplierCost("");
      setSellingPrice("");
      setMarkup("");
      setIsVat(false);
      setVatPercent("12");
      void loadSupplier();
    } catch (error) {
      console.error("Failed to link product:", error);
      toast.error("Failed to link product.");
    }
  };

  const handleUpdateCost = async () => {
    if (!selectedProduct || !supplierCost) return;
    try {
      await api.put(`/suppliers/${supplierId}/products/${selectedProduct.id}`, {
        cost: Number(supplierCost),
        isVat: isVat,
        vatPercent: isVat ? Number(vatPercent) : null,
        sellingPrice: sellingPrice ? Number(sellingPrice) : null,
        markup: markup ? Number(markup) : null
      });
      toast.success("Supplier cost updated successfully.");
      setIsCostOpen(false);
      setSelectedProduct(null);
      setSupplierCost("");
      setSellingPrice("");
      setMarkup("");
      setIsVat(false);
      setVatPercent("12");
      void loadSupplier();
    } catch (error) {
      console.error("Failed to update cost:", error);
      toast.error("Failed to update cost.");
    }
  };

  const handleUnlinkProduct = async (productId: string) => {
    try {
      await api.delete(`/suppliers/${supplierId}/products/${productId}`);
      toast.success("Product unlinked successfully.");
      void loadSupplier();
    } catch (error: any) {
      console.error("Failed to unlink product:", error);
      toast.error(error?.response?.data?.message || "Failed to unlink product.");
    }
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

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
      </div>
    );
  }

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
    <div className="w-full h-full px-6 pt-1 pb-6 flex flex-col gap-6 overflow-y-auto">

      {/* TOOLBAR */}
      <div className="flex items-center justify-between gap-3 shrink-0">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => setIsEditOpen(true)}
          >
            <Pencil className="w-4 h-4 mr-1" />
            Edit Supplier
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => setIsDeleteOpen(true)}
          >
            <XCircle className="w-4 h-4 mr-1" />
            Remove Supplier
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 items-stretch min-h-0">

        <div className="lg:col-span-1 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">{supplier.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{supplier.supplierCode}</p>
            </CardHeader>

            <CardContent className="flex-1 space-y-5 overflow-auto">

              {/* Contact Person */}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Contact Person
                </p>
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  <p className={`text-sm ${!supplier.contactPerson ? 'text-muted-foreground italic' : ''}`}>
                    {supplier.contactPerson || "Not Provided"}
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
                  <p className={`text-sm ${!supplier.email ? 'text-muted-foreground italic' : ''}`}>
                    {supplier.email || "Not Provided"}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Phone
                </p>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  <p className={`text-sm ${!supplier.phone ? 'text-muted-foreground italic' : ''}`}>
                    {supplier.phone ? formatPHPhone(supplier.phone) : "Not Provided"}
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
                  <p className={`text-sm ${!supplier.viber ? 'text-muted-foreground italic' : ''}`}>
                    {supplier.viber || "Not Provided"}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Address
                </p>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <p className={`text-sm ${!supplier.address ? 'text-muted-foreground italic' : ''}`}>
                    {supplier.address || "Not Provided"}
                  </p>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Payment Terms
                </p>
                <div className="flex items-center gap-2">
                  <ScrollText className="w-3.5 h-3.5" />
                  <p className="text-sm font-semibold text-foreground">
                    {supplier.paymentTerms ? (supplier.paymentTerms === "NONE" ? "None (Prepaid / Immediate)" : supplier.paymentTerms.replace("_", " ")) : "COD"}
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

        <div className="lg:col-span-2 flex flex-col min-h-0">
          <Card className="flex flex-col flex-1 min-h-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg">
                Supplied Products ({products.length})
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => setIsLinkOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Link Product
              </Button>
            </CardHeader>

            <CardContent className="flex flex-col flex-1 overflow-hidden p-0">
              {products.length > 0 ? (
                <div className="flex flex-col flex-1 border rounded-lg mx-4 mb-4 overflow-hidden">

                  <Table className="table-fixed w-full">
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[20%] text-left pl-4">Product Name</TableHead>
                        <TableHead className="w-[15%] text-center">Part Number</TableHead>
                        <TableHead className="w-[15%] text-center">Supplier Cost</TableHead>
                        <TableHead className="w-[15%] text-center">Selling Price</TableHead>
                        <TableHead className="w-[15%] text-center">VAT Status</TableHead>
                        <TableHead className="w-[10%] text-center">Stock</TableHead>
                        <TableHead className="w-[10%] text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                  </Table>

                  {/* SCROLLABLE BODY */}
                  <ScrollArea className="flex-1">
                    <Table className="table-fixed w-full">
                      <TableBody>
                        {paginate(products).map((prod, index) => (
                          <TableRow key={prod.id} className="hover:bg-transparent">
                            <TableCell className="w-[20%] py-3 pl-4 text-left">
                              <p className="font-semibold text-foreground text-sm">{prod.name}{prod.manufacturer ? ` — ${prod.manufacturer}` : ""}</p>
                              {prod.sku && <p className="text-[11px] text-muted-foreground leading-none mt-0.5">{prod.sku}</p>}
                            </TableCell>
                            <TableCell className="w-[15%] text-center">
                              {prod.partNumber}
                            </TableCell>
                            <TableCell className="w-[15%] text-center">
                              ₱{Number(prod.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="w-[15%] text-center">
                              {prod.sellingPrice !== null && prod.sellingPrice !== undefined ? (
                                `₱${Number(prod.sellingPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                              ) : (
                                <span className="text-muted-foreground italic text-xs">No price set</span>
                              )}
                            </TableCell>
                            <TableCell className="w-[15%] text-center">
                              {prod.isVat ? (
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 font-normal">
                                  VAT ({prod.vatPercent}%)
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground font-normal">
                                  Non-VAT
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="w-[10%] text-center">
                              {prod.stock}
                            </TableCell>
                            <TableCell className="w-[10%] text-center">
                              <div className="flex justify-center gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-primary"
                                  onClick={() => {
                                    setSelectedProduct(prod);
                                    setSupplierCost(prod.price.toString());
                                    setSellingPrice(prod.sellingPrice ? prod.sellingPrice.toString() : "");
                                    setMarkup(prod.markup ? prod.markup.toString() : "");
                                    setIsVat(prod.isVat ?? false);
                                    setVatPercent((prod.vatPercent ?? 12).toString());
                                    setIsCostOpen(true);
                                  }}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => { setUnlinkProductId(prod.id); setIsUnlinkOpen(true); }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
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

      <AlertDialog open={isUnlinkOpen} onOpenChange={setIsUnlinkOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlink Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unlink this product? This will also remove inventory and pricing records for this supplier.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => { if (unlinkProductId) void handleUnlinkProduct(unlinkProductId); setIsUnlinkOpen(false); setUnlinkProductId(null); }}
            >
              Unlink
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Link Product Modal */}
      <Dialog open={isLinkOpen} onOpenChange={setIsLinkOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Link Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs">Select Product</Label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full border rounded-md p-2 bg-background text-sm"
              >
                <option value="">Select Product...</option>
                {catalogProducts
                  .filter((p) => !products.some((linked) => linked.id === p.id))
                  .filter((p) => !(p.category_is_spol && p.name?.toLowerCase() === "sundries"))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}{p.manufacturer ? ` — ${p.manufacturer}` : ""}{p.part_number ? ` (${p.part_number})` : ""}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Supplier Cost</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={supplierCost}
                  onChange={(e) => handleCostChange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Markup (%)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={markup}
                  onChange={(e) => handleMarkupChange(e.target.value)}
                  disabled={!supplierCost}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Selling Price</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={sellingPrice}
                  onChange={(e) => handleSellingPriceChange(e.target.value)}
                  disabled={!supplierCost}
                />
              </div>
            </div>

            <div className="flex gap-4 items-center pt-2">
              <div className="flex-1 space-y-2">
                <Label className="text-xs">Tax Type</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
                    <input
                      type="radio"
                      name="linkIsVat"
                      checked={!isVat}
                      onChange={() => setIsVat(false)}
                      className="accent-primary"
                    />
                    Non-VAT
                  </label>
                  <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
                    <input
                      type="radio"
                      name="linkIsVat"
                      checked={isVat}
                      onChange={() => setIsVat(true)}
                      className="accent-primary"
                    />
                    VAT
                  </label>
                </div>
              </div>

              {isVat && (
                <div className="w-[120px] space-y-2">
                  <Label className="text-xs">VAT Percent (%)</Label>
                  <Input
                    type="number"
                    placeholder="12"
                    value={vatPercent}
                    onChange={(e) => setVatPercent(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLinkProduct}>Link Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Cost Modal */}
      <Dialog open={isCostOpen} onOpenChange={setIsCostOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product Pricing</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm font-semibold">{selectedProduct?.name}</p>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Supplier Cost</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={supplierCost}
                  onChange={(e) => handleCostChange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Markup (%)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={markup}
                  onChange={(e) => handleMarkupChange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Selling Price</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={sellingPrice}
                  onChange={(e) => handleSellingPriceChange(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-4 items-center pt-2">
              <div className="flex-1 space-y-2">
                <Label className="text-xs">Tax Type</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
                    <input
                      type="radio"
                      name="editIsVat"
                      checked={!isVat}
                      onChange={() => setIsVat(false)}
                      className="accent-primary"
                    />
                    Non-VAT
                  </label>
                  <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
                    <input
                      type="radio"
                      name="editIsVat"
                      checked={isVat}
                      onChange={() => setIsVat(true)}
                      className="accent-primary"
                    />
                    VAT
                  </label>
                </div>
              </div>

              {isVat && (
                <div className="w-[120px] space-y-2">
                  <Label className="text-xs">VAT Percent (%)</Label>
                  <Input
                    type="number"
                    placeholder="12"
                    value={vatPercent}
                    onChange={(e) => setVatPercent(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCostOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCost}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default SupplierDetails;