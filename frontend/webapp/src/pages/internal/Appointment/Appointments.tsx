import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
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
import ReschedAppointment from "@/components/popupModal/Appointments/ReschedAppointment";
import { toast } from "sonner";


import { Calendar as CalendarIcon } from "lucide-react";
import { User, Car, ClipboardList, Phone, Mail, MessageSquare } from "lucide-react";
/* ================= STORAGE ================= */
const APPOINTMENT_CUSTOMER_KEY = "appointmentCustomers";
const VEHICLE_MODEL_STORAGE_KEY = "vehicleModels";
const VEHICLE_STORAGE_KEY = "vehicles";
const APPOINTMENT_KEY = "appointments";

/* ================= TYPES ================= */
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
  customerId: string;
  vehicleModelId: string;
  service: string;
  datetime: string;
  status: string;
  notes?: string;
}

/* ================= HELPERS ================= */
const formatDateTime = (val: string) => {
  const d = new Date(val);
  return d.toLocaleString();
};

const formatAPT = (id: string, index: number) => {
  return `APT-${String(index + 1).padStart(4, "0")}`;
};

/* ================= COMPONENT ================= */
const AppointmentsList: React.FC = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<VehicleModel[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    return localStorage.getItem("appointmentDateFilter");
  });
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isReschedDialogOpen, setIsReschedDialogOpen] = useState(false);


  const handleRowClick = (apt: Appointment) => {
    setEditingAppointmentId(apt.id);
    setIsSheetOpen(true);
  };

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const { page, setPage, pageSize, setPageSize, paginate } =
    usePagination(25);


/* ================= DUMMY SEED ================= */
const genId = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2);

const seedAppointments = () => {
  if (localStorage.getItem(APPOINTMENT_KEY)) return;

  /* ---- CUSTOMERS ---- */
  const customers: Customer[] = [
    {
      id: genId(),
      firstName: "Juan",
      lastName: "Dela Cruz",
      mobileNumber: "09171234567",
      email: "juan@email.com",
    },
    {
      id: genId(),
      firstName: "Maria",
      lastName: "Santos",
      mobileNumber: "09981234567",
    },
    {
      id: genId(),
      firstName: "Carlo",
      lastName: "Reyes",
      mobileNumber: "09175556666",
    },
  ];

  /* ---- VEHICLES ---- */
  const vehicles: VehicleModel[] = [
    {
      id: genId(),
      make: "Toyota",
      model: "Vios",
    },
    {
      id: genId(),
      make: "Honda",
      model: "Civic",
    },
    {
      id: genId(),
      make: "Ford",
      model: "Ranger",
    },
  ];

  /* ---- APPOINTMENTS ---- */
  const statuses = ["confirmed", "cancelled", "for approval", "completed"];

  const services = [
    "Oil Change",
    "Brake Service",
    "Car Wash",
    "Engine Tune-up",
  ];

  const appointments: Appointment[] = [];

  for (let i = 0; i < 18; i++) {
    const customer = customers[i % customers.length];
    const vehicle = vehicles[i % vehicles.length];

    appointments.push({
      id: genId(),
      customerId: customer.id,
      vehicleModelId: vehicle.id,
      service: services[i % services.length],
      datetime: new Date(
        Date.now() + i * 1000 * 60 * 60 * 6
      ).toISOString(),
      status: statuses[i % statuses.length],
    });
  }

  /* ---- SAVE ---- */
  localStorage.setItem(APPOINTMENT_CUSTOMER_KEY, JSON.stringify(customers));
  localStorage.setItem(VEHICLE_MODEL_STORAGE_KEY, JSON.stringify(vehicles));
  localStorage.setItem(APPOINTMENT_KEY, JSON.stringify(appointments));
};    

  /* ================= LOAD ================= */
useEffect(() => {
  seedAppointments();

  setCustomers(JSON.parse(localStorage.getItem(APPOINTMENT_CUSTOMER_KEY) || "[]"));
  setVehicles(JSON.parse(localStorage.getItem(VEHICLE_MODEL_STORAGE_KEY) || "[]"));
  setAppointments(JSON.parse(localStorage.getItem(APPOINTMENT_KEY) || "[]"));
}, []);

  /* ================= MAP ================= */

  const customerMap = useMemo(() => {
    const map = new Map<string, Customer>();
    customers.forEach((c) => map.set(c.id, c));
    return map;
  }, [customers]);

  const vehicleMap = useMemo(() => {
    const map = new Map<string, VehicleModel>();
    vehicles.forEach((v) => map.set(v.id, v));
    return map;
  }, [vehicles]);


  const EMPTY_CUSTOMER: Customer = {
    id: "",
    firstName: "",
    lastName: "",
    mobileNumber: "",
  };

  const EMPTY_VEHICLE: VehicleModel = {
    id: "",
    make: "",
    model: "",
  };


  /* ================ FORMATTERS ================= */

  const formatPHPhone = (num?: string) => {
    if (!num) return "";

    // remove non-digits
    let digits = num.replace(/\D/g, "");

    if (digits.startsWith("0")) {
      digits = "63" + digits.slice(1);
    } else if (digits.startsWith("9")) {
      digits = "63" + digits;
    } else if (!digits.startsWith("63")) {
      return num;
    }

    if (digits.length !== 12) return num;

    return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
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
    const grouped = new Map<string, Set<string>>();

    const allowedStatuses = new Set(["confirmed", "for approval"]);

    appointments.forEach((a) => {
      const status = a.status.toLowerCase();

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

const updateAppointmentStatus = (id: string, status: string) => {
  setAppointments((prev) => {
    const updated = prev.map((a) =>
      a.id === id ? { ...a, status } : a
    );

    localStorage.setItem(APPOINTMENT_KEY, JSON.stringify(updated));
    return updated;
  });
};

  const removeAppointment = (id: string) => {
    setAppointments((prev) => {
      const updated = prev.filter((a) => a.id !== id);

      localStorage.setItem(APPOINTMENT_KEY, JSON.stringify(updated));
      return updated;
    });

    setIsSheetOpen(false);
  };

  /* ================= SEARCH ================= */
  const normalize = (val: string) =>
    (val || "").toLowerCase().trim();

  const filtered = useMemo(() => {
    const q = normalize(search);

    return appointments.filter((a) => {
      const customer = customerMap.get(a.customerId) ?? EMPTY_CUSTOMER;
      const vehicle = vehicleMap.get(a.vehicleModelId) ?? EMPTY_VEHICLE;

      const matchesStatus =
        filters.status === "all" || normalize(a.status) === normalize(filters.status);


      const matchesDate =
        !selectedDate || toLocalDateString(a.datetime) === selectedDate;

      if (!q) return matchesStatus && matchesDate;

      const firstName = normalize(customer.firstName);
      const lastName = normalize(customer.lastName);
      const fullName = normalize(`${customer.firstName} ${customer.lastName}`);

      const make = normalize(vehicle.make);
      const model = normalize(vehicle.model);

      const service = normalize(a.service);

        const terms = q.split(" ").filter(Boolean);

        const matchesSearch = terms.every((term) =>
          firstName.includes(term) ||
          lastName.includes(term) ||
          fullName.includes(term) ||
          make.includes(term) ||
          model.includes(term) ||
          service.includes(term)
        );

      return matchesStatus && matchesDate && matchesSearch;
    });
  }, [appointments, customerMap, vehicleMap, search, filters, selectedDate]);


  const paginated = paginate(filtered);

  /* ================= FILTER OPTIONS ================= */
  const statusOptions = [
    { label: "For Approval", value: "for approval" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Completed", value: "completed" },
  ];

  const serviceOptions = useMemo(() => {
    const unique = Array.from(new Set(appointments.map(a => a.service)));

    return unique.map((s) => ({
      label: s,
      value: s,
    }));
  }, [appointments]);  

  const toolbarFilters = [
    { key: "status", label: "Status", options: statusOptions },
  ];

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    setPage(1);
  }, [search, pageSize, selectedDate]);

  /* ================= UI ================= */

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
        onAdd={()=>navigate("/internal/appointments/new")}
        addLabel="Add Appointment"
        filters={toolbarFilters}
        onFilterChange={handleFilterChange}
        activeFilters={filters}
      />

      <div className="grid lg:grid-cols-7 gap-x-4 overflow-hidden flex-1 min-h-0">
        {appointments.length > 0 ? (
          <div className="flex-1 flex flex-col border rounded-xl overflow-hidden lg:col-span-5">
            <ScrollArea className="flex-1 px-3">
              <Table className="table-fixed w-full border-separate border-spacing-y-2 h-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[10%]">No.</TableHead>
                    <TableHead className="w-[20%]">Customer</TableHead>
                    <TableHead className="w-[20%]">Vehicle</TableHead>
                    <TableHead className="w-[15%]">Service</TableHead>
                    <TableHead className="w-[20%]">Date & Time</TableHead>
                    <TableHead className="w-[15%]">Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filtered.length > 0 ? (
                    paginated.map((a, index) => {
                      const customer = customerMap.get(a.customerId);
                      const vehicle = vehicleMap.get(a.vehicleModelId);

                      return (
                        <TableRow
                          key={a.id}
                          onClick={() => handleRowClick(a)}
                          className="rounded-lg border bg-card shadow-sm hover:shadow-md"
                        >
                          <TableCell>
                            {formatAPT(a.id, index)}
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-col">
                              <span>
                                {customer?.firstName} {customer?.lastName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatPHPhone(customer?.mobileNumber)}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            {vehicle
                              ? `${vehicle.make} ${vehicle.model}`
                              : "-"}
                          </TableCell>

                          <TableCell>
                            {a.service}
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-col">
                              <span>
                                {formatDate(a.datetime)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(a.datetime)}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge variant="outline">
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
                          <p className="text-sm font-medium">
                            No appointments found
                          </p>
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
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center">
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
        <div className="flex-1 flex flex-col overflow-hidden lg:col-span-2">
          <Calendar 
            mode="single" 
            value={selectedDate ? new Date(selectedDate) : null}
            onSelect={handleDateSelect} 
            events={calendarEvents}
              statusColors={{
              confirmed: "bg-blue-500",
              "for approval": "bg-muted-foreground/50",
            }}
          />          
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
                    {selectedAppointment && formatAPT(selectedAppointment.id, 0)}
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
                      {formatPHPhone(customerMap.get(selectedAppointment?.customerId || "")?.mobileNumber) || "No phone number provided"}
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
                        {vehicleMap.get(selectedAppointment?.vehicleModelId || "")?.make} {vehicleMap.get(selectedAppointment?.vehicleModelId || "")?.model}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] uppercase font-medium text-slate-400">Plate Number</p>
                      <p className="text-sm font-medium">ABC-1234</p>
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
                        <p className="text-base font-medium">{selectedAppointment?.service}</p>
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
                      onClick={() => setIsReschedDialogOpen(true)}
                    >
                      Reschedule Appointment
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

                {/* COMPLETED or CANCELLED */}
                {(selectedAppointment?.status === "completed" ||
                  selectedAppointment?.status === "cancelled") && (
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
                setIsRemoveDialogOpen(false);
              }}
            >
              Yes, remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>   

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

    </div>
  );
};

export default AppointmentsList;