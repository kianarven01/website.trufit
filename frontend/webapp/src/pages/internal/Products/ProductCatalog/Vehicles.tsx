import { Card, CardContent } from "@/components/ui/card";
import temporary_bg from "@/assets/temporary_bg.jpeg";

const Vehicles: React.FC = () => {
  return (
    <div className="w-full h-full bg-slate-400 p-4">
      <h2 className="text-xl font-semibold mb-4">Vehicles</h2>
      
      <Card className="w-80 h-52 py-6 ">
        <CardContent className="flex flex-col items-center justify-center space-y-2">
          <img src={temporary_bg} alt="Toyota" className="w-64 h-32 object-cover rounded" />
          <p className="text-md font-light uppercase">Toyota Hilux</p>
        </CardContent>
      </Card>
      
    </div>
  );
};

export default Vehicles;
