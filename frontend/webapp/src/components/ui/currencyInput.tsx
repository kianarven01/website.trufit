import React, { useState, useEffect, useRef } from "react";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const formatCurrency = (num: number) => {
  return num.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/* remove commas */
const unformat = (val: string) => val.replace(/,/g, "");

/* keep only valid numeric input */
const sanitize = (val: string) => {
  val = val.replace(/[^\d.]/g, "");

  const parts = val.split(".");
  if (parts.length > 2) return parts[0] + "." + parts[1];

  if (parts[1]?.length > 2) {
    return parts[0] + "." + parts[1].slice(0, 2);
  }

  return val;
};

/* map cursor position after formatting */
const getNewCursorPos = (raw: string, formatted: string, cursor: number) => {
  let rawIndex = 0;
  let formattedIndex = 0;

  while (rawIndex < cursor && formattedIndex < formatted.length) {
    if (formatted[formattedIndex] === ",") {
      formattedIndex++;
      continue;
    }
    rawIndex++;
    formattedIndex++;
  }

  return formattedIndex;
};

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  className,
}) => {
  const [display, setDisplay] = useState("0.00");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  /* sync external value */
  useEffect(() => {
    if (!isFocused) {
      setDisplay(formatCurrency(value || 0));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const rawValue = unformat(input.value);
    const cursor = input.selectionStart || 0;

    const clean = sanitize(rawValue);

    if (clean === "") {
      setDisplay("");
      onChange(0);
      return;
    }

    const num = parseFloat(clean);
    if (!isNaN(num)) {
      onChange(num);
    }

    const formatted = clean.includes(".")
      ? clean // keep decimal while typing
      : formatCurrency(num).replace(/\.00$/, ""); // no forced .00 mid typing

    setDisplay(formatted);

    // restore cursor position
    requestAnimationFrame(() => {
      if (!inputRef.current) return;

      const newPos = getNewCursorPos(clean, formatted, cursor);
      inputRef.current.setSelectionRange(newPos, newPos);
    });
  };

  const handleFocus = () => {
    setIsFocused(true);

    if (value === 0) {
      setDisplay("");
    } else {
      setDisplay(unformat(display));
    }
  };

  const handleBlur = () => {
    setIsFocused(false);

    const num = parseFloat(unformat(display));

    if (isNaN(num)) {
      onChange(0);
      setDisplay("0.00");
    } else {
      setDisplay(formatCurrency(num));
    }
  };

  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
        ₱
      </span>

      <input
        ref={inputRef}
        value={display}
        placeholder="0.00"
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        inputMode="decimal"
        className="pl-6 pr-2 text-right w-full border rounded-md h-8 text-sm"
      />
    </div>
  );
};

export default CurrencyInput;