import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scrollArea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import Combobox from "@/components/ui/combobox";
import { Calendar } from "@/components/ui/date-time-picker";

interface PurchaseOrderItem {
  id: string;
  productId?: string;
  itemName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface PurchaseOrder {
  id: string;
  supplier: string;
  orderDate: string;
  requestedShipDate: string;
  eta?: string | null;
  status:
    | "for-approval"
    | "pending"
    | "approved"
    | "cancelled"
    | "in-transit"
    | "received"
    | "delivered";
  notes?: string;
  requestedBy: string;
  items: PurchaseOrderItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: PurchaseOrder | null;
  onSave?: (data: PurchaseOrder) => void;
}

let poiId = 100;
const genPoiId = () => `POI-${poiId++}`;

const emptyItem = (): PurchaseOrderItem => ({
  id: genPoiId(),
  itemName: "",
  sku: "",
  quantity: 1,
  unitPrice: 0,
  amount: 0
});

const STATUS_OPTIONS: {
  value: PurchaseOrder["status"];
  label: string;
}[] = [
  { value: "for-approval", label: "For Approval" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "cancelled", label: "Cancelled" },
  { value: "in-transit", label: "In Transit" },
  { value: "received", label: "Received" },
  { value: "delivered", label: "Delivered" }
];

// ✅ SAFE DATE PARSER (IMPORTANT FIX)
const safeDate = (value: string) => {
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

export function PurchaseOrderModal({
  open,
  onOpenChange,
  initialData,
  onSave
}: Props) {
  const isEdit = !!initialData;

  const [supplier, setSupplier] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [shipDate, setShipDate] = useState("");
  const [eta, setETA] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<PurchaseOrderItem[]>([emptyItem()]);
  const [status, setStatus] =
    useState<PurchaseOrder["status"]>("for-approval");

  const [activeCalendar, setActiveCalendar] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setSupplier(initialData.supplier);
        setOrderDate(initialData.orderDate);
        setShipDate(initialData.requestedShipDate);
        setETA(initialData.eta || "");
        setNotes(initialData.notes || "");
        setItems(initialData.items.length ? initialData.items : [emptyItem()]);
        setStatus(initialData.status);
      } else {
        const today = new Date().toISOString().split("T")[0];
        const next7 = new Date(Date.now() + 7 * 86400000)
          .toISOString()
          .split("T")[0];

        setSupplier("");
        setOrderDate(today);
        setShipDate(next7);
        setETA("");
        setNotes("");
        setItems([emptyItem()]);
        setStatus("for-approval");
      }

      setActiveCalendar(null);
    }
  }, [open, initialData]);

  const updateItem = (
    idx: number,
    field: keyof PurchaseOrderItem,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;

        const updated = { ...item, [field]: value } as PurchaseOrderItem;

        if (field === "quantity" || field === "unitPrice") {
          updated.amount = updated.quantity * updated.unitPrice;
        }

        return updated;
      })
    );
  };

  const total = useMemo(
    () => items.reduce((s, i) => s + i.amount, 0),
    [items]
  );

  const peso = (n: number) =>
    `₱${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  const handleSave = () => {
    const validItems = items.filter((i) => i.itemName.trim());

    if (!supplier.trim() || validItems.length === 0) {
      alert("Supplier and at least one item are required");
      return;
    }

    const data: PurchaseOrder = {
      id: initialData?.id || `PO-${Date.now()}`,
      supplier: supplier.trim(),
      orderDate,
      requestedShipDate: shipDate,
      eta,
      items: validItems,
      total: validItems.reduce((s, i) => s + i.amount, 0),
      status,
      requestedBy: initialData?.requestedBy || "John Doe",
      notes,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave?.(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>
            {isEdit ? "Edit Purchase Order" : "Create Purchase Order"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[68vh]">
          <div className="px-6 pb-4 space-y-4">

            {/* HEADER */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 flex flex-col">
                <Label className="text-sm">Supplier *</Label>
                <Input
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Supplier name"
                />
              </div>

              <div className="flex flex-col">
                <Label className="text-sm">Status</Label>
                {isEdit ? (
                  <Combobox
                    value={status}
                    onChange={(val) =>
                      setStatus(val as PurchaseOrder["status"])
                    }
                    items={STATUS_OPTIONS.map((s) => s.value)}
                    placeholder="Select status"
                  />
                ) : (
                  <Input value="For Approval" disabled />
                )}
              </div>
            </div>


            {/* DATES (FIXED SAFE VERSION) 
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Calendar
                id="orderDate"
                activeCalendar={activeCalendar}
                setActiveCalendar={setActiveCalendar}
                selectedDate={safeDate(orderDate)}
                onSelectDate={(date) =>
                  setOrderDate(date.toISOString().split("T")[0])
                }
                placeholder="Order Date"
              />

              <Calendar
                id="shipDate"
                activeCalendar={activeCalendar}
                setActiveCalendar={setActiveCalendar}
                selectedDate={safeDate(shipDate)}
                onSelectDate={(date) =>
                  setShipDate(date.toISOString().split("T")[0])
                }
                placeholder="Ship Date"
              />

              <Calendar
                id="eta"
                activeCalendar={activeCalendar}
                setActiveCalendar={setActiveCalendar}
                selectedDate={safeDate(eta)}
                onSelectDate={(date) =>
                  setETA(date.toISOString().split("T")[0])
                }
                placeholder="ETA"
              />
            </div>
            
            */}

            {/* ITEMS */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold">Items</p>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() =>
                    setItems((prev) => [...prev, emptyItem()])
                  }
                >
                  <Plus className="h-3 w-3" /> Add Item
                </Button>
              </div>

              <div className="border rounded-lg">
                <Table className="table-fixed w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="w-[18%]">SKU</TableHead>
                      <TableHead className="w-[15%]">Unit Price</TableHead>
                      <TableHead className="w-[10%]">Qty</TableHead>
                      <TableHead className="w-[15%]">Amount</TableHead>
                      <TableHead className="w-[5%]" />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {items.map((item, idx) => (
                      <TableRow key={item.id}>
                        <TableCell className="p-1.5">
                          <Input
                            value={item.itemName}
                            onChange={(e) =>
                              updateItem(idx, "itemName", e.target.value)
                            }
                          />
                        </TableCell>

                        <TableCell className="p-1.5">
                          <Input
                            value={item.sku}
                            onChange={(e) =>
                              updateItem(idx, "sku", e.target.value)
                            }
                          />
                        </TableCell>

                        <TableCell className="p-1.5">
                          <Input
                            type="number"
                            value={item.unitPrice || ""}
                            onChange={(e) =>
                              updateItem(
                                idx,
                                "unitPrice",
                                Number(e.target.value)
                              )
                            }
                          />
                        </TableCell>

                        <TableCell className="p-1.5">
                          <Input
                            type="number"
                            value={item.quantity || ""}
                            onChange={(e) =>
                              updateItem(
                                idx,
                                "quantity",
                                Number(e.target.value)
                              )
                            }
                          />
                        </TableCell>

                        <TableCell className="p-1.5 text-right font-medium">
                          {peso(item.amount)}
                        </TableCell>

                        <TableCell className="p-1.5 text-center">
                          {items.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                setItems((prev) =>
                                  prev.filter((_, i) => i !== idx)
                                )
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end mt-2">
                <span className="text-sm font-semibold">
                  Total: <span className="text-primary">{peso(total)}</span>
                </span>
              </div>
            </div>

            {/* NOTES */}
            <div>
              <Label className="text-sm">Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 pb-6 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {isEdit ? "Update PO" : "Create PO"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}