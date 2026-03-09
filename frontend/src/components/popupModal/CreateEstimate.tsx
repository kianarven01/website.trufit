import React, { useRef, useState, useEffect, useMemo } from "react";
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scrollArea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, FileCheck, Percent, Banknote } from "lucide-react";
import { FinalizeEstimate } from "./FinalizeModal";


interface ServiceItem {
  name: string;
  category: string;
  price: number;
}

interface PartItem {
  name: string;
  sku: string;
  quantity: number;
  price: number;
  unit: string;
  currentStock: number;
}

export interface Estimate {
  id: string;
  estimateNo: string;
  services: ServiceItem[];
  parts: PartItem[];
  date: string;
  lastEdited?: string;
  status: "issued"| "approved";
}

interface JOServiceLine {
  id: string;
  service: string;
  category: string;
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
  estimate?: Estimate | null;
  onSaved?: (estimate: Estimate) => void;
}

interface ServiceCatalog {
  name: string;
  category: string;
  price: number;
}

interface PartCatalog {
  name: string;
  sku: string;
  price: number;
}

let lineId = 100;
const genLineId = () => `LN-${lineId++}`;

const emptyJOLine = (): JOServiceLine => ({
  id: genLineId(),
  service: "",
  category: "",
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


export const QuotationModal: React.FC<Props> = ({
  open,
  onOpenChange,
  estimate,
  onSaved,
}) => {
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  const [serviceTaxType, setServiceTaxType] = useState<"₱" | "%">("%");
  const [serviceTaxValue, setServiceTaxValue] = useState(0);

  const [partsTaxType, setPartsTaxType] = useState<"₱" | "%">("%");
  const [partsTaxValue, setPartsTaxValue] = useState(0);

  const [joLines, setJoLines] = useState<JOServiceLine[]>([emptyJOLine()]);
  const [soLines, setSoLines] = useState<SOPartLine[]>([emptySOLine()]);

  const [showFinalize, setShowFinalize] = useState(false);

  const [servicesCatalog, setServicesCatalog] = useState<ServiceCatalog[]>([]);
  const [partsCatalog, setPartsCatalog] = useState<PartCatalog[]>([]);

  const [serviceSuggestIdx, setServiceSuggestIdx] = useState<number | null>(null);
  const [partSuggestIdx, setPartSuggestIdx] = useState<number | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);

const [activeServiceIndex, setActiveServiceIndex] = useState<number>(-1);
const [activePartIndex, setActivePartIndex] = useState<number>(-1);

const [serviceDropdownPos, setServiceDropdownPos] = useState<{top:number,left:number,width:number}|null>(null);
const [partDropdownPos, setPartDropdownPos] = useState<{top:number,left:number,width:number}|null>(null);

const serviceInputRefs = useRef<Array<HTMLInputElement | null>>([]);
const partInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    // replace with API
    setServicesCatalog([
      { name: "Oil Change", category: "Maintenance", price: 1500 },
      { name: "Brake Cleaning", category: "Brake", price: 1200 },
      { name: "Wheel Alignment", category: "Suspension", price: 1800 },
    ]);

    setPartsCatalog([
      { name: "Oil Filter", sku: "OF-100", price: 450 },
      { name: "Air Filter", sku: "AF-220", price: 650 },
      { name: "Brake Pad", sku: "BP-330", price: 2200 },
    ]);
  }, []);

  useEffect(() => {
    if (!open) return;

    const now = new Date().toISOString();
    setDate(now);

    if (estimate) {
      setJoLines(
        estimate.services.map((s) => ({
          id: genLineId(),
          service: s.name,
          category: s.category,
          amount: s.price,
        }))
      );

      setSoLines(
        estimate.parts.map((p) => ({
          id: genLineId(),
          itemName: p.name,
          partNo: p.sku || "",
          quantity: p.quantity || 1,
          unitPrice: p.price,
          amount: p.price * (p.quantity || 1),
        }))
      );
    } else {
      setJoLines([emptyJOLine()]);
      setSoLines([emptySOLine()]);
    }

    setNotes("");
    setServiceTaxType("%");
    setServiceTaxValue(0);
    setPartsTaxType("%");
    setPartsTaxValue(0);
  }, [open, estimate]);


const updateJO = (idx: number, field: keyof JOServiceLine, value: any) => {
  setJoLines((prev) =>
    prev.map((l, i) => {
      if (i !== idx) return l;

      const updated = { ...l, [field]: value };

      if (field === "service") {
        if (!value) {
          updated.category = "";
          updated.amount = 0;
          return updated;
        }

        const found = servicesCatalog.find(
          (s) => s.name.toLowerCase() === value.toLowerCase()
        );

        if (found) {
          updated.category = found.category;
          updated.amount = found.price;
        }
      }

      return updated;
    })
  );
};


const updateSO = (idx: number, field: keyof SOPartLine, value: any) => {
  setSoLines((prev) =>
    prev.map((l, i) => {
      if (i !== idx) return l;

      const updated = { ...l, [field]: value };

      if (field === "itemName") {

        if (!value) {
          updated.partNo = "";
          updated.unitPrice = 0;
          updated.amount = 0;
          return updated;
        }

        const found = partsCatalog.find(
          (p) => p.name.toLowerCase() === value.toLowerCase()
        );

        if (found) {
          updated.partNo = found.sku;
          updated.unitPrice = found.price;
        }
      }

      updated.amount = updated.quantity * updated.unitPrice;

      return updated;
    })
  );
};

  const addJOLine = () => setJoLines((p) => [...p, emptyJOLine()]);
  const removeJOLine = (i: number) =>
    setJoLines((p) => p.filter((_, idx) => idx !== i));

  const addSOLine = () => setSoLines((p) => [...p, emptySOLine()]);
  const removeSOLine = (i: number) =>
    setSoLines((p) => p.filter((_, idx) => idx !== i));

  /* --------- TOTALS --------- */

  const totals = useMemo(() => {
    const validJO = joLines.filter((l) => l.service.trim());
    const validSO = soLines.filter((l) => l.itemName.trim());

    const totalServices = validJO.reduce((s, l) => s + l.amount, 0);
    const totalParts = validSO.reduce((s, l) => s + l.amount, 0);

    const serviceTax =
      serviceTaxType === "%"
        ? totalServices * (serviceTaxValue / 100)
        : serviceTaxValue;

    const partsTax =
      partsTaxType === "%"
        ? totalParts * (partsTaxValue / 100)
        : partsTaxValue;

    const subtotal = totalServices + totalParts;
    const totalTax = serviceTax + partsTax;
    const total = subtotal + totalTax;

    return {
      totalServices,
      totalParts,
      subtotal,
      serviceTax,
      partsTax,
      totalTax,
      total,
      validJO,
      validSO,
    };
  }, [
    joLines,
    soLines,
    serviceTaxType,
    serviceTaxValue,
    partsTaxType,
    partsTaxValue,
  ]);

  const peso = (n: number) =>
    `₱${n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const renderTaxInput = (value: number, onChange: (v: number) => void, type: "₱" | "%") =>
    type === "₱" ? (
      <div className="relative">
        <span 
        className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500"
      >
        ₱
      </span>
        <Input 
          type="number" 
          value={value} 
          onChange={(e) => 
          onChange(Number(e.target.value))} 
          className="w-24 h-7 pl-6" 
        />
      </div>
    ) : (
      <div className="relative">
        <Input 
          type="number" 
          value={value} 
          onChange={(e) => 
          onChange(Number(e.target.value))} 
          className="w-24 h-7 pr-6 text-right" 
          />
        <span 
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500"
        >
          %
        </span>
      </div>
    );


  /* --------- SAVE --------- */

  const saveEstimate = () => {
    if (!onSaved) return;

    const now = new Date().toISOString();

    const newEstimate: Estimate = {
      id: estimate?.id || `EST-${Date.now()}`,
      estimateNo: estimate?.estimateNo || `EST-${Date.now()}`,
      date: estimate?.date || now,
      lastEdited: now, // FIXED
      status: estimate?.status || "draft",

      services: joLines.map((l) => ({
        name: l.service,
        category: l.category,
        price: l.amount,
      })),

      parts: soLines.map((l) => ({
        name: l.itemName,
        sku: l.partNo,
        quantity: l.quantity,
        unit: "pc",
        price: l.unitPrice,
        currentStock: 0,
      })),
    };

    onSaved(newEstimate);
    onOpenChange(false);
  };

  const calculateDropdown = (el: HTMLInputElement | null) => {
  if (!el) return null;

  const rect = el.getBoundingClientRect();

  return {
    top: rect.bottom + window.scrollY + 4,
    left: rect.left + window.scrollX,
    width: rect.width,
  };
};

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[92vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>
              {estimate ? "Edit Estimate" : "New Estimate / Quotation"}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[72vh]" ref={wrapperRef}>
            <div className="px-6 pb-4 space-y-5">
              <Separator />

              {/* SERVICES */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">Services</p>
                  <Button variant="outline" size="sm" onClick={addJOLine} className="h-7 gap-1 text-xs">
                    <Plus className="h-3 w-3" /> 
                    Add Service
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {joLines.map((l, idx) => {
                        const filtered = servicesCatalog.filter((s) =>
                          s.name
                            .toLowerCase()
                            .includes(l.service.toLowerCase())
                        );

                        return (
                          <TableRow key={l.id}>
                            <TableCell className="relative overflow-visible">
<Input
  ref={(el) => {serviceInputRefs.current[idx] = el}}
  value={l.service}
  onFocus={() => {
    setServiceSuggestIdx(idx);
    setActiveServiceIndex(-1);

setServiceDropdownPos(
  calculateDropdown(serviceInputRefs.current[idx])
);
  }}
  onChange={(e) => {
    updateJO(idx, "service", e.target.value);
    setServiceSuggestIdx(idx);

    setServiceDropdownPos(
      calculateDropdown(serviceInputRefs.current[idx])
    );
  }}
/>

{serviceSuggestIdx === idx && filtered.length > 0 && serviceDropdownPos && (
  <div
    style={{
      position: "fixed",
      top: serviceDropdownPos.top,
      left: serviceDropdownPos.left,
      width: serviceDropdownPos.width,
      zIndex: 50,
    }}
    className="border rounded-md bg-white shadow-xl max-h-60 overflow-y-auto"
  >
    {filtered.map((s, i) => (
      <div
        key={s.name}
        className={`px-3 py-2 text-sm flex justify-between cursor-pointer ${
          i === activeServiceIndex ? "bg-muted" : "hover:bg-muted"
        }`}
        onClick={() => {
          updateJO(idx, "service", s.name);
          setServiceSuggestIdx(null);
          setServiceDropdownPos(null);
        }}
      >
        <span>{s.name}</span>
        <span className="text-xs text-muted-foreground">
          ₱{s.price.toLocaleString()}
        </span>
      </div>
    ))}
  </div>
)}
                            </TableCell>

                            <TableCell>{l.category}</TableCell>
                            <TableCell>{peso(l.amount)}</TableCell>

                            <TableCell>
                              {joLines.length > 1 && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => removeJOLine(idx)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-end gap-3 mt-2 text-sm">
                  <div className="flex border rounded-md overflow-hidden">
                    <button 
                      type="button" 
                      onClick={() => 
                      setServiceTaxType("%")} 
                      className={`flex items-center gap-1 px-3 h-7 text-xs transition 
                      ${serviceTaxType === "%" ? 
                        "bg-primary text-white" : "bg-background"}`}
                    >
                      <Percent className="h-3 w-3" />
                    </button>

                    <button 
                      type="button" 
                      onClick={() => 
                      setServiceTaxType("₱")} 
                      className={`flex items-center gap-1 px-3 h-7 text-xs border-l transition 
                      ${serviceTaxType === "₱" ? 
                        "bg-primary text-white" : "bg-background"}`}
                    >
                      <Banknote className="h-3 w-3" />
                    </button>

                  </div>
                  {renderTaxInput(serviceTaxValue, setServiceTaxValue, serviceTaxType)}
                </div>
              </div>

              <Separator />

              {/* PARTS */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">Parts</p>
                  <Button variant="outline" size="sm" onClick={addSOLine} className="h-7 gap-1 text-xs">
                    <Plus className="h-3 w-3" /> Add Part
                  </Button>
                </div>

                <div className="border rounded-lg overflow-visible">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Part No</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {soLines.map((l, idx) => {
                        const filtered = partsCatalog.filter((p) =>
                          p.name
                            .toLowerCase()
                            .includes(l.itemName.toLowerCase())
                        );

                        return (
                          <TableRow key={l.id}>
                            <TableCell className="relative overflow-visible">
 <Input
  ref={(el) => {partInputRefs.current[idx] = el}}
  value={l.itemName}
  onFocus={() => {
    setPartSuggestIdx(idx);
    setActivePartIndex(-1);

 setPartDropdownPos(
  calculateDropdown(partInputRefs.current[idx])
);
  }}
  onChange={(e) => {
    updateSO(idx, "itemName", e.target.value);
    setPartSuggestIdx(idx);

    setPartDropdownPos(
      calculateDropdown(partInputRefs.current[idx])
    );
  }}
/>

{partSuggestIdx === idx && filtered.length > 0 && partDropdownPos && (
  <div
    style={{
      position: "fixed",
      top: partDropdownPos.top,
      left: partDropdownPos.left,
      width: partDropdownPos.width,
      zIndex: 50,
    }}
    className="border rounded-md bg-white shadow-xl max-h-60 overflow-y-auto"
  >
    {filtered.map((p, i) => (
      <div
        key={p.name}
        className={`px-3 py-2 text-sm flex justify-between cursor-pointer ${
          i === activePartIndex ? "bg-muted" : "hover:bg-muted"
        }`}
      onClick={() => {
        updateSO(idx, "itemName", p.name);
        setPartSuggestIdx(null);
        setPartDropdownPos(null);
      }}
      >
        <div>
          <div>{p.name}</div>
          <div className="text-xs text-muted-foreground">
            SKU: {p.sku}
          </div>
        </div>

        <span className="text-xs text-muted-foreground">
          ₱{p.price.toLocaleString()}
        </span>
      </div>
    ))}
  </div>
)}
                            </TableCell>

                            <TableCell>{l.partNo}</TableCell>

                            <TableCell>
                              <Input
                                type="number"
                                value={l.quantity}
                                onChange={(e) =>
                                  updateSO(
                                    idx,
                                    "quantity",
                                    Number(e.target.value)
                                  )
                                }
                                className="w-16"
                              />
                            </TableCell>

                            <TableCell>{peso(l.unitPrice)}</TableCell>
                            <TableCell>{peso(l.amount)}</TableCell>

                            <TableCell>
                              {soLines.length > 1 && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => removeSOLine(idx)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-end gap-3 mt-2 text-sm">
                  <div className="flex border rounded-md overflow-hidden">
                    <button 
                      type="button" 
                      onClick={() => 
                      setPartsTaxType("%")} 
                      className={`flex items-center gap-1 px-3 h-7 text-xs transition 
                      ${partsTaxType === "%" ? 
                        "bg-primary text-white" : "bg-background"}`}
                    >
                      <Percent className="h-3 w-3" />
                    </button>

                    <button 
                      type="button" 
                      onClick={() => 
                      setPartsTaxType("₱")} 
                      className={`flex items-center gap-1 px-3 h-7 text-xs border-l transition 
                      ${partsTaxType === "₱" ? 
                        "bg-primary text-white" : "bg-background"}`}
                    >
                      <Banknote className="h-3 w-3" />
                    </button>
                    
                  </div>
                  {renderTaxInput(partsTaxValue, setPartsTaxValue, partsTaxType)}
                </div>
              </div>

              <Separator />

              {/* TOTAL */}
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{peso(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Tax</span>
                  <span>{peso(totals.totalTax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="text-primary">{peso(totals.total)}</span>
                </div>
              </div>

              <div>
                <Label className="text-xs">Notes</Label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 pb-6 pt-2 gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button variant="secondary" onClick={saveEstimate}>
              Save & Exit
            </Button>

            <Button onClick={() => setShowFinalize(true)} className="gap-1.5">
              <FileCheck className="h-4 w-4" /> Finalize & Create JO/SO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showFinalize && (
        <FinalizeEstimate
          open={showFinalize}
          onOpenChange={setShowFinalize}
          quotation={{
            id: estimate?.id || `EST-${Date.now()}`,
            taxRate: 0,
          }}
          totals={{
            totalServices: totals.totalServices,
            totalParts: totals.totalParts,
            subtotal: totals.subtotal,
            taxAmount: totals.totalTax,
            total: totals.total,
            validJO: joLines,
            validSO: soLines,
          }}
          onFinalized={() => {
            setShowFinalize(false);
            onOpenChange(false);
          }}
        />
      )}
    </>
  );
};