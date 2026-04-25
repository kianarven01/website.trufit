import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scrollArea";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Pagination, usePagination } from "@/components/ui/pagination";
import DataToolbar from "@/components/DataToolbar";

import TaskLibraryModal from "@/components/popupModal/ServiceCatalog/TaskLibraryModal";
import ConfirmDialog from "@/components/popupModal/AlertDialog/ConfirmDialog";

import {
  ImageIcon,
  BookOpen,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ================= STORAGE ================= */
const TASK_LIBRARY_KEY = "taskLibrary";

/* ================= TYPES ================= */
interface TaskLibraryItem {
  id: string;
  name: string;
  description?: string;
}

/* ================= HELPERS ================= */
const genId = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(27).substring(2);

/* ================= SEED ================= */
const seedTaskLibrary = () => {
  if (localStorage.getItem(TASK_LIBRARY_KEY)) return;

  const tasks: TaskLibraryItem[] = [
    { id: genId(), name: "Oil Change", description: "Replace engine oil" },
    { id: genId(), name: "Brake Inspection", description: "Check brake pads" },
    { id: genId(), name: "Battery Check", description: "Test battery health" },
    { id: genId(), name: "Tire Rotation", description: "Rotate tires evenly" },
  ];

  localStorage.setItem(TASK_LIBRARY_KEY, JSON.stringify(tasks));
};

/* ================= COMPONENT ================= */
const TaskLibraryList: React.FC = () => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<TaskLibraryItem[]>([]);
  const [search, setSearch] = useState("");

  /* MODALS */
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskLibraryItem | null>(null);

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskLibraryItem | null>(null);

  const { page, setPage, pageSize, setPageSize, paginate } =
    usePagination(25);

  /* ================= LOAD ================= */
  useEffect(() => {
    seedTaskLibrary();
    setTasks(JSON.parse(localStorage.getItem(TASK_LIBRARY_KEY) || "[]"));
  }, []);

  const saveToStorage = (data: TaskLibraryItem[]) => {
    localStorage.setItem(TASK_LIBRARY_KEY, JSON.stringify(data));
    setTasks(data);
  };

  /* ================= SEARCH ================= */
  const normalize = (val: string) =>
    (val || "").toLowerCase().trim();

  const filtered = useMemo(() => {
    const q = normalize(search);

    return tasks.filter((t) => {
      const text = normalize(`${t.name} ${t.description}`);
      return !q || text.includes(q);
    });
  }, [tasks, search]);

  const paginated = paginate(filtered);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  /* ================= CRUD ================= */

  const handleSaveTask = (task: TaskLibraryItem) => {
    const exists = tasks.some((t) => t.id === task.id);

    let updated: TaskLibraryItem[];

    if (exists) {
      updated = tasks.map((t) =>
        t.id === task.id ? task : t
      );
    } else {
      updated = [...tasks, task];
    }

    saveToStorage(updated);
  };

  const handleEdit = (task: TaskLibraryItem) => {
    setEditingTask(task);
    setOpenTaskModal(true);
  };

  const handleDelete = () => {
    if (!selectedTask) return;

    const updated = tasks.filter((t) => t.id !== selectedTask.id);
    saveToStorage(updated);

    setDeleteDialog(false);
    setSelectedTask(null);
  };

  /* ================= EMPTY ================= */
  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 flex flex-col items-center text-center">
          <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">No tasks available</p>
          <p className="text-xs text-muted-foreground">
            Add a task to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden">

      {/* MODALS */}
      <TaskLibraryModal
        open={openTaskModal}
        onOpenChange={(open) => {
          setOpenTaskModal(open);
          if (!open) setEditingTask(null);
        }}
        task={editingTask}
        onSaved={handleSaveTask}
      />

      <ConfirmDialog
        open={deleteDialog}
        onOpenChange={setDeleteDialog}
        title="Delete Task"
        description={`Are you sure you want to delete "${selectedTask?.name}"?`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />

      {/* BREADCRUMB */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Task Library</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* TOOLBAR */}
      <DataToolbar
        searchPlaceholder="Search tasks..."
        onSearch={setSearch}
        beforeAdd={
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate("/webapp/services/service-catalog")}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Back to Services
          </Button>
        }
        onAdd={() => setOpenTaskModal(true)}
        addLabel="Add Task"
      />

      {/* TABLE */}
      <div className="flex-1 flex flex-col border rounded-xl overflow-hidden">
        <ScrollArea className="flex-1 px-3">

          <Table className="table-fixed w-full border-separate border-spacing-y-2">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Task</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[8%]" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginated.map((t) => (
                <TableRow
                  key={t.id}
                  className="rounded-lg border bg-card shadow-sm hover:shadow-md"
                >
                  <TableCell className="font-medium">
                    {t.name}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {t.description || "—"}
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon_xs"
                          variant="ghost"
                          className="border border-muted-foreground/40"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" side="left">
                        <DropdownMenuItem
                          onClick={() => handleEdit(t)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={() => {
                            setSelectedTask(t);
                            setDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </ScrollArea>

        {/* PAGINATION */}
        <div className="border-t mx-3">
          <Pagination
            totalItems={filtered.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskLibraryList;