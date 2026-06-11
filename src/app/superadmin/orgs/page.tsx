"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Building2, Clock, ChevronLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog } from "@/components/ui/dialog";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

interface Org {
  id:             string;
  name:           string;
  slug:           string;
  email:          string;
  status:         "PENDING" | "ACTIVE" | "REJECTED";
  rejectedReason: string | null;
  createdAt:      string;
  founder:        { name: string; email: string } | null;
}

const STATUS_CONFIG = {
  PENDING:  { icon: Clock,         cls: "bg-amber-500/10 text-amber-400 ring-amber-500/25",   label: "Pending"  },
  ACTIVE:   { icon: CheckCircle2,  cls: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/25", label: "Active" },
  REJECTED: { icon: XCircle,       cls: "bg-red-500/10 text-red-400 ring-red-500/25",          label: "Rejected" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function SuperAdminOrgsPage() {
  const router = useRouter();
  const [orgs,          setOrgs]          = useState<Org[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [rejectId,      setRejectId]      = useState<string | null>(null);
  const [rejectReason,  setRejectReason]  = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter,        setFilter]        = useState<"ALL" | "PENDING" | "ACTIVE" | "REJECTED">("ALL");

  async function loadOrgs() {
    setLoading(true);
    const qs  = filter !== "ALL" ? `?status=${filter}` : "";
    const res = await fetch(`/api/superadmin/orgs${qs}`, { credentials: "include" });
    const { orgs: o = [] } = res.ok ? await res.json() : {};
    setOrgs(o);
    setLoading(false);
  }

  useEffect(() => { loadOrgs(); }, [filter]); // eslint-disable-line

  async function approve(id: string) {
    setActionLoading(id);
    await fetch(`/api/orgs/${id}/approve`, { method: "POST", credentials: "include" });
    setActionLoading(null);
    await loadOrgs();
  }

  async function reject() {
    if (!rejectId) return;
    setActionLoading(rejectId);
    await fetch(`/api/orgs/${rejectId}/reject`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ reason: rejectReason }),
    });
    setRejectId(null);
    setRejectReason("");
    setActionLoading(null);
    await loadOrgs();
  }

  const pending = orgs.filter((o) => o.status === "PENDING").length;

  const FILTERS = ["ALL", "PENDING", "ACTIVE", "REJECTED"] as const;

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* Page header with back button */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[--border] bg-[--card] text-[--muted-fg] transition-colors hover:bg-[--muted] hover:text-foreground"
            >
              <ChevronLeft size={15} />
            </button>
            <div>
              <h2 className="text-base font-semibold text-foreground">Organisation Requests</h2>
              <p className="text-xs text-[--muted-fg]">
                {loading
                  ? "Loading..."
                  : pending > 0
                  ? <><span className="text-amber-400 font-medium">{pending} pending</span> review</>
                  : "All requests reviewed"}
              </p>
            </div>
          </div>

          <button
            onClick={loadOrgs}
            className="flex items-center gap-1.5 rounded-lg border border-[--border] bg-[--card] px-3 py-1.5 text-xs text-[--muted-fg] transition-colors hover:bg-[--muted] hover:text-foreground self-start sm:self-auto"
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 rounded-lg border border-[--border] bg-[--card] p-1 w-fit">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-[--primary] text-white"
                  : "text-[--muted-fg] hover:text-foreground hover:bg-[--muted]"
              }`}
            >
              {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Table card */}
        <Card>
          <CardHeader>
            <CardTitle>Organisations</CardTitle>
            {!loading && <CardDescription>{orgs.length} {filter !== "ALL" ? filter.toLowerCase() : "total"}</CardDescription>}
          </CardHeader>
          <CardContent className="p-0 pb-2">
            {loading ? (
              <div className="space-y-2 p-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : orgs.length === 0 ? (
              <div className="flex flex-col items-center py-14">
                <Building2 size={36} className="mb-2 text-[--muted-fg]" />
                <p className="text-sm text-[--muted-fg]">No organisations found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organisation</TableHead>
                    <TableHead>Founder</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orgs.map((org, i) => {
                    const cfg = STATUS_CONFIG[org.status];
                    const Icon = cfg.icon;
                    return (
                      <motion.tr
                        key={org.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-b border-[--border] hover:bg-[--muted]/30 transition-colors"
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{org.name}</p>
                            <p className="text-xs text-[--muted-fg]">{org.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {org.founder ? (
                            <div>
                              <p className="text-sm text-foreground">{org.founder.name}</p>
                              <p className="text-xs text-[--muted-fg]">{org.founder.email}</p>
                            </div>
                          ) : (
                            <span className="text-[--muted-fg]">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cfg.cls}`}>
                            <Icon size={11} />
                            {cfg.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-[--muted-fg]">
                          {formatDate(org.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          {org.status === "PENDING" ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="xs"
                                className="bg-emerald-600 text-white hover:bg-emerald-500"
                                onClick={() => approve(org.id)}
                                loading={actionLoading === org.id}
                              >
                                <CheckCircle2 size={12} />
                                Approve
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                onClick={() => { setRejectId(org.id); setRejectReason(""); }}
                              >
                                <XCircle size={12} />
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-[--muted-fg]">—</span>
                          )}
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

      {/* Reject dialog */}
      <Dialog
        open={!!rejectId}
        onClose={() => setRejectId(null)}
        title="Reject organisation"
        description="Optionally provide a reason. It will be included in the notification email to the founder."
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[--muted-fg]">Reason (optional)</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="e.g. Incomplete information provided..."
              className="w-full resize-none rounded-lg border border-[--border] bg-[--input] px-3 py-2 text-sm text-foreground placeholder:text-[--muted-fg] focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--ring]"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setRejectId(null)}>Cancel</Button>
            <Button
              size="sm"
              className="bg-red-600 text-white hover:bg-red-500"
              onClick={reject}
              loading={!!actionLoading}
            >
              Confirm Reject
            </Button>
          </div>
        </div>
      </Dialog>
    </DashboardLayout>
  );
}
