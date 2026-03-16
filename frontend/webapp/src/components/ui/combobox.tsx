import { FC, useRef, useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MakeComboboxProps {
  value: string;
  onChange: (val: string) => void;
  makes: string[];
  placeholder?: string;
}

const Combobox: FC<MakeComboboxProps> = ({ value, onChange, makes, placeholder }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredMakes = makes.filter((make) =>
    make.toLowerCase().includes(search.toLowerCase())
  );

  // Auto-close popover if no matches
  useEffect(() => {
    if (filteredMakes.length === 0 && open) {
      setOpen(false);
    }
  }, [filteredMakes, open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            ref={inputRef}
            placeholder={placeholder || "Type or select make..."}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              onChange(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            className="w-full pr-8"
          />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        side="bottom"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandList>
            {filteredMakes.length > 0 && (
              <CommandGroup>
                {filteredMakes.map((make) => (
                  <CommandItem
                    key={make}
                    value={make}
                    onSelect={() => {
                      onChange(make);
                      setSearch(make);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.toLowerCase() === make.toLowerCase() ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {make}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default Combobox;