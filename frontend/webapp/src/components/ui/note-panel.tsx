import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scrollArea";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline,
  ListChecks,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  StickyNote,
  GripVertical,
  Loader2,
} from "lucide-react";
import api from "@/api/axios";
import { toast } from "sonner";

export type ChecklistItem = { id: string; text: string; done: boolean };
export type Note = {
  id: string;
  title: string;
  /** HTML content from contentEditable (b/i/u). */
  contentHtml: string;
  checklist: ChecklistItem[];
  updatedAt: number;
};

const uid = () => Math.random().toString(36).slice(2, 10);

interface NotesPanelProps {
  storageKey?: string;
  title?: string;
  className?: string;
}

export function NotesPanel({
  storageKey = "appointments:notes",
  title = "Notes",
  className,
}: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadedNotesRef = useRef<string>("[]");

  // Load from API
  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/appointment-notes?key=${storageKey}`);
        const data = res.data.data || [];
        setNotes(data);
        loadedNotesRef.current = JSON.stringify(data);
      } catch (error) {
        console.error("Failed to load notes:", error);
        toast.error("Failed to load notes from server");
      } finally {
        setIsLoading(false);
      }
    };

    if (storageKey) {
      setNotes([]); // Clear old notes immediately
      loadedNotesRef.current = "[]"; // Reset ref
      fetchNotes();
      setEditingId(null);
      setComposing(false);
    }
  }, [storageKey]);

  // Debounced Save to API
  useEffect(() => {
    if (isLoading) return;

    // Only save if notes have actually changed from what was loaded/saved
    const currentJson = JSON.stringify(notes);
    if (currentJson === loadedNotesRef.current) return;

    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        await api.post("/appointment-notes", {
          key: storageKey,
          data: notes,
        });
        loadedNotesRef.current = currentJson; // Update ref after successful save
        toast.success("Notes synced", { duration: 1000 });
      } catch (error) {
        console.error("Failed to save notes:", error);
        toast.error("Failed to sync notes to server");
      } finally {
        setIsSaving(false);
      }
    }, 500); // 500ms debounce for snappier feel

    return () => clearTimeout(timer);
  }, [notes, storageKey, isLoading]);


  const addNote = (n: Omit<Note, "id" | "updatedAt">) => {
    setNotes((prev) => [
      { ...n, id: uid(), updatedAt: Date.now() },
      ...prev,
    ]);
  };

  const updateNote = (id: string, patch: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)),
    );
  };

  const removeNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (editingId === id) setEditingId(null);
  };

  return (
    <Card className={cn("flex flex-col h-full overflow-hidden", className)}>
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-muted/40">
        <div className="flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">{title}</h3>
          <span className="text-xs text-muted-foreground">({notes.length})</span>
          {isSaving && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground animate-pulse ml-2">
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
              Saving...
            </div>
          )}
        </div>
        {!composing && (
          <Button size="sm" variant="outline" className="h-7 gap-1" onClick={() => setComposing(true)}>
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {composing && (
            <NoteEditor
              autoFocus
              onCancel={() => setComposing(false)}
              onSave={(data) => {
                addNote(data);
                setComposing(false);
              }}
            />
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">Loading notes...</p>
            </div>
          ) : (
            <>
              {notes.length === 0 && !composing && (
                <div className="text-center text-xs text-muted-foreground py-10 border border-dashed rounded-md">
                  No notes yet. Click <span className="font-medium">Add</span> to create one.
                </div>
              )}

              {notes.map((note) =>
                editingId === note.id ? (
                  <NoteEditor
                    key={note.id}
                    initial={note}
                    onCancel={() => setEditingId(null)}
                    onSave={(data) => {
                      updateNote(note.id, data);
                      setEditingId(null);
                    }}
                  />
                ) : (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={() => setEditingId(note.id)}
                    onDelete={() => removeNote(note.id)}
                    onToggleItem={(itemId) =>
                      updateNote(note.id, {
                        checklist: note.checklist.map((c) =>
                          c.id === itemId ? { ...c, done: !c.done } : c,
                        ),
                      })
                    }
                  />
                ),
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}

/* ------------------------------- Note Card -------------------------------- */

function NoteCard({
  note,
  onEdit,
  onDelete,
  onToggleItem,
}: {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
  onToggleItem: (itemId: string) => void;
}) {
  const total = note.checklist.length;
  const done = note.checklist.filter((c) => c.done).length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Card className="group p-3 border bg-card hover:shadow-md transition-shadow">
      <div className="flex items-start gap-2">
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 mt-1 shrink-0" />
        <div className="flex-1 min-w-0">
          {note.title && (
            <p className="font-semibold text-sm text-foreground mb-1 break-words">{note.title}</p>
          )}
          {note.contentHtml && (
            <div
              className="text-sm text-foreground/90 prose-sm max-w-none break-words [&_b]:font-semibold [&_strong]:font-semibold [&_i]:italic [&_em]:italic [&_u]:underline"
              dangerouslySetInnerHTML={{ __html: note.contentHtml }}
            />
          )}

          {total > 0 && (
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all",
                      progress === 100 ? "bg-green-500" : "bg-primary",
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-[10px] tabular-nums text-muted-foreground w-9 text-right">
                  {done}/{total}
                </span>
              </div>
              <ul className="space-y-1">
                {note.checklist.map((c) => (
                  <li key={c.id} className="flex items-start gap-2 text-sm">
                    <Checkbox
                      checked={c.done}
                      onCheckedChange={() => onToggleItem(c.id)}
                      className="mt-0.5"
                    />
                    <span
                      className={cn(
                        "flex-1 break-words",
                        c.done && "line-through text-muted-foreground",
                      )}
                    >
                      {c.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------ Note Editor ------------------------------- */

function NoteEditor({
  initial,
  onSave,
  onCancel,
  autoFocus,
}: {
  initial?: Note;
  onSave: (data: Omit<Note, "id" | "updatedAt">) => void;
  onCancel: () => void;
  autoFocus?: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initial?.checklist ?? []);
  const [newItem, setNewItem] = useState("");
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initial?.contentHtml ?? "";
    }
    if (autoFocus) {
      setTimeout(() => editorRef.current?.focus(), 30);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exec = (cmd: "bold" | "italic" | "underline") => {
    editorRef.current?.focus();
    document.execCommand(cmd, false);

    forceUpdate((x) => x + 1);
  };

  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const handler = () => forceUpdate((x) => x + 1);
    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
  }, []);

  const isActive = (cmd: string) => {
    if (typeof document === "undefined") return false;
    return document.queryCommandState(cmd);
  };

  const addChecklistItem = () => {
    const v = newItem.trim();
    if (!v) return;
    setChecklist((prev) => [...prev, { id: uid(), text: v, done: false }]);
    setNewItem("");
  };

  const removeChecklistItem = (id: string) =>
    setChecklist((prev) => prev.filter((c) => c.id !== id));

  const handleSave = () => {
    const html = editorRef.current?.innerHTML.trim() ?? "";
    if (!title.trim() && !html && checklist.length === 0) {
      onCancel();
      return;
    }
    onSave({
      title: title.trim(),
      contentHtml: html,
      checklist,
    });
  };

  return (
    <Card className="p-3 border-2 border-primary/40 shadow-sm space-y-2">
      <Input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-8 font-semibold"
      />

      {/* Toolbar */}
      <div className="flex items-center gap-1 border rounded-md px-1 py-0.5 bg-muted/40">
        <ToolbarBtn 
          label="Bold" 
          active={isActive("bold")} 
          onClick={() => exec("bold")}
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <ToolbarBtn 
          label="Italic" 
          active={isActive("italic")}
          onClick={() => exec("italic")}
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <ToolbarBtn 
          label="Underline" 
          active={isActive("underline")}
          onClick={() => exec("underline")}
        >
          <Underline className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <Separator orientation="vertical" className="h-4 mx-1" />
        
        <ToolbarBtn
          label="Add checklist item"
          onClick={() => {
            const input = document.getElementById("note-new-checklist-item");
            (input as HTMLInputElement)?.focus();
          }}
        >
          <ListChecks className="h-3.5 w-3.5" />
        </ToolbarBtn>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring [&_b]:font-semibold [&_strong]:font-semibold [&_i]:italic [&_em]:italic [&_u]:underline empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground"
        data-placeholder="Write your note..."
      />

      {/* Checklist editor */}
      {checklist.length > 0 && (
        <ul className="space-y-1">
          {checklist.map((c) => (
            <li key={c.id} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={c.done}
                onCheckedChange={() =>
                  setChecklist((prev) =>
                    prev.map((x) => (x.id === c.id ? { ...x, done: !x.done } : x)),
                  )
                }
              />
              <span className={cn("flex-1", c.done && "line-through text-muted-foreground")}>
                {c.text}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => removeChecklistItem(c.id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <Input
          id="note-new-checklist-item"
          placeholder="Add a checklist item..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addChecklistItem();
            }
          }}
          className="h-8 text-sm"
        />
        <Button size="sm" variant="outline" className="h-8" onClick={addChecklistItem}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave} className="gap-1">
          <Check className="h-3.5 w-3.5" />
          Save
        </Button>
      </div>
    </Card>
  );
}

function ToolbarBtn({
  children,
  onClick,
  label,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
      "h-6 w-6 inline-flex items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        active && "bg-accent text-accent-foreground"
      )}
    >
      {children}
    </button>
  );
}

