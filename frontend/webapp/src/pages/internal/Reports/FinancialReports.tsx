import React, { useState, useEffect } from "react";
import api from "@/api/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  RefreshCw,
  Printer,
} from "lucide-react";

const getStartDate = (period: string): string => {
  const now = new Date();
  if (period === "quarterly") {
    const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    return quarterStart.toISOString().split("T")[0];
  }
  if (period === "yearly") {
    return `${now.getFullYear()}-01-01`;
  }
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
};

const getEndDate = (): string => {
  return new Date().toISOString().split("T")[0];
};

const FinancialReports: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<"monthly" | "quarterly" | "yearly">("monthly");

  useEffect(() => {
    fetchReport();
  }, [period]);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/reports/financial?start_date=${getStartDate(period)}&end_date=${getEndDate()}`);
      if (response.data?.status === "success") {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Failed to load financial report");
    } finally {
      setIsLoading(false);
    }
  };

  const summaryCards = [
    {
      title: "Total Revenue",
      value: `₱${(data?.summary?.total_revenue || 0).toLocaleString()}`,
      icon: DollarSign,
    },
    {
      title: "Total Collected",
      value: `₱${(data?.summary?.total_paid || 0).toLocaleString()}`,
      icon: CreditCard,
    },
    {
      title: "Outstanding Balance",
      value: `₱${(data?.summary?.outstanding_balance || 0).toLocaleString()}`,
      icon: TrendingDown,
    },
    {
      title: "Collection Rate",
      value: `${(data?.summary?.collection_rate || 0).toFixed(1)}%`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="w-full h-full overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-end gap-2">
        <div className="flex border rounded-lg overflow-hidden">
          {(["monthly", "quarterly", "yearly"] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? "default" : "ghost"}
              size="sm"
              onClick={() => setPeriod(p)}
              className="rounded-none border-0"
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="h-8">
          <Printer className="h-3.5 w-3.5 mr-1" />
          Print
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <card.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Collections</CardTitle>
            <CardDescription>Payment collections over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.daily_revenue || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="amount" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payments by Method</CardTitle>
            <CardDescription>Breakdown of payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.payments_by_method || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="PaymentMethod" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing Status</CardTitle>
          <CardDescription>Overview of billing statement statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Count</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                {(data?.bills_by_status || []).map((item: any, idx: number) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-3 px-2 font-medium">{item.status}</td>
                    <td className="py-3 px-2 text-right">{item.count}</td>
                    <td className="py-3 px-2 text-right font-medium">₱{(item.total || 0).toLocaleString()}</td>
                  </tr>
                ))}
                {(!data?.bills_by_status || data.bills_by_status.length === 0) && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-muted-foreground">
                      No billing data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialReports;
