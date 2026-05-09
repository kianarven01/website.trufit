import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scrollArea";
import { cn } from "@/lib/utils";

/* =========================================================
   SHARED HELPERS
========================================================= */

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const monthsFull = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const createSafeDate = (y: number, m: number, d: number) =>
  new Date(y, m, d, 12);

/* =========================================================
   CALENDAR
========================================================= */

interface CalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const [openPicker, setOpenPicker] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const pickerRef = useRef<HTMLDivElement>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const years = Array.from({ length: 21 }, (_, i) => year - 10 + i);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const isPast = (date: Date) => date < startOfToday;

  const isSameDate = (a: Date | null, b: Date) =>
    a &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const handleDateClick = (date: Date) => {
    if (isPast(date) || date.getDay() === 0) return;
    onSelectDate(date);
    setCurrentDate(date);
    setOpenPicker(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (openPicker && pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setOpenPicker(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openPicker]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const totalCells = 42;
  const remaining = totalCells - (firstDay + daysInMonth);

  return (
    <div className="w-[260px] bg-white border rounded-xl shadow-sm overflow-hidden">

      {/* HEADER */}
      <div className="relative flex items-center justify-between px-3 py-2 border-b">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1, 1, 12))}
          className="p-1 rounded hover:bg-gray-100"
        >
          <ChevronLeft size={16} />
        </button>

        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => setOpenPicker((p) => !p)}
          className="text-xs font-medium hover:text-indigo-600"
        >
          {monthsFull[month]} {year}
        </button>

        <button
          onClick={() => setCurrentDate(new Date(year, month + 1, 1, 12))}
          className="p-1 rounded hover:bg-gray-100"
        >
          <ChevronRight size={16} />
        </button>

        {openPicker && (
          <div
            ref={pickerRef}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-[240px] bg-card border rounded-lg shadow-lg p-2 z-50"
          >
            <div className="flex gap-2">

              <div className="flex-1">
                <p className="text-[10px] text-gray-400 mb-1">Month</p>
                <div className="grid grid-cols-2 gap-1 max-h-36 overflow-y-auto">
                  {monthsFull.map((m, i) => (
                    <button
                      key={m}
                      onClick={() => setCurrentDate(new Date(year, i, 1, 12))}
                      className="text-xs px-2 py-1 rounded hover:bg-indigo-50 text-left"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-16">
                <p className="text-[10px] text-gray-400 mb-1">Year</p>
                <div className="flex flex-col gap-1 max-h-36 overflow-y-auto">
                  {years.map((y) => (
                    <button
                      key={y}
                      onClick={() => setCurrentDate(new Date(y, month, 1, 12))}
                      className="text-xs px-2 py-1 rounded hover:bg-indigo-50"
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* WEEK */}
      <div className="grid grid-cols-7 text-[10px] text-gray-400 text-center py-1">
        {daysOfWeek.map((d) => <div key={d}>{d}</div>)}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-7 gap-y-1 gap-x-1 pr-0.5 pl-0.5 pb-2 justify-items-center">

        {[...Array(firstDay)].map((_, i) => {
          const day = prevMonthDays - firstDay + i + 1;
          const date = createSafeDate(year, month - 1, day);
          const disabled = isPast(date) || date.getDay() === 0;
          const selected = isSameDate(selectedDate, date);

          return (
            <button key={i}
              disabled={disabled}
              onClick={() => handleDateClick(date)}
              className={cn("h-7 w-7 text-xs rounded-md",
                disabled ? "text-gray-300" : "hover:bg-gray-100",
                selected && "bg-indigo-600 text-white")}
            >
              {day}
            </button>
          );
        })}

        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const date = createSafeDate(year, month, day);
          const disabled = isPast(date) || date.getDay() === 0;
          const selected = isSameDate(selectedDate, date);

          return (
            <button key={day}
              disabled={disabled}
              onClick={() => handleDateClick(date)}
              className={cn("h-7 w-7 text-xs rounded-md",
                disabled ? "text-gray-300" : "hover:bg-indigo-50",
                selected && "bg-indigo-600 text-white")}
            >
              {day}
            </button>
          );
        })}

        {[...Array(remaining)].map((_, i) => {
          const day = i + 1;
          const date = createSafeDate(year, month + 1, day);
          const disabled = isPast(date) || date.getDay() === 0;
          const selected = isSameDate(selectedDate, date);

          return (
            <button key={i}
              disabled={disabled}
              onClick={() => handleDateClick(date)}
              className={cn("h-7 w-7 text-xs rounded-md",
                disabled ? "text-gray-300" : "hover:bg-gray-100",
                selected && "bg-indigo-600 text-card")}
            >
              {day}
            </button>
          );
        })}

      </div>
    </div>
  );
};

/* =========================================================
   TIME PICKER
========================================================= */

interface TimePickerProps {
  open: boolean;
  value: string;
  selectedDate: Date | null;
  onSelect: (time: string) => void;
  onClose: () => void;
  position: "bottom" | "top";
}


const roundToNext5Min = (date: Date) => {
  const ms = 1000 * 60 * 5;
  return new Date(Math.ceil(date.getTime() / ms) * ms);
};

/* =========================================================
   TIME GENERATOR (SMART + DISABLED PAST)
========================================================= */

export const generateTimeSlots = (selectedDate: Date | null) => {
  const slots: { label: string; disabled: boolean }[] = [];

  const now = new Date();

  const start = new Date();
  start.setHours(8, 0, 0, 0);

  const end = new Date();
  end.setHours(16, 30, 0, 0);

  const isToday =
    selectedDate &&
    selectedDate.toDateString() === now.toDateString();

  const minAllowed = isToday ? roundToNext5Min(now) : start;

  const cursor = new Date(start);

  while (cursor <= end) {
    const disabled = cursor < minAllowed;

    let h = cursor.getHours();
    const m = cursor.getMinutes();

    const period = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;

    const label = `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )} ${period}`;

    slots.push({
      label,
      disabled,
    });

    cursor.setMinutes(cursor.getMinutes() + 5);
  }

  return slots;
};

/* =========================================================
   COMPONENT
========================================================= */

export const TimePicker: React.FC<TimePickerProps> = ({
  open,
  value,
  selectedDate,
  onSelect,
  onClose,
  position = "bottom",
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const timeSlots = React.useMemo(
    () => generateTimeSlots(selectedDate),
    [selectedDate]
  );

  /* close on outside click */
  useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  /* auto-fix invalid selected time */
  useEffect(() => {
    if (!open) return;

    const firstValid = timeSlots.find((t) => !t.disabled);

    const currentInvalid = timeSlots.find(
      (t) => t.label === value && t.disabled
    );

    if (currentInvalid && firstValid) {
      onSelect(firstValid.label);
    }
  }, [selectedDate, open, value, onSelect, timeSlots]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute right-0 w-[160px] bg-card border rounded-lg shadow-lg z-50",
        position === "bottom" && "top-full mt-2",
        position === "top" && "bottom-full mb-2"
      )}
    >
      <ScrollArea className="h-64 py-1 pl-1 pr-2.5">
        <div className="space-y-1">
          {timeSlots.map((t) => (
            <button
              key={t.label}
              disabled={t.disabled}
              onClick={() => {
                if (t.disabled) return;
                onSelect(t.label);
                onClose();
                
              }}
              className={cn(
                "w-full text-xs px-2 py-2 rounded-md text-left transition",
                t.disabled
                  ? "text-gray-300 cursor-not-allowed"
                  : "hover:bg-indigo-50",
                value === t.label && "bg-blue-600 text-white"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};