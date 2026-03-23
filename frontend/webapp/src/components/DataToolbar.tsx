import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import {
  ScrollArea,
  ScrollBar,
} from "@/components/ui/scrollArea";

/* ================= TYPES ================= */

export interface FilterOption {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

type ToolbarVariant = "default" | "detail";

interface DataToolbarProps {
  variant?: ToolbarVariant;

  /* DEFAULT (LIST) MODE */
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;

  filters?: FilterOption[];
  onFilterChange?: (key: string, value: string) => void;
  activeFilters?: Record<string, string>;

  onAdd?: () => void;
  addLabel?: string;

  /* DETAIL MODE */
  title?: React.ReactNode;
  actions?: React.ReactNode;
}

/* ================= COMPONENT ================= */

const DataToolbar: React.FC<DataToolbarProps> = ({
  variant = "default",

  searchPlaceholder = "Search...",
  onSearch,

  filters = [],
  onFilterChange,
  activeFilters = {},

  onAdd,
  addLabel = "Add",

  title,
  actions,
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
    <div className="space-y-2 mb-4">

      {/* ================= TOP ROW ================= */}
      {variant === "default" ? (
        <div className="flex items-center justify-between gap-3">

          {/* LEFT SIDE: SEARCH + FILTER */}
          <div className="flex items-center gap-2 w-full max-w-sm">

            {/* SEARCH */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                placeholder={searchPlaceholder}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>

            {/* FILTER ICON */}
            {filters.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="relative h-9 w-9"
              >
                <SlidersHorizontal className="h-4 w-4" />

                {/* ACTIVE COUNT BADGE */}
                {activeCount > 0 && (
                  <span className="absolute -top-1 -right-1">
                    <Badge className="h-4 min-w-[16px] px-1 text-[10px] flex items-center justify-center">
                      {activeCount}
                    </Badge>
                  </span>
                )}
              </Button>
            )}

          </div>

          {/* RIGHT SIDE: ADD BUTTON */}
          <div className="flex items-center gap-2">
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
      ) : (
        <div className="flex items-center justify-between">

          {/* TITLE / LEFT */}
          <div className="text-lg font-semibold">
            {title}
          </div>

          {/* ACTIONS / RIGHT */}
          <div className="flex items-center gap-2">
            {actions}
          </div>
        </div>
      )}

      {/* ================= FILTER ROW ================= */}
      {variant === "default" && showFilters && filters.length > 0 && (
        <div>
          <hr className="my-1" />

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