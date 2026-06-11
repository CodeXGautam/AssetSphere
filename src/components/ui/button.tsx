import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium",
    "transition-colors duration-150 select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring]",
    "disabled:pointer-events-none disabled:opacity-40",
  ].join(" "),
  {
    variants: {
      variant: {
        default:     "bg-[--primary] text-white hover:bg-[--primary-hover]",
        secondary:   "bg-[--muted] text-foreground hover:bg-[#26262e] border border-[--border]",
        outline:     "border border-[--border] bg-transparent text-foreground hover:bg-[--muted]",
        ghost:       "text-[--muted-fg] hover:bg-[--muted] hover:text-foreground",
        destructive: "bg-red-600/90 text-white hover:bg-red-600",
        link:        "text-[--primary] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        xs:      "h-6 px-2 text-xs rounded-md",
        sm:      "h-8 px-3 text-xs",
        md:      "h-9 px-4",
        lg:      "h-10 px-5 text-base",
        icon:    "h-8 w-8 p-0",
        "icon-sm": "h-7 w-7 p-0 rounded-md text-xs",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {loading && (
        <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
);
Button.displayName = "Button";
export { buttonVariants };
