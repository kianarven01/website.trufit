import { useState } from "react";
import { Search, SlidersHorizontal, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scrollArea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface PageShellProps<T> {
  title: string;
  description?: string;

  items: T[];
  columns: ColumnDef<T>[];
  getItemId: (item: T) => string;

  searchPlaceholder?: string;
  filters?: FilterOption[];
  onSearch?: (query: string) => void;
  onFilterChange?: (key: string, value: string) => void;
  activeFilters?: Record<string, string>;

  onAdd?: () => void;
  addLabel?: string;

  loading?: boolean;
}

export function PageShell<T>({
  title,
  description,
  items,
  columns,
  getItemId,
  searchPlaceholder = "Search...",
  filters = [],
  onSearch,
  onFilterChange,
  activeFilters = {},
  onAdd,
  addLabel = "Add New",
  loading,
}: PageShellProps<T>) {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (value: string) => {
    setSearch(value);
    onSearch?.(value);
  };

  const activeCount = Object.values(activeFilters).filter(
    (v) => v && v !== "all"
  ).length;

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex h-full flex-col w-full overflow-hidden">
        {/* Header toolbar */}
        <div className="shrink-0 border-b border-border px-3 py-2 flex items-center justify-between">
          <div className="flex flex-col space-y-1 mb-1">
            <h1 className="text-lg font-bold text-foreground">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <div className="relative flex-1 sm:w-64 sm:flex-initial">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-8 pl-8 text-sm"
              />
            </div>

            {filters.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-8 gap-1.5"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  Filters
                </span>
                {activeCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="h-4 px-1 text-[10px]"
                  >
                    {activeCount}
                  </Badge>
                )}
              </Button>
            )}

            {onAdd && (
              <Button
                size="sm"
                onClick={onAdd}
                className="h-8 gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {addLabel}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Filters row */}
        {showFilters && filters.length > 0 && (
          <div className="border-b border-border pt-2 bg-slate-100">
            <ScrollArea className="w-full">
              <div className="flex items-center gap-2 pb-2 px-3">
                {filters.map((f) => (
                  <Select
                    key={f.key}
                    value={activeFilters[f.key] || "all"}
                    onValueChange={(val) =>
                      onFilterChange?.(f.key, val)
                    }
                  >
                    <SelectTrigger className="h-7 w-auto min-w-[100px] shrink-0 text-xs">
                      <SelectValue placeholder={f.label} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        All {f.label}
                      </SelectItem>
                      {f.options.map((o) => (
                        <SelectItem
                          key={o.value}
                          value={o.value}
                        >
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
                    onClick={() =>
                      filters.forEach((f) =>
                        onFilterChange?.(f.key, "all")
                      )
                    }
                  >
                    <X className="h-3 w-3" /> Clear
                  </Button>
                )}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}

        {/* Table Card */}
        <ScrollArea className="flex-1">
          <div className="p-4 sm:px-4">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead
                      key={col.key}
                      className={cn(col.className)}
                    >
                      {col.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-6 text-muted-foreground"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No items found.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow
                      key={getItemId(item)}
                      className="transition-colors hover:bg-muted/50"
                    >
                      {columns.map((col) => (
                        <TableCell
                          key={col.key}
                          className={cn("text-sm", col.className)}
                        >
                          {col.render
                            ? col.render(item)
                            : String(
                                (item as Record<
                                  string,
                                  unknown
                                >)[col.key] ?? ""
                              )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}