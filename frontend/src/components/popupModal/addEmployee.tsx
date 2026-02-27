import React, { useEffect, useState } from "react";
import api from "@/api/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Role {
  id: number;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddEmployeeModal: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedKey, setGeneratedKey] = useState("");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    address: "",
    phone: "",
    email: "",
    position: "",
    roleID: "",
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await api.get("/admin/roles");
        const data = res.data.data;
        setRoles(data);

        if (data.length > 0) {
          setForm((prev) => ({
            ...prev,
            roleID: data[0].id.toString(),
          }));
        }
      } catch (error) {
        toast.error("Failed to load roles");
      }
    };

    if (open) fetchRoles();
  }, [open]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await api.post("/admin/onboard-employee", {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        position: form.position,
        role_id: form.roleID,
      });

      // Add these lines to show the key and refresh the table
      if (res.data.status === "success") {
        setGeneratedKey(res.data.key); // This matches your Controller's return
        toast.success("Employee added successfully!");
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      toast.error("Failed to add employee");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card text-card-foreground border border-border shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Add New Employee
          </DialogTitle>
          <DialogDescription>
            Enter employee information to create their profile and assign a
            system role. A secure registration key will be generated for account
            activation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Name Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">
                First Name
              </Label>
              <Input
                className="bg-background border-border focus-visible:ring-ring"
                value={form.first_name}
                onChange={(e) =>
                  setForm({ ...form, first_name: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Last Name</Label>
              <Input
                className="bg-background border-border focus-visible:ring-ring"
                value={form.last_name}
                onChange={(e) =>
                  setForm({ ...form, last_name: e.target.value })
                }
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">
              Home Address
            </Label>
            <Input
              className="bg-background border-border focus-visible:ring-ring"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">
              Phone Number
            </Label>
            <Input
              className="bg-background border-border focus-visible:ring-ring"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">
              Email Address
            </Label>
            <Input
              type="email"
              className="bg-background border-border focus-visible:ring-ring"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">
                Job Position
              </Label>
              <Input
                className="bg-background border-border focus-visible:ring-ring"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">
                System Role
              </Label>
              <Select
                value={form.roleID}
                onValueChange={(value) => setForm({ ...form, roleID: value })}
              >
                <SelectTrigger className="bg-background border-border focus:ring-ring">
                  <SelectValue placeholder="Select System Role" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={
              isLoading || !form.email || !form.position || !form.roleID
            }
            className="w-full bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            {isLoading
              ? "Generating..."
              : "Add Employee & Generate Registration Code"}
          </Button>

          {/* Generated Key */}
          {generatedKey && (
            <div className="mt-4 p-4 bg-success/10 border border-success rounded-lg">
              <p className="text-xs font-semibold text-success mb-2">
                Registration Key Generated
              </p>

              <div className="flex items-center justify-between bg-background border border-border rounded-md px-3 py-2">
                <code className="font-mono text-base tracking-wide">
                  {generatedKey}
                </code>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigator.clipboard.writeText(generatedKey)}
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeModal;
