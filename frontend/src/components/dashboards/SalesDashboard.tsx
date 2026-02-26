import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, CheckCircle, ClipboardList, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const jobOrders = [
  { id: "JO-001", customer: "Juan Dela Cruz", vehicle: "Toyota Vios 2022", service: "PMS", amount: "₱5,500", status: "In Progress" },
  { id: "JO-002", customer: "Maria Santos", vehicle: "Honda Civic 2021", service: "Brake Pads", amount: "₱3,200", status: "Pending" },
  { id: "JO-003", customer: "Pedro Reyes", vehicle: "Ford Ranger 2023", service: "Diagnostics", amount: "₱1,500", status: "Completed" },
  { id: "JO-004", customer: "Ana Garcia", vehicle: "Mitsubishi Montero", service: "AC Repair", amount: "₱8,000", status: "In Progress" },
];

const appointmentRequests = [
  { id: 1, customer: "Robert Lim", vehicle: "Toyota Fortuner", date: "Feb 24, 2026", time: "9:00 AM", service: "Oil Change" },
  { id: 2, customer: "Grace Tan", vehicle: "Honda CR-V", date: "Feb 24, 2026", time: "2:00 PM", service: "PMS" },
  { id: 3, customer: "David Ong", vehicle: "Nissan Terra", date: "Feb 25, 2026", time: "10:00 AM", service: "Tire Change" },
];

const upcomingAppointments = [
  { date: "Feb 24", customer: "Robert Lim", time: "9:00 AM", service: "Oil Change" },
  { date: "Feb 24", customer: "Grace Tan", time: "2:00 PM", service: "PMS" },
  { date: "Feb 25", customer: "David Ong", time: "10:00 AM", service: "Tire Change" },
  { date: "Feb 26", customer: "Lisa Cruz", time: "11:00 AM", service: "Battery Replace" },
  { date: "Feb 27", customer: "Mark Sy", time: "3:00 PM", service: "AC Service" },
];

const statusColor: Record<string, string> = {
  "In Progress": "bg-primary text-primary-foreground",
  "Pending": "bg-warning text-warning-foreground",
  "Completed": "bg-success text-success-foreground",
};

const daysInMonth = 28;
const today = 23;

export function SalesDashboard() {
  const [requests, setRequests] = useState(appointmentRequests);

  const handleAction = (id: number, action: "accept" | "decline") => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    toast.success(action === "accept" ? "Appointment accepted" : "Appointment declined");
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="grid lg:grid-cols-3 gap-4 h-full">
        {/* Left side */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="animate-fade-in">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Today's Revenue</p>
                  <p className="text-xl font-bold">₱18,200</p>
                </div>
              </CardContent>
            </Card>
            <Card className="animate-fade-in">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-success/10">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Completed Today</p>
                  <p className="text-xl font-bold">5</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Job Orders */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <ClipboardList className="h-4 w-4 text-primary" />
                Job Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="px-4 py-2 text-left font-medium">Order</th>
                      <th className="px-4 py-2 text-left font-medium">Customer</th>
                      <th className="px-4 py-2 text-left font-medium hidden md:table-cell">Vehicle</th>
                      <th className="px-4 py-2 text-left font-medium hidden md:table-cell">Amount</th>
                      <th className="px-4 py-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobOrders.map((j) => (
                      <tr key={j.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-primary">{j.id}</td>
                        <td className="px-4 py-2.5">{j.customer}</td>
                        <td className="px-4 py-2.5 hidden md:table-cell text-muted-foreground">{j.vehicle}</td>
                        <td className="px-4 py-2.5 hidden md:table-cell">{j.amount}</td>
                        <td className="px-4 py-2.5">
                          <Badge className={statusColor[j.status] || ""} variant="secondary">{j.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Appointment Requests */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 text-primary" />
                Appointment Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {requests.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No pending requests</p>
              )}
              {requests.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-md bg-muted/50 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{r.customer}</p>
                    <p className="text-xs text-muted-foreground">{r.vehicle} · {r.service} · {r.date} at {r.time}</p>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-3">
                    <Button size="sm" onClick={() => handleAction(r.id, "accept")}>Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => handleAction(r.id, "decline")}>Decline</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right side - Calendar & Upcoming */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">February 2026</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <div key={i} className="py-1 text-muted-foreground font-medium">{d}</div>
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const hasAppt = [24, 25, 26, 27].includes(day);
                  return (
                    <div
                      key={day}
                      className={`py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                        day === today
                          ? "bg-primary text-primary-foreground font-bold"
                          : hasAppt
                          ? "bg-primary/20 text-primary font-medium"
                          : "hover:bg-muted"
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingAppointments.map((a, i) => (
                <div key={i} className="flex items-start gap-3 rounded-md bg-muted/50 p-3">
                  <div className="text-center shrink-0">
                    <p className="text-xs text-muted-foreground">{a.date.split(" ")[0]}</p>
                    <p className="text-lg font-bold text-primary">{a.date.split(" ")[1]}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{a.customer}</p>
                    <p className="text-xs text-muted-foreground">{a.time} · {a.service}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
