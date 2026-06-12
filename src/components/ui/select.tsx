"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps {
  error?: string;
  label?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/**
 * Custom select built from divs so it fully respects CSS custom properties
 * in both light and dark mode. Native <option> elements ignore CSS variables.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, label, placeholder, options, value, onChange, disabled, id, className }, ref) => {
    const sid = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const [open, setOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const selectedOption = options.find((o) => o.value === value);
    const displayLabel = selectedOption?.label ?? placeholder ?? "Select…";
    const isPlaceholder = !selectedOption;

    // Close on outside click
    React.useEffect(() => {
      function handleClick(e: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Close on Escape
    React.useEffect(() => {
      function handleKey(e: KeyboardEvent) {
        if (e.key === "Escape") setOpen(false);
      }
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }, []);

    function select(val: string) {
      if (disabled) return;
      // Synthesise a change event so the parent's onChange handler works unchanged
      const nativeSelect = ref as React.RefObject<HTMLSelectElement>;
      if (nativeSelect?.current) {
        // Trigger native change
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLSelectElement.prototype, "value"
        )?.set;
        nativeInputValueSetter?.call(nativeSelect.current, val);
        nativeSelect.current.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        // Fallback: create a synthetic event
        onChange?.({ target: { value: val } } as React.ChangeEvent<HTMLSelectElement>);
      }
      setOpen(false);
    }

    return (
      <div className={cn("flex w-full flex-col gap-1", className)}>
        {label && (
          <label htmlFor={sid} className="text-xs font-medium text-[--muted-fg]">
            {label}
          </label>
        )}

        <div ref={containerRef} className="relative">
          {/* Hidden native select for form compatibility */}
          <select
            id={sid}
            ref={ref}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Visible trigger button */}
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            disabled={disabled}
            onClick={() => !disabled && setOpen((v) => !v)}
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-lg border bg-[--input] px-3 text-sm transition-colors",
              "focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--ring]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              isPlaceholder ? "text-[--muted-fg]" : "text-foreground",
              error ? "border-red-500/50" : open ? "border-[--primary]" : "border-[--border]"
            )}
          >
            <span className="truncate">{displayLabel}</span>
            <ChevronDown
              size={13}
              className={cn(
                "ml-2 shrink-0 text-[--muted-fg] transition-transform duration-150",
                open && "rotate-180"
              )}
            />
          </button>

          {/* Dropdown */}
          {open && (
            <div
              role="listbox"
              className={cn(
                "absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-lg border border-[--border]",
                "bg-[--card] shadow-[0_8px_32px_rgba(0,0,0,0.18)]",
                "max-h-60 overflow-y-auto"
              )}
            >
              {placeholder && (
                <div
                  role="option"
                  aria-selected={!value}
                  onClick={() => select("")}
                  className={cn(
                    "flex cursor-pointer items-center justify-between px-3 py-2.5 text-sm transition-colors",
                    "text-[--muted-fg] hover:bg-[--muted]",
                    !value && "bg-[--muted]"
                  )}
                >
                  {placeholder}
                </div>
              )}
              {options.map((o) => {
                const isSelected = o.value === value;
                return (
                  <div
                    key={o.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => select(o.value)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between px-3 py-2.5 text-sm transition-colors",
                      isSelected
                        ? "bg-[--primary]/10 text-[--primary]"
                        : "text-foreground hover:bg-[--muted]"
                    )}
                  >
                    <span>{o.label}</span>
                    {isSelected && <Check size={13} className="shrink-0" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
