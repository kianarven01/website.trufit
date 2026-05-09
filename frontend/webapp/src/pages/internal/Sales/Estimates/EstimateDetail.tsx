import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import DataToolbar from "@/components/DataToolbar";
import ConfirmDialog from "@/components/popupModal/AlertDialog/ConfirmDialog";
import { toast } from "sonner";


import { ArrowLeft, Car, User, Wrench, Box, Mail, Phone, MapPin } from "lucide-react";

/* ================= STORAGE ================= */

const STORAGE_KEY = "estimates";
const VEHICLE_MODEL_STORAGE_KEY = "vehicleModels";

/* ================= TYPES ================= */

interface VehicleModel {
  id: string;
  year: number;
  make: string;
  model: string;
  variant: string;
}

interface EstimateServiceLine {
  id: string;
  ServiceTypeId: string;
  service: string;
  category: string;
  estimateDuration: number;
  price: number;
  amount: number;
}

interface EstimatePartLine {
  id: string;
  ProductId: string;
  name: string;
  sku: string;
  price: number;
  unit: string;
  quantity: number;
  amount: number;
}

interface Estimate {
  id: string;
  estimateNo?: string;

  customer: {
    firstName?: string;
    lastName?: string;
    mobileNumber?: string;
    landline?: string;
    businessPhone?: string;
    email?: string;
    address?: string;
  };

  vehicle: {
    id?: string;
    vehicleModelId?: string;

    year?: number;
    make?: string;
    model?: string;
    variant?: string;

    plateNo?: string;
    color?: string;
    vin?: string;
    engineNo?: string;
    registrationNo?: string;
    sellingDealer?: string;
  };

  mileage?: number;

  services: EstimateServiceLine[];

  parts: EstimatePartLine[];

  status: "issued" | "approved";

  subtotalServices: number;
  subtotalParts: number;
  total: number;

  notes?: string;

  createdAt: string;
  updatedAt: string;
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

const formatDuration = (mins?: number) => {
  if (!mins) return "—";

  const hrs = Math.floor(mins / 60);
  const minsRemaining = mins % 60;

  if (hrs && minsRemaining) {
    return `${hrs}hrs & ${minsRemaining} mins`;
  }

  if (hrs) {
    return `${hrs} hrs`;
  }

  return `${minsRemaining} mins`;
};

/* ================= COMPONENT ================= */

const EstimateDetail: React.FC = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [estimate, setEstimate] = useState<Estimate | null>(null);

  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);

  /* ================= LOAD ================= */

  useEffect(() => {
    const estimates: Estimate[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    const found =
      estimates.find((e) => e.id === id) || null;

    setEstimate(found);

    const models: VehicleModel[] = JSON.parse(
      localStorage.getItem(
        VEHICLE_MODEL_STORAGE_KEY
      ) || "[]"
    );

    setVehicleModels(models);
  }, [id]);

  /* ================= DERIVED ================= */

  const customer = estimate?.customer;

  const vehicle = useMemo(() => {
    if (!estimate?.vehicle) return null;

    const model = vehicleModels.find(
      (m) =>
        m.id === estimate.vehicle.vehicleModelId
    );

    return {
      ...estimate.vehicle,

      year:
        estimate.vehicle.year ??
        model?.year,

      make:
        estimate.vehicle.make ??
        model?.make,

      model:
        estimate.vehicle.model ??
        model?.model,

      variant:
        estimate.vehicle.variant ??
        model?.variant,
    };
  }, [estimate, vehicleModels]);

  const services = estimate?.services || [];
  const parts = estimate?.parts || [];

  const estimatedMinutes = useMemo(() => {
    return services.reduce(
      (sum, s) => sum + (s.estimateDuration || 0),
      0
    );
  }, [services]);


  /* ================= ACTIONS ================= */

  const handleEditEstimate = () => {
    navigate(`/webapp/sales/estimates/${estimate?.id}/edit`);
  };

  const handleRemoveEstimate = () => {
    const estimates: Estimate[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    const updated = estimates.filter(
      (e) => e.id !== estimate?.id
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    toast.success("Estimate deleted");

    navigate("/webapp/sales/estimates");
  };

  /* ================= EMPTY STATE ================= */

  if (!estimate) {
    return (
      <div className="w-full h-full p-4">
        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <Box className="h-10 w-10 stroke-1 mb-2 text-muted-foreground" />

            <p className="text-sm font-medium">
              Estimate not found
            </p>

            <p className="text-xs text-muted-foreground">
              The selected estimate record does not exist.
            </p>

            <Button
              variant="outline"
              className="mt-6"
              onClick={() =>
                navigate("/webapp/sales/estimates")
              }
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
      
      {/* ================= TOOLBAR ================= */}

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
            <Button
              size="sm"
              onClick={handleEditEstimate}
            >
              Edit Estimate
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmOpen(true)}
            >
              Remove Estimate
            </Button>
          </div>
        }
      />

      {/* ================= CUSTOMER + VEHICLE ================= */}

      <div className="grid lg:grid-cols-2 gap-4">
        
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
                {customer?.firstName}{" "}
                {customer?.lastName}
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
                    {customer?.email || "—"}
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
                    {customer?.mobileNumber || "—"}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Landline
                </p>

                <p className="text-sm">
                  {customer?.landline || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Business Phone
                </p>

                <p className="text-sm">
                  {customer?.businessPhone || "—"}
                </p>
              </div>

              <div className="space-y-1 col-span-2">
                <p className="text-xs text-muted-foreground">
                  Address
                </p>

                <div className="flex items-start gap-2">
                  <MapPin className="size-3.5 mt-0.5 text-muted-foreground" />

                  <p className="text-sm">
                    {customer?.address || "—"}
                  </p>
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

              <p className="font-semibold text-foreground">
                {[
                  vehicle?.year,
                  vehicle?.make,
                  vehicle?.model,
                ]
                  .filter(Boolean)
                  .join(" ") || "—"}
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
                  {vehicle?.variant || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Color
                </p>

                <p className="text-sm">
                  {vehicle?.color || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Plate No.
                </p>

                <p className="text-sm">
                  {vehicle?.plateNo || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Engine No.
                </p>

                <p className="text-sm">
                  {vehicle?.engineNo || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Chassis No. (VIN)
                </p>

                <p className="text-sm break-all">
                  {vehicle?.vin || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Registration No.
                </p>

                <p className="text-sm">
                  {vehicle?.registrationNo || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Selling Dealer
                </p>

                <p className="text-sm">
                  {vehicle?.sellingDealer || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Mileage
                </p>

                <p className="text-sm">
                  {estimate.mileage
                    ? `${estimate.mileage.toLocaleString()} km`
                    : "—"}
                </p>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================= ESTIMATE DETAILS ================= */}

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

              {services.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs">
                        Service
                      </TableHead>

                      <TableHead className="text-xs">
                        Category
                      </TableHead>

                      <TableHead className="text-xs">
                        Est. Duration
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
                    {services.map((s) => (
                      <TableRow key={s.id}>
                        
                        <TableCell className="font-medium">
                          {s.service}
                        </TableCell>

                        <TableCell>
                          {s.category}
                        </TableCell>

                        <TableCell>
                          {formatDuration(
                            s.estimateDuration
                          )}
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
              ) : (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No services added.
                </div>
              )}

            </div>
          </div>

          {/* ================= PARTS ================= */}

          <div className="rounded-lg border border-border bg-card p-5 space-y-3">

            <div className="flex items-center gap-2">
              <Box className="size-5 text-orange-500" />

              <h2 className="text-sm font-semibold text-foreground">
                Parts (Sales Order)
              </h2>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">

              {parts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs">
                        Item Name
                      </TableHead>

                      <TableHead className="text-xs">
                        SKU
                      </TableHead>

                      <TableHead className="text-xs text-right">
                        Qty
                      </TableHead>

                      <TableHead className="text-xs text-right">
                        Unit Price
                      </TableHead>

                      <TableHead className="text-xs text-right">
                        Amount
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {parts.map((p) => (
                      <TableRow key={p.id}>
                        
                        <TableCell className="font-medium">
                          {p.name}
                        </TableCell>

                        <TableCell>
                          {p.sku}
                        </TableCell>

                        <TableCell className="text-right">
                          {p.quantity} {p.unit}
                        </TableCell>

                        <TableCell className="text-right">
                          {peso(p.price)}
                        </TableCell>

                        <TableCell className="text-right font-semibold">
                          {peso(p.amount)}
                        </TableCell>

                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No parts added.
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
                <h2 className="text-lg font-semibold">Summary</h2>
              </CardHeader>

              <CardContent  className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Status</p>
                  <Badge>{estimate.status}</Badge>                  
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Services Subtotal</p>
                    <span>{peso(estimate.subtotalServices)}</span>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Parts Subtotal</p>
                    <span>{peso(estimate.subtotalParts)}</span>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Total</p>
                    <span>{peso(estimate.total)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Estimated Duration</p>
                    <span>
                      {formatDuration(
                        estimatedMinutes
                      )}
                    </span>
                  </div>

                  <Separator/>

                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Linked JO</p>
                    <span>—</span>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Linked SO</p>
                    <span>—</span>
                  </div> 


                  <Separator/>  

                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Created</p>
                    <div>
                      {formatDate(
                        estimate.createdAt
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Updated</p>
                    <div>
                      {formatDate(
                        estimate.updatedAt
                      )}
                    </div>
                  </div>                  
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-muted-foreground">
                    Notes
                  </p>

                  <Textarea
                    value={
                      estimate.notes ||
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
                Approve Estimate
              </Button>

              </CardContent>
            </Card>

            <p className="text-xs text-center text-muted-foreground px-4">
              Estimates are subject to approval and
              may change depending on actual service
              findings.
            </p>

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