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

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  position?: string;
  role_name?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  employee: Employee | null;
}

const EditEmployeeModal: React.FC<Props> = ({ open, onClose, onSuccess, employee }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      } catch (error) {
        toast.error("Failed to load roles");
      }
    };

    if (open) fetchRoles();
  }, [open]);

  useEffect(() => {
    if (employee) {
      setForm({
        first_name: employee.first_name || "",
        last_name: employee.last_name || "",
        address: employee.address || "",
        phone: employee.phone || "",
        email: employee.email || "",
        position: employee.position || "",
        // Role ID matching based on name (simplest approach without full role_id exposure)
        roleID: roles.find((r) => r.name === employee.role_name)?.id.toString() || "",
      });
    }
  }, [employee, roles]);

  const handleSubmit = async () => {
    if (!employee) return;
    setIsLoading(true);
    try {
      const res = await api.put(`/admin/employees/${employee.id}`, {
        ...form,
        role_id: form.roleID,
      });

      if (res.data.status === "success") {
        toast.success("Employee updated successfully!");
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to update employee";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card text-card-foreground border border-border shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Edit Employee Details
          </DialogTitle>
          <DialogDescription>
            Update employee information and system role.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Name Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">First Name</Label>
              <Input
                className="bg-background border-border focus-visible:ring-ring"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Last Name</Label>
              <Input
                className="bg-background border-border focus-visible:ring-ring"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Home Address</Label>
            <Input
              className="bg-background border-border focus-visible:ring-ring"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Phone Number</Label>
            <Input
              className="bg-background border-border focus-visible:ring-ring"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Email Address</Label>
            <Input
              type="email"
              className="bg-background border-border focus-visible:ring-ring"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Job Position</Label>
              <Input
                className="bg-background border-border focus-visible:ring-ring"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">System Role</Label>
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
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !form.email || !form.position || !form.roleID}
              className="w-full bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeModal;
