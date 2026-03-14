import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scrollArea";


export interface FilterOption {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

interface DataToolbarProps {
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;

  filters?: FilterOption[];
  onFilterChange?: (key: string, value: string) => void;
  activeFilters?: Record<string, string>;

  onAdd?: () => void;
  addLabel?: string;
}

const DataToolbar: React.FC<DataToolbarProps> = ({
  searchPlaceholder = "Search...",
  onSearch,
  filters = [],
  onFilterChange,
  activeFilters = {},
  onAdd,
  addLabel = "Add",
}) => {
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
    <div className="bg-slate-200 rounded-lg px-3 py-2 space-y-2">

      {/* TOP ROW */}
      <div className="flex items-center justify-between gap-3">

        {/* SEARCH */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            placeholder={searchPlaceholder}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2">

          {filters.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters

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
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {addLabel}
            </Button>
          )}

        </div>
      </div>

      {/* FILTER ROW */}
      {showFilters && filters.length > 0 && (
        <div>
          <hr className="my-1"/>

          <ScrollArea className="w-full">
            <div className="flex items-center gap-2">

              {filters.map((f) => (
                <Select
                  key={f.key}
                  value={activeFilters[f.key] || "all"}
                  onValueChange={(val) =>
                    onFilterChange?.(f.key, val)
                  }
                >
                  <SelectTrigger className="h-8 w-auto min-w-[120px] text-xs">
                    <SelectValue placeholder={f.label} />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">
                      All {f.label}
                    </SelectItem>

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
                  className="h-8 gap-1 text-xs text-muted-foreground"
                  onClick={() =>
                    filters.forEach((f) =>
                      onFilterChange?.(f.key, "all")
                    )
                  }
                >
                  <X className="h-3 w-3" />
                  Clear
                </Button>
              )}

            </div>

            <ScrollBar orientation="horizontal" />
          </ScrollArea>

        </div>
      )}
    </div>
  );
};

export default DataToolbar;