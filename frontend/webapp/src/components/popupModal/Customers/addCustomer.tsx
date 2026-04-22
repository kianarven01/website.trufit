import { useState, useEffect, useMemo, useCallback } from "react";
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

/* ================= STORAGE ================= */
const STORAGE_KEY = "customers";
const VEHICLE_STORAGE_KEY = "vehicles";
const VEHICLE_MODEL_STORAGE_KEY = "vehicleModels";

/* ================= TYPES ================= */
interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  mobileNumber: string;
  landline?: string;
  email?: string;
  businessPhone?: string;
}

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
}

interface VehicleForm {
  id: string;
  year: string;
  make: string;
  model: string;
  variant: string;
  color: string;
  plateNo: string;
  engineNo: string;
  vin: string;
  registrationNo: string;
  sellingDealer: string;
  _deleted?: boolean;
}

/* ================= HELPERS ================= */
const genId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2) + Date.now().toString(36);

const normalize = (val: string) => val?.trim().toLowerCase();

const toTitleCase = (str: string) =>
  (str || "")
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map(word =>
      word
        .split("-")
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join("-")
    )
    .join(" ");

const emptyVehicle = (): VehicleForm => ({
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
  _deleted: false,
});

  /* ================= COMPONENT ================= */
  const CustomerFormModal = ({
    open,
    onOpenChange,
    customer,
    onSaved,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customer?: Customer | null;
    onSaved?: (customer: Customer) => void;
  }) => {
    const isEdit = !!customer;

  /* ================= STATE ================= */
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  const [vehicles, setVehicles] = useState<VehicleForm[]>([emptyVehicle()]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [landline, setLandline] = useState("");
  const [email, setEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");

  /* ================= LOAD MODELS ================= */
  useEffect(() => {
    if (!open) return;

    const stored = localStorage.getItem(VEHICLE_MODEL_STORAGE_KEY);
    if (stored) setVehicleModels(JSON.parse(stored));
  }, [open]);

  /* ================= RESET ================= */
  const resetForm = useCallback(() => {
    setFirstName("");
    setLastName("");
    setAddress("");
    setMobileNumber("");
    setLandline("");
    setEmail("");
    setBusinessPhone("");
    setVehicles([emptyVehicle()]);
  }, []);

  /* ================= HYDRATION ================= */
  useEffect(() => {
    if (!open) return;

    if (!customer) {
      resetForm();
      return;
    }

    setFirstName(customer.firstName || "");
    setLastName(customer.lastName || "");
    setAddress(customer.address || "");
    setMobileNumber(customer.mobileNumber || "");
    setLandline(customer.landline || "");
    setEmail(customer.email || "");
    setBusinessPhone(customer.businessPhone || "");

    const storedVehicles = localStorage.getItem(VEHICLE_STORAGE_KEY);
    const all: Vehicle[] = storedVehicles ? JSON.parse(storedVehicles) : [];

    const customerVehicles = all.filter(v => v.customerId === customer.id);

    const mapped: VehicleForm[] = customerVehicles.map(v => {
      const model = vehicleModels.find(m => m.id === v.vehicleModelId);

      return {
        id: v.id,
        year: model?.year?.toString() || "",
        make: model?.make || "",
        model: model?.model || "",
        variant: model?.variant || "",
        color: v.color,
        plateNo: v.plateNo,
        engineNo: v.engineNo,
        vin: v.vin,
        registrationNo: v.registrationNo,
        sellingDealer: v.sellingDealer,
        _deleted: false,
      };
    });

    setVehicles(mapped.length ? mapped : [emptyVehicle()]);
  }, [open, customer, vehicleModels, resetForm]);

  /* ================= DERIVED ================= */
  const years = useMemo(
    () => [...new Set(vehicleModels.map(v => String(v.year)))],
    [vehicleModels]
  );

  const makes = useMemo(
    () => [...new Set(vehicleModels.map(v => v.make.trim()))],
    [vehicleModels]
  );

  const models = useCallback(
    (make: string) =>
      [...new Set(
        vehicleModels
          .filter(v => normalize(v.make) === normalize(make))
          .map(v => v.model.trim())
      )],
    [vehicleModels]
  );

  const variants = useCallback(
    (make: string, model: string) =>
      vehicleModels
        .filter(
          v =>
            normalize(v.make) === normalize(make) &&
            normalize(v.model) === normalize(model) &&
            v.variant && v.variant.trim() !== ""
        )
        .map(v => v.variant),
    [vehicleModels]
  );

  const findCanonical = (options: string[], input: string) =>
    options.find(o => normalize(o) === normalize(input)) || input;

  /* ================= VEHICLE HANDLERS ================= */
  const updateVehicle = (
    id: string,
    field: keyof VehicleForm,
    value: string
  ) => {
    setVehicles(prev =>
      prev.map(v =>
        v.id === id ? { ...v, [field]: value } : v
      )
    );
  };

  const addVehicleRow = () => {
    setVehicles(prev => [...prev, emptyVehicle()]);
  };

  const removeVehicle = (id: string) => {
    setVehicles(prev =>
      prev.map(v =>
        v.id === id ? { ...v, _deleted: true } : v
      )
    );
  };

  /* ================= SAVE (INCREMENTAL DIFF UPDATE) ================= */
  const handleSave = () => {
    if (!firstName || !lastName || !mobileNumber || !address) {
      toast.error("Please fill in required fields.");
      return;
    }

    const customerId = customer?.id || genId();

    const storedCustomers = localStorage.getItem(STORAGE_KEY);
    const existingCustomers: Customer[] = storedCustomers
      ? JSON.parse(storedCustomers)
      : [];

    const customerPayload: Customer = {
      id: customerId,
      firstName,
      lastName,
      address,
      mobileNumber,
      landline,
      email,
      businessPhone,
    };

    const updatedCustomers = isEdit
      ? existingCustomers.map(c =>
          c.id === customerId ? customerPayload : c
        )
      : [...existingCustomers, customerPayload];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCustomers));

    const storedVehicles = localStorage.getItem(VEHICLE_STORAGE_KEY);
    const existingVehicles: Vehicle[] = storedVehicles
      ? JSON.parse(storedVehicles)
      : [];

    const customerExisting = existingVehicles.filter(
      v => v.customerId === customerId
    );

    const existingMap = new Map(customerExisting.map(v => [v.id, v]));

    const validVehicles = vehicles.filter(
      v => !v._deleted && v.year && v.make && v.model
    );

    const updatedModels: VehicleModel[] = [...vehicleModels];

    const finalVehicles: Vehicle[] = validVehicles.map(v => {
      const formattedMake = toTitleCase(v.make);
      const formattedModel = toTitleCase(v.model);
      const formattedVariant = toTitleCase(v.variant).trim() || undefined;
  
      let match = updatedModels.find(
        m =>
          m.year === Number(v.year) &&
          normalize(m.make) === normalize(formattedMake) &&
          normalize(m.model) === normalize(formattedModel) &&
          normalize(m.variant || "") === normalize(formattedVariant || "")
      );

      if (!match) {
        match = {
          id: genId(),
          year: Number(v.year),
          make: formattedMake,
          model: formattedModel,
          variant: formattedVariant || "",
        };
        updatedModels.push(match);
      }

      const existing = existingMap.get(v.id);

      return {
        id: existing?.id ?? v.id ?? genId(),
        customerId,
        vehicleModelId: match.id,
        color: v.color,
        plateNo: v.plateNo,
        engineNo: v.engineNo,
        vin: v.vin,
        registrationNo: v.registrationNo,
        sellingDealer: v.sellingDealer,
      };
    });

    const updatedVehicles = [
      ...existingVehicles.filter(v => v.customerId !== customerId),
      ...finalVehicles,
    ];

    localStorage.setItem(
      VEHICLE_STORAGE_KEY,
      JSON.stringify(updatedVehicles)
    );

    localStorage.setItem(
      VEHICLE_MODEL_STORAGE_KEY,
      JSON.stringify(updatedModels)
    );

    toast.success(isEdit ? "Updated successfully" : "Created successfully");
    onSaved?.(customerPayload);
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
                  <Label className="text-xs">Full Name *</Label>
                  <div className="flex gap-3">
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First Name"
                    />
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last Name"
                    />
                  </div>
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
                {vehicles
                  .filter(v => !v._deleted)
                  .map((v, idx) => (
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
                          onClick={() => removeVehicle(v.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-3 gap-2">

                      <div>
                        <Combobox
                          value={v.year}
                          onChange={(val) => updateVehicle(v.id, "year", val)}
                          items={years}
                          placeholder="Year"
                        />
                      </div>

                      <div>
                        <Combobox
                          value={v.make}
                          onChange={(val) => {
                            updateVehicle(v.id, "make", toTitleCase(val));
                            updateVehicle(v.id, "model", "");
                            updateVehicle(v.id, "variant", "");
                          }}
                          items={makes}
                          placeholder="Make"
                        />                        
                      </div>

                      <div>
                        <Combobox
                          value={v.model}
                          onChange={(val) => {
                            const formatted = toTitleCase(val);
                            const canonical = findCanonical(models(v.make), formatted) || formatted;

                            updateVehicle(v.id, "model", canonical);
                            updateVehicle(v.id, "variant", "");
                          }}
                          items={models(v.make)}
                          placeholder="Model"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-2">

                      <div>
                        <Combobox
                          value={v.variant}
                          onChange={(val) => {
                            const formatted = toTitleCase(val);
                            const canonical = findCanonical(variants(v.make, v.model), formatted) || formatted;

                            updateVehicle(v.id, "variant", canonical || "");
                          }}
                          items={variants(v.make, v.model)}
                          placeholder="Variant"
                        />
                      </div>

                      <div>
                        <Input
                          placeholder="Color"
                          value={v.color}
                          onChange={(e) => updateVehicle(v.id, "color", e.target.value)}
                        />                        
                      </div>

                      <div>
                        <Input
                          placeholder="Plate No"
                          value={v.plateNo}
                          onChange={(e) => updateVehicle(v.id, "plateNo", e.target.value)}
                        />                        
                      </div>

                      <div>
                        <Input
                          placeholder="Engine No"
                          value={v.engineNo}
                          onChange={(e) => updateVehicle(v.id, "engineNo", e.target.value)}
                        />                        
                      </div>

                      <div>
                        <Input
                          placeholder="VIN"
                          value={v.vin}
                          onChange={(e) => updateVehicle(v.id, "vin", e.target.value)}
                        />                     
                      </div>

                      <div>
                        <Input
                          placeholder="Registration No"
                          value={v.registrationNo}
                          onChange={(e) => updateVehicle(v.id, "registrationNo", e.target.value)}
                        />                       
                      </div>
 
                      <div className="col-span-2">
                        <Input
                          placeholder="Selling Dealer"
                          value={v.sellingDealer}
                          onChange={(e) => updateVehicle(v.id, "sellingDealer", e.target.value)}
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