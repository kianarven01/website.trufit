import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Pagination, usePagination } from "@/components/ui/pagination";
import DataToolbar from "@/components/DataToolbar";

import { ImageIcon } from "lucide-react";

/* ================= STORAGE ================= */
const JOB_ORDER_KEY = "jobOrders";
const VEHICLE_MODEL_KEY = "vehicleModels";

/* ================= TYPES ================= */
interface Customer {
  id: string;
  firstName: string;
  lastName: string;
}

interface Vehicle {
  id: string;
  customerId: string;
  vehicleModelId: string;
  plateNo: string;
}

interface VehicleModel {
  id: string;
  year: number;
  make: string;
  model: string;
}

interface JobOrder {
  id: string;
  jobOrderNo: string;
  customer: Customer;
  vehicle?: Vehicle | null;
  mileage?: number;
  linkedSO?: string | null;
  total: number;
  notes?: string;
  status: "issued"| "in progress" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

/* ================= COMPONENT ================= */

const JobOrderList: React.FC = () => {
  const navigate = useNavigate();

  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [search, setSearch] = useState("");

  const { page, setPage, pageSize, setPageSize, paginate } = usePagination(25);

  /* ================= LOAD ================= */

  useEffect(() => {
    try {
      const storedJobOrders = JSON.parse(localStorage.getItem(JOB_ORDER_KEY) || "[]");
      const storedModels = JSON.parse(localStorage.getItem(VEHICLE_MODEL_KEY) || "[]");
      setJobOrders(Array.isArray(storedJobOrders) ? storedJobOrders : []);
      setModels(Array.isArray(storedModels) ? storedModels : []);

    } catch (err) {console.error(err);
      setJobOrders([]);
      setModels([]);
    }
  }, []);

  /* ================= MAPS ================= */

  const modelMap = useMemo(() => {
    const map = new Map<string, VehicleModel>();

    models.forEach((m) => { map.set(m.id, m);});
    return map;
  }, [models]);

  /* ================= HELPERS ================= */

  const normalize = (val: string) =>
    (val || "").toLowerCase().trim();

  /* ================= FILTER ================= */

  const filtered = useMemo(() => {
    const q = normalize(search);

    return [...jobOrders]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )

      .filter((jo) => {
        const customer = jo.customer;
        const vehicle = jo.vehicle;
        const model = vehicle
          ? modelMap.get(vehicle.vehicleModelId)
          : null;

        const fullName = customer
          ? `${customer.firstName} ${customer.lastName}`
          : "";

        const vehicleText =
          vehicle && model
            ? `${model.year} ${model.make} ${model.model} ${vehicle.plateNo}`
            : "";

        const blob = normalize(`
          ${jo.jobOrderNo}
          ${fullName}
          ${vehicleText}
          ${jo.status}
          ${jo.linkedSO || ""}
        `);

        return !q || blob.includes(q);
      });

  }, [jobOrders, search, modelMap]);


  const paginated = paginate(filtered);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize, setPage]);

  /* ================= UI ================= */

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden">
      <DataToolbar
        searchPlaceholder="Search job orders..."
        onSearch={setSearch}
        onAdd={() =>
          navigate(
            "/webapp/services/job-orders/new-job-order"
          )
        }
        addLabel="New Job Order"
      />

      {jobOrders.length > 0 ? (
        <div className="flex-1 flex flex-col border border-border/60 rounded-xl overflow-hidden bg-background">

          <ScrollArea className="flex-1 px-3">
            <Table className="table-fixed w-full border-separate border-spacing-y-2">

              <TableHeader>
                <TableRow>
                  <TableHead className="w-[14%]">JO #</TableHead>
                  <TableHead className="w-[22%]">Customer</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead className="w-[18%]"></TableHead>
                  <TableHead className="w-[14%]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>

                {filtered.length > 0 ? (

                  paginated.map((jo) => {
                    const customer = jo.customer;
                    const vehicle = jo.vehicle;
                    const model = vehicle
                      ? modelMap.get(
                          vehicle.vehicleModelId
                        )
                      : null;

                    return (
                      <TableRow
                        key={jo.id}
                        onClick={() =>
                          navigate(
                            `/webapp/services/job-orders/${jo.id}`
                          )
                        }
                        className="rounded-lg border bg-card shadow-sm hover:shadow-md cursor-pointer transition-all"
                      >
                        {/* JO NUMBER */}
                        <TableCell className="font-medium">
                          {jo.jobOrderNo}
                        </TableCell>

                        {/* CUSTOMER */}
                        <TableCell>
                          {customer
                            ? `${customer.firstName} ${customer.lastName}`
                            : "—"}
                        </TableCell>

                        {/* VEHICLE */}
                        <TableCell className="py-0">
                          {vehicle && model ? (
                            <div className="flex flex-col">
                              <span>
                                {model.year}{" "}
                                {model.make}{" "}
                                {model.model}
                              </span>

                              <span className="text-xs text-muted-foreground">
                                {vehicle.plateNo}
                              </span>
                            </div>

                          ) : (
                            "—"
                          )}

                        </TableCell>
                        {/* DATE */}
                        <TableCell className="py-0">
                          <div className="flex flex-col">
                            <span>
                              {new Date(
                                jo.createdAt
                              ).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(
                                jo.createdAt
                              ).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                            </span>
                          </div>
                        </TableCell>

                        {/* STATUS */}
                        <TableCell>
                          <Badge
                            variant={
                              jo.status ===
                              "completed"
                                ? "default"
                                : "secondary"
                            }
                            className="capitalize"
                          >
                            {jo.status}
                          </Badge>
                        </TableCell>

                      </TableRow>
                    );
                  })

                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="py-16 flex flex-col items-center text-center">
                        <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          No job orders found
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Try adjusting your search
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>

          {filtered.length > 0 && (
            <div className="border-t bg-background mx-3">
              <Pagination
                totalItems={filtered.length}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          )}        
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center">
            <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">No Job Orders available</p>
            <p className="text-xs text-muted-foreground">
              Generate a job order to get started
            </p>
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default JobOrderList;