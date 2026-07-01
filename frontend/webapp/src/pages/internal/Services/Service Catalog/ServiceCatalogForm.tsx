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
import ManageServiceCategoriesModal from "@/components/popupModal/ServiceCatalog/ManageServiceCategoriesModal";

import { ScrollArea } from "@/components/ui/scrollArea";
import { toast } from "sonner";
import { ArrowLeft, Plus, Save, MoreHorizontal, Clock, Tag, Pencil, Trash2, Check, X } from "lucide-react";
import api from "@/api/axios";

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
  id: number;
  name: string;
}

interface Service {
  id: string;
  name: string;
  serviceCategoryId: string;
  tasks?: string[];
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
const [pricing, setPricing] = useState<ServicePricing[]>([]);
const [duration, setDuration] = useState<number>(0); // total minutes

// Shared sizes for both tables, separate pricing
const [vehicleSizes, setVehicleSizes] = useState<VehicleSize[]>([]);
const [fixedSizePricing, setFixedSizePricing] = useState<Record<string, number>>({});
const [hourlySizePricing, setHourlySizePricing] = useState<Record<string, number>>({});

const [openMenuId, setOpenMenuId] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(false);
const [isSaving, setIsSaving] = useState(false);

const scrollRef = useRef<HTMLDivElement | null>(null);

/* ================= FORM ================= */
const [name, setName] = useState("");
const [categoryName, setCategoryName] = useState("");
const [serviceCategoryId, setServiceCategoryId] = useState<number | null>(null);
const [isManageModalOpen, setIsManageModalOpen] = useState(false);
const [tasks, setTasks] = useState<string[]>([]);
const [pricingType, setPricingType] = useState<PricingType>("fixed");

const [vehicleTypeInput, setVehicleTypeInput] = useState("");
const [editVehicleTypeInput, setEditVehicleTypeInput] = useState("");
const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
const [editingTagValue, setEditingTagValue] = useState("");

const [confirmOpen, setConfirmOpen] = useState(false);
const [confirmType, setConfirmType] = useState<"size" | null>(null);
const [targetId, setTargetId] = useState<string | null>(null);

// Derived active state based on pricingType
const activeSizePricing = pricingType === "fixed" ? fixedSizePricing : hourlySizePricing;
const setActiveSizePricing = pricingType === "fixed" ? setFixedSizePricing : setHourlySizePricing;


/* ================= HELPERS ================= */
const genId = () =>
  crypto.randomUUID?.() ?? Math.random().toString(36).substring(2);


/* ================= DURATION ================= */
// Using separate Hour/Min inputs now


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
  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Fetch categories
      const catRes = await api.get('/products/service-categories');
      setCategories(catRes.data.data);

      if (mode === "edit" && id) {
        const res = await api.get(`/products/service-types/${id}`);
        const s = res.data.data;
        setName(s.name);
        setCategoryName(s.category || "");
        setServiceCategoryId(s.service_category_id || null);
        setTasks(s.tasks || []);
        setPricingType(s.pricing_type || "fixed");
        setDuration(s.duration || 0);

        // Rebuild vehicleSizes and pricing maps from backend pricings
        if (s.pricings && s.pricings.length > 0) {
          const sizesMap: Record<string, VehicleSize> = {};
          const fixedPrices: Record<string, number> = {};
          const hourlyPrices: Record<string, number> = {};

          s.pricings.forEach((p: any) => {
            const type = p.pricing_type || "fixed";
            const name = p.vehicle_size_name;
            
            // Check if we already created a size object for this name
            let sizeId: string;
            const existingSize = Object.values(sizesMap).find(v => v.name === name);
            
            if (existingSize) {
              sizeId = existingSize.id;
              // Merge vehicle types if they differ
              const mergedTypes = Array.from(new Set([...existingSize.vehicleTypes, ...(p.vehicle_types || [])]));
              sizesMap[sizeId].vehicleTypes = mergedTypes;
            } else {
              sizeId = genId();
              sizesMap[sizeId] = {
                id: sizeId,
                name: name,
                abbreviation: (name || "").slice(0, 3).toUpperCase(),
                vehicleTypes: p.vehicle_types || [],
              };
            }

            if (type === "hourly rate") {
              hourlyPrices[sizeId] = p.price;
            } else {
              fixedPrices[sizeId] = p.price;
            }
          });

          setVehicleSizes(Object.values(sizesMap));
          setFixedSizePricing(fixedPrices);
          setHourlySizePricing(hourlyPrices);
        }
      }
    } catch (err) {
      console.error("Failed to load form data", err);
    } finally {
      setIsLoading(false);
    }
  };
  fetchData();
}, [mode, id]);

/* ================= CAPITALIZATION ================= */
const capitalize = (val: string) => {
  if (!val) return "";
  return val
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};


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

const categoryOptions = useMemo(() => {
  return categories.map((c) => ({
    label: c.name,
    value: c.id.toString(),
  }));
}, [categories]);


/* ================= VEHICLE SIZE ================= */
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

/* ================= TAG EDITING ================= */
const startEditTag = (index: number, value: string) => {
  setEditingTagIndex(index);
  setEditingTagValue(value);
};

const saveEditTag = (isEdit: boolean) => {
  if (editingTagIndex === null) return;

  const trimmed = editingTagValue.trim();
  if (trimmed) {
    if (isEdit) {
      setEditSize((prev) => {
        const next = [...prev.vehicleTypes];
        next[editingTagIndex] = trimmed;
        return { ...prev, vehicleTypes: next };
      });
    } else {
      setNewSize((prev) => {
        const next = [...prev.vehicleTypes];
        next[editingTagIndex] = trimmed;
        return { ...prev, vehicleTypes: next };
      });
    }
  }

  setEditingTagIndex(null);
  setEditingTagValue("");
};

/* ================= SIZE ROW HANDLERS ================= */
const handleEditSize = (vs: VehicleSize) => {
  setEditingSizeId(vs.id);
  setEditSize({
    name: vs.name,
    vehicleTypes: [...vs.vehicleTypes],
    price: activeSizePricing[vs.id] || 0,
  });
};

const handleSaveEditSize = () => {
  if (!editingSizeId) return;

  // Ensure any pending vehicle type input is added before saving
  let finalVehicleTypes = [...editSize.vehicleTypes];
  if (editVehicleTypeInput.trim()) {
    const trimmed = editVehicleTypeInput.trim();
    if (!finalVehicleTypes.includes(trimmed)) {
      finalVehicleTypes.push(trimmed);
    }
    setEditVehicleTypeInput("");
  }

  setVehicleSizes((prev) =>
    prev.map((vs) =>
      vs.id === editingSizeId
        ? {
            ...vs,
            name: editSize.name,
            abbreviation: editSize.name.slice(0, 3).toUpperCase(),
            vehicleTypes: finalVehicleTypes,
          }
        : vs
    )
  );

  setActiveSizePricing((prev) => ({
    ...prev,
    [editingSizeId]: editSize.price,
  }));

  setEditingSizeId(null);
};

const handleCancelEditSize = () => {
  setEditingSizeId(null);
};

const handleAddRow = () => {
  setIsAddingSize(true);
  setNewSize({ name: "", vehicleTypes: [], price: 0 });
};

const handleSaveNewSize = () => {
  if (!newSize.name) return;

  const id = genId();
  
  // Ensure any pending vehicle type input is added before saving
  let finalVehicleTypes = [...newSize.vehicleTypes];
  if (vehicleTypeInput.trim()) {
    const trimmed = vehicleTypeInput.trim();
    if (!finalVehicleTypes.includes(trimmed)) {
      finalVehicleTypes.push(trimmed);
    }
    setVehicleTypeInput("");
  }

  const vs: VehicleSize = {
    id,
    name: newSize.name,
    abbreviation: newSize.name.slice(0, 3).toUpperCase(),
    vehicleTypes: finalVehicleTypes,
  };

  setVehicleSizes((prev) => [...prev, vs]);
  setActiveSizePricing((prev) => ({ ...prev, [id]: newSize.price }));
  setIsAddingSize(false);
};

const handleCancelAddSize = () => {
  setIsAddingSize(false);
};

/* ================= SAVE ================= */
const handleSubmit = async () => {
  if (!name.trim()) {
    toast.error("Service name is required");
    return;
  }

  const pricingData = [
    ...vehicleSizes.map(vs => ({
      vehicle_size_id: vs.id,
      vehicle_size_name: vs.name,
      vehicle_types: vs.vehicleTypes,
      price: fixedSizePricing[vs.id] || 0,
      pricing_type: 'fixed'
    })),
    ...vehicleSizes.map(vs => ({
      vehicle_size_id: vs.id,
      vehicle_size_name: vs.name,
      vehicle_types: vs.vehicleTypes,
      price: hourlySizePricing[vs.id] || 0,
      pricing_type: 'hourly rate'
    }))
  ];

  const payload = {
    name,
    category_name: categoryName,
    service_category_id: serviceCategoryId,
    tasks,
    duration,
    pricing_type: pricingType,
    pricing: pricingData
  };

  try {
    setIsSaving(true);
    if (mode === "edit") {
      await api.put(`/products/service-types/${id}`, payload);
      toast.success("Service updated");
    } else {
      await api.post('/products/service-types', payload);
      toast.success("Service created");
    }
    navigate(-1);
  } catch (err) {
    console.error("Failed to save service", err);
    toast.error("Failed to save service");
  } finally {
    setIsSaving(false);
  }
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

      setActiveSizePricing((prev) => {
        const copy = { ...prev };
        delete copy[targetId];
        return copy;
      });
    }

    setConfirmOpen(false);
    setTargetId(null);
    setConfirmType(null);
  };


  /* ================= UI ================= */
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading form details...
        </p>
      </div>
    );
  }

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
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <div className="w-4 h-4 mr-1 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-1" />
                  )}
                  {isSaving
                    ? (mode === "edit" ? "Updating..." : "Creating...")
                    : (mode === "edit" ? "Update Service" : "Create Service")}
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
            <CardContent className="flex flex-col gap-5 p-6">
              <div className="space-y-1.5">
                <Label>Service Name</Label>
                <Input
                  type="text"
                  className="text-xs bg-background"
                  placeholder="Service Name" 
                  value={name} 
                  onChange={(e) => setName(capitalize(e.target.value))} 
                />              
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between h-5">
                  <Label>Category</Label>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="h-auto p-0 text-[11px] font-medium text-primary hover:no-underline"
                    onClick={() => setIsManageModalOpen(true)}
                  >
                    Manage Categories
                  </Button>
                </div>
                <Combobox
                  className="text-xs bg-background"
                  items={categoryOptions}
                    value={serviceCategoryId?.toString() || ""}
                    onChange={(val) => {
                      const match = categories.find(c => c.id.toString() === val || c.name === val);
                      if (match) {
                        setServiceCategoryId(match.id);
                        setCategoryName(match.name);
                      } else {
                        setServiceCategoryId(null);
                        // Prevent saving raw numeric IDs as category names
                        if (val && !/^\d+$/.test(val)) {
                          setCategoryName(capitalize(val));
                        }
                      }
                    }}
                    placeholder="Select or type category"
                    freeText
                  />                  
              </div>
              <div className="space-y-1.5">
                <Label>Tasks</Label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {tasks.map((task, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium border rounded-md bg-secondary text-secondary-foreground"
                      >
                        {task}
                        <button
                          type="button"
                          onClick={() => setTasks(tasks.filter((_, i) => i !== index))}
                          className="text-muted-foreground hover:text-red-500 ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <Input
                    className="text-xs bg-background"
                    placeholder="Type a task and press enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = e.currentTarget.value.trim();
                        if (val && !tasks.includes(val)) {
                          setTasks([...tasks, capitalize(val)]);
                        }
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Estimated Duration</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        className="text-xs bg-background pr-10"
                        value={Math.floor(duration / 60) || ""}
                        placeholder="0"
                        onChange={(e) => {
                          const h = parseInt(e.target.value) || 0;
                          const m = duration % 60;
                          setDuration(h * 60 + m);
                        }}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/60 pointer-events-none tracking-wide">hrs</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        className="text-xs bg-background pr-10"
                        value={(duration % 60) || ""}
                        placeholder="0"
                        onChange={(e) => {
                          const m = parseInt(e.target.value) || 0;
                          const h = Math.floor(duration / 60);
                          setDuration(h * 60 + (m > 59 ? 59 : m));
                        }}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/60 pointer-events-none tracking-wide">min</span>
                    </div>
                  </div>
                </div>
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
                          onClick={() => {
                            setPricingType(type.id as PricingType);
                            setIsAddingSize(false);
                            setEditingSizeId(null);
                          }}
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
                          <TableHead className="text-xs tracking-wide uppercase rounded-l-lg text-center">Size</TableHead>
                          <TableHead className="text-xs tracking-wide uppercase text-center">Vehicle Type</TableHead>
                          <TableHead className="text-xs tracking-wide uppercase text-center">
                            {pricingType === "hourly rate" ? "Rate / hr" : "Price"}
                          </TableHead>
                          <TableHead className="text-xs uppercase text-center rounded-r-lg w-[15%]"></TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {vehicleSizes.map((vs) => {
                          const isEditing = editingSizeId === vs.id;

                          return (
                            <TableRow key={vs.id} className="rounded-lg border bg-card shadow-sm hover:shadow-md">
                              {/* SIZE */}
                              <TableCell className="text-center">
                                {isEditing ? (
                                  <Input
                                    value={editSize.name}
                                    onChange={(e) =>
                                      setEditSize((p) => ({ ...p, name: capitalize(e.target.value) }))
                                    }
                                  />
                                ) : (
                                  <Badge variant="outline" className="font-mono">
                                    {vs.name} ({vs.abbreviation})
                                  </Badge>
                                )}
                              </TableCell>

                              {/* DESCRIPTION */}
                              <TableCell className="text-muted-foreground text-center">
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
                                      onChange={(e) => setEditVehicleTypeInput(capitalize(e.target.value))}
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
                              <TableCell className="text-center py-0">
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
                                    value={activeSizePricing[vs.id] ?? 0}
                                    onChange={(val) =>
                                      setActiveSizePricing((prev) => ({
                                        ...prev,
                                        [vs.id]: val,
                                      }))
                                    }
                                    className="ml-auto max-w-[200px]"
                                  />
                                )}
                              </TableCell>

                              {/* ACTIONS */}
                              <TableCell className="text-center py-0">
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
                            <TableCell className="text-muted-foreground text-center">
                              <Input
                                placeholder="e.g. Small"
                                value={newSize.name}
                                onChange={(e) =>
                                  setNewSize((p) => ({ ...p, name: capitalize(e.target.value) }))
                                }
                              />
                            </TableCell>

                            {/* DESCRIPTION */}
                            <TableCell className="align-top text-center">
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
                                          onBlur={() => saveEditTag(false)}
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                              e.preventDefault();
                                              saveEditTag(false);
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
                                  onChange={(e) => setVehicleTypeInput(capitalize(e.target.value))}
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
                            <TableCell className="text-center">
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
                            <TableCell className="text-center space-x-2">
                              <Button size="icon_xs" onClick={handleSaveNewSize}>
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button size="icon_xs" variant="ghost" onClick={handleCancelAddSize}>
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
            <span className="text-destructive font-medium">
              Warning: This will remove this size and its data from BOTH Fixed Price and Hourly Rate tables.
            </span>
          </>
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleConfirmDelete}
      />

      <ManageServiceCategoriesModal 
        isOpen={isManageModalOpen} 
        onClose={() => setIsManageModalOpen(false)} 
        onCategoriesUpdated={async () => {
          const catRes = await api.get('/products/service-categories');
          const newCategories = catRes.data.data;
          setCategories(newCategories);
          
          // Synchronize form state with updated categories
          if (serviceCategoryId) {
            const match = newCategories.find((c: any) => c.id === serviceCategoryId);
            if (match) {
              // Update name if it was renamed
              setCategoryName(match.name);
            } else {
              // Clear if it was deleted
              setServiceCategoryId(null);
              setCategoryName("");
            }
          }
        }}
      />
    </div>
  );
};

export default ServiceCatalogForm;