"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Tags } from "lucide-react";

interface Category {
  _id:          string;
  name:         string;
  description?: string;
  createdAt?:   string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [open,       setOpen]       = useState(false);
  const [name,       setName]       = useState("");
  const [desc,       setDesc]       = useState("");
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");

  async function loadCategories() {
    setLoading(true);
    try {
      const res = await fetch("/api/categories", { credentials: "include" });
      const { categories: c = [] } = res.ok ? await res.json() : {};
      setCategories(c);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCategories(); }, []);

  function openDialog() {
    setName("");
    setDesc("");
    setError("");
    setOpen(true);
  }

  async function handleCreate() {
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/categories", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name.trim(), description: desc.trim() || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data?.error ?? "Failed to create category.");
        return;
      }

      setOpen(false);
      await loadCategories();
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Categories</h2>
            <p className="mt-0.5 text-xs text-[--muted-fg]">Organise your assets with named categories</p>
          </div>
          <Button onClick={openDialog}>
            <Plus size={15} />
            New Category
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <Tags size={36} className="mb-2 text-[--muted-fg]" />
              <p className="text-sm text-[--muted-fg]">No categories yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, i) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="rounded-xl border border-[--border] bg-[--card] p-5 transition-colors hover:border-[--muted-fg]/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[--primary]/10">
                    <Tags size={16} className="text-[--primary]" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{cat.name}</p>
                </div>
                {cat.description && (
                  <p className="mt-3 text-xs leading-relaxed text-[--muted-fg]">{cat.description}</p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="New Category"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Name *"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            placeholder="e.g. AV Equipment"
            error={error}
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[--muted-fg]">Description</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={2}
              placeholder="Optional description..."
              className="w-full resize-none rounded-lg border border-[--border] bg-[--input] px-3 py-2 text-sm text-foreground placeholder:text-[--muted-fg] focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--ring]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreate} loading={saving}>
              Create
            </Button>
          </div>
        </div>
      </Dialog>
    </DashboardLayout>
  );
}
