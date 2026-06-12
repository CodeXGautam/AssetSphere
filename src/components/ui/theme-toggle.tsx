"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { type Theme, getTheme, setTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  /** Extra classes on the button wrapper */
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [theme, setThemeState] = useState<Theme>("dark");

  // Read stored theme after mount (avoids SSR mismatch)
  useEffect(() => {
    setThemeState(getTheme());

    // Stay in sync if another tab changes the theme
    const observer = new MutationObserver(() => {
      const t = document.documentElement.getAttribute("data-theme") as Theme | null;
      if (t) setThemeState(t);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeState(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "rounded-lg p-1.5 text-[--muted-fg] transition-colors",
        "hover:bg-[--surface] hover:text-[--fg]",
        className
      )}
    >
      {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
