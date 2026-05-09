import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DataToolbar, { FilterOption } from "@/components/DataToolbar";
import { VehicleModal } from "@/components/popupModal/ProductCatalog/addVehicle";
import { Edit, Trash2, ChevronRight, Car } from "lucide-react"; 
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
export interface Variant {
  id: string;
  vehicleId: string;
  name: string;
  year: string;
  engine: string;
  transmission: string;
  drivetrain: string;
}

export interface Vehicle {
  id: string;
  makeId: string;       
  makeName: string;     
  model: string;
  image?: string;
}

export interface MakeOption {
  id: string;
  name: string;
}

const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [makers, setMakers] = useState<MakeOption[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({ make: "all" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const navigate = useNavigate();
  const { vehicleSlug } = useParams<{ vehicleSlug: string }>();

  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  // Initial load
  useEffect(() => {
    const savedMakers = localStorage.getItem("makers");
    const savedVehicles = localStorage.getItem("vehicles");
    
    if (savedMakers) setMakers(JSON.parse(savedMakers));
    if (savedVehicles) setVehicles(JSON.parse(savedVehicles));
  }, []);

  // Sync to localStorage
  useEffect(() => { localStorage.setItem("makers", JSON.stringify(makers)); }, [makers]);
  useEffect(() => { localStorage.setItem("vehicles", JSON.stringify(vehicles)); }, [vehicles]);

  // Save/update vehicle
  const handleSaveVehicle = (vehicleData: any) => {
    let currentMakeId = vehicleData.makeId;
    let currentMakeName = "";

    const existingMaker = makers.find(
      (m) =>
        m.id === vehicleData.makeId ||
        m.name.toLowerCase() === vehicleData.makeId.toLowerCase()
    );

    if (existingMaker) {
      currentMakeId = existingMaker.id;
      currentMakeName = existingMaker.name;
    } else {
      const newId = crypto.randomUUID();
      const newName = capitalize(vehicleData.makeId);
      setMakers((prev) => [...prev, { id: newId, name: newName }]);
      currentMakeId = newId;
      currentMakeName = newName;
    }

    setVehicles((prev) => {
      const isEdit = prev.some((v) => v.id === vehicleData.id);

      const updatedVehicle: Vehicle = {
        id: vehicleData.id,
        makeId: currentMakeId,
        makeName: currentMakeName,
        model: vehicleData.model,
        image: vehicleData.image,
      };

      // ✅ Save variants to localStorage by vehicle ID
      localStorage.setItem(
        `variants_${updatedVehicle.id}`,
        JSON.stringify(vehicleData.variants || [])
      );

      return isEdit
        ? prev.map((v) => (v.id === vehicleData.id ? updatedVehicle : v))
        : [...prev, updatedVehicle];
    });
  };

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (filters.make !== "all" && v.makeName !== filters.make) return false;
      return true;
    });
  }, [vehicles, filters]);

  const filterOptions: FilterOption[] = [
    {
      key: "make",
      label: "Make",
      options: makers.map((m) => ({ label: m.name, value: m.name })),
    },
  ];

  // Helper to create URL-safe slug
  const getVehicleSlug = (v: Vehicle) =>
    `${v.makeName}-${v.model}`.replace(/\s+/g, "-").toLowerCase();

  const currentVehicle = vehicles.find(
    (v) => getVehicleSlug(v) === vehicleSlug
  );

  // Helper to get real variant count from localStorage
  const getVariantCount = (vehicleId: string) => {
    const stored = localStorage.getItem(`variants_${vehicleId}`);
    return stored ? JSON.parse(stored).length : 0;
  };

  return (
    <div className="w-full min-h-screen p-4 flex flex-col space-y-4 select-none">
      {/* Toolbar */}

      {/* Toolbar */}
      <DataToolbar
        searchPlaceholder="Search Vehicles..."
        filters={filterOptions}
        activeFilters={filters}
        onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        onAdd={() => {
          setEditingVehicle(null);
          setModalOpen(true);
        }}
        addLabel="Add Vehicle"
      />

      {/* Empty State */}
      {filteredVehicles.length === 0 ? (
        <div className="w-full flex items-center justify-center py-20 border-2 border-dashed rounded-xl">
          <p className="text-muted-foreground font-medium uppercase tracking-wider">
            No vehicles found.
          </p>
        </div>
      ) : (
        /* Vehicles Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredVehicles.map((v) => (
            <Card
              key={v.id}
              onClick={() => navigate(`/webapp/products/product-catalog/${getVehicleSlug(v)}`)}
              className="cursor-pointer overflow-hidden relative group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border"
            >
              {/* Image / Icon */}
              <CardContent className="p-0">
                <div className="w-full h-44 relative overflow-hidden flex items-center justify-center bg-muted/30">
                  {v.image ? (
                    <img
                      src={v.image}
                      alt={`${v.makeName} ${v.model}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <Car className="size-16 text-muted-foreground/20" />
                  )}

                  {/* Edit/Delete Buttons */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute top-2 right-2 flex gap-2 transition-opacity z-10">
                      <Button
                        variant="secondary"
                        size="icon_xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingVehicle(v);
                          setModalOpen(true);
                        }}
                        className="p-2 25 shadow-sm transition-colors"
                        title="Edit Vehicle"                      
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant="destructive"
                        size="icon_xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete ${v.makeName} ${v.model}?`)) {
                            setVehicles(prev => prev.filter(veh => veh.id !== v.id));
                          }
                        }}
                        className="p-2 shadow-sm hover:text-white transition-colors"
                        title="Delete Vehicle"                      
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>

              {/* Vehicle Info */}
              <CardFooter className="flex justify-between items-center px-4 py-4 bg-card group-hover:bg-blue-900 transition-colors">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary-foreground/70">
                    {v.makeName}
                  </span>
                  <span className="text-sm font-semibold group-hover:text-white">
                    {v.model}
                  </span>
                </div>
                <div className="flex items-center text-[11px] font-medium text-muted-foreground group-hover:text-white/90">
                  {getVariantCount(v.id)} Var
                  <ChevronRight className="ml-1 w-3 h-3" />
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
        vehicle={editingVehicle}
        makerList={makers}
        onSaved={handleSaveVehicle}
      />
    </div>
  );
};

export default VehiclesPage;