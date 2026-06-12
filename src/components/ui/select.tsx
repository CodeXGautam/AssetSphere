import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, placeholder, options, id, ...props }, ref) => {
    const sid = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex w-full flex-col gap-1">
        {label && (
          <label htmlFor={sid} className="text-xs font-medium text-[--muted-fg]">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={sid}
            ref={ref}
            className={cn(
              "h-9 w-full appearance-none rounded-lg border border-[--border] bg-[--input] pl-3 pr-8 text-sm text-foreground",
              "focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--ring]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-red-500/50",
              className
            )}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value} className="bg-[--card] text-foreground">
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[--muted-fg]" />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
