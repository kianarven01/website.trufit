import { useState } from "react";
import { Search, SlidersHorizontal, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scrollArea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

export interface ColumnDef<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface MasterDetailPanelProps<T> {
  title: string;
  description: string;
  items: T[];
  selectedItem: T | null;
  onSelect: (item: T | null) => void;
  onClose?: () => void;
  getItemId: (item: T) => string;
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  filters?: FilterOption[];
  onSearch?: (query: string) => void;
  onFilterChange?: (key: string, value: string) => void;
  activeFilters?: Record<string, string>;
  onAdd?: () => void;
  addLabel?: string;
  children: React.ReactNode;
  getItemLabel?: (item: T) => string;
  getItemSublabel?: (item: T) => string;
}

export function MasterDetailPanel<T>({
  title,
  description,
  items,
  selectedItem,
  onSelect,
  getItemId,
  columns,
  searchPlaceholder = "Search...",
  filters = [],
  onSearch,
  onFilterChange,
  activeFilters = {},
  onAdd,
  addLabel = "Add New",
  children,
}: MasterDetailPanelProps<T>) {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (value: string) => {
    setSearch(value);
    onSearch?.(value);
  };

  const activeCount = Object.values(activeFilters).filter((v) => v && v !== "all").length;
  const isOpen = !!selectedItem;
  const visibleColumns = isOpen ? columns.slice(0, 1) : columns;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Master list panel */}
      <div
        className={cn(
          "flex h-full flex-col border-r border-border transition-all duration-300 overflow-hidden",
          isOpen ? "w-64 min-w-[16rem] max-w-[16rem]" : "w-full"
        )}
      >
        {/* Header toolbar */}
        <div className="shrink-0 border-b border-border px-3 py-2 flex align-center justify-between">
          {/* Title row — always visible */}
          {!isOpen && (
            <div className="flex flex-col space-y-1 mb-1">
              <h1 className="text-lg font-bold text-foreground">{title}</h1>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
          )}

          {/* Search + actions */}
          <div className={cn("flex items-center gap-1.5", isOpen && "flex-col")}>
            <div className={cn("relative", isOpen ? "w-full" : "flex-1 sm:w-64 sm:flex-initial")}>
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={isOpen ? "Search..." : searchPlaceholder}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-8 pl-8 text-sm"
              />
            </div>
            <div className={cn("flex items-center gap-1.5", isOpen && "w-full")}>
              {filters.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn("h-8 gap-1.5", isOpen && "flex-1")}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  {!isOpen && <span className="hidden sm:inline">Filters</span>}
                  {activeCount > 0 && (
                    <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                      {activeCount}
                    </Badge>
                  )}
                </Button>
              )}
              {onAdd && (
                <Button size="sm" onClick={onAdd} className={cn("h-8 gap-1.5", isOpen && "flex-1")}>
                  <Plus className="h-3.5 w-3.5" />
                  {!isOpen && <span className="hidden sm:inline">{addLabel}</span>}
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Active filters — horizontal scroll */}
          {showFilters && filters.length > 0 && (
            <div className=" border-b border-border pt-2 bg-slate-100">
              <ScrollArea className="w-full">
                <div className="flex items-center gap-2 pb-2 px-3">
                  {filters.map((f) => (
                    <Select
                      key={f.key}
                      value={activeFilters[f.key] || "all"}
                      onValueChange={(val) => onFilterChange?.(f.key, val)}
                    >
                      <SelectTrigger className="h-7 w-auto min-w-[100px] shrink-0 text-xs">
                        <SelectValue placeholder={f.label} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All {f.label}</SelectItem>
                        {f.options.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ))}
                  {activeCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 shrink-0 gap-1 text-xs text-muted-foreground"
                      onClick={() => filters.forEach((f) => onFilterChange?.(f.key, "all"))}
                    >
                      <X className="h-3 w-3" /> Clear
                    </Button>
                  )}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}

        {/* Table */}
        <ScrollArea className="flex-1">
          <div className={cn(isOpen ? "p-2" : "p-4 sm:px-4")}>
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.map((col) => (
                  <TableHead
                    key={col.key}
                    className={cn(isOpen && "px-2 py-2", col.className)}
                  >
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={visibleColumns.length}>
                      No items found.
                    </TableCell>
                  </TableRow>
                )}
                {items.map((item) => {
                  const id = getItemId(item);
                  const isSelected = selectedItem && getItemId(selectedItem) === id;
                  return (
                    <TableRow
                      key={id}
                      className={cn(
                        "cursor-pointer transition-colors",
                        isSelected ? "bg-primary/10" : "hover:bg-muted/50"
                      )}
                      onClick={() => onSelect(item)}
                    >
                      {visibleColumns.map((col) => (
                        <TableCell key={col.key} className={cn("text-sm", isOpen && "py-2 px-2 truncate", col.className)}>
                          {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? "")}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>

      {/* Detail panel */}
      {isOpen && (
        <div className="flex-1 flex flex-col h-full min-w-0 animate-fade-in">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">Details</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onSelect(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 sm:p-6">{children}</div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
