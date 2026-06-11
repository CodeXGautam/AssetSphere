import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATS = [
  { label: "Assets under management", value: "28.4k" },
  { label: "Average approval time", value: "42 min" },
  { label: "Utilization rate", value: "93%" },
  { label: "Monthly audits", value: "1,280" },
];

export function StatsSection() {
  return (
    <section className="grid gap-6 md:grid-cols-4">
      {STATS.map((stat) => (
        <Card key={stat.label}>
          <CardHeader>
            <CardTitle className="text-2xl">{stat.value}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {stat.label}
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
