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
import api from "@/api/axios";

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
  vehicles?: any[];
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

const toTitleCase = (str: string) => {
  if (!str) return "";
  return str.trim().charAt(0).toUpperCase() + str.trim().slice(1);
};

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
  const [manufacturers, setManufacturers] = useState<{id: string, name: string}[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isLoadingManufacturers, setIsLoadingManufacturers] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

    const fetchModels = async () => {
      setIsLoadingModels(true);
      try {
        const res = await api.get('/products/vehicles');
        const models = res.data.data.flatMap((m: any) => {
          return m.variants.length > 0 ? m.variants.map((v: any) => ({
            id: v.id,
            year: v.year,
            make: m.manufacturer?.name || "",
            model: m.model,
            variant: v.variant_name
          })) : [{
            id: m.id,
            year: 0,
            make: m.manufacturer?.name || "",
            model: m.model,
            variant: ""
          }];
        });
        setVehicleModels(models);
      } catch (error) {
        console.error("Failed to load vehicle models:", error);
      } finally {
        setIsLoadingModels(false);
      }
    };

    const fetchManufacturers = async () => {
      setIsLoadingManufacturers(true);
      try {
        const res = await api.get('/products/manufacturers');
        setManufacturers(res.data.data || []);
      } catch (error) {
        console.error("Failed to load manufacturers:", error);
      } finally {
        setIsLoadingManufacturers(false);
      }
    };

    fetchModels();
    fetchManufacturers();
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

    if (customer.vehicles && customer.vehicles.length > 0) {
      const mappedVehicles = customer.vehicles.map((v: any) => {
        return {
          id: v.id || v.plateNo,
          year: v.year || "",
          make: v.make || "",
          model: v.model || "",
          variant: v.variant || "",
          color: v.color || "",
          plateNo: v.plateNo || "",
          engineNo: v.engineNo || "",
          vin: v.vin || "",
          registrationNo: v.registrationNo || "",
          sellingDealer: v.sellingDealer || "",
          _deleted: false,
        };
      });
      setVehicles(mappedVehicles);
    } else {
      setVehicles([emptyVehicle()]);
    }
  }, [open, customer, vehicleModels, resetForm]);

  /* ================= DERIVED ================= */
  const years = useMemo(
    () => [...new Set(vehicleModels.map(v => String(v.year)))],
    [vehicleModels]
  );

  const makes = useMemo(() => {
    const fromModels = vehicleModels.map(v => v.make.trim());
    const fromManufacturers = manufacturers.map(m => m.name.trim());
    return [...new Set([...fromModels, ...fromManufacturers].filter(Boolean))];
  }, [vehicleModels, manufacturers]);

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

  /* ================= SAVE (API) ================= */
  const handleSave = async () => {
    if (!firstName || !lastName || !mobileNumber) {
      toast.error("Please fill in required fields.");
      return;
    }

    const validVehicles = vehicles.filter(
      v => !v._deleted && v.plateNo
    );

    setIsSaving(true);

    let hasNewVehicles = false;

    const normalizedVehicles = validVehicles.map(v => {
      const formattedMake = toTitleCase(v.make);
      const formattedModel = toTitleCase(v.model);

      let match = vehicleModels.find(
        m =>
          normalize(m.make) === normalize(formattedMake) &&
          normalize(m.model) === normalize(formattedModel)
      );
      
      if (!match) {
         hasNewVehicles = true;
      }

      return {
        id: v.id, // For keeping track
        year: v.year,
        make: v.make,
        model: v.model,
        variant: v.variant,
        color: v.color,
        plateNo: v.plateNo,
        engineNo: v.engineNo,
        vin: v.vin,
        registrationNo: v.registrationNo,
        sellingDealer: v.sellingDealer
      };
    });

    if (hasNewVehicles) {
      const confirmAdd = window.confirm("One or more vehicles are not in our database. Would you like to add them?");
      if (!confirmAdd) {
        setIsSaving(false);
        return;
      }

      for (const nv of normalizedVehicles) {
        const match = vehicleModels.find(m => normalize(m.make) === normalize(nv.make) && normalize(m.model) === normalize(nv.model));
        if (!match) {
          try {
            await api.post('/products/vehicles/custom', {
              make: nv.make,
              model: nv.model
            });
            // We do not save or map variant_id, just ensure Make/Model are added to global DB.
          } catch (error) {
            console.error("Failed to add custom vehicle", error);
            toast.error("Failed to add vehicle to database");
            setIsSaving(false);
            return;
          }
        }
      }
    }

    const payload = {
      first_name: firstName,
      last_name: lastName,
      address,
      mobile_number: mobileNumber,
      landline,
      email,
      business: businessPhone,
      vehicles: normalizedVehicles
    };

    try {
      if (isEdit) {
        const res = await api.put(`/customers/${customer.id}`, payload);
        toast.success("Customer updated successfully");
        onSaved?.(res.data.data);
        onOpenChange(false);
      } else {
        const res = await api.post('/customers', payload);
        toast.success("Customer created successfully");
        onSaved?.(res.data.data);
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save customer");
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {isEdit ? "Edit Customer" : "New Customer"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          <div className="px-6 pb-4 space-y-5 bg-card py-4">
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
                      className="bg-muted/30"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First Name"
                    />
                    <Input
                      className="bg-muted/30"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last Name"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <Label className="text-xs">Address</Label>
                  <Input
                    className="bg-muted/30"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Current Home Address"
                  />
                </div>

                <div>
                  <Label className="text-xs">Mobile *</Label>
                  <Input  
                    className="bg-muted/30"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="09XXXXXXXXX"
                  />
                </div>

                <div>
                  <Label className="text-xs">Landline</Label>
                  <Input
                    className="bg-muted/30"
                    value={landline}
                    onChange={(e) => setLandline(e.target.value)}
                    placeholder="02XXXXXXX"
                  />
                </div>

                <div>
                  <Label className="text-xs">Email</Label>
                  <Input
                    className="bg-muted/30"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <Label className="text-xs">Business Number</Label>
                  <Input
                    className="bg-muted/30"
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
                  <div key={v.id} className="rounded-lg border p-3 space-y-3  bg-card">

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

                      <div className="bg-muted/30">
                        <Input
                          className="bg-muted/30"
                          placeholder="Year"
                          value={v.year}
                          onChange={(e) => updateVehicle(v.id, "year", e.target.value)}
                        />
                      </div>

                      <div className="bg-muted/30">
                        <Combobox
                          value={v.make}
                          onChange={(val) => {
                            updateVehicle(v.id, "make", toTitleCase(val));
                            updateVehicle(v.id, "model", "");
                            updateVehicle(v.id, "variant", "");
                          }}
                          items={makes}
                          placeholder="Make"
                          isLoading={isLoadingManufacturers || isLoadingModels}
                        />                        
                      </div>

                      <div className="bg-muted/30">
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
                          isLoading={isLoadingModels}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-2">

                      <div className="bg-muted/30">
                        <Combobox
                          value={v.variant}
                          onChange={(val) => {
                            const formatted = toTitleCase(val);
                            const canonical = findCanonical(variants(v.make, v.model), formatted) || formatted;

                            updateVehicle(v.id, "variant", canonical || "");
                          }}
                          items={variants(v.make, v.model)}
                          placeholder="Variant"
                          isLoading={isLoadingModels}
                        />
                      </div>

                      <div>
                        <Input
                          className="bg-muted/30"
                          placeholder="Color"
                          value={v.color}
                          onChange={(e) => updateVehicle(v.id, "color", e.target.value)}
                        />                        
                      </div>

                      <div>
                        <Input
                          className="bg-muted/30"
                          placeholder="Plate No"
                          value={v.plateNo}
                          onChange={(e) => updateVehicle(v.id, "plateNo", e.target.value)}
                        />                        
                      </div>

                      <div>
                        <Input
                          className="bg-muted/30"
                          placeholder="Engine No"
                          value={v.engineNo}
                          onChange={(e) => updateVehicle(v.id, "engineNo", e.target.value)}
                        />                        
                      </div>

                      <div>
                        <Input
                          className="bg-muted/30"
                          placeholder="VIN"
                          value={v.vin}
                          onChange={(e) => updateVehicle(v.id, "vin", e.target.value)}
                        />                     
                      </div>

                      <div>
                        <Input
                          className="bg-muted/30"
                          placeholder="Registration No"
                          value={v.registrationNo}
                          onChange={(e) => updateVehicle(v.id, "registrationNo", e.target.value)}
                        />                       
                      </div>
 
                      <div className="col-span-2">
                        <Input
                          className="bg-muted/30"
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

        <DialogFooter className="px-6 pb-4 ">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : isEdit ? "Update" : "Add Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerFormModal;