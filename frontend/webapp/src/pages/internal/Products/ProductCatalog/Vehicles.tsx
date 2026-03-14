import React, { useState } from "react";
import temporary_bg from "@/assets/temporary_bg.jpeg";

interface Vehicles {
  id: string;
  make: string;
  model: string;
}


const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicles[]>([]); 
  
  const [filters, setFilters] = useState<Record<string, string>>({
    category: "all",
  });

  return (
    <div className="w-full h-full bg-slate-400 p-4">
      <h2 className="text-xl font-semibold mb-4">Vehicles</h2>
      
      <div className="w-80 h-52 p-4 rounded-xl space-y-2 flex flex-col items-center justify-center bg-gray-50">
        <img src={temporary_bg} alt="" className="w-64 h-32 object-cover rounded"/>
        <p className="text-md font-light uppercase">Toyota Hilux</p>
      </div>
      
    </div>
  );
};

export default Vehicles;
