import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MasterDetailPanel, ColumnDef } from "@/components/MasterDetailPanel";

import CustomerModal from "@/components/popupModal/addCustomer"; // Fixed import
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Car, Edit } from "lucide-react";

interface Vehicle {
  yearMakeModel: string;
  color: string;
  plateNo: string;
  vin: string;
  kilometers: number;
  engineNo: string;
}

interface Customer {
  id: string;
  name: string;
  address: string;
  mobileNumber: string;
  landline?: string;
  email: string;
  businessPhone?: string;
  vehicles: Vehicle[];
}

const dummyCustomers: Customer[] = [
  {
    id: "1",
    name: "John Doe",
    address: "123 Main St, Springfield",
    mobileNumber: "+1 555 123 456",
    landline: "555-0001",
    email: "john@example.com",
    businessPhone: undefined,
    vehicles: [
      {
        yearMakeModel: "2020 Toyota Camry",
        color: "White",
        plateNo: "ABC1234",
        vin: "1HGCM82633A004352",
        kilometers: 15000,
        engineNo: "ENG123456",
      },
      {
        yearMakeModel: "2018 Honda Civic",
        color: "Black",
        plateNo: "XYZ5678",
        vin: "2HGFB2F50FH004352",
        kilometers: 30000,
        engineNo: "ENG987654",
      },
    ],
  },
  {
    id: "2",
    name: "Jane Smith",
    address: "456 Elm St, Metropolis",
    mobileNumber: "+1 555 987 654",
    landline: "555-0002",
    email: "jane@example.com",
    businessPhone: "+1 555 888 777",
    vehicles: [
      {
        yearMakeModel: "2019 Ford F-150",
        color: "Blue",
        plateNo: "TRK1234",
        vin: "1FTFW1E50KFA00432",
        kilometers: 20000,
        engineNo: "ENG654321",
      },
    ],
  },
];

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(dummyCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const handleCustomerSaved = (customer: Customer) => {
    setCustomers((prev) => {
      const exists = prev.find((c) => c.id === customer.id);
      if (exists) {
        return prev.map((c) => (c.id === customer.id ? customer : c));
      }
      return [...prev, customer];
    });
    setSelectedCustomer(customer);
  };

  const columns: ColumnDef<Customer>[] = [
    {
      key: "name",
      label: "Name",
      render: (c) => (
        <div>
          <div className="font-semibold text-foreground">{c.name}</div>
          <div className="text-xs text-muted-foreground">{c.email}</div>
        </div>
      ),
    },
    {
      key: "mobileNumber",
      label: "Mobile",
      render: (c) => c.mobileNumber,
    },
    {
      key: "landline",
      label: "Landline",
      render: (c) => c.landline || "—",
    },
    {
      key: "address",
      label: "Address",
      render: (c) => c.address,
    },
    {
      key: "vehicles",
      label: "Vehicles",
      render: (c) => c.vehicles.length,
    },
  ];

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.mobileNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  return (
    <DashboardLayout>
      <MasterDetailPanel<Customer>
        title="Customers"
        description="Manage customer information"
        items={filteredCustomers}
        selectedItem={selectedCustomer}
        onSelect={setSelectedCustomer}
        getItemId={(c) => c.id}
        columns={columns}
        onSearch={setSearchQuery}
        onAdd={() => {
          setEditingCustomer(null);
          setCustomerModalOpen(true);
        }}
        addLabel="Add Customer"
      >
        {selectedCustomer && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {selectedCustomer.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedCustomer.id} · Customer Details
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  setEditingCustomer(selectedCustomer);
                  setCustomerModalOpen(true);
                }}
              >
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Button>
            </div>

            <Separator />

            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Detail label="Mobile" value={selectedCustomer.mobileNumber} />
              <Detail label="Landline" value={selectedCustomer.landline || "—"} />
              <Detail label="Email" value={selectedCustomer.email} />
              <Detail
                label="Business Phone"
                value={selectedCustomer.businessPhone || "—"}
              />
              <Detail label="Address" value={selectedCustomer.address} />
              <Detail label="Vehicles">
                <Badge variant="outline">{selectedCustomer.vehicles.length}</Badge>
              </Detail>
            </div>

            <Separator />

            {/* Vehicles */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-3">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  Registered Vehicles ({selectedCustomer.vehicles.length})
                </p>
                <Button variant="outline" size="sm">
                  Add Vehicle
                </Button>
              </div>

              <div className="space-y-2">
                {selectedCustomer.vehicles.map((v, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-border p-3 bg-muted/30 text-sm"
                  >
                    <p className="font-medium text-foreground">{v.yearMakeModel}</p>
                    <div className="grid grid-cols-2 gap-1 mt-1 text-xs text-muted-foreground">
                      <span>Color: {v.color}</span>
                      <span>Plate: {v.plateNo}</span>
                      <span>VIN: {v.vin}</span>
                      <span>KM: {v.kilometers.toLocaleString()}</span>
                      <span>Engine: {v.engineNo}</span>
                    </div>
                  </div>
                ))}

                {selectedCustomer.vehicles.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No vehicles registered.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </MasterDetailPanel>

      <CustomerModal
        open={customerModalOpen}
        onOpenChange={setCustomerModalOpen}
        customer={editingCustomer}
        onSaved={handleCustomerSaved}
      />
    </DashboardLayout>
  );
};

export default Customers;

function Detail({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      {children || <p className="font-medium text-foreground">{value}</p>}
    </div>
  );
}