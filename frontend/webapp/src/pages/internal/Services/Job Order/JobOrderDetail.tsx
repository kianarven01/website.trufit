import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DataToolbar from "@/components/DataToolbar";
import {
  ArrowLeft,
  Wrench,
  User,
  Car,
  Play,
  Pause,
  PlayCircle,
  Square,
  CircleCheck,
  XCircle,
  FileText,
  Clock,
  UserPlus,
  Trash2,
  Box,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/api/axios";
import Combobox from "@/components/ui/combobox";

/* TYPES */
interface Technician {
  id: number;
  first_name: string;
  last_name: string;
  position?: string;
}

interface Vehicle {
  id: number;
  plate_number: string;
  year_model?: string;
  make?: string;
  model?: string;
  variant?: string;
  color?: string;
  engine_number?: string;
  VIN?: string;
  registration_number?: string;
  mileage?: number;
  selling_dealer?: string;
}

interface ServiceType {
  id: string;
  name: string;
  price: number;
  tasks?: string[];
}

interface JOService {
  id: number;
  ServiceID: string;
  custom_name?: string;
  service_type: ServiceType | null;
  PriceAtSale: number;
}

interface TechAssignment {
  id: number;
  employee_id: number;
  employee: Technician | null;
  role: string;
  assigned_at: string;
  removed_at: string | null;
  accumulated_seconds: number;
}

interface SalesOrder {
  id: string;
  so_number: string;
  Status: string;
  Total: number;
  mileage?: number;
  items?: { id: string; ProductID: string; custom_name?: string; quantity: number; UnitPrice: number; SubTotal: number; is_issued?: boolean; product?: { name: string; SKU: string; part_number?: string; manufacturer_name?: string; category_is_spol?: boolean; category_name?: string } }[];
}

interface BillingStatement {
  id: string;
  bill_number: string;
  Total: number;
  status: string;
}

interface JobOrderDetail {
  id: string;
  jo_number: string;
  date: string;
  status: string;
  notes: string | null;
  timer_status: string | null;
  timer_started_at: string | null;
  timer_total_seconds: number;
  elapsed_seconds: number;
  vehicle: Vehicle | null;
  salesOrder: SalesOrder | null;
  estimate?: { id: string; mileage?: number } | null;
  services: JOService[];
  technicians: TechAssignment[];
  billingStatements: BillingStatement[];
  statusRecord: { name: string } | null;
}

/* HELPERS */
const formatTimer = (totalSeconds: number): string => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const peso = (amount: number) => `₱${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* COMPONENT */
const JobOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [jobOrder, setJobOrder] = useState<JobOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // PDF preview state
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);

  // Timer state
  const [liveSeconds, setLiveSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Dialogs
  const [confirmAction, setConfirmAction] = useState<"start-job" | "complete" | "cancel" | null>(null);
  const [confirmRemoveTech, setConfirmRemoveTech] = useState<number | null>(null);
  const [isAssignTechOpen, setIsAssignTechOpen] = useState(false);
  const [assignTechId, setAssignTechId] = useState("");
  const [assignRole, setAssignRole] = useState("PRIMARY");
  const [employees, setEmployees] = useState<Technician[]>([]);

  // Notes
  const [notes, setNotes] = useState<string>("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  /* FETCH */
  const fetchJobOrder = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/job-orders/${id}`);
      setJobOrder(res.data.data);
      setNotes(res.data.data?.notes || "");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load job order");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJobOrder();
  }, [fetchJobOrder]);

  useEffect(() => {
    if (jobOrder?.jo_number) {
      sessionStorage.setItem(`breadcrumb-/webapp/services/job-orders/${id}`, jobOrder.jo_number);
      window.dispatchEvent(new Event('breadcrumb-update'));
    }
    return () => {
      if (id) {
        sessionStorage.removeItem(`breadcrumb-/webapp/services/job-orders/${id}`);
        window.dispatchEvent(new Event('breadcrumb-update'));
      }
    };
  }, [jobOrder?.jo_number, id]);

  /* TIMER LIVE UPDATE */
  useEffect(() => {
    if (jobOrder?.timer_status === "running" && jobOrder.timer_started_at) {
      const baseSeconds = jobOrder.timer_total_seconds || 0;
      const startedAt = new Date(jobOrder.timer_started_at).getTime();

      const tick = () => {
        const elapsed = Math.abs(Math.floor((Date.now() - startedAt) / 1000));
        setLiveSeconds(baseSeconds + elapsed);
      };

      tick();
      timerRef.current = setInterval(tick, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    } else {
      setLiveSeconds(jobOrder?.elapsed_seconds ?? jobOrder?.timer_total_seconds ?? 0);
    }
  }, [jobOrder?.timer_status, jobOrder?.timer_started_at, jobOrder?.timer_total_seconds, jobOrder?.elapsed_seconds]);

  /* EMPLOYEES FETCH */
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get("/admin/employees");
        const rawData = res.data;
        const data = rawData?.data || rawData || [];
        const list = Array.isArray(data) ? data : [];
        setEmployees(list);
      } catch (err) {
        console.error("Failed to load employees", err);
      }
    };
    fetchEmployees();
  }, [id]);

  /* STATUS */
  const hasValidStatus = !!jobOrder?.statusRecord?.name;
  const currentStatus = hasValidStatus ? jobOrder.statusRecord!.name : null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed": return <Badge variant="approved">Completed</Badge>;
      case "In Progress": return <Badge variant="received">In Progress</Badge>;
      case "Pending": return <Badge variant="for-approval">Pending</Badge>;
      case "Cancelled": return <Badge variant="cancelled">Cancelled</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  /* ACTIONS */
  const loadPdfPreview = useCallback(async () => {
    if (!id) return;
    setIsLoadingPdf(true);
    try {
      const response = await api.get(`/job-orders/${id}/download-pdf`, { responseType: 'blob' });
      if (pdfBlobUrl) window.URL.revokeObjectURL(pdfBlobUrl);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      setPdfBlobUrl(url);
    } catch (error) {
      console.error("Error loading PDF:", error);
      toast.error("Failed to load PDF preview.");
    } finally {
      setIsLoadingPdf(false);
    }
  }, [id, pdfBlobUrl]);

  const handlePreviewPDF = async () => {
    setShowPdfPreview(true);
    await loadPdfPreview();
  };

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) window.URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [pdfBlobUrl]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await api.patch(`/job-orders/${id}/status`, { status: newStatus });
      toast.success(`Job order status updated to ${newStatus}`);
      setConfirmAction(null);
      fetchJobOrder();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleTimerAction = async (action: "start" | "pause" | "resume" | "stop") => {
    try {
      // Immediately stop interval if pausing/stopping to prevent stale ticking
      if ((action === "pause" || action === "stop") && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      const res = await api.post(`/job-orders/${id}/timer/${action}`);
      // Optimistically update liveSeconds from response
      setLiveSeconds(res.data.data.elapsed_seconds ?? 0);
      toast.success(`Timer ${action === "start" ? "started" : action === "pause" ? "paused" : action === "resume" ? "resumed" : "stopped"}`);
      fetchJobOrder();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update timer");
    }
  };

  const handleSaveNotes = async () => {
    if (!id) return;
    try {
      setIsSavingNotes(true);
      await api.patch(`/job-orders/${id}/notes`, { notes: notes || null });
      toast.success("Notes saved");
      setJobOrder((prev) => prev ? { ...prev, notes } : null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save notes");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleAssignTech = async () => {
    if (!assignTechId) {
      toast.error("Please select a technician");
      return;
    }
    try {
      await api.post(`/job-orders/${id}/technicians`, {
        employee_id: parseInt(assignTechId),
        role: assignRole,
      });
      toast.success("Technician assigned");
      setIsAssignTechOpen(false);
      setAssignTechId("");
      setAssignRole("PRIMARY");
      fetchJobOrder();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to assign technician");
    }
  };

  const handleRemoveTech = async (employeeId: number) => {
    try {
      await api.delete(`/job-orders/${id}/technicians/${employeeId}`);
      toast.success("Technician removed");
      fetchJobOrder();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove technician");
    }
  };

  /* LOADING */
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading job order...</p>
        </div>
      </div>
    );
  }

  if (!jobOrder) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-muted-foreground">Job Order not found</p>
        <Button onClick={() => navigate("/webapp/services/job-orders")}>Back to Job Orders</Button>
      </div>
    );
  }

  const activeTechs = (jobOrder.technicians || []).filter((t) => !t.removed_at);
  const pastTechs = (jobOrder.technicians || []).filter((t) => t.removed_at);
  const employeeList = employees.map((e) => ({
    label: `${e.first_name || ""} ${e.last_name || ""}`.trim(),
    value: String(e.id),
  }));

  return (
    <>
      <div className="w-full h-full pl-4 pr-3 pb-4 flex flex-col gap-4 overflow-y-auto">
        {/* HEADER */}
        <DataToolbar
          variant="detail"
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/webapp/services/job-orders")}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              {currentStatus === "Pending" && activeTechs.length > 0 && (!jobOrder?.salesOrder || ["APPROVED", "IN_PROGRESS"].includes(jobOrder.salesOrder.Status)) && (
                <Button size="sm" onClick={() => setConfirmAction("start-job")} className="bg-blue-600 hover:bg-blue-700">
                  <Play className="w-4 h-4 mr-1.5" />
                  Start Job
                </Button>
              )}
              {currentStatus === "In Progress" && (
                <Button size="sm" onClick={() => setConfirmAction("complete")} className="bg-green-600 hover:bg-green-700">
                  <CircleCheck className="w-4 h-4 mr-1.5" />
                  Complete
                </Button>
              )}
              {(currentStatus === "Pending" || currentStatus === "In Progress") && (
                <Button variant="destructive" size="sm" onClick={() => setConfirmAction("cancel")}>
                  <XCircle className="w-4 h-4 mr-1.5" />
                  Cancel
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handlePreviewPDF}>
                <Printer className="w-4 h-4 mr-1" />
                Print
              </Button>
            </div>
          }
        />

        <div className="space-y-6">
          {/* STATUS + TIMER ROW */}
          <div className="grid lg:grid-cols-3 gap-4">
            {/* TIMER CARD */}
            <Card className="lg:col-span-1">
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-500">
                    <Clock className="size-5" />
                    <p className="font-semibold text-foreground">Timer</p>
                  </div>
                  {currentStatus ? getStatusBadge(currentStatus) : <Badge variant="default">Unknown</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Timer Display */}
                <div className="text-center py-4">
                  <div className={`text-4xl font-mono font-bold tracking-wider ${jobOrder.timer_status === "running" ? "text-green-600" : jobOrder.timer_status === "paused" ? "text-amber-600" : "text-muted-foreground"}`}>
                    {formatTimer(liveSeconds)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {jobOrder.timer_status === "running" ? "Running" : jobOrder.timer_status === "paused" ? "Paused" : "Stopped"}
                  </p>
                </div>

                {/* Timer Controls */}
                {currentStatus === "In Progress" && (
                  <div className="flex justify-center gap-2">
                    {(!jobOrder.timer_status || jobOrder.timer_status === null) && (
                      <Button size="sm" onClick={() => handleTimerAction("start")} className="bg-green-600 hover:bg-green-700">
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    )}
                    {jobOrder.timer_status === "running" && (
                      <Button size="sm" variant="outline" onClick={() => handleTimerAction("pause")}>
                        <Pause className="w-4 h-4 mr-1" />
                        Pause
                      </Button>
                    )}
                    {jobOrder.timer_status === "paused" && (
                      <Button size="sm" onClick={() => handleTimerAction("resume")} className="bg-blue-600 hover:bg-blue-700">
                        <PlayCircle className="w-4 h-4 mr-1" />
                        Resume
                      </Button>
                    )}
                    {(jobOrder.timer_status === "running" || jobOrder.timer_status === "paused") && (
                      <Button size="sm" variant="destructive" onClick={() => handleTimerAction("stop")}>
                        <Square className="w-4 h-4 mr-1" />
                        Stop
                      </Button>
                    )}
                  </div>
                )}

                <Separator />
                <div className="text-center text-xs text-muted-foreground">
                  Total accumulated: {formatTimer(jobOrder.timer_total_seconds || 0)}
                </div>
              </CardContent>
            </Card>

            {/* JOB INFO + VEHICLE */}
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="py-4">
                  <div className="flex items-center gap-2 text-blue-500">
                    <FileText className="size-5" />
                    <p className="font-semibold text-foreground">Job Order Info</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground font-normal text-xs">Date</Label>
                    <Input value={new Date(jobOrder.date).toLocaleDateString()} readOnly />
                  </div>
                  {jobOrder.salesOrder && (
                    <div>
                      <Label className="text-muted-foreground font-normal text-xs">Linked SO</Label>
                      <div className="pt-1">
                        <span
                          className="text-sm font-mono text-primary cursor-pointer hover:underline"
                          onClick={() => navigate(`/webapp/sales/sales-orders/${jobOrder.salesOrder!.id}`)}
                        >
                          {jobOrder.salesOrder.so_number}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">({jobOrder.salesOrder.Status})</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-4">
                  <div className="flex items-center gap-2 text-blue-500">
                    <Car className="size-5" />
                    <p className="font-semibold text-foreground">Vehicle Details</p>
                  </div>
                </CardHeader>
                <CardContent>
                  {jobOrder.vehicle ? (
                    <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="sm:col-span-2 grid lg:grid-cols-4 gap-4">
                        <div className="lg:col-span-2">
                          <Label className="text-muted-foreground font-normal text-xs">Year / Make / Model</Label>
                          <Input value={`${jobOrder.vehicle.year_model || ""} ${jobOrder.vehicle.make || ""} ${jobOrder.vehicle.model || ""}`.trim() || "—"} readOnly />
                        </div>
                        <div>
                          <Label className="text-muted-foreground font-normal text-xs">Variant</Label>
                          <Input value={jobOrder.vehicle.variant || "—"} readOnly />
                        </div>
                        <div>
                          <Label className="text-muted-foreground font-normal text-xs">Color</Label>
                          <Input value={jobOrder.vehicle.color || "—"} readOnly />
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground font-normal text-xs">Plate No.</Label>
                        <Input value={jobOrder.vehicle.plate_number || "—"} readOnly />
                      </div>
                      <div>
                        <Label className="text-muted-foreground font-normal text-xs">Engine No.</Label>
                        <Input value={jobOrder.vehicle.engine_number || "—"} readOnly />
                      </div>
                      <div>
                        <Label className="text-muted-foreground font-normal text-xs">Chassis No. (VIN)</Label>
                        <Input value={jobOrder.vehicle.VIN || "—"} readOnly />
                      </div>
                      <div>
                        <Label className="text-muted-foreground font-normal text-xs">Registration No.</Label>
                        <Input value={jobOrder.vehicle.registration_number || "—"} readOnly />
                      </div>
                      <div className="sm:col-span-2">
                        <Label className="text-muted-foreground font-normal text-xs">Mileage</Label>
                        <Input value={(() => {
                          const mileage = jobOrder.vehicle?.mileage || jobOrder.salesOrder?.mileage || jobOrder.estimate?.mileage;
                          return mileage ? `${Number(mileage).toLocaleString()} km` : "—";
                        })()} readOnly />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 border border-dashed rounded-lg">
                      <Car className="size-6 text-muted-foreground mb-1" />
                      <p className="text-sm text-muted-foreground">No vehicle assigned</p>
                      <p className="text-xs text-muted-foreground/70">Vehicle will be linked from the estimate</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* TECHNICIANS + NOTES */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* TECHNICIANS */}
            <Card>
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="size-5 text-orange-500" />
                    <h2 className="text-sm font-semibold text-foreground">Assigned Technicians</h2>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setIsAssignTechOpen(true)}>
                    <UserPlus className="w-4 h-4 mr-1" />
                    Assign Tech
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {activeTechs.length > 0 || pastTechs.length > 0 ? (
                  <div className="space-y-2">
                    {activeTechs.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Active</p>
                        {activeTechs.map((ta) => (
                          <div key={ta.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-sm font-bold text-green-700 dark:text-green-300">
                                {ta.employee?.first_name?.[0]}{ta.employee?.last_name?.[0]}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{ta.employee?.first_name} {ta.employee?.last_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {ta.role} · Since {new Date(ta.assigned_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  const newRole = ta.role === "PRIMARY" ? "ASSISTANT" : "PRIMARY";
                                  try {
                                    await api.post(`/job-orders/${id}/technicians`, {
                                      employee_id: ta.employee_id,
                                      role: newRole,
                                    });
                                    toast.success(`Technician role changed to ${newRole}`);
                                    fetchJobOrder();
                                  } catch (err: any) {
                                    toast.error(err.response?.data?.message || "Failed to update role");
                                  }
                                }}
                                className="text-xs text-muted-foreground hover:text-foreground"
                              >
                                {ta.role === "PRIMARY" ? "Demote" : "Promote"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setConfirmRemoveTech(ta.employee_id)}
                                className="text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {pastTechs.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Previous Stints</p>
                        {pastTechs.map((ta) => (
                          <div key={ta.id} className="flex items-center justify-between p-3 bg-muted/30 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                                {ta.employee?.first_name?.[0]}{ta.employee?.last_name?.[0]}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{ta.employee?.first_name} {ta.employee?.last_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {ta.role} · {formatTimer(ta.accumulated_seconds)} accumulated
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-6">No technicians assigned yet.</p>
                )}
              </CardContent>
            </Card>

            {/* NOTES */}
            <Card>
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="size-5 text-blue-500" />
                    <h2 className="text-sm font-semibold text-foreground">Notes / Recommendations</h2>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                  >
                    {isSavingNotes ? "Saving..." : "Save Notes"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes, recommendations, or special instructions..."
                  className="w-full min-h-[120px] bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                />
              </CardContent>
            </Card>
          </div>

          {/* SERVICES + PARTS/SUPPLIES ROW */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* SERVICES */}
            <Card>
              <CardHeader className="py-4">
                <div className="flex items-center gap-2">
                  <Wrench className="size-5 text-orange-500" />
                  <h2 className="text-sm font-semibold text-foreground">Services</h2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table className="[&_tr]:hover:!bg-transparent text-center">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs text-center">Service</TableHead>
                        <TableHead className="text-xs text-center">Tasks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobOrder.services.length > 0 ? (
                        jobOrder.services.map((svc) => (
                          <TableRow key={svc.id} className="hover:bg-transparent text-center">
                            <TableCell className="font-medium text-center">
                              {svc.custom_name || svc.service_type?.name || "Service"}
                            </TableCell>
                            <TableCell className="text-left text-xs text-muted-foreground">
                            {svc.service_type?.tasks && svc.service_type.tasks.length > 0 ? (
                              <ul className="list-disc pl-4 space-y-0.5">
                                {svc.service_type.tasks.map((task, i) => (
                                    <li key={i}>{task}</li>
                                  ))}
                                </ul>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={2} className="text-center text-sm text-muted-foreground py-8">
                            No services added.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* SO PARTS & SUPPLIES */}
            <Card>
              <CardHeader className="py-4">
                <div className="flex items-center gap-2">
                  <Box className="size-5 text-orange-500" />
                  <h2 className="text-sm font-semibold text-foreground">Parts & Supplies (from Sales Order)</h2>
                </div>
              </CardHeader>
              <CardContent>
                {jobOrder.salesOrder?.items && jobOrder.salesOrder.items.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table className="[&_tr]:hover:!bg-transparent text-center">
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="text-xs text-center">Item Name</TableHead>
                          <TableHead className="text-xs text-center">Part Number</TableHead>
                          <TableHead className="text-xs text-center">Qty</TableHead>
                          <TableHead className="text-xs text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobOrder.salesOrder.items.map((item) => {
                          const isSundries = item.product?.category_is_spol && item.product?.category_name?.toLowerCase() === "sundries";
                          return (
                            <TableRow key={item.id} className="hover:bg-transparent text-center">
                              <TableCell className="font-medium text-center">
                                {item.product?.manufacturer_name ? `${item.product.manufacturer_name} — ` : ""}{item.custom_name || item.product?.name || "Unknown Item"}
                              </TableCell>
                              <TableCell className="text-center font-mono text-xs text-muted-foreground">
                                {item.product?.part_number || item.product?.SKU || "—"}
                              </TableCell>
                              <TableCell className="text-center">{item.quantity}</TableCell>
                              <TableCell className="text-center">
                                {isSundries ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                    Sundries
                                  </span>
                                ) : item.is_issued ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-200">
                                    Issued
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground text-xs">—</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-6">No parts or supplies from Sales Order.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* LINKED BILLING */}
          {jobOrder.billingStatements && jobOrder.billingStatements.length > 0 && (
            <Card>
              <CardHeader className="py-4">
                <div className="flex items-center gap-2">
                  <FileText className="size-5 text-blue-500" />
                  <h2 className="text-sm font-semibold text-foreground">Linked Billing Statements</h2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table className="[&_tr]:hover:!bg-transparent text-center">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs text-center">Bill Number</TableHead>
                        <TableHead className="text-xs text-center">Total</TableHead>
                        <TableHead className="text-xs text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobOrder.billingStatements.map((bill) => (
                        <TableRow
                          key={bill.id}
                          className="hover:bg-transparent text-center cursor-pointer"
                          onClick={() => navigate(`/webapp/sales/billing/${bill.id}`)}
                        >
                          <TableCell className="font-mono font-bold text-primary text-center">
                            {bill.bill_number}
                          </TableCell>
                          <TableCell className="text-center">{peso(Number(bill.Total) || 0)}</TableCell>
                          <TableCell className="text-center">{getStatusBadge(bill.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ASSIGN TECH DIALOG */}
      <AlertDialog open={isAssignTechOpen} onOpenChange={setIsAssignTechOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Assign Technician</AlertDialogTitle>
            <AlertDialogDescription>
              Select a technician and their role for this job order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Technician</Label>
              <Combobox
                value={assignTechId}
                onChange={setAssignTechId}
                items={employeeList}
                placeholder="Select technician"
              />
            </div>
            <div>
              <Label>Role</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  variant={assignRole === "PRIMARY" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAssignRole("PRIMARY")}
                >
                  PRIMARY
                </Button>
                <Button
                  variant={assignRole === "ASSISTANT" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAssignRole("ASSISTANT")}
                >
                  ASSISTANT
                </Button>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAssignTech}>Assign</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* REMOVE TECHNICIAN CONFIRMATION */}
      <AlertDialog open={confirmRemoveTech !== null} onOpenChange={() => setConfirmRemoveTech(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Technician?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this technician from the job order? Their accumulated time will be saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (confirmRemoveTech !== null) handleRemoveTech(confirmRemoveTech);
                setConfirmRemoveTech(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* STATUS CONFIRMATION DIALOG */}
      <AlertDialog open={confirmAction !== null} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent className="z-[120]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "start-job" && "Start Job?"}
              {confirmAction === "complete" && "Complete Job Order?"}
              {confirmAction === "cancel" && "Cancel Job Order?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "start-job" && "This will move the job order to In Progress. Timer can be started after."}
              {confirmAction === "complete" && "This will mark the job order as Completed and stop any running timer."}
              {confirmAction === "cancel" && "This will cancel the job order and stop any running timer. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmAction === "start-job") handleStatusChange("In Progress");
                if (confirmAction === "complete") handleStatusChange("Completed");
                if (confirmAction === "cancel") handleStatusChange("Cancelled");
              }}
              className={
                confirmAction === "cancel"
                  ? "bg-destructive text-white hover:bg-destructive/90"
                  : confirmAction === "complete"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : ""
              }
            >
              {confirmAction === "start-job" && "Start Job"}
              {confirmAction === "complete" && "Complete"}
              {confirmAction === "cancel" && "Cancel Job Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ========== PDF PREVIEW DIALOG ========== */}
      <Dialog open={showPdfPreview} onOpenChange={(open) => {
        setShowPdfPreview(open);
        if (!open && pdfBlobUrl) {
          window.URL.revokeObjectURL(pdfBlobUrl);
          setPdfBlobUrl(null);
        }
      }}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b bg-background shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold">
                PDF Preview — {jobOrder?.jo_number || "Job Order"}
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="flex-1 min-h-0 bg-muted/30">
            {isLoadingPdf ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground animate-pulse">Generating PDF...</p>
                </div>
              </div>
            ) : pdfBlobUrl ? (
              <iframe
                src={pdfBlobUrl}
                className="w-full h-full border-0"
                title="Job Order PDF Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">No preview available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JobOrderDetail;
