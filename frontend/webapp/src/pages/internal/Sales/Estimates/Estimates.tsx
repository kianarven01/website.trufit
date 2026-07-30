import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import DataToolbar, { FilterOption } from "@/components/DataToolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scrollArea";

import { ImageIcon, MoreVertical, Trash2, RefreshCw, Eye } from "lucide-react";
import api from "@/api/axios";

/* ================= TYPES ================= */

interface Estimate {
  id: string;
  estimate_number?: string;
  customer?: any;
  vehicle?: any;
  items?: any[];
  services: any[];
  parts: any[];
  createdAt?: string;
  updatedAt?: string;
  status: string;
  total: number;
  deletedAt?: string | null;
}

/* ================= STATUS CONFIG ================= */

const statusConfig: Record<string, { label: string; variant: any }> = {
  approved: { label: "Approved", variant: "approved" as const },
  issued: { label: "Issued", variant: "received" as const },
  DRAFT: { label: "Draft", variant: "default" as const },
  APPROVED: { label: "Approved", variant: "approved" as const },
  ISSUED: { label: "Issued", variant: "received" as const },
  "FOR APPROVAL": { label: "For Approval", variant: "for-approval" as const },
  "for approval": { label: "For Approval", variant: "for-approval" as const },
  "for_approval": { label: "For Approval", variant: "for-approval" as const },
  "APPROVED WITH DOWNPAYMENT": { label: "Approved With Downpayment", variant: "approved" as const },
  "APPROVED_WITH_DOWNPAYMENT": { label: "Approved With Downpayment", variant: "approved" as const },
  CANCELLED: { label: "Cancelled", variant: "cancelled" as const },
  cancelled: { label: "Cancelled", variant: "cancelled" as const },
};

/* ================= FILTER ================= */

const filterOptions: FilterOption[] = [
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Draft", value: "DRAFT" },
      { label: "For Approval", value: "FOR APPROVAL" },
      { label: "Approved", value: "APPROVED" },
      { label: "Cancelled", value: "CANCELLED" },
      { label: "Issued", value: "ISSUED" },
    ],
  },
  {
    key: "archived",
    label: "Archived",
    options: [
      { label: "Show Archived", value: "true" },
      { label: "Hide Archived", value: "false" },
    ],
  },
];

/* ================= COMPONENT ================= */

const Estimates: React.FC = () => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({
    status: "all",
    archived: "false",
  });

  // Confirm dialogs
  const [confirmArchive, setConfirmArchive] = useState<Estimate | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<Estimate | null>(null);
  const [confirmForceDelete, setConfirmForceDelete] = useState<Estimate | null>(null);

  const navigate = useNavigate();
  const showArchived = filters.archived === "true";

  /* ================= LOAD FROM API ================= */

  const fetchEstimates = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.set("per_page", "1000");
      if (search) params.set("search", search);
      if (filters.status !== "all") params.set("status", filters.status);
      if (showArchived) params.set("archived", "true");

      const res = await api.get(`/estimates?${params.toString()}`);
      const data = res.data.data || [];
      const meta = res.data.meta || {};

      const normalized: Estimate[] = data.map((e: any) => {
        const items = Array.isArray(e.items) ? e.items : [];
        const services = items.filter((i: any) => i.item_type === "service");
        const parts = items.filter((i: any) => i.item_type !== "service");

        return {
          id: e.id,
          estimate_number: e.estimate_number,
          customer: e.customer ? {
            firstName: e.customer.first_name || "",
            lastName: e.customer.last_name || "",
          } : null,
          vehicle: e.vehicle || null,
          items,
          services,
          parts,
          total: Number(e.total_amount) || 0,
          status: e.status || "DRAFT",
          createdAt: e.created_at,
          updatedAt: e.updated_at,
          deletedAt: e.deleted_at,
        };
      });

      setEstimates(normalized);
    } catch (err) {
      console.error("Failed to load estimates", err);
      setEstimates([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, filters.status, showArchived]);

  useEffect(() => {
    fetchEstimates();
  }, [fetchEstimates]);

  /* ================= ACTIONS ================= */

  const archiveEstimate = async (estimate: Estimate) => {
    try {
      await api.delete(`/estimates/${estimate.id}`);
      toast.success("Estimate archived.");
      fetchEstimates();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to archive estimate.");
    }
    setConfirmArchive(null);
  };

  const restoreEstimate = async (estimate: Estimate) => {
    try {
      await api.patch(`/estimates/${estimate.id}/restore`);
      toast.success("Estimate restored.");
      fetchEstimates();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to restore estimate.");
    }
    setConfirmRestore(null);
  };

  const forceDeleteEstimate = async (estimate: Estimate) => {
    try {
      await api.delete(`/estimates/${estimate.id}/force`);
      toast.success("Estimate permanently deleted.");
      fetchEstimates();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete estimate.");
    }
    setConfirmForceDelete(null);
  };

  const canArchive = (status: string) =>
    ["DRAFT", "CANCELLED"].includes(status?.toUpperCase());

  /* ================= UI ================= */

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden">

      {/* Toolbar */}
      <DataToolbar
        searchPlaceholder="Search estimates..."
        onSearch={setSearch}
        filters={filterOptions}
        activeFilters={filters}
        onFilterChange={(key, value) =>
          setFilters((prev) => ({ ...prev, [key]: value }))
        }
        onAdd={() =>
          navigate("/webapp/sales/estimates/new-estimate")
        }
        addLabel="Create Estimate"
      />

      {/* Loading State */}
      {isLoading ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl px-2 overflow-hidden bg-background">
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">
              Loading estimates...
            </p>
          </div>
        </div>
      ) : estimates.length > 0 ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl overflow-hidden bg-background">

          <ScrollArea className="flex-1 px-3">
            <Table className="table-fixed w-full min-w-[1000px] border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-[15%]">Estimate No.</TableHead>
                  <TableHead className="text-center w-[10%]">Date</TableHead>
                  <TableHead className="text-center w-[20%]">Customer</TableHead>
                  <TableHead className="text-center w-[12%]">Plate Number</TableHead>
                  <TableHead className="text-center w-[8%]">Services</TableHead>
                  <TableHead className="text-center w-[8%]">Parts</TableHead>
                  <TableHead className="text-center w-[12%]">Total</TableHead>
                  <TableHead className="text-center w-[10%]">Status</TableHead>
                  <TableHead className="text-center w-[5%]"></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {estimates.length > 0 ? (
                  estimates.map((e) => {
                    const config = statusConfig[e.status] || { label: e.status, variant: "default" };

                    return (
                      <TableRow
                        key={e.id}
                        className={cn(
                          "cursor-pointer bg-card border rounded-lg hover:bg-accent/30 text-center",
                          e.deletedAt && "opacity-60"
                        )}
                      >
                        <TableCell
                          className="font-mono font-semibold text-center"
                          onClick={() => navigate(`/webapp/sales/estimates/${e.id}`)}
                        >
                          {e.estimate_number || e.id?.substring(0, 8)?.toUpperCase()}
                        </TableCell>

                        <TableCell
                          className="text-center text-muted-foreground"
                          onClick={() => navigate(`/webapp/sales/estimates/${e.id}`)}
                        >
                          {e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "-"}
                        </TableCell>

                        <TableCell
                          className="text-center font-medium"
                          onClick={() => navigate(`/webapp/sales/estimates/${e.id}`)}
                        >
                          {e.customer
                            ? `${e.customer.firstName ?? ""} ${e.customer.lastName ?? ""}`.trim() || "—"
                            : "—"}
                        </TableCell>

                        <TableCell
                          className="text-center"
                          onClick={() => navigate(`/webapp/sales/estimates/${e.id}`)}
                        >
                          {e.vehicle?.plate_number ? (
                            <span className="font-medium text-sm">{e.vehicle.plate_number}</span>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>

                        <TableCell
                          className="text-center font-semibold"
                          onClick={() => navigate(`/webapp/sales/estimates/${e.id}`)}
                        >
                          {e.services.length}
                        </TableCell>

                        <TableCell
                          className="text-center font-semibold"
                          onClick={() => navigate(`/webapp/sales/estimates/${e.id}`)}
                        >
                          {e.parts.length}
                        </TableCell>

                        <TableCell
                          className="text-center font-semibold"
                          onClick={() => navigate(`/webapp/sales/estimates/${e.id}`)}
                        >
                          ₱ {Number(e.total).toLocaleString()}
                        </TableCell>

                        <TableCell
                          className="text-center"
                          onClick={() => navigate(`/webapp/sales/estimates/${e.id}`)}
                        >
                          <Badge
                            variant={config.variant}
                            className="whitespace-nowrap px-3 justify-center"
                          >
                            {config.label}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon_xs" className="h-7 w-7 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {e.deletedAt ? (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => setConfirmRestore(e)}
                                    className="cursor-pointer"
                                  >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Restore
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => setConfirmForceDelete(e)}
                                    className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Permanently
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => navigate(`/webapp/sales/estimates/${e.id}`)}
                                    className="cursor-pointer"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {canArchive(e.status) && (
                                    <DropdownMenuItem
                                      onClick={() => setConfirmArchive(e)}
                                      className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Archive
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <div className="py-16 flex flex-col items-center text-center">
                        <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          {showArchived ? "No archived estimates" : "No estimate records found"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {showArchived ? "" : "Try adjusting your filters"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center">
            <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">
              {showArchived ? "No archived estimates" : "No estimate records available"}
            </p>
            <p className="text-xs text-muted-foreground">
              {showArchived ? "" : "Create an estimate to get started"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Archive Confirm */}
      <AlertDialog open={!!confirmArchive} onOpenChange={() => setConfirmArchive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Estimate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive {confirmArchive?.estimate_number || "this estimate"}? It will be hidden from the active list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmArchive && archiveEstimate(confirmArchive)}
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Confirm */}
      <AlertDialog open={!!confirmRestore} onOpenChange={() => setConfirmRestore(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Estimate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore {confirmRestore?.estimate_number || "this estimate"}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmRestore && restoreEstimate(confirmRestore)}>
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Force Delete Confirm */}
      <AlertDialog open={!!confirmForceDelete} onOpenChange={() => setConfirmForceDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Estimate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete {confirmForceDelete?.estimate_number || "this estimate"}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmForceDelete && forceDeleteEstimate(confirmForceDelete)}
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Estimates;
