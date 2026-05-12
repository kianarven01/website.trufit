import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

type PurchaseOrder = {
  id: string;
  supplier: string;
  status: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: PurchaseOrder | null;
  onConfirm: () => void;
};

const CancelPurchaseOrderDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  order,
  onConfirm,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Purchase Order</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel purchase order{" "}
            <strong>{order?.id}</strong> from{" "}
            <strong>{order?.supplier}</strong>?
            <br />
            This action cannot be undone and will mark the order as{" "}
            <span className="text-destructive font-semibold">
              cancelled
            </span>.
            
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Back</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={onConfirm}
          >
            Yes, Cancel Order
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CancelPurchaseOrderDialog;