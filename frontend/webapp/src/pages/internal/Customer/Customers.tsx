import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Pagination, usePagination } from "@/components/ui/pagination";
import DataToolbar from "@/components/DataToolbar";
import CustomerFormModal from "@/components/popupModal/Customers/addCustomer";
import { ImageIcon } from "lucide-react";
import api from "@/api/axios";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  mobileNumber: string;
  landline?: string;
  email?: string;
  businessPhone?: string;
}

interface VehicleModel {
  id: string;
  year: number;
  make: string;
  model: string;
  variant: string;
}

interface Vehicle {
  id: string;
  customerId: string;
  vehicleModelId: string;
  color: string;
  plateNo: string;
  engineNo: string;
  vin: string;
  registrationNo: string;
  sellingDealer: string;
  hasWarranty?: boolean;
}

/* ================= STORAGE ================= */
const STORAGE_KEY = "customers";
const VEHICLE_STORAGE_KEY = "vehicles";
const VEHICLE_MODEL_STORAGE_KEY = "vehicleModels";


const CustomersList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);

  const { page, setPage, pageSize, setPageSize, paginate } =
    usePagination(25);

  const getFullName = (c: Customer) =>
    `${c.firstName} ${c.lastName}`.trim();

  const [filters, setFilters] = useState({
    warranty: "all",
    make: "all",
    model: "all",
  });


  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get('/customers');
        const parsed = res.data.data.map((c: any) => ({
          id: c.customer_id?.toString() || "",
          firstName: c.first_name || "",
          lastName: c.last_name || "",
          address: c.address || "",
          mobileNumber: c.mobile_number || "",
          landline: c.landline || "",
          email: c.email || "",
          businessPhone: c.business || "",
          vehicles: c.vehicles || []
        }));
        setCustomers(parsed);
        
        // Extract all vehicles from customers
        const allVehicles: Vehicle[] = [];
        parsed.forEach((c: any) => {
            if (c.vehicles) {
                c.vehicles.forEach((v: any) => {
                    allVehicles.push({
                        id: v.plate_number,
                        customerId: c.id,
                        vehicleModelId: v.variant_id?.toString() || "",
                        color: v.Color,
                        plateNo: v.plate_number,
                        engineNo: v.engine_number,
                        vin: v.VIN,
                        registrationNo: v['registration_number'],
                        sellingDealer: v.selling_dealer,
                        hasWarranty: false
                    });
                });
            }
        });
        setVehicles(allVehicles);
      } catch (err) {
        console.error("Failed to load customers", err);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await api.get('/products/vehicles');
        const models = res.data.data.flatMap((m: any) => {
          return m.variants.length > 0 ? m.variants.map((v: any) => ({
            id: v.id.toString(),
            year: v.year,
            make: m.manufacturer?.name || "",
            model: m.model,
            variant: v.variant_name
          })) : [{
            id: m.id.toString(),
            year: 0,
            make: m.manufacturer?.name || "",
            model: m.model,
            variant: ""
          }];
        });
        setVehicleModels(models);
      } catch (error) {
        console.error("Failed to load models", error);
      }
    };
    fetchModels();
  }, []);


  const vehicleModelsMap = useMemo(() => {
    const map = new Map<string, VehicleModel>();
    vehicleModels.forEach((m) => map.set(m.id, m));
    return map;
  }, [vehicleModels]);

  const vehiclesByCustomer = useMemo(() => {
    const map = new Map<string, Vehicle[]>();
    vehicles.forEach((v) => {
      if (!map.has(v.customerId)) map.set(v.customerId, []);
      map.get(v.customerId)!.push(v);
    });
    return map;
  }, [vehicles]);  




  /* SEARCH & FILTER */
  const normalize = (val: string) =>
    (val || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  const filtered = useMemo(() => {
    const q = normalize(search);
  

  return customers.filter((c) => {
    const fullName = normalize(`${c.firstName} ${c.lastName}`);
    const address = normalize(c.address);

    const customerVehicles = vehiclesByCustomer.get(c.id) || [];

    // APPLY VEHICLE FILTERS
    let matchesVehicleFilter = true;
    
    // Only apply strict vehicle filtering if a specific filter is active
    if (filters.warranty !== "all" || filters.make !== "all" || filters.model !== "all") {
        if (customerVehicles.length === 0) {
            matchesVehicleFilter = false;
        } else {
            matchesVehicleFilter = customerVehicles.some((v) => {
                const m = vehicleModelsMap.get(v.vehicleModelId);
                
                if (filters.warranty === "yes" && !v.hasWarranty) return false;
                if (filters.warranty === "no" && v.hasWarranty) return false;
                
                // If filtering by make/model, we MUST have a model match
                if (filters.make !== "all" || filters.model !== "all") {
                    if (!m) return false;
                    if (filters.make !== "all" && m.make !== filters.make) return false;
                    if (filters.model !== "all" && m.model !== filters.model) return false;
                }

                return true;
            });
        }
    }

    const vehicleText = customerVehicles
      .map((v) => {
        const m = vehicleModelsMap.get(v.vehicleModelId);
        return normalize(
          `${v.plateNo} ${m?.make || ""} ${m?.model || ""}`
        );
      })
      .join(" ");

    const tokens = q.split(" ").filter(Boolean);

    const matchesSearch =
      tokens.length === 0 ||
      tokens.every((t) =>
        fullName.includes(t) ||
        address.includes(t) ||
        vehicleText.includes(t)
      );

    return matchesSearch && matchesVehicleFilter;
  });
}, [customers, vehiclesByCustomer, vehicleModelsMap, search, filters]);

const makeOptions = useMemo(() => {
  const makes = new Set<string>();

  vehicles.forEach((v) => {
    const m = vehicleModelsMap.get(v.vehicleModelId);
    if (m?.make) makes.add(m.make);
  });

  return Array.from(makes).sort().map((make) => ({
    label: make,
    value: make,
  }));
}, [vehicles, vehicleModelsMap]);

const modelOptions = useMemo(() => {
  const models = new Set<string>();

  vehicles.forEach((v) => {
    const m = vehicleModelsMap.get(v.vehicleModelId);

    if (!m) return;

    if (filters.make === "all" || m.make === filters.make) {
      models.add(m.model);
    }
  });

  return Array.from(models).sort().map((model) => ({
    label: model,
    value: model,
  }));
}, [vehicles, vehicleModelsMap, filters.make]);

const handleFilterChange = (key: string, value: string) => {
  setFilters((prev) => {
    const next = { ...prev, [key]: value };

    if (key === "make") {
      next.model = "all";
    }

    return next;
  });
};

const warrantyOptions = [
  { label: "With Warranty", value: "yes" },
  { label: "No Warranty", value: "no" },
];

const toolbarFilters = [
  {
    key: "warranty",
    label: "Warranty",
    options: warrantyOptions,
  },
  {
    key: "make",
    label: "Manufacturer",
    options: makeOptions,
  },
  {
    key: "model",
    label: "Model",
    options: modelOptions,
  },
];

  const paginated = paginate(filtered);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden">
      <DataToolbar
        searchPlaceholder="Search customers or vehicles..."
        onSearch={setSearch}
        onAdd={() => setCustomerModalOpen(true)}
        addLabel="Add Customer"
        
        filters={toolbarFilters}
        onFilterChange={handleFilterChange}
        activeFilters={filters}
      />

      {customers.length > 0 ? (
        <div className="flex-1 flex flex-col border rounded-xl px-2 overflow-hidden">

          <ScrollArea className="flex-1">
            <Table className="table-fixed w-full border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4">Name</TableHead>
                  <TableHead className="w-1/4">Address</TableHead>
                  <TableHead className="w-1/5">Mobile</TableHead>
                  <TableHead className="w-1/5">Landline</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.length > 0 ? (
                  paginated.map((c) => (
                    <TableRow
                      key={c.id}
                      onClick={() => navigate(`${c.id}`)}
                      className={cn(
                        "cursor-pointer transition-all rounded-lg border border-border/60 bg-card shadow-sm hover:shadow-md",
                        "hover:bg-accent/30"
                      )}
                    >
                      <TableCell className="py-0.5">
                        <div className="flex flex-col">
                          <p className="font-medium">{getFullName(c)}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.email || "—" }
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{c.address}</TableCell>
                      <TableCell>{c.mobileNumber}</TableCell>
                      <TableCell>{c.landline || "—"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="py-16 flex flex-col items-center text-center">
                        <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          No customers found
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
            <div className="border-t bg-background">
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
            <p className="text-sm font-medium">No customers available</p>
            <p className="text-xs text-muted-foreground">
              Add a customer to get started
            </p>
          </CardContent>
        </Card>
      )}

      <CustomerFormModal
        open={customerModalOpen}
        onOpenChange={setCustomerModalOpen}
        onSaved={(newCustomer: any) => {
          // Re-fetch everything or manually map. For safety, full page reload is reliable,
          // but we can just map the new customer:
          const parsed = {
            id: newCustomer.customer_id?.toString() || "",
            firstName: newCustomer.first_name || "",
            lastName: newCustomer.last_name || "",
            address: newCustomer.address || "",
            mobileNumber: newCustomer.mobile_number || "",
            landline: newCustomer.landline || "",
            email: newCustomer.email || "",
            businessPhone: newCustomer.business || "",
            vehicles: newCustomer.vehicles || []
          };
          setCustomers((prev) => [parsed, ...prev]);
          
          if (newCustomer.vehicles) {
             const newVehicles = newCustomer.vehicles.map((v: any) => ({
                 id: v.plate_number,
                 customerId: parsed.id,
                 vehicleModelId: v.variant_id?.toString() || "",
                 color: v.Color,
                 plateNo: v.plate_number,
                 engineNo: v.engine_number,
                 vin: v.VIN,
                 registrationNo: v['registration_number'],
                 sellingDealer: v.selling_dealer,
                 hasWarranty: false
             }));
             setVehicles((prev) => [...prev, ...newVehicles]);
          }
        }}
      />
    </div>
  );
};

export default CustomersList;