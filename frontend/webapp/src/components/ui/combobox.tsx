import { FC, useState, useEffect, useMemo } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Check, ChevronDown, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ComboboxItem = {
  label: string;
  value: string;
  group?: string;
  description?: string;
};

interface MakeComboboxProps {
  value: string;
  onChange: (val: string) => void;
  items: (string | ComboboxItem)[];
  placeholder?: string;
  allowAdd?: boolean;
  addLabel?: string;
  onAdd?: (currentSearch: string) => void;
  showGroupSeparator?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

const Combobox: FC<MakeComboboxProps> = ({
  value,
  onChange,
  items,
  placeholder,
  allowAdd,
  addLabel,
  onAdd,
  showGroupSeparator = false,
  isLoading,
  disabled,
  className,
}) => {
  const [open, setOpen] = useState(false);

  // Normalize items to objects with label & value
  const normalizedItems = useMemo(() => {
    return items.map((item) =>
      typeof item === "string" ? { label: item, value: item } : item
    );
  }, [items]);

  // Initial label based on current value
  const initialLabel = normalizedItems.find((i) => i.value === value)?.label || value;
  const [search, setSearch] = useState(initialLabel);

  useEffect(() => {
    const label = normalizedItems.find((i) => i.value === value)?.label || value;
    setSearch(label);
  }, [value, normalizedItems]);

  // Filter items based on search input
  const filteredItems = normalizedItems.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  const exactMatchExists = normalizedItems.some(
    (item) => item.label.toLowerCase() === search.trim().toLowerCase()
  );

  const resolveValue = (input: string) => {
    if (input.endsWith(" ")) return input;
    const match = normalizedItems.find(
      i => i.value.trim().toLowerCase() === input.trim().toLowerCase()
    );
    return match ? match.value : input;
  };  

  const handleClear = () => {
    setSearch("");
    onChange("");
    setOpen(false);
  };

  const handleAddClick = () => {
    if (onAdd) onAdd(search); 
    setOpen(false);
  };

  return (
    <Popover open={open && !disabled} onOpenChange={(val) => !disabled && setOpen(val)}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Input
            placeholder={placeholder || "Type or select..."}
            value={search}
            onChange={(e) => {
              if (disabled) return;
              const val = e.target.value;
              setSearch(val);
              onChange(resolveValue(val));
              setOpen(true);
            }}
            disabled={disabled || isLoading}
            className={cn("w-full pr-10 disabled:opacity-50 disabled:cursor-not-allowed", className)}
          />

          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground opacity-50" />
            ) : search ? (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <ChevronDown
                className="h-4 w-4 opacity-50 cursor-pointer"
                onClick={() => setOpen(true)}
              />
            )}
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 shadow-md border-border"
        side="bottom"
        align="start"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command className="border-none">
          <CommandList className="max-h-[260px] p-1.5 overflow-y-auto">
          {(() => {
            const groupedItems = Object.entries(
              filteredItems.reduce((acc, item) => {
                const group = item.group || " ";

                if (!acc[group]) {
                  acc[group] = [];
                }

                acc[group].push(item);

                return acc;
              }, {} as Record<string, typeof filteredItems>)
            );

            return groupedItems.map(([group, items], index) => (
              <div key={group}>
                <CommandGroup heading={group}>
                  {items.map((item) => {
                    const isSelected =
                      value?.trim().toLowerCase() ===
                      item.value?.trim().toLowerCase();

                    return (
                      <CommandItem
                        key={item.value}
                        value={item.label}
                        onSelect={() => {
                          onChange(item.value);
                          setSearch(item.label);
                          setOpen(false);
                        }}
                        className={cn(
                          "flex cursor-pointer items-start justify-between px-2 py-2",
                          isSelected
                            ? "bg-accent text-accent-foreground"
                            : ""
                        )}
                      >
                        <div className="flex flex-col">
                          <span>{item.label}</span>

                          {item.description && (
                            <span className="text-xs text-muted-foreground">
                              {item.description}
                            </span>
                          )}
                        </div>

                        {isSelected && (
                          <Check className="h-4 w-4 shrink-0" />
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>

                {showGroupSeparator &&
                  index < groupedItems.length - 1 && (
                    <CommandSeparator className="mt-1.5" />
                  )}
              </div>
            ));
          })()}
            {allowAdd && (
              <div
                onClick={handleAddClick}
                className="flex cursor-pointer items-center gap-2 border-t px-2 py-2 text-sm text-primary font-medium hover:bg-accent mt-1"
              >
                + Add {addLabel || "new item"}
              </div>
            )}

            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : filteredItems.length === 0 && !allowAdd && (
              <div className="p-2 text-center text-sm text-muted-foreground">
                No results found.
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default Combobox;