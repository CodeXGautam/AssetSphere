import { cn } from "@/lib/utils";
import type { AssetCondition } from "@/types";

const MAP: Record<AssetCondition, { label: string; cls: string }> = {
  EXCELLENT:    { label: "Excellent",    cls: "bg-green-500/15 text-green-400 border-green-500/30" },
  GOOD:         { label: "Good",         cls: "bg-blue-500/15  text-blue-400  border-blue-500/30"  },
  FAIR:         { label: "Fair",         cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  NEEDS_REPAIR: { label: "Needs Repair", cls: "bg-red-500/15   text-red-400   border-red-500/30"   },
};

export function ConditionBadge({ condition }: { condition: AssetCondition }) {
  const { label, cls } = MAP[condition] ?? MAP.GOOD;
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", cls)}>
      {label}
    </span>
  );
}
