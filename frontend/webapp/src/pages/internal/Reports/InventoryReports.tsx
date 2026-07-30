import React, { useState, useEffect } from "react";
import api from "@/api/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from "recharts";
import { Package, AlertTriangle, TrendingDown, Printer } from "lucide-react";

const InventoryReports: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/reports/inventory");
      if (response.data?.status === "success") {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Failed to load inventory report");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, []);

  const summaryCards = [
    { title: "Total Products", value: (data?.summary?.total_products || 0).toLocaleString(), icon: Package },
    { title: "In Stock", value: (data?.summary?.in_stock || 0).toLocaleString(), icon: Package },
    { title: "Low Stock Items", value: (data?.summary?.low_stock || 0).toLocaleString(), icon: AlertTriangle, alert: (data?.summary?.low_stock || 0) > 0 },
    { title: "Out of Stock", value: (data?.summary?.out_of_stock || 0).toLocaleString(), icon: TrendingDown, alert: (data?.summary?.out_of_stock || 0) > 0 },
    { title: "Total Stock Value", value: `\u20B1${(data?.summary?.total_inventory_value || 0).toLocaleString()}`, icon: Package },
  ];

  return (
    <div className="w-full h-full overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={() => window.print()} className="h-8">
          <Printer className="h-3.5 w-3.5 mr-1" /> Print
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-3">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-lg font-bold mt-0.5">{card.value}</p>
                </div>
                <div className={`p-1.5 rounded-lg ${card.alert ? "bg-destructive/10" : "bg-primary/10"}`}>
                  <card.icon className={`h-4 w-4 ${card.alert ? "text-destructive" : "text-primary"}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Inventory by Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] overflow-auto">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : (data?.inventory_details || []).length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">No inventory data</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                    <th className="text-left py-2 font-medium">Product</th>
                    <th className="text-center py-2 font-medium">Part No.</th>
                      <th className="text-center py-2 font-medium">On Hand</th>
                      <th className="text-center py-2 font-medium">Reserved</th>
                      <th className="text-center py-2 font-medium">Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.inventory_details || []).slice(0, 20).map((item: any, idx: number) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="py-2 text-left">
                          <p className="font-medium">{item.product_name}</p>
                        </td>
                        <td className="py-2 text-center text-muted-foreground text-xs">{item.part_number || item.SKU || '-'}</td>
                        <td className="py-2 text-center">{item.total_on_hand}</td>
                        <td className="py-2 text-center">{item.total_reserved}</td>
                        <td className="py-2 text-center font-medium">{item.available}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Inventory Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "In Stock", value: data?.summary?.in_stock || 0 },
                        { name: "Low Stock", value: data?.summary?.low_stock || 0 },
                        { name: "Out of Stock", value: data?.summary?.out_of_stock || 0 },
                      ]}
                      cx="50%" cy="50%" labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={100} fill="#8884d8" dataKey="value"
                    >
                      <Cell key="in-stock" fill="#10b981" />
                      <Cell key="low-stock" fill="#f59e0b" />
                      <Cell key="out-of-stock" fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Low Stock Alert</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (data?.low_stock_items || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="h-10 w-10 text-green-500 mb-2" />
              <p className="text-sm font-medium">All stock levels are healthy</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="pb-3 font-medium text-left">Product</th>
                    <th className="pb-3 font-medium text-center">Part No.</th>
                    <th className="pb-3 font-medium text-center">Current Stock</th>
                    <th className="pb-3 font-medium text-center">Reorder Level</th>
                    <th className="pb-3 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.low_stock_items || []).map((item: any, idx: number) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-3 text-left">
                        <p className="font-medium">{item.product_name}</p>
                      </td>
                      <td className="py-3 text-center text-muted-foreground text-xs">{item.part_number || item.SKU || '-'}</td>
                      <td className="py-3 text-center">{item.available}</td>
                      <td className="py-3 text-center">{item.reorder_level}</td>
                      <td className="py-3 text-center">
                        {item.available <= 0 ? (
                          <Badge variant="destructive">Out of Stock</Badge>
                        ) : (
                          <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Low Stock</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryReports;
