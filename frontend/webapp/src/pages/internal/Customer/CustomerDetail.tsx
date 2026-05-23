import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import DataToolbar from "@/components/DataToolbar";
import { Pagination, usePagination } from "@/components/ui/pagination";

import { ScrollArea, ScrollBar } from "@/components/ui/scrollArea";

import CustomerFormModal from "@/components/popupModal/Customers/addCustomer";
import AddCustomerVehicle from "@/components/popupModal/Customers/addCustomerVehicle";
import ConfirmDialog from "@/components/popupModal/AlertDialog/ConfirmDialog";
import AddVehicleRecord
 from "@/components/popupModal/Customers/addVehicleRecord";

import { ArrowLeft, Edit, XCircle, Trash2, Plus, Mail, Phone, MapPin, Car, ClipboardClock, MoreHorizontal } from "lucide-react";
import api from "@/api/axios";
import { toast } from "sonner";

/* ================= STORAGE ================= */
const STORAGE_KEY = "customers";
const VEHICLE_STORAGE_KEY = "vehicles";
const VEHICLE_MODEL_STORAGE_KEY = "vehicleModels";
const VEHICLE_HISTORY_STORAGE_KEY = "vehicleHistory";
/* ================= TYPES ================= */
interface VehicleModel {
  id: string;
  year: number;
  make: string;
  model: string;
  variant: string;
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
  hasWarranty?: boolean;
}

type EnrichedVehicle = Vehicle & {
  year?: number;
  make?: string;
  model?: string;
  variant?: string;
};

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  mobileNumber: string;
  landline?: string;
  email?: string;
  businessPhone?: string;
  origin?: string;
}

interface VehicleHistory {
  id: string;
  vehicleId: string;
  dateTime: string; 
  recordType: "JO" | "SO" | "Estimate" | "Interview" | "Checklist";
  recordRef?: string; // JO/SO/Estimate ID
  fileUrl?: string;   // uploaded file
  fileName?: string;
  status: "Completed" | "Pending" | "Cancelled";
}

/* ================= COMPONENT ================= */
const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  const [history, setHistory] = useState<VehicleHistory[]>([]);
  const [lastAddedVehicle, setLastAddedVehicle] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<EnrichedVehicle | null>(null);
  const [hoveredVehicleId, setHoveredVehicleId] = useState<string | null>(null);

  const [openAddVehicle, setOpenAddVehicle] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<EnrichedVehicle | null>(null);
  const [vehicleToRemove, setVehicleToRemove] = useState<any>(null);
  const [openAddRecord, setOpenAddRecord] = useState(false);

  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [historyToEdit, setHistoryToEdit] = useState<VehicleHistory | null>(null);
  const [historyToRemove, setHistoryToRemove] = useState<VehicleHistory | null>(null);
  const [openRemoveHistoryDialog, setOpenRemoveHistoryDialog] = useState(false);

  const [openRemoveVehicleDialog, setOpenRemoveVehicleDialog] = useState(false);
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);

  const { page, setPage, pageSize, setPageSize, paginate } = usePagination(25);


  /* ================= LOAD ================= */
  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers/${id}`);
      const c = res.data.data;

      // Dynamic Breadcrumb
      const fullName = `${c.first_name || ""} ${c.last_name || ""}`.trim();
      sessionStorage.setItem(`breadcrumb-/webapp/customers/${id}`, fullName || "Customer Profile");
      window.dispatchEvent(new Event('breadcrumb-update'));

      if (c.vehicles) {
        const mappedVehicles = c.vehicles.map((v: any) => ({
          id: v.plate_number,
          customerId: c.customer_id.toString(),
          vehicleModelId: v.variant_id?.toString() || "",
          color: v.color,
          plateNo: v.plate_number,
          engineNo: v.engine_number,
          vin: v.VIN,
          registrationNo: v.registration_number || v['registration_number'],
          sellingDealer: v.selling_dealer,
          hasWarranty: false,
          year: v.year_model || v.vehicleVariant?.year || undefined,
          make: v.make || v.vehicleVariant?.vehicleModel?.manufacturer?.name || v.vehicleVariant?.vehicle_model?.manufacturer?.name || undefined,
          model: v.model || v.vehicleVariant?.vehicleModel?.model || v.vehicleVariant?.vehicle_model?.model || undefined,
          variant: v.variant || v.vehicleVariant?.variant_name || undefined,
          variant_id: v.variant_id
        }));
        setVehicles(mappedVehicles);

        setCustomerData({
          id: c.customer_id?.toString() || "",
          firstName: c.first_name || "",
          lastName: c.last_name || "",
          address: c.address || "",
          mobileNumber: c.mobile_number || "",
          landline: c.landline || "",
          email: c.email || "",
          businessPhone: c.business || "",
          origin: c.origin || "appointment",
          vehicles: mappedVehicles
        } as any);

      } else {
        setVehicles([]);
        setCustomerData({
          id: c.customer_id?.toString() || "",
          firstName: c.first_name || "",
          lastName: c.last_name || "",
          address: c.address || "",
          mobileNumber: c.mobile_number || "",
          landline: c.landline || "",
          email: c.email || "",
          businessPhone: c.business || "",
          origin: c.origin || "appointment",
          vehicles: []
        } as any);
      }
    } catch (err) {
      console.error("Failed to fetch customer data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCustomerData();
    return () => {
      sessionStorage.removeItem(`breadcrumb-/webapp/customers/${id}`);
    };
  }, [id]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await api.get('/products/vehicles');
        const models = res.data.data.flatMap((m: any) => {
          return m.variants.length > 0 ? m.variants.map((v: any) => ({
            id: v.id.toString(),
            year: v.year,
            make: m.manufacturer?.name || "",
            model: m.model,
            variant: v.variant_name
          })) : [{
            id: m.id.toString(),
            year: 0,
            make: m.manufacturer?.name || "",
            model: m.model,
            variant: ""
          }];
        });
        setVehicleModels(models);
      } catch (error) {
        console.error("Failed to load models", error);
      }
    };
    fetchModels();
  }, []);

  const reloadVehiclesAndModels = () => {
    fetchCustomerData();
  };

  const reloadCustomer = () => {
    fetchCustomerData();
  };  

  const fullName = useMemo(() => {
    if (!customerData) return "";
    return `${customerData.firstName} ${customerData.lastName}`.trim();
  }, [customerData]);

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem(VEHICLE_HISTORY_STORAGE_KEY) || "[]");
    setHistory(all);
  }, []);

  /* ================= MAP ================= */
  const vehicleModelMap = useMemo(() => {
    const map: Record<string, VehicleModel> = {};
    vehicleModels.forEach(v => (map[v.id] = v));
    return map;
  }, [vehicleModels]);

  const enrichedVehicles = useMemo(() => {
    return vehicles.map(v => {
      const m = vehicleModelMap[v.vehicleModelId];
      return {
        ...v,
        year: (v as any).year || m?.year,
        make: (v as any).make || m?.make,
        model: (v as any).model || m?.model,
        variant: (v as any).variant || m?.variant,
      };
    });
  }, [vehicles, vehicleModelMap]);

  const vehicleHistory = useMemo(() => {
    if (!selectedVehicle) return [];
    return history.filter(h => h.vehicleId === selectedVehicle.id);
  }, [history, selectedVehicle]);

  const paginatedHistory = paginate(vehicleHistory);

  /* ================= INIT SELECTION ================= */
useEffect(() => {
  if (!vehicles.length) {
    setSelectedVehicle(null);
    return;
  }

  // CASE A: only 1 vehicle → auto show it
  if (vehicles.length === 1) {
    const v = vehicles[0];
    const m = vehicleModels.find(x => x.id === v.vehicleModelId);

    setSelectedVehicle({
      ...v,
      year: (v as any).year || m?.year,
      make: (v as any).make || m?.make,
      model: (v as any).model || m?.model,
      variant: (v as any).variant || m?.variant,
    });

    return;
  }

  // CASE B: multiple vehicles → list view
  setSelectedVehicle(null);
}, [vehicles, vehicleModels]);


  /* ================= VEHICLE EDIT/REMOVE ================= */
  const handleEditVehicle = (vehicle: any) => {
    setVehicleToEdit(vehicle);
    setOpenAddVehicle(true);
  };

  const handleRemoveVehicle = async () => {
    if (!vehicleToRemove || !customerData) return;

    try {
      const plateNumber = vehicleToRemove.plateNo || vehicleToRemove.id;
      await api.delete(`/customers/${customerData.id}/vehicles/${encodeURIComponent(plateNumber)}`);
      toast.success("Vehicle removed successfully");

      if (selectedVehicle?.id === vehicleToRemove.id) {
        setSelectedVehicle(null);
      }

      setVehicleToRemove(null);
      setOpenRemoveVehicleDialog(false);
      fetchCustomerData();
    } catch (err: any) {
      console.error("Failed to remove vehicle", err);
      toast.error(err.response?.data?.message || "Failed to remove vehicle");
    }
  };

  const handleRemoveCustomer = async () => {
    if (!customerData) return;
    try {
      await api.delete(`/customers/${customerData.id}`);
      toast.success("Customer removed successfully");
      setOpenRemoveDialog(false);
      navigate("/webapp/customers");
    } catch (err: any) {
      console.error("Failed to remove customer", err);
      toast.error(err.response?.data?.message || "Failed to remove customer");
    }
  };


  const handleSaveVehicleRecord = (record: {
    recordType: "Interview" | "Checklist";
    fileUrl: string;
    fileName: string;
  }) => {
    if (!selectedVehicle) return;

    const existing: VehicleHistory[] = JSON.parse(
      localStorage.getItem(VEHICLE_HISTORY_STORAGE_KEY) || "[]"
    );

    let updated: VehicleHistory[];

    // EDIT MODE
    if (historyToEdit) {
      const vehicleName = `${selectedVehicle.make}-${selectedVehicle.model}-${selectedVehicle.plateNo}`;
      const ext = record.fileName?.split(".").pop() || "";

      const sameTypeCount = existing.filter(
        h =>
          h.vehicleId === selectedVehicle.id &&
          h.recordType === record.recordType
      ).length;

      const formattedFileName = `${vehicleName} - ${record.recordType} ${sameTypeCount}.${ext}`;

      updated = existing.map(h =>
        h.id === historyToEdit.id
          ? {
              ...h,
              recordType: record.recordType,
              fileUrl: record.fileUrl,
              fileName: formattedFileName,
            }
          : h
      );
    } else {
      // ➕ CREATE MODE
      const sameTypeCount =
        existing.filter(
          h =>
            h.vehicleId === selectedVehicle.id &&
            h.recordType === record.recordType
        ).length + 1;

      const vehicleName = `${selectedVehicle.make}-${selectedVehicle.model}-${selectedVehicle.plateNo}`;
      const ext = record.fileName.split(".").pop();

      const formattedFileName = `${vehicleName} - ${record.recordType} ${sameTypeCount}.${ext}`;

      const newRecord: VehicleHistory = {
        id: crypto.randomUUID(),
        vehicleId: selectedVehicle.id,
        dateTime: new Date().toISOString(),
        recordType: record.recordType,
        fileUrl: record.fileUrl,
        fileName: formattedFileName,
        status: "Completed",
      };

      updated = [newRecord, ...existing];
    }

    localStorage.setItem(
      VEHICLE_HISTORY_STORAGE_KEY,
      JSON.stringify(updated)
    );

    setHistory(updated);
    setHistoryToEdit(null); 
  };


  const handleRemoveHistory = () => {
    if (!historyToRemove) return;

    const existing: VehicleHistory[] = JSON.parse(
      localStorage.getItem(VEHICLE_HISTORY_STORAGE_KEY) || "[]"
    );

    const updated = existing.filter(h => h.id !== historyToRemove.id);

    localStorage.setItem(
      VEHICLE_HISTORY_STORAGE_KEY,
      JSON.stringify(updated)
    );

    setHistory(updated);
    setHistoryToRemove(null);
    setOpenRemoveHistoryDialog(false);
  };


  /* ================= UI ================= */
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading Customer Profile...</p>
      </div>
    );
  }

  if (!customerData) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <ClipboardClock className="h-6 w-6 mx-auto mb-2" />
          Customer not found
        </CardContent>
      </Card>
    );
  }

  const hasMultipleVehicles = vehicles.length > 1;
  const showAddVehicleButton = vehicles.length <= 1;
  

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-y-auto select-none">
      {/* Header */}
      <DataToolbar
        variant="detail"
        title="Customer Profile"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button size="sm" onClick={() => setOpenEdit(true)}>
              <Edit className="w-4 h-4 mr-1" /> Edit Profile
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setOpenRemoveDialog(true)}>
              <XCircle className="w-4 h-4 mr-1"/> Remove Customer
            </Button>
          </div>
        }
      />

      {/* Main content */}
      <div className="space-y-4">
        {customerData.origin === 'appointment' && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md shadow-sm flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-amber-900 mb-1">Incomplete Profile</p>
              <p className="text-xs text-amber-700 leading-tight">
                This customer was created from an appointment and lacks required details. Please complete their information before processing Job Orders or adding records.
              </p>
            </div>
            <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 shrink-0" onClick={() => setOpenEdit(true)}>
              Edit Profile
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* CUSTOMER */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Full Name</p>
                <p className="text-sm">{fullName}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  <p className="text-sm">{customerData.email || "—"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Mobile</p>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  <p className="text-sm">{customerData.mobileNumber}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Landline</p>
                <p className="text-sm">{customerData.landline || "—"}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Address</p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 mt-1" />
                  <p className="text-sm break-words">{customerData.address || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* VEHICLE */}
          <Card className="xl:col-span-2 flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" />
                {selectedVehicle ? (
                  <div className="flex items-center gap-2">
                    <span>
                      {[selectedVehicle.year, selectedVehicle.make, selectedVehicle.model]
                        .filter(Boolean)
                        .join(" ") || "Unknown Vehicle (Legacy)"}
                    </span>
                    {selectedVehicle.hasWarranty && <Badge variant="secondary">Warranty</Badge>}
                  </div>
                ) : (
                  "Vehicle List"
                )}
              </CardTitle>

              {selectedVehicle && hasMultipleVehicles && (
                <Button size="xs" variant="outline" onClick={() => setSelectedVehicle(null)}>Vehicle List</Button>
              )}

              {showAddVehicleButton && (
                <Button size="xs" variant="outline" onClick={() => setOpenAddVehicle(true)}>
                  <Plus className="w-4 h-4"/> Add Vehicle
                </Button>
              )}
            </CardHeader>

            <CardContent className="flex-1 flex flex-col overflow-hidden">
              {vehicles.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <Car className="w-10 h-10 text-muted-foreground stroke-1 mb-2"/>
                  <p className="text-sm font-light tracking-wide text-muted-foreground">There is no vehicle currently available.</p>
                  <span className="text-sm font-light tracking-wide text-muted-foreground"> Add a vehicle to get started</span>
                </div>
              ) : !selectedVehicle ? (
                <ScrollArea className="w-full flex-1 pb-2">
                  <div className="grid grid-flow-col auto-cols-[calc(75%-1rem)] lg:auto-cols-[calc(33.333%-1rem)] gap-4 min-w-full pt-3 px-1">
                    {enrichedVehicles.map((v) => {
                      const isHovered = hoveredVehicleId === v.id;
                      const isAnyHovered = hoveredVehicleId !== null;

                      return (
                        <Card
                          key={v.id}
                          onClick={() => setSelectedVehicle(v)}
                          onMouseEnter={() => setHoveredVehicleId(v.id)}
                          onMouseLeave={() => setHoveredVehicleId(null)}
                          className={`
                            relative group cursor-pointer lg:h-[18rem] flex flex-col transition-all duration-300 ease-in-out
                            ${isHovered 
                              ? "bg-white shadow-2xl shadow-blue-200/50 -translate-y-2 ring-1 ring-blue-500 ring-offset-2 z-10"
                              : isAnyHovered 
                                ? "opacity-40 blur-[1px] scale-[0.98]"
                                : "hover:shadow-md"}
                          `}
                        >
                          <CardContent className="p-4 flex flex-col flex-1">
                            <div className="flex items-center justify-between mb-2">

                              <h3
                                  className={`text-sm font-semibold leading-tight transition-colors duration-300 ${
                                    isHovered ? "text-blue-600" : ""
                                  }`}
                                >
                                  {[v.year, v.make, v.model].filter(Boolean).join(" ") || "Unknown Vehicle (Legacy)"}
                                </h3>

                              {/* RIGHT SIDE: BADGE ↔ ACTION SWAP */}
                              <div className="flex items-center gap-2">
                                
                                {/* DEFAULT: BADGE */}
                                {!isHovered && v.hasWarranty && (
                                  <Badge
                                    variant="secondary"
                                    className="transition-all duration-200"
                                  >
                                    Warranty
                                  </Badge>
                                )}

                                {/* HOVER: ACTION ICONS */}
                                {isHovered && (
                                  <div className="flex gap-1 transition-opacity duration-200">
                                    <Button
                                      size="icon"
                                      variant="secondary"
                                      className="h-7 w-7"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditVehicle(v);
                                      }}
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </Button>

                                    <Button
                                      size="icon"
                                      variant="destructive"
                                      className="h-7 w-7"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setVehicleToRemove(v);
                                        setOpenRemoveVehicleDialog(true);
                                      }}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <hr className={`my-2 transition-opacity ${isHovered ? "opacity-100" : "opacity-50"}`} />

                            <div className="space-y-3 text-sm flex-1">
                              {[
                                { label: "Variant", value: v.variant },
                                { label: "Color", value: v.color },
                                { label: "Plate Number", value: v.plateNo },
                              ].map((item) => (
                                <div key={item.label}>
                                  <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wider">
                                    {item.label}
                                  </p>
                                  <p className={`transition-colors ${isHovered ? "text-slate-900" : "text-slate-700"}`}>
                                    {item.value}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}

                    {/* ADD VEHICLE CARD */}
                    <Card
                      onClick={() => setOpenAddVehicle(true)}
                      onMouseEnter={() => setHoveredVehicleId('add-vehicle')}
                      onMouseLeave={() => setHoveredVehicleId(null)}
                      className={`
                        cursor-pointer lg:h-[18rem] flex flex-col items-center justify-center text-center border-dashed border-2 transition-all duration-300
                        ${hoveredVehicleId === 'add-vehicle' 
                          ? 'bg-blue-50 border-blue-500 border-solid shadow-xl -translate-y-2 ring-2 ring-blue-500/20' 
                          : hoveredVehicleId !== 'add-vehicle'
                            ? 'opacity-40 blur-[1px]' 
                            : 'border-muted hover:border-blue-400'}
                      `}
                    >
                      <CardContent className="flex flex-col items-center justify-center gap-2">
                        <Car className={`w-12 h-12 stroke-1 transition-all duration-300 ${hoveredVehicleId === 'add-vehicle' ? 'scale-110 text-blue-600' : 'text-muted-foreground'}`} />
                        <p className={`transition-colors font-medium ${hoveredVehicleId === 'add-vehicle' ? 'text-blue-600' : 'text-muted-foreground'}`}>
                          + Add New Vehicle
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    ["Variant", selectedVehicle.variant || "—"],
                    ["Color", selectedVehicle.color || "—"],
                    ["Plate Number", selectedVehicle.plateNo || "—"],
                    ["Engine Number", selectedVehicle.engineNo || "—"],
                    ["VIN", selectedVehicle.vin || "—"],
                    ["Registration No.", selectedVehicle.registrationNo || "—"],
                    ["Selling Dealer", selectedVehicle.sellingDealer || "—"],
                  ].map(([label, value]) => (
                    <div key={label} className="space-y-2">
                      <p className="text-xs uppercase text-muted-foreground tracking-wider">{label}</p>
                      <p className="text-sm">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Vehicle History</CardTitle>

              <Button
                size="xs"
                variant="outline"
                disabled={!selectedVehicle || customerData.origin === 'appointment'}
                onClick={() => setOpenAddRecord(true)}
              >
                <Plus className="w-4 h-4" />
                Add Record
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col flex-1 overflow-hidden p-0">
            {vehicleHistory.length > 0 ? (
              <>
                <ScrollArea className="flex-1">
                  <div className="border rounded-lg m-4 overflow-hidden">
                    <Table className="table-fixed w-full">
                      <TableHeader className="bg-muted/50 sticky top-0 z-10">
                        <TableRow>
                          <TableHead className="w-[10%]">No.</TableHead>
                          <TableHead className="w-[20%]">Date & Time</TableHead>
                          <TableHead className="w-[20%]">Type</TableHead>
                          <TableHead>Linked Transaction / File</TableHead>
                          <TableHead className="w-[15%]">Status</TableHead>
                          <TableHead className="w-[8%]"></TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {paginatedHistory.map((item, index) => {
                          const isLastRow = index === paginatedHistory.length - 1;
                          const isSingleRow = paginatedHistory.length === 1;
                          const shouldOpenUp = isLastRow || isSingleRow;

                          return (
                            <TableRow
                              key={item.id}
                              className="hover:bg-muted/40 data-[no-hover=true]:hover:bg-transparent"
                            >
                              <TableCell>
                                {(page - 1) * pageSize + index + 1}
                              </TableCell>

                              <TableCell>
                                <div className="flex flex-col">
                                  <span>
                                    {new Date(item.dateTime).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(item.dateTime).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    })}
                                  </span>
                                </div>
                              </TableCell>

                              <TableCell>{item.recordType}</TableCell>

                              <TableCell>
                                {item.fileUrl ? (
                                  <a
                                    href={item.fileUrl}
                                    target="_blank"
                                    className="text-blue-600 underline"
                                  >
                                    {item.fileName || "View File"}
                                  </a>
                                ) : (
                                  item.recordRef || "—"
                                )}
                              </TableCell>

                              <TableCell>
                                <Badge
                                  variant={
                                    item.status === "Completed"
                                      ? "default"
                                      : item.status === "Pending"
                                      ? "secondary"
                                      : "destructive"
                                  }
                                >
                                  {item.status}
                                </Badge>
                              </TableCell>

                              {/* ACTION MENU */}
                              <TableCell
                                className="relative overflow-visible"
                                data-no-hover={
                                  activeHistoryId === item.id ? "true" : undefined
                                }
                              >
                                <div className="flex justify-center">
                                  
                                  {/* GROUP */}
                                  <div className="relative inline-flex group">

                                    {/* BUTTON */}
                                    <button
                                      className="
                                        p-1 rounded border border-muted-foreground/40
                                        transition-all duration-150
                                        group-hover:bg-muted
                                      "
                                      onClick={() =>
                                        setActiveHistoryId(prev =>
                                          prev === item.id ? null : item.id
                                        )
                                      }
                                    >
                                      <MoreHorizontal
                                        className="
                                          w-5 h-5 text-muted-foreground
                                          transition-colors duration-150
                                          group-hover:text-foreground
                                        "
                                      />
                                    </button>

                                    {/* DROPDOWN */}
                                    {activeHistoryId === item.id && (
                                      <div
                                        className={`absolute z-50 w-32 bg-white border rounded-md shadow-md
                                          right-full mr-2
                                          ${shouldOpenUp ? "bottom-0" : "top-0"}
                                        `}
                                      >
                                        <button
                                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                                          onClick={() => {
                                            setActiveHistoryId(null);
                                            setOpenAddRecord(true);
                                            setHistoryToEdit(item);
                                          }}
                                        >
                                          Edit
                                        </button>

                                        <button
                                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-muted"
                                          onClick={() => {
                                            setHistoryToRemove(item);
                                            setOpenRemoveHistoryDialog(true);
                                            setActiveHistoryId(null);
                                          }}
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    )}

                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>

                {vehicleHistory.length > pageSize && (
                  <div className="border-t px-4 py-2">
                    <Pagination
                      totalItems={vehicleHistory.length}
                      page={page}
                      pageSize={pageSize}
                      onPageChange={setPage}
                      onPageSizeChange={setPageSize}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center pb-8">
                <ClipboardClock className="h-10 w-10 stroke-1 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No vehicle history available.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* MODALS */}
      <CustomerFormModal
        open={openEdit}
        onOpenChange={setOpenEdit}
        customer={customerData}
        onSaved={() => {
          if (!customerData) return;

          reloadVehiclesAndModels();
          reloadCustomer();
          setVehicleToEdit(null);
          setSelectedVehicle(null);
        }}
      />

      <AddCustomerVehicle
        open={openAddVehicle}
        onOpenChange={(val) => {
          setOpenAddVehicle(val);
          if (!val) setVehicleToEdit(null);
        }}
        vehicleToEdit={vehicleToEdit}

        onSaved={async (newVehicles) => {
          if (!customerData) return;
          try {
            const existingVehicles = (customerData as any).vehicles || [];
            
            let updatedVehicles;
            if (vehicleToEdit) {
              updatedVehicles = existingVehicles.map((v: any) => 
                v.id === vehicleToEdit.id ? newVehicles[0] : v
              );
            } else {
              updatedVehicles = [...existingVehicles, ...newVehicles];
            }

            const payload = {
              first_name: customerData.firstName,
              last_name: customerData.lastName,
              address: customerData.address,
              mobile_number: customerData.mobileNumber,
              landline: customerData.landline,
              email: customerData.email,
              business: customerData.businessPhone,
              vehicles: updatedVehicles
            };

            await api.put(`/customers/${customerData.id}`, payload);
            fetchCustomerData();
            setVehicleToEdit(null);
            setSelectedVehicle(null);
          } catch (err) {
            console.error("Failed to save vehicle", err);
          }
        }}
      />

      <AddVehicleRecord 
        open={openAddRecord} 
        onOpenChange={(val) => {
          setOpenAddRecord(val);
          if (!val) setHistoryToEdit(null);
        }}
        vehicleId={selectedVehicle?.id} 
        onSave={handleSaveVehicleRecord}
        editData={historyToEdit} 
      />

      <ConfirmDialog
        open={openRemoveDialog}
        onOpenChange={setOpenRemoveDialog}
        title="Remove Customer"
        description={
          <>
            Are you sure you want to remove{" "}
            <strong>{fullName}'s</strong> customer record?
            <br /> <br />
            This action cannot be undone and will permanently delete the customer
            and associated records including all their registered vehicles and vehicle history.
          </>
        }
        confirmLabel="Yes, Remove Customer"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleRemoveCustomer}
      />

      <ConfirmDialog
        open={openRemoveVehicleDialog}
        onOpenChange={setOpenRemoveVehicleDialog}
        title="Remove Vehicle"
        description={
          <>
            Are you sure you want to remove this vehicle?
            <br /><br />
            This action cannot be undone.
          </>
        }
        confirmLabel="Yes, Remove Vehicle"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleRemoveVehicle}
      />

      <ConfirmDialog
        open={openRemoveHistoryDialog}
        onOpenChange={setOpenRemoveHistoryDialog}
        title="Remove Record"
        description="Are you sure you want to delete this vehicle history record? This cannot be undone."
        confirmLabel="Yes, Remove"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleRemoveHistory}
      />      

          </div>
        );
      };

export default CustomerDetail;