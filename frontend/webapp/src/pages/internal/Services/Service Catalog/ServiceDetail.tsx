import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import DataToolbar from "@/components/DataToolbar";
import ConfirmDialog from "@/components/popupModal/AlertDialog/ConfirmDialog";
import { toast } from "sonner";
import { ArrowLeft, Pencil, XCircle, BanknoteX, ClipboardList, Tag, Clock } from "lucide-react";
import api from "@/api/axios";

/* ================= STORAGE ================= */
const SERVICE_KEY = "services";
const CATEGORY_KEY = "serviceCategories";
const VEHICLE_SIZE_KEY = "vehicleSizes";
const PRICING_KEY = "servicePricing";


/* ================= TYPES ================= */
interface Service {
  id: string;
  name: string;
  category?: string;
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
  vehicleTypes?: string[];
  price: number;
  pricingType: "fixed" | "hourly rate";
}


/* ================= COMPONENT ================= */
const ServiceDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [service, setService] = useState<Service | null>(null);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [vehicleSizes, setVehicleSizes] = useState<VehicleSize[]>([]);
  const [pricing, setPricing] = useState<ServicePricing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingType, setIsUpdatingType] = useState(false);

/* ================= LOAD ================= */
useEffect(() => {
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/products/service-types/${id}`);
      const s = res.data.data;
      setService({
        ...s,
        pricingType: s.pricing_type || "fixed",
        serviceCategoryId: s.category // Mapping text category to serviceCategoryId for UI consistency
      });
      
      // Dynamic Breadcrumb
      sessionStorage.setItem(`breadcrumb-/webapp/services/service-catalog/${id}`, s.name);
      window.dispatchEvent(new Event('breadcrumb-update'));

      // Fetch categories for mapping
      const catRes = await api.get('/products/categories');
      setCategories(catRes.data.data);
      
      // Set pricing from backend if available
      if (s.pricings) {
        setPricing(s.pricings.map((p: any) => ({
          id: p.id,
          serviceId: s.id,
          vehicleSizeId: p.vehicle_size_name,
          vehicleTypes: p.vehicle_types || [],
          price: p.price,
          pricingType: p.pricing_type || "fixed"
        })));
      }

    } catch (err) {
      console.error("Failed to load service detail", err);
      toast.error("Failed to load service detail");
    } finally {
      setIsLoading(false);
    }
  };
  fetchData();
}, [id]);

/* ================= DELETE SERVICE ================= */
const handleDeleteService = async () => {
  try {
    setIsDeleting(true);
    await api.delete(`/products/service-types/${id}`);
    toast.success("Service deleted");
    navigate(-1);
  } catch (err) {
    console.error("Failed to delete service", err);
    toast.error("Failed to delete service");
  } finally {
    setIsDeleting(false);
  }
};

/* ================= DERIVED DATA ================= */
const categoryName = useMemo(() => {
  return service?.category || "—";
}, [service]);

const filteredPricing = useMemo(() => {
  if (!service) return [];
  return pricing.filter(p => p.pricingType === service.pricingType);
}, [pricing, service]);

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

/* ================= UI ================= */
if (isLoading) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
      <p className="text-sm font-medium text-muted-foreground animate-pulse">
        Loading service details...
      </p>
    </div>
  );
}

if (!service) return null;

return (
  <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-y-auto">

    {/* TOOLBAR (VIEW MODE ONLY) */}

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
            <p className="text-sm">{categoryName}</p>
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
            <div className="inline-flex p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 backdrop-blur-sm">
              {[
                { id: "fixed", label: "Fixed Price", icon: <Tag className="w-3 h-3" /> },
                { id: "hourly rate", label: "Hourly Rate", icon: <Clock className="w-3 h-3" /> },
              ].map((type) => {
                const isActive = (service?.pricingType || "fixed") === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={async () => {
                      if (!service || isUpdatingType) return;
                      const newType = type.id as "fixed" | "hourly rate";
                      if (service.pricingType === newType) return;

                      try {
                        setIsUpdatingType(true);
                        await api.put(`/products/service-types/${id}`, {
                          ...service,
                          category_name: service.category,
                          pricing_type: newType
                        });
                        setService({ ...service, pricingType: newType });
                      } catch (err) {
                        toast.error("Failed to update pricing type");
                      } finally {
                        setIsUpdatingType(false);
                      }
                    }}
                    disabled={isUpdatingType}
                    className={cn(
                      "relative flex items-center gap-2 px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-all duration-200 ease-out rounded-lg",
                      isActive 
                        ? "bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)] ring-1 ring-slate-200" 
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50",
                      isUpdatingType && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <span className={cn("transition-transform duration-200", isActive && "scale-110")}>
                      {type.icon}
                    </span>
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>                  
        </CardHeader>

        <CardContent className={cn("flex flex-col min-h-[200px] transition-opacity duration-300", isUpdatingType && "opacity-50 pointer-events-none")}>
          {isUpdatingType ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-2" />
              <p className="text-xs text-muted-foreground animate-pulse">Updating pricing view...</p>
            </div>
          ) : filteredPricing.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Size</TableHead>
                  <TableHead className="text-center">Vehicle Type</TableHead>
                  <TableHead className="text-center">
                    {service.pricingType === "hourly rate" ? "Rate / hr" : "Price"}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredPricing.map((p, i) => {
                  return (
                    <TableRow key={p.id || i}>
                      <TableCell className="text-center">
                        <Badge variant="outline">{p.vehicleSizeId}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {p.vehicleTypes && p.vehicleTypes.length > 0 ? (
                          <span className="text-sm text-muted-foreground">
                            {p.vehicleTypes.join(", ")}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">{Number(p.price).toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <BanknoteX className="h-10 w-10 stroke-1 mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No {service.pricingType === "fixed" ? "fixed prices" : "hourly rates"} have been set for this service.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                You can add pricing for different vehicle sizes in the edit section.
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
      confirmLabel={isDeleting ? "Deleting..." : "Delete"}
      destructive
      onConfirm={handleDeleteService}
    />
  </div>
);
}
export default ServiceDetail;