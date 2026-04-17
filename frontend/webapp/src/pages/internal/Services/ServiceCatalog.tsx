import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageShell, ColumnDef } from "@/components/PageShell";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Edit } from "lucide-react";

interface ServiceItem {
  id: string;
  service: string;
  category: string;
  price: number;
  additionalPerHour: number | null;
}

const ServiceCatalog: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([
    {
      id: "1",
      service: "Oil Change",
      category: "Engine Maintenance",
      price: 1500,
      additionalPerHour: 500,
    },
    {
      id: "2",
      service: "Brake Pad Replacement",
      category: "Brake System",
      price: 3500,
      additionalPerHour: 500,
    },
  ]);

  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceItem | null>(null);

  const [form, setForm] = useState({
    service: "",
    category: "",
    price: "",
    additionalPerHour: "",
  });

  const filteredServices = useMemo(() => {
    if (!search) return services;

    return services.filter((s) =>
      `${s.service} ${s.category}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [services, search]);

  const openAdd = () => {
    setEditing(null);
    setForm({
      service: "",
      category: "",
      price: "",
      additionalPerHour: "",
    });
    setOpen(true);
  };

  const openEdit = (item: ServiceItem) => {
    setEditing(item);
    setForm({
      service: item.service,
      category: item.category,
      price: String(item.price),
      additionalPerHour:
        item.additionalPerHour !== null ? String(item.additionalPerHour) : "",
    });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.service || !form.category || !form.price) return;

    const additionalPerHourValue =
      form.additionalPerHour.trim() === ""
        ? null
        : Number(form.additionalPerHour);

    if (editing) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === editing.id
            ? {
                ...s,
                service: form.service,
                category: form.category,
                price: Number(form.price),
                additionalPerHour: additionalPerHourValue,
              }
            : s
        )
      );
    } else {
      const newItem: ServiceItem = {
        id: crypto.randomUUID(),
        service: form.service,
        category: form.category,
        price: Number(form.price),
        additionalPerHour: additionalPerHourValue,
      };

      setServices((prev) => [...prev, newItem]);
    }

    setOpen(false);
  };

  const columns: ColumnDef<ServiceItem>[] = [
    {
      key: "service",
      label: "Service",
    },
    {
      key: "category",
      label: "Category",
    },
    {
      key: "price",
      label: "Price",
      render: (item) => `₱ ${item.price.toLocaleString()}`,
    },
    {
      key: "additionalPerHour",
      label: "Additional Per Hour",
      render: (item) =>
        item.additionalPerHour !== null
          ? `₱ ${item.additionalPerHour.toLocaleString()}`
          : "—",
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (item) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => openEdit(item)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageShell
        title="Service Catalog"
        description="Manage available vehicle services"
        items={filteredServices}
        columns={columns}
        getItemId={(item) => item.id}
        onSearch={(q) => setSearch(q)}
        onAdd={openAdd}
        addLabel="Add Service"
        searchPlaceholder="Search services..."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Service" : "Add Service"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Service</Label>
              <Input
                value={form.service}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    service: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Category</Label>
              <Input
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Price</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    price: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Additional Per Hour</Label>
              <Input
                type="number"
                value={form.additionalPerHour}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    additionalPerHour: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button onClick={handleSave}>
              {editing ? "Save Changes" : "Add Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ServiceCatalog;