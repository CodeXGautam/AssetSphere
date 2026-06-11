import { cn } from "@/lib/utils";

export function GlowCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-white/5 to-white/0 p-6 shadow-[0_0_40px_rgba(34,211,238,0.15)]",
        className
      )}
      {...props}
    />
  );
}
