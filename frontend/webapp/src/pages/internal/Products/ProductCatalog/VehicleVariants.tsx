import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Button } from "@/components/ui/button";
import Combobox from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";
import api from "@/api/axios";
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
  const { vehicleModelId, vehicleSlug } = useParams<{
    vehicleModelId: string;
    vehicleSlug: string;
  }>();

  const navigate = useNavigate();

  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PartCategory | null>(null);

  const [variantList, setVariantList] = useState<Variant[]>([]);
  const [categoryList, setCategoryList] = useState<PartCategory[]>([]);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const [deleteVariantOpen, setDeleteVariantOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<Variant | null>(null);

  const [deleteCategoryOpen, setDeleteCategoryOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<PartCategory | null>(null);

  const [loadingVariants, setLoadingVariants] = useState(false);

  const vehicleTitle = useMemo(() => {
    if (!vehicleSlug) return "Vehicle";

    return vehicleSlug
      .split("-")
      .map((s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s))
      .join(" ");
  }, [vehicleSlug]);

  const selectedVariant = variantList.find((v) => v.id === selectedVariantId) ?? null;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get<PartCategory[] | { data: PartCategory[] }>(
          "/products/categories"
        );

        const categories = Array.isArray(res.data) ? res.data : res.data.data ?? [];
        setCategoryList(categories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchVariants = async () => {
      if (!vehicleModelId) return;

      setLoadingVariants(true);

      try {
        const res = await api.get<Variant[]>(
          `/vehicles/models/${vehicleModelId}/variants`
        );

        const variants = Array.isArray(res.data) ? res.data : [];
        setVariantList(variants);

        if (variants.length > 0) {
          setSelectedVariantId((prev) => prev ?? variants[0].id);
        } else {
          setSelectedVariantId(null);
        }
      } catch (error) {
        console.error("Failed to fetch variants:", error);
      } finally {
        setLoadingVariants(false);
      }
    };

    fetchVariants();
  }, [vehicleModelId]);

  const handleVariantSaved = async (formVariant: VariantFormInput) => {
    if (!vehicleModelId) {
      console.error("vehicleModelId is missing from route.");
      return;
    }

    const payload = {
      variant_name: formVariant.name.trim(),
      year: Number(formVariant.year),
      engine_displacement: formVariant.engine.trim(),
      transmission_type: formVariant.transmission.trim(),
      oil_capacity: formVariant.oilCapacity ?? 0,
      service_class: formVariant.serviceClass?.trim() ?? "",
    };

    try {
      if (editingVariant?.id) {
        const res = await api.put<Variant>(
          `/vehicles/variants/${editingVariant.id}`,
          payload
        );

        setVariantList((prev) =>
          prev.map((v) => (v.id === editingVariant.id ? res.data : v))
        );

        setSelectedVariantId(editingVariant.id);
      } else {
        const res = await api.post<Variant>(
          `/vehicles/models/${vehicleModelId}/variants`,
          payload
        );

        setVariantList((prev) => [...prev, res.data]);
        setSelectedVariantId(res.data.id);
      }

      setVariantModalOpen(false);
      setEditingVariant(null);
    } catch (error) {
      console.error("Failed to save variant:", error);
    }
  };

  const handleCategorySaved = (category: { name: string; code?: string }) => {
    setCategoryList((prev) => {
      const exists = prev.find((c) => c.name.toLowerCase() === category.name.toLowerCase());
      if (exists) return prev;

      return [
        ...prev,
        {
          id: String(Date.now()),
          name: category.name,
          code: category.code || category.name,
        },
      ];
    });
  };

  const confirmDeleteVariant = async () => {
    if (!variantToDelete) return;

    try {
      await api.delete(`/vehicles/variants/${variantToDelete.id}`);

      const deletedId = variantToDelete.id;

      setVariantList((prev) => {
        const next = prev.filter((v) => v.id !== deletedId);

        if (selectedVariantId === deletedId) {
          setSelectedVariantId(next.length > 0 ? next[0].id : null);
        }

        return next;
      });

      setDeleteVariantOpen(false);
      setVariantToDelete(null);
    } catch (error) {
      console.error("Failed to delete variant:", error);
    }
  };

  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;

    setCategoryList((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
    setDeleteCategoryOpen(false);
    setCategoryToDelete(null);
  };

  return (
    <div className="w-full h-full p-4 flex flex-col space-y-4 select-none overflow-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate("/webapp/products/product-catalog")}>
              Product Catalog
            </BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbPage>{vehicleTitle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <DataToolbar
        searchPlaceholder="Search Vehicles..."
        onSearch={() => {}}
        filters={[]}
        onFilterChange={() => {}}
        onAdd={() => {}}
        addLabel="Add Vehicle"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="space-y-4">
          <div>
            <Card className="cursor-pointer overflow-hidden relative group transition-transform duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardContent className="p-0">
                <div className="w-full h-48 relative overflow-hidden flex items-center justify-center bg-muted/30">
                  <Car className="w-16 h-16 text-muted-foreground/40" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-30 transition-opacity"></div>
                </div>
              </CardContent>

              <div className="flex justify-between items-center px-4 py-3 bg-white transition-colors duration-200 group-hover:bg-gray-900">
                <div className="flex flex-col">
                  <p className="text-gray-900 font-semibold text-sm group-hover:text-white">
                    {vehicleTitle}
                  </p>
                </div>

                <div className="flex items-center text-gray-500 text-xs font-medium">
                  <Badge variant="outline" className="group-hover:text-white">
                    {variantList.length} Variants
                  </Badge>
                  <ChevronRight className="ml-1 w-4 h-4" />
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Variants</CardTitle>
            </CardHeader>

            <CardContent className="pt-0">
              <Combobox
                value={selectedVariant?.name || ""}
                onChange={(val) => {
                  if (!val) return;
                  const variant = variantList.find(
                    (v) => v.name.toLowerCase() === val.toLowerCase()
                  );
                  setSelectedVariantId(variant ? variant.id : null);
                }}
                items={variantList.map((v) => v.name)}
                placeholder={loadingVariants ? "Loading variants..." : "Search variants..."}
              />

              <Button
                className="w-full mt-3"
                variant="outline"
                onClick={() => {
                  setEditingVariant(null);
                  setVariantModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add New Variant
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="lg:col-span-2 space-y-4">
          <Card>
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
              <CardContent className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                <Car className="w-16 h-16 mb-3 opacity-30" />
                {loadingVariants ? (
                  <p>Loading variants...</p>
                ) : variantList.length > 0 ? (
                  <p>Select a variant to see details</p>
                ) : (
                  <p>No existing variant available. Create a new one.</p>
                )}
              </CardContent>
            )}
          </Card>

          <Card>
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

            <CardContent className="pt-0">
              {categoryList.length > 0 ? (
                <ScrollArea style={{ maxHeight: 240 }}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                            navigate(
                              `/webapp/products/product-catalog/${vehicleModelId}/${vehicleSlug}/${selectedVariantId}/${cat.id}/products`
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
        </section>
      </div>

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