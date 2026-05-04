import { useEffect, useState, useMemo, useRef } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState("");

    const [openCalendar, setOpenCalendar] = useState(false);
    const [openTimePicker, setOpenTimePicker] = useState(false);

    /* LOAD MODELS */
    useEffect(() => {
      const stored = localStorage.getItem(VEHICLE_MODEL_STORAGE_KEY);
      setVehicleModels(safeParse(stored, []));
    }, [open]);

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
          <DialogTitle>Schedule Appointment</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Create a new service appointment
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] bg-card">
          <div className="px-6 py-4 space-y-5 bg-card">

            {/* CUSTOMER */}
            <div>
              <p className="text-sm font-semibold mb-3">
                Customer Information
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="First Name"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm(p => ({ ...p, firstName: e.target.value }))
                  } />

                <Input placeholder="Last Name"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm(p => ({ ...p, lastName: e.target.value }))
                  } />

                <Input placeholder="Mobile Number"
                  value={form.phone}
                  onChange={(e) =>
                    setForm(p => ({ ...p, phone: e.target.value }))
                  } />

                <Input placeholder="Email Address"
                  value={form.email}
                  onChange={(e) =>
                    setForm(p => ({ ...p, email: e.target.value }))
                  } />
              </div>
            </div>

            <Separator />

            {/* VEHICLE */}
            <div>
              <p className="text-sm font-semibold mb-3">
                Vehicle Information
              </p>

              <div className="grid grid-cols-3 gap-3">
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
                  placeholder="Make"
                />

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
                  placeholder="Model"
                />

                <Input
                  placeholder="Plate Number"
                  value={form.plateNumber}
                  onChange={(e) =>
                    setForm(p => ({ ...p, plateNumber: e.target.value }))
                  }
                />
              </div>
            </div>

            <Separator />

            {/* APPOINTMENT */}
            <div>
              <p className="text-sm font-semibold mb-3">
                Appointment Details
              </p>

              <div className="space-y-3">

                <Combobox
                  items={serviceOptions}
                  value={form.service}
                  onChange={(val) =>
                    setForm(p => ({ ...p, service: val }))
                  }
                  placeholder="Select Service"
                />

                <div className="grid grid-cols-[1fr_160px] gap-3">

                  {/* DATE */}
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
                      <div className="absolute z-50 bottom-full mb-2 w-max">
                        <Calendar
                          selectedDate={selectedDate}
                          onSelectDate={handleDateSelect}
                        />
                      </div>
                    )}
                  </div>

                  {/* TIME */}
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

                <Textarea
                  placeholder="Additional notes..."
                  value={form.notes}
                  rows={4}
                  onChange={(e) =>
                    setForm(p => ({ ...p, notes: e.target.value }))
                  }
                />

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