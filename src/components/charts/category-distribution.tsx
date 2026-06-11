"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface Props {
  data: { name: string; value: number }[];
}

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

export function CategoryDistributionChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex h-[220px] items-center justify-center">
        <p className="text-xs text-[--muted-fg]">No category data yet.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={50}
          outerRadius={78}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--fg)" }}
          formatter={(v: number) => [`${v} assets`, ""]}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "var(--muted-fg)", paddingTop: 8 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
