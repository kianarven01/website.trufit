import { useState } from "react";
import { Search, SlidersHorizontal, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface PageShellProps {
  title: string;
  description?: string;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  onSearch?: (query: string) => void;
  onFilterChange?: (key: string, value: string) => void;
  onAdd?: () => void;
  addLabel?: string;
  activeFilters?: Record<string, string>;
  children: React.ReactNode;
}

export function PageShell({
  title,
  description,
  searchPlaceholder = "Search...",
  filters = [],
  onSearch,
  onFilterChange,
  onAdd,
  addLabel = "Add New",
  activeFilters = {},
  children,
}: PageShellProps) {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (value: string) => {
    setSearch(value);
    onSearch?.(value);
  };

  const activeCount = Object.values(activeFilters).filter((v) => v && v !== "all").length;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-border px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">{title}</h1>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          <div className="flex items-center gap-2">
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
                <span className="hidden sm:inline">Filters</span>
                {activeCount > 0 && (
                  <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                    {activeCount}
                  </Badge>
                )}
              </Button>
            )}
            {onAdd && (
              <Button size="sm" onClick={onAdd} className="h-8 gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{addLabel}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filter bar */}
        {showFilters && filters.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
            {filters.map((f) => (
              <Select
                key={f.key}
                value={activeFilters[f.key] || "all"}
                onValueChange={(val) => onFilterChange?.(f.key, val)}
              >
                <SelectTrigger className="h-7 w-auto min-w-[120px] text-xs">
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
                className="h-7 gap-1 text-xs text-muted-foreground"
                onClick={() => filters.forEach((f) => onFilterChange?.(f.key, "all"))}
              >
                <X className="h-3 w-3" /> Clear
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">{children}</div>
    </div>
  );
}
