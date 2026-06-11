"use client";

import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

interface Props {
  data: { month: string; bookings: number }[];
}

export function AssetUtilizationChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex h-[220px] items-center justify-center">
        <p className="text-xs text-[--muted-fg]">No booking data yet.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="bookingsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-fg)" }} axisLine={false} tickLine={false} />
        <YAxis  tick={{ fontSize: 11, fill: "var(--muted-fg)" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--fg)" }}
          cursor={{ stroke: "var(--border)" }}
          labelStyle={{ color: "var(--muted-fg)" }}
        />
        <Area
          type="monotone"
          dataKey="bookings"
          stroke="var(--primary)"
          strokeWidth={2}
          fill="url(#bookingsGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "var(--primary)", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
