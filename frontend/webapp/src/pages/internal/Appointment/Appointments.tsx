import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Pagination, usePagination } from "@/components/ui/pagination";
import DataToolbar from "@/components/DataToolbar";
import { Button } from "@/components/ui/button";
import Calendar from "@/components/ui/calendar-appointment";

import { Calendar as CalendarIcon, Plus } from "lucide-react";

/* ================= STORAGE ================= */
const APPOINTMENT_CUSTOMER_KEY = "appointmentCustomers";
const VEHICLE_MODEL_STORAGE_KEY = "vehicleModels";
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
  year: number;
  make: string;
  model: string;
}

interface Appointment {
  id: string;
  customerId: string;
  vehicleModelId: string;
  service: string;
  datetime: string;
  status: string;
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
    service: "all",
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    return localStorage.getItem("appointmentDateFilter");
  });

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
      year: 2020,
      make: "Toyota",
      model: "Vios",
    },
    {
      id: genId(),
      year: 2019,
      make: "Honda",
      model: "Civic",
    },
    {
      id: genId(),
      year: 2022,
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
    year: 0,
    make: "",
    model: "",
  };

  const calendarEvents = useMemo(() => {
    return appointments.map((a) => ({
      date: new Date(a.datetime),
      status: a.status.toLowerCase(),
    }));
  }, [appointments]);

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


  /* ================= SEARCH ================= */
  const normalize = (val: string) =>
    (val || "").toLowerCase().trim();

  const filtered = useMemo(() => {
    const q = normalize(search);

    return appointments.filter((a) => {
      const customer = customerMap.get(a.customerId) ?? EMPTY_CUSTOMER;
      const vehicle = vehicleMap.get(a.vehicleModelId) ?? EMPTY_VEHICLE;

      const matchesStatus =
        filters.status === "all" || a.status === filters.status;

      const matchesService =
        filters.service === "all" || a.service === filters.service;

      const matchesDate =
        !selectedDate || toLocalDateString(a.datetime) === selectedDate;

      if (!q) return matchesStatus && matchesService && matchesDate;

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

      return matchesStatus && matchesService && matchesDate && matchesSearch;
    });
  }, [appointments, customerMap, vehicleMap, search, filters, selectedDate]);


  const paginated = paginate(filtered);

  /* ================= FILTER OPTIONS ================= */
  const statusOptions = [
    { label: "Confirmed", value: "confirmed" },
    { label: "Cancelled", value: "cancelled" },
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
    { key: "service", label: "Service", options: serviceOptions },
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
        onAdd={() => navigate("/webapp/appointments/new")}
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
                    <TableHead className="w-[10%]">ID</TableHead>
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
                          onClick={() =>
                            navigate(`/webapp/appointments/${a.id}`)
                          }
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
                              ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
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
              confirmed: "bg-green-500",
              cancelled: "bg-red-500",
              "for approval": "bg-yellow-400",
              completed: "bg-blue-500",
            }}
          />          
        </div>        
      </div>
    </div>
  );
};

export default AppointmentsList;