import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ArrowLeft, Plus, Trash2, Wrench, FileText } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/axios";
import Combobox from "@/components/ui/combobox";

/* TYPES */
interface Customer {
  customer_id: number;
  first_name: string;
  last_name: string;
  mobile_number?: string;
  vehicles?: Vehicle[];
}

interface Vehicle {
  id: number;
  plate_number: string;
  year_model?: string;
  make?: string;
  model?: string;
  variant?: string;
}

interface ServiceType {
  id: string;
  name: string;
  price: number;
  pricing_type: string;
  service_category_id?: number;
}

interface SelectedService {
  serviceId: string;
  name: string;
  price: number;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  position?: string;
}

/* COMPONENT */
interface JobOrderFormProps {
  mode?: "create" | "edit";
}

const JobOrderForm: React.FC<JobOrderFormProps> = ({ mode = "create" }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = mode === "edit" && !!id;

  // Data
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);

  // Form state
  const [customerId, setCustomerId] = useState<string>("");
  const [vehicleId, setVehicleId] = useState<string>("");
  const [technicianId, setTechnicianId] = useState<string>("");
  const [jobDate, setJobDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [notes, setNotes] = useState<string>("");

  // Add service form
  const [addServiceId, setAddServiceId] = useState<string>("");
  const [addServicePrice, setAddServicePrice] = useState<number>(0);

  // Loading
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      sessionStorage.setItem(`breadcrumb-/webapp/services/job-orders/${id}`, id);
      window.dispatchEvent(new Event('breadcrumb-update'));
    }
    return () => {
      if (isEdit && id) {
        sessionStorage.removeItem(`breadcrumb-/webapp/services/job-orders/${id}`);
        window.dispatchEvent(new Event('breadcrumb-update'));
      }
    };
  }, [isEdit, id]);

  /* FETCH DATA */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises: Promise<any>[] = [
          api.get("/customers"),
          api.get("/admin/employees"),
          api.get("/products/service-types"),
        ];

        if (isEdit && id) {
          promises.push(api.get(`/job-orders/${id}`));
        }

        const results = await Promise.all(promises);

        setCustomers(results[0].data.data || []);
        setEmployees(results[1].data.data || []);
        setServiceTypes(results[2].data.data || []);

        // Hydrate existing JO in edit mode
        if (isEdit && results[3]) {
          const jo = results[3].data.data;
          setCustomerId(jo.vehicle?.customerID ? String(jo.vehicle.customerID) : "");
          setVehicleId(jo.vehicle_id_new ? String(jo.vehicle_id_new) : "");
          setTechnicianId(jo.technicians?.[0]?.employee?.id ? String(jo.technicians[0].employee.id) : "");
          setJobDate(jo.date ? new Date(jo.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);
          setSelectedServices(
            (jo.services || []).map((s: any) => ({
              serviceId: s.ServiceID,
              name: s.service_type?.name || "Unknown Service",
              price: Number(s.PriceAtSale) || 0,
            }))
          );
          setNotes(jo.notes || "");
          // Update breadcrumb with JO number
          if (jo.jo_number || jo.joNumber) {
            sessionStorage.setItem(`breadcrumb-/webapp/services/job-orders/${id}`, jo.jo_number || jo.joNumber);
            window.dispatchEvent(new Event('breadcrumb-update'));
          }
        }
      } catch (err) {
        console.error("Failed to load form data", err);
        toast.error("Failed to load form data");
      }
    };
    fetchData();
  }, [isEdit, id]);

  /* COMPUTED */
  const customerList = customers.map((c) => ({
    label: `${c.first_name || ""} ${c.last_name || ""}`.trim(),
    value: String(c.customer_id),
  }));

  const vehicleList = customers
    .find((c) => String(c.customer_id) === customerId)
    ?.vehicles?.map((v) => ({
      label: `${v.year_model || ""} ${v.make || ""} ${v.model || ""} (${v.plate_number})`.trim(),
      value: String(v.id),
    })) || [];

  const technicianList = employees.map((e) => ({
    label: `${e.first_name || ""} ${e.last_name || ""}`.trim(),
    value: String(e.id),
  }));

  const serviceList = serviceTypes.map((s) => ({
    label: s.name,
    value: s.id,
  }));

  const totalServices = selectedServices.reduce((sum, s) => sum + s.price, 0);

  /* HANDLERS */
  const handleAddService = () => {
    if (!addServiceId) {
      toast.error("Please select a service");
      return;
    }
    if (selectedServices.some((s) => s.serviceId === addServiceId)) {
      toast.error("Service already added");
      return;
    }
    const svc = serviceTypes.find((s) => s.id === addServiceId);
    if (!svc) return;

    setSelectedServices([
      ...selectedServices,
      { serviceId: addServiceId, name: svc.name, price: addServicePrice || Number(svc.price) || 0 },
    ]);
    setAddServiceId("");
    setAddServicePrice(0);
    toast.success("Service added");
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices(selectedServices.filter((s) => s.serviceId !== serviceId));
  };

  const handleSave = async () => {
    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }
    if (!vehicleId) {
      toast.error("Please select a vehicle");
      return;
    }
    if (!technicianId) {
      toast.error("Please assign a technician");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        vehicle_id: parseInt(vehicleId),
        technician_id: parseInt(technicianId),
        date: jobDate,
        notes: notes || null,
        services: selectedServices.map((s) => ({
          service_id: s.serviceId,
          price: s.price,
        })),
      };

      const res = isEdit
        ? await api.patch(`/job-orders/${id}`, payload)
        : await api.post("/job-orders", payload);
      const jo = res.data.data;
      toast.success(`Job Order ${jo.jo_number || jo.joNumber || id} ${isEdit ? "updated" : "created"} successfully`);
      navigate(isEdit ? `/webapp/services/job-orders/${id}` : "/webapp/services/job-orders");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create job order");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-y-auto">
      {/* TOOLBAR */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/webapp/services/job-orders")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>
        <Button size="sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : isEdit ? "Update Job Order" : "Create Job Order"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-4">
          {/* CUSTOMER & VEHICLE */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold">Customer & Vehicle</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Customer *</Label>
                  <Combobox
                    value={customerId}
                    onChange={(val) => {
                      setCustomerId(val);
                      setVehicleId("");
                    }}
                    items={customerList}
                    placeholder="Select customer"
                  />
                </div>
                <div>
                  <Label>Vehicle *</Label>
                  {!customerId ? (
                    <Input value="" placeholder="Select customer first" disabled />
                  ) : (
                    <Combobox
                      value={vehicleId}
                      onChange={setVehicleId}
                      items={[{ label: "No Vehicle", value: "" }, ...vehicleList]}
                      placeholder="Select vehicle"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TECHNICIAN & DATE */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold">Assignment</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Technician *</Label>
                  <Combobox
                    value={technicianId}
                    onChange={setTechnicianId}
                    items={technicianList}
                    placeholder="Assign technician"
                  />
                </div>
                <div>
                  <Label>Job Date</Label>
                  <Input
                    type="date"
                    value={jobDate}
                    onChange={(e) => setJobDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* NOTES */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Notes / Recommendations</h2>
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes, recommendations, or special instructions..."
                className="w-full min-h-[80px] bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
              />
            </CardContent>
          </Card>

          {/* SERVICES */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Services</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Service Row */}
              <div className="grid sm:grid-cols-3 gap-3 bg-muted/20 p-3 rounded-lg border border-dashed border-border">
                <div className="sm:col-span-1">
                  <Label className="text-xs">Service</Label>
                  <Combobox
                    value={addServiceId}
                    onChange={(val) => {
                      setAddServiceId(val);
                      const svc = serviceTypes.find((s) => s.id === val);
                      if (svc) setAddServicePrice(Number(svc.price) || 0);
                    }}
                    items={serviceList}
                    placeholder="Select service"
                  />
                </div>
                <div>
                  <Label className="text-xs">Price (₱)</Label>
                  <Input
                    type="number"
                    value={addServicePrice}
                    onChange={(e) => setAddServicePrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    min={0}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddService} variant="outline" className="h-9 px-3">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Services Table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-center">Service</TableHead>
                      <TableHead className="w-[20%] text-center">Price</TableHead>
                      <TableHead className="w-[10%] text-center"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedServices.length > 0 ? (
                      selectedServices.map((svc) => (
                        <TableRow key={svc.serviceId}>
                          <TableCell className="font-medium">{svc.name}</TableCell>
                          <TableCell className="text-center">₱{svc.price.toLocaleString()}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              onClick={() => handleRemoveService(svc.serviceId)}
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-6 text-sm">
                          No services added yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN — SUMMARY */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader className="bg-muted/30">
              <h2 className="text-sm font-semibold">Summary</h2>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Services</span>
                  <span>{selectedServices.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg text-primary">
                  <span>Estimated Total</span>
                  <span>₱{totalServices.toLocaleString()}</span>
                </div>
              </div>

              <Separator />

              <div className="pt-2">
                <Button className="w-full" onClick={handleSave}>
                  {isEdit ? "Update Job Order" : "Create Job Order"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobOrderForm;
