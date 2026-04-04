import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MasterDetailPanel, ColumnDef } from "@/components/MasterDetailPanel";
import { FilterOption } from "@/components/PageShell";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const MOCK_DATA = [
  { id: "APT-001", customer: "Juan Dela Cruz", vehicle: "Toyota Vios 2020", service: "Oil Change", date: "2024-02-22", time: "9:00 AM", status: "confirmed" },
  { id: "APT-002", customer: "Maria Santos", vehicle: "Honda Civic 2019", service: "Brake Check", date: "2024-02-22", time: "10:30 AM", status: "pending" },
  { id: "APT-003", customer: "Pedro Reyes", vehicle: "Montero 2021", service: "Full Detailing", date: "2024-02-23", time: "8:00 AM", status: "pending" },
  { id: "APT-004", customer: "Ana Garcia", vehicle: "Ford Ranger 2022", service: "Tire Change", date: "2024-02-23", time: "1:00 PM", status: "confirmed" },
  { id: "APT-005", customer: "Luis Mendoza", vehicle: "Nissan Navara 2020", service: "AC Check", date: "2024-02-24", time: "11:00 AM", status: "cancelled" },
  { id: "APT-006", customer: "Sofia Lim", vehicle: "Hyundai Accent 2023", service: "PMS", date: "2024-02-25", time: "2:00 PM", status: "pending" },
  { id: "APT-001", customer: "Juan Dela Cruz", vehicle: "Toyota Vios 2020", service: "Oil Change", date: "2024-02-22", time: "9:00 AM", status: "confirmed" },
  { id: "APT-002", customer: "Maria Santos", vehicle: "Honda Civic 2019", service: "Brake Check", date: "2024-02-22", time: "10:30 AM", status: "pending" },
  { id: "APT-003", customer: "Pedro Reyes", vehicle: "Montero 2021", service: "Full Detailing", date: "2024-02-23", time: "8:00 AM", status: "pending" },
  { id: "APT-004", customer: "Ana Garcia", vehicle: "Ford Ranger 2022", service: "Tire Change", date: "2024-02-23", time: "1:00 PM", status: "confirmed" },
  { id: "APT-005", customer: "Luis Mendoza", vehicle: "Nissan Navara 2020", service: "AC Check", date: "2024-02-24", time: "11:00 AM", status: "cancelled" },
  { id: "APT-006", customer: "Sofia Lim", vehicle: "Hyundai Accent 2023", service: "PMS", date: "2024-02-25", time: "2:00 PM", status: "pending" },
  { id: "APT-001", customer: "Juan Dela Cruz", vehicle: "Toyota Vios 2020", service: "Oil Change", date: "2024-02-22", time: "9:00 AM", status: "confirmed" },
  { id: "APT-002", customer: "Maria Santos", vehicle: "Honda Civic 2019", service: "Brake Check", date: "2024-02-22", time: "10:30 AM", status: "pending" },
  { id: "APT-003", customer: "Pedro Reyes", vehicle: "Montero 2021", service: "Full Detailing", date: "2024-02-23", time: "8:00 AM", status: "pending" },
  { id: "APT-004", customer: "Ana Garcia", vehicle: "Ford Ranger 2022", service: "Tire Change", date: "2024-02-23", time: "1:00 PM", status: "confirmed" },
  { id: "APT-005", customer: "Luis Mendoza", vehicle: "Nissan Navara 2020", service: "AC Check", date: "2024-02-24", time: "11:00 AM", status: "cancelled" },
  { id: "APT-006", customer: "Sofia Lim", vehicle: "Hyundai Accent 2023", service: "PMS", date: "2024-02-25", time: "2:00 PM", status: "pending" },
  { id: "APT-001", customer: "Juan Dela Cruz", vehicle: "Toyota Vios 2020", service: "Oil Change", date: "2024-02-22", time: "9:00 AM", status: "confirmed" },
  { id: "APT-002", customer: "Maria Santos", vehicle: "Honda Civic 2019", service: "Brake Check", date: "2024-02-22", time: "10:30 AM", status: "pending" },
  { id: "APT-003", customer: "Pedro Reyes", vehicle: "Montero 2021", service: "Full Detailing", date: "2024-02-23", time: "8:00 AM", status: "pending" },
  { id: "APT-004", customer: "Ana Garcia", vehicle: "Ford Ranger 2022", service: "Tire Change", date: "2024-02-23", time: "1:00 PM", status: "confirmed" },
  { id: "APT-005", customer: "Luis Mendoza", vehicle: "Nissan Navara 2020", service: "AC Check", date: "2024-02-24", time: "11:00 AM", status: "cancelled" },
  { id: "APT-006", customer: "Sofia Lim", vehicle: "Hyundai Accent 2023", service: "PMS", date: "2024-02-25", time: "2:00 PM", status: "pending" },
  { id: "APT-001", customer: "Juan Dela Cruz", vehicle: "Toyota Vios 2020", service: "Oil Change", date: "2024-02-22", time: "9:00 AM", status: "confirmed" },
  { id: "APT-002", customer: "Maria Santos", vehicle: "Honda Civic 2019", service: "Brake Check", date: "2024-02-22", time: "10:30 AM", status: "pending" },
  { id: "APT-003", customer: "Pedro Reyes", vehicle: "Montero 2021", service: "Full Detailing", date: "2024-02-23", time: "8:00 AM", status: "pending" },
  { id: "APT-004", customer: "Ana Garcia", vehicle: "Ford Ranger 2022", service: "Tire Change", date: "2024-02-23", time: "1:00 PM", status: "confirmed" },
  { id: "APT-005", customer: "Luis Mendoza", vehicle: "Nissan Navara 2020", service: "AC Check", date: "2024-02-24", time: "11:00 AM", status: "cancelled" },
  { id: "APT-006", customer: "Sofia Lim", vehicle: "Hyundai Accent 2023", service: "PMS", date: "2024-02-25", time: "2:00 PM", status: "pending" },
  { id: "APT-001", customer: "Juan Dela Cruz", vehicle: "Toyota Vios 2020", service: "Oil Change", date: "2024-02-22", time: "9:00 AM", status: "confirmed" },
  { id: "APT-002", customer: "Maria Santos", vehicle: "Honda Civic 2019", service: "Brake Check", date: "2024-02-22", time: "10:30 AM", status: "pending" },
  { id: "APT-003", customer: "Pedro Reyes", vehicle: "Montero 2021", service: "Full Detailing", date: "2024-02-23", time: "8:00 AM", status: "pending" },
  { id: "APT-004", customer: "Ana Garcia", vehicle: "Ford Ranger 2022", service: "Tire Change", date: "2024-02-23", time: "1:00 PM", status: "confirmed" },
  { id: "APT-005", customer: "Luis Mendoza", vehicle: "Nissan Navara 2020", service: "AC Check", date: "2024-02-24", time: "11:00 AM", status: "cancelled" },
  { id: "APT-006", customer: "Sofia Lim", vehicle: "Hyundai Accent 2023", service: "PMS", date: "2024-02-25", time: "2:00 PM", status: "pending" },
];

const STATUS_MAP: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
  completed: "bg-blue-500/20 text-blue-400",
};

type Item = typeof MOCK_DATA[0];

const columns: ColumnDef<Item>[] = [
  { key: "id", label: "ID" },
  { key: "customer", label: "Customer" },
  { key: "service", label: "Service" },
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "status", label: "Status", render: (d) => <Badge variant="outline" className={STATUS_MAP[d.status]}>{d.status}</Badge> },
];

const filters: FilterOption[] = [
  { key: "status", label: "Status", options: [{ value: "pending", label: "Pending" }, { value: "confirmed", label: "Confirmed" }, { value: "cancelled", label: "Cancelled" }] },
];

export default function Appointments() {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Item | null>(null);

  const filtered = MOCK_DATA.filter((d) => {
    if (search && !`${d.id} ${d.customer} ${d.service}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeFilters.status && activeFilters.status !== "all" && d.status !== activeFilters.status) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <MasterDetailPanel
        title="Appointments"
        description="Schedule and manage customer appointments"
        items={filtered}
        selectedItem={selected}
        onSelect={(item) => setSelected(item)}
        getItemId={(d) => d.id}
        columns={columns}
        searchPlaceholder="Search appointments..."
        filters={filters}
        onSearch={setSearch}
        onFilterChange={(k, v) => setActiveFilters((p) => ({ ...p, [k]: v }))}
        activeFilters={activeFilters}
        onAdd={() => {}}
      >
        {selected && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-primary">{selected.id}</h2>
              <p className="text-sm text-muted-foreground">Appointment Details</p>
            </div>
            <Separator />
            <div className="grid grid-cols-4 gap-4 text-sm">
              <Detail label="Customer" value={selected.customer} />
              <Detail label="Vehicle" value={selected.vehicle} />
              <Detail label="Service" value={selected.service} />
              <Detail label="Date" value={selected.date} />
              <Detail label="Time" value={selected.time} />
              <Detail label="Status">
                <Badge variant="outline" className={STATUS_MAP[selected.status]}>{selected.status}</Badge>
              </Detail>
            </div>
          </div>
        )}
      </MasterDetailPanel>
    </DashboardLayout>
  );
}

function Detail({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      {children || <p className="font-medium text-foreground">{value}</p>}
    </div>
  );
}
