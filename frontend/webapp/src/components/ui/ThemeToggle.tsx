import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      // Default to dark if no preference saved
      return saved ? saved === "dark" : true;
    }
    return true;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      type="button"
      onClick={() => setDark(!dark)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        dark ? "bg-primary" : "bg-muted-foreground/30"
      }`}
      role="switch"
      aria-checked={dark}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
          dark ? "translate-x-6" : "translate-x-1"
        }`}
      />
      <span className="sr-only">{dark ? "Switch to light mode" : "Switch to dark mode"}</span>
    </button>
  );
}
