import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  date: Date;
  status: string;
}

interface CalendarProps {
  mode?: "single" | "range";
  value?: Date | null;
  onSelect?: (data: any) => void;

  events?: CalendarEvent[];
  statusColors?: Record<string, string>;

  isDateDisabled?: (date: Date) => boolean;
}

const Calendar: React.FC<CalendarProps> = ({
  mode = "single",
  value,
  onSelect,
  events = [],
  statusColors = {
    confirmed: "bg-green-500",
    pending: "bg-yellow-400",
    cancelled: "bg-red-500",
  },
  isDateDisabled,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [openPicker, setOpenPicker] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  const pickerRef = useRef<HTMLDivElement>(null);

  const daysOfWeek = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const years = Array.from({ length: 21 }, (_, i) => year - 10 + i);

  /* ================= HELPERS ================= */

  const isSameDay = (d1: Date | null, d2: Date | null) => {
    if (!d1 || !d2) return false;
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const isRangeSelected = (date: Date) => {
    if (!range.start || !range.end) return false;
    return date > range.start && date < range.end;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(
      (e) =>
        e.date.getDate() === date.getDate() &&
        e.date.getMonth() === date.getMonth() &&
        e.date.getFullYear() === date.getFullYear()
    );
  };

  /* ================= HANDLERS ================= */

  const handlePrevMonth = () =>
    setCurrentDate(new Date(year, month - 1, 1));

  const handleNextMonth = () =>
    setCurrentDate(new Date(year, month + 1, 1));

  const setMonthYear = (m: number, y: number) => {
    setCurrentDate(new Date(y, m, 1));
    setOpenPicker(false);
  };

  useEffect(() => {
    if (mode === "single") {
      setSelectedDate(value ?? null);
    }
  }, [value, mode]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setOpenPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleDateClick = (date: Date) => {
    if (isDateDisabled?.(date) || date.getDay() === 0) return;

    if (mode === "single") {
      if (selectedDate && isSameDay(date, selectedDate)) {
        setSelectedDate(null);
        onSelect?.(null);
        return;
      }

      setSelectedDate(date);
      onSelect?.(date);
      return;
    }

    if (!range.start || range.end) {
      setRange({ start: date, end: null });
      onSelect?.({ start: date, end: null });
    } else {
      const newRange =
        date < range.start
          ? { start: date, end: range.start }
          : { start: range.start, end: date };

      setRange(newRange);
      onSelect?.(newRange);
    }
  };

  const totalCells = 42;
  const remainingCells = totalCells - (firstDayOfMonth + daysInMonth);

  return (
    <div className="w-full max-w-[360px] bg-card border border-border/60 rounded-2xl shadow-md overflow-hidden">

      {/* HEADER */}
      <div className="relative flex items-center justify-between px-4 py-3 border-b border-border/50">
        <button onClick={handlePrevMonth} className="p-1 rounded hover:bg-accent text-foreground transition-colors">
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={() => setOpenPicker(!openPicker)}
          className="text-sm font-medium hover:text-primary transition-colors text-foreground"
        >
          {months[month]} {year}
        </button>

        <button onClick={handleNextMonth} className="p-1 rounded hover:bg-accent text-foreground transition-colors">
          <ChevronRight size={18} />
        </button>

        {/* PICKER */}
        {openPicker && (
          <div
            ref={pickerRef}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-[320px] bg-card border border-border/60 rounded-xl shadow-lg z-50 p-3"
          >
            <div className="flex gap-3">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-2">Month</p>
                <div className="grid grid-cols-2 gap-1 max-h-44 overflow-y-auto">
                  {months.map((m, i) => (
                    <button
                      key={m}
                      onClick={() => setMonthYear(i, year)}
                      className={cn(
                        "text-xs px-2 py-1 rounded-md text-left transition-colors",
                        i === month
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent text-foreground"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-24">
                <p className="text-xs text-muted-foreground mb-2">Year</p>
                <div className="flex flex-col gap-1 max-h-44 overflow-y-auto">
                  {years.map((y) => (
                    <button
                      key={y}
                      onClick={() => setMonthYear(month, y)}
                      className={cn(
                        "text-xs px-2 py-1 rounded-md transition-colors",
                        y === year
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent text-foreground"
                      )}
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

      {/* WEEKDAYS */}
      <div className="grid grid-cols-7 text-[11px] text-muted-foreground text-center py-2 bg-muted/20">
        {daysOfWeek.map((d) => <div key={d}>{d}</div>)}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-7 gap-y-1 px-2 pb-3 pt-1">

        {/* PREV MONTH DAYS */}
        {[...Array(firstDayOfMonth)].map((_, i) => {
          const day = prevMonthDays - firstDayOfMonth + i + 1;
          const date = new Date(year, month - 1, day);
          const disabled = date.getDay() === 0;

          return (
            <button
              key={`prev-${i}`}
              disabled={disabled}
              onClick={() => {
                setCurrentDate(new Date(year, month - 1, 1));
                handleDateClick(date);
              }}
              className={cn(
                "h-9 w-9 mx-auto text-sm rounded-lg transition-colors",
                disabled
                  ? "text-muted-foreground/20 cursor-not-allowed"
                  : "text-muted-foreground/40 hover:bg-accent"
              )}
            >
              {day}
            </button>
          );
        })}

        {/* CURRENT MONTH DAYS */}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const date = new Date(year, month, day);

          const selected =
            mode === "single"
              ? isSameDay(date, selectedDate)
              : isSameDay(date, range.start) || isSameDay(date, range.end);

          const inRange = isRangeSelected(date);
          const disabled = isDateDisabled?.(date) || date.getDay() === 0;
          const dayEvents = getEventsForDate(date);

          return (
            <div key={day} className="relative flex flex-col items-center">
              <button
                onClick={() => handleDateClick(date)}
                disabled={disabled}
                className={cn(
                  "h-9 w-9 rounded-lg text-sm transition-colors",
                  selected && "bg-primary text-primary-foreground font-semibold",
                  inRange && !selected && "bg-primary/20 text-primary",
                  disabled && "opacity-20 cursor-not-allowed",
                  !selected && !disabled && "hover:bg-accent text-foreground"
                )}
              >
                {day}
              </button>

              {dayEvents.length > 0 && (
                <div className="flex gap-[2px] mt-[2px]">
                  {dayEvents.slice(0, 3).map((e, idx) => (
                    <span
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full ${statusColors[e.status] || "bg-muted-foreground"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* NEXT MONTH DAYS */}
        {[...Array(remainingCells)].map((_, i) => {
          const day = i + 1;
          const date = new Date(year, month + 1, day);
          const disabled = date.getDay() === 0;

          return (
            <button
              key={`next-${i}`}
              disabled={disabled}
              onClick={() => {
                setCurrentDate(new Date(year, month + 1, 1));
                handleDateClick(date);
              }}
              className={cn(
                "h-9 w-9 mx-auto text-sm rounded-lg transition-colors",
                disabled
                  ? "text-muted-foreground/20 cursor-not-allowed"
                  : "text-muted-foreground/40 hover:bg-accent"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;