import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Warehouse as WarehouseIcon, Ellipsis, Plus, ChevronRight } from "lucide-react";
import api from "@/api/axios";
import AppToast, { AppToastType } from "@/components/ui/AppToast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BinLocation {
  id: string;
  warehouse_id: string;
  code: string;
  name: string | null;
  is_active: boolean;
  created_at: string | null;
}

interface WarehouseLocation {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string | null;
  bins?: BinLocation[];
}

const Warehouse: React.FC = () => {
  const [locations, setLocations] = useState<WarehouseLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    type: AppToastType;
    title: string;
    message: string;
  } | null>(null);

  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<WarehouseLocation | null>(null);
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [isBinModalOpen, setIsBinModalOpen] = useState(false);
  const [editingBin, setEditingBin] = useState<BinLocation | null>(null);
  const [binWarehouseId, setBinWarehouseId] = useState<string>("");
  const [binFormCode, setBinFormCode] = useState("");
  const [binFormName, setBinFormName] = useState("");
  const [binFormIsActive, setBinFormIsActive] = useState(true);
  const [isSavingBin, setIsSavingBin] = useState(false);
  const [confirmDeleteBinId, setConfirmDeleteBinId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingBinId, setDeletingBinId] = useState<string | null>(null);

  const loadLocations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/warehouses");
      const rows = Array.isArray(res.data?.data) ? res.data.data : [];
      setLocations(rows);
    } catch (error) {
      console.error("Failed to load warehouses:", error);
      setToast({ type: "error", title: "Error", message: "Failed to load warehouses." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLocations();
  }, []);

  const filtered = locations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(search.toLowerCase()) ||
      loc.code.toLowerCase().includes(search.toLowerCase()) ||
      (loc.description && loc.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setEditingLocation(null);
    setFormName("");
    setFormCode("");
    setFormDescription("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (loc: WarehouseLocation) => {
    setEditingLocation(loc);
    setFormName(loc.name);
    setFormCode(loc.code);
    setFormDescription(loc.description || "");
    setFormIsActive(loc.is_active);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formCode.trim()) return;
    setIsSaving(true);
    try {
      if (editingLocation) {
        await api.put(`/warehouses/${editingLocation.id}`, {
          name: formName.trim(),
          code: formCode.trim(),
          description: formDescription.trim() || null,
          is_active: formIsActive,
        });
        setToast({ type: "success", title: "Warehouse Updated", message: `"${formName}" has been updated.` });
      } else {
        await api.post("/warehouses", {
          name: formName.trim(),
          code: formCode.trim(),
          description: formDescription.trim() || null,
          is_active: formIsActive,
        });
        setToast({ type: "success", title: "Warehouse Created", message: `"${formName}" has been created.` });
      }
      await loadLocations();
      setIsModalOpen(false);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to save warehouse. Please try again.";
      setToast({ type: "error", title: "Save Failed", message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await api.delete(`/warehouses/${id}`);
      if (expandedId === id) setExpandedId(null);
      await loadLocations();
      setToast({ type: "success", title: "Warehouse Deleted", message: "Warehouse has been deleted." });
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to delete warehouse. Please try again.";
      setToast({ type: "error", title: "Delete Failed", message: msg });
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleOpenAddBin = (warehouseId: string) => {
    setEditingBin(null);
    setBinWarehouseId(warehouseId);
    setBinFormCode("");
    setBinFormName("");
    setBinFormIsActive(true);
    setIsBinModalOpen(true);
  };

  const handleOpenEditBin = (bin: BinLocation) => {
    setEditingBin(bin);
    setBinWarehouseId(bin.warehouse_id);
    setBinFormCode(bin.code);
    setBinFormName(bin.name || "");
    setBinFormIsActive(bin.is_active);
    setIsBinModalOpen(true);
  };

  const handleSaveBin = async () => {
    if (!binFormCode.trim()) return;
    setIsSavingBin(true);
    try {
      if (editingBin) {
        await api.put(`/bin-locations/${editingBin.id}`, {
          code: binFormCode.trim(),
          name: binFormName.trim() || null,
          is_active: binFormIsActive,
        });
        setToast({ type: "success", title: "Bin Updated", message: `Bin "${binFormCode}" has been updated.` });
      } else {
        await api.post(`/warehouses/${binWarehouseId}/bins`, {
          code: binFormCode.trim(),
          name: binFormName.trim() || null,
          is_active: binFormIsActive,
        });
        setToast({ type: "success", title: "Bin Created", message: `Bin "${binFormCode}" has been created.` });
      }
      await loadLocations();
      setIsBinModalOpen(false);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to save bin location. Please try again.";
      setToast({ type: "error", title: "Save Failed", message: msg });
    } finally {
      setIsSavingBin(false);
    }
  };

  const handleDeleteBin = async (id: string) => {
    setDeletingBinId(id);
    try {
      await api.delete(`/bin-locations/${id}`);
      await loadLocations();
      setToast({ type: "success", title: "Bin Deleted", message: "Bin location has been deleted." });
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to delete bin. Please try again.";
      setToast({ type: "error", title: "Delete Failed", message: msg });
    } finally {
      setDeletingBinId(null);
      setConfirmDeleteBinId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <>
    <div className="flex flex-col gap-4 p-4 h-full w-full">
        {toast && (
          <AppToast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={4000}
            onClose={() => setToast(null)}
          />
        )}

        {/* toolbar */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full max-w-sm">
              <div className="relative flex-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <Input
                  placeholder="Search warehouses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-card"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleOpenAdd}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium shadow-sm transition text-sm px-4 py-2"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add Warehouse
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <Card className="bg-card border border-border/40 shadow-sm backdrop-blur-md">
            <CardContent className="py-20 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-muted-foreground text-sm font-medium animate-pulse">
                Loading warehouses...
              </p>
            </CardContent>
          </Card>
        ) : filtered.length > 0 ? (
          <ScrollArea className="flex-1 h-0 border border-border/60 rounded-xl px-2 flex flex-col bg-background shadow-inner">
            <div className="flex-1 overflow-auto">
              <Table className="table-fixed w-full border-separate border-spacing-y-2">
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="w-[5%] text-muted-foreground font-semibold" />
                    <TableHead className="text-muted-foreground font-semibold">
                      Code
                    </TableHead>
                    <TableHead className="w-3/12 text-muted-foreground font-semibold">
                      Name
                    </TableHead>
                    <TableHead className="text-muted-foreground font-semibold">
                      Description
                    </TableHead>
                    <TableHead className="text-muted-foreground font-semibold">
                      Bins
                    </TableHead>
                    <TableHead className="text-muted-foreground font-semibold">
                      Status
                    </TableHead>
                    <TableHead className="w-[5%] text-muted-foreground font-semibold" />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filtered.map((loc) => (
                    <React.Fragment key={loc.id}>
                      <TableRow
                        key={loc.id}
                        onClick={() => toggleExpand(loc.id)}
                        className={cn(
                          "rounded-lg border border-border/60 bg-card shadow-sm hover:shadow-md transition-all cursor-pointer",
                          expandedId === loc.id && "shadow-md bg-accent/20"
                        )}
                      >
                        <TableCell className="w-[5%]">
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 text-muted-foreground transition-transform",
                              expandedId === loc.id && "rotate-90"
                            )}
                          />
                        </TableCell>
                        <TableCell className="text-foreground/80 text-sm">
                          {loc.code}
                        </TableCell>
                        <TableCell className="py-2">
                          <span className="font-medium text-foreground text-sm">
                            {loc.name}
                          </span>
                        </TableCell>
                        <TableCell className="text-foreground/80 text-sm max-w-[300px] truncate">
                          {loc.description || "-"}
                        </TableCell>
                        <TableCell className="text-foreground/80 text-sm">
                          {loc.bins && loc.bins.length > 0 ? (
                            <span className="text-xs font-medium text-muted-foreground">
                              {loc.bins.length} bin{loc.bins.length !== 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/60">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "text-[11px] font-semibold px-2 py-0.5 rounded-full",
                              loc.is_active
                                ? "bg-green-100/10 text-green-400 border border-green-500/20"
                                : "bg-gray-100/10 text-gray-400 border border-gray-500/20"
                            )}
                          >
                            {loc.is_active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell
                          className="text-right"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon_xs"
                                className="hover:bg-accent/40"
                              >
                                <Ellipsis className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-card border border-border/40 shadow-xl rounded-xl p-1 min-w-[120px]"
                            >
                              <DropdownMenuItem
                                onClick={() => handleOpenEdit(loc)}
                                className="cursor-pointer font-medium text-xs rounded-lg hover:bg-accent/40 px-3 py-2 transition"
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenAddBin(loc.id)}
                                className="cursor-pointer font-medium text-xs rounded-lg hover:bg-accent/40 px-3 py-2 transition"
                              >
                                Add Bin Location
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setConfirmDeleteId(loc.id)}
                                className="cursor-pointer font-medium text-xs rounded-lg hover:bg-red-100/50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-2 transition"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>

                      {/* Expanded bins sub-table */}
                      {expandedId === loc.id && (
                        <TableRow key={`${loc.id}-bins`} className="hover:bg-transparent">
                          <TableCell colSpan={7} className="p-0 px-4 pb-3">
                            <div className="ml-8 border border-border/40 rounded-lg bg-card/50 overflow-hidden">
                              <div className="flex items-center justify-between px-4 py-2 border-b border-border/40">
                                <span className="text-xs font-semibold text-muted-foreground">
                                  Bin Locations
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenAddBin(loc.id)}
                                  className="h-7 text-xs gap-1"
                                >
                                  <Plus className="h-3 w-3" />
                                  Add Bin
                                </Button>
                              </div>
                              {loc.bins && loc.bins.length > 0 ? (
                                <Table className="w-full">
                                  <TableHeader>
                                    <TableRow className="hover:bg-transparent border-none">
                                      <TableHead className="text-muted-foreground font-semibold text-xs h-8">
                                        Code
                                      </TableHead>
                                      <TableHead className="text-muted-foreground font-semibold text-xs h-8">
                                        Name
                                      </TableHead>
                                      <TableHead className="text-muted-foreground font-semibold text-xs h-8">
                                        Status
                                      </TableHead>
                                      <TableHead className="w-[10%] text-muted-foreground font-semibold text-xs h-8" />
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {loc.bins.map((bin) => (
                                      <TableRow
                                        key={bin.id}
                                        className="hover:bg-accent/20 transition-all"
                                      >
                                        <TableCell className="text-foreground/80 text-xs py-1.5">
                                          {bin.code}
                                        </TableCell>
                                        <TableCell className="text-foreground/80 text-xs py-1.5">
                                          {bin.name || "-"}
                                        </TableCell>
                                        <TableCell className="py-1.5">
                                          <span
                                            className={cn(
                                              "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                                              bin.is_active
                                                ? "bg-green-100/10 text-green-400 border border-green-500/20"
                                                : "bg-gray-100/10 text-gray-400 border border-gray-500/20"
                                            )}
                                          >
                                            {bin.is_active ? "Active" : "Inactive"}
                                          </span>
                                        </TableCell>
                                        <TableCell className="text-right py-1.5">
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button
                                                variant="outline"
                                                size="icon_xs"
                                                className="hover:bg-accent/40 h-6 w-6"
                                              >
                                                <Ellipsis className="h-3 w-3 text-muted-foreground" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                              align="end"
                                              className="bg-card border border-border/40 shadow-xl rounded-xl p-1 min-w-[100px]"
                                            >
                                              <DropdownMenuItem
                                                onClick={() => handleOpenEditBin(bin)}
                                                className="cursor-pointer font-medium text-xs rounded-lg hover:bg-accent/40 px-3 py-2 transition"
                                              >
                                                Edit
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                onClick={() => setConfirmDeleteBinId(bin.id)}
                                                className="cursor-pointer font-medium text-xs rounded-lg hover:bg-red-100/50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-2 transition"
                                              >
                                                Delete
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              ) : (
                                <div className="px-4 py-6 text-center">
                                  <p className="text-xs text-muted-foreground">
                                    No bin locations yet. Click "Add Bin" to create one.
                                  </p>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        ) : (
          <Card className="bg-card border border-border/40 shadow-sm backdrop-blur-md">
            <CardContent className="py-20 flex flex-col items-center text-center">
              <WarehouseIcon className="h-8 w-8 mb-2 text-muted-foreground/60" />
              <p className="text-sm font-semibold text-foreground">
                No warehouses found
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {search ? "Try a different search term" : 'Click "Add Warehouse" to create one'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Warehouse Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[475px] bg-card border border-border/40 shadow-2xl rounded-2xl p-6 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
              {editingLocation ? "Edit Warehouse" : "Add Warehouse"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-5 py-4 text-sm">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-muted-foreground font-medium">
                Code
              </Label>
              <Input
                placeholder="e.g. MWH-01"
                className="col-span-3 border border-border/80 rounded-lg bg-background text-foreground focus-visible:ring-ring"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-muted-foreground font-medium">
                Name
              </Label>
              <Input
                placeholder="e.g. Main Warehouse"
                className="col-span-3 border border-border/80 rounded-lg bg-background text-foreground focus-visible:ring-ring"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-muted-foreground font-medium">
                Description
              </Label>
              <Input
                placeholder="Optional description"
                className="col-span-3 border border-border/80 rounded-lg bg-background text-foreground focus-visible:ring-ring"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-muted-foreground font-medium">
                Status
              </Label>
              <label className="col-span-3 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                <span className="text-sm text-foreground">{formIsActive ? "Active" : "Inactive"}</span>
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
              className="border-border/80 hover:bg-accent/40 text-sm px-4 py-2"
            >
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              disabled={isSaving || !formName.trim() || !formCode.trim()}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium shadow-sm transition text-sm px-4 py-2"
            >
              {isSaving ? "Saving..." : editingLocation ? "Save Changes" : "Create Warehouse"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Warehouse Confirmation */}
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Warehouse</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this warehouse? Bin locations within it must be deleted or moved first. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (confirmDeleteId) void handleDelete(confirmDeleteId); }}
              disabled={!!deletingId}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingId ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add/Edit Bin Modal */}
      <Dialog open={isBinModalOpen} onOpenChange={setIsBinModalOpen}>
        <DialogContent className="sm:max-w-[400px] bg-card border border-border/40 shadow-2xl rounded-2xl p-6 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
              {editingBin ? "Edit Bin Location" : "Add Bin Location"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-5 py-4 text-sm">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-muted-foreground font-medium">
                Code
              </Label>
              <Input
                placeholder="e.g. A1"
                className="col-span-3 border border-border/80 rounded-lg bg-background text-foreground focus-visible:ring-ring"
                value={binFormCode}
                onChange={(e) => setBinFormCode(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-muted-foreground font-medium">
                Name
              </Label>
              <Input
                placeholder="Optional name"
                className="col-span-3 border border-border/80 rounded-lg bg-background text-foreground focus-visible:ring-ring"
                value={binFormName}
                onChange={(e) => setBinFormName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-muted-foreground font-medium">
                Status
              </Label>
              <label className="col-span-3 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={binFormIsActive}
                  onChange={(e) => setBinFormIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                <span className="text-sm text-foreground">{binFormIsActive ? "Active" : "Inactive"}</span>
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsBinModalOpen(false)}
              disabled={isSavingBin}
              className="border-border/80 hover:bg-accent/40 text-sm px-4 py-2"
            >
              Cancel
            </Button>

            <Button
              onClick={handleSaveBin}
              disabled={isSavingBin || !binFormCode.trim()}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium shadow-sm transition text-sm px-4 py-2"
            >
              {isSavingBin ? "Saving..." : editingBin ? "Save Changes" : "Create Bin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Bin Confirmation */}
      <AlertDialog open={!!confirmDeleteBinId} onOpenChange={(open) => !open && setConfirmDeleteBinId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bin Location</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bin location? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (confirmDeleteBinId) void handleDeleteBin(confirmDeleteBinId); }}
              disabled={!!deletingBinId}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingBinId ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Warehouse;
