import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, ClipboardList, DollarSign, Package, Wrench, Activity } from "lucide-react";

const stats = [
  { label: "Vehicles in Service", value: "12", icon: Car, change: "+3 today" },
  { label: "Active Job Orders", value: "8", icon: ClipboardList, change: "5 in progress" },
  { label: "Daily Revenue", value: "₱45,280", icon: DollarSign, change: "+12% vs yesterday" },
  { label: "Low-Stock Items", value: "6", icon: Package, change: "Action needed" },
];

const activeJobs = [
  { id: "JO-001", vehicle: "Toyota Vios 2022", service: "Oil Change + PMS", status: "In Progress", tech: "Mike" },
  { id: "JO-002", vehicle: "Honda Civic 2021", service: "Brake Pad Replacement", status: "Waiting Parts", tech: "John" },
  { id: "JO-003", vehicle: "Ford Ranger 2023", service: "Engine Diagnostics", status: "In Progress", tech: "Carlos" },
  { id: "JO-004", vehicle: "Mitsubishi Montero 2020", service: "AC Repair", status: "Completed", tech: "Mike" },
  { id: "JO-005", vehicle: "Nissan Navara 2022", service: "Tire Rotation + Alignment", status: "Queued", tech: "John" },
];

const topServices = [
  { name: "Oil Change", count: 42 },
  { name: "PMS", count: 35 },
  { name: "Brake Service", count: 28 },
  { name: "Tire Service", count: 22 },
  { name: "AC Service", count: 18 },
];

const departments = [
  { name: "Service Bay", active: 4, total: 6 },
  { name: "Body Shop", active: 2, total: 3 },
  { name: "Parts Dept", active: 1, total: 2 },
];

const statusColor: Record<string, string> = {
  "In Progress": "bg-primary text-primary-foreground",
  "Waiting Parts": "bg-warning text-warning-foreground",
  "Completed": "bg-success text-success-foreground",
  "Queued": "bg-secondary text-secondary-foreground",
};

export function AdminDashboard() {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="animate-fade-in">
            <CardContent className="flex items-start gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.change}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Active Jobs */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ClipboardList className="h-4 w-4 text-primary" />
              Active Job Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="px-4 py-2 text-left font-medium">Order</th>
                    <th className="px-4 py-2 text-left font-medium">Vehicle</th>
                    <th className="px-4 py-2 text-left font-medium hidden md:table-cell">Service</th>
                    <th className="px-4 py-2 text-left font-medium">Status</th>
                    <th className="px-4 py-2 text-left font-medium hidden lg:table-cell">Tech</th>
                  </tr>
                </thead>
                <tbody>
                  {activeJobs.map((job) => (
                    <tr key={job.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-primary">{job.id}</td>
                      <td className="px-4 py-2.5">{job.vehicle}</td>
                      <td className="px-4 py-2.5 hidden md:table-cell text-muted-foreground">{job.service}</td>
                      <td className="px-4 py-2.5">
                        <Badge className={statusColor[job.status] || ""} variant="secondary">
                          {job.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 hidden lg:table-cell text-muted-foreground">{job.tech}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-4">
          {/* Top Services */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Wrench className="h-4 w-4 text-primary" />
                Top Services (Monthly)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topServices.map((s, i) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{s.name}</span>
                      <span className="text-xs text-muted-foreground">{s.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${(s.count / 42) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Department Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4 text-primary" />
                Department Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {departments.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <span className="text-sm">{d.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{d.active}/{d.total} active</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: d.total }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-2 rounded-full ${i < d.active ? "bg-success" : "bg-muted"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Revenue row */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-primary" />
            Revenue Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { period: "Today", amount: "₱45,280" },
              { period: "This Week", amount: "₱218,450" },
              { period: "This Month", amount: "₱892,310" },
              { period: "This Year", amount: "₱8,245,600" },
            ].map((r) => (
              <div key={r.period} className="text-center p-3 rounded-md bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">{r.period}</p>
                <p className="text-lg font-bold text-foreground">{r.amount}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
