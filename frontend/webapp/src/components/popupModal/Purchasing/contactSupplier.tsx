import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageSquare, ExternalLink } from "lucide-react";

interface ContactSupplierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: {
    name: string;
    email?: string;
    phone?: string;
    viber?: string;
  };
}

const ContactSupplierModal: React.FC<ContactSupplierModalProps> = ({
  open,
  onOpenChange,
  supplier,
}) => {
  const handleEmail = () => {
    window.location.href = `mailto:${supplier.email}`;
  };

  const handleCall = () => {
    window.location.href = `tel:${supplier.phone}`;
  };

  const handleViber = () => {
    // Viber deep link format
    const cleanedViber = supplier.viber?.replace(/\D/g, "");
    window.location.href = `viber://chat?number=${cleanedViber}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] w-[95vw] rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Contact {supplier.name}
          </DialogTitle>
          <DialogDescription>
            Choose your preferred method of communication.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Email Option */}
          {supplier.email && (
            <Button
              variant="outline"
              className="w-full justify-start h-14 text-base gap-4 bg-card"
              onClick={handleEmail}
            >
              <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex flex-col items-start">
                <span>Send Email</span>
                <span className="text-xs text-muted-foreground">{supplier.email}</span>
              </div>
            </Button>
          )}

          {/* Call Option */}
          {supplier.phone && (
            <Button
              variant="outline"
              className="w-full justify-start h-14 text-base gap-4 bg-card"
              onClick={handleCall}
            >
              <div className="bg-green-100 p-2 rounded-full text-green-600">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex flex-col items-start">
                <span>Phone Call</span>
                <span className="text-xs text-muted-foreground">{supplier.phone}</span>
              </div>
            </Button>
          )}

          {/* Viber/Messaging Option */}
          {supplier.viber && (
            <Button
              variant="outline"
              className="w-full justify-start h-14 text-base gap-4 bg-card"
              onClick={handleViber}
            >
              <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="flex flex-col items-start">
                <span>Viber Message</span>
                <span className="text-xs text-muted-foreground">{supplier.viber}</span>
              </div>
            </Button>
          )}

          {!supplier.email && !supplier.phone && !supplier.viber && (
            <p className="text-center text-sm text-muted-foreground py-4">
              No contact information available for this supplier.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactSupplierModal;