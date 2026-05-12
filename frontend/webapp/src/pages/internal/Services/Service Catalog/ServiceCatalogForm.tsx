import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CurrencyInput from "@/components/ui/currencyInput";
import { Label } from "@/components/ui/label";
import Combobox from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import DataToolbar from "@/components/DataToolbar";
import ConfirmDialog from "@/components/popupModal/AlertDialog/ConfirmDialog";

import { ScrollArea } from "@/components/ui/scrollArea";
import { toast } from "sonner";
import { ArrowLeft, Plus, Save, MoreHorizontal, Clock, Tag, Pencil, Trash2, Check, X } from "lucide-react";

/* ================= STORAGE ================= */
const CATEGORY_KEY = "serviceCategories";
const SERVICE_KEY = "services";
const VEHICLE_SIZE_KEY = "vehicleSizes";
const PRICING_KEY = "servicePricing";


/* ================= TYPES ================= */
type PricingType = "fixed" | "hourly rate";

interface Props {
  mode: "add" | "edit";
}

interface ServiceCategory {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  serviceCategoryId: string;
  description?: string;
  duration?: number;
  pricingType: PricingType;
}

interface VehicleSize {
  id: string;
  name: string;           
  abbreviation: string;
  vehicleTypes: string[];
}

interface ServicePricing {
  id: string;
  serviceId: string;
  vehicleSizeId: string;
  price: number;
}


/* ================= COMPONENT ================= */
const ServiceCatalogForm: React.FC<Props> = ({ mode }) => {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { id } = useParams();

const [categories, setCategories] = useState<ServiceCategory[]>([]);
const [services, setServices] = useState<Service[]>([]);
const [pricing, setPricing] = useState<ServicePricing[]>([]);
const [durationInput, setDurationInput] = useState("00:00");
const [durationFormatted, setDurationFormatted] = useState("");
const [duration, setDuration] = useState<number>(0); // total minutes
const [vehicleSizes, setVehicleSizes] = useState<VehicleSize[]>([]);
const [openMenuId, setOpenMenuId] = useState<string | null>(null);

const scrollRef = useRef<HTMLDivElement | null>(null);

/* ================= FORM ================= */
const [name, setName] = useState("");
const [categoryId, setCategoryId] = useState("");
const [categoryName, setCategoryName] = useState("");
const [description, setDescription] = useState("");
const [pricingType, setPricingType] = useState<PricingType>("fixed");

const [sizePricing, setSizePricing] = useState<Record<string, number>>({});
const [vehicleTypeInput, setVehicleTypeInput] = useState("");
const [editVehicleTypeInput, setEditVehicleTypeInput] = useState("");
const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
const [editingTagValue, setEditingTagValue] = useState("");

const [confirmOpen, setConfirmOpen] = useState(false);
const [confirmType, setConfirmType] = useState<"size" | null>(null);
const [targetId, setTargetId] = useState<string | null>(null);


/* ================= HELPERS ================= */
const genId = () =>
  crypto.randomUUID?.() ?? Math.random().toString(36).substring(2);


const handleDurationChange = (val: string) => {
  // allow only digits + colon
  if (!/^[0-9:]*$/.test(val)) return;

  // prevent multiple colons
  const parts = val.split(":");
  if (parts.length > 2) return;

  let hh = parts[0] ?? "";
  let mm = parts[1] ?? "";

  // limit lengths
  if (hh.length > 2) hh = hh.slice(0, 2);
  if (mm.length > 2) mm = mm.slice(0, 2);

  let next = hh;

  if (val.includes(":")) {
    next += ":" + mm;
  }

  // auto-add colon when typing 2 digits in hours
  if (!val.includes(":") && hh.length === 2) {
    next = hh + ":";
  }

  setDurationInput(next);
};

const handleDurationBlur = () => {
  let [hh = "0", mm = "0"] = durationInput.split(":");

  let hours = parseInt(hh, 10) || 0;
  let minutes = parseInt(mm, 10) || 0;

  // enforce limits
  if (hours < 0) hours = 0;
  if (hours > 24) hours = 24;

  if (minutes < 0) minutes = 0;
  if (minutes > 59) minutes = 59;

  const normalized = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  setDurationInput(normalized);
  setDuration(hours * 60 + minutes);

  let text = "";

  if (hours > 0) {
    text += `${hours} hour${hours > 1 ? "s" : ""}`;
  }

  if (minutes > 0) {
    if (text) text += " & ";
    text += `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }

  // fallback if both are 0
  if (!text) {
    text = "0 minutes";
  }

  setDurationFormatted(text);
};


/* ================= ADD/EDIT SIZE (INLINE ROW) ================= */
const [isAddingSize, setIsAddingSize] = useState(false);

const [newSize, setNewSize] = useState({
  name: "",
  vehicleTypes: [] as string[],
  price: 0,
});

const [editingSizeId, setEditingSizeId] = useState<string | null>(null);

const [editSize, setEditSize] = useState({
  name: "",
  vehicleTypes: [] as string[],
  price: 0,
});

/* ================= LOAD ================= */
useEffect(() => {
  setCategories(JSON.parse(localStorage.getItem(CATEGORY_KEY) || "[]"));
  setServices(JSON.parse(localStorage.getItem(SERVICE_KEY) || "[]"));
  setPricing(JSON.parse(localStorage.getItem(PRICING_KEY) || "[]"));
  setVehicleSizes(JSON.parse(localStorage.getItem(VEHICLE_SIZE_KEY) || "[]"));
}, []);


useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (!menuRef.current) return;

    if (!menuRef.current.contains(e.target as Node)) {
      setOpenMenuId(null);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

useEffect(() => {
  if (isAddingSize && scrollRef.current) {
    setTimeout(() => {
      const viewport = scrollRef.current?.querySelector("[data-radix-scroll-area-viewport]");
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 50);
  }
}, [isAddingSize]);


/* ================= EDIT LOAD ================= */
useEffect(() => {
  if (mode === "edit" && id) {
    const s = services.find((x) => x.id === id);
    if (!s) return;

    setName(s.name);
    setCategoryId(s.serviceCategoryId);

    const category = categories.find(
      (c) => c.id === s.serviceCategoryId
    );
    setCategoryName(category?.name || "");

    setDescription(s.description || "");

    if (s.duration !== undefined) {
      const hours = Math.floor(s.duration / 60);
      const minutes = s.duration % 60;

      const formatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      setDurationInput(formatted);
      setDuration(s.duration);

      let text = "";

      if (hours > 0) {
        text += `${hours} hour${hours > 1 ? "s" : ""}`;
      }

      if (minutes > 0) {
        if (text) text += " & ";
        text += `${minutes} minute${minutes > 1 ? "s" : ""}`;
      }

      if (!text) text = "0 minutes";

      setDurationFormatted(text);
    }

    setPricingType(s.pricingType);

    const p = pricing.filter((x) => x.serviceId === id);
    const map: Record<string, number> = {};
    p.forEach((x) => (map[x.vehicleSizeId] = x.price));
    setSizePricing(map);

  }
}, [mode, id, services, pricing]);

/* ================= CATEGORIES ================= */

const normalizeCategory = (input: string) => {
  return input
    .trim()
    .split(" ")
    .map(word =>
      word
        .split("-")
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join("-")
    )
    .join(" ");
};

const findExistingCategory = (list: ServiceCategory[], name: string) => {
  return list.find(
    c => c.name.trim().toLowerCase() === name.trim().toLowerCase()
  );
};

const categoryOptions = useMemo(() => {
  return categories.map((c) => ({
    label: c.name,
    value: c.name,
  }));
}, [categories]);


/* ================= VEHICLE SIZE ================= */
const toArray = (val: string) =>
  val.split(",").map(v => v.trim()).filter(Boolean);

const handleAddRow = () => {
  setIsAddingSize(true);
  setNewSize({ name: "", vehicleTypes: [], price: 0 });
};

const generateAbbreviation = (name: string) => {
  return name
    .split(" ")
    .map(w => w[0]?.toUpperCase())
    .join("");
};

const handleAddVehicleType = (value: string, isEdit = false) => {
  const trimmed = value.trim();
  if (!trimmed) return;

  if (isEdit) {
    setEditSize((prev) => {
      if (prev.vehicleTypes.includes(trimmed)) return prev;
      return {
        ...prev,
        vehicleTypes: [...prev.vehicleTypes, trimmed],
      };
    });
    setEditVehicleTypeInput("");
  } else {
    setNewSize((prev) => {
      if (prev.vehicleTypes.includes(trimmed)) return prev;
      return {
        ...prev,
        vehicleTypes: [...prev.vehicleTypes, trimmed],
      };
    });
    setVehicleTypeInput("");
  }
};

const removeVehicleType = (value: string, isEdit = false) => {
  if (isEdit) {
    setEditSize((prev) => ({
      ...prev,
      vehicleTypes: prev.vehicleTypes.filter((v) => v !== value),
    }));
  } else {
    setNewSize((prev) => ({
      ...prev,
      vehicleTypes: prev.vehicleTypes.filter((v) => v !== value),
    }));
  }
};

const startEditTag = (index: number, value: string) => {
  setEditingTagIndex(index);
  setEditingTagValue(value);
};

const saveEditTag = (isEdit = false) => {
  if (editingTagIndex === null) return;

  const trimmed = editingTagValue.trim();
  if (!trimmed) return;

  if (isEdit) {
    setEditSize((prev) => {
      const updated = [...prev.vehicleTypes];
      updated[editingTagIndex] = trimmed;
      return { ...prev, vehicleTypes: updated };
    });
  } else {
    setNewSize((prev) => {
      const updated = [...prev.vehicleTypes];
      updated[editingTagIndex] = trimmed;
      return { ...prev, vehicleTypes: updated };
    });
  }

  setEditingTagIndex(null);
  setEditingTagValue("");
};

const handleSaveNewSize = () => {
  if (!newSize.name.trim()) return;

  /* prevent duplicates */
  if (
    vehicleSizes.some(
      (v) => v.name.trim().toLowerCase() === newSize.name.trim().toLowerCase()
    )
  ) {
    alert("Size already exists");
    return;
  }

  const newEntry: VehicleSize = {
    id: genId(),
    name: newSize.name,
    abbreviation: generateAbbreviation(newSize.name),
    vehicleTypes: [...newSize.vehicleTypes],
  };

  // ADD THE NEW ENTRY
  const updatedSizes = [...vehicleSizes, newEntry];

  setVehicleSizes(updatedSizes);

  localStorage.setItem(
    VEHICLE_SIZE_KEY,
    JSON.stringify(updatedSizes)
  );

  /* attach pricing */
  setSizePricing((prev) => ({
    ...prev,
    [newEntry.id]: newSize.price || 0,
  }));

  setIsAddingSize(false);

  // cleanup
  setNewSize({
    name: "",
    vehicleTypes: [],
    price: 0,
  });

  setVehicleTypeInput("");
  setEditingTagIndex(null);
  setEditingTagValue("");
};

const handleCancelNewSize = () => {
  setIsAddingSize(false);
  setNewSize({ name: "", vehicleTypes: [], price: 0 });

  setVehicleTypeInput("");
  setEditingTagIndex(null);
  setEditingTagValue("");
};


const handleEditSize = (vs: VehicleSize) => {
  setEditingSizeId(vs.id);
  setEditSize({
    name: vs.name,
    vehicleTypes: [...vs.vehicleTypes],
    price: sizePricing[vs.id] ?? 0,
  });
};

const handleSaveEditSize = () => {
  if (!editingSizeId) return;

  const updatedSizes = vehicleSizes.map((vs) =>
    vs.id === editingSizeId
      ? { ...vs, name: editSize.name,  abbreviation: generateAbbreviation(editSize.name), vehicleTypes: editSize.vehicleTypes }
      : vs
  );

  setVehicleSizes(updatedSizes);
  localStorage.setItem(VEHICLE_SIZE_KEY, JSON.stringify(updatedSizes));

  setSizePricing((prev) => ({
    ...prev,
    [editingSizeId]: editSize.price || 0,
  }));

  setEditingSizeId(null);
};

const handleCancelEditSize = () => {
  setEditingSizeId(null);
};

const handleDeleteSize = (id: string) => {

  const updatedSizes = vehicleSizes.filter((vs) => vs.id !== id);
  setVehicleSizes(updatedSizes);
  localStorage.setItem(VEHICLE_SIZE_KEY, JSON.stringify(updatedSizes));

  setSizePricing((prev) => {
    const copy = { ...prev };
    delete copy[id];
    return copy;
  });
};


/* ================= SAVE ================= */
const handleSubmit = () => {
  if (!name || !categoryName.trim()) {
    alert("Name and category required");

    handleDurationBlur();    
    return;
  }

  const serviceId = mode === "edit" && id ? id : genId();

    const normalizedInput = normalizeCategory(categoryName);

  let finalCategory = categories.find(
    (c) => c.name.toLowerCase() === normalizedInput.toLowerCase()
  );

  let updatedCategories = [...categories];

  if (!finalCategory) {
    finalCategory = {
      id: genId(),
      name: normalizedInput,
    };

    updatedCategories.push(finalCategory);
  }

  /* -------- SERVICES -------- */
  const updatedServices =
    mode === "edit"
      ? services.map((s) =>
          s.id === serviceId
            ? {
                ...s,
                name,
                serviceCategoryId: finalCategory.id,
                description,
                duration,
                pricingType,
              }
            : s
        )
      : [
          ...services,
          {
            id: serviceId,
            name,
            serviceCategoryId: finalCategory.id,
            description,
            duration,
            pricingType,
          },
        ];

  /* -------- PRICING (SAFE MERGE) -------- */
  const filteredPricing = pricing.filter(
    (p) => p.serviceId !== serviceId
  );

  const newPricing: ServicePricing[] = vehicleSizes.map((vs) => ({
    id: genId(),
    serviceId,
    vehicleSizeId: vs.id,
    price: sizePricing[vs.id] || 0,
  }));


  /* -------- SAVE -------- */
  localStorage.setItem(SERVICE_KEY, JSON.stringify(updatedServices));
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(updatedCategories));
  localStorage.setItem(
    PRICING_KEY,
    JSON.stringify([...filteredPricing, ...newPricing])
  );
  
  toast.success("Service saved");

  navigate(-1);
};

  /* ================= SCROLLING ================= */
const MAX_VISIBLE_ROWS = 3;

const rowCount =
  vehicleSizes.length +
  (isAddingSize ? 1 : 0) +
  (!isAddingSize ? 1 : 0); // + add button row

const shouldScroll = rowCount > MAX_VISIBLE_ROWS;
 

  /* ============ DELETE DIALOG HANDLER ============ */

  const handleConfirmDelete = () => {
    if (!targetId) return;

    if (confirmType === "size") {
      const updatedSizes = vehicleSizes.filter((vs) => vs.id !== targetId);
      setVehicleSizes(updatedSizes);
      localStorage.setItem(VEHICLE_SIZE_KEY, JSON.stringify(updatedSizes));

      setSizePricing((prev) => {
        const copy = { ...prev };
        delete copy[targetId];
        return copy;
      });

      toast.success("Vehicle size deleted");
    }

    setConfirmOpen(false);
    setTargetId(null);
    setConfirmType(null);
  };


  /* ================= UI ================= */
  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-y-auto">
    
    
      <DataToolbar
        variant="detail"
        actions={
          < >
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => navigate(-1)}
                >
                  <X className="w-4 h-4 mr-1" /> Cancel
                </Button>

                <Button
                  size="sm"
                  onClick={handleSubmit}
                >
                  <Save className="w-4 h-4 mr-1" />
                  {mode === "edit" ? "Update Service" : "Create Service"}
                </Button>
              </div>              
            </div>
          </>
        }
      />

      <div className="space-y-6 mb-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Information</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <Label>Service Name</Label>
                <Input
                  type="text"
                  className="text-xs bg-background"
                  placeholder="Service Name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />              
              </div>
              <div>
                <Label>Category</Label>
                <div className="bg-background">
                  <Combobox
                    items={categoryOptions}
                    value={categoryName}
                    onChange={setCategoryName}
                    placeholder="Select or type category"
                  />                  
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  placeholder="Description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  rows={5} 
                  className="text-xs bg-background max-h-[240px]"
                />
              </div>
              <div className="space-y-1">
                <Label>Estimated Duration</Label>

                <Input
                  className="text-xs bg-background"
                  value={durationInput}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  onBlur={handleDurationBlur}
                />

                {durationFormatted && (
                  <p className="text-xs text-muted-foreground">
                    {durationFormatted}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 h-full flex flex-col">
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle className="text-base">Pricing</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Choose pricing type and set price per vehicle size.
                  </p>  
                </div>      
                  <div className="inline-flex p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 backdrop-blur-sm">
                    {[
                      { id: "fixed", label: "Fixed Price", icon: <Tag className="w-3 h-3" /> },
                      { id: "hourly rate", label: "Hourly Rate", icon: <Clock className="w-3 h-3" /> },
                    ].map((type) => {
                      const isActive = pricingType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setPricingType(type.id as PricingType)}
                          className={cn(
                            "relative flex items-center gap-2 px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-all duration-200 ease-out rounded-lg",
                            isActive 
                              ? "bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)] ring-1 ring-slate-200" 
                              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                          )}
                        >
                          <span className={cn("transition-transform duration-200", isActive && "scale-110")}>
                            {type.icon}
                          </span>
                          {type.label}
                        </button>
                      );
                    })}
                  </div>                     
              </div>
            </CardHeader>

            <CardContent className="space-y-4 flex flex-col flex-1 overflow-hidden">

              {/* TABLE */}
              <div className="flex-1 min-h-0 max-h-[65vh]">
                <div
                  className={cn(
                    "border rounded-md h-full overflow-hidden",
                  )}
                >
                  <ScrollArea
                    ref={scrollRef}
                    className={cn(
                      "h-full max-h-full px-2"
                    )}
                  >
                    <Table className="table-fixed w-full border-separate border-spacing-y-2">
                      <TableHeader>
                        <TableRow className="bg-secondary/50">
                          <TableHead className="text-xs tracking-wide uppercase rounded-l-lg">Size</TableHead>
                          <TableHead className="text-xs tracking-wide uppercase">Vehicle Type</TableHead>
                          <TableHead className="text-xs tracking-wide uppercase text-right">
                            {pricingType === "hourly rate" ? "Rate / hr" : "Price"}
                          </TableHead>
                          <TableHead className="text-xs uppercase text-right rounded-r-lg w-[15%]"></TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {vehicleSizes.map((vs) => {
                          const isEditing = editingSizeId === vs.id;

                          return (
                            <TableRow key={vs.id} className="rounded-lg border bg-card shadow-sm hover:shadow-md">
                              {/* SIZE */}
                              <TableCell>
                                {isEditing ? (
                                  <Input
                                    value={editSize.name}
                                    onChange={(e) =>
                                      setEditSize((p) => ({ ...p, name: e.target.value }))
                                    }
                                  />
                                ) : (
                                  <Badge variant="outline" className="font-mono">
                                    {vs.name} ({vs.abbreviation})
                                  </Badge>
                                )}
                              </TableCell>

                              {/* DESCRIPTION */}
                              <TableCell className="text-muted-foreground">
                                {isEditing ? (
                                  <div className="space-y-1">
                                    <div className="flex flex-wrap gap-1">
                                      {editSize.vehicleTypes.map((type, index) => (
                                        <div key={index}>
                                          {editingTagIndex === index ? (
                                            <input
                                              autoFocus
                                              className="text-sm px-2 py-2 border rounded-md"
                                              value={editingTagValue}
                                              onChange={(e) => setEditingTagValue(e.target.value)}
                                              onBlur={() => saveEditTag(true)}
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                  e.preventDefault();
                                                  saveEditTag(true);
                                                }
                                              }}
                                            />
                                          ) : (
                                            <span
                                              className="flex items-center gap-1 px-2 py-0.5 text-sm border rounded-md bg-muted cursor-pointer"
                                              onClick={() => startEditTag(index, type)}
                                            >
                                              {type}
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  removeVehicleType(type, true);
                                                }}
                                                className="text-muted-foreground hover:text-red-500"
                                              >
                                                ×
                                              </button>
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </div>

                                    <Input
                                      className="text-xs"
                                      placeholder="type and press enter"
                                      value={editVehicleTypeInput}
                                      onChange={(e) => setEditVehicleTypeInput(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          handleAddVehicleType(editVehicleTypeInput, true);
                                        }
                                      }}
                                    />
                                  </div>
                                ) : (
                                  vs.vehicleTypes.join(", ")
                                )}
                              </TableCell>

                              {/* PRICE */}
                              <TableCell className="text-right py-0">
                                {isEditing ? (
                                  <CurrencyInput
                                    value={editSize.price}
                                    onChange={(val) =>
                                      setEditSize((p) => ({
                                        ...p,
                                        price: val,
                                      }))
                                    }
                                    className="ml-auto max-w-[200px]"
                                  />
                                ) : (
                                  <CurrencyInput
                                    value={sizePricing[vs.id] ?? 0}
                                    onChange={(val) =>
                                      setSizePricing((prev) => ({
                                        ...prev,
                                        [vs.id]: val,
                                      }))
                                    }
                                    className="ml-auto max-w-[200px]"
                                  />
                                )}
                              </TableCell>

                              {/* ACTIONS */}
                              <TableCell className="text-right py-0">
                                {isEditing ? (
                                  <div className="flex justify-end gap-2">
                                    <Button size="icon_xs" onClick={handleSaveEditSize}>
                                      <Check className="w-4 h-4" />
                                    </Button>

                                    <Button
                                      size="icon_xs"
                                      variant="destructive"
                                      onClick={handleCancelEditSize}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        size="icon_xs"
                                        variant="ghost"
                                        className="p-1 border border-muted-foreground/40"
                                      >
                                        <MoreHorizontal className="w-5 h-5" />
                                      </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent
                                      align="end"
                                      side="left"
                                      sideOffset={4}
                                      collisionPadding={8}
                                      className="w-28"
                                    >
                                      <DropdownMenuItem onClick={() => handleEditSize(vs)}>
                                        <Pencil className="w-3 h-3 mr-2" />
                                        Edit
                                      </DropdownMenuItem>

                                      <DropdownMenuItem
                                        className="text-red-500"
                                        onClick={() => {
                                          setConfirmType("size");
                                          setTargetId(vs.id);
                                          setConfirmOpen(true);
                                        }}
                                      >
                                        <Trash2 className="w-3 h-3 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}

                        {isAddingSize && (
                          <TableRow className="rounded-lg border bg-card shadow-sm hover:shadow-md">
                            {/* SIZE */}
                            <TableCell className="text-muted-foreground">
                              <Input
                                placeholder="e.g. Small"
                                value={newSize.name}
                                onChange={(e) =>
                                  setNewSize((p) => ({ ...p, name: e.target.value }))
                                }
                              />
                            </TableCell>

                            {/* DESCRIPTION */}
                            <TableCell className="align-top">
                              <div className="space-y-1">
                                {/* TAGS OUTSIDE INPUT */}
                                <div className="flex flex-wrap gap-1">
                                  {newSize.vehicleTypes.map((type, index) => (
                                    <div key={index}>
                                      {editingTagIndex === index ? (
                                        <input
                                          autoFocus
                                          className="text-sm px-2 py-2 border rounded-md"
                                          value={editingTagValue}
                                          onChange={(e) => setEditingTagValue(e.target.value)}
                                          onBlur={() => saveEditTag()}
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                              e.preventDefault();
                                              saveEditTag();
                                            }
                                          }}
                                        />
                                      ) : (
                                        <span
                                          className="flex items-center gap-1 px-2 py-0.5 text-sm border rounded-md bg-muted cursor-pointer hover:bg-muted/70"
                                          onClick={() => startEditTag(index, type)}
                                        >
                                          {type}
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              removeVehicleType(type);
                                            }}
                                            className="text-muted-foreground hover:text-red-500"
                                          >
                                            ×
                                          </button>
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>

                                {/* INPUT BELOW */}
                                <Input
                                  className="text-xs"
                                  placeholder="type and press enter"
                                  value={vehicleTypeInput}
                                  onChange={(e) => setVehicleTypeInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleAddVehicleType(vehicleTypeInput);
                                    }
                                  }}
                                />
                              </div>
                            </TableCell>

                            {/* PRICE */}
                            <TableCell className="text-right">
                              <CurrencyInput
                                value={newSize.price}
                                onChange={(val) =>
                                  setNewSize((p) => ({
                                    ...p,
                                    price: val,
                                  }))
                                }
                                className="ml-auto max-w-[120px]"
                              />
                            </TableCell>

                            {/* ACTIONS */}
                            <TableCell className="text-right space-x-2">
                              <Button size="icon_xs" onClick={handleSaveNewSize}>
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button size="icon_xs" variant="ghost" onClick={handleCancelNewSize}>
                                <X className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )}

                        {/* ================= ADD BUTTON ROW ================= */}
                        {!isAddingSize && (
                          <TableRow className="rounded">
                            <TableCell colSpan={4} className="rounded p-0">
                              <Button
                                size="xs"
                                variant="ghost"
                                className="w-full hover:bg-blue-400"
                                onClick={handleAddRow}
                              >
                                + Add Vehicle Size
                              </Button>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>      
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>  

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title= "Delete Vehicle Size"
        description={
          <>
            Are you sure you want to delete this vehicle size?
            <br />
            <br />
            <span className="text-muted-foreground">
              Note: This will permanently delete the vehicle size
              (including all services that use it).
            </span>
          </>
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleConfirmDelete}
      />

    </div>
  );
};

export default ServiceCatalogForm;