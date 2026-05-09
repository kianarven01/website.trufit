import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Money03Icon,
  Task01Icon,
  UserGroupIcon,
  PackageIcon,
  Calendar03Icon,
  Activity01Icon,
  Car01Icon,
  ChartLineData01Icon,
  DocumentValidationIcon,
  ShoppingCart01Icon,
  Estimate01Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  CartesianGrid
} from "recharts";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const monthlyRevenue = [
  { month: "Jun", value: 312000 },
  { month: "Jul", value: 285000 },
  { month: "Aug", value: 340000 },
  { month: "Sep", value: 298000 },
  { month: "Oct", value: 375000 },
  { month: "Nov", value: 420000 },
  { month: "Dec", value: 510000 },
  { month: "Jan", value: 388000 },
  { month: "Feb", value: 405000 },
  { month: "Mar", value: 445000 },
  { month: "Apr", value: 390000 },
  { month: "May", value: 467500 },
];

const topProducts = [
  { name: "Synthetic Engine Oil 5W-30", sold: 45, total: "₱22,500" },
  { name: "Premium Brake Pads (Front)", sold: 28, total: "₱18,200" },
  { name: "Wiper Blades (Set)", sold: 34, total: "₱15,300" },
  { name: "Cabin Air Filter", sold: 22, total: "₱11,000" },
  { name: "Spark Plugs (Iridium)", sold: 40, total: "₱9,600" },
];

const lowStockItems = [
  { name: "Brake Pads (Front)", remaining: 2 },
  { name: "Engine Oil 5W-30", remaining: 5 },
  { name: "Cabin Air Filter", remaining: 3 },
];

const pendingInvoices = [
  { id: "SO-8841", customer: "Mark Sy", amount: "₱42,100", days: 5 },
  { id: "SO-8836", customer: "Grace Tan", amount: "₱18,500", days: 12 },
  { id: "SO-8829", customer: "David Ong", amount: "₱9,800", days: 18 },
];

const activeJobOrders = [
  { id: "JO-1021", vehicle: "Toyota Fortuner", status: "In Progress", mechanic: "Mike" },
  { id: "JO-1022", vehicle: "Honda Civic", status: "Waiting Parts", mechanic: "Leo" },
  { id: "JO-1023", vehicle: "Ford Ranger", status: "Final QC", mechanic: "Dave" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const KpiCard = ({
  label,
  value,
  sub,
  icon,
  positive,
}: {
  label: string;
  value: string;
  sub: string;
  icon: any;
  positive?: boolean;
}) => (
  <Card className="border-border/40 shadow-none">
    <CardContent className="p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
          <HugeiconsIcon icon={icon} size={16} />
        </div>
      </div>
      <p className="text-2xl font-semibold text-foreground tracking-tight">{value}</p>
      <p
        className={`text-xs mt-1.5 font-medium ${
          positive === true
            ? "text-emerald-600"
            : positive === false
            ? "text-rose-500"
            : "text-muted-foreground"
        }`}
      >
        {sub}
      </p>
    </CardContent>
  </Card>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-foreground text-background px-3 py-1.5 rounded-md shadow-xl text-xs font-semibold flex flex-col items-center">
        <span className="text-[10px] text-background/70 mb-0.5">{label}</span>
        <span>₱{(payload[0].value / 1000).toFixed(0)}k</span>
      </div>
    );
  }
  return null;
};

const RevenueChart = () => {
  const currentMonth = monthlyRevenue[monthlyRevenue.length - 1];
  const prevMonth = monthlyRevenue[monthlyRevenue.length - 2];
  const growth = (((currentMonth.value - prevMonth.value) / prevMonth.value) * 100).toFixed(1);
  const isUp = currentMonth.value >= prevMonth.value;

  return (
    <Card className="border-border/40 shadow-none h-full flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between pb-6 pt-5 px-6">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Monthly Revenue</p>
          <p className="text-2xl font-semibold text-foreground tracking-tight">
            ₱{(currentMonth.value / 1000).toFixed(0)}k
          </p>
          <div className={`flex items-center gap-1 mt-1 ${isUp ? "text-emerald-600" : "text-rose-500"}`}>
            <HugeiconsIcon icon={ChartLineData01Icon} size={13} />
            <span className="text-xs font-medium">
              {isUp ? "+" : ""}{growth}% vs last month
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select className="text-xs bg-muted/40 border border-border/40 rounded px-2 py-1 text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50">
            <option>Last 12 Months</option>
            <option>Last 6 Months</option>
            <option>This Year</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0 flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
              dy={10} 
              minTickGap={20}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              activeDot={{ r: 5, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"appointments" | "jobOrders">("appointments");

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="w-full p-6 md:p-8 space-y-6">

        {/* ── KPI Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Revenue This Month"
            value="₱467,500"
            sub="↑ 19.9% vs April"
            icon={Money03Icon}
            positive={true}
          />
          <KpiCard
            label="Jobs This Month"
            value="89 orders"
            sub="↑ 12 more than April"
            icon={Task01Icon}
            positive={true}
          />
          <KpiCard
            label="Outstanding Invoices"
            value="₱70,400"
            sub="3 unpaid orders"
            icon={DocumentValidationIcon}
            positive={false}
          />
          <KpiCard
            label="Cars in Shop Today"
            value="7 vehicles"
            sub="1 bay available"
            icon={Car01Icon}
          />
        </div>

        {/* ── Revenue Chart + Today's Ops ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:min-h-[320px]">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 h-full">
            <RevenueChart />
          </div>

          {/* Today's Ops Summary */}
          <Card className="border-border/40 shadow-none h-full flex flex-col">
            <CardHeader className="pb-3 pt-5 px-5">
              <CardTitle className="text-sm font-semibold text-foreground">
                Today at the Shop
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 flex-1 flex flex-col space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium">Workshop Bays</p>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((bay) => (
                    <div
                      key={bay}
                      className={`h-8 rounded flex items-center justify-center text-[10px] font-semibold ${
                        bay <= 5
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-muted/40 text-muted-foreground border border-border/30"
                      }`}
                    >
                      {bay <= 5 ? `Bay ${bay} (Occ)` : `Bay ${bay} (Free)`}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-3">5 of 6 bays occupied</p>
              </div>

              <div className="border-t border-border/20 pt-4 flex-1 flex flex-col">
                <div className="bg-muted/40 p-0.5 rounded-md flex items-center mb-3">
                  <button
                    onClick={() => setActiveTab("appointments")}
                    className={`flex-1 text-[10px] font-semibold py-1.5 rounded transition-all ${
                      activeTab === "appointments" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Appointments
                  </button>
                  <button
                    onClick={() => setActiveTab("jobOrders")}
                    className={`flex-1 text-[10px] font-semibold py-1.5 rounded transition-all ${
                      activeTab === "jobOrders" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Job Orders
                  </button>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                  {activeTab === "appointments" ? (
                    [
                      { time: "8:00 AM", name: "Juan D.", service: "PMS" },
                      { time: "10:00 AM", name: "Maria S.", service: "Wheel Align" },
                      { time: "2:00 PM", name: "Robert L.", service: "AC Repair" },
                    ].map((a) => (
                      <div key={a.time} className="flex items-center justify-between py-1.5 border-b border-border/10 last:border-0">
                        <div>
                          <p className="text-xs font-medium text-foreground">{a.name}</p>
                          <p className="text-[10px] text-muted-foreground">{a.service}</p>
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                          {a.time}
                        </span>
                      </div>
                    ))
                  ) : (
                    activeJobOrders.map((jo) => (
                      <div key={jo.id} className="flex items-center justify-between py-1.5 border-b border-border/10 last:border-0">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-medium text-foreground">{jo.vehicle}</p>
                            <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm">
                              {jo.id}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Mech: {jo.mechanic}</p>
                        </div>
                        <span className="text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">
                          {jo.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Bottom Row: Top Products / Unpaid / Low Stock ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-6 lg:min-h-[280px]">
          {/* Top Products */}
          <Card className="border-border/40 shadow-none h-full flex flex-col">
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-foreground">Top Products</CardTitle>
                <HugeiconsIcon icon={ShoppingCart01Icon} size={15} className="text-muted-foreground" />
              </div>
              <p className="text-[10px] text-muted-foreground">By revenue this month</p>
            </CardHeader>
            <CardContent className="px-5 pb-5 flex-1 space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-[10px] font-semibold text-muted-foreground/50 w-4 text-right">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.sold} units sold</p>
                  </div>
                  <span className="text-xs font-semibold text-foreground">{p.total}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Outstanding Invoices */}
          <Card className="border-border/40 shadow-none h-full flex flex-col">
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-foreground">Unpaid Invoices</CardTitle>
                <HugeiconsIcon icon={Estimate01Icon} size={15} className="text-muted-foreground" />
              </div>
              <p className="text-[10px] text-muted-foreground">Awaiting payment collection</p>
            </CardHeader>
            <CardContent className="px-5 pb-5 flex-1 flex flex-col">
              <div className="flex-1 space-y-3">
                {pendingInvoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between py-2 border-b border-border/15 last:border-0">
                    <div>
                      <p className="text-xs font-medium text-foreground">{inv.customer}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {inv.id} · {inv.days}d overdue
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        inv.days > 10 ? "text-rose-500" : "text-amber-500"
                      }`}
                    >
                      {inv.amount}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-border/20 mt-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-medium">Total Outstanding</p>
                  <p className="text-sm font-semibold text-foreground">₱70,400</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card className="border-border/40 shadow-none h-full flex flex-col">
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-foreground">Low Stock Alerts</CardTitle>
                <HugeiconsIcon icon={PackageIcon} size={15} className="text-muted-foreground" />
              </div>
              <p className="text-[10px] text-muted-foreground">Parts needing replenishment</p>
            </CardHeader>
            <CardContent className="px-5 pb-5 flex-1 flex flex-col">
              <div className="flex-1 space-y-3">
                {lowStockItems.map((item) => (
                  <div key={item.name} className="flex items-center justify-between py-2 border-b border-border/15 last:border-0">
                    <p className="text-xs font-medium text-foreground">{item.name}</p>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        item.remaining <= 3
                          ? "bg-rose-50 text-rose-600 border border-rose-100"
                          : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}
                    >
                      {item.remaining} left
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-border/20 mt-4 flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                <p className="text-[10px] text-muted-foreground">
                  2 items critically low — order soon
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
