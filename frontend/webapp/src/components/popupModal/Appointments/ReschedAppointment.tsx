import React, { useEffect, useState, useRef } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { Calendar, TimePicker, generateTimeSlots } from "@/components/ui/date-time-picker";
import { Calendar as CalendarIcon, Clock } from "lucide-react";


interface Appointment {
  id: string;
  customer_id?: number;
  plate_number?: string;
  services?: string[];
  appointment_datetime: string;
  status: string;
  notes?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onSave: (updatedDateTime: string) => void;
}


/* ================= DATE FORMATTER ================= */
const formatPrettyDate = (date: Date) => {
  if (!date) return "";

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const dayName = days[date.getDay()];
  const month = months[date.getMonth()];
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  return `${dayName} ${month} ${day}, ${year}`;
};


/* ================= COMPONENT ================= */
const ReschedAppointment: React.FC<Props> = ({
  open,
  onOpenChange,
  appointment,
  onSave,
}) => {
  const baseDate = appointment ? new Date(appointment.appointment_datetime) : null;
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");

  const [openTimePicker, setOpenTimePicker] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);

  const timeRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  /* ================= INIT ================= */

  useEffect(() => {
  if (!open || !appointment) return;

  const d = new Date(appointment.appointment_datetime);

  const h = d.getHours();
  const m = d.getMinutes();

  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;

  setSelectedDate(d);
  setSelectedTime(
    `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`
  );
}, [open, appointment]);


  /* ================= OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;

      if (timeRef.current && !timeRef.current.contains(target)) {
        setOpenTimePicker(false);
      }

      if (calendarRef.current && !calendarRef.current.contains(target)) {
        setOpenCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ================= SAVE ================= */
  const handleSave = () => {
    if (!selectedDate || !appointment) return;

    const [time, period] = selectedTime.split(" ");
    let [h, m] = time.split(":").map(Number);

    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;

    const newDate = new Date(selectedDate);
    newDate.setHours(h);
    newDate.setMinutes(m);
    newDate.setSeconds(0);

    onSave(newDate.toISOString());
    onOpenChange(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setSelectedDate(null);
      setSelectedTime("08:00 AM");
    }
    onOpenChange(open);
  };


  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-[480px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Reschedule Appointment</AlertDialogTitle>
          <AlertDialogDescription>
            Choose a new date and time
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* ================= INPUT ROW ================= */}
        <div className="flex gap-2 items-center">
          {/* DATE INPUT */}
          <div ref={calendarRef} className="flex-1 relative">
            <input
              readOnly
              value={selectedDate ? formatPrettyDate(selectedDate) : ""}
              onClick={() => setOpenCalendar((p) => !p)}
              className="w-full bg-card border rounded-lg px-3 py-2 text-sm pr-10 cursor-pointer"
            />

            <CalendarIcon
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setOpenCalendar((p) => !p)}
            />

            {/* CALENDAR POPOVER */}
            {openCalendar && (
              <div className="absolute z-50 mt-2">
                <Calendar
                  selectedDate={selectedDate}
                  onSelectDate={(d) => {
                    setSelectedDate(d);
                    const slots = generateTimeSlots(d);
                    const firstValid = slots.find((t) => !t.disabled);

                    if (firstValid) {
                      setSelectedTime(firstValid.label)
                    }
                    setOpenCalendar(false);
                  }}
                />
              </div>
            )}
          </div>

          {/* TIME PICKER */}
          <div ref={timeRef} className="relative  w-[160px]">
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setOpenTimePicker((p) => !p)}
              className="w-full border bg-card rounded-lg px-3 py-2 text-sm flex items-center justify-between"
            >
              <span>{selectedTime}</span>
              <Clock size={16} className="text-gray-500" />
            </button>

            <TimePicker
              open={openTimePicker}
              value={selectedTime}
              selectedDate={selectedDate}
              onSelect={(t) => setSelectedTime(t)}
              onClose={() => setOpenTimePicker(false)}
              position="bottom"
            />
          </div>
        </div>

        {/* ================= SUMMARY ================= */}
        <div className="text-center text-xs text-muted-foreground pt-1">
          {selectedDate
            ? `${formatPrettyDate(selectedDate)} at ${selectedTime}`
            : "No schedule selected"}
        </div>

        {/* ================= ACTIONS ================= */}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSave}
          >
            Save Changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ReschedAppointment;