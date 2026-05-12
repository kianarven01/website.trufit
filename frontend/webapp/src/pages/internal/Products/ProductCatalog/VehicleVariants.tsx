import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Button } from "@/components/ui/button";
import Combobox from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";
import { VehicleModal } from "@/components/popupModal/ProductCatalog/addVehicle";

import {
  Car,
  Gauge,
  Plus,
  Edit,
  Trash2,
  Circle,
  ChevronRight,
  Settings,
  Wrench,
  Disc,
  Zap,
  Shield,
  Droplets,
} from "lucide-react";

import DataToolbar from "@/components/DataToolbar";
import AddVehicleVariant from "@/components/popupModal/ProductCatalog/addVehicleVariant";
import AddPartsCategory from "@/components/popupModal/ProductCatalog/addPartsCategory";
import DeleteCategoryDialog from "@/components/popupModal/AlertDialog/RemovePartsCategory";
import DeleteVariantDialog from "@/components/popupModal/AlertDialog/RemoveVehicleVariant";

interface Vehicle {
  id: string;
  makeId: string;
  makeName: string;
  model: string;
  image?: string;
  variants?: Variant[];
}

interface Variant {
  id: string;
  name: string;
  year: string;
  engine: string;
  transmission: string;
  oilCapacity?: number;
  serviceClass?: string;
}

interface VariantFormInput {
  id?: string;
  name: string;
  year: string;
  engine: string;
  transmission: string;
  oilCapacity?: number;
  serviceClass?: string;
}

interface PartCategory {
  id: string;
  name: string;
  code: string;
}

interface VehicleRouteState {
  vehicle?: {
    id: string;
    make: string;
    manufacturer_id: string;
    model: string;
    image_url?: string | null;
  };
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Engine: Settings,
  Brakes: Disc,
  Suspension: Shield,
  Transmission: Settings,
  Exhaust: Circle,
  Electrical: Zap,
  Cooling: Droplets,
  Steering: Wrench,
  "Fuel System": Gauge,
  "Body & Trim": Shield,
  Interior: Circle,
  "Tyres & Wheels": Disc,
};

const VehicleVariantsPage: React.FC = () => {
  const { vehicleSlug } = useParams<{ vehicleSlug: string }>();
  const navigate = useNavigate();

  //  track current vehicle
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);

  // Modals & selected items
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null);

  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PartCategory | null>(null);

  const [deleteVariantOpen, setDeleteVariantOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<Variant | null>(null);

  const [deleteCategoryOpen, setDeleteCategoryOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<PartCategory | null>(null);

  // Data
  const [variantList, setVariantList] = useState<Variant[]>([]);
  const [categoryList, setCategoryList] = useState<PartCategory[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  // Extract make & model from slug
  const [make, model] = vehicleSlug
    ? vehicleSlug.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    : ["", ""];

  const toSlug = (str: string) => str.toLowerCase().replace(/\s+/g, "-");

  useEffect(() => {
    if (!vehicleSlug) return;

    const vehicles: Vehicle[] = JSON.parse(localStorage.getItem("vehicles") || "[]");

    const found = vehicles.find((v) => {
      const slug = `${v.makeName}-${v.model}`.replace(/\s+/g, "-").toLowerCase();
      return slug === vehicleSlug;
    });

    setCurrentVehicle(found || null);

    if (!found) return;

    const savedVariants = localStorage.getItem(`variants_${found.id}`);
    setVariantList(savedVariants ? JSON.parse(savedVariants) : []);
  }, [vehicleSlug]);

  //save variants per vehicle
  useEffect(() => {
    if (!currentVehicle) return;

    localStorage.setItem(
      `variants_${currentVehicle.id}`,
      JSON.stringify(variantList)
    );
  }, [variantList, currentVehicle]);


  const selectedVariant = variantList.find((v) => v.id === selectedVariantId);

  // Categories
  useEffect(() => {
    if (!vehicleSlug) return;

    const saved = localStorage.getItem(
      `categories_${vehicleSlug}`
    );

    setCategoryList(saved ? JSON.parse(saved) : []);
  }, [vehicleSlug]);


  useEffect(() => {
    if (!vehicleSlug) return;

    localStorage.setItem(
      `categories_${vehicleSlug}`,
      JSON.stringify(categoryList)
    );
  }, [categoryList, vehicleSlug]);


  const handleVariantSaved = (variant: Variant) => {
    setVariantList((prev) => {
      const exists = prev.find((v) => v.id === variant.id);
      if (exists) return prev.map((v) => (v.id === variant.id ? variant : v));
      return [...prev, variant];
    });
  };

  const handleCategorySaved = (category: { name: string; code?: string }) => {
    setCategoryList((prev) => {
      const exists = prev.find((c) => c.name.toLowerCase() === category.name.toLowerCase());
      if (exists) return prev;

      return [
        ...prev,
        { id: `C-${Date.now()}`, name: category.name, parts: 0 },
      ];
    });
  };

  const confirmDeleteVariant = async () => {
    if (!variantToDelete) return;
    setVariantList((prev) => prev.filter((v) => v.id !== variantToDelete.id));
    if (selectedVariantId === variantToDelete.id) setSelectedVariantId(null);
    setDeleteVariantOpen(false);
    setVariantToDelete(null);
  };

  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;
    setCategoryList((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
    setDeleteCategoryOpen(false);
    setCategoryToDelete(null);
  };

  return (
    <div className="w-full h-full p-4 flex flex-col space-y-4 select-none overflow-auto">
      {/* Toolbar */}

      <DataToolbar
        variant="detail"
        title={
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/webapp/products/product-catalog")}
          >
            Back
          </Button>
        }
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditingVariant(null);
              setVariantModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Variant
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Section */}
        <section className="space-y-4">
          <Card
            className="h-full cursor-pointer overflow-hidden relative group transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 has-[.no-hover:hover]:hover:shadow-none has-[.no-hover:hover]:hover:translate-y-0"
          >
            <CardContent className="p-0">
              <div className="w-full h-48 relative overflow-hidden flex items-center justify-center bg-muted/30">
                {currentVehicle?.image ? (
                  <img
                    src={currentVehicle.image}
                    alt={`${currentVehicle.makeName} ${currentVehicle.model}`}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <Car className="w-16 h-16 text-muted-foreground/40" />
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-30 transition-opacity"></div>
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Button
                    variant="outline"
                    size="icon_xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingVehicle(currentVehicle);
                      setVehicleModalOpen(true);
                    }}
                    className="p-1 rounded-lg bg-white/90 hover:bg-white text-gray-800"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>

            <div className="flex flex-col px-4 py-3 bg-white transition-colors duration-200 group-hover:bg-blue-900">
              <div className="flex justify-between items-center mb-3">
                <div className="flex flex-col">
                  <p className="text-gray-900 font-semibold text-sm group-hover:text-white">{currentVehicle?.makeName}</p>
                  <p className="text-gray-700 text-sm group-hover:text-white">{currentVehicle?.model}</p>
                </div>
                <Badge variant="outline" className="group-hover:text-white">{variantList.length} Variants</Badge>
              </div>

              {/* Variant Combobox */}
<div className="no-hover">
  <Combobox
    value={selectedVariant?.name || ""}
    onChange={(val) => {
      if (!val) return setSelectedVariantId(null);
      const variant = variantList.find(v => v.name.toLowerCase() === val.toLowerCase());
      setSelectedVariantId(variant ? variant.id : null);
    }}
    items={variantList.map(v => v.name)}
    placeholder="Search or add variant..."
    allowAdd
    addLabel="new Variant"
    onAdd={() => {
      setEditingVariant(null);
      setVariantModalOpen(true);
    }}
  />
</div>
            </div>
          </Card>
        </section>

        <section className="lg:col-span-2 space-y-4">
          {/* Variant Details */}
          <Card className="h-full">
            {selectedVariant ? (
              <>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-md font-medium">Variant Details</CardTitle>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon_xs"
                      onClick={() => {
                        setEditingVariant(selectedVariant);
                        setVariantModalOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon_xs"
                      className="text-destructive"
                      onClick={() => {
                        setVariantToDelete(selectedVariant);
                        setDeleteVariantOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="grid grid-cols-2 gap-4 pt-0">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="text-sm font-medium">{selectedVariant.name}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Year</p>
                    <p className="text-sm font-medium">{selectedVariant.year}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Engine</p>
                    <p className="text-sm font-medium">{selectedVariant.engine || "—"}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Transmission</p>
                    <p className="text-sm font-medium">{selectedVariant.transmission || "—"}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Oil Capacity</p>
                    <p className="text-sm font-medium">
                      {selectedVariant.oilCapacity ?? "—"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Service Class</p>
                    <p className="text-sm font-medium">
                      {selectedVariant.serviceClass || "—"}
                    </p>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full p-4">
                <Car className="w-16 h-16 mb-4 opacity-30" />
                {variantList.length > 0 ? (
                  <p className="text-sm text-center">Select a variant to see details</p>
                ) : (
                  <p className="text-sm text-center">No existing variant available. Create a new one.</p>
                )}
              </CardContent>
            )}
          </Card>
        </section>


          {/* Parts Categories */}
          <Card className="lg:col-span-3 flex flex-col min-h-0">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-md font-medium">Parts Categories</CardTitle>

              <Button
                variant="outline"
                size="xs"
                className="text-xs"
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryModalOpen(true);
                }}
              >
                <Plus />
                Add Category
              </Button>
            </CardHeader>
            <CardContent className="pt-0 flex flex-col min-h-0">
              {categoryList.length > 0 ? (
                <ScrollArea className="max-h-[520px] md:max-h-[400px] lg:max-h-[300px] w-full pr-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {categoryList.map((cat) => {
                      const Icon = CATEGORY_ICONS[cat.name] || Wrench;

                      return (
                        <Card
                          key={cat.id}
                          className="relative group cursor-pointer hover:shadow-md transition rounded-lg"
                          onClick={() => {
                            if (!selectedVariantId) {
                              alert("Please select a variant first.");
                              return;
                            }
                            const variant = variantList.find(v => v.id === selectedVariantId);
                            if (!variant) return;
                            navigate(
                              `/webapp/products/product-catalog/${vehicleSlug}/${toSlug(variant.name)}/${toSlug(cat.name)}/products`
                            );
                          }}
                        >
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <Icon className="w-6 h-6 text-primary" />
                            </div>

                            <div className="flex flex-col flex-1 min-w-0">
                              <p className="font-semibold truncate">{cat.name}</p>

                              <div className="flex items-center justify-between mt-1 min-w-0">
                                <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                  <Settings className="w-3 h-3 flex-shrink-0" />
                                  {cat.code || "No code"}
                                </p>
                                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              </div>
                            </div>

                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                              <Button
                                variant="ghost"
                                size="icon_xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCategory(cat); 
                                  setCategoryModalOpen(true); 
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon_xs"
                                className="text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCategoryToDelete(cat); 
                                  setDeleteCategoryOpen(true); 
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <Card className="flex items-center justify-center h-40 border-dashed border-2 border-muted/50 rounded-lg">
                  <CardContent className="text-center text-muted-foreground space-y-2">
                    <p className="font-medium">No Available Parts Category</p>
                    <p className="text-sm">Add a new category to get started.</p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
      </div>

      {/* Modals */}

      <VehicleModal
        open={vehicleModalOpen}
        onOpenChange={setVehicleModalOpen}
        vehicle={editingVehicle}
        makerList={JSON.parse(localStorage.getItem("makers") || "[]")}
        onSaved={(updatedVehicle) => {
          setCurrentVehicle(updatedVehicle);
          const vehicles = JSON.parse(localStorage.getItem("vehicles") || "[]");
          const idx = vehicles.findIndex((v: any) => v.id === updatedVehicle.id);
          if (idx > -1) vehicles[idx] = updatedVehicle;
          else vehicles.push(updatedVehicle);
          localStorage.setItem("vehicles", JSON.stringify(vehicles));
        }}
      />

      <AddVehicleVariant
        open={variantModalOpen}
        onOpenChange={(open) => {
          setVariantModalOpen(open);
          if (!open) setEditingVariant(null);
        }}
        variant={editingVariant}
        onSaved={handleVariantSaved}
      />
      <AddPartsCategory 
        open={categoryModalOpen} 
        onOpenChange={setCategoryModalOpen} 
        category={editingCategory} 
        onSaved={handleCategorySaved} 
      />
      <DeleteVariantDialog 
        open={deleteVariantOpen} 
        onOpenChange={setDeleteVariantOpen} 
        variant={variantToDelete} 
        onConfirm={confirmDeleteVariant} 
      />
      <DeleteCategoryDialog 
        open={deleteCategoryOpen} 
        onOpenChange={setDeleteCategoryOpen} 
        category={categoryToDelete} 
        onConfirm={confirmDeleteCategory} 
      />
    </div>
  );
};

export default VehicleVariantsPage;