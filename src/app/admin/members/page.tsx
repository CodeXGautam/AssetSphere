"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Send, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Member {
  id:        string;
  name:      string;
  email:     string;
  orgRole:   "ORG_ADMIN" | "MEMBER";
  createdAt: string;
}

const ROLE_BADGE: Record<string, string> = {
  ORG_ADMIN: "bg-[--primary]/10 text-[--primary] ring-[--primary]/20",
  MEMBER:    "bg-[--muted] text-[--muted-fg] ring-[--border]",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminMembersPage() {
  const [members,   setMembers]   = useState<Member[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [toggling,  setToggling]  = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteStatus, setInviteStatus] = useState<"idle"|"loading"|"done"|"error">("idle");
  const [inviteMsg, setInviteMsg] = useState("");

  async function loadMembers() {
    setLoading(true);
    const res = await fetch("/api/orgs/members", { credentials: "include" });
    const { members: m = [] } = res.ok ? await res.json() : {};
    setMembers(m);
    setLoading(false);
  }

  useEffect(() => { loadMembers(); }, []);

  async function toggleRole(member: Member) {
    const newRole = member.orgRole === "ORG_ADMIN" ? "MEMBER" : "ORG_ADMIN";
    setToggling(member.id);
    const res = await fetch(`/api/orgs/members/${member.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ orgRole: newRole }),
    });
    if (res.ok) {
      setMembers((prev) =>
        prev.map((m) => m.id === member.id ? { ...m, orgRole: newRole } : m)
      );
    }
    setToggling(null);
  }

  async function sendInvite() {
    if (!inviteEmail.includes("@")) {
      setInviteMsg("Enter a valid email address.");
      setInviteStatus("error");
      return;
    }
    setInviteStatus("loading");
    setInviteMsg("");
    const res = await fetch("/api/orgs/invite", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: inviteEmail.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setInviteMsg(typeof data.error === "string" ? data.error : "Failed to send invite.");
      setInviteStatus("error");
      return;
    }
    setInviteStatus("done");
    setInviteMsg(data.message ?? "Invite sent.");
  }

  function closeInvite() {
    setInviteOpen(false);
    setInviteEmail("");
    setInviteStatus("idle");
    setInviteMsg("");
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Members</h2>
            <p className="mt-0.5 text-xs text-[--muted-fg]">
              {loading ? "Loading..." : `${members.length} members in your organisation`}
            </p>
          </div>
          <Button onClick={() => setInviteOpen(true)}>
            <Send size={13} />
            Invite member
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team</CardTitle>
            {!loading && <CardDescription>Promote or demote members</CardDescription>}
          </CardHeader>
          <CardContent className="p-0 pb-2">
            {loading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center py-12">
                <Users size={36} className="mb-2 text-[--muted-fg]" />
                <p className="text-sm text-[--muted-fg]">No members yet. Send your first invite.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((m, i) => (
                    <motion.tr
                      key={m.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-[--border] hover:bg-[--muted]/30 transition-colors"
                    >
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell className="text-[--muted-fg]">{m.email}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${ROLE_BADGE[m.orgRole]}`}>
                          {m.orgRole === "ORG_ADMIN" ? "Admin" : "Member"}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-[--muted-fg]">{formatDate(m.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => toggleRole(m)}
                          loading={toggling === m.id}
                        >
                          {m.orgRole === "ORG_ADMIN" ? "Demote" : "Make Admin"}
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onClose={closeInvite} title="Invite a member" size="sm">
        {inviteStatus === "done" ? (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15">
              <CheckCircle2 size={22} className="text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-foreground">{inviteMsg}</p>
            <p className="mt-1 text-xs text-[--muted-fg]">They will receive an email with a sign-up link.</p>
            <Button className="mt-4" size="sm" onClick={closeInvite}>Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[--muted-fg]">Email address *</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => { setInviteEmail(e.target.value); setInviteMsg(""); setInviteStatus("idle"); }}
                placeholder="colleague@company.com"
                className={cn(
                  "h-9 w-full rounded-lg border bg-[--input] px-3 text-sm text-foreground",
                  "placeholder:text-[--muted-fg] transition-colors",
                  "focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--ring]",
                  inviteStatus === "error" ? "border-red-500/50" : "border-[--border]"
                )}
              />
              {inviteStatus === "error" && inviteMsg && (
                <p className="text-xs text-red-400">{inviteMsg}</p>
              )}
            </div>
            <p className="text-xs text-[--muted-fg]">
              They will receive an email invite and join as a Member. You can change their role anytime.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={closeInvite}>Cancel</Button>
              <Button size="sm" onClick={sendInvite} loading={inviteStatus === "loading"}>
                <Send size={13} />
                Send invite
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </DashboardLayout>
  );
}
