import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import {
  ArrowLeft,
  Car,
  User,
  Wrench,
  Mail,
  Phone,
  MapPin,
  Edit,
  XCircle,
  Paperclip,
} from "lucide-react";

import DataToolbar from "@/components/DataToolbar";
import ConfirmDialog from "@/components/popupModal/AlertDialog/ConfirmDialog";

import { toast } from "sonner";

import {
  Pagination,
  usePagination,
} from "@/components/ui/pagination";

/* ================= STORAGE ================= */

const STORAGE_KEY = "jobOrders";
const SALES_ORDER_KEY = "salesOrders";
const VEHICLE_MODEL_STORAGE_KEY = "vehicleModels";

/* ================= TYPES ================= */

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  mobileNumber: string;
  landline?: string;
  email?: string;
  businessPhone?: string;
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
}

interface VehicleModel {
  id: string;
  year: number;
  make: string;
  model: string;
  variant: string;
  serviceClass: string;
}

interface JobOrderServiceLine {
  id: string;
  ServiceTypeId: string;
  service: string;
  category: string;
  Duration: number;
  price: number;
  amount: number;
  manualRate?: number;
}

interface JobOrder {
  id: string;
  jobOrderNo: string;
  customer: Customer;
  vehicle?: Vehicle | null;
  mileage?: number;
  services: JobOrderServiceLine[];
  subtotalServices: number;
  linkedSO?: string | null;
  total: number;
  notes?: string;
  status: "issued" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

interface SalesOrder {
  id: string;
  salesOrderNo: string;
  subtotalParts?: number;
  total?: number;
}

/* ================= COMPONENT ================= */

const JobOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const [jobOrder, setJobOrder] = useState<JobOrder | null>(null);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    paginate,
  } = usePagination(10);

  /* ================= LOAD ================= */

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const found = stored.find((o: JobOrder) => o.id === id);
      setJobOrder(found || null);

      const storedSalesOrders = JSON.parse(localStorage.getItem(SALES_ORDER_KEY) || "[]");
      setSalesOrders(storedSalesOrders || []);
      
      const storedVehicleModels = JSON.parse(localStorage.getItem(VEHICLE_MODEL_STORAGE_KEY) || "[]");

      setVehicleModels(storedVehicleModels || []);
    } catch (err) {
      console.error("Failed to load job order:", err);
    }
  }, [id]);

  /* ================= ACTIONS ================= */

  const handleEditJobOrder = () => {
    navigate(
      `/webapp/services/job-orders/${jobOrder?.id}/edit`
    );
  };

  const handleRemoveJobOrder = () => {
    const orders: JobOrder[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const updated = orders.filter((o) => o.id !== jobOrder?.id);

    localStorage.setItem( STORAGE_KEY, JSON.stringify(updated));
    toast.success("Job order deleted");

    navigate("/webapp/service/job-orders");
  };

  /* ================= HELPERS ================= */

  const salesOrderMap = useMemo(() => {
    const map = new Map<string, SalesOrder>();
    salesOrders.forEach((so) => map.set(so.id, so));
    return map;
  }, [salesOrders]);

  const linkedSalesOrder = useMemo(() => {
    if (!jobOrder?.linkedSO) return null;

    return salesOrderMap.get(jobOrder.linkedSO);
  }, [jobOrder, salesOrderMap]);  

  const vehicleModel = useMemo(() => {
    if (!jobOrder?.vehicle) return null;

    return vehicleModels.find(
      (vm) =>
        vm.id ===
        jobOrder.vehicle?.vehicleModelId
    );
  }, [jobOrder, vehicleModels]);

  const getStatusVariant = (
    status: JobOrder["status"]
  ) => {
    switch (status) {
      case "completed":
        return "approved";

      case "cancelled":
        return "destructive";

      default:
        return "secondary";
    }
  };

  const peso = (value: number) =>
    `₱${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (d?: string) => {
    if (!d) return "—";

    return new Date(d).toLocaleString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const formatDuration = (
    minutes?: number
  ) => {
    if (!minutes) return "—";

    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hrs && mins)
      return `${hrs}h ${mins}m`;

    if (hrs) return `${hrs}h`;

    return `${mins}m`;
  };

  /* ================= EMPTY ================= */

  if (!jobOrder) {
    return (
      <div className="p-6">
        Job order not found
      </div>
    );
  }

  /* ================= DATA ================= */

  const items = jobOrder.services || [];

  const paginatedItems = paginate(items);

  const subtotal = Number(
    jobOrder.subtotalServices || 0
  );

  const partsSubtotal = Number(
    linkedSalesOrder?.subtotalParts || 0
  );

  const total = Number(jobOrder.total || 0);

  /* ================= UI ================= */

  return (
    <div className="w-full h-full pl-4 pr-3 pb-4 flex flex-col gap-4 overflow-y-auto">

      {/* ================= TOOLBAR ================= */}

      <DataToolbar
        variant="detail"
        title={`Job Order: ${jobOrder.jobOrderNo}`}
        actions={
          <div className="flex items-center gap-2">

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate("/webapp/services/job-orders")
              }
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            <Button
              size="sm"
              onClick={handleEditJobOrder}
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                setConfirmOpen(true)
              }
            >
              <XCircle className="w-4 h-4 mr-1" />
              Remove Job Order
            </Button>

          </div>
        }
      />

      {/* ================= CUSTOMER + VEHICLE ================= */}

      <div className="grid gap-4 lg:grid-cols-2">

        {/* CUSTOMER DETAILS */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-blue-500">
              <User className="size-5" />

              <p className="font-semibold text-foreground">
                Customer Details
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Full Name
              </p>

              <p className="text-sm font-medium">
                {jobOrder.customer.firstName}{" "}
                {jobOrder.customer.lastName}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Email Address
                </p>

                <div className="flex items-center gap-2">
                  <Mail className="size-3.5 text-muted-foreground" />

                  <p className="text-sm">
                    {jobOrder.customer.email || "—"}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Phone Number
                </p>

                <div className="flex items-center gap-2">
                  <Phone className="size-3.5 text-muted-foreground" />

                  <p className="text-sm">
                    {jobOrder.customer.mobileNumber || "—"}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Landline
                </p>

                <p className="text-sm">
                  {jobOrder.customer.landline || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Business Phone
                </p>

                <p className="text-sm">
                  {jobOrder.customer.businessPhone || "—"}
                </p>
              </div>

              <div className="space-y-1 col-span-2">
                <p className="text-xs text-muted-foreground">
                  Address
                </p>

                <div className="flex items-start gap-2">
                  <MapPin className="size-3.5 mt-0.5 text-muted-foreground" />

                  <p className="text-sm">
                    {jobOrder.customer.address || "—"}
                  </p>
                </div>
              </div>

            </div>

          </CardContent>
        </Card>

        {/* VEHICLE DETAILS */}
        <Card
          className={`
            relative overflow-hidden transition-all duration-200
            ${
              !jobOrder.vehicle
                ? "opacity-50 grayscale-[0.2]"
                : ""
            }
          `}
        >
          {!jobOrder.vehicle && (
            <div className="absolute inset-0 z-10 backdrop-blur-[2px] bg-background/40" />
          )}

          <CardHeader>
            <div className="flex items-center gap-2 text-blue-500">
              <Car className="size-5" />

              <p className="font-semibold text-foreground">
                {jobOrder.vehicle
                  ? [
                      vehicleModel?.year,
                      vehicleModel?.make,
                      vehicleModel?.model,
                    ]
                      .filter(Boolean)
                      .join(" ")
                  : "No Vehicle Information"}
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-4">

              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Variant
                </p>

                <p className="text-sm">
                  {vehicleModel?.variant || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Color
                </p>

                <p className="text-sm">
                  {jobOrder.vehicle?.color || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Plate No.
                </p>

                <p className="text-sm">
                  {jobOrder.vehicle?.plateNo || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Engine No.
                </p>

                <p className="text-sm">
                  {jobOrder.vehicle?.engineNo || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Chassis No. (VIN)
                </p>

                <p className="text-sm break-all">
                  {jobOrder.vehicle?.vin || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Registration No.
                </p>

                <p className="text-sm">
                  {jobOrder.vehicle?.registrationNo || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Selling Dealer
                </p>

                <p className="text-sm">
                  {jobOrder.vehicle?.sellingDealer || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Mileage
                </p>

                <p className="text-sm">
                  {jobOrder.mileage
                    ? `${jobOrder.mileage.toLocaleString()} km`
                    : "—"}
                </p>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================= ORDER DETAILS ================= */}

      <div className="grid lg:grid-cols-3 gap-4">

        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">

          {/* ================= SERVICES ================= */}
          <div className="rounded-lg border border-border bg-card p-5 space-y-3">

            <div className="flex items-center gap-2">
              <Wrench className="size-5 text-blue-500" />

              <h2 className="text-sm font-semibold text-foreground">
                Services (Job Order)
              </h2>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">

              {items.length > 0 ? (
                <>
                  <Table>

                    <TableHeader>
                      <TableRow className="bg-muted/50">

                        <TableHead className="text-xs">
                          Service
                        </TableHead>

                        <TableHead className="text-xs">
                          Category
                        </TableHead>

                        <TableHead className="text-xs text-right">
                          Duration
                        </TableHead>

                        <TableHead className="text-xs text-right">
                          Rate
                        </TableHead>

                        <TableHead className="text-xs text-right">
                          Amount
                        </TableHead>

                      </TableRow>
                    </TableHeader>

                    <TableBody>

                      {paginatedItems.map((s) => (
                        <TableRow key={s.id}>

                          <TableCell className="font-medium">
                            {s.service}
                          </TableCell>

                          <TableCell>
                            {s.category || "—"}
                          </TableCell>

                          <TableCell className="text-right">
                            {formatDuration(s.Duration)}
                          </TableCell>

                          <TableCell className="text-right">
                            {peso(s.price)}
                          </TableCell>

                          <TableCell className="text-right font-semibold">
                            {peso(s.amount)}
                          </TableCell>

                        </TableRow>
                      ))}

                    </TableBody>

                  </Table>

                  {items.length > pageSize && (
                    <Pagination
                      totalItems={items.length}
                      page={page}
                      pageSize={pageSize}
                      onPageChange={setPage}
                      onPageSizeChange={setPageSize}
                    />
                  )}
                </>
              ) : (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No services added.
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ================= SUMMARY ================= */}

        <div>
          <div className="sticky top-6 space-y-4">

            <Card className="shadow-lg border-primary/20">

              <CardHeader>
                <h2 className="text-lg font-semibold">
                  Summary
                </h2>
              </CardHeader>

              <CardContent className="space-y-4 text-sm">

                <div className="flex justify-between items-center">
                  <p className="text-muted-foreground">
                    Status
                  </p>

                  <Badge
                    variant={getStatusVariant(jobOrder.status)}
                    className="capitalize"
                  >
                    {jobOrder.status}
                  </Badge>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <p className="text-muted-foreground">
                    Linked SO
                  </p>

                  {linkedSalesOrder ? (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/webapp/sales/sales-orders/${linkedSalesOrder.id}`
                        )
                      }
                      className="
                      hover:text-blue-700
                        hover:underline font-medium
                        transition-colors
                      "
                    >
                      {linkedSalesOrder.salesOrderNo}
                    </button>
                  ) : (
                    <span>—</span>
                  )}
                </div>

                <Separator />
                  
                <div className="space-y-4">

                  <div className="flex justify-between">
                    <p className="text-muted-foreground">
                      Services Subtotal
                    </p>
                    <span>
                      {peso(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <p className="text-muted-foreground">
                      Parts Subtotal
                    </p>
                    <span>
                      {/* {peso(partsSubtotal)} */}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold">
                    <p className="text-foreground">
                      Grand Total
                    </p>

                    <span>
                      {peso(total)}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between">
                    <p className="text-muted-foreground">
                      Created
                    </p>

                    <div>
                      {formatDate(jobOrder.createdAt)}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <p className="text-muted-foreground">
                      Updated
                    </p>

                    <div>
                      {formatDate(jobOrder.updatedAt)}
                    </div>
                  </div>

                </div>

                <div className="space-y-2 pt-2">

                  <p className="text-muted-foreground">
                    Notes
                  </p>

                  <Textarea
                    value={
                      jobOrder.notes ||
                      "No notes added."
                    }
                    readOnly
                    rows={5}
                    className="resize-none text-xs"
                  />

                </div>

                <Button
                  className="w-full"
                  size="sm"
                >
                  <Paperclip className="w-4 h-4 mr-1" />
                  Generate Printable PDF
                </Button>

              </CardContent>

            </Card>

          </div>
        </div>
      </div>

      {/* ================= DELETE DIALOG ================= */}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Job Order"
        description={
          <>
            Are you sure you want to delete this job order?
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
        onConfirm={handleRemoveJobOrder}
      />

    </div>
  );
};

export default JobOrderDetail;