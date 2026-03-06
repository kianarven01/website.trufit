import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, FileCheck } from "lucide-react";

interface JOServiceLine {
  id: string;
  service: string;
  hourlyRate: number;
  amount: number;
}

interface SOPartLine {
  id: string;
  itemName: string;
  partNo: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

let lineId = 100;
const genLineId = () => `LN-${lineId++}`;

const emptyJOLine = (): JOServiceLine => ({
  id: genLineId(),
  service: "",
  hourlyRate: 0,
  amount: 0,
});

const emptySOLine = (): SOPartLine => ({
  id: genLineId(),
  itemName: "",
  partNo: "",
  quantity: 1,
  unitPrice: 0,
  amount: 0,
});

export const QuotationModal: React.FC<Props> = ({ open, onOpenChange }) => {
  const [date, setDate] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [taxRate, setTaxRate] = useState(12);
  const [notes, setNotes] = useState("");

  const [joLines, setJoLines] = useState<JOServiceLine[]>([emptyJOLine()]);
  const [soLines, setSoLines] = useState<SOPartLine[]>([emptySOLine()]);

  const [showFinalize, setShowFinalize] = useState(false);

  useEffect(() => {
    if (open) {
      const today = new Date().toISOString().split("T")[0];
      const next14 = new Date(Date.now() + 14 * 86400000)
        .toISOString()
        .split("T")[0];

      setDate(today);
      setValidUntil(next14);
      setTaxRate(12);
      setNotes("");
      setJoLines([emptyJOLine()]);
      setSoLines([emptySOLine()]);
    }
  }, [open]);

  const updateJO = (idx: number, field: keyof JOServiceLine, value: string | number) => {
    setJoLines(prev =>
      prev.map((l, i) => {
        if (i !== idx) return l;
        return { ...l, [field]: value };
      })
    );
  };

  const addJOLine = () => setJoLines(prev => [...prev, emptyJOLine()]);
  const removeJOLine = (idx: number) =>
    setJoLines(prev => prev.filter((_, i) => i !== idx));

  const updateSO = (idx: number, field: keyof SOPartLine, value: string | number) => {
    setSoLines(prev =>
      prev.map((l, i) => {
        if (i !== idx) return l;

        const updated = { ...l, [field]: value };

        if (field === "quantity" || field === "unitPrice") {
          updated.amount = updated.quantity * updated.unitPrice;
        }

        return updated;
      })
    );
  };

  const addSOLine = () => setSoLines(prev => [...prev, emptySOLine()]);
  const removeSOLine = (idx: number) =>
    setSoLines(prev => prev.filter((_, i) => i !== idx));

  const totals = useMemo(() => {
    const validJO = joLines.filter(l => l.service.trim());
    const validSO = soLines.filter(l => l.itemName.trim());

    const totalServices = validJO.reduce((s, l) => s + l.amount, 0);
    const totalParts = validSO.reduce((s, l) => s + l.amount, 0);

    const subtotal = totalServices + totalParts;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    return { totalServices, totalParts, subtotal, taxAmount, total };
  }, [joLines, soLines, taxRate]);

  const peso = (n: number) =>
    `₱${n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[92vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>New Estimate / Quotation</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh]">
            <div className="px-6 pb-4 space-y-5">

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Date</Label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>

                <div>
                  <Label className="text-xs">Valid Until</Label>
                  <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
                </div>

                <div>
                  <Label className="text-xs">Tax Rate (%)</Label>
                  <Input type="number" value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} />
                </div>
              </div>

              <Separator />

              {/* JO Services */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">Job Order Services</p>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addJOLine}
                    className="h-7 gap-1 text-xs"
                  >
                    <Plus className="h-3 w-3" />
                    Add Service
                  </Button>
                </div>

                <div className="border border-border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs w-[40%]">Service</TableHead>
                        <TableHead className="text-xs w-[20%]">Hourly Rate</TableHead>
                        <TableHead className="text-xs w-[20%]">Amount</TableHead>
                        <TableHead className="text-xs w-[10%]" />
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {joLines.map((l, idx) => (
                        <TableRow key={l.id}>
                          <TableCell className="p-1.5">
                            <Input
                              className="h-8 text-sm"
                              value={l.service}
                              onChange={e => updateJO(idx, "service", e.target.value)}
                            />
                          </TableCell>

                          <TableCell className="p-1.5">
                            <Input
                              className="h-8 text-sm"
                              type="number"
                              value={l.hourlyRate || ""}
                              onChange={e => updateJO(idx, "hourlyRate", Number(e.target.value))}
                            />
                          </TableCell>

                          <TableCell className="p-1.5">
                            <Input
                              className="h-8 text-sm"
                              type="number"
                              value={l.amount || ""}
                              onChange={e => updateJO(idx, "amount", Number(e.target.value))}
                            />
                          </TableCell>

                          <TableCell className="text-center">
                            {joLines.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => removeJOLine(idx)}
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

                <div className="flex justify-end mt-1.5 text-sm">
                  Subtotal (Services):{" "}
                  <span className="font-semibold ml-1">
                    {peso(totals.totalServices)}
                  </span>
                </div>
              </div>

              <Separator />

              {/* SO Parts */}
              {/* (Design unchanged) */}

              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{peso(totals.subtotal)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Tax ({taxRate}%)</span>
                  <span>{peso(totals.taxAmount)}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="text-primary">{peso(totals.total)}</span>
                </div>
              </div>

              <div>
                <Label className="text-xs">Notes</Label>
                <Input
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

            </div>
          </ScrollArea>

          <DialogFooter className="px-6 pb-6 pt-2 gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Save & Exit
            </Button>

            <Button
              onClick={() => setShowFinalize(true)}
              className="gap-1.5"
            >
              <FileCheck className="h-4 w-4" />
              Finalize & Create JO/SO
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>

    </>
  );
}

