import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DataToolbar from "@/components/DataToolbar";
import ConfirmDialog from "@/components/popupModal/AlertDialog/ConfirmDialog";
import { toast } from "sonner";
import { ArrowLeft, Pencil, XCircle, BanknoteX, ClipboardList, Tag, Clock } from "lucide-react";

/* ================= STORAGE ================= */
const SERVICE_KEY = "services";
const CATEGORY_KEY = "serviceCategories";
const VEHICLE_SIZE_KEY = "vehicleSizes";
const PRICING_KEY = "servicePricing";


/* ================= TYPES ================= */
interface Service {
  id: string;
  name: string;
  serviceCategoryId: string;
  description?: string;
  duration?: number;
  pricingType: "fixed" | "hourly rate";
}

interface ServiceCategory {
  id: string;
  name: string;
}

interface VehicleSize {
  id: string;
  name: string;
  description: string;
}

interface ServicePricing {
  id: string;
  serviceId: string;
  vehicleSizeId: string;
  price: number;
}


/* ================= COMPONENT ================= */
const ServiceDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [service, setService] = useState<Service | null>(null);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [vehicleSizes, setVehicleSizes] = useState<VehicleSize[]>([]);
  const [pricing, setPricing] = useState<ServicePricing[]>([]);

  const [confirmOpen, setConfirmOpen] = useState(false);

/* ================= LOAD ================= */
useEffect(() => {
  const services: Service[] = JSON.parse(localStorage.getItem(SERVICE_KEY) || "[]");

  setService(services.find((s) => s.id === id) || null);
  setCategories(JSON.parse(localStorage.getItem(CATEGORY_KEY) || "[]"));
  setVehicleSizes(JSON.parse(localStorage.getItem(VEHICLE_SIZE_KEY) || "[]"));
  setPricing(JSON.parse(localStorage.getItem(PRICING_KEY) || "[]"));
}, [id]);

/* ================= DERIVED DATA ================= */
const category = useMemo(
  () => categories.find((c) => c.id === service?.serviceCategoryId),
  [categories, service]
);

const servicePricing = useMemo(
  () => pricing.filter((p) => p.serviceId === id),
  [pricing, id]
);

const durationFormatted = useMemo(() => {
  if (service?.duration == null) return "—";

  const hours = Math.floor(service.duration / 60);
  const minutes = service.duration % 60;

  let text = "";

  if (hours > 0) {
    text += `${hours} hour${hours > 1 ? "s" : ""}`;
  }

  if (minutes > 0) {
    if (text) text += " & ";
    text += `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }

  if (!text) text = "0 minutes";

  return text;
}, [service]);


/* ================= DELETE SERVICE ================= */
const handleDeleteService = () => {
  const services: Service[] = JSON.parse(localStorage.getItem(SERVICE_KEY) || "[]");

  const updated = services.filter((s) => s.id !== id);

  localStorage.setItem(SERVICE_KEY, JSON.stringify(updated));

  toast.success("Service deleted");
  navigate(-1);
};

/* ================= UI ================= */
if (!service) return null;

return (
  <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-y-auto">

    {/* BREADCRUMB */}
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => navigate(-1)}>
            Service Catalog
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{service.name}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    {/* TOOLBAR (VIEW MODE ONLY) */}
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
              onClick={() => navigate(`/webapp/services/service-catalog/${id}/edit`)}
            >
              <Pencil className="w-4 h-4 mr-1" />
              Edit Service
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Remove Service
            </Button>
          </div>
        </div>
      }
    />

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* SERVICE INFO */}
      <Card>
        <CardHeader>
          <CardTitle>Service Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label> Service Name</Label>
            <p className="text-sm">{service.name}</p>
          </div>

          <div className="space-y-1">
            <Label>Category</Label>
            <p className="text-sm">{category?.name || "—"}</p>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
              <div>
                <Textarea 
                  value={service?.description || "—"} 
                  rows={5} 
                  readOnly
                  className="text-xs resize-none"
                />
              </div>
          </div>

          <div className="space-y-1">
            <Label>Estimated Duration</Label>
            <Input
              value={durationFormatted} 
              readOnly 
              className="text-xs" 
            />
          </div>
        </CardContent>
      </Card>

      {/* PRICING */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex justify-between">
            <div className="space-y-1">
              <CardTitle>Pricing</CardTitle>
              <p className="text-xs text-muted-foreground">
                Indicated pricing type and price range based on vehicle size.
              </p>             
            </div>  
            <Badge variant="outline" className="flex items-center gap-1 text-[11px] uppercase">
              {service.pricingType === "fixed" ? (
                <>
                  <Tag className="w-3 h-3" />
                  Fixed Price
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3" />
                  Hourly Rate
                </>
              )}
            </Badge> 
          </div>                  
        </CardHeader>

        <CardContent className="flex flex-col min-h-[200px]">
          {servicePricing.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Size</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {servicePricing.map((p) => {
                  const size = vehicleSizes.find((v) => v.id === p.vehicleSizeId);

                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Badge variant="outline">{size?.name}</Badge>
                      </TableCell>
                      <TableCell>{size?.description || "—"}</TableCell>
                      <TableCell className="text-right">{p.price}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <BanknoteX className="h-10 w-10 stroke-1 mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No pricing for different vehicle sizes has been set for this service.
              </p>
            </div>
          )}
        </CardContent>
      </Card>        
    </div>

    {/* DELETE CONFIRM */}
    <ConfirmDialog
      open={confirmOpen}
      onOpenChange={setConfirmOpen}
      title="Delete Service"
      description={
        <>
          Are you sure you want to delete this service?
          <br />
          <br />
          <span className="text-muted-foreground">
            This action cannot be undone.
          </span>
        </>
      }
      confirmLabel="Delete"
      destructive
      onConfirm={handleDeleteService}
    />
  </div>
);
}
export default ServiceDetail;