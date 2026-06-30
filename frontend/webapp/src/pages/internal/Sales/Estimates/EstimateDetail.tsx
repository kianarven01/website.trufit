import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DataToolbar from "@/components/DataToolbar";
import ConfirmDialog from "@/components/popupModal/AlertDialog/ConfirmDialog";
import { toast } from "sonner";
import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import CurrencyInput from "@/components/ui/currencyInput";

const statusConfig: Record<string, { label: string; variant: any }> = {
  approved: { label: "Approved", variant: "approved" as const },
  issued: { label: "Issued", variant: "received" as const },
  DRAFT: { label: "Draft", variant: "default" as const },
  APPROVED: { label: "Approved", variant: "approved" as const },
  ISSUED: { label: "Issued", variant: "received" as const },
  "FOR APPROVAL": { label: "For Approval", variant: "for-approval" as const },
  "for approval": { label: "For Approval", variant: "for-approval" as const },
  "for_approval": { label: "For Approval", variant: "for-approval" as const },
  "APPROVED WITH DOWNPAYMENT": { label: "Approved With Downpayment", variant: "approved" as const },
  "APPROVED_WITH_DOWNPAYMENT": { label: "Approved With Downpayment", variant: "approved" as const },
};

import { ArrowLeft, Car, User, Wrench, Box, Fuel, Calculator, Download } from "lucide-react";

/* ================= TYPES ================= */

interface Service {
  id: string;
  name: string;
  serviceCategoryId: string;
  tasks?: string[];
  duration?: number;
  pricingType: "fixed" | "hourly rate";
  pricings?: any[];
}

interface ServiceCategory {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  partNumber?: string;
  price: number;
  unit: string;
  quantityOnHand: number | null;
  reorderLevel: number | null;
  productId?: string;
  supplierName?: string;
}

/* ================= HELPERS ================= */

const peso = (n: number) =>
  `₱${(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (d?: string) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDuration = (minutes?: number) => {
  if (!minutes) return "-";
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs && mins) return `${hrs}h ${mins}m`;
  if (hrs) return `${hrs}h`;
  return `${mins}m`;
};

/* ================= COMPONENT ================= */

const EstimateDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();

  const userRole = role?.toLowerCase() || "";
  const isSupervisorOrAdmin = userRole === "supervisor" || userRole === "admin";

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [estimate, setEstimate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downpayment, setDownpayment] = useState<number>(0);
  const [isApproving, setIsApproving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Catalog data for resolving IDs to names
  const [servicesCatalog, setServicesCatalog] = useState<Service[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [partsCatalog, setPartsCatalog] = useState<Product[]>([]);

  const servicesMap = useMemo<Record<string, Service>>(() =>
    Object.fromEntries(servicesCatalog.map(s => [s.id, s])),
    [servicesCatalog]
  );

  const partsMap = useMemo<Record<string, Product>>(() =>
    Object.fromEntries(partsCatalog.map(p => [p.productId || p.id, p])),
    [partsCatalog]
  );

  const categoryMap = useMemo<Record<string, ServiceCategory>>(() =>
    Object.fromEntries(serviceCategories.map(c => [c.id, c])),
    [serviceCategories]
  );

  /* ================= LOAD ================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [estimateRes, serviceTypesRes, serviceCatsRes, productsRes] = await Promise.all([
          api.get(`/estimates/${id}`),
          api.get('/products/service-types'),
          api.get('/products/service-categories'),
          api.get('/inventory'),
        ]);

        const estData = estimateRes.data.data;
        setEstimate(estData);
        setDownpayment(Number(estData?.downpayment_amount) || 0);

        if (estData?.estimate_number) {
          sessionStorage.setItem(`breadcrumb-/webapp/sales/estimates/${id}`, estData.estimate_number);
          window.dispatchEvent(new Event('breadcrumb-update'));
        }

        const dbServiceTypes = serviceTypesRes.data.data || [];
        setServicesCatalog(dbServiceTypes.map((s: any) => ({
          id: s.id,
          name: s.name,
          serviceCategoryId: s.service_category_id || "",
          tasks: s.tasks || [],
          duration: s.duration || 0,
          pricingType: s.pricing_type || "fixed",
          pricings: s.pricings || [],
        })));

        setServiceCategories(serviceCatsRes.data.data || []);

        const dbInventory = Array.isArray(productsRes.data)
          ? productsRes.data
          : productsRes.data.data || [];
        setPartsCatalog(dbInventory.map((row: any) => {
          const product = row.product || {};
          const supplierPrice = row.active_price?.Price;
          const price = Number(row.price || supplierPrice || 0);
          const supplierName = row.supplier?.CompanyName || row.supplier?.name || row.supplier_name || "";
          return {
            id: String(row.id),
            productId: String(product.id || ""),
            name: product.name || "",
            sku: product.SKU || "",
            partNumber: product.part_number || product.partNumber || "",
            price,
            unit: product.unit_name || product.unit?.name || "pc",
            quantityOnHand: Number(row.quantity_on_hand ?? 0),
            reorderLevel: Number(row.reorder_level ?? 5),
            supplierName,
          };
        }));
      } catch (err) {
        console.error("Failed to load estimate", err);
        setEstimate(null);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchData();
    return () => {
      sessionStorage.removeItem(`breadcrumb-/webapp/sales/estimates/${id}`);
    };
  }, [id]);

  /* ================= DERIVED ================= */

  const customer = estimate?.customer;
  const vehicle = estimate?.vehicle;

  const serviceItems = useMemo(() => {
    if (!estimate?.items) return [];
    return estimate.items.filter((i: any) => i.item_type === 'service');
  }, [estimate]);

  const partItems = useMemo(() => {
    if (!estimate?.items) return [];
    return estimate.items.filter((i: any) => i.item_type === 'part');
  }, [estimate]);

  // For now SPOL items would be item_type === 'supply', but since the save doesn't
  // distinguish yet, we'll show an empty SPOL table
  const spolItems = useMemo(() => {
    if (!estimate?.items) return [];
    return estimate.items.filter((i: any) => i.item_type === 'supply');
  }, [estimate]);

  const totals = useMemo(() => {
    const totalServices = serviceItems.reduce((acc: number, i: any) => acc + Number(i.subtotal || 0), 0);
    const totalParts = partItems.reduce((acc: number, i: any) => acc + Number(i.subtotal || 0), 0);
    const totalSupplies = spolItems.reduce((acc: number, i: any) => acc + Number(i.subtotal || 0), 0);
    const estimatedMinutes = serviceItems.reduce((acc: number, i: any) => {
      const svc = servicesMap[i.service_id];
      return acc + (svc?.duration || 0);
    }, 0);

    return {
      totalServices,
      totalParts,
      totalSupplies,
      total: Number(estimate?.total_amount || 0),
      estimatedMinutes,
    };
  }, [serviceItems, partItems, spolItems, servicesMap, estimate]);

  const renderNeedsOrderBadge = (item: any, product: Product | undefined) => {
    if (product && product.quantityOnHand !== null) {
      const shortage = Number(item.quantity) - product.quantityOnHand;
      const qtyToDisplay = shortage > 0 ? shortage : Number(item.quantity);

      if (shortage > 0) {
        if (item.needs_ordering) {
          return (
            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
              Needs Order (Qty: {qtyToDisplay} | Stock: {product.quantityOnHand})
            </span>
          );
        } else {
          return (
            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800">
              Outsource (Qty: {qtyToDisplay} | Stock: {product.quantityOnHand})
            </span>
          );
        }
      }
    }

    if (item.needs_ordering) {
      return (
        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
          Needs Order (Qty: {Number(item.quantity)})
        </span>
      );
    }

    return null;
  };

  /* ================= ACTIONS ================= */

  const handleEditEstimate = () => {
    navigate(`/webapp/sales/estimates/${estimate?.id}/edit`);
  };

  const handleApproveEstimate = async () => {
    setIsApproving(true);
    try {
      const status = downpayment > 0 ? "APPROVED WITH DOWNPAYMENT" : "APPROVED";
      const response = await api.put(`/estimates/${estimate?.id}`, {
        status,
        downpayment_amount: downpayment
      });
      setEstimate(response.data.data);
      toast.success(`Estimate approved successfully!`);
    } catch (err) {
      console.error("Failed to approve estimate", err);
      toast.error("Failed to approve estimate.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleRemoveEstimate = async () => {
    try {
      await api.delete(`/estimates/${estimate?.id}`);
      toast.success("Estimate deleted");
      navigate("/webapp/sales/estimates");
    } catch (err) {
      console.error("Failed to delete estimate", err);
      toast.error("Failed to delete estimate");
    }
  };

  const handleDownloadPDF = async () => {
    if (!estimate?.id) return;
    setIsDownloading(true);
    try {
      const response = await api.get(`/estimates/${estimate.id}/download-pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileName = estimate.estimate_number 
        ? `${estimate.estimate_number}.pdf` 
        : `estimate-${estimate.id.substring(0,8)}.pdf`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  /* ================= LOADING / EMPTY ================= */

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 bg-background text-foreground">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading estimate...
        </p>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="w-full h-full p-4">
        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <Box className="h-10 w-10 stroke-1 mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">Estimate not found</p>
            <p className="text-xs text-muted-foreground">
              The selected estimate record does not exist.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => navigate("/webapp/sales/estimates")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Estimates
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="w-full h-full pl-4 pr-3 pb-4 flex flex-col gap-4 overflow-y-auto">

      {/* HEADER */}
      <DataToolbar
        variant="detail"
        title="Estimate Details"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/webapp/sales/estimates")}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            {isSupervisorOrAdmin && (
              <>
                <Button size="sm" onClick={handleEditEstimate}>
                  Edit Estimate
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setConfirmOpen(true)}
                >
                  Remove Estimate
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="space-y-6">
        {/* CUSTOMER + VEHICLE */}
        <div className="grid lg:grid-cols-2 gap-4">

          {/* CUSTOMER DETAILS */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-blue-500">
                <User className="size-5" />
                <p className="font-semibold text-foreground">Customer Details</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <Label className="text-muted-foreground font-normal text-xs">Full Name</Label>
                  <Input
                    value={`${customer?.first_name || ""} ${customer?.last_name || ""}`.trim() || "—"}
                    readOnly
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground font-normal text-xs">Address</Label>
                  <Input value={customer?.address || "—"} readOnly />
                </div>
                <div className="grid sm:grid-cols-2 gap-y-2 gap-x-4">
                  <div>
                    <Label className="text-muted-foreground font-normal text-xs">Email Address</Label>
                    <Input value={customer?.email || "—"} readOnly />
                  </div>
                  <div>
                    <Label className="text-muted-foreground font-normal text-xs">Phone Number</Label>
                    <Input value={customer?.mobile_number || "—"} readOnly />
                  </div>
                  <div>
                    <Label className="text-muted-foreground font-normal text-xs">Landline</Label>
                    <Input value={customer?.landline || "—"} readOnly />
                  </div>
                  <div>
                    <Label className="text-muted-foreground font-normal text-xs">Business Number</Label>
                    <Input value={customer?.business || "—"} readOnly />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* VEHICLE DETAILS */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-blue-500">
                <Car className="size-5" />
                <p className="font-semibold text-foreground">Vehicle Details</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2">
                <div className="sm:col-span-2 grid lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-2">
                    <Label className="text-muted-foreground font-normal text-xs">Year / Make / Model</Label>
                    <Input
                      value={[vehicle?.year_model, vehicle?.make, vehicle?.model].filter(Boolean).join(" ") || "—"}
                      readOnly
                    />
                  </div>
                  <div>
                    <Label className="text-muted-foreground font-normal text-xs">Variant</Label>
                    <Input value={vehicle?.variant || "—"} readOnly />
                  </div>
                  <div>
                    <Label className="text-muted-foreground font-normal text-xs">Color</Label>
                    <Input value={vehicle?.color || "—"} readOnly />
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground font-normal text-xs">Plate No.</Label>
                  <Input value={vehicle?.plate_number || "—"} readOnly />
                </div>
                <div>
                  <Label className="text-muted-foreground font-normal text-xs">Engine No.</Label>
                  <Input value={vehicle?.engine_number || "—"} readOnly />
                </div>
                <div>
                  <Label className="text-muted-foreground font-normal text-xs">Chassis No. (VIN)</Label>
                  <Input value={vehicle?.VIN || "—"} readOnly />
                </div>
                <div>
                  <Label className="text-muted-foreground font-normal text-xs">Registration No.</Label>
                  <Input value={vehicle?.registration_number || "—"} readOnly />
                </div>
                <div>
                  <Label className="text-muted-foreground font-normal text-xs">Selling Dealer</Label>
                  <Input value={vehicle?.selling_dealer || "—"} readOnly />
                </div>
                <div>
                  <Label className="text-muted-foreground font-normal text-xs">Mileage</Label>
                  <Input value={estimate.mileage ? `${estimate.mileage}` : "0"} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ESTIMATE DETAILS */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-6">

            {/* ========== SERVICES (JOB ORDER) ========== */}
            <div className="rounded-lg border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Wrench className="size-5 text-blue-500" />
                <h2 className="text-sm font-semibold text-foreground">Services (Job Order)</h2>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs w-[30%] text-center">Service</TableHead>
                      <TableHead className="text-xs w-[25%] text-center">Pricing</TableHead>
                      <TableHead className="text-xs w-[14%] text-center">Est. Duration</TableHead>
                      <TableHead className="text-xs w-[13%] text-center">Rate</TableHead>
                      <TableHead className="text-xs w-[13%] text-center">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceItems.length > 0 ? (
                      serviceItems.map((item: any) => {
                        const svc = servicesMap[item.service_id];
                        const cat = svc ? categoryMap[svc.serviceCategoryId] : null;
                        return (
                          <TableRow key={item.id} className="hover:bg-transparent text-center">
                            <TableCell className="font-medium text-center">
                              {svc?.name || item.service_id || "—"}
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground text-sm">
                              {svc?.pricingType === "fixed" ? "Fixed" : svc?.pricingType === "hourly rate" ? "Hourly" : "—"}
                              {cat ? ` · ${cat.name}` : ""}
                            </TableCell>
                            <TableCell className="text-center">
                              {svc?.duration ? formatDuration(svc.duration) : "No Duration"}
                            </TableCell>
                            <TableCell className="text-center">
                              {peso(Number(item.unit_price))}
                            </TableCell>
                            <TableCell className="text-center font-semibold">
                              {peso(Number(item.subtotal))}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                          No services added.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* ========== PARTS (SALES ORDER) ========== */}
            <div className="rounded-lg border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Box className="size-5 text-orange-500" />
                <h2 className="text-sm font-semibold text-foreground">Parts (Sales Order)</h2>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 text-center">
                      <TableHead className="text-xs text-center w-[25%]">Item Name</TableHead>
                      <TableHead className="text-xs text-center w-[15%]">Part Number</TableHead>
                      <TableHead className="text-xs text-center w-[15%]">Status</TableHead>
                      <TableHead className="text-xs w-[15%] text-center">Unit Price</TableHead>
                      <TableHead className="text-xs w-[10%] text-center">Need Quantity</TableHead>
                      <TableHead className="text-xs w-[20%] text-center">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partItems.length > 0 ? (
                      partItems.map((item: any) => {
                        const product = partsMap[item.product_id];
                        const stock = product ? (product.quantityOnHand ?? 0) : 0;
                        const shortage = Number(item.quantity) - stock;
                        const orderQty = shortage > 0 ? shortage : Number(item.quantity);
                        return (
                          <TableRow key={item.id} className="hover:bg-transparent text-center">
                            <TableCell className="font-medium text-center">
                              {item.custom_name || product?.name || item.product_id || "—"}
                            </TableCell>
                            <TableCell className="text-center font-mono text-xs text-muted-foreground">
                              {item.custom_name ? "—" : (product?.partNumber || product?.sku || "—")}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.custom_name ? (
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 whitespace-nowrap">
                                  Custom Item
                                </Badge>
                              ) : item.needs_ordering ? (
                                <Badge variant="pending" className="whitespace-nowrap">
                                  Needs Order ({orderQty} {product?.unit || "pc"}{orderQty > 1 ? "s" : ""})
                                </Badge>
                              ) : (
                                <Badge variant="approved" className="whitespace-nowrap">
                                  In Stock
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {peso(Number(item.unit_price))}
                            </TableCell>
                            <TableCell className="text-center">
                              {Number(item.quantity)}
                            </TableCell>
                            <TableCell className="text-center font-semibold">
                              {peso(Number(item.subtotal))}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                          No parts added.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* ========== SUPPLIES, PETROL, OILS & LUBRICANTS ========== */}
            <div className="rounded-lg border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Fuel className="size-5 text-green-600" />
                <h2 className="text-sm font-semibold text-foreground">Supplies, Petrol, Oils, and Lubricants</h2>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs text-center">Item Name</TableHead>
                      <TableHead className="text-xs w-[20%] text-center">Unit Price</TableHead>
                      <TableHead className="text-xs w-[15%] text-center">Qty</TableHead>
                      <TableHead className="text-xs w-[20%] text-center">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {spolItems.length > 0 ? (
                      spolItems.map((item: any) => {
                        const product = partsMap[item.product_id];
                        return (
                          <TableRow key={item.id} className="hover:bg-transparent text-center">
                            <TableCell className="font-medium text-center">
                              {item.custom_name || product?.name || item.product_id || "—"}
                            </TableCell>
                            <TableCell className="text-center">
                              {peso(Number(item.unit_price))}
                            </TableCell>
                            <TableCell className="text-center">
                              {Number(item.quantity)}
                            </TableCell>
                            <TableCell className="text-center font-semibold">
                              {peso(Number(item.subtotal))}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">
                          No supplies added.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* ========== BILLING SUMMARY ========== */}
          <div className="">
            <div className="sticky top-6 space-y-4">
              <Card className="shadow-lg border-primary/20">
                <CardHeader className="bg-primary/5 py-4 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="size-5 text-blue-900" />
                    <h2 className="font-semibold text-foreground">Billing Summary</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Estimated Duration</span>
                      <span>{formatDuration(totals.estimatedMinutes)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Services Subtotal</span>
                      <span>{peso(totals.totalServices)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Parts Subtotal</span>
                      <span>{peso(totals.totalParts)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Supplies Subtotal</span>
                      <span>{peso(totals.totalSupplies)}</span>
                    </div>
                  </div>

                  <div className="bg-primary/10 p-3 rounded-lg border border-primary/20 space-y-2">
                    <div className="flex justify-between items-end text-primary">
                      <span className="text-xs font-bold uppercase">Grand Total</span>
                      <span className="text-xl font-bold tracking-wide">{peso(totals.total)}</span>
                    </div>
                    <Separator className="bg-primary/20" />
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Downpayment</span>
                      {(!estimate.status ||
                        estimate.status.toUpperCase() === "FOR APPROVAL" ||
                        estimate.status.toUpperCase() === "FOR_APPROVAL" ||
                        estimate.status.toUpperCase() === "DRAFT") ? (
                        <div className="w-32">
                          <CurrencyInput
                            value={downpayment}
                            onChange={(val) => setDownpayment(Number(val) || 0)}
                          />
                        </div>
                      ) : (
                        <span>{peso(Number(estimate.downpayment_amount) || 0)}</span>
                      )}
                    </div>
                    <Separator className="bg-primary/20" />
                    <div className="flex justify-between items-end text-blue-950 dark:text-blue-200 font-bold">
                      <span className="text-xs uppercase">Balance Due</span>
                      <span className="text-2xl tracking-wide">{peso(Math.max(0, totals.total - downpayment))}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Internal Notes</Label>
                    <Textarea
                      value={estimate.notes || "No notes added."}
                      readOnly
                      rows={4}
                      className="resize-none text-xs bg-background"
                    />
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <Separator />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Status</span>
                      <Badge
                        variant={
                          statusConfig[estimate.status]?.variant ||
                          statusConfig[estimate.status?.toUpperCase()]?.variant ||
                          "default"
                        }
                        className="capitalize"
                      >
                        {statusConfig[estimate.status]?.label ||
                          statusConfig[estimate.status?.toUpperCase()]?.label ||
                          estimate.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Created</span>
                      <span>{formatDate(estimate.created_at)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Created By</span>
                      <span>
                        {estimate.creator
                          ? `${estimate.creator.first_name} ${estimate.creator.last_name}`
                          : "—"}
                      </span>
                    </div>
                    {estimate.editor && (
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Edited By</span>
                        <span>
                          {estimate.editor.first_name} {estimate.editor.last_name}
                        </span>
                      </div>
                    )}
                    {estimate.approver && (
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Approved By</span>
                        <span>
                          {estimate.approver.first_name} {estimate.approver.last_name}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Updated</span>
                      <span>{formatDate(estimate.updated_at)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    {isSupervisorOrAdmin &&
                      (estimate.status?.toUpperCase() === "FOR APPROVAL" ||
                        estimate.status?.toUpperCase() === "FOR_APPROVAL") && (
                        <Button
                          className="w-full shadow-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                          size="lg"
                          onClick={handleApproveEstimate}
                          disabled={isApproving}
                        >
                          {isApproving ? "Approving..." : "Approve Estimate"}
                        </Button>
                      )}
                    <Button
                      className="w-full shadow-md"
                      size="lg"
                      variant="outline"
                      onClick={handleDownloadPDF}
                      disabled={isDownloading}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isDownloading ? "Downloading..." : "Download PDF"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <p className="text-xs text-center text-muted-foreground px-4">
                Estimates are subject to approval and may change depending on actual service findings.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Estimate"
        description={
          <>
            Are you sure you want to delete this estimate?
            <br />
            <br />
            <span className="text-muted-foreground">
              This action cannot be undone.
            </span>
          </>
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleRemoveEstimate}
      />
    </div>
  );
};

export default EstimateDetail;