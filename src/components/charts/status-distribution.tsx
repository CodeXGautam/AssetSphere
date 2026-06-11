"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";

interface Props {
  data: { status: string; count: number; color: string }[];
}

export function StatusDistributionChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <p className="text-xs text-[--muted-fg]">No booking status data yet.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={22}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="status" tick={{ fontSize: 9, fill: "var(--muted-fg)" }} axisLine={false} tickLine={false} />
        <YAxis  tick={{ fontSize: 11, fill: "var(--muted-fg)" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--fg)" }}
          cursor={{ fill: "rgba(99,102,241,0.06)" }}
        />
        <Bar dataKey="count" radius={[5, 5, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} fillOpacity={0.9} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
