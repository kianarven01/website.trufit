// Calendar.tsx
import React, { useState, useEffect, useRef } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"; 
import { Button } from "./button";
import { Input } from "@/components/ui/input"; 
import { cn } from "@/lib/utils";

interface CalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  placeholder?: string;
}

const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelectDate, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const modalRef = useRef<HTMLDivElement>(null);

  const toggleModal = () => setIsOpen(!isOpen);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  const prevMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onSelectDate(newDate);
    setIsOpen(false);
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <div className="relative w-full">
      {/* Input box with calendar icon */}
      <div
        className="flex items-center w-full cursor-pointer"
        onClick={toggleModal}
      >
        <Input
          readOnly
          value={selectedDate ? selectedDate.toLocaleDateString() : ""}
          placeholder={placeholder || "Select Date"}
          className="pr-8 cursor-pointer"
        />
        <CalendarIcon className="absolute right-2 w-5 h-5 text-gray-500 pointer-events-none" />
      </div>

      {/* Calendar modal */}
      {isOpen && (
        <div
          ref={modalRef}
          className="absolute mt-1 bg-white border rounded-lg shadow-lg p-4 z-50 w-full"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <Button
              size={"icon_xs"}
              variant="outline"
              onClick={prevMonth}
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="font-medium">
              {currentMonth.toLocaleString("default", { month: "long" })}{" "}
              {currentMonth.getFullYear()}
            </div>
            <Button
              size={"icon_xs"}
              variant="outline"
              onClick={nextMonth}
              aria-label="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-x-3 text-center text-sm text-gray-500 font-light tracking-wide mb-1">
            {daysOfWeek.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-7 gap-3 text-sm text-center">
            {Array.from({ length: startDay }).map((_, idx) => (
              <div key={`empty-${idx}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    "px-2 py-1 rounded-lg hover:bg-blue-200 transition-colors",
                    isSelected(day) ? "bg-blue-500 text-white font-semibold" : ""
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};