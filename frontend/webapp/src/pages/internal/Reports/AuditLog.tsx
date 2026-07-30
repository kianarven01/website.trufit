import { useState, useEffect } from "react";
import api from "@/api/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scrollArea";
import {
  Activity,
  RefreshCw,
  User,
  Settings,
  ShoppingCart,
  FileText,
  Shield,
  Clock,
} from "lucide-react";

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

const actionIcons: Record<string, any> = {
  ONBOARDING: User,
  EMPLOYEE: User,
  ROLE: Shield,
  JOB_ORDER: Settings,
  SALES_ORDER: FileText,
  PURCHASE_ORDER: ShoppingCart,
  INVENTORY: Settings,
};

const actionColors: Record<string, string> = {
  ONBOARDING: "bg-blue-500/10 text-blue-500",
  EMPLOYEE: "bg-violet-500/10 text-violet-500",
  ROLE: "bg-amber-500/10 text-amber-500",
  JOB_ORDER: "bg-emerald-500/10 text-emerald-500",
  SALES_ORDER: "bg-cyan-500/10 text-cyan-500",
  PURCHASE_ORDER: "bg-rose-500/10 text-rose-500",
  INVENTORY: "bg-slate-500/10 text-slate-500",
};

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchLogs = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/audit-logs?per_page=50&page=${pageNum}`);
      const data = res.data?.data || res.data || [];
      if (pageNum === 1) {
        setLogs(Array.isArray(data) ? data : data.data || []);
      } else {
        setLogs((prev) => [...prev, ...(Array.isArray(data) ? data : data.data || [])]);
      }
      setHasMore(Array.isArray(data) ? data.length === 50 : (data.data || []).length === 50);
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getActionType = (action: string): string => {
    const upper = action.toUpperCase();
    if (upper.includes("ONBOARD") || upper.includes("REGISTRATION")) return "ONBOARDING";
    if (upper.includes("EMPLOYEE")) return "EMPLOYEE";
    if (upper.includes("ROLE")) return "ROLE";
    if (upper.includes("JOB")) return "JOB_ORDER";
    if (upper.includes("SALES")) return "SALES_ORDER";
    if (upper.includes("PURCHASE") || upper.includes("PO")) return "PURCHASE_ORDER";
    if (upper.includes("INVENTORY") || upper.includes("STOCK")) return "INVENTORY";
    return "EMPLOYEE";
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 overflow-auto">

      <Card className="flex-1">
        <CardContent className="p-0">
          {loading && logs.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Activity className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm font-medium">No audit logs found</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="divide-y divide-border/50">
                {logs.map((log, idx) => {
                  const actionType = getActionType(log.action);
                  const Icon = actionIcons[actionType] || Activity;
                  const colorClass = actionColors[actionType] || "bg-gray-500/10 text-gray-500";

                  return (
                    <div key={log.id || idx} className="flex items-start gap-4 p-4 hover:bg-accent/30 transition-colors">
                      <div className={`p-2 rounded-lg shrink-0 ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold">{log.action}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {actionType.replace("_", " ")}
                          </Badge>
                        </div>
                        {log.description && (
                          <p className="text-sm text-muted-foreground mt-0.5">{log.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground/70">
                          {log.user_name && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {log.user_name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(log.created_at)}
                          </span>
                          {log.entity_type && (
                            <span>{log.entity_type} #{log.entity_id}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {hasMore && !loading && logs.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={() => { setPage(page + 1); fetchLogs(page + 1); }}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
