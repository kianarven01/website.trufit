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
  supplierCode: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier | null;
  onSaved: (supplier: Supplier) => void;
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
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setContactPerson("");
      setViber("");
    }
  }, [open, supplier]);

  //temporary supplier code handler - autogenerate
  const generateSupplierCode = (name: string) => {
    const initials = name
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 3);

    const stored = localStorage.getItem("suppliers");
    const suppliers: Supplier[] = stored ? JSON.parse(stored) : [];

    const count =
      suppliers.filter((s) => s.supplierCode?.startsWith(initials)).length + 1;

    const number = String(count).padStart(4, "0");

    return `${initials}-${number}`;
  };

  /* SAVE */
  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Supplier name is required.");
      return;
    }

    const newSupplier: Supplier = {
      id: supplier?.id || Date.now().toString(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      contactPerson: contactPerson.trim(),
      viber: viber.trim(),
      supplierCode: supplier?.supplierCode || generateSupplierCode(name),
    };

    setIsSaving(true);

    try {
      onSaved(newSupplier);
      toast.success(isEdit ? "Supplier updated." : "Supplier added.");
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to save supplier.");
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
                onChange={(e) => setPhone(e.target.value)}
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
