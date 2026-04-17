import { useState, useEffect, useMemo } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Plus, Trash2, Car } from "lucide-react";
import { toast } from "sonner";
import Combobox from "@/components/ui/combobox";

const STORAGE_KEY = "customers";
const VEHICLE_STORAGE_KEY = "vehicles";
const VEHICLE_MODEL_STORAGE_KEY = "vehicleModels";

interface VehicleModel {
  id: string;
  year: number;
  make: string;
  model: string;
  variant: string;
}

interface Vehicle {
  id: string;
  customerId: string;
  vehicleModelId: string;
  color: string;
  plateNo: string;
  engineNo: string;
  vin: string;
  registrationNo: string;
  sellingDealer: string;
  hasWarranty?: boolean;
}

const genId = () => crypto.randomUUID();

const emptyVehicle = (): any => ({
  id: genId(),
  year: "",
  make: "",
  model: "",
  variant: "",
  color: "",
  plateNo: "",
  engineNo: "",
  vin: "",
  registrationNo: "",
  sellingDealer: "",
});

const CustomerFormModal = ({ open, onOpenChange, customer, onSaved }: any) => {
  const isEdit = !!customer;

  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([emptyVehicle()]);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [landline, setLandline] = useState("");
  const [email, setEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");

  /* ================= LOAD MODELS ================= */
  useEffect(() => {
    const stored = localStorage.getItem(VEHICLE_MODEL_STORAGE_KEY);
    if (stored) setVehicleModels(JSON.parse(stored));
  }, []);

  /* ================= EDIT HYDRATION ================= */
  useEffect(() => {
    if (!open) return;

    if (customer) {
      setName(customer.name || "");
      setAddress(customer.address || "");
      setMobileNumber(customer.mobileNumber || "");
      setLandline(customer.landline || "");
      setEmail(customer.email || "");
      setBusinessPhone(customer.businessPhone || "");
    } else {
      setName("");
      setAddress("");
      setMobileNumber("");
      setLandline("");
      setEmail("");
      setBusinessPhone("");
    }

    if (!vehicleModels.length) return;

    const stored = localStorage.getItem(VEHICLE_STORAGE_KEY);
    const all: Vehicle[] = stored ? JSON.parse(stored) : [];

    const customerVehicles = customer
      ? all.filter(v => v.customerId === customer.id)
      : [];

    const mapped = customerVehicles.map(v => {
      const model = vehicleModels.find(m => m.id === v.vehicleModelId);

      return {
        id: v.id,
        vehicleModelId: v.vehicleModelId,
        color: v.color,
        plateNo: v.plateNo,
        engineNo: v.engineNo,
        vin: v.vin,
        registrationNo: v.registrationNo,
        sellingDealer: v.sellingDealer,

        year: model?.year?.toString() || "",
        make: model?.make || "",
        model: model?.model || "",
        variant: model?.variant || "",
      };
    });

    setVehicles(mapped.length ? mapped : [emptyVehicle()]);
  }, [open, customer, vehicleModels]);

  /* ================= FILTERS ================= */
  const years = useMemo(
    () => [...new Set(vehicleModels.map(v => String(v.year)))],
    [vehicleModels]
  );

  const makes = () =>
    [...new Set(vehicleModels.map(v => v.make))];

  const models = (make: string) =>
    [...new Set(vehicleModels
      .filter(v => v.make === make)
      .map(v => v.model))];

  const variants = (make: string, model: string) =>
    vehicleModels
      .filter(v =>
        v.make === make &&
        v.model === model
      )
      .map(v => v.variant);

  /* ================= VEHICLE STATE ================= */
  const updateVehicle = (idx: number, field: string, value: string) => {
    setVehicles(prev =>
      prev.map((v, i) =>
        i === idx ? { ...v, [field]: value } : v
      )
    );
  };

  const addVehicleRow = () => setVehicles(p => [...p, emptyVehicle()]);
  const removeVehicle = (idx: number) =>
    setVehicles(p => p.filter((_, i) => i !== idx));

  /* ================= SAVE ================= */
  const handleSave = () => {
    if (!name || !mobileNumber) {
      toast.error("Required fields missing");
      return;
    }

    const storedCustomer = localStorage.getItem(STORAGE_KEY);
    const existingCustomers = storedCustomer ? JSON.parse(storedCustomer) : [];
    const customerId = customer?.id || genId();

    const customerPayload = {
      id: customerId,
      name,
      address,
      mobileNumber,
      landline,
      email,
      businessPhone,
    };

    const updatedCustomers = isEdit
      ? existingCustomers.map((c: any) =>
          c.id === customerId ? customerPayload : c
        )
      : [...existingCustomers, customerPayload];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCustomers));

    let updatedModels = [...vehicleModels];
    const storedVehicles = localStorage.getItem(VEHICLE_STORAGE_KEY);
    const existingVehicles: Vehicle[] = storedVehicles ? JSON.parse(storedVehicles) : [];


    const finalVehicles: Vehicle[] = vehicles.map(v => {
      if (!v.year || !v.make || !v.model) return null;

      let match = updatedModels.find(m =>
        m.year === Number(v.year) &&
        m.make === v.make &&
        m.model === v.model &&
        m.variant === v.variant
      );

      if (!match) {
        match = {
          id: genId(),
          year: Number(v.year),
          make: v.make,
          model: v.model,
          variant: v.variant,
        };
        updatedModels.push(match);
      }

      return {
        id: v.id || genId(),
        customerId,
        vehicleModelId: match.id,
        color: v.color,
        plateNo: v.plateNo,
        engineNo: v.engineNo,
        vin: v.vin,
        registrationNo: v.registrationNo,
        sellingDealer: v.sellingDealer,
      };
    }).filter(Boolean) as Vehicle[];

    /* SAVE MODELS */
    localStorage.setItem(
      VEHICLE_MODEL_STORAGE_KEY,
      JSON.stringify(updatedModels)
    );

    /* SAVE VEHICLES (flat) */
    const updatedVehicles = [
      ...existingVehicles.filter(v => v.customerId !== customerId),
      ...finalVehicles,
    ];

    localStorage.setItem(
      VEHICLE_STORAGE_KEY,
      JSON.stringify(updatedVehicles)
    );

    onSaved?.(customerPayload);

    toast.success(isEdit ? "Updated" : "Created");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>
            {isEdit ? "Edit Customer" : "New Customer"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          <div className="px-6 pb-4 space-y-5">
            {/* Customer Details */}
            <div>
              <p className="text-sm font-semibold mb-3">
                Customer Details
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label className="text-xs">Name *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                  />
                </div>

                <div className="col-span-2">
                  <Label className="text-xs">Address</Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Current Home Address"
                  />
                </div>

                <div>
                  <Label className="text-xs">Mobile *</Label>
                  <Input
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="09XXXXXXXXX"
                  />
                </div>

                <div>
                  <Label className="text-xs">Landline</Label>
                  <Input
                    value={landline}
                    onChange={(e) => setLandline(e.target.value)}
                    placeholder="02XXXXXXX"
                  />
                </div>

                <div>
                  <Label className="text-xs">Email</Label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <Label className="text-xs">Business Number</Label>
                  <Input
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
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
                  <Car className="h-4 w-4 text-muted-foreground" />
                  Registered Vehicles
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={addVehicleRow}
                  className="h-7 gap-1 text-xs"
                >
                  <Plus className="h-3 w-3" />
                  Add Vehicle
                </Button>
              </div>

              <div className="space-y-4">
                {vehicles.map((v, idx) => (
                  <div key={v.id} className="rounded-lg border p-3 space-y-3 bg-muted/30">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Vehicle {idx + 1}
                      </span>

                      {vehicles.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeVehicle(idx)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-3 gap-2">

                      <div>
                        <Label className="text-xs">Year</Label>
                        <Combobox
                          value={v.year}
                          onChange={(val) => updateVehicle(idx, "year", val)}
                          items={years}
                          placeholder="Year"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Make</Label>
                        <Combobox
                          value={v.make}
                          onChange={(val) => updateVehicle(idx, "make", val)}
                          items={makes()}
                          placeholder="Make"
                        />                        
                      </div>

                      <div>
                        <Label className="text-xs">Model</Label>
                        <Combobox
                          value={v.model}
                          onChange={(val) => updateVehicle(idx, "model", val)}
                          items={models(v.make)}
                          placeholder="Model"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-2">

                      <div>
                        <Label className="text-xs">Variant</Label>
                        <Combobox
                          value={v.variant}
                          onChange={(val) => updateVehicle(idx, "variant", val)}
                          items={variants(v.make, v.model)}
                          placeholder="Variant"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Color</Label>
                        <Input
                          placeholder="Color"
                          value={v.color}
                          onChange={(e) => updateVehicle(idx, "color", e.target.value)}
                        />                        
                      </div>

                      <div>
                        <Label className="text-xs">Plate No</Label>
                        <Input
                          placeholder="Plate No"
                          value={v.plateNo}
                          onChange={(e) => updateVehicle(idx, "plateNo", e.target.value)}
                        />                        
                      </div>

                      <div>
                        <Label className="text-xs">Engine No</Label>
                        <Input
                          placeholder="Engine No"
                          value={v.engineNo}
                          onChange={(e) => updateVehicle(idx, "engineNo", e.target.value)}
                        />                        
                      </div>

                      <div>
                        <Label className="text-xs">VIN</Label>
                        <Input
                          placeholder="VIN"
                          value={v.vin}
                          onChange={(e) => updateVehicle(idx, "vin", e.target.value)}
                        />                     
                      </div>

                      <div>
                        <Label className="text-xs">Registration No</Label>
                        <Input
                          placeholder="Registration No"
                          value={v.registrationNo}
                          onChange={(e) => updateVehicle(idx, "registrationNo", e.target.value)}
                        />                       
                      </div>
 
                      <div className="col-span-2">
                        <Label className="text-xs">Selling Dealer</Label>
                        <Input
                          placeholder="Selling Dealer"
                          value={v.sellingDealer}
                          onChange={(e) => updateVehicle(idx, "sellingDealer", e.target.value)}
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
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button onClick={handleSave}>
            {isEdit ? "Update" : "Add Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerFormModal;