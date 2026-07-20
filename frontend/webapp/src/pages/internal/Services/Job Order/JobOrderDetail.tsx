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
}

interface ServiceType {
  id: string;
  name: string;
  price: number;
}

interface JOService {
  id: number;
  serviceType: ServiceType | null;
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
  joNumber: string;
  date: string;
  status: string;
  timer_status: string | null;
  timer_started_at: string | null;
  timer_total_seconds: number;
  elapsed_seconds: number;
  vehicle: Vehicle | null;
  salesOrder: SalesOrder | null;
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

  // Timer state
  const [liveSeconds, setLiveSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Dialogs
  const [confirmAction, setConfirmAction] = useState<"start-job" | "complete" | "cancel" | null>(null);
  const [isAssignTechOpen, setIsAssignTechOpen] = useState(false);
  const [assignTechId, setAssignTechId] = useState("");
  const [assignRole, setAssignRole] = useState("PRIMARY");
  const [employees, setEmployees] = useState<Technician[]>([]);

  /* FETCH */
  const fetchJobOrder = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/job-orders/${id}`);
      setJobOrder(res.data.data);
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

  /* TIMER LIVE UPDATE */
  useEffect(() => {
    if (jobOrder?.timer_status === "running" && jobOrder.timer_started_at) {
      const baseSeconds = jobOrder.timer_total_seconds || 0;
      const startedAt = new Date(jobOrder.timer_started_at).getTime();

      const tick = () => {
        const elapsed = Math.floor((Date.now() - startedAt) / 1000);
        setLiveSeconds(baseSeconds + Math.max(0, elapsed));
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
    api.get("/admin/employees").then((res) => {
      setEmployees(res.data.data || []);
    });
  }, []);

  /* STATUS */
  const currentStatus = jobOrder?.statusRecord?.name ?? jobOrder?.status ?? "Pending";

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
      await api.post(`/job-orders/${id}/timer/${action}`);
      toast.success(`Timer ${action === "start" ? "started" : action === "pause" ? "paused" : action === "resume" ? "resumed" : "stopped"}`);
      fetchJobOrder();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update timer");
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
  const totalServices = jobOrder.services.reduce((sum, s) => sum + (Number(s.PriceAtSale) || 0), 0);
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
          title={jobOrder.jo_number || jobOrder.joNumber || "Job Order"}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/webapp/services/job-orders")}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              {currentStatus === "Pending" && (!jobOrder?.salesOrder || jobOrder.salesOrder.Status === "APPROVED") && (
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
                  {getStatusBadge(currentStatus)}
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
                    <p className="font-semibold text-foreground">Vehicle</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {jobOrder.vehicle ? (
                    <>
                      <div>
                        <Label className="text-muted-foreground font-normal text-xs">Plate Number</Label>
                        <Input value={jobOrder.vehicle.plate_number || "—"} readOnly />
                      </div>
                      <div>
                        <Label className="text-muted-foreground font-normal text-xs">Vehicle</Label>
                        <Input
                          value={`${jobOrder.vehicle.year_model || ""} ${jobOrder.vehicle.make || ""} ${jobOrder.vehicle.model || ""} ${jobOrder.vehicle.variant || ""}`.trim() || "—"}
                          readOnly
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No vehicle assigned</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTech(ta.employee_id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
                      <TableHead className="text-xs w-[25%] text-center">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobOrder.services.length > 0 ? (
                      jobOrder.services.map((svc) => (
                        <TableRow key={svc.id} className="hover:bg-transparent text-center">
                          <TableCell className="font-medium text-center">
                            {svc.serviceType?.name || "Unknown Service"}
                          </TableCell>
                          <TableCell className="text-center">{peso(Number(svc.PriceAtSale) || 0)}</TableCell>
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
              <Separator className="my-4" />
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Estimated Total</span>
                <span className="font-bold text-primary">{peso(totalServices)}</span>
              </div>
            </CardContent>
          </Card>

          {/* LINKED BILLING */}
          {jobOrder.billingStatements && jobOrder.billingStatements.length > 0 && (
            <Card>
              <CardHeader className="py-4">
                <h2 className="text-sm font-semibold text-foreground">Linked Billing Statements</h2>
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
        <AlertDialogContent className="z-[120]">
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
    </>
  );
};

export default JobOrderDetail;
