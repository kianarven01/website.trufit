import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
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
  FolderOpen,
} from "lucide-react";

import DataToolbar from "@/components/DataToolbar";
import AddVehicleVariant, {
  VehicleVariantFormData,
} from "@/components/popupModal/ProductCatalog/addVehicleVariant";
import AddPartsCategory from "@/components/popupModal/ProductCatalog/addPartsCategory";

import DeleteCategoryDialog from "@/components/popupModal/AlertDialog/RemovePartsCategory";
import DeleteVariantDialog from "@/components/popupModal/AlertDialog/RemoveVehicleVariant";
import api from "@/api/axios";

interface Vehicle {
  id: string;
  makeId: string;
  makeName: string;
  model: string;
  image?: string;
}

interface Variant {
  id: string;
  name: string;
  year?: string;
  engine?: string;
  transmission?: string;
  drivetrain?: string;
  oilCapacity?: number;
  serviceClass?: string;
}

interface PartCategory {
  id: string;
  name: string;
  parts: number;
  code?: string;
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

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const fromVehicleSlug = (slug?: string) => {
  if (!slug) return { make: "", model: "" };

  const parts = slug.split("-");
  return {
    make: parts[0] ? parts[0][0].toUpperCase() + parts[0].slice(1) : "",
    model: parts.slice(1).join(" ").replace(/\b\w/g, (c) => c.toUpperCase()),
  };
};

const toCategorySlug = (name: string) => slugify(name);
const toVariantSlug = (name: string) => slugify(name);

const VehicleVariantsPage: React.FC = () => {
  const { vehicleSlug } = useParams<{ vehicleSlug: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as
    | {
        vehicleId?: string;
        vehicle?: Vehicle;
      }
    | undefined;

  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(
    locationState?.vehicle || null
  );

  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PartCategory | null>(
    null
  );

  const [deleteVariantOpen, setDeleteVariantOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<Variant | null>(null);

  const [deleteCategoryOpen, setDeleteCategoryOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] =
    useState<PartCategory | null>(null);

  const [variantList, setVariantList] = useState<Variant[]>([]);
  const [categoryList, setCategoryList] = useState<PartCategory[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  );
  const [makers, setMakers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const slugParts = fromVehicleSlug(vehicleSlug);

  const selectedVariant = variantList.find((v) => v.id === selectedVariantId);

  const selectedVariantLabel = useMemo(() => {
    if (!selectedVariant) return "";
    const extra = [
      selectedVariant.year,
      selectedVariant.engine,
      selectedVariant.transmission,
    ]
      .filter(Boolean)
      .join(" • ");

    return extra ? `${selectedVariant.name} — ${extra}` : selectedVariant.name;
  }, [selectedVariant]);

  const variantComboItems = useMemo(() => {
    return variantList.map((variant) => {
      const extra = [variant.year, variant.engine, variant.transmission]
        .filter(Boolean)
        .join(" • ");
      return extra ? `${variant.name} — ${extra}` : variant.name;
    });
  }, [variantList]);

  const loadManufacturers = async () => {
    const res = await api.get("/vehicles/manufacturers");
    const rows = Array.isArray(res.data?.data) ? res.data.data : res.data;

    setMakers(
      (Array.isArray(rows) ? rows : []).map((item: any) => ({
        id: String(item.id),
        name: String(item.name),
      }))
    );
  };

  const loadVehicleBySlug = async (): Promise<Vehicle | null> => {
    if (locationState?.vehicle) return locationState.vehicle;

    const res = await api.get("/vehicles");
    const rows = Array.isArray(res.data?.data) ? res.data.data : res.data;

    const normalized: Vehicle[] = (Array.isArray(rows) ? rows : []).map(
      (row: any) => ({
        id: String(row.id),
        makeId: String(
          row.makeId ||
            row.make_id ||
            row.manufacturerId ||
            row.manufacturer_id ||
            row.Manufacturer?.id ||
            ""
        ),
        makeName: String(
          row.makeName ||
            row.make_name ||
            row.Manufacturer?.name ||
            row.manufacturer ||
            "Unknown"
        ),
        model: String(row.model || row.Model || ""),
        image: row.image || row.image_URL || undefined,
      })
    );

    return (
      normalized.find(
        (v) =>
          `${slugify(v.makeName)}-${slugify(v.model)}` === String(vehicleSlug)
      ) || null
    );
  };

  const loadVariants = async (vehicleId: string) => {
    const res = await api.get(`/vehicles/models/${vehicleId}/variants`);
    const rows = Array.isArray(res.data?.data) ? res.data.data : res.data;

    const normalized: Variant[] = (Array.isArray(rows) ? rows : []).map(
      (row: any) => ({
        id: String(row.id),
        name: String(row.name || row.variant || row.variant_name || ""),
        year: row.year ? String(row.year) : "",
        engine: row.engine || row.engine_displacement || "",
        transmission: row.transmission || row.transmission_type || "",
        drivetrain: row.drivetrain || row.drive_type || "",
        oilCapacity: row.oil_capacity ?? undefined,
        serviceClass: row.service_class ?? "",
      })
    );

    setVariantList(normalized);

    if (normalized.length > 0) {
      setSelectedVariantId((prev) => prev || normalized[0].id);
    } else {
      setSelectedVariantId(null);
    }
  };

  const loadCategories = async () => {
    const res = await api.get("/products/categories");
    const rows = Array.isArray(res.data?.data) ? res.data.data : res.data;

    const normalized: PartCategory[] = (Array.isArray(rows) ? rows : []).map(
      (row: any) => ({
        id: String(row.id),
        name: String(row.name),
        parts: Number(row.parts_count || row.products_count || 0),
        code: row.code || undefined,
      })
    );

    setCategoryList(normalized);
  };

  const loadPageData = async () => {
    setLoading(true);
    try {
      await loadManufacturers();

      const foundVehicle = await loadVehicleBySlug();
      setCurrentVehicle(foundVehicle);

      if (foundVehicle?.id) {
        await Promise.all([loadVariants(foundVehicle.id), loadCategories()]);
      } else {
        setVariantList([]);
        setCategoryList([]);
      }
    } catch (error) {
      console.error("Failed to load vehicle variants page:", error);
      setVariantList([]);
      setCategoryList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPageData();
  }, [vehicleSlug]);

  const handleSaveVehicle = async (vehicleData: {
    id?: string;
    makeId: string;
    model: string;
    image?: string;
  }) => {
    const payload = {
      manufacturer: vehicleData.makeId,
      model: vehicleData.model,
      image_URL: vehicleData.image || null,
    };

    if (vehicleData.id) {
      await api.put(`/vehicles/${vehicleData.id}`, payload);
    } else {
      await api.post("/vehicles", payload);
    }

    await loadPageData();
    setVehicleModalOpen(false);
  };

  const handleVariantSaved = async (variant: VehicleVariantFormData) => {
    if (!currentVehicle?.id) return;

    const payload = {
      vehicle_model_id: currentVehicle.id,
      name: variant.name,
      year: variant.year || null,
      engine: variant.engine || null,
      transmission: variant.transmission || null,
      drivetrain: variant.drivetrain || null,
      oil_capacity: variant.oilCapacity ?? null,
      service_class: variant.serviceClass || null,
    };

    if (variant.id) {
      await api.put(`/vehicle-variants/${variant.id}`, payload);
    } else {
      await api.post("/vehicle-variants", payload);
    }

    await loadVariants(currentVehicle.id);
    setVariantModalOpen(false);
    setEditingVariant(null);
  };

  const handleCategorySaved = async (category: {
    name: string;
    id?: string;
  }) => {
    const payload = {
      name: category.name,
    };

    if (category.id) {
      await api.put(`/products/categories/${category.id}`, payload);
    } else {
      await api.post("/products/categories", payload);
    }

    await loadCategories();
    setCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const confirmDeleteVariant = async () => {
    if (!variantToDelete || !currentVehicle?.id) return;

    try {
      await api.delete(`/vehicle-variants/${variantToDelete.id}`);
      await loadVariants(currentVehicle.id);

      if (selectedVariantId === variantToDelete.id) {
        setSelectedVariantId(null);
      }
    } catch (error) {
      console.error("Failed to delete variant:", error);
    } finally {
      setDeleteVariantOpen(false);
      setVariantToDelete(null);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await api.delete(`/products/categories/${categoryToDelete.id}`);
      await loadCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
    } finally {
      setDeleteCategoryOpen(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="w-full h-full p-4 flex flex-col space-y-4 select-none overflow-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() => navigate("/webapp/products/product-catalog")}
            >
              Product Catalog
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() => navigate("/webapp/products/product-catalog")}
            >
              {currentVehicle
                ? `${currentVehicle.makeName} ${currentVehicle.model}`
                : `${slugParts.make} ${slugParts.model}`}
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>Vehicle Variants</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

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
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingCategory(null);
                setCategoryModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>

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
          </div>
        }
      />

      {loading ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            Loading vehicle details...
          </CardContent>
        </Card>
      ) : !currentVehicle ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            Vehicle not found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <section className="space-y-4">
            <Card className="h-full cursor-pointer overflow-hidden relative group transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 has-[.no-hover:hover]:hover:shadow-none has-[.no-hover:hover]:hover:translate-y-0">
              <CardContent className="p-0">
                <div className="w-full h-48 relative overflow-hidden flex items-center justify-center bg-muted/30">
                  {currentVehicle.image ? (
                    <img
                      src={currentVehicle.image}
                      alt={`${currentVehicle.makeName} ${currentVehicle.model}`}
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <Car className="w-16 h-16 text-muted-foreground/40" />
                  )}

                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-30 transition-opacity" />

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
                    <p className="text-gray-900 font-semibold text-sm group-hover:text-white">
                      {currentVehicle.makeName}
                    </p>
                    <p className="text-gray-700 text-sm group-hover:text-white">
                      {currentVehicle.model}
                    </p>
                  </div>

                  <Badge variant="outline" className="group-hover:text-white">
                    {variantList.length} Variants
                  </Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground group-hover:text-blue-100">
                    Selected Variant
                  </p>

                  <Combobox
                    value={selectedVariantLabel}
                    onChange={(label) => {
                      const found = variantList.find((variant) => {
                        const extra = [
                          variant.year,
                          variant.engine,
                          variant.transmission,
                        ]
                          .filter(Boolean)
                          .join(" • ");
                        const composed = extra
                          ? `${variant.name} — ${extra}`
                          : variant.name;
                        return composed === label;
                      });

                      if (found) setSelectedVariantId(found.id);
                    }}
                    items={variantComboItems}
                    placeholder="Select variant..."
                  />
                </div>

                {selectedVariant && (
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-700 group-hover:text-blue-100">
                    <div>
                      <span className="font-medium">Year:</span>{" "}
                      {selectedVariant.year || "-"}
                    </div>
                    <div>
                      <span className="font-medium">Engine:</span>{" "}
                      {selectedVariant.engine || "-"}
                    </div>
                    <div>
                      <span className="font-medium">Transmission:</span>{" "}
                      {selectedVariant.transmission || "-"}
                    </div>
                    <div>
                      <span className="font-medium">Drive:</span>{" "}
                      {selectedVariant.drivetrain || "-"}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Variants</h3>
                  <Badge variant="secondary">{variantList.length}</Badge>
                </div>

                <ScrollArea className="h-[360px] pr-2">
                  <div className="space-y-2">
                    {variantList.length === 0 ? (
                      <div className="text-sm text-muted-foreground py-10 text-center">
                        No variants found.
                      </div>
                    ) : (
                      variantList.map((variant) => {
                        const isSelected = variant.id === selectedVariantId;

                        return (
                          <div
                            key={variant.id}
                            onClick={() => setSelectedVariantId(variant.id)}
                            className={`rounded-xl border p-3 cursor-pointer transition ${
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "hover:bg-muted/40"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-medium">{variant.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {[variant.year, variant.engine, variant.transmission]
                                    .filter(Boolean)
                                    .join(" • ") || "No extra details"}
                                </p>
                              </div>

                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon_xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingVariant(variant);
                                    setVariantModalOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon_xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setVariantToDelete(variant);
                                    setDeleteVariantOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </section>

          <section className="lg:col-span-2">
            <Card className="h-full">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Part Categories</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedVariant
                        ? `Browsing categories for ${selectedVariant.name}`
                        : "Select a variant to continue"}
                    </p>
                  </div>

                  <Badge variant="secondary">
                    {categoryList.length} Categories
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {categoryList.length === 0 ? (
                    <div className="md:col-span-2 xl:col-span-3 py-16 text-center text-muted-foreground">
                      No categories found.
                    </div>
                  ) : (
                    categoryList.map((category) => {
                      const Icon = CATEGORY_ICONS[category.name] || FolderOpen;

                      return (
                        <Card
                          key={category.id}
                          onClick={() => {
                            if (!selectedVariant) return;

                            navigate(
                              `/webapp/products/product-catalog/${vehicleSlug}/${toVariantSlug(
                                selectedVariant.name
                              )}/${toCategorySlug(category.name)}/products`,
                              {
                                state: {
                                  vehicleId: currentVehicle.id,
                                  vehicle: currentVehicle,
                                  variantId: selectedVariant.id,
                                  variant: selectedVariant,
                                  categoryId: category.id,
                                  category,
                                },
                              }
                            );
                          }}
                          className={`transition cursor-pointer hover:shadow-md ${
                            selectedVariant
                              ? ""
                              : "opacity-60 pointer-events-none"
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className="rounded-xl bg-muted p-3">
                                  <Icon className="h-5 w-5" />
                                </div>

                                <div>
                                  <p className="font-medium">{category.name}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {category.parts} parts
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon_xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingCategory(category);
                                    setCategoryModalOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon_xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCategoryToDelete(category);
                                    setDeleteCategoryOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>

                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      )}

      <VehicleModal
        open={vehicleModalOpen}
        onOpenChange={setVehicleModalOpen}
        vehicle={
          editingVehicle
            ? {
                id: editingVehicle.id,
                makeId: editingVehicle.makeId,
                model: editingVehicle.model,
                image: editingVehicle.image || "",
              }
            : null
        }
        makerList={makers}
        onSaved={handleSaveVehicle}
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
        onOpenChange={(open) => {
          setCategoryModalOpen(open);
          if (!open) setEditingCategory(null);
        }}
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