import React, { useState, useEffect } from "react";
import api from "@/api/axios";
import RoleManager from "@/components/admin/RoleManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  ClipboardList,
  DollarSign,
  Package,
  Wrench,
  Activity,
  Plus,
} from "lucide-react";

const stats = [
  { label: "Vehicles in Service", value: "12", icon: Car, change: "+3 today" },
  {
    label: "Active Job Orders",
    value: "8",
    icon: ClipboardList,
    change: "5 in progress",
  },
  {
    label: "Daily Revenue",
    value: "₱45,280",
    icon: DollarSign,
    change: "+12% vs yesterday",
  },
  {
    label: "Low-Stock Items",
    value: "6",
    icon: Package,
    change: "Action needed",
  },
];

const activeJobs = [
  {
    id: "JO-001",
    vehicle: "Toyota Vios 2022",
    service: "Oil Change + PMS",
    status: "In Progress",
    tech: "Mike",
  },
  {
    id: "JO-002",
    vehicle: "Honda Civic 2021",
    service: "Brake Pad Replacement",
    status: "Waiting Parts",
    tech: "John",
  },
  {
    id: "JO-003",
    vehicle: "Ford Ranger 2023",
    service: "Engine Diagnostics",
    status: "In Progress",
    tech: "Carlos",
  },
  {
    id: "JO-004",
    vehicle: "Mitsubishi Montero 2020",
    service: "AC Repair",
    status: "Completed",
    tech: "Mike",
  },
];

const statusColor: Record<string, string> = {
  "In Progress": "bg-primary text-primary-foreground",
  "Waiting Parts": "bg-warning text-warning-foreground",
  Completed: "bg-success text-success-foreground",
  Queued: "bg-secondary text-secondary-foreground",
};

const AdminDashboard: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-start gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
