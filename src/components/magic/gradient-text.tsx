import { cn } from "@/lib/utils";

export function GradientText({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "bg-gradient-to-r from-cyan-200 via-sky-400 to-indigo-400 bg-clip-text text-transparent",
        className
      )}
      {...props}
    />
  );
}
