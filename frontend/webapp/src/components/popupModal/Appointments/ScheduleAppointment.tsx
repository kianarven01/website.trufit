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

import {
  Calendar,
  TimePicker,
  generateTimeSlots
} from "@/components/ui/date-time-picker";
import { CalendarIcon, Clock } from "lucide-react";

/* ================= STORAGE ================= */
const VEHICLE_MODEL_STORAGE_KEY = "vehicleModels";


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

  return d.toISOString();
};

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
      plateNumber: "",
      service: "",
      notes: "",
    });

    const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

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
      const stored = localStorage.getItem(VEHICLE_MODEL_STORAGE_KEY);
      setVehicleModels(safeParse(stored, []));
    }, []);

  const EMPTY_FORM = {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    make: "",
    model: "",
    plateNumber: "",
    service: "",
    notes: "",
  };

  useEffect(() => {
    if (!open) return;

    if (!initialData) {
      setForm(EMPTY_FORM);
      setSelectedDate(null);
      setSelectedTime("");
      setErrors({});
      setTouched({});
      return;
    }

    setForm({
      firstName: initialData.firstName || "",
      lastName: initialData.lastName || "",
      phone: initialData.phone || "",
      email: initialData.email || "",
      make: initialData.make || "",
      model: initialData.model || "",
      plateNumber: initialData.plateNumber || "",
      service: initialData.service || "",
      notes: initialData.notes || "",
    });

    if (initialData.datetime) {
      const d = new Date(initialData.datetime);
      setSelectedDate(d);

      const hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHour = hours % 12 || 12;

      setSelectedTime(`${formattedHour}:${minutes} ${ampm}`);
    }
  }, [open, initialData]);


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

    const serviceOptions = [
      { label: "Oil Change", value: "Oil Change" },
      { label: "Brake Service", value: "Brake Service" },
      { label: "Car Wash", value: "Car Wash" },
      { label: "Engine Tune-up", value: "Engine Tune-up" },
    ];

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
      service,
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
      const err = validateField(key, form[key as keyof typeof form]);
      if (err) newErrors[key] = err;
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

    if (!firstName || !lastName || !phone || !make || !model || !service) {
      toast.error("Please complete all required fields.");
      return;
    }

    onSaved?.({
      firstName,
      lastName,
      phone,
      email,
      make,
      model,
      plateNumber,
      service,
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

        <ScrollArea className="max-h-[65vh] bg-card">
          <div className="px-6 py-4 space-y-5 bg-card">

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

                <div  className="flex flex-col gap-1">
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

                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-medium">Service</Label>
                  <Combobox
                    items={serviceOptions}
                    value={form.service}
                    onChange={(val) =>
                      setForm(p => ({ ...p, service: val }))
                    }
                  />                
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
          <Button onClick={handleSave}>
            {isEdit? "Update Appointment" : "Schedule Appointment"}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};

export default ScheduleAppointment;