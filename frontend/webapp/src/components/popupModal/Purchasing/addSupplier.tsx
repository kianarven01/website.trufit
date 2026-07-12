import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import Combobox from "@/components/ui/combobox";

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  contactPerson: string;
  viber: string;
  address: string;
  supplierCode: string;
  paymentTerms?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier | null;
  onSaved: (supplier: Supplier) => void | Promise<void>;
}

interface PsgcItem {
  code: string;
  name: string;
  zip_code?: string;
}

const PSGC_BASE = "https://psgc.cloud/api";

const SupplierModal: React.FC<Props> = ({
  open,
  onOpenChange,
  supplier,
  onSaved,
}) => {
  const isEdit = !!supplier;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [viber, setViber] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("COD");
  const [isSaving, setIsSaving] = useState(false);

  /* Address fields */
  const [provinces, setProvinces] = useState<PsgcItem[]>([]);
  const [cities, setCities] = useState<PsgcItem[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedCityCode, setSelectedCityCode] = useState("");
  const [unitStreet, setUnitStreet] = useState("");
  const [barangay, setBarangay] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  /* Derived selected items */
  const selectedProvince = useMemo(() => provinces.find((p) => p.code === selectedProvinceCode) || null, [provinces, selectedProvinceCode]);
  const selectedCity = useMemo(() => cities.find((c) => c.code === selectedCityCode) || null, [cities, selectedCityCode]);

  /* Fix garbled ñ characters from PSGC API encoding bug */
  const sanitize = (s: string) =>
    s
      .replace(/PiÃ±as/g, "Piñas")
      .replace(/PiA\ufffds/gi, "Piñas")
      .replace(/CaÃ±o/g, "Caño")
      .replace(/Ca\ufffdo/gi, "Caño")
      .replace(/Ã±/g, "ñ")
      .replace(/\ufffd/g, "ñ");

  /* Combobox items */
  const provinceItems = useMemo(() =>
    provinces.map((p) => ({
      label: p.name.includes("National Capital Region") ? "Metro Manila" : sanitize(p.name),
      value: p.code,
    })),
    [provinces]
  );
  const cityItems = useMemo(() =>
    cities.map((c) => ({
      label: sanitize(c.name).replace(/^City (?:of )?/i, "").trim(),
      value: c.code,
      description: (c as any).type || undefined,
    })),
    [cities]
  );

  /* Compose the final address string: Street, Barangay, City, Province/Region, Philippines ZIP */
  const composeAddress = useCallback(() => {
    const formatCity = (name: string) => sanitize(name).replace(/^City (?:of )?/i, "").trim();
    const formatProvince = (name: string) => {
      if (name.includes("National Capital Region")) return "Metro Manila";
      return sanitize(name);
    };
    const parts: string[] = [];
    if (unitStreet.trim()) parts.push(unitStreet.trim());
    if (barangay.trim()) parts.push(barangay.trim());
    if (selectedCity) parts.push(formatCity(selectedCity.name));
    if (selectedProvince) parts.push(formatProvince(selectedProvince.name));
    if (parts.length > 0) {
      let last = "Philippines";
      if (zipCode.trim()) last += ` ${zipCode.trim()}`;
      parts.push(last);
    }
    return parts.join(", ");
  }, [unitStreet, barangay, selectedCity, selectedProvince, zipCode]);

  /* Fetch provinces + regions (NCR & CAR are regions, not provinces) */
  useEffect(() => {
    if (!open) return;
    setLoadingProvinces(true);
    Promise.all([
      fetch(`${PSGC_BASE}/provinces`).then((r) => r.json()),
      fetch(`${PSGC_BASE}/regions`).then((r) => r.json()),
    ])
      .then(([provincesData, regionsData]: [PsgcItem[], PsgcItem[]]) => {
        /* NCR & CAR are regions without sub-provinces — treat them as provinces */
        const regionOverrides = regionsData.filter((r) =>
          ["1300000000", "1400000000"].includes(r.code)
        );
        const merged = [...provincesData, ...regionOverrides];
        setProvinces(merged.sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(() => toast.error("Failed to load provinces."))
      .finally(() => setLoadingProvinces(false));
  }, [open]);

  /* Fetch cities when province changes */
  useEffect(() => {
    if (!selectedProvinceCode) {
      setCities([]);
      setSelectedCityCode("");
      setZipCode("");
      return;
    }
    setLoadingCities(true);
    setSelectedCityCode("");
    setZipCode("");
    const provincePrefix = selectedProvinceCode.substring(0, 2);
    Promise.all([
      fetch(`${PSGC_BASE}/cities`).then((r) => r.json()),
      fetch(`${PSGC_BASE}/municipalities`).then((r) => r.json()),
    ])
      .then(([citiesData, munisData]: [PsgcItem[], PsgcItem[]]) => {
        const all = [...citiesData, ...munisData];
        const filtered = all.filter((c) => c.code.substring(0, 2) === provincePrefix);
        setCities(filtered.sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(() => toast.error("Failed to load cities."))
      .finally(() => setLoadingCities(false));
  }, [selectedProvinceCode]);

  /* LOAD DATA WHEN OPEN */
  useEffect(() => {
    if (!open) return;

    if (supplier) {
      setName(supplier.name || "");
      setEmail(supplier.email || "");
      setPhone(supplier.phone || "");
      setContactPerson(supplier.contactPerson || "");
      setViber(supplier.viber || "");
      setPaymentTerms(supplier.paymentTerms || "COD");

      /* Parse existing address to pre-select province/city */
      const addr = supplier.address || "";
      const matchedProvince = provinces.find((p) =>
        addr.toLowerCase().includes(p.name.toLowerCase())
      );
      if (matchedProvince) {
        setSelectedProvinceCode(matchedProvince.code);
        setTimeout(() => {
          const cityMatch = cities.find((c) =>
            addr.toLowerCase().includes(c.name.toLowerCase())
          );
          if (cityMatch) {
            setSelectedCityCode(cityMatch.code);
            setZipCode(cityMatch.zip_code || "");
          }
        }, 500);
      }
      /* Extract street */
      const provinceIdx = matchedProvince
        ? addr.toLowerCase().indexOf(matchedProvince.name.toLowerCase())
        : -1;
      const street = provinceIdx > 0 ? addr.substring(0, provinceIdx).replace(/,\s*$/, "") : addr;
      setUnitStreet(street);

      /* Extract zip code */
      const zipMatch = addr.match(/\b(\d{4})\b/);
      if (zipMatch) setZipCode(zipMatch[1]);
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setContactPerson("");
      setViber("");
      setPaymentTerms("COD");
      setSelectedProvinceCode("");
      setSelectedCityCode("");
      setUnitStreet("");
      setBarangay("");
      setZipCode("");
      setCities([]);
    }
  }, [open, supplier]);

  /* SAVE */
  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Supplier name is required.");
      return;
    }
    if (!email.trim()) {
      toast.error("Email is required.");
      return;
    }
    if (!phone.trim()) {
      toast.error("Phone is required.");
      return;
    }
    if (phone.trim().length !== 11) {
      toast.error("Phone number must be exactly 11 digits.");
      return;
    }
    if (!contactPerson.trim()) {
      toast.error("Contact person is required.");
      return;
    }

    const composedAddress = composeAddress();
    const finalAddress = composedAddress || unitStreet.trim();

    if (!finalAddress) {
      toast.error("Address is required.");
      return;
    }

    const newSupplier: Supplier = {
      id: supplier?.id || Date.now().toString(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      contactPerson: contactPerson.trim(),
      viber: viber.trim(),
      address: finalAddress,
      supplierCode: supplier?.supplierCode || "",
      paymentTerms,
    };

    setIsSaving(true);

    try {
      await onSaved(newSupplier);
      toast.success(isEdit ? "Supplier updated." : "Supplier added.");
      onOpenChange(false);
    } catch (err: any) {
      console.error("Failed to save supplier:", err);
      let errorMessage = "Failed to save supplier.";
      if (err.response?.data?.errors) {
        const firstErrorKey = Object.keys(err.response.data.errors)[0];
        const firstErrorMessages = err.response.data.errors[firstErrorKey];
        if (Array.isArray(firstErrorMessages) && firstErrorMessages.length > 0) {
          errorMessage = firstErrorMessages[0];
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>{isEdit ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-y-auto px-6 pb-4 space-y-4">
            <div>
              <Label className="text-xs">Supplier Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Supplier Name"
              />
            </div>

            <div>
              <Label className="text-xs">Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Supplier Email"
              />
            </div>

            <div>
              <Label className="text-xs">Phone</Label>
              <Input
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (val.length <= 11) setPhone(val);
                }}
                placeholder="Supplier Phone"
              />
            </div>

            <div>
              <Label className="text-xs">Contact Person</Label>
              <Input
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Contact Person"
              />
            </div>

            {/* ── Address Section (Image 1 layout) ── */}
            <div className="space-y-2">
              <Label className="text-xs">Address <span className="text-destructive"></span></Label>

              {/* Unit No./Building / Block, Street */}
              <Input
                value={unitStreet}
                onChange={(e) => setUnitStreet(e.target.value)}
                placeholder="Unit No./Building / No. Block, Street"
              />

              {/* Subdivision / Village / Barangay */}
              <Input
                value={barangay}
                onChange={(e) => setBarangay(e.target.value)}
                placeholder="Subdivision / Village / Barangay"
              />

              {/* City ▾ | Province ▾ */}
              <div className="grid grid-cols-2 gap-2">
                <Combobox
                  value={selectedCityCode}
                  onChange={(val) => {
                    setSelectedCityCode(val);
                    const city = cities.find((c) => c.code === val);
                    setZipCode(city?.zip_code || "");
                  }}
                  items={cityItems}
                  placeholder={loadingCities ? "Loading..." : "City / Municipality"}
                  isLoading={loadingCities}
                  disabled={!selectedProvinceCode}
                />
                <Combobox
                  value={selectedProvinceCode}
                  onChange={(val) => setSelectedProvinceCode(val)}
                  items={provinceItems}
                  placeholder={loadingProvinces ? "Loading..." : "Province"}
                  isLoading={loadingProvinces}
                />
              </div>

              {/* Country + Zip Code */}
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-3">
                  <Input
                    value="Philippines"
                    readOnly
                    className="bg-muted text-xs cursor-not-allowed"
                  />
                </div>
                <div className="col-span-1">
                  <Input
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="Zip"
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Composed address preview */}
              {composeAddress() && (
                <p className="text-xs text-muted-foreground italic">
                  {composeAddress()}
                </p>
              )}
            </div>

            <div>
              <Label className="text-xs">Payment Terms</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
              >
                <option value="NONE">None (Prepaid / Immediate)</option>
                <option value="COD">COD (Cash on Delivery)</option>
                <option value="NET_15">Net 15</option>
                <option value="NET_30">Net 30</option>
                <option value="NET_45">Net 45</option>
                <option value="NET_60">Net 60</option>
              </select>
            </div>

            <div>
              <Label className="text-xs">Viber</Label>
              <Input
                value={viber}
                onChange={(e) => setViber(e.target.value)}
                placeholder="Viber Account"
              />
          </div>
        </div>

        {/* FOOTER */}
        <DialogFooter className="px-6 pb-6 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving
              ? "Saving..."
              : isEdit
                ? "Update Supplier"
                : "Add Supplier"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SupplierModal;
