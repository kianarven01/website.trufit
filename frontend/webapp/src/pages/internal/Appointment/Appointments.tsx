import { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Pagination, usePagination } from "@/components/ui/pagination";
import DataToolbar from "@/components/DataToolbar";
import { Button } from "@/components/ui/button";
import Calendar from "@/components/ui/calendar-appointment";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import ScheduleAppointment from "@/components/popupModal/Appointments/ScheduleAppointment";
import ReschedAppointment from "@/components/popupModal/Appointments/ReschedAppointment";
import { NotesPanel } from "@/components/ui/note-panel";
import { toast } from "sonner";

import { Calendar as CalendarIcon } from "lucide-react";
import { User, Car, ClipboardList, Phone, Mail, MessageSquare } from "lucide-react";


/* ================= STORAGE ================= */
const APPOINTMENT_CUSTOMER_KEY = "appointmentCustomers";
const VEHICLE_MODEL_STORAGE_KEY = "vehicleModels";
const VEHICLE_STORAGE_KEY = "vehicles";
const APPOINTMENT_SERVICE_KEY = "appointmentServices";
const APPOINTMENT_KEY = "appointments";

/* ================= TYPES ================= */
type AppointmentStatus = "for approval" | "confirmed" | "cancelled" ;

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email?: string;
}

interface VehicleModel {
  id: string;
  make: string;
  model: string;
}

interface Vehicle {
  id: string;
  customerId: string;
  vehicleModelId: string;
  plateNumber?: string;
}

interface Appointment {
  id: string;
  appointmentCode: string;
  customerId: string;
  vehicleId: string;
  services: string [];
  customService?: string;
  datetime: string;
  status: AppointmentStatus;
  notes?: string;
}

/* ================= HELPERS ================= */
const generateAppointmentCode = (appointments: Appointment[]) => {
  const nums = appointments
    .map(a => a.appointmentCode)
    .filter(Boolean)
    .map(code => parseInt(code.replace("APT-", ""), 10))
    .filter(n => !isNaN(n));

  const next = nums.length ? Math.max(...nums) + 1 : 1;

  return `APT-${String(next).padStart(4, "0")}`;
};

const getLS = <T,>(key: string): T[] => {
  return JSON.parse(localStorage.getItem(key) || "[]");
};

const setLS = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const normalizePhone = (val: string) => (val || "").replace(/\D/g, "").trim();
const normalizeText = (val: string) => (val || "").toLowerCase().trim();

const normalizePlate = (val?: string) => {
  if (!val) return "";

  return val
    .toUpperCase()
    .replace(/[^A-Z0-9\s-]/g, "") 
    .replace(/\s+/g, " ") 
    .trim();
};

const genId = () => crypto.randomUUID();


/* ================= COMPONENT ================= */
const AppointmentsList: React.FC = () => {

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  type FilterStatus = AppointmentStatus | "all";
  const [filters, setFilters] = useState<{ status: FilterStatus }>({
    status: "all",
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    return localStorage.getItem("appointmentDateFilter");
  });
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  // const [isReschedDialogOpen, setIsReschedDialogOpen] = useState(false);

     
  const handleRowClick = (apt: Appointment) => {
    setEditingAppointmentId(apt.id);
    setIsSheetOpen(true);
  };

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const { page, setPage, pageSize, setPageSize, paginate } =
    usePagination(25);


  /* ================= LOAD ================= */

  useEffect(() => {
    setIsLoading(true);

    const loadData = () => {
      setCustomers(getLS<Customer>(APPOINTMENT_CUSTOMER_KEY));
      setVehicleModels(getLS<VehicleModel>(VEHICLE_MODEL_STORAGE_KEY));
      setVehicles(getLS<Vehicle>(VEHICLE_STORAGE_KEY));
      setAppointments(getLS<Appointment>(APPOINTMENT_KEY));

      setIsLoading(false);
    };

    loadData();
  }, []);

  /* ================= MAP ================= */

  const customerMap = useMemo(() => {
    const map = new Map<string, Customer>();
    customers.forEach((c) => map.set(c.id, c));
    return map;
  }, [customers]);

  const vehicleMap = useMemo(() => {
    const map = new Map<string, Vehicle>();
    vehicles.forEach((v) => map.set(v.id, v));
    return map;
  }, [vehicles]);

  const vehicleModelMap = useMemo(() => {
    const map = new Map<string, VehicleModel>();
    vehicleModels.forEach((vm) => map.set(vm.id, vm));
    return map;
  }, [vehicleModels]);


  const EMPTY_CUSTOMER: Customer = {
    id: "",
    firstName: "",
    lastName: "",
    mobileNumber: "",
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "for approval":
        return "pending";
      case "confirmed":
        return "received";
      case "cancelled":
        return "cancelled";
      default:
        return "outline";
    }
  };


  /* ================ FORMATTERS ================= */

  const formatPhone = (value?: string) => {
    if (!value) return "";

    const digits = value.replace(/\D/g, "").slice(0, 11);

    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  };


  /*  Date Time Format */
  const formatDate = (val: string) => {
    if (!val) return "";

    const d = new Date(val);

    const month = d.toLocaleString("en-US", { month: "short" });
    const day = d.getDate();
    const year = d.getFullYear();

    return `${month} ${day}, ${year}`;
  };

  const formatTime = (val: string) => {
    if (!val) return "";

    const d = new Date(val);

    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${ampm}`;
  };

  const formatServiceLabel = (service: string) => {
    if (service === "Preventive Maintenance Service") return "PMS";
    return service;
  };

  /* ================= DATE FILTER ================= */

  const toLocalDateString = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-CA"); // YYYY-MM-DD
  };

  const handleDateSelect = (selected: Date | null) => {
    if (!selected) {
      clearDateFilter();
      return;
    }

    const dateString = selected.toLocaleDateString("en-CA");

    if (selectedDate === dateString) {
      clearDateFilter();
    } else {
      setSelectedDate(dateString);
      localStorage.setItem("appointmentDateFilter", dateString);
    }
  };
      
  const clearDateFilter = () => {
    setSelectedDate(null);
    localStorage.removeItem("appointmentDateFilter");
  };

  const calendarEvents = useMemo(() => {
    const grouped = new Map<string, Set<AppointmentStatus>>();

    const allowedStatuses = new Set<AppointmentStatus>([
      "confirmed", "for approval"
    ]);

    appointments.forEach((a) => {
      const status = a.status;
      if (!allowedStatuses.has(status)) return;

      const dateKey = toLocalDateString(a.datetime);

      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, new Set());
      }

      grouped.get(dateKey)!.add(status);
    });

    return Array.from(grouped.entries()).flatMap(([date, statuses]) =>
      Array.from(statuses).map((status) => ({
        date: new Date(date),
        status,
      }))
    );
  }, [appointments]);

  /* ================= APPOINTMENT STATUS ================ */

  const selectedAppointment = useMemo(() => {
    return appointments.find(a => a.id === editingAppointmentId) || null;
  }, [appointments, editingAppointmentId]);

  const getDateKey = (date?: string | null) => {
    if (!date) return "no-date";

    return new Date(date).toLocaleDateString("en-CA"); 
  };

  const getEditableData = (apt: Appointment) => {
    const customer = customerMap.get(apt.customerId);
    const vehicle = vehicleMap.get(apt.vehicleId);
    const vehicleModel = vehicle
      ? vehicleModelMap.get(vehicle.vehicleModelId)
      : null;

    return {
      id: apt.id,
      firstName: customer?.firstName ?? "",
      lastName: customer?.lastName ?? "",
      phone: customer?.mobileNumber ?? "",
      email: customer?.email,
      make: vehicleModel?.make,
      model: vehicleModel?.model,
      plateNumber: vehicle?.plateNumber,
      services: apt.services,
      notes: apt.notes,
      datetime: apt.datetime,
    };
  };  

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) => {
      const updated = prev.map((a) =>
        a.id === id ? { ...a, status } : a
      );

      localStorage.setItem(APPOINTMENT_KEY, JSON.stringify(updated));
      return updated;
    });
  };


  /* ================= SEARCH ================= */
  const normalize = (val: string) =>
    (val || "").toLowerCase().trim();

  const filtered = useMemo(() => {
    const q = normalize(search);

    return appointments.filter((a) => {
      const customer = customerMap.get(a.customerId) ?? EMPTY_CUSTOMER;
      const vehicle = vehicleMap.get(a.vehicleId);
      const vehicleModel = vehicle?.vehicleModelId
        ? vehicleModelMap.get(vehicle.vehicleModelId)
        : null;

      const make = normalize(vehicleModel?.make || "");
      const model = normalize(vehicleModel?.model || "");

      const matchesStatus =
        filters.status === "all" || a.status === filters.status;


      const matchesDate =
        !selectedDate || toLocalDateString(a.datetime) === selectedDate;

      if (!q) return matchesStatus && matchesDate;

      const firstName = normalize(customer.firstName);
      const lastName = normalize(customer.lastName);
      const fullName = normalize(`${customer.firstName} ${customer.lastName}`);
      const services = normalize(a.services.join(" "));

        const terms = q.split(" ").filter(Boolean);

        const matchesSearch = terms.every((term) =>
          firstName.includes(term) ||
          lastName.includes(term) ||
          fullName.includes(term) ||
          make.includes(term) ||
          model.includes(term) ||
          services.includes(term)
        );

      return matchesStatus && matchesDate && matchesSearch;
    });
  }, [appointments, customerMap, vehicleMap, vehicleModelMap, search, filters, selectedDate]);


  const paginated = paginate(filtered);

  /* ================= FILTER OPTIONS ================= */
  const statusOptions: { label: string; value: string }[] = [
    { label: "For Approval", value: "for approval" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const toolbarFilters = [
    { key: "status", label: "Status", options: statusOptions },
  ];

  const handleFilterChange = (key: string, value: string) => {
    if (key === "status") {
      if (
        value === "all" ||
        ["for approval", "confirmed", "cancelled"].includes(value)
      ) {
        setFilters((prev) => ({
          ...prev,
          [key]: value as FilterStatus,
        }));
      }
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, pageSize, selectedDate, filters]);

  const selectedVehicle = selectedAppointment
    ? vehicleMap.get(selectedAppointment.vehicleId)
    : null;

  const selectedVehicleModel = selectedVehicle
    ? vehicleModelMap.get(selectedVehicle.vehicleModelId)
    : null;

  /* ================= SCHEDULE APPOINTMENT ================= */

  /* Customer Upsert */
  const upsertCustomer = (data: any, existingCustomerId?: string) => {
    const customers = getLS<Customer>(APPOINTMENT_CUSTOMER_KEY);

    // If editing, update directly by ID
    if (existingCustomerId) {
      const updated = customers.map(c =>
        c.id === existingCustomerId
          ? {
              ...c,
              firstName: data.firstName,
              lastName: data.lastName,
              mobileNumber: data.phone,
              email: data.email,
            }
          : c
      );

      setLS(APPOINTMENT_CUSTOMER_KEY, updated);
      setCustomers(updated);

      return updated.find(c => c.id === existingCustomerId)!;
    }

    // Create flow (no existing ID)
    const existing = customers.find(
      c =>
        normalizePhone(c.mobileNumber) === normalizePhone(data.phone)
    );

    if (existing) return existing;

    const newCustomer: Customer = {
      id: genId(),
      firstName: data.firstName,
      lastName: data.lastName,
      mobileNumber: data.phone,
      email: data.email,
    };

    const updated = [...customers, newCustomer];
    setLS(APPOINTMENT_CUSTOMER_KEY, updated);
    setCustomers(updated);

    return newCustomer;
  };


  /*  Vehicle Model Upsert */
  const upsertVehicleModel = (data: any) => {
    const models = getLS<VehicleModel>(VEHICLE_MODEL_STORAGE_KEY);

    const existing = models.find(
      v =>
        normalizeText(v.make) === normalizeText(data.make) &&
        normalizeText(v.model) === normalizeText(data.model)
    );

    if (existing) return existing;

    const newModel: VehicleModel = {
      id: genId(),
      make: data.make,
      model: data.model,
    };

    const updated = [...models, newModel];

    setLS(VEHICLE_MODEL_STORAGE_KEY, updated);
    setVehicleModels(updated);

    return newModel;
  };


  /* Vehicle Upsert */
  const upsertVehicle = (
    customerId: string,
    modelId: string,
    data: any,
    existingVehicleId?: string
  ) => {
    const vehicles = getLS<Vehicle>(VEHICLE_STORAGE_KEY);

    // Editing → update directly
    if (existingVehicleId) {
      const updated = vehicles.map(v =>
        v.id === existingVehicleId
          ? {
              ...v,
              customerId,
              vehicleModelId: modelId,
              plateNumber: normalizePlate(data.plateNumber),
            }
          : v
      );

      setLS(VEHICLE_STORAGE_KEY, updated);
      setVehicles(updated);

      return updated.find(v => v.id === existingVehicleId)!;
    }

    // Create flow
    const existing = vehicles.find(
      v =>
        normalizePlate(v.plateNumber) === normalizePlate(data.plateNumber)
    );

    if (existing) return existing;

    const newVehicle: Vehicle = {
      id: genId(),
      customerId,
      vehicleModelId: modelId,
      plateNumber: normalizePlate(data.plateNumber),
    };

    const updated = [...vehicles, newVehicle];
    setLS(VEHICLE_STORAGE_KEY, updated);
    setVehicles(updated);

    return newVehicle;
  };


  /*  Create Appointment */
  const handleCreateAppointment = (data: any) => {
    const customer = upsertCustomer(data);
    const vehicleModel = upsertVehicleModel(data);
    const vehicle = upsertVehicle(customer.id, vehicleModel.id, data);

    const newAppointment: Appointment = {
      id: genId(),
      appointmentCode: generateAppointmentCode(appointments),
      customerId: customer.id,
      vehicleId: vehicle.id,
      services: data.services,
      customService: data.customService,
      datetime: data.datetime,
      status: "for approval",
      notes: data.notes,
    };

    setAppointments((prev) => {
      const updated = [...prev, newAppointment];
      localStorage.setItem(APPOINTMENT_KEY, JSON.stringify(updated));
      return updated;
    });

    setEditingAppointmentId(null);
    setIsScheduleDialogOpen(false);

    toast.success("Appointment created successfully!");
  };
    

  /* Update Appointment */
  const handleUpdateAppointment = (data: any) => {
    if (!editingAppointmentId) return;

    const existingAppointment = appointments.find(a => a.id === editingAppointmentId);
    if (!existingAppointment) return;
    const customer = upsertCustomer(data, existingAppointment?.customerId);
    const vehicleModel = upsertVehicleModel(data);
    const vehicle = upsertVehicle(customer.id, vehicleModel.id, data, existingAppointment?.vehicleId);

    setAppointments((prev) => {
      const updated = prev.map((a) =>
        a.id === editingAppointmentId
          ? {
              ...a,
              customerId: customer.id,
              vehicleId: vehicle.id,
              services: data.services,
              customServie: data.customService,
              datetime: data.datetime,
              notes: data.notes,
            }
          : a
      );

      localStorage.setItem(APPOINTMENT_KEY, JSON.stringify(updated));
      return updated;
    });

    setEditingAppointmentId(null);
    setIsScheduleDialogOpen(false);
    setIsSheetOpen(false);

    toast.success("Appointment updated!");
  };


  /* Remove Appointment */
  const removeAppointment = (id: string) => {
    setAppointments((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      localStorage.setItem(APPOINTMENT_KEY, JSON.stringify(updated));
      return updated;
    });

    setIsSheetOpen(false);
  };

  
  /* ================= UI ================= */

    const TableSkeleton = ({ rows = 8 }: { rows?: number }) => {
    return (
      <>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i} className="animate-pulse">
            <TableCell><div className="h-4 bg-muted rounded w-16" /></TableCell>
            <TableCell>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-32" />
                <div className="h-3 bg-muted rounded w-20" />
              </div>
            </TableCell>
            <TableCell><div className="h-4 bg-muted rounded w-28" /></TableCell>
            <TableCell><div className="h-4 bg-muted rounded w-20" /></TableCell>
            <TableCell>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-3 bg-muted rounded w-16" />
              </div>
            </TableCell>
            <TableCell><div className="h-5 bg-muted rounded w-20" /></TableCell>
          </TableRow>
        ))}
      </>
    );
  };



  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Appointments</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <DataToolbar
        searchPlaceholder="Search appointments..."
        onSearch={setSearch}
        onAdd={()=> {
          setEditingAppointmentId(null);
          setIsScheduleDialogOpen(true);
        }}
        addLabel="Add Appointment"
        filters={toolbarFilters}
        onFilterChange={handleFilterChange}
        activeFilters={filters}
      />

      <div className="flex gap-x-4 overflow-hidden flex-1 min-h-0">
        {appointments.length > 0 ? (
          <div  className="flex-1 min-w-0 flex flex-col border rounded-xl overflow-hidden">
            <ScrollArea className="flex-1 px-3">
              <Table className="table-fixed w-full border-separate border-spacing-y-2 h-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[10%]">No.</TableHead>
                    <TableHead className="w-[20%]">Customer</TableHead>
                    <TableHead className="w-[20%]">Vehicle</TableHead>
                    <TableHead className="w-[18%]">Service</TableHead>
                    <TableHead className="w-[17%]">Date & Time</TableHead>
                    <TableHead className="w-[15%]">Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isLoading ? (
                    <TableSkeleton rows={8} />
                  ) : filtered.length > 0 ? (
                    paginated.map((a) => {
                      const customer = customerMap.get(a.customerId);
                      const vehicle = vehicleMap.get(a.vehicleId);
                      const vehicleModel = vehicle
                        ? vehicleModelMap.get(vehicle.vehicleModelId)
                        : null;

                      return (
                        <TableRow
                          key={a.id}
                          onClick={() => handleRowClick(a)}
                          className="rounded-lg border bg-card shadow-sm hover:shadow-md"
                        >
                          <TableCell>{a.appointmentCode}</TableCell>

                          <TableCell>
                            <div className="flex flex-col">
                              <span>
                                {customer?.firstName} {customer?.lastName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatPhone(customer?.mobileNumber)}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            {vehicleModel ? `${vehicleModel.make} ${vehicleModel.model}` : "-"}
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {(() => {
                                const services: string[] = a.services ?? [];

                                const visible = services.slice(0, 1);
                                const hasMore = services.length > 1;

                                return (
                                  <>
                                    {visible.map((svc, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {formatServiceLabel(svc)}
                                      </Badge>
                                    ))}

                                    {hasMore && (
                                      <Badge variant="outline" className="text-xs">
                                        ...
                                      </Badge>
                                    )}

                                    {services.length === 0 && (
                                      <span className="text-muted-foreground text-xs">-</span>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-col">
                              <span>{formatDate(a.datetime)}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(a.datetime)}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge variant={getStatusVariant(a.status)}>
                              {a.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <div className="py-16 flex flex-col items-center text-center">
                          <CalendarIcon className="h-6 w-6 mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium">No appointments found</p>
                          <p className="text-xs text-muted-foreground">
                            Try adjusting your search or filters
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>

            {filtered.length > 0 && (
              <div className="border-t mx-3">
                <Pagination
                  totalItems={filtered.length}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            )}
          </div>        
        ) : (
        <Card className="min-w-0 flex-1 flex flex-col border rounded-xl overflow-hidden h-[330px]">
          <CardContent className="py-24 flex flex-col items-center text-center">
            <CalendarIcon className="h-6 w-6 mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">
              No appointments available
            </p>
            <p className="text-xs text-muted-foreground">
              Add an appointment to get started
            </p>
          </CardContent>
        </Card>
        )}
        <div className="w-[360px] flex-shrink-0 flex flex-col overflow-hidden space-y-4">
          <Calendar 
            mode="single" 
            value={selectedDate ? new Date(selectedDate) : null}
            onSelect={handleDateSelect} 
            events={calendarEvents}
              statusColors={{
              confirmed: "bg-blue-600",
              "for approval": "bg-orange-400",
            }}
          />  
          {selectedDate ? (
            <NotesPanel
              storageKey={`notes:date:${getDateKey(selectedDate)}`}
              title="Notes for this day"
              className="flex-1 min-h-0 h-full"
            />
          ) : (
            <div className="flex-1 p-4 text-sm text-muted-foreground border rounded-xl">
              Select a date from the calendar to view or add notes
            </div>
          )}
        </div>  


        {/* APPOINTMENT DETAIL SHEET */}

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="sm:max-w-[450px] flex flex-col p-0 gap-0">
            
            {/* Sticky Header */}
            <div className="border-b pr-10 bg-slate-50/50">
              <SheetHeader className="space-y-1">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-xl font-bold">
                    Appointment Detail
                  </SheetTitle>   
                  <span className="text-xs text-muted-foreground font-mono">
                    {selectedAppointment?.appointmentCode}
                  </span>
                </div>
              </SheetHeader>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-8">
                
                {/* Customer Info */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-600">
                    <User className="w-4 h-4" />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Customer</h3>
                  </div>
                  <div className="grid gap-3 pl-6 border-l-2 border-slate-100">
                    <div>
                      <p className="text-sm font-semibold">
                        {customerMap.get(selectedAppointment?.customerId || "")?.firstName} {customerMap.get(selectedAppointment?.customerId || "")?.lastName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-3.5 h-3.5" />
                      {formatPhone(customerMap.get(selectedAppointment?.customerId || "")?.mobileNumber) || "No phone number provided"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-3.5 h-3.5" />
                      {customerMap.get(selectedAppointment?.customerId || "")?.email || "No email provided"}
                    </div>
                  </div>
                </section>

                {/* Vehicle Info */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Car className="w-4 h-4" />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Vehicle</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pl-6 border-l-2 border-slate-100">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] uppercase font-medium text-slate-400">Model</p>
                      <p className="text-sm font-medium">
                        {selectedVehicleModel
                          ? `${selectedVehicleModel.make} ${selectedVehicleModel.model}`
                          : "No vehicle model provided"
                        }
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] uppercase font-medium text-slate-400">Plate Number</p>
                      <p className="text-sm font-medium">{selectedVehicle?.plateNumber || "Not provided"}</p>
                    </div>
                  </div>
                </section>

                {/* Appointment Info */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-600">
                    <ClipboardList className="w-4 h-4" />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Service</h3>
                  </div>
                  <div className="space-y-4 pl-6 border-l-2 border-slate-100">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-base font-medium">
                          {selectedAppointment?.services?.includes("Others")
                            ? selectedAppointment?.customService
                            : selectedAppointment?.services?.join(", ") || "No services provided"
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedAppointment && formatDate(selectedAppointment.datetime)} at {selectedAppointment && formatTime(selectedAppointment.datetime)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                      <div className="flex items-center gap-2 mb-1 text-amber-600">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <p className="text-[10px] uppercase font-bold tracking-wide">Notes</p>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed italic">
                        {selectedAppointment?.notes || "No additional message provided"}
                      </p>
                    </div>
                  </div>
                </section>

              </div>
            </ScrollArea>

            {/* Action Footer */}
            <div className="py-3 px-6 border-t bg-white">
              <div className="flex flex-col gap-2">

                {/* FOR APPROVAL */}
                {selectedAppointment?.status === "for approval" && (
                  <>
                    <Button
                      className="w-full bg-indigo-600 hover:bg-indigo-700 h-11"
                      onClick={() => {
                        if (!selectedAppointment) return;
                        updateAppointmentStatus(selectedAppointment.id, "confirmed");
                        toast.success("Appointment confirmed");
                      }}
                    >
                      Confirm Appointment
                    </Button>

                    <Button
                      variant="outline"
                      className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => setIsCancelDialogOpen(true)}
                    >
                      Cancel
                    </Button>
                  </>
                )}

                {/* CONFIRMED */}
                {selectedAppointment?.status === "confirmed" && (
                  <>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 h-11"
                      onClick={() => {
                        setIsSheetOpen(false);
                        setEditingAppointmentId(selectedAppointment?.id || null);
                        setIsScheduleDialogOpen(true)}}
                    >
                      Edit Appointment
                    </Button>

                    <Button
                      variant="outline"
                      className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => setIsCancelDialogOpen(true)}
                    >
                      Cancel
                    </Button>
                  </>
                )}

                {/* CANCELLED */}
                {(selectedAppointment?.status === "cancelled") && (
                  <>
                  <Button 
                    variant="outline"
                    className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50"  
                    onClick={() => setIsRemoveDialogOpen(true)}                
                  >
                    Remove
                  </Button>
                  </>
                )}

              </div>
            </div>
          </SheetContent>
        </Sheet>       
      </div>

      {/* Cancel Appointment Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The appointment will be marked as cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              No, keep it
            </AlertDialogCancel>

            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (!selectedAppointment) return;

                updateAppointmentStatus(selectedAppointment.id, "cancelled");
                toast.error("Appointment cancelled");
                setIsCancelDialogOpen(false);
              }}
            >
              Yes, cancel appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the appointment.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (!selectedAppointment) return;

                removeAppointment(selectedAppointment.id);
                toast.error("Appointment removed");
                setIsRemoveDialogOpen(false);
              }}
            >
              Yes, remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>   

      <ScheduleAppointment
        key={editingAppointmentId ?? "create"}  
        open={isScheduleDialogOpen}
        isEdit={!!editingAppointmentId}
        initialData={editingAppointmentId && selectedAppointment
          ? getEditableData(selectedAppointment)
          : undefined
        }
        onOpenChange={setIsScheduleDialogOpen}
        onSaved={editingAppointmentId ? handleUpdateAppointment : handleCreateAppointment}

      />

      {/* Reschedule Appointment Dialog 
      <ReschedAppointment
        open={isReschedDialogOpen}
        onOpenChange={setIsReschedDialogOpen}
        appointment={selectedAppointment}
        onSave={(updatedDateTime) => {
          if (!selectedAppointment) return;

          setAppointments((prev) =>
            prev.map((a) =>
              a.id === selectedAppointment.id
                ? { ...a, datetime: updatedDateTime }
                : a
            )
          );
          toast.success("Appointment rescheduled successfully!");
        }}
      />
      */}

    </div>
  );
};

export default AppointmentsList;