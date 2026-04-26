import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
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
import AssignTaskModal from "@/components/popupModal/ServiceCatalog/AssignTasksModal";


import { ScrollArea } from "@/components/ui/scrollArea";
import { toast } from "sonner";
import { ArrowLeft, Plus, Save, MoreHorizontal, Clock, Tag, Pencil, Trash2, Check, X } from "lucide-react";

/* ================= STORAGE ================= */
const CATEGORY_KEY = "serviceCategories";
const SERVICE_KEY = "services";
const VEHICLE_SIZE_KEY = "vehicleSizes";
const PRICING_KEY = "servicePricing";
const SERVICE_TASK_KEY = "serviceTasks";
const TASK_LIBRARY_KEY = "taskLibrary";


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
  pricingType: PricingType;
}

interface VehicleSize {
  id: string;
  name: string;
  description: string;
}

interface ServicePricing {
  id: string;
  serviceId: string;
  vehicleSizeId: string;
  price: number;
}

interface ServiceTask {
  id: string;
  serviceId: string;
  taskId: string;}

interface TaskLibraryItem {
  id: string;
  name: string;
  description?: string;
}

/* ================= HELPERS ================= */
const genId = () =>
  crypto.randomUUID?.() ?? Math.random().toString(36).substring(2);

/* ================= COMPONENT ================= */
const ServiceCatalogForm: React.FC<Props> = ({ mode }) => {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { id } = useParams();

const [categories, setCategories] = useState<ServiceCategory[]>([]);
const [services, setServices] = useState<Service[]>([]);
const [pricing, setPricing] = useState<ServicePricing[]>([]);
const [tasks, setTasks] = useState<ServiceTask[]>([]);
const [vehicleSizes, setVehicleSizes] = useState<VehicleSize[]>([]);
const [openMenuId, setOpenMenuId] = useState<string | null>(null);
const [assignOpen, setAssignOpen] = useState(false);
const scrollRef = useRef<HTMLDivElement | null>(null);

/* ================= FORM ================= */
const [name, setName] = useState("");
const [categoryId, setCategoryId] = useState("");
const [categoryName, setCategoryName] = useState("");
const [description, setDescription] = useState("");
const [pricingType, setPricingType] = useState<PricingType>("fixed");

const [sizePricing, setSizePricing] = useState<Record<string, number>>({});
const [serviceTasks, setServiceTasks] = useState<ServiceTask[]>([]);
const [taskLibrary, setTaskLibrary] = useState<TaskLibraryItem[]>([]);


/* ================= ADD/EDIT SIZE (INLINE ROW) ================= */
const [isAddingSize, setIsAddingSize] = useState(false);

const [newSize, setNewSize] = useState({
  name: "",
  description: "",
  price: 0,
});

const [editingSizeId, setEditingSizeId] = useState<string | null>(null);

const [editSize, setEditSize] = useState({
  name: "",
  description: "",
  price: 0,
});

/* ================= LOAD ================= */
useEffect(() => {
  setCategories(JSON.parse(localStorage.getItem(CATEGORY_KEY) || "[]"));
  setServices(JSON.parse(localStorage.getItem(SERVICE_KEY) || "[]"));
  setPricing(JSON.parse(localStorage.getItem(PRICING_KEY) || "[]"));
  setVehicleSizes(JSON.parse(localStorage.getItem(VEHICLE_SIZE_KEY) || "[]"));

  setTaskLibrary(JSON.parse(localStorage.getItem(TASK_LIBRARY_KEY) || "[]"));
  setTasks(JSON.parse(localStorage.getItem(SERVICE_TASK_KEY) || "[]"));
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
    setDescription(s.description || "");
    setPricingType(s.pricingType);

    const p = pricing.filter((x) => x.serviceId === id);
    const map: Record<string, number> = {};
    p.forEach((x) => (map[x.vehicleSizeId] = x.price));
    setSizePricing(map);

    setServiceTasks(tasks.filter((x) => x.serviceId === id));
  }
}, [mode, id, services, pricing, tasks]);

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

/* ================= TASKS ================= */

const removeTask = (taskId: string) => {
  setServiceTasks((prev) =>
    prev.filter((t) => t.taskId !== taskId)
  );
};


const handleAssignTasks = (newTasks: ServiceTask[]) => {
  setServiceTasks((prev) => {
    const map = new Map<string, ServiceTask>();

    [...prev, ...newTasks].forEach((t) => {
      map.set(t.taskId, t);
    });

    return Array.from(map.values());
  });
};

/* ================= VEHICLE SIZE ================= */

const handleAddRow = () => {
  setIsAddingSize(true);
  setNewSize({ name: "", description: "", price: 0 });
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
    description: newSize.description,
  };

  const updatedSizes = [...vehicleSizes, newEntry];

  setVehicleSizes(updatedSizes);
  localStorage.setItem(VEHICLE_SIZE_KEY, JSON.stringify(updatedSizes));

  /* attach pricing */
  setSizePricing((prev) => ({
    ...prev,
    [newEntry.id]: newSize.price || 0,
  }));

  setIsAddingSize(false);
};

const handleCancelNewSize = () => {
  setIsAddingSize(false);
};


const handleEditSize = (vs: VehicleSize) => {
  setEditingSizeId(vs.id);
  setEditSize({
    name: vs.name,
    description: vs.description,
    price: sizePricing[vs.id] ?? 0,
  });
};

const handleSaveEditSize = () => {
  if (!editingSizeId) return;

  const updatedSizes = vehicleSizes.map((vs) =>
    vs.id === editingSizeId
      ? { ...vs, name: editSize.name, description: editSize.description }
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
  if (!confirm("Delete this vehicle size?")) return;

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

  /* -------- TASKS (SAFE MERGE) -------- */
  const filteredTasks = tasks.filter(
    (t) => t.serviceId !== serviceId
  );

  const newTasks: ServiceTask[] = serviceTasks.map((t) => ({
    id: t.id || genId(),
    serviceId,
    taskId: t.taskId,
  }));

  /* -------- SAVE -------- */
  localStorage.setItem(SERVICE_KEY, JSON.stringify(updatedServices));
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(updatedCategories));
  localStorage.setItem(
    PRICING_KEY,
    JSON.stringify([...filteredPricing, ...newPricing])
  );
  localStorage.setItem(
    SERVICE_TASK_KEY,
    JSON.stringify([...filteredTasks, ...newTasks])
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



  /* ================= UI ================= */
  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-y-auto">
    
      {/* BREADCRUMB */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate(-1)}>Service Catalog</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New Service</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>    

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
                  className="text-xs bg-background"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
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

            <CardContent className="space-y-4">

              {/* TABLE */}
              <div>
                <div
                  className={cn(
                    "border rounded-md",
                    shouldScroll ? "max-h-[320px] overflow-hidden" : "overflow-visible"
                  )}
                >
                  <ScrollArea
                    ref={scrollRef}
                    className={cn(
                      shouldScroll ? "h-[270px]" : "h-auto",
                      "px-2"
                    )}
                  >
                    <Table className="table-fixed w-full border-separate border-spacing-y-2">
                      <TableHeader>
                        <TableRow className="bg-secondary/50">
                          <TableHead className="text-xs tracking-wide uppercase rounded-l-lg w-[15%]">Size</TableHead>
                          <TableHead className="text-xs tracking-wide uppercase">Description</TableHead>
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
                                    {vs.name}
                                  </Badge>
                                )}
                              </TableCell>

                              {/* DESCRIPTION */}
                              <TableCell className="text-muted-foreground">
                                {isEditing ? (
                                  <Input
                                    value={editSize.description}
                                    onChange={(e) =>
                                      setEditSize((p) => ({
                                        ...p,
                                        description: e.target.value,
                                      }))
                                    }
                                  />
                                ) : (
                                  vs.description
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
                                        onClick={() => handleDeleteSize(vs.id)}
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
                                placeholder="e.g. XL"
                                value={newSize.name}
                                onChange={(e) =>
                                  setNewSize((p) => ({ ...p, name: e.target.value }))
                                }
                              />
                            </TableCell>

                            {/* DESCRIPTION */}
                            <TableCell>
                              <Input
                                placeholder="e.g. Extra Large"
                                value={newSize.description}
                                onChange={(e) =>
                                  setNewSize((p) => ({ ...p, description: e.target.value }))
                                }
                              />
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Tasks Involved ({serviceTasks.length})</CardTitle>
              <p className="text-xs text-muted-foreground">
                Necessary tasks to involved to complete this service.
              </p>              
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setAssignOpen(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Assign Task
              </Button>
              <Button
                size="sm"
                variant="default"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add New Task
              </Button>
            </div>
          </div>
        </CardHeader> 
        <CardContent>
          <Table className="table-fixed w-full border-separate border-spacing-y-2">
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead className="text-xs tracking-wide uppercase w-[8%]">#</TableHead>
                <TableHead className="text-xs tracking-wide uppercase w-1/3">Task</TableHead>
                <TableHead className="text-xs tracking-wide uppercase">Description</TableHead>
                <TableHead className="w-[8%] rounded-r-lg"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceTasks.map((st, index) => {
                const task = taskLibrary.find((t) => t.id === st.taskId);
                return (
                <TableRow key={st.id}>
                  <TableCell className="text-xs">{index + 1}</TableCell>
                  <TableCell className="text-xs">{task?.name}</TableCell>
                  <TableCell className="text-xs">{task?.description || "—"}</TableCell>
                  <TableCell className="flex justify-center">
                    <Button
                      size="icon_xs"
                      variant="ghost"
                      onClick={() => removeTask(st.taskId)} 
                      className="bg-red-50 hover:bg-red-200"
                    >
                      <Trash2 className="w-4 h-4 text-red-600"/>
                    </Button>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </CardContent>       
      </Card>

      <AssignTaskModal
        open={assignOpen}
        onOpenChange={setAssignOpen}
        serviceId={id || ""}
        existingTasks={serviceTasks}
        onAssign={handleAssignTasks}
      />

    </div>
  );
};

export default ServiceCatalogForm;