import { useState, useEffect } from "react";
import api from "@/api/axios";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Badge } from "@/components/ui/badge";
import { Clock, Package } from "lucide-react";
import { Pagination, usePagination } from "@/components/ui/pagination";

interface AuditLog {
  id: number;
  action: string;
  description: string;
  user_id: number;
  user_name?: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: any;
  created_at: string;
}

const actionBadgeColors: Record<string, string> = {
  LOGIN_SUCCESS: "bg-emerald-50 text-emerald-600 border-emerald-200",
  LOGIN_FAILED: "bg-red-50 text-red-600 border-red-200",
  REGISTRATION_COMPLETED: "bg-blue-50 text-blue-600 border-blue-200",
  KEY_GENERATED: "bg-violet-50 text-violet-600 border-violet-200",
  ONBOARDING: "bg-blue-50 text-blue-600 border-blue-200",
  ROLE: "bg-amber-50 text-amber-600 border-amber-200",
  JOB_ORDER: "bg-teal-50 text-teal-600 border-teal-200",
  SALES_ORDER: "bg-cyan-50 text-cyan-600 border-cyan-200",
  PURCHASE_ORDER: "bg-rose-50 text-rose-600 border-rose-200",
  INVENTORY: "bg-orange-50 text-orange-600 border-orange-200",
};

const actionMessages: Record<string, string> = {
  LOGIN_SUCCESS: "logged in successfully",
  LOGIN_FAILED: "failed to log in",
  REGISTRATION_COMPLETED: "completed registration",
  KEY_GENERATED: "generated a registration key",
  ONBOARDING: "was onboarded to the system",
  ROLE_UPDATED: "updated a role configuration",
  ROLE_CREATED: "created a new role",
  ROLE_DELETED: "deleted a role",
  EMPLOYEE_UPDATED: "updated employee details",
  EMPLOYEE_TERMINATED: "terminated an employee",
  JOB_ORDER_CREATED: "created a job order",
  JOB_ORDER_COMPLETED: "completed a job order",
  SALES_ORDER_CREATED: "created a sales order",
  SALES_ORDER_APPROVED: "approved a sales order",
  SALES_ORDER_COMPLETED: "completed a sales order",
  PURCHASE_ORDER_CREATED: "created a purchase order",
  PURCHASE_ORDER_APPROVED: "approved a purchase order",
  INVENTORY_ADJUSTED: "adjusted inventory stock",
};

const formatAction = (action: string): string => {
  return action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

const getBadgeColor = (action: string) => {
  const upper = action.toUpperCase();
  for (const [key, color] of Object.entries(actionBadgeColors)) {
    if (upper.includes(key)) return color;
  }
  return "bg-gray-50 text-gray-600 border-gray-200";
};

const getActionMessage = (action: string, description?: string): string => {
  if (description) return description;
  const upper = action.toUpperCase();
  for (const [key, msg] of Object.entries(actionMessages)) {
    if (upper.includes(key)) return msg;
  }
  return formatAction(action).toLowerCase();
};

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const { page, setPage, pageSize, setPageSize } = usePagination(25);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/audit-logs`, {
        params: { per_page: pageSize, page },
      });
      const data = res.data?.data || res.data || [];
      const items = Array.isArray(data) ? data : data.data || [];
      setLogs(items);
      setTotalItems(res.data?.total ?? items.length);
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, pageSize]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("en-PH", {
        month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
      });
    } catch { return dateStr; }
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 overflow-auto">
      <Card className="flex-1 flex flex-col border border-border">
        <CardContent className="flex-1 p-0 flex flex-col">
          {loading && logs.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-20">
              <Package className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm font-medium">No audit logs found</p>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground w-[15%]">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground w-[15%]">Action</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground w-[40%]">Description</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground w-[15%]">User</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground w-[15%]">Entity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, idx) => {
                      const user = log.user_name || "System";
                      const message = getActionMessage(log.action, log.description);
                      const entity = log.entity_type
                        ? log.entity_type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())
                        : "-";

                      return (
                        <tr
                          key={log.id || idx}
                          className={`border-b border-border/40 hover:bg-accent/30 transition-colors ${idx % 2 === 0 ? "bg-card/50" : "bg-background"}`}
                        >
                          <td className="py-3 px-4 text-muted-foreground text-xs whitespace-nowrap">
                            {formatDate(log.created_at)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className={`text-[10px] font-semibold ${getBadgeColor(log.action)}`}>
                              {formatAction(log.action)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm">{message}</td>
                          <td className="py-3 px-4 text-sm font-medium">{user}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{entity}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </ScrollArea>

              <div className="border-t px-4">
                <Pagination
                  totalItems={totalItems}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
