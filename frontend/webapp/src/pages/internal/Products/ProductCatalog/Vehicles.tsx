import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataToolbar, { FilterOption } from "@/components/DataToolbar";
import {
  VehicleModal,
  VehicleMakerOption,
} from "@/components/popupModal/ProductCatalog/addVehicle";
import { Edit, Trash2, ChevronRight, Car } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import api from "@/api/axios";

export interface MakeOption {
  id: string;
  name: string;
}

export interface Vehicle {
  id: string;
  makeId: string;
  makeName: string;
  model: string;
  image?: string;
  variantCount?: number;
}

type VehicleApiRow = {
  id: string;
  model?: string;
  Model?: string;
  image?: string | null;
  image_URL?: string | null;
  manufacturer?: string | null;
  manufacturer_id?: string | null;
  manufacturerId?: string | null;
  make_id?: string | null;
  makeId?: string | null;
  make_name?: string | null;
  makeName?: string | null;
  Manufacturer?: {
    id?: string;
    name?: string;
  } | null;
  variants_count?: number;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const getVehicleSlug = (vehicle: Vehicle) =>
  `${slugify(vehicle.makeName)}-${slugify(vehicle.model)}`;

const normalizeVehicle = (row: VehicleApiRow): Vehicle => {
  const makeName =
    row.makeName ||
    row.make_name ||
    row.Manufacturer?.name ||
    row.manufacturer ||
    "Unknown";

  const makeId =
    row.makeId ||
    row.make_id ||
    row.manufacturerId ||
    row.manufacturer_id ||
    row.Manufacturer?.id ||
    "";

  return {
    id: String(row.id),
    makeId: String(makeId),
    makeName: String(makeName),
    model: String(row.model || row.Model || ""),
    image: row.image || row.image_URL || undefined,
    variantCount: row.variants_count ?? 0,
  };
};

const VehiclesPage: React.FC = () => {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [makers, setMakers] = useState<MakeOption[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({
    make: "all",
  });
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  const loadManufacturers = async () => {
    const res = await api.get("/vehicles/manufacturers");
    const rows = Array.isArray(res.data?.data) ? res.data.data : res.data;

    const normalized: MakeOption[] = (Array.isArray(rows) ? rows : []).map(
      (item: any) => ({
        id: String(item.id),
        name: String(item.name),
      })
    );

    setMakers(normalized);
  };

  const loadVehicles = async () => {
    const res = await api.get("/vehicles");
    const rows = Array.isArray(res.data?.data) ? res.data.data : res.data;
    const normalized = (Array.isArray(rows) ? rows : []).map(normalizeVehicle);
    setVehicles(normalized);
  };

  const loadPageData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadManufacturers(), loadVehicles()]);
    } catch (error) {
      console.error("Failed to load vehicles page:", error);
      setVehicles([]);
      setMakers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPageData();
  }, []);

  const handleCreateManufacturer = async (
    name: string
  ): Promise<VehicleMakerOption | null> => {
    try {
      const response = await api.post("/manufacturers", {
        name: name.trim(),
      });

      const payload = response.data?.data ?? response.data;

      const created: VehicleMakerOption = {
        id: String(payload.id),
        name: String(payload.name),
      };

      setMakers((prev) => {
        const exists = prev.some(
          (maker) => maker.id === created.id || maker.name === created.name
        );
        if (exists) return prev;
        return [...prev, created].sort((a, b) => a.name.localeCompare(b.name));
      });

      return created;
    } catch (error) {
      console.error("Failed to create manufacturer:", error);
      return null;
    }
  };

  const handleSaveVehicle = async (vehicleData: {
    id?: string;
    makeId: string;
    model: string;
    image?: string;
    imageFile?: File | null;
  }) => {
    const formData = new FormData();
    formData.append("manufacturer_id", vehicleData.makeId);
    formData.append("model", vehicleData.model);

    if (vehicleData.imageFile) {
      formData.append("image", vehicleData.imageFile);
    }

    if (vehicleData.id) {
      formData.append("_method", "PUT");

      await api.post(`/vehicles/${vehicleData.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      await api.post("/vehicles", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }

    await loadVehicles();
  };

  const handleDeleteVehicle = async (vehicle: Vehicle) => {
    const confirmed = window.confirm(
      `Delete ${vehicle.makeName} ${vehicle.model}?`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/vehicles/${vehicle.id}`);
      await loadVehicles();
    } catch (error) {
      console.error("Failed to delete vehicle:", error);
    }
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesMake =
        filters.make === "all" || vehicle.makeName === filters.make;

      const haystack = `${vehicle.makeName} ${vehicle.model}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());

      return matchesMake && matchesSearch;
    });
  }, [vehicles, filters, search]);

  const filterOptions: FilterOption[] = [
    {
      key: "make",
      label: "Make",
      options: makers.map((maker) => ({
        label: maker.name,
        value: maker.name,
      })),
    },
  ];

  return (
    <div className="w-full min-h-screen p-4 flex flex-col space-y-4 select-none">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              className="cursor-pointer"
              onClick={() => navigate("/webapp/products/product-catalog")}
            >
              Product Catalog
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbPage>Vehicles</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <DataToolbar
        searchPlaceholder="Search vehicles..."
        onSearch={setSearch}
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

      {loading ? (
        <div className="w-full flex items-center justify-center py-20 border rounded-xl">
          <p className="text-muted-foreground font-medium">Loading vehicles...</p>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="w-full flex items-center justify-center py-20 border-2 border-dashed rounded-xl">
          <p className="text-muted-foreground font-medium uppercase tracking-wider">
            No vehicles found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredVehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
              onClick={() =>
                navigate(
                  `/webapp/products/product-catalog/${getVehicleSlug(vehicle)}`,
                  {
                    state: {
                      vehicleId: vehicle.id,
                      vehicle,
                    },
                  }
                )
              }
              className="cursor-pointer overflow-hidden relative group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border"
            >
              <CardContent className="p-0">
                <div className="w-full h-44 relative overflow-hidden flex items-center justify-center bg-muted/30">
                  {vehicle.image ? (
                    <img
                      src={vehicle.image}
                      alt={`${vehicle.makeName} ${vehicle.model}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <Car className="size-16 text-muted-foreground/20" />
                  )}

                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute top-2 right-2 flex gap-2 z-10">
                      <Button
                        variant="secondary"
                        size="icon_xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingVehicle(vehicle);
                          setModalOpen(true);
                        }}
                        className="p-2 shadow-sm"
                        title="Edit Vehicle"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant="destructive"
                        size="icon_xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleDeleteVehicle(vehicle);
                        }}
                        className="p-2 shadow-sm hover:text-white"
                        title="Delete Vehicle"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between items-center px-4 py-4 bg-card group-hover:bg-blue-900 transition-colors">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground group-hover:text-white">
                    {vehicle.makeName}
                  </span>
                  <span className="text-sm text-muted-foreground group-hover:text-blue-100">
                    {vehicle.model}
                  </span>
                  <span className="text-xs text-muted-foreground group-hover:text-blue-200 mt-1">
                    {vehicle.variantCount ?? 0} variants
                  </span>
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-white" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <VehicleModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        vehicle={
          editingVehicle
            ? {
                id: editingVehicle.id,
                makeId: editingVehicle.makeId,
                model: editingVehicle.model,
                image: editingVehicle.image || "",
              }
            : null
        }
        makerList={makers}
        onSaved={handleSaveVehicle}
        onCreateManufacturer={handleCreateManufacturer}
      />
    </div>
  );
};

export default VehiclesPage;