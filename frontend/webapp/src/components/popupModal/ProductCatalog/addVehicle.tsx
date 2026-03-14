
import { useEffect, useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scrollArea"

import { X, ImagePlus } from "lucide-react"
import { toast } from "sonner"

import MakeCombobox from "@/components/ui/combobox"

interface MakeOption {
  id: string
  name: string
}

interface VehicleModalItem {
  id: string
  image: string
  makeId: string
  model: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle?: VehicleModalItem | null
  makerList: MakeOption[]
  onSaved: (vehicle: VehicleModalItem) => void
}

export function VehicleModal({
  open,
  onOpenChange,
  vehicle,
  makerList,
  onSaved,
}: Props) {
  const isEdit = !!vehicle

  const [makeName, setMakeName] = useState("") // always string
  const [model, setModel] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  
  useEffect(() => {
    if (!open) return

    if (vehicle) {
      const existingMake = makerList.find((m) => m.id === vehicle.makeId)
      setMakeName(existingMake ? existingMake.name : vehicle.makeId)
      setModel(vehicle.model)
      setImageUrl(vehicle.image)
    } else {
      setMakeName("")
      setModel("")
      setImageUrl("")
    }
  }, [open, vehicle, makerList])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.")
      return
    }

    const reader = new FileReader()
    reader.onload = () => setImageUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!makeName.trim()) {
      toast.error("Vehicle make is required.")
      return
    }

    if (!model.trim()) {
      toast.error("Vehicle model is required.")
      return
    }

    setIsSaving(true)

    const existingMake = makerList.find(
      (m) => m.name.toLowerCase() === makeName.toLowerCase()
    )
    const finalMakeId = existingMake ? existingMake.id : makeName

    const newVehicle: VehicleModalItem = {
      id: vehicle?.id || crypto.randomUUID(),
      makeId: finalMakeId,
      model,
      image: imageUrl,
    }

    try {
      await onSaved(newVehicle)
      toast.success(isEdit ? "Vehicle updated" : "Vehicle added")
      onOpenChange(false)
    } catch {
      toast.error("Failed to save vehicle")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>{isEdit ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[68vh]">
          <div className="px-6 pb-4 space-y-4">
            {/* IMAGE */}
            <div>
              <Label className="text-xs">Vehicle Image</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              {imageUrl ? (
                <div className="relative w-full h-32 rounded-md border border-border overflow-hidden bg-muted">
                  <img
                    src={imageUrl}
                    alt="Vehicle"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl("")
                      if (fileInputRef.current) fileInputRef.current.value = ""
                    }}
                    className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 rounded-md border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center gap-1.5 hover:border-primary/50 hover:bg-muted transition-colors"
                >
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Click to upload image
                  </span>
                </button>
              )}
            </div>

            {/* MAKE */}
            <div>
              <Label className="text-xs">Make *</Label>
              <MakeCombobox
                value={makeName}
                onChange={setMakeName}
                makes={makerList.map((m) => capitalize(m.name))}
                placeholder="Type or select make..."
              />
            </div>

            {/* MODEL */}
            <div>
              <Label className="text-xs">Model *</Label>
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Hilux, Civic, Navara"
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 pb-6 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving
              ? "Saving..."
              : isEdit
              ? "Update Vehicle"
              : "Add Vehicle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}