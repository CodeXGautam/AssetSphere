"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, CheckCheck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id?:       string;
  _id?:      string;
  subject:   string;
  message:   string;
  type:      string;
  readAt:    string | null;
  createdAt: string;
}

function getId(n: Notification): string {
  return (n.id ?? n._id ?? "") as string;
}

const TYPE_ICON_STYLES: Record<string, string> = {
  BOOKING_APPROVED: "bg-sky-500/10 text-sky-400",
  BOOKING_CREATED:  "bg-[--primary]/10 text-[--primary]",
  BOOKING_REJECTED: "bg-red-500/10 text-red-400",
  ASSET_ISSUED:     "bg-violet-500/10 text-violet-400",
  ASSET_RETURNED:   "bg-emerald-500/10 text-emerald-400",
};

function formatRelative(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading,       setLoading]       = useState(true);

  async function loadNotifications() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", { credentials: "include" });
      const { notifications: n = [] } = res.ok ? await res.json() : {};
      setNotifications(n);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadNotifications(); }, []);

  async function markRead(id: string) {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) =>
        getId(n) === id ? { ...n, readAt: new Date().toISOString() } : n
      )
    );
    await fetch(`/api/notifications/${id}/read`, {
      method:      "PATCH",
      credentials: "include",
    });
  }

  async function markAllRead() {
    const unread = notifications.filter((n) => !n.readAt);
    const now = new Date().toISOString();
    // Optimistic
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? now })));
    // Fire off all requests
    await Promise.all(
      unread.map((n) =>
        fetch(`/api/notifications/${getId(n)}/read`, {
          method:      "PATCH",
          credentials: "include",
        })
      )
    );
  }

  const unread = notifications.filter((n) => !n.readAt).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Notifications</h2>
            <p className="mt-0.5 text-xs text-[--muted-fg]">
              {loading
                ? "Loading..."
                : unread > 0
                ? <><span className="text-[--primary]">{unread} unread</span></>
                : "All caught up"}
            </p>
          </div>
          {!loading && unread > 0 && (
            <Button variant="secondary" size="sm" onClick={markAllRead}>
              <CheckCheck size={13} />
              Mark all read
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
            {!loading && (
              <CardDescription>{notifications.length} total notifications</CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-2 p-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Bell size={36} className="mb-3 text-[--muted-fg]" />
                <p className="text-sm text-[--muted-fg]">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-[--border]">
                {notifications.map((n, i) => {
                  const isUnread  = !n.readAt;
                  const iconStyle = TYPE_ICON_STYLES[n.type] ?? "bg-[--muted] text-[--muted-fg]";
                  const id        = getId(n);

                  return (
                    <motion.div
                      key={id || i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={cn(
                        "flex items-start gap-4 px-6 py-4 transition-colors",
                        isUnread ? "bg-[--primary]/3" : "hover:bg-[--muted]/30"
                      )}
                    >
                      <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", iconStyle)}>
                        <Bell size={14} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <p className={cn("text-sm font-medium", isUnread ? "text-foreground" : "text-foreground/70")}>
                            {n.subject}
                          </p>
                          {isUnread && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[--primary]" />
                          )}
                        </div>
                        <p className="mt-0.5 text-xs leading-relaxed text-[--muted-fg]">{n.message}</p>
                        <p className="mt-1 text-[10px] text-[--muted-fg]/60">{formatRelative(n.createdAt)}</p>
                      </div>

                      {isUnread && (
                        <button
                          onClick={() => markRead(id)}
                          className="shrink-0 rounded-lg p-1.5 text-[--muted-fg] transition-colors hover:bg-[--muted] hover:text-foreground"
                          title="Mark as read"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
