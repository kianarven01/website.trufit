import { useEffect, useState, useMemo, useRef } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import Combobox from "@/components/ui/combobox";
import { toast } from "sonner";
import api from "@/api/axios";

import { Calendar, TimePicker, generateTimeSlots } from "@/components/ui/date-time-picker";
import { CalendarIcon, Clock } from "lucide-react";


/* ================= TYPES ================= */

interface VehicleModel {
  id: string;
  make: string;
  model: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (data: any) => void;
  initialData?: any;
  isEdit?: boolean;
}

/* ================= HELPERS ================= */

/* SAFE PARSE */
const safeParse = <T,>(value: string | null, fallback: T): T => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const normalize = (val: string) => val?.trim().toLowerCase();

const toTitleCase = (str: string) =>
  (str || "")
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map(word =>
      word
        .split("-")
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join("-")
    )
    .join(" ");

const findCanonical = (list: string[], input: string) => {
  const n = normalize(input);
  return list.find(item => normalize(item) === n);
};

const formatPrettyDate = (date: Date) =>
  date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

const combineDateTime = (date: Date, time: string) => {
  if (!time.includes(" ")) return "";

  const [hms, period] = time.split(" ");
  let [h, m] = hms.split(":").map(Number);

  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;

  const d = new Date(date);
  d.setHours(h, m, 0, 0);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hour = String(d.getHours()).padStart(2, "0");
  const minute = String(d.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}:00`;
};

const SERVICE_LIST = [
  "Preventive Maintenance Service (PMS)",
  "Oil Change",
  "Brake Service",
  "Tire Service",
  "Fuel System Service",
  "Battery Service",
  "Engine Tune-Up",
  "Exhaust Repair",
  "Transmission Service",
  "Cooling System Maintenance",
  "Suspension & Steering",
  "Other"
];

/* ================= COMPONENT ================= */
  const ScheduleAppointment: React.FC<Props> = ({
    open,
    onOpenChange,
    onSaved,
    initialData,
    isEdit,
  }) => {
    const [form, setForm] = useState({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      make: "",
      model: "",
      year: "",
      plateNumber: "",
      services: [] as string[],
      notes: "",
    });

    const [isLoading, setIsLoading] = useState(false);

    const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const [serviceList, setServiceList] = useState<string[]>([]);
    const [customService, setCustomService] = useState("");
    const [isOtherService, setIsOtherService] = useState(false);

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState("");

    const [openCalendar, setOpenCalendar] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);
    const [openTimePicker, setOpenTimePicker] = useState(false);

    const handleBlur = (field: string) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
    };


  useEffect(() => {
    if (!open) {
      setOpenCalendar(false);
      setOpenTimePicker(false);
    }
  }, [open]);


  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(e.target as Node)
      ) {
        setOpenCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);


    /* LOAD MODELS */
    useEffect(() => {
      const loadData = async () => {
        setIsLoading(true);
        try {
          const [modelsRes, servicesRes] = await Promise.all([
            api.get('/products/vehicles'),
            api.get('/products/service-types')
          ]);

          if (modelsRes.data?.data) {
            const flattened = modelsRes.data.data.map((m: any) => ({
              id: String(m.id),
              make: m.manufacturer?.name || "",
              model: m.model || ""
            }));
            setVehicleModels(flattened);
          }

          if (servicesRes.data?.data) {
            setServiceList(servicesRes.data.data.map((s: any) => s.name));
          } else {
            const defaults = [
              "Preventive Maintenance Service",
              "Oil Change",
              "Brake Service",
              "Tire Service",
              "Fuel System Service",
              "Battery Service",
              "Engine Tune-up",
              "Exhaust Repair",
              "Transmission Service",
              "Cooling System Maintenance",
              "Suspension & Steering"
            ];
            setServiceList(defaults);
          }
        } catch (error) {
          console.error("Failed to load reference data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      if (open) {
        loadData();
      }
    }, [open]);


  const EMPTY_FORM = {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    make: "",
    model: "",
    year: "",
    plateNumber: "",
    services: [] as string[],
    notes: "",
  };

  useEffect(() => {
    if (!open) return;

    if (!initialData) {
      setForm(EMPTY_FORM);
      setSelectedDate(null);
      setSelectedTime("");
      setIsOtherService(false);
      setCustomService("");
      setErrors({});
      setTouched({});
      return;
    }

    const rawServices = initialData?.services ?? initialData?.service ?? [];
    const normalizedServices = Array.isArray(rawServices)
      ? rawServices
      : [rawServices].filter(Boolean);

    // Separate standard services from custom ones
    const standardServices = normalizedServices.filter(s => SERVICE_LIST.includes(s) && s !== "Other");
    const custom = normalizedServices.find(s => !SERVICE_LIST.includes(s));

    setForm({
      firstName: initialData.first_name || initialData.firstName || initialData.customer?.first_name || "",
      lastName: initialData.last_name || initialData.lastName || initialData.customer?.last_name || "",
      phone: initialData.phone || initialData.customer?.mobile_number || "",
      email: initialData.email || initialData.customer?.email || "",
      make: initialData.make || initialData.vehicle?.make || "",
      model: initialData.model || initialData.vehicle?.model || "",
      year: initialData.year || initialData.vehicle?.year_model || "",
      plateNumber: initialData.plate_number || initialData.plateNumber || "",
      services: standardServices,
      notes: initialData.notes || "",
    });

    if (custom) {
      setIsOtherService(true);
      setCustomService(custom);
    } else {
      const hasOther = normalizedServices.includes("Other");
      setIsOtherService(hasOther);
      setCustomService("");
    }

    const dt = initialData.appointment_datetime || initialData.datetime;
    if (dt) {
      const d = new Date(dt);
      setSelectedDate(d);

      const hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHour = hours % 12 || 12;

      setSelectedTime(`${formattedHour}:${minutes} ${ampm}`);
    }

    setErrors({});
    setTouched({});
  }, [open, initialData, serviceList]);


    /* OPTIONS */
    const makeOptions = useMemo(() => {
      const makes = Array.from(new Set(vehicleModels.map(v => v.make)));
      return makes.map(m => ({ label: m, value: m }));
    }, [vehicleModels]);

    const modelOptions = useMemo(() => {
      const filtered = vehicleModels.filter(
        v => normalize(v.make) === normalize(form.make)
      );
      const models = Array.from(new Set(filtered.map(v => v.model)));
      return models.map(m => ({ label: m, value: m }));
    }, [vehicleModels, form.make]);


    const serviceOptions = useMemo(() => {
      const formattedCustom = toTitleCase(customService);
      
      const unique = Array.from(new Set(serviceList));
      const base = unique.map(s => ({ label: s, value: s }));
      const trimmed = customService.trim();
      if (isOtherService && trimmed.length > 0) {
        const exists = unique.some(
          s => normalize(s) === normalize(formattedCustom)
        );

        if (!exists) {
          return [
            ...base,
            { label: "Others", value: "__OTHER__" },
          ];
        }
      }

      return [
        ...base,
        { label: "Others", value: "__OTHER__" },
      ];
    }, [serviceList, isOtherService, customService]);

    const handleDateSelect = (d: Date) => {
      setSelectedDate(d);
      const slots = generateTimeSlots(d);
      const firstValid = slots.find(t => !t.disabled);
      if (firstValid) setSelectedTime(firstValid.label);
      setOpenCalendar(false);
    };

    /* ================= VALIDATION ================= */

  const formatName = (value: string) => {
    return value
      .replace(/[^A-Za-z.\-\s]/g, "") // allow . and -
      .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize first letters only
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);

    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  };


  const formatPlate = (value: string) => {
    const upper = value.toUpperCase().replace(/[^A-Z0-9\s-]/g, "");

    let cleanCount = 0;

    return upper
      .split("")
      .filter((char) => {
        if (/[A-Z0-9]/.test(char)) {
          cleanCount++;
          return cleanCount <= 7; 
        }
        return true;
      })
      .join("");
  };


  const validateField = (field: string, value: string) => {
    switch (field) {
      case "firstName":
      case "lastName":
        if (!value) return "Required";
        if (!/^[A-Za-z.\s-]+$/.test(value)) return "Please enter a valid name";
        return "";

      case "phone":
        if (!value) return "Required";
        if (!/^\d{11}$/.test(value.replace(/\s/g, "")))
          return "Phone number must be 11 digits";
        return "";

      case "email":
        // OPTIONAL → only validate if user typed something
        if (!value) return "";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Invalid email address";
        return "";

        case "plateNumber":
          if (!value) return "";

          const clean = value.replace(/[\s-]/g, "");

          if (!/^[A-Z0-9]+$/.test(clean)) return "Invalid plate format";
          if (clean.length < 6 || clean.length > 7)
            return "Plate number must be 6–7 characters";

          return "";

      default:
        return "";
    }
  };


    /* ================= SAVE ================= */
  const handleSave = () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select date and time.");
      return;
    }

    const datetime = combineDateTime(selectedDate, selectedTime);

    if (!datetime || new Date(datetime) < new Date()) {
      toast.error("Invalid or past time selected.");
      return;
    }

    const {
      firstName,
      lastName,
      phone,
      email,
      make,
      model,
      plateNumber,
      services,
      notes,
    } = form;

    const newErrors: Record<string, string> = {};

    const fieldsToValidate = [
      "firstName",
      "lastName",
      "phone",
      "email",
      "plateNumber",
    ];

    fieldsToValidate.forEach((key) => {
      const value = form[key as keyof typeof form];

      if (typeof value === "string") {
        const err = validateField(key, value);
        if (err) newErrors[key] = err;
      }
    });

    setErrors(newErrors);
    setTouched({
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      plateNumber: true,
    });

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please complete all required fields.");
      return;
    }


    const requiredFieldsValid =
      firstName &&
      lastName &&
      phone &&
      make &&
      model &&
      (form.services.length > 0 || (isOtherService && customService.trim().length > 0));

    if (!requiredFieldsValid) {
      toast.error("Please complete all required fields.");
      return;
    }

    let finalServices = Array.from(new Set(form.services.filter(s => s !== "Other")));

    if (isOtherService) {
      if (!customService.trim()) {
        toast.error("Please enter the specific service.");
        return;
      }

      const formattedCustom = toTitleCase(customService);
      if (!finalServices.includes(formattedCustom)) {
        finalServices.push(formattedCustom);
      }
    }

    onSaved?.({
      firstName,
      lastName,
      phone,
      email,
      make,
      model,
      year: form.year,
      plateNumber,
      services: finalServices,
      customService: "",
      notes,
      datetime,
    });

    onOpenChange(false);
  };

  /* ================= UI ================= */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">

        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>{isEdit ? "Edit Appointment" : "Schedule Appointment"}</DialogTitle>
          <p className="text-xs text-muted-foreground">
            {isEdit ? "Edit an existing service appointment" : "Create a new service appointment"}
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] bg-card relative">
          {isLoading && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[1px] transition-opacity">
              <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-3" />
              <p className="text-sm font-medium text-slate-600 animate-pulse">Loading technical data...</p>
            </div>
          )}
          <div className={cn("px-6 py-4 space-y-5 bg-card", isLoading && "opacity-40 pointer-events-none")}>

            {/* CUSTOMER */}
            <div>
              <p className="text-sm font-semibold mb-3">
                Customer Information
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-medium">First Name</Label>
                  <Input
                    value={form.firstName}
                    onChange={(e) => {
                      const value = formatName(e.target.value);

                      setForm(p => ({ ...p, firstName: value }));

                      if (touched.firstName) {
                        const err = validateField("firstName", value);
                        setErrors(p => ({ ...p, firstName: err }));
                      }
                    }}
                    onBlur={() => {
                      handleBlur("firstName");

                      const err = validateField("firstName", form.firstName);
                      setErrors(p => ({ ...p, firstName: err }));
                    }}
                  />
                  {touched.firstName && errors.firstName && (
                    <p className="text-xs text-red-500">{errors.firstName}</p>
                  )}             
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-medium">Last Name</Label>
                  <Input
                    value={form.lastName}
                    onChange={(e) => {
                      const value = formatName(e.target.value);

                      setForm(p => ({ ...p, lastName: value }));

                      if (touched.lastName) {
                        const err = validateField("lastName", value);
                        setErrors(p => ({ ...p, lastName: err }));
                      }
                    }}
                    onBlur={() => {
                      handleBlur("lastName");

                      const err = validateField("lastName", form.lastName);
                      setErrors(p => ({ ...p, lastName: err }));
                    }}
                  />
                  {touched.lastName && errors.lastName && (
                    <p className="text-xs text-red-500">{errors.lastName}</p>
                  )}                  
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-medium">Phone Number</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => {
                      const value = formatPhone(e.target.value);

                      setForm(p => ({ ...p, phone: value }));

                      if (touched.phone) {
                        setErrors(p => ({ ...p, phone: "" }));
                      }
                    }}
                    onBlur={() => {
                      handleBlur("phone");

                      const err = validateField("phone", form.phone);
                      setErrors(p => ({ ...p, phone: err }));
                    }}
                  />
                 
                  {touched.phone && errors.phone && (
                    <p className="text-xs text-red-500">{errors.phone}</p>
                  )}                                
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-medium">Email Address</Label>
                  <Input
                    value={form.email}
                    onChange={(e) => {
                      const value = e.target.value;

                      setForm(p => ({
                        ...p,
                        email: value,
                      }));

                      if (touched.email) {
                        setErrors(p => ({ ...p, email: "" }));
                      }
                    }}
                    onBlur={() => {
                      handleBlur("email");

                      if (!form.email.trim()) {
                        setErrors(p => ({ ...p, email: "" }));
                        return;
                      }

                      const err = validateField("email", form.email);
                      setErrors(p => ({ ...p, email: err }));
                    }}
                  /> 
                  {touched.email && errors.email && (
                    <p className="text-xs text-red-500">{errors.email}</p>
                  )}             
                </div>

              </div>
            </div>

            <Separator />

            {/* VEHICLE */}
            <div>
              <p className="text-sm font-semibold mb-3">
                Vehicle Information
              </p>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-medium">Make</Label>
                  <Combobox
                    items={makeOptions}
                    value={form.make}
                    onChange={(val) =>
                      setForm(p => ({
                        ...p,
                        make: toTitleCase(val),
                        model: "",
                      }))
                    }
                  />                
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-medium">Model</Label>
                  <Combobox
                    items={modelOptions}
                    value={form.model}
                    onChange={(val) => {
                      const formatted = toTitleCase(val);
                      const canonical =
                        findCanonical(modelOptions.map(m => m.value), formatted)
                        || formatted;

                      setForm(p => ({ ...p, model: canonical }));
                    }}
                  />                  
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-medium">Year</Label>
                  <Input
                    value={form.year}
                    
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setForm(p => ({ ...p, year: val }));
                    }}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-medium">Plate Number</Label>
                  <Input
                    value={form.plateNumber}
                    onChange={(e) => {
                      setForm(p => ({
                        ...p,
                        plateNumber: formatPlate(e.target.value),
                      }));
                    }}
                    onBlur={() => {
                      handleBlur("plateNumber");

                      if (!form.plateNumber.trim()) {
                        setErrors(p => ({ ...p, plateNumber: "" }));
                        return;
                      }

                      const err = validateField("plateNumber", form.plateNumber);
                      setErrors(p => ({ ...p, plateNumber: err }));
                    }}
                  />
                  {touched.plateNumber && errors.plateNumber && (
                    <p className="text-xs text-red-500">{errors.plateNumber}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* APPOINTMENT */}
            <div>
              <p className="text-sm font-semibold mb-3">
                Appointment Details
              </p>

              <div className="space-y-3">

                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-medium text-red-500 uppercase">Service Needed</Label>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 border rounded-md p-3 bg-muted/20">
                    {SERVICE_LIST.map((svc) => (
                      <div key={svc} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`svc-${svc}`}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                          checked={form.services.includes(svc)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setForm(p => ({
                              ...p,
                              services: checked 
                                ? [...p.services, svc]
                                : p.services.filter(s => s !== svc)
                            }));
                            
                            if (svc === "Other") {
                              setIsOtherService(checked);
                            }
                          }}
                        />
                        <label
                          htmlFor={`svc-${svc}`}
                          className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {svc}
                        </label>
                      </div>
                    ))}
                  </div>

                  {form.services.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.services.map((svc, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-muted rounded-md"
                        >
                          <span>{svc}</span>
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => {
                              setForm(p => ({
                                ...p,
                                services: p.services.filter(s => s !== svc),
                              }));
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}                  
                  {isOtherService && (
                    <div className="flex flex-col gap-1 mt-2">
                      <Label className="text-xs font-medium">Specific Service</Label>
                      <Input
                        value={customService}
                        placeholder="Enter specific service"
                        onChange={(e) => {
                          setCustomService(e.target.value);
                          setForm(p => ({ ...p, service: "" }));
                        }}
                      />
                    </div>
                  )}            
                </div>

                  <div className="grid grid-cols-[1fr_160px] gap-3">

                    {/* DATE */}
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs font-medium">Appointment Date</Label>
                      <div className="relative">
                        <Input
                          readOnly
                          value={selectedDate ? formatPrettyDate(selectedDate) : ""}
                          onClick={() => {
                            setOpenCalendar(p => !p);
                            setOpenTimePicker(false);
                          }}
                          placeholder="Select date"
                          className="pr-10 cursor-pointer"
                        />

                        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />

                        {openCalendar && (
                          <div 
                            ref={calendarRef}
                            className="absolute z-50 bottom-full mb-2 w-max"
                          >
                            <Calendar
                              selectedDate={selectedDate}
                              onSelectDate={handleDateSelect}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* TIME */}
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs font-medium">Appointment Time</Label>
                      <div className="relative">
                        <button
                          onClick={() => {
                            setOpenTimePicker(p => !p);
                            setOpenCalendar(false);
                          }}
                          className={cn(
                            "flex h-9 w-full items-center justify-between rounded-md border border-input px-3 text-sm",
                            "hover:bg-muted/50"
                          )}
                        >
                          <span className={cn(!selectedTime && "text-muted-foreground")}>
                            {selectedTime || "Select time"}
                          </span>
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </button>

                        <TimePicker
                          open={openTimePicker}
                          value={selectedTime}
                          selectedDate={selectedDate}
                          onSelect={(t) => {
                            setSelectedTime(t);
                            setOpenTimePicker(false);
                          }}
                          onClose={() => setOpenTimePicker(false)}
                          position="top"
                        />
                      </div>                    
                    </div>

                  </div>

                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-medium">Additional Notes</Label>
                    <Textarea
                      value={form.notes}
                      rows={3}
                      onChange={(e) =>
                        setForm(p => ({ ...p, notes: e.target.value }))
                      }
                    />                  
                  </div>


              </div>
            </div>

          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Please wait..." : (isEdit ? "Update Appointment" : "Schedule Appointment")}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};

export default ScheduleAppointment;