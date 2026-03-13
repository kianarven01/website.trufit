import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Plus, Trash2, Car } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: any;
  onSaved?: (customer: any) => void;
}

const genId = () => Math.random().toString(36).substring(2, 9);

const emptyVehicle = () => ({
  id: genId(),
  yearMakeModel: "",
  color: "",
  plateNo: "",
  vin: "",
  kilometers: 0,
  engineNo: "",
});

const addCustomer: React.FC<Props> = ({ open, onOpenChange, customer, onSaved }: Props) => {

  const isEdit = !!customer;

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [landline, setLandline] = useState("");
  const [email, setEmail] = useState("");
  const [businessNo, setBusinessNo] = useState("");
  const [vehicles, setVehicles] = useState<any[]>([emptyVehicle()]);

  useEffect(() => {
    if (open && customer) {
      setName(customer.name || "");
      setAddress(customer.address || "");
      setMobile(customer.mobile || "");
      setLandline(customer.landline || "");
      setEmail(customer.email || "");
      setBusinessNo(customer.businessNo || "");
      setVehicles(customer.vehicles?.length ? [...customer.vehicles] : [emptyVehicle()]);
    } 
    else if (open) {
      setName("");
      setAddress("");
      setMobile("");
      setLandline("");
      setEmail("");
      setBusinessNo("");
      setVehicles([emptyVehicle()]);
    }
  }, [open, customer]);

  const updateVehicle = (idx: number, field: string, value: any) => {
    setVehicles(prev =>
      prev.map((v, i) =>
        i === idx ? { ...v, [field]: value } : v
      )
    );
  };

  const addVehicleRow = () => {
    setVehicles(prev => [...prev, emptyVehicle()]);
  };

  const removeVehicle = (idx: number) => {
    setVehicles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {

    if (!name.trim() || !mobile.trim()) {
      toast.error("Name and mobile number are required");
      return;
    }

    const validVehicles = vehicles.filter(v => v.yearMakeModel.trim());

    const newCustomer = {
      id: genId(),
      name,
      address,
      mobile,
      landline,
      email,
      businessNo,
      vehicles: validVehicles,
    };

    console.log("Saved customer:", newCustomer);

    onSaved?.(newCustomer);

    toast.success(isEdit ? "Customer updated" : "Customer added");

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">

        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>{isEdit ? "Edit Customer" : "New Customer"}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          <div className="px-6 pb-4 space-y-5">

            {/* Customer Details */}
            <div>
              <p className="text-sm font-semibold mb-3">Customer Details</p>

              <div className="grid grid-cols-2 gap-3">

                <div className="col-span-2">
                  <Label className="text-xs">Name *</Label>
                  <Input 
                    value={name} 
                    onChange={(e)=>setName(e.target.value)} 
                    placeholder="Full name"
                  />
                </div>

                <div className="col-span-2">
                  <Label className="text-xs">Address</Label>
                  <Input 
                    value={address} 
                    onChange={(e)=>setAddress(e.target.value)} 
                    placeholder="Current Home Address"
                  />
                </div>

                <div>
                  <Label className="text-xs">Mobile *</Label>
                  <Input 
                    value={mobile} 
                    onChange={(e)=>setMobile(e.target.value)} 
                    placeholder="09XXXXXXXXX"
                  />
                </div>

                <div>
                  <Label className="text-xs">Landline</Label>
                  <Input 
                    value={landline} 
                    onChange={(e)=>setLandline(e.target.value)} 
                    placeholder="02XXXXXXX"
                  />
                </div>

                <div>
                  <Label className="text-xs">Email</Label>
                  <Input 
                    value={email} 
                    onChange={(e)=>setEmail(e.target.value)} 
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <Label className="text-xs">Business Number</Label>
                  <Input 
                    value={businessNo} 
                    onChange={(e)=>setBusinessNo(e.target.value)} 
                    placeholder="Optional"
                  />
                </div>

              </div>
            </div>

            <Separator />

            {/* Vehicles */}
            <div>

              <div className="flex items-center justify-between mb-3">

                <p className="text-sm font-semibold flex items-center gap-1.5">
                  <Car className="h-4 w-4 text-muted-foreground"/>
                  Registered Vehicles
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={addVehicleRow}
                  className="h-7 gap-1 text-xs"
                >
                  <Plus className="h-3 w-3"/>
                  Add Vehicle
                </Button>

              </div>

              <div className="space-y-4">

                {vehicles.map((v, idx)=>(
                  <div key={v.id} className="rounded-lg border p-3 space-y-2 bg-muted/30">

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Vehicle {idx+1}
                      </span>

                      {vehicles.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={()=>removeVehicle(idx)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive"/>
                        </Button>
                      )}

                    </div>

                    <div className="grid grid-cols-2 gap-2">

                      <div className="col-span-2">
                        <Label className="text-xs">Year / Make / Model</Label>
                        <Input
                          value={v.yearMakeModel}
                          onChange={(e)=>updateVehicle(idx,"yearMakeModel",e.target.value)}
                          placeholder="2020 Toyota Vios"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Color</Label>
                        <Input
                          value={v.color}
                          onChange={(e)=>updateVehicle(idx,"color",e.target.value)}
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Plate No.</Label>
                        <Input
                          value={v.plateNo}
                          onChange={(e)=>updateVehicle(idx,"plateNo",e.target.value)}
                        />
                      </div>

                      <div>
                        <Label className="text-xs">VIN</Label>
                        <Input
                          value={v.vin}
                          onChange={(e)=>updateVehicle(idx,"vin",e.target.value)}
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Kilometers</Label>
                        <Input
                          type="number"
                          value={v.kilometers || ""}
                          onChange={(e)=>updateVehicle(idx,"kilometers",Number(e.target.value))}
                        />
                      </div>

                      <div className="col-span-2">
                        <Label className="text-xs">Engine No.</Label>
                        <Input
                          value={v.engineNo}
                          onChange={(e)=>updateVehicle(idx,"engineNo",e.target.value)}
                        />
                      </div>

                    </div>

                  </div>
                ))}

              </div>

            </div>

          </div>
        </ScrollArea>

        <DialogFooter className="px-6 pb-6 pt-2">
          <Button variant="outline" onClick={()=>onOpenChange(false)}>
            Cancel
          </Button>

          <Button onClick={handleSave}>
            {isEdit ? "Update" : "Add Customer"}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}

export default addCustomer;