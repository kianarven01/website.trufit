import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  ClipboardList,
  Calculator,
  Link as LinkIcon,
  Download,
  Maximize2,
  X,
  FileIcon,
  Plus,
  ExternalLink,
} from "lucide-react";

interface AddVehicleRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleId?: string;
  onSave: (record: {
    recordType: "Interview" | "Checklist";
    fileUrl: string;
    fileName: string;
  }) => void;
  editData?: any;
}

const AddVehicleRecord: React.FC<AddVehicleRecordModalProps> = ({
  open,
  onOpenChange,
  onSave,
  editData,
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeType, setActiveType] = useState<"interview" | "checklist">("interview");
  const [previews, setPreviews] = useState<{
    [key: string]: { url: string; name: string; type: string };
  }>({});
  const [urlInput, setUrlInput] = useState("");
  const [fullScreenPreview, setFullScreenPreview] = useState<string | null>(null);

  /* ================= HELPERS ================= */

  useEffect(() => {
    if (!open) {
      setPreviews({});
      setUrlInput("");
      setActiveType("interview");
      setFullScreenPreview(null);
    }
  }, [open]);


  useEffect(() => {
    if (!editData) {
      setPreviews({});
      return;
    } 

    const type =
      editData.recordType === "Interview" ? "interview" : "checklist";

    setActiveType(type);

    setPreviews({
      [type]: {
        url: editData.fileUrl,
        name: editData.fileName,
        type: editData.fileUrl?.startsWith("data:")
          ? "image"
          : "file",
      },
    });
  }, [editData]);  


const handleFileProcessing = (file: File, category: string) => {
  const reader = new FileReader();

  reader.onload = () => {
    const url = reader.result as string;

    setPreviews((prev) => ({
      ...prev,
      [category]: {
        url,
        name: file.name,
        type: file.type,
      },
    }));
  };

  reader.readAsDataURL(file);
};

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileProcessing(file, activeType);
  };

  const handleUrlSubmit = () => {
    if (!urlInput) return;

    setPreviews((prev) => ({
      ...prev,
      [activeType]: {
        url: urlInput,
        name: "Linked Resource",
        type: "url",
      },
    }));

    setUrlInput("");
  };

  const openInNewWindow = (url: string) => {
    window.open(url, "_blank", "noreferrer");
  };


  const currentData = previews[activeType];

  const isImage = currentData?.type?.startsWith("image");


  const handleFinalize = () => {
    const data = previews[activeType];
    if (!data) return;

    onSave({
      recordType: activeType === "interview" ? "Interview" : "Checklist",
      fileUrl: data.url,
      fileName: data.name,
    });

    onOpenChange(false);
  };

  /* ================= UI ================= */

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] p-0 rounded-lg">
          <DialogHeader className="px-6 pt-4">
            <DialogTitle className="text-xl font-bold text-slate-800">
              New Vehicle Record
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-4 space-y-6 bg-white">
            {/* ================= TRANSACTIONS ================= */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">
                  New Transaction
                </Label>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Job Order",
                    icon: ClipboardList,
                    path: "/webapp/services/job-orders",
                    color: "text-blue-600",
                    bg: "bg-blue-50/50",
                    border: "border-blue-100",
                  },
                  {
                    label: "Sales Order",
                    icon: Calculator,
                    path: "/webapp/sales/sales-orders",
                    color: "text-emerald-600",
                    bg: "bg-emerald-50/50",
                    border: "border-emerald-100",
                  },
                  {
                    label: "Estimate",
                    icon: FileText,
                    path: "/webapp/sales/estimates",
                    color: "text-amber-600",
                    bg: "bg-amber-50/50",
                    border: "border-amber-100",
                  },
                ].map((btn) => (
                  <Button
                    key={btn.label}
                    variant="outline"
                    className={`flex-col h-20 gap-2 border ${btn.border} ${btn.bg} hover:shadow-md transition-all duration-200 group active:scale-95`}
                    onClick={() => navigate(btn.path)}
                  >
                    <btn.icon
                      className={`w-6 h-6 ${btn.color} group-hover:scale-110 transition-transform`}
                    />
                    <span className="text-[10px] font-medium uppercase text-slate-600">
                      {btn.label}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  Or Upload Documents
                </span>
              </div>
            </div>

            {/* ================= DOCUMENTS ================= */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <Label className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">
                  Attachments
                </Label>

                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {(["interview", "checklist"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveType(t)}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${
                        activeType === t
                          ? "bg-white text-primary shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* ================= UPLOAD ZONE ================= */}
              <div className="min-h-[220px] flex flex-col gap-4">
                {!currentData ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="flex-1 group border-2 border-dashed border-slate-200 rounded-2xl p-6 transition-all duration-200 hover:border-primary/50 hover:bg-primary/[0.03] flex flex-col items-center justify-center gap-4 cursor-pointer relative"
                  >
                    <div className="p-4 bg-white shadow-sm rounded-full border group-hover:scale-110 transition-transform duration-300">
                      <Plus className="w-8 h-8 text-primary" />
                    </div>

                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-700">
                        Upload{" "}
                        {activeType === "interview" ? "Interview Sheet" : "Checklist"}
                      </p>
                      <p className="text-xs text-slate-400 uppercase tracking-wide">
                        Drag & drop or click to upload
                      </p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileProcessing(file, activeType);
                          e.target.value = "";
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="relative group border border-slate-200 rounded-2xl overflow-hidden bg-slate-100 aspect-video flex items-center justify-center shadow-inner">
                    {isImage ? (
                      <img
                        src={currentData.url}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-white rounded-2xl shadow-sm">
                          <FileIcon className="w-10 h-10 text-primary" />
                        </div>
                        <span className="text-xs font-bold text-slate-600 px-4 text-center truncate max-w-[200px]">
                          {currentData.name}
                        </span>
                      </div>
                    )}

                    {/* ACTIONS */}
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() =>
                          setFullScreenPreview(currentData.url)
                        }
                      >
                        <Maximize2 />
                      </Button>

                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() =>
                          openInNewWindow(currentData.url)
                        }
                      >
                        <ExternalLink />
                      </Button>

                      <a href={currentData.url} download>
                        <Button size="icon" variant="secondary">
                          <Download />
                        </Button>
                      </a>

                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => {
                          const next = { ...previews };
                          delete next[activeType];
                          setPreviews(next);
                        }}
                      >
                        <X />
                      </Button>
                    </div>
                  </div>
                )}

                {/* URL */}
                {!currentData && (
                  <div className="flex gap-2 p-1 bg-slate-50 border rounded-md">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <Input
                        className="pl-9 text-xs"
                        placeholder="Paste URL..."
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleUrlSubmit()
                        }
                      />
                    </div>
                    <Button size="sm" onClick={handleUrlSubmit}>
                      Attach
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="px-4 pb-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Discard
            </Button>
            <Button 
              disabled={!Object.keys(previews).length}
              onClick={handleFinalize}
            >
              {editData ? "Save Changes" : "Finalize Record"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ================= FULLSCREEN ================= */}
      <Dialog
        open={!!fullScreenPreview}
        onOpenChange={() => setFullScreenPreview(null)}
      >
        <DialogContent className="max-w-[100vw] w-full h-screen p-0 bg-slate-950/95 border-none flex items-center justify-center">
          {isImage ? (
            <img
              src={fullScreenPreview!}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="text-white text-center">
              <FileIcon className="w-24 h-24 mx-auto mb-4" />
              <p>No Preview Available</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddVehicleRecord;