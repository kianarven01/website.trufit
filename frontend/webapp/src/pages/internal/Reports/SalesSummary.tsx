import React, { useState, useEffect, useMemo } from "react";
import api from "@/api/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  FileText,
  RefreshCw,
  Calendar,
  Printer,
} from "lucide-react";

const SalesSummary: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<"all" | "service" | "part" | "supply">("all");

  const today = new Date().toISOString().split("T")[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(monthStart);
  const [endDate, setEndDate] = useState(today);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/reports/sales?start_date=${startDate}&end_date=${endDate}`);
      if (response.data?.status === "success") {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Failed to load sales report");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

  const filteredServices = useMemo(() => {
    const items = data?.top_services || [];
    if (typeFilter === "all") return items;
    return items.filter((item: any) => item.type === typeFilter);
  }, [data, typeFilter]);

  const summaryCards = [
    { title: "Total Revenue", value: `\u20B1${(data?.summary?.total_sales || 0).toLocaleString()}`, icon: DollarSign },
    { title: "Total Orders", value: (data?.summary?.total_orders || 0).toLocaleString(), icon: ShoppingCart },
    { title: "Completed Orders", value: (data?.summary?.completed_orders || 0).toLocaleString(), icon: FileText },
    { title: "Average Order Value", value: `\u20B1${(data?.summary?.average_order_value || 0).toLocaleString()}`, icon: TrendingUp },
  ];

  const handlePrint = () => window.print();

  return (
    <div className="w-full h-full overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-end gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-[150px] h-8 text-xs" />
          </div>
          <span className="text-muted-foreground text-xs">to</span>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-[150px] h-8 text-xs" />
        </div>
        <Button variant="outline" size="sm" onClick={handlePrint} className="h-8">
          <Printer className="h-3.5 w-3.5 mr-1" />Print
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-xl font-bold mt-1">{card.value}</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <card.icon className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Revenue Over Time</CardTitle>
            <CardDescription className="text-xs">Daily revenue trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : (data?.daily_sales || []).length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No sales data for this period</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.daily_sales || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(val: number) => `\u20B1${val.toLocaleString()}`} />
                    <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Top Selling Items</CardTitle>
                <CardDescription className="text-xs">By revenue for selected period</CardDescription>
              </div>
              <div className="flex gap-1">
                    {(["all", "service", "part", "supply"] as const).map((t) => (
                      <Button key={t} variant={typeFilter === t ? "default" : "ghost"} size="sm" onClick={() => setTypeFilter(t)} className="h-7 text-[11px] px-2 capitalize">
                        {t === "all" ? "All" : t === "supply" ? "Supplies" : t + "s"}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No {typeFilter === "all" ? "" : typeFilter + " "}data for this period</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredServices.slice(0, 8)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
                    <Tooltip
                      formatter={(val: number) => [`\u20B1${val.toLocaleString()}`, "Revenue"]}
                    />
                    <Bar dataKey="total_revenue" radius={[0, 4, 4, 0]}>
                      {filteredServices.slice(0, 8).map((item: any, idx: number) => (
                        <Cell
                          key={idx}
                          fill={item.type === "service" ? "#8b5cf6" : item.type === "supply" ? "#f59e0b" : "#2563eb"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Sales by Order Type</CardTitle>
          <CardDescription className="text-xs">Breakdown of sales by order category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-muted-foreground">Type</th>
                  <th className="text-center py-2 font-medium text-muted-foreground">Orders</th>
                  <th className="text-center py-2 font-medium text-muted-foreground">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {(data?.sales_by_type || []).map((item: any, idx: number) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-2.5 font-medium capitalize">{item.type}</td>
                    <td className="py-2.5 text-center">{item.count}</td>
                    <td className="py-2.5 text-center font-medium">{'\u20B1'}{(item.total || 0).toLocaleString()}</td>
                  </tr>
                ))}
                {(!data?.sales_by_type || data.sales_by_type.length === 0) && (
                  <tr><td colSpan={3} className="py-8 text-center text-muted-foreground text-sm">No data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Itemized Sales</CardTitle>
              <CardDescription className="text-xs">{typeFilter === "all" ? "All items" : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1) + "s only"} - {filteredServices.length} items</CardDescription>
            </div>
            <div className="flex gap-1">
              {(["all", "service", "part", "supply"] as const).map((t) => (
                <Button key={t} variant={typeFilter === t ? "default" : "ghost"} size="sm" onClick={() => setTypeFilter(t)} className="h-7 text-[11px] px-2 capitalize">
                  {t === "all" ? "All" : t === "supply" ? "Supplies" : t + "s"}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-muted-foreground">Item Name</th>
                  <th className="text-center py-2 font-medium text-muted-foreground">Type</th>
                  <th className="text-center py-2 font-medium text-muted-foreground">Qty Sold</th>
                  <th className="text-center py-2 font-medium text-muted-foreground">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((item: any, idx: number) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-2.5 font-medium">{item.name}</td>
                    <td className="py-2.5 text-center capitalize">{item.type}</td>
                    <td className="py-2.5 text-center">{item.times_sold}</td>
                    <td className="py-2.5 text-center font-medium">{'\u20B1'}{(item.total_revenue || 0).toLocaleString()}</td>
                  </tr>
                ))}
                {filteredServices.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-muted-foreground text-sm">No items found for this filter</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesSummary;
