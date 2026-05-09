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
import api from "@/api/axios";
import { cn } from "@/lib/utils";

import { Calendar as CalendarIcon } from "lucide-react";
import { User, Car, ClipboardList, Phone, Mail, MessageSquare } from "lucide-react";


/* ================= TYPES ================= */
type AppointmentStatus = "for approval" | "confirmed" | "cancelled" ;

interface Appointment {
  id: number;
  appointment_code: string;
  customer_id?: number;
  vehicle_id?: number;
  plate_number?: string;
  services: string[];
  appointment_datetime: string;
  status: AppointmentStatus;
  notes?: string;
  
  // Lead Info (directly from table)
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  make?: string;
  model?: string;
  year?: string;

  customer?: {
    first_name: string;
    last_name: string;
    mobile_number: string;
    email?: string;
  };
  vehicle?: {
    id: number;
    plate_number: string;
    make: string;
    model: string;
    year_model: string;
  };
}

/* ================= HELPERS ================= */
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



/* ================= COMPONENT ================= */
const AppointmentsList: React.FC = () => {

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  type FilterStatus = AppointmentStatus | "all";
  const [filters, setFilters] = useState<{ status: FilterStatus }>({
    status: "all",
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    return localStorage.getItem("appointmentDateFilter");
  });
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<number | null>(null);
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


  /* ================= LOAD ================= */

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/appointments');
      if (res.data?.data) {
        setAppointments(res.data.data);
      }
    } catch (error) {
      console.error("Failed to load appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= MAP ================= */



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

  const formatForBackend = (val: string) => {
    if (!val) return "";
    const d = new Date(val);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hour = String(d.getHours()).padStart(2, "0");
    const minute = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hour}:${minute}:00`;
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

      const dateKey = toLocalDateString(a.appointment_datetime);

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
    return {
      id: apt.id,
      firstName: apt.customer?.first_name || apt.first_name || "",
      lastName: apt.customer?.last_name || apt.last_name || "",
      phone: apt.customer?.mobile_number || apt.phone || "",
      email: apt.customer?.email || apt.email || "",
      make: apt.vehicle?.make || apt.make || "",
      model: apt.vehicle?.model || apt.model || "",
      year: apt.vehicle?.year_model || apt.year || "",
      plateNumber: apt.plate_number || apt.vehicle?.plate_number || "",
      services: apt.services || [],
      notes: apt.notes || "",
      datetime: apt.appointment_datetime,
      status: apt.status, // Pass the current status!
      vehicle_id: apt.vehicle_id || apt.vehicle?.id, 
    };
  };  

  const updateAppointmentStatus = async (id: number, status: AppointmentStatus) => {
    setIsActionLoading(true);
    try {
      const apt = appointments.find((a) => a.id === id);
      if (!apt) return;
      
      const payload = {
        firstName: apt.customer?.first_name || apt.first_name,
        lastName: apt.customer?.last_name || apt.last_name,
        phone: apt.customer?.mobile_number || apt.phone,
        email: apt.customer?.email || apt.email,
        make: apt.vehicle?.make || apt.make,
        model: apt.vehicle?.model || apt.model,
        year: apt.vehicle?.year_model || apt.year,
        plateNumber: apt.plate_number || apt.vehicle?.plate_number || "",
        datetime: formatForBackend(apt.appointment_datetime),
        services: apt.services,
        notes: apt.notes,
        status: status
      };
      
      const res = await api.put(`/appointments/${id}`, payload);
      if (res.data?.data) {
        setAppointments((prev) => prev.map((a) => (a.id === id ? res.data.data : a)));
        toast.success("Status updated");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    } finally {
      setIsActionLoading(false);
    }
  };


  /* ================= SEARCH ================= */
  const normalize = (val: string) =>
    (val || "").toLowerCase().trim();

  const filtered = useMemo(() => {
    const q = normalize(search);

    return appointments.filter((a) => {
      const customer = a.customer;
      const vehicle = a.vehicle;

      const make = normalize(a.vehicle?.make || a.make || "");
      const model = normalize(a.vehicle?.model || a.model || "");

      const matchesStatus =
        filters.status === "all" || a.status === filters.status;

      const matchesDate =
        !selectedDate || toLocalDateString(a.appointment_datetime) === selectedDate;

      if (!q) return matchesStatus && matchesDate;

      const firstName = normalize(customer?.first_name || a.first_name || "");
      const lastName = normalize(customer?.last_name || a.last_name || "");
      const fullName = normalize(`${firstName} ${lastName}`);
      const plate = normalize(a.plate_number || vehicle?.plate_number || "");
      const services = normalize(a.services?.join(" ") || "");
      const phone = normalize(a.phone || customer?.mobile_number || "");
      const email = normalize(a.email || customer?.email || "");

      const terms = q.split(" ").filter(Boolean);

      const matchesSearch = terms.every((term) =>
        firstName.includes(term) ||
        lastName.includes(term) ||
        fullName.includes(term) ||
        make.includes(term) ||
        model.includes(term) ||
        plate.includes(term) ||
        services.includes(term) ||
        phone.includes(term) ||
        email.includes(term)
      );

      return matchesStatus && matchesDate && matchesSearch;
    });
  }, [appointments, search, filters, selectedDate]);


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

  const handleCreateAppointment = async (data: any) => {
    setIsActionLoading(true);
    try {
      const res = await api.post('/appointments', data);
      if (res.data?.data) {
        setAppointments(prev => [...prev, res.data.data]);
        toast.success("Appointment created successfully!");
        setEditingAppointmentId(null);
        setIsScheduleDialogOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create appointment.");
    } finally {
      setIsActionLoading(false);
    }
  };
    

  /* Update Appointment */
  const handleUpdateAppointment = async (data: any) => {
    if (!editingAppointmentId) return;

    setIsActionLoading(true);
    try {
      const res = await api.put(`/appointments/${editingAppointmentId}`, data);
      if (res.data?.data) {
        setAppointments(prev => prev.map(a => a.id === editingAppointmentId ? res.data.data : a));
        toast.success("Appointment updated!");
        setEditingAppointmentId(null);
        setIsScheduleDialogOpen(false);
        setIsSheetOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update appointment.");
    } finally {
      setIsActionLoading(false);
    }
  };


  /* Remove Appointment */
  const removeAppointment = async (id: number) => {
    setIsActionLoading(true);
    try {
      await api.delete(`/appointments/${id}`);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      toast.success("Appointment cancelled successfully.");
      setIsSheetOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to cancel appointment.");
    } finally {
      setIsActionLoading(false);
    }
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
        beforeAdd={
          <div className="flex items-center gap-6 text-[11px] font-medium text-muted-foreground px-4 py-1.5 bg-slate-50/50 rounded-full border border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
              Confirmed: <span className="text-foreground font-bold">{appointments.filter(a => a.status === 'confirmed').length}</span>
            </div>
            <div className="flex items-center gap-1.5 border-x px-6 border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.4)]" />
              For Approval: <span className="text-foreground font-bold">{appointments.filter(a => a.status === 'for approval').length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
              Cancelled: <span className="text-foreground font-bold">{appointments.filter(a => a.status === 'cancelled').length}</span>
            </div>
          </div>
        }
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
        {(appointments.length > 0 || isLoading) ? (
          <div  className={cn(
            "flex-1 min-w-0 flex flex-col border rounded-xl overflow-hidden relative",
            isActionLoading && "opacity-60 pointer-events-none"
          )}>
            {isActionLoading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
                <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
              </div>
            )}
            <ScrollArea className="flex-1 px-3">
              <Table className="w-full border-separate border-spacing-y-2 h-full min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] text-center">No.</TableHead>
                    <TableHead className="text-center">Customer</TableHead>
                    <TableHead className="text-center">Vehicle</TableHead>
                    <TableHead className="text-center">Service</TableHead>
                    <TableHead className="text-center">Date & Time</TableHead>
                    <TableHead className="w-[120px] text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isLoading ? (
                    <TableSkeleton rows={8} />
                  ) : filtered.length > 0 ? (
                    paginated.map((a) => {
                      return (
                        <TableRow
                          key={a.id}
                          onClick={() => handleRowClick(a)}
                          className="rounded-lg border bg-card shadow-sm hover:shadow-md cursor-pointer"
                        >
                          <TableCell className="text-center">{a.appointment_code}</TableCell>
  
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-medium">
                                {a.first_name 
                                  ? `${a.first_name} ${a.last_name}`.trim()
                                  : a.customer 
                                    ? `${a.customer.first_name} ${a.customer.last_name}`
                                    : "Unknown Customer"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatPhone(a.phone || a.customer?.mobile_number)}
                              </span>
                            </div>
                          </TableCell>
  
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-medium">
                                {a.vehicle 
                                  ? `${a.vehicle.year_model || a.year || ""} ${a.vehicle.make} ${a.vehicle.model}`.trim()
                                  : a.make ? `${a.year || ""} ${a.make} ${a.model}`.trim() : "-"}
                              </span>
                              <span className="text-xs text-muted-foreground font-mono">
                                {a.plate_number}
                              </span>
                            </div>
                          </TableCell>
  
                          <TableCell className="text-center">
                            <div className="flex flex-wrap gap-1 justify-center">
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
  
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center">
                              <span>{formatDate(a.appointment_datetime)}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(a.appointment_datetime)}
                              </span>
                            </div>
                          </TableCell>
  
                          <TableCell className="text-center">
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
                    {selectedAppointment?.appointment_code}
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
                        {selectedAppointment?.first_name 
                          ? `${selectedAppointment.first_name} ${selectedAppointment.last_name}`.trim()
                          : selectedAppointment?.customer 
                            ? `${selectedAppointment.customer.first_name} ${selectedAppointment.customer.last_name}`
                            : "Unknown Customer"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-3.5 h-3.5" />
                      {formatPhone(selectedAppointment?.phone || selectedAppointment?.customer?.mobile_number) || "No phone number provided"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-3.5 h-3.5" />
                      {selectedAppointment?.email || selectedAppointment?.customer?.email || "No email provided"}
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
                        {selectedAppointment?.vehicle
                          ? `${selectedAppointment.vehicle.year_model || selectedAppointment.year || ""} ${selectedAppointment.vehicle.make} ${selectedAppointment.vehicle.model}`.trim()
                          : selectedAppointment?.make ? `${selectedAppointment.year || ""} ${selectedAppointment.make} ${selectedAppointment.model}`.trim() : "No vehicle model provided"
                        }
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] uppercase font-medium text-slate-400">Plate Number</p>
                      <p className="text-sm font-medium">{selectedAppointment?.plate_number || selectedAppointment?.vehicle?.plate_number || "Not provided"}</p>
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
                          {selectedAppointment?.services?.join(", ") || "No services provided"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedAppointment && formatDate(selectedAppointment.appointment_datetime)} at {selectedAppointment && formatTime(selectedAppointment.appointment_datetime)}
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

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100"
                        onClick={() => {
                          setIsSheetOpen(false);
                          setEditingAppointmentId(selectedAppointment?.id || null);
                          setIsScheduleDialogOpen(true)
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="outline"
                        className="bg-slate-50 hover:bg-slate-100"
                        onClick={() => setIsReschedDialogOpen(true)}
                      >
                        Reschedule
                      </Button>
                    </div>

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
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          setIsSheetOpen(false);
                          setEditingAppointmentId(selectedAppointment?.id || null);
                          setIsScheduleDialogOpen(true)}}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="outline"
                        className="bg-slate-50 hover:bg-slate-100"
                        onClick={() => setIsReschedDialogOpen(true)}
                      >
                        Reschedule
                      </Button>
                    </div>

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
                      className="w-full bg-blue-600 hover:bg-blue-700 h-11"
                      onClick={() => setIsReschedDialogOpen(true)}
                    >
                      Reschedule
                    </Button>
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

      {/* Reschedule Appointment Dialog */}
      <ReschedAppointment
        open={isReschedDialogOpen}
        onOpenChange={setIsReschedDialogOpen}
        appointment={selectedAppointment as any}
        onSave={(updatedDateTime) => {
          if (!selectedAppointment) return;
          
          setIsActionLoading(true);
          // Re-use updateAppointmentStatus logic to save the new time
          const payload = {
            firstName: selectedAppointment.customer?.first_name || selectedAppointment.first_name,
            lastName: selectedAppointment.customer?.last_name || selectedAppointment.last_name,
            phone: selectedAppointment.customer?.mobile_number || selectedAppointment.phone,
            email: selectedAppointment.customer?.email || selectedAppointment.email,
            make: selectedAppointment.vehicle?.make || selectedAppointment.make,
            model: selectedAppointment.vehicle?.model || selectedAppointment.model,
            year: selectedAppointment.vehicle?.year_model || selectedAppointment.year,
            plateNumber: selectedAppointment.plate_number || selectedAppointment.vehicle?.plate_number || "",
            datetime: formatForBackend(updatedDateTime),
            services: selectedAppointment.services || [],
            notes: selectedAppointment.notes || "",
            status: selectedAppointment.status === "cancelled" ? "for approval" : selectedAppointment.status 
          };

          api.put(`/appointments/${selectedAppointment.id}`, payload)
            .then(res => {
              if (res.data?.data) {
                setAppointments(prev => prev.map(a => a.id === selectedAppointment.id ? res.data.data : a));
                toast.success("Appointment rescheduled successfully!");
                setIsReschedDialogOpen(false);
                setIsSheetOpen(false);
              }
            })
            .catch(() => toast.error("Failed to reschedule"))
            .finally(() => setIsActionLoading(false));
        }}
      />

    </div>
  );
};

export default AppointmentsList;