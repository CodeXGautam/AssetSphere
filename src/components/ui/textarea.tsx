import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, id, ...props }, ref) => {
    const tid = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex w-full flex-col gap-1">
        {label && (
          <label htmlFor={tid} className="text-xs font-medium text-[--muted-fg]">
            {label}
          </label>
        )}
        <textarea
          id={tid}
          ref={ref}
          className={cn(
            "min-h-[80px] w-full resize-none rounded-lg border border-[--border] bg-[--input] px-3 py-2 text-sm text-foreground",
            "placeholder:text-[--muted-fg] transition-colors",
            "focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--ring]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500/50",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
