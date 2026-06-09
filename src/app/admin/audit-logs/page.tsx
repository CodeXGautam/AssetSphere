"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuditLog {
  _id:       string;
  actorId?:  string | { name?: string; email?: string } | null;
  action:    string;
  entity:    string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

const ACTION_STYLES: Record<string, string> = {
  USER_REGISTERED:         "bg-sky-500/10 text-sky-400 ring-sky-500/20",
  BOOKING_CREATED:         "bg-[--primary]/10 text-[--primary] ring-[--primary]/20",
  BOOKING_APPROVED:        "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  BOOKING_REJECTED:        "bg-red-500/10 text-red-400 ring-red-500/20",
  ASSET_ISSUED:            "bg-violet-500/10 text-violet-400 ring-violet-500/20",
  ASSET_RETURNED:          "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  ASSET_CREATED:           "bg-cyan-500/10 text-cyan-400 ring-cyan-500/20",
  ASSET_DELETED:           "bg-zinc-700/20 text-[--muted-fg] ring-[--border]",
  ASSET_CONDITION_UPDATED: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
};

function formatTimestamp(ts: string) {
  const d = new Date(ts);
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  };
}

function getActorLabel(actorId: AuditLog["actorId"]): string {
  if (!actorId) return "System";
  if (typeof actorId === "object") {
    return actorId.name ?? actorId.email ?? "Unknown";
  }
  return String(actorId).slice(-6); // Show last 6 chars of ObjectId as fallback
}

export default function AuditLogsPage() {
  const [logs,    setLogs]    = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  async function loadLogs() {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/audit-logs", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) { setError(data?.error ?? "Failed to load audit logs."); return; }
      setLogs(data.logs ?? []);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadLogs(); }, []);

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[--primary]/10">
              <ShieldCheck size={16} className="text-[--primary]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Audit Logs</h2>
              <p className="text-xs text-[--muted-fg]">Immutable trail of all critical system actions</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={loadLogs}>
            <RefreshCw size={13} />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            {!loading && !error && (
              <CardDescription>{logs.length} entries &mdash; latest 50</CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-0 pb-2">
            {loading ? (
              <div className="space-y-2 p-5">
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : error ? (
              <div className="px-5 py-8 text-center text-sm text-[--muted-fg]">{error}</div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center py-12">
                <ShieldCheck size={36} className="mb-2 text-[--muted-fg]" />
                <p className="text-sm text-[--muted-fg]">No audit logs yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Ref ID</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log, i) => {
                    const { date, time } = formatTimestamp(log.createdAt);
                    const actionStyle    = ACTION_STYLES[log.action] ?? "bg-[--muted] text-[--muted-fg] ring-[--border]";
                    return (
                      <motion.tr
                        key={log._id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i, 10) * 0.03, duration: 0.2 }}
                        className="border-b border-[--border] transition-colors hover:bg-[--muted]/30"
                      >
                        <TableCell className="font-medium">
                          {getActorLabel(log.actorId ?? null)}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${actionStyle}`}>
                            {log.action.replace(/_/g, " ")}
                          </span>
                        </TableCell>
                        <TableCell className="text-[--muted-fg]">{log.entity}</TableCell>
                        <TableCell>
                          <span className="font-mono text-[10px] text-[--muted-fg]">
                            {log.entityId ? String(log.entityId).slice(-8) : "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs text-foreground/80">{date}</span>
                            <span className="text-[10px] text-[--muted-fg]">{time}</span>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
