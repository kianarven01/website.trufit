import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Pagination, usePagination } from "@/components/ui/pagination";
import DataToolbar from "@/components/DataToolbar";
import { Button } from "@/components/ui/button";

import { ImageIcon } from "lucide-react";

/* ================= STORAGE ================= */
const JOB_ORDER_KEY = "jobOrders";
const CUSTOMER_KEY = "customers";
const VEHICLE_KEY = "vehicles";
const VEHICLE_MODEL_KEY = "vehicleModels";

/* ================= TYPES ================= */
interface JobOrder {
  id: string;
  customerId: string;
  vehicleId: string;
  salesOrderId?: string;
  technicianId?: string;
  dateTime: string;
  status: string;
}

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

/* ================= COMPONENT ================= */
const JobOrderList: React.FC = () => {
  const navigate = useNavigate();

  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [search, setSearch] = useState("");

  const { page, setPage, pageSize, setPageSize, paginate } =
    usePagination(25);


/* ================= SEED HELPERS ================= */
const genId = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2);

const seedBaseData = () => {
  let customers: Customer[] = JSON.parse(localStorage.getItem(CUSTOMER_KEY) || "[]");
  let vehicles: Vehicle[] = JSON.parse(localStorage.getItem(VEHICLE_KEY) || "[]");
  let models: VehicleModel[] = JSON.parse(localStorage.getItem(VEHICLE_MODEL_KEY) || "[]");

  /* -------- VEHICLE MODELS -------- */
  if (models.length === 0) {
    models = [
      { id: genId(), year: 2020, make: "Toyota", model: "Vios" },
      { id: genId(), year: 2022, make: "Honda", model: "Civic" },
      { id: genId(), year: 2021, make: "Mitsubishi", model: "Montero" },
      { id: genId(), year: 2019, make: "Ford", model: "Ranger" },
      { id: genId(), year: 2023, make: "Nissan", model: "Navara" },
    ];

    localStorage.setItem(VEHICLE_MODEL_KEY, JSON.stringify(models));
  }

  /* -------- CUSTOMERS -------- */
  if (customers.length === 0) {
    customers = Array.from({ length: 10 }).map((_, i) => ({
      id: genId(),
      firstName: `Customer`,
      lastName: `${i + 1}`,
    }));

    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customers));
  }

  /* -------- VEHICLES -------- */
  if (vehicles.length === 0) {
    vehicles = customers.map((c, i) => ({
      id: genId(),
      customerId: c.id,
      vehicleModelId: models[i % models.length].id,
      plateNo: `ABC-${100 + i}`,
    }));

    localStorage.setItem(VEHICLE_KEY, JSON.stringify(vehicles));
  }

  return { customers, vehicles, models };
};

/* ================= JOB ORDER SEED ================= */
const seedJobOrders = () => {
  if (localStorage.getItem(JOB_ORDER_KEY)) return;

  const { customers, vehicles } = seedBaseData();

  const statuses = ["Pending", "In Progress", "Completed", "Cancelled"];

  const jobOrders: JobOrder[] = [];

  for (let i = 0; i < 27; i++) {
    const customer = customers[i % customers.length];
    const vehicle = vehicles[i % vehicles.length];

    const date = new Date();
    date.setDate(date.getDate() - i);

    jobOrders.push({
      id: genId(),
      customerId: customer.id,
      vehicleId: vehicle.id,
      salesOrderId: `SO-${1000 + i}`,
      technicianId: `TECH-${(i % 5) + 1}`,
      dateTime: date.toISOString(),
      status: statuses[i % statuses.length],
    });
  }

  localStorage.setItem(JOB_ORDER_KEY, JSON.stringify(jobOrders));
};
  /* ================= LOAD ================= */
useEffect(() => {
  seedJobOrders();

  setJobOrders(JSON.parse(localStorage.getItem(JOB_ORDER_KEY) || "[]"));
  setCustomers(JSON.parse(localStorage.getItem(CUSTOMER_KEY) || "[]"));
  setVehicles(JSON.parse(localStorage.getItem(VEHICLE_KEY) || "[]"));
  setModels(JSON.parse(localStorage.getItem(VEHICLE_MODEL_KEY) || "[]"));
}, []);

  /* ================= MAPS ================= */
  const customerMap = useMemo(() => {
    const map = new Map<string, Customer>();
    customers.forEach((c) => map.set(c.id, c));
    return map;
  }, [customers]);

  const vehicleMap = useMemo(() => {
    const map = new Map<string, Vehicle>();
    vehicles.forEach((v) => map.set(v.id, v));
    return map;
  }, [vehicles]);

  const modelMap = useMemo(() => {
    const map = new Map<string, VehicleModel>();
    models.forEach((m) => map.set(m.id, m));
    return map;
  }, [models]);

  /* ================= SEARCH ================= */
  const normalize = (val: string) =>
    (val || "").toLowerCase().trim();

  const filtered = useMemo(() => {
    const q = normalize(search);

    return jobOrders.filter((jo) => {
      const customer = customerMap.get(jo.customerId);
      const vehicle = vehicleMap.get(jo.vehicleId);
      const model = modelMap.get(vehicle?.vehicleModelId || "");

      const fullName = `${customer?.firstName || ""} ${customer?.lastName || ""}`;
      const vehicleText = `${model?.year || ""} ${model?.make || ""} ${model?.model || ""} ${vehicle?.plateNo || ""}`;

      const blob = normalize(`
        ${jo.id}
        ${fullName}
        ${vehicleText}
        ${jo.status}
      `);

      return !q || blob.includes(q);
    });
  }, [jobOrders, search, customerMap, vehicleMap, modelMap]);

  const paginated = paginate(filtered);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);


  /* ================= UI ================= */
  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden">
      <DataToolbar
        searchPlaceholder="Search job orders..."
        onSearch={setSearch}
        onAdd={() => navigate("/webapp/services/job-orders/new-job-order")}
        addLabel="New Job Order"
      />

      {jobOrders.length > 0 ? (
        <div className="flex-1 flex flex-col border rounded-xl overflow-hidden">

        <ScrollArea className="flex-1 px-3">
          <Table className="table-fixed w-full border-separate border-spacing-y-2">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[10%]">JO #</TableHead>
                <TableHead className="w-1/5">Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Assigned Technician</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[15%]">Status</TableHead>                
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.length > 0 ? (
                paginated.map((jo) => {
                  const customer = customerMap.get(jo.customerId);
                  const vehicle = vehicleMap.get(jo.vehicleId);
                  const model = modelMap.get(vehicle?.vehicleModelId || "");

                  return (
                    <TableRow
                      key={jo.id}
                      onClick={() => 
                        navigate(`/webapp/services/job-orders/${jo.id}`)
                      }
                      className="rounded-lg border bg-card shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <TableCell>
                        JO-{jo.id.slice(0,6)}
                      </TableCell>
                      <TableCell>{customer ? `${customer.firstName} ${customer.lastName}` : "—"}</TableCell>
                      <TableCell className="py-0">
                        {vehicle && model ? (
                          <div className="flex flex-col">
                            <span>
                              {model.year} {model.make} {model.model}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {vehicle.plateNo}
                            </span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>{jo ? jo.technicianId : "Unassigned"}</TableCell>
                      <TableCell className="py-0">
                        <div className="flex flex-col">
                          <span>
                            {new Date(jo.dateTime).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(jo.dateTime).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge>{jo.status}</Badge>
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