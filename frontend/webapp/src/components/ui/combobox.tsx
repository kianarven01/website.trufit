import { FC, useRef, useState } from "react";
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
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Check, ChevronDown, X } from "lucide-react";

import { cn } from "@/lib/utils";

interface MakeComboboxProps {
  value: string;
  onChange: (val: string) => void;
  items: string[];
  placeholder?: string;
  allowAdd?: boolean;
  addLabel?: string;       
  onAdd?: () => void;      
}

const Combobox: FC<MakeComboboxProps> = ({
  value,
  onChange,
  items,
  placeholder,
  allowAdd,
  addLabel,
  onAdd,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  const handleClear = () => {
    setSearch("");
    onChange("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Input
            ref={inputRef}
            placeholder={placeholder || "Type or select..."}
            value={search}
            onChange={(e) => {
              const val = e.target.value;
              setSearch(val);
              onChange(val);
              if (val.length > 0) setOpen(true);
              else setOpen(false);
            }}
            className="w-full pr-10"
          />

          {value ? (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <ChevronDown
              onClick={() => setOpen((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 cursor-pointer"
            />
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        side="bottom"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandList
            className="max-h-[260px] overflow-y-auto overscroll-contain scroll-smooth"
            onWheel={(e) => e.stopPropagation()}
          >
            {filteredItems.length > 0 ? (
              <CommandGroup>
                {filteredItems.map((item) => {
                  const isSelected =
                    value.toLowerCase() === item.toLowerCase();

                  return (
                    <CommandItem
                      key={item}
                      value={item}
                      data-selected={isSelected} 
                      onSelect={() => {
                        onChange(item);
                        setSearch(item);
                        setOpen(false);
                      }}
                      className={cn(
                        "relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none justify-between",
                        "data-[disabled=true]:pointer-events-none",
                        "hover:bg-blue-50 hover:text-blue-600 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-600"
                      )}
                    >
                      <span>{item}</span>
                      {isSelected && <Check className="h-4 w-4 text-blue-700" />} 
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ) : (
              <CommandItem disabled>No results found</CommandItem>
            )}

            {/* Updated Add button */}
            {allowAdd && onAdd && (
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  onAdd();
                }}
                className={cn(
                  "relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none justify-between",
                  "data-[disabled=true]:pointer-events-none",
                  "hover:bg-blue-50 hover:text-blue-600",
                  "data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-600"
                )}
              >
                <span className="flex-1 text-blue-600">
                  {search
                    ? `+ Add "${search}" ${addLabel || ""}`
                    : `+ Add new ${addLabel || ""}`}
                </span>

              </CommandItem>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default Combobox;