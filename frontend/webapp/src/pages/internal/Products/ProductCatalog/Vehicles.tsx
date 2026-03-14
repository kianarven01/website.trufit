import React, { useState } from "react";
import temporary_bg from "@/assets/temporary_bg.jpeg";
import DataToolbar, { FilterOption } from "@/components/DataToolbar";

interface Vehicles {
  id: string;
  make: string;
  model: string;
}

const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicles[]>([]);

  const [filters, setFilters] = useState<Record<string, string>>({
    make: "all",
  });

  const filterOptions: FilterOption[] = [
    {
      key: "make",
      label: "Make",
      options: [
        { label: "Toyota", value: "toyota" },
        { label: "Honda", value: "honda" },
        { label: "Nissan", value: "nissan" },
      ],
    },
  ];

  return (
    <div className="w-full h-full bg-slate-400 p-4">

      <DataToolbar
        searchPlaceholder="Search Vehicles..."
        onSearch={(value) => console.log(value)}

        filters={filterOptions}
        activeFilters={filters}
        onFilterChange={(key, value) =>
          setFilters((prev) => ({ ...prev, [key]: value }))
        }

        onAdd={() => console.log("Add Vehicle")}
        addLabel="Add Vehicle"
      />

      <h2 className="text-xl font-semibold mb-4">Vehicles</h2>

      <div className="w-80 h-52 p-4 rounded-xl space-y-2 flex flex-col items-center justify-center bg-gray-50">
        <img
          src={temporary_bg}
          alt=""
          className="w-64 h-32 object-cover rounded"
        />
        <p className="text-md font-light uppercase">
          Toyota Hilux
        </p>
      </div>

    </div>
  );
};

export default Vehicles;