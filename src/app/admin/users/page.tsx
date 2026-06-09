"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

interface User {
  id:        string;
  name:      string;
  email:     string;
  role:      "ADMIN" | "USER";
  createdAt: string;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day:   "numeric",
      year:  "numeric",
    });
  } catch {
    return "—";
  }
}

export default function AdminUsersPage() {
  const [users,   setUsers]   = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      const { users: u = [] } = res.ok ? await res.json() : {};
      setUsers(u);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(); }, []);

  async function toggleRole(user: User) {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    setToggling(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => u.id === user.id ? { ...u, role: newRole } : u)
        );
      }
    } finally {
      setToggling(null);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-semibold text-foreground">User Management</h2>
          <p className="mt-0.5 text-xs text-[--muted-fg]">
            {loading ? "Loading..." : `${users.length} registered users`}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            {!loading && (
              <CardDescription>Manage roles and access levels</CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-0 pb-2">
            {loading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center py-12">
                <Users size={36} className="mb-2 text-[--muted-fg]" />
                <p className="text-sm text-[--muted-fg]">No users found.</p>
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
                  {users.map((user, i) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                      className="border-b border-[--border] transition-colors hover:bg-[--muted]/40"
                    >
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-[--muted-fg]">{user.email}</TableCell>
                      <TableCell>
                        <span
                          className={
                            user.role === "ADMIN"
                              ? "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset bg-[--primary]/10 text-[--primary] ring-[--primary]/20"
                              : "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset bg-[--muted] text-[--muted-fg] ring-[--border]"
                          }
                        >
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-[--muted-fg] text-xs">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => toggleRole(user)}
                          loading={toggling === user.id}
                        >
                          {user.role === "ADMIN" ? "Demote to User" : "Promote to Admin"}
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
    </DashboardLayout>
  );
}
