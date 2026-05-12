import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scrollArea";

/* ================= STORAGE ================= */
const TASK_LIBRARY_KEY = "taskLibrary";

/* ================= TYPES ================= */
export interface TaskLibraryItem {
  id: string;
  name: string;
  description?: string;
}

interface ServiceTask {
  id: string;
  serviceId: string;
  taskId: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string;
  existingTasks: ServiceTask[];
  onAssign: (tasks: ServiceTask[]) => void;
}

/* ================= COMPONENT ================= */
const AssignTaskModal: React.FC<Props> = ({
  open,
  onOpenChange,
  serviceId,
  existingTasks,
  onAssign,
}) => {
  const [taskLibrary, setTaskLibrary] = useState<TaskLibraryItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const checkboxRef = useRef<HTMLButtonElement | null>(null);

  /* ================= LOAD ================= */
  useEffect(() => {
    if (!open) return;

    const stored: TaskLibraryItem[] = JSON.parse(
      localStorage.getItem(TASK_LIBRARY_KEY) || "[]"
    );

    setTaskLibrary(stored);

    const preselected = new Set(existingTasks.map((t) => t.taskId));
    setSelected(preselected);
  }, [open, existingTasks]);

  /* ================= INDENT STATE ================= */
  const allSelected =
    taskLibrary.length > 0 && selected.size === taskLibrary.length;

  const isIndeterminate =
    selected.size > 0 && selected.size < taskLibrary.length;

  useEffect(() => {
    if (checkboxRef.current) {
      // @ts-ignore
      checkboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  /* ================= TOGGLE ================= */
  const toggle = (taskId: string) => {
    setSelected((prev) => {
      const copy = new Set(prev);
      copy.has(taskId) ? copy.delete(taskId) : copy.add(taskId);
      return copy;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(taskLibrary.map((t) => t.id)));
    }
  };

  /* ================= SUBMIT ================= */
  const handleAssign = () => {
    const result: ServiceTask[] = Array.from(selected).map((taskId) => ({
      id: crypto.randomUUID(),
      serviceId,
      taskId,
    }));

    onAssign(result);
    onOpenChange(false);
  };

  /* ================= UI ================= */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 h-[85vh] flex flex-col overflow-hidden">

        {/* HEADER */}
        <DialogHeader className="px-4 pt-6 pb-2 shrink-0">
          <DialogTitle>Assign Tasks</DialogTitle>
        </DialogHeader>

        {/* BODY */}
        <div className="flex-1 px-4 min-h-0">
          <div className="border rounded-md flex flex-col h-full overflow-hidden bg-card">

            {/* TABLE HEADER (fixed) */}
            <Table className="table-fixed w-full shrink-0">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">
                    <Checkbox
                      ref={checkboxRef}
                      checked={allSelected}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead className="w-[35%]">Task</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
            </Table>

            {/* SCROLLABLE BODY */}
            <ScrollArea className="flex-1 min-h-0">
              <Table className="table-fixed w-full border-spacing-y-2">
                <TableBody>
                  {taskLibrary.map((task) => (
                    <TableRow
                      key={task.id}
                      className="cursor-pointer"
                      onClick={() => toggle(task.id)}
                    >
                      <TableCell
                        className="w-[60px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selected.has(task.id)}
                          onCheckedChange={() => toggle(task.id)}
                        />
                      </TableCell>

                      <TableCell className="text-xs font-medium w-[35%]">
                        {task.name}
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {task.description || "—"}
                      </TableCell>
                    </TableRow>
                  ))}

                  {taskLibrary.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-xs py-6">
                        No tasks in library
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>

          </div>
        </div>

        {/* FOOTER */}
        <DialogFooter className="px-4 py-4 border-t bg-muted/10 shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button onClick={handleAssign}>
            Assign Task ({selected.size})
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};

export default AssignTaskModal;