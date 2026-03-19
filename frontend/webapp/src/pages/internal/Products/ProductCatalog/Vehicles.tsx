import React, { useEffect, useState } from "react";
import DataToolbar, { FilterOption } from "@/components/DataToolbar";
import { VehicleModal } from "@/components/popupModal/ProductCatalog/AddVehicleModelModal";
import { Edit, Trash2, ChevronRight, Car } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import api from "@/api/axios";
import { toast } from "sonner";

interface Vehicle {
  id: string;
  make: string;
  manufacturer_id: string;
  model: string;
  image_url?: string | null;
}

interface Brand {
  id: string;
  name: string;
}

const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({ make: "all" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  // ─── Fetch vehicles & brands from the API ────────────────────────────────
  const fetchVehicles = async () => {
    try {
      const [vehiclesRes, manufacturersRes] = await Promise.all([
        api.get("/vehicles"),
        api.get("/vehicles/manufacturers"),
      ]);
      setVehicles(vehiclesRes.data.data);
      setBrands(manufacturersRes.data.data);
    } catch {
      toast.error("Failed to load vehicles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // ─── Filter options for the toolbar ──────────────────────────────────────
  const filterOptions: FilterOption[] = [
    {
      key: "make",
      label: "Make",
      options: brands.map((b) => ({ label: capitalize(b.name), value: b.name })),
    },
  ];

  const filteredVehicles =
    filters.make === "all"
      ? vehicles
      : vehicles.filter(
          (v) => v.make.toLowerCase() === filters.make.toLowerCase()
        );

  // ─── Save (create or update) ──────────────────────────────────────────────
  const handleSaveVehicle = async (vehicleData: {
    id: string;
    makeId: string;
    model: string;
    image: string;
  }) => {
    const payload = {
      manufacturer_id: vehicleData.makeId,
      model: vehicleData.model.trim(),
      image_url: vehicleData.image || null,
    };

    console.log("vehicleData:", vehicleData);
    console.log("payload:", payload);

    try {
      if (editingVehicle) {
        // UPDATE
        const res = await api.put(`/vehicles/${editingVehicle.id}`, payload);
        setVehicles((prev) =>
          prev.map((v) => (v.id === editingVehicle.id ? res.data.data : v))
        );
      } else {
        // CREATE
        const res = await api.post("/vehicles", payload);
        setVehicles((prev) => [...prev, res.data.data]);
      }
    } catch (error: any) {
      console.log("POST /vehicles error:", error?.response?.data);
      console.log("POST /vehicles status:", error?.response?.status);
      throw error;
    }

    // Refresh manufacturers list in case a new make was added
    const manufacturersRes = await api.get("/vehicles/manufacturers");
    setBrands(manufacturersRes.data.data);
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDeleteVehicle = async (vehicle: Vehicle) => {
    if (!confirm(`Delete ${vehicle.make} ${vehicle.model}?`)) return;
    try {
      await api.delete(`/vehicles/${vehicle.id}`);
      setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
      toast.success("Vehicle deleted.");
    } catch {
      toast.error("Failed to delete vehicle.");
    }
  };

  // ─── Navigate into a vehicle's variants ──────────────────────────────────
  const openVehicleCatalog = (vehicle: Vehicle) => {
    const vehicleSlug = `${vehicle.make}-${vehicle.model}`
      .toLowerCase()
      .replace(/\s+/g, "-");
    navigate(`/webapp/products/product-catalog/${vehicleSlug}`, {
      state: { vehicleId: vehicle.id },
    });
  };

  return (
    <div className="w-full min-h-screen p-4 flex flex-col space-y-4 select-none">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => navigate("/webapp/products/product-catalog")}>
            Product Catalog
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Vehicles</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
      </Breadcrumb>

      {/* Toolbar */}
      <DataToolbar
        searchPlaceholder="Search Vehicles..."
        onSearch={(value) => {
          const q = value.toLowerCase();
          if (!q) {
            fetchVehicles();
            return;
          }
          setVehicles((prev) =>
            prev.filter(
              (v) =>
                v.make.toLowerCase().includes(q) ||
                v.model.toLowerCase().includes(q)
            )
          );
        }}
        filters={filterOptions}
        activeFilters={filters}
        onFilterChange={(key, value) =>
          setFilters((prev) => ({ ...prev, [key]: value }))
        }
        onAdd={() => {
          setEditingVehicle(null);
          setModalOpen(true);
        }}
        addLabel="Add Vehicle"
      />

      {/* Loading state */}
      {loading && (
        <div className="w-full flex items-center justify-center py-12">
          <p className="text-sm text-gray-400">Loading vehicles...</p>
        </div>
      )}

      {/* No Vehicle Record */}
      {!loading && filteredVehicles.length === 0 && (
        <div className="w-full flex items-center justify-center py-12">
          <p className="text-lg font-medium uppercase text-gray-700 text-center">
            No vehicle record available. Add a new vehicle using the toolbar above.
          </p>
        </div>
      )}

      {/* Vehicles Grid */}
      {!loading && filteredVehicles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredVehicles.map((v) => (
            <Card
              key={v.id}
              onClick={() => openVehicleCatalog(v)}
              className="cursor-pointer overflow-hidden relative group transition-transform duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Image */}
              <CardContent className="p-0">
                <div className="w-full h-40 relative overflow-hidden flex items-center justify-center bg-muted/30">
                  {v.image_url ? (
                    <img
                      src={v.image_url}
                      alt={`${v.make} ${v.model}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <Car className="size-16 text-muted-foreground/40" />
                  )}

                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-30 transition-opacity" />

                  {/* Edit / Delete Buttons */}
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingVehicle(v);
                        setModalOpen(true);
                      }}
                      className="p-1 rounded bg-white/90 hover:bg-white text-gray-800"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteVehicle(v);
                      }}
                      className="p-1 rounded bg-white/90 hover:bg-white text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>

              {/* Info */}
              <CardFooter className="flex justify-between items-center px-4 py-3 bg-white transition-colors duration-200 group-hover:bg-gray-900">
                <div className="flex flex-col">
                  <p className="text-gray-900 font-semibold text-sm group-hover:text-white">
                    {v.make}
                  </p>
                  <p className="text-gray-700 text-sm group-hover:text-white">
                    {v.model}
                  </p>
                </div>

                <div className="flex items-center text-gray-500 text-xs font-medium group-hover:text-white">
                  View variants
                  <ChevronRight className="ml-1 w-4 h-4" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Vehicle Modal */}
      <VehicleModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        vehicle={
          editingVehicle
            ? {
                id: String(editingVehicle.id),
                makeId: editingVehicle.manufacturer_id,
                model: editingVehicle.model,
                image: editingVehicle.image_url || "",
              }
            : null
        }
        makerList={brands.map((b) => ({ id: String(b.id), name: b.name }))}
        onSaved={handleSaveVehicle}
      />
    </div>
  );
};

export default VehiclesPage;