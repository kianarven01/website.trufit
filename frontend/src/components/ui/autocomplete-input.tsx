import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface AutocompleteOption {
  label: string;
  value: string;
  meta?: Record<string, any>;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect: (option: AutocompleteOption) => void;
  options: AutocompleteOption[];
  placeholder?: string;
  className?: string;
}

export function AutocompleteInput({ value, onChange, onSelect, options, placeholder, className }: Props) {
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState<AutocompleteOption[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value.trim()) { setFiltered([]); return; }
    const q = value.toLowerCase();
    setFiltered(options.filter(o => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)).slice(0, 8));
  }, [value, options]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        className={cn("h-8 text-sm", className)}
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md max-h-48 overflow-y-auto">
          {filtered.map(o => (
            <button
              key={o.value}
              type="button"
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              onMouseDown={e => { e.preventDefault(); onSelect(o); setOpen(false); }}
            >
              <span className="font-medium">{o.label}</span>
              {o.meta?.sub && <span className="ml-2 text-xs text-muted-foreground">{o.meta.sub}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
