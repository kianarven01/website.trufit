import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

/* ================= STORAGE ================= */
const TASK_LIBRARY_KEY = "taskLibrary";

/* ================= TYPES ================= */
export interface TaskLibraryItem {
  id: string;
  name: string;
  description?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskLibraryItem | null;
  onSaved?: (task: TaskLibraryItem) => void;
}

/* ================= COMPONENT ================= */
const TaskLibraryModal: React.FC<Props> = ({
  open,
  onOpenChange,
  task,
  onSaved,
}) => {
  const isEdit = !!task;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  /* ================= LOAD ================= */
  useEffect(() => {
    if (open) {
      if (task) {
        setName(task.name);
        setDescription(task.description || "");
      } else {
        setName("");
        setDescription("");
      }
    }
  }, [open, task]);

  /* ================= SAVE ================= */
  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Task name is required");
      return;
    }

    setIsSaving(true);

    try {
      const stored: TaskLibraryItem[] = JSON.parse(
        localStorage.getItem(TASK_LIBRARY_KEY) || "[]"
      );

      let updated: TaskLibraryItem[];

      if (isEdit) {
        updated = stored.map((t) =>
          t.id === task!.id
            ? { ...t, name: name.trim(), description }
            : t
        );
      } else {
        const newTask: TaskLibraryItem = {
          id: crypto.randomUUID(),
          name: name.trim(),
          description,
        };

        updated = [...stored, newTask];
      }

      localStorage.setItem(TASK_LIBRARY_KEY, JSON.stringify(updated));

      const savedTask = isEdit
        ? updated.find((t) => t.id === task!.id)!
        : updated[updated.length - 1];

      onSaved?.(savedTask);

      toast.success(isEdit ? "Task updated" : "Task added");
      onOpenChange(false);
    } catch {
      toast.error("Failed to save task");
    } finally {
      setIsSaving(false);
    }
  };

  /* ================= UI ================= */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-6 pb-2">
          <DialogTitle>
            {isEdit ? "Edit Task" : "Add New Task"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pb-4 px-4">
          {/* TASK NAME */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase">
              Task *
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Oil Change"
            />
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase">
              Description
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="px-4 py-4 border-t bg-muted/10">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving
              ? "Saving..."
              : isEdit
              ? "Update Task"
              : "Save Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskLibraryModal;