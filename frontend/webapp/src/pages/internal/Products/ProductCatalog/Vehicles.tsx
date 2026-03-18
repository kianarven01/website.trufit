import React, { useEffect, useState } from "react";
import temporary_bg from "@/assets/temporary_bg.jpeg";
import DataToolbar, { FilterOption } from "@/components/DataToolbar";
import { VehicleModal } from "@/components/popupModal/ProductCatalog/addVehicle";
import { Edit, Trash2, ChevronRight, Car } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";

interface Vehicles {
  id: string;
  make: string;
  model: string;
  image?: string;
  variants?: string[];
}

interface MakeOption {
  id: string;
  name: string;
}


const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicles[]>([]);
  const [makers, setMakers] = useState<MakeOption[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({ make: "all" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicles | null>(null);

  const navigate = useNavigate();

  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();


  // Load makers
  useEffect(() => {
    const savedMakers = localStorage.getItem("makers");
    setMakers(
      savedMakers
        ? JSON.parse(savedMakers).map((m: MakeOption) => ({
            ...m,
            name: capitalize(m.name),
          }))
        : []
    );
  }, []);

  useEffect(() => {
    localStorage.setItem("makers", JSON.stringify(makers));
  }, [makers]);

  // Load vehicles from localStorage
  useEffect(() => {
    const savedVehicles = localStorage.getItem("vehicles");

    if (savedVehicles) {
      setVehicles(JSON.parse(savedVehicles));
    }
  }, []);

  // Save vehicles
  useEffect(() => {
    localStorage.setItem("vehicles", JSON.stringify(vehicles));
  }, [vehicles]);

  // Toolbar filter options
  const filterOptions: FilterOption[] = [
    {
      key: "make",
      label: "Make",
      options: makers.map((m) => ({ label: capitalize(m.name), value: m.name })),
    },
  ];

  const handleSaveVehicle = (vehicle: any) => {
    let makerExists = makers.find(
      (m) => m.name.toLowerCase() === vehicle.makeId.toLowerCase()
    );
    const capitalizedName = capitalize(vehicle.makeId);

    if (!makerExists) {
      const newMaker: MakeOption = { id: vehicle.makeId, name: capitalizedName };
      setMakers((prev) => [...prev, newMaker]);
      makerExists = newMaker;
    }

    const makeName = makerExists ? makerExists.name : capitalizedName;

    setVehicles((prev) => {
      const exists = prev.find((v) => v.id === vehicle.id);
      const newVehicle: Vehicles = {
        id: vehicle.id,
        make: makeName,
        model: vehicle.model,
        image: vehicle.image,
        variants: vehicle.variants || [],
      };
      return exists ? prev.map((v) => (v.id === vehicle.id ? newVehicle : v)) : [...prev, newVehicle];
    });
  };

const openVehicleCatalog = (vehicle: Vehicles) => {
  const vehicleSlug = `${vehicle.make}-${vehicle.model}`.toLowerCase().replace(/\s+/g, '-');
  navigate(`/webapp/products/product-catalog/${vehicleSlug}`);
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
            <BreadcrumbSeparator />
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbPage>Vehicles</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Toolbar */}
      <DataToolbar
        searchPlaceholder="Search Vehicles..."
        onSearch={(value) => console.log("Search:", value)}
        filters={filterOptions}
        activeFilters={filters}
        onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        onAdd={() => {
          setEditingVehicle(null);
          setModalOpen(true);
        }}
        addLabel="Add Vehicle"
      />

      {/* No Vehicle Record */}
      {vehicles.length === 0 && (
        <div className="w-full flex items-center justify-center py-12">
          <p className="text-lg font-medium uppercase text-gray-700 text-center">
            No vehicle record available. Add a new vehicle using the toolbar above.
          </p>
        </div>
      )}

      {/* Vehicles Grid */}
      {vehicles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {vehicles.map((v) => (
            <Card
              key={v.id}
              onClick={() => openVehicleCatalog(v)}
              className="cursor-pointer overflow-hidden relative group transition-transform duration-300 hover:shadow-xl hover:-translate-y-1"
            >

              {/* Image */}
              <CardContent className="p-0">
                <div className="w-full h-40 relative overflow-hidden flex items-center justify-center bg-muted/30">
                      {v.image ? (
                        <img
                          src={v.image}
                          alt={`${v.make} ${v.model}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <Car className=" size-16 text-muted-foreground/40"/>
                      )}

                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-30 transition-opacity"></div>
                  {/* Edit/Delete Buttons */}
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
                        if (confirm(`Delete ${v.make} ${v.model}?`)) {
                          setVehicles((prev) =>
                            prev.filter((veh) => veh.id !== v.id)
                          );
                        }
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
                  {v.variants ? v.variants.length : 0} Variants
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
                id: editingVehicle.id,
                makeId: editingVehicle.make,
                model: editingVehicle.model,
                image: editingVehicle.image || "",
              }
            : null
        }
        makerList={makers}
        onSaved={(vehicle) => handleSaveVehicle(vehicle)}
      />
    </div>
  );
};

export default VehiclesPage;