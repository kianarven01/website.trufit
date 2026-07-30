import { useState, useEffect } from "react";
import api from "@/api/axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  AlertTriangle,
  XCircle,
  CheckCircle,
  RefreshCw,
  TrendingDown,
  Printer,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface InventorySummary {
  total_products: number;
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
  total_inventory_value: number;
}

interface LowStockItem {
  product_id: number;
  product_name: string;
  SKU: string;
  total_on_hand: number;
  total_reserved: number;
  available: number;
  reorder_level: number;
}

export default function InventoryReport() {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports/inventory");
      if (res.data?.status === "success") {
        setSummary(res.data.data.summary);
        setLowStockItems(res.data.data.low_stock_items);
      }
    } catch {
      toast.error("Failed to load inventory report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(val);

  const pieData = summary
    ? [
        { name: "In Stock", value: summary.in_stock, color: "#22c55e" },
        { name: "Low Stock", value: summary.low_stock, color: "#f59e0b" },
        { name: "Out of Stock", value: summary.out_of_stock, color: "#ef4444" },
      ]
    : [];

  return (
    <div className="h-full flex flex-col gap-4 p-4 overflow-auto">
      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={() => window.print()} className="h-8">
          <Printer className="h-3.5 w-3.5 mr-1" />
          Print
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Total Products</p>
                <p className="text-lg font-bold">{summary?.total_products ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">In Stock</p>
                <p className="text-lg font-bold">{summary?.in_stock ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/10 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Low Stock</p>
                <p className="text-lg font-bold">{summary?.low_stock ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-red-500/10 rounded-lg">
                <XCircle className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Out of Stock</p>
                <p className="text-lg font-bold">{summary?.out_of_stock ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-500/10 rounded-lg">
                <TrendingDown className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Inventory Value</p>
                <p className="text-lg font-bold">{formatCurrency(summary?.total_inventory_value ?? 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Stock Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 flex items-center justify-center">
            {summary && summary.total_products > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm">No data</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Low Stock Items ({lowStockItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 overflow-auto">
            {lowStockItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
                <p className="text-sm font-medium">All products are well stocked</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="pb-2 font-medium text-left">Product</th>
                    <th className="pb-2 font-medium text-left">Part No.</th>
                    <th className="pb-2 font-medium text-center">On Hand</th>
                    <th className="pb-2 font-medium text-center">Reserved</th>
                    <th className="pb-2 font-medium text-center">Available</th>
                    <th className="pb-2 font-medium text-center">Reorder Level</th>
                    <th className="pb-2 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item) => (
                    <tr key={item.product_id} className="border-b last:border-0">
                      <td className="py-2 text-left">
                        <p className="font-medium">{item.product_name}</p>
                      </td>
                      <td className="py-2 text-center text-muted-foreground text-xs">{item.part_number || item.SKU || '-'}</td>
                      <td className="py-2 text-center">{item.total_on_hand}</td>
                      <td className="py-2 text-center">{item.total_reserved}</td>
                      <td className="py-2 text-center font-medium">{item.available}</td>
                      <td className="py-2 text-center">{item.reorder_level}</td>
                      <td className="py-2 text-center">
                        <Badge variant={item.available <= 0 ? "destructive" : "secondary"}>
                          {item.available <= 0 ? "Out of Stock" : "Low Stock"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
