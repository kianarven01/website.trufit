import { useEffect, useState } from "react";
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
import { ScrollArea } from "@/components/ui/scrollArea";
import { Percent, Ban } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  contactPerson: string;
  viber: string;
  address: string;
  supplierCode: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier | null;
  onSaved: (supplier: Supplier) => void | Promise<void>;
}

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
  const [address, setAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  /* LOAD DATA WHEN OPEN */
  useEffect(() => {
    if (!open) return;

    if (supplier) {
      setName(supplier.name || "");
      setEmail(supplier.email || "");
      setPhone(supplier.phone || "");
      setContactPerson(supplier.contactPerson || "");
      setViber(supplier.viber || "");
      setAddress(supplier.address || "");
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setContactPerson("");
      setViber("");
      setAddress("");
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
    if (!address.trim()) {
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
      address: address.trim(),
      supplierCode: supplier?.supplierCode || "",
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

        <ScrollArea className="max-h-[65vh]">
          <div className="px-6 pb-4 space-y-4">
            <div>
              <Label className="text-xs">Supplier Name <span className="text-destructive"></span></Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Supplier Name"
              />
            </div>

            <div>
              <Label className="text-xs">Email <span className="text-destructive"></span></Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Supplier Email"
              />
            </div>

            <div>
              <Label className="text-xs">Phone <span className="text-destructive"></span></Label>
              <Input
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (val.length <= 11) {
                    setPhone(val);
                  }
                }}
                placeholder="Supplier Phone"
              />
            </div>

            <div>
              <Label className="text-xs">Contact Person <span className="text-destructive"></span></Label>
              <Input
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Contact Person"
              />
            </div>

            <div>
              <Label className="text-xs">Address <span className="text-destructive"></span></Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Supplier Address"
              />
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
        </ScrollArea>

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
