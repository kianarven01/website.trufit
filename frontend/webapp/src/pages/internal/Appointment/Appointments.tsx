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

import { Calendar as CalendarIcon } from "lucide-react";
import { User, Car, ClipboardList, Phone, Mail, MessageSquare } from "lucide-react";


/* ================= TYPES ================= */
type AppointmentStatus = "for approval" | "confirmed" | "cancelled" ;

interface Appointment {
  id: number;
  appointment_code: string;
  customerID: number;
  plate_number: string;
  services: string[];
  appointment_datetime: string;
  status: AppointmentStatus;
  notes?: string;
  customer: {
    first_name: string;
    last_name: string;
    mobile_number: string;
    email?: string;
  };
  vehicle: {
    plate_number: string;
    make: string;
    model: string;
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
  // const [isReschedDialogOpen, setIsReschedDialogOpen] = useState(false);

     
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
      firstName: apt.customer?.first_name ?? "",
      lastName: apt.customer?.last_name ?? "",
      phone: apt.customer?.mobile_number ?? "",
      email: apt.customer?.email,
      make: apt.vehicle?.make,
      model: apt.vehicle?.model,
      plateNumber: apt.vehicle?.plate_number,
      services: apt.services,
      notes: apt.notes,
      datetime: apt.appointment_datetime,
    };
  };  

  const updateAppointmentStatus = async (id: number, status: AppointmentStatus) => {
    try {
      const apt = appointments.find((a) => a.id === id);
      if (!apt) return;
      
      const payload = {
        firstName: apt.customer.first_name,
        lastName: apt.customer.last_name,
        phone: apt.customer.mobile_number,
        email: apt.customer.email,
        make: apt.vehicle.make,
        model: apt.vehicle.model,
        plateNumber: apt.vehicle.plate_number,
        datetime: apt.appointment_datetime,
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

      const make = normalize(vehicle?.make || "");
      const model = normalize(vehicle?.model || "");

      const matchesStatus =
        filters.status === "all" || a.status === filters.status;

      const matchesDate =
        !selectedDate || toLocalDateString(a.appointment_datetime) === selectedDate;

      if (!q) return matchesStatus && matchesDate;

      const firstName = normalize(customer?.first_name || "");
      const lastName = normalize(customer?.last_name || "");
      const fullName = normalize(`${firstName} ${lastName}`);
      const services = normalize(a.services?.join(" ") || "");

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
    }
  };
    

  /* Update Appointment */
  const handleUpdateAppointment = async (data: any) => {
    if (!editingAppointmentId) return;

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
    }
  };


  /* Remove Appointment */
  const removeAppointment = async (id: number) => {
    try {
      await api.delete(`/appointments/${id}`);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      toast.success("Appointment cancelled successfully.");
      setIsSheetOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to cancel appointment.");
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
                      return (
                        <TableRow
                          key={a.id}
                          onClick={() => handleRowClick(a)}
                          className="rounded-lg border bg-card shadow-sm hover:shadow-md cursor-pointer"
                        >
                          <TableCell>{a.appointment_code}</TableCell>

                          <TableCell>
                            <div className="flex flex-col">
                              <span>
                                {a.customer?.first_name} {a.customer?.last_name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatPhone(a.customer?.mobile_number)}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            {a.vehicle ? `${a.vehicle.make} ${a.vehicle.model}` : "-"}
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
                              <span>{formatDate(a.appointment_datetime)}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(a.appointment_datetime)}
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
                        {selectedAppointment?.customer?.first_name} {selectedAppointment?.customer?.last_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-3.5 h-3.5" />
                      {formatPhone(selectedAppointment?.customer?.mobile_number) || "No phone number provided"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-3.5 h-3.5" />
                      {selectedAppointment?.customer?.email || "No email provided"}
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
                          ? `${selectedAppointment.vehicle.make} ${selectedAppointment.vehicle.model}`
                          : "No vehicle model provided"
                        }
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] uppercase font-medium text-slate-400">Plate Number</p>
                      <p className="text-sm font-medium">{selectedAppointment?.vehicle?.plate_number || "Not provided"}</p>
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