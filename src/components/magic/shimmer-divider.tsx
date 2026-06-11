import { cn } from "@/lib/utils";

export function ShimmerDivider({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "h-px w-full bg-gradient-to-r from-transparent via-white/40 to-transparent",
        className
      )}
      {...props}
    />
  );
}
