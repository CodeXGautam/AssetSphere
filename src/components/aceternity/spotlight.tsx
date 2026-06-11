import { cn } from "@/lib/utils";

export function Spotlight({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="absolute -top-32 left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[120px]" />
      <div className="absolute bottom-[-140px] left-[10%] h-[280px] w-[280px] rounded-full bg-indigo-500/25 blur-[120px]" />
      <div className="absolute right-[15%] top-[25%] h-[240px] w-[240px] rounded-full bg-sky-400/20 blur-[120px]" />
    </div>
  );
}
