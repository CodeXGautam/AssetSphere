"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { AssetStatusBadge, ConditionBadge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Package, Upload, X, Image as ImageIcon } from "lucide-react";
import { ASSET_CONDITIONS, ASSET_STATUSES } from "@/constants";
import type { AssetCondition, AssetStatus } from "@/types";
import { cn } from "@/lib/utils";

interface Category { _id: string; name: string; }

interface Asset {
  _id:               string;
  name:              string;
  category:          Category | null;
  description?:      string;
  imageUrl?:         string;
  totalQuantity:     number;
  availableQuantity: number;
  condition:         AssetCondition;
  status:            AssetStatus;
}

const CONDITION_OPTIONS = ASSET_CONDITIONS.map((c) => ({ value: c, label: c.replace("_", " ") }));
const STATUS_OPTIONS    = ASSET_STATUSES.map((s)    => ({ value: s, label: s }));

const EMPTY_FORM = {
  name:          "",
  categoryId:    "",
  description:   "",
  totalQuantity: "",
  condition:     "" as AssetCondition | "",
  status:        "" as AssetStatus | "",
  imageUrl:      "",   // final URL stored in DB
};
type FormState = typeof EMPTY_FORM;

/* ------------------------------------------------------------------ */
/* Image uploader sub-component                                         */
/* ------------------------------------------------------------------ */
function ImageUploader({
  currentUrl,
  onUploaded,
  onClear,
}: {
  currentUrl: string;
  onUploaded: (url: string) => void;
  onClear: () => void;
}) {
  const fileRef               = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) { setUploadErr("Only image files allowed."); return; }
    if (file.size > 5 * 1024 * 1024)    { setUploadErr("Max 5 MB."); return; }

    setUploadErr("");
    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch("/api/assets/upload", { method: "POST", credentials: "include", body: fd });
      const data = await res.json();
      if (!res.ok) { setUploadErr(data?.error ?? "Upload failed."); setPreview(currentUrl); return; }
      onUploaded(data.url);
    } catch {
      setUploadErr("Upload failed. Check your connection.");
      setPreview(currentUrl);
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleClear() {
    setPreview("");
    onClear();
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-[--muted-fg]">Asset image</label>

      {preview ? (
        /* Preview card */
        <div className="relative overflow-hidden rounded-xl border border-[--border] bg-[--muted]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Asset preview"
            className="h-40 w-full object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          )}
          {!uploading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
            >
              <X size={13} />
            </button>
          )}
        </div>
      ) : (
        /* Drop zone */
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={cn(
            "flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors",
            uploading
              ? "border-[--primary]/40 bg-[--primary]/5 cursor-not-allowed"
              : "border-[--border] bg-[--muted]/30 hover:border-[--primary]/50 hover:bg-[--muted]/60"
          )}
        >
          {uploading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[--primary] border-t-transparent" />
          ) : (
            <>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[--muted]">
                <ImageIcon size={16} className="text-[--muted-fg]" />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-[--muted-fg]">
                  <span className="text-[--primary]">Click to upload</span> or drag and drop
                </p>
                <p className="text-[10px] text-[--muted-fg]">PNG, JPG, WebP &mdash; max 5 MB</p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      {uploadErr && <p className="text-xs text-red-400">{uploadErr}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main page                                                            */
/* ------------------------------------------------------------------ */
export default function AdminAssetsPage() {
  const [assets,     setAssets]     = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId,     setEditId]     = useState<string | null>(null);
  const [deleteId,   setDeleteId]   = useState<string | null>(null);
  const [form,       setForm]       = useState<FormState>(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [aRes, cRes] = await Promise.all([
        fetch("/api/assets",     { credentials: "include" }),
        fetch("/api/categories", { credentials: "include" }),
      ]);
      const { assets:     a = [] } = aRes.ok ? await aRes.json() : {};
      const { categories: c = [] } = cRes.ok ? await cRes.json() : {};
      setAssets(a);
      setCategories(c);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setError("");
    setDialogOpen(true);
  }

  function openEdit(asset: Asset) {
    setForm({
      name:          asset.name,
      categoryId:    asset.category?._id ?? "",
      description:   asset.description ?? "",
      totalQuantity: String(asset.totalQuantity),
      condition:     asset.condition,
      status:        asset.status,
      imageUrl:      asset.imageUrl ?? "",
    });
    setEditId(asset._id);
    setError("");
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditId(null);
    setError("");
  }

  async function handleSave() {
    if (!form.name.trim())  { setError("Name is required.");      return; }
    if (!form.categoryId)   { setError("Category is required.");  return; }
    if (!form.condition)    { setError("Condition is required."); return; }
    if (!form.status)       { setError("Status is required.");    return; }
    const qty = parseInt(form.totalQuantity, 10);
    if (!qty || qty < 1)   { setError("Quantity must be at least 1."); return; }

    setSaving(true);
    setError("");
    try {
      const payload = {
        name:          form.name.trim(),
        categoryId:    form.categoryId,
        description:   form.description.trim() || undefined,
        totalQuantity: qty,
        condition:     form.condition,
        status:        form.status,
        imageUrl:      form.imageUrl || undefined,
      };

      const res = editId
        ? await fetch(`/api/assets/${editId}`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            credentials: "include", body: JSON.stringify(payload),
          })
        : await fetch("/api/assets", {
            method: "POST", headers: { "Content-Type": "application/json" },
            credentials: "include", body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const data = await res.json();
        setError(data?.error ?? "Failed to save asset.");
        return;
      }
      closeDialog();
      await loadData();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/assets/${deleteId}`, { method: "DELETE", credentials: "include" });
    setDeleteId(null);
    await loadData();
  }

  const categoryOptions = categories.map((c) => ({ value: c._id, label: c.name }));

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Asset Management</h2>
            <p className="mt-0.5 text-xs text-[--muted-fg]">
              {loading ? "Loading..." : `${assets.length} assets in inventory`}
            </p>
          </div>
          <Button onClick={openCreate} className="w-full sm:w-auto">
            <Plus size={14} />
            Add Asset
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
            <CardDescription>Manage, edit, and retire physical assets</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pb-2">
            {loading ? (
              <div className="space-y-2 p-5">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : assets.length === 0 ? (
              <div className="flex flex-col items-center py-14">
                <Package size={36} className="mb-2 text-[--muted-fg]" />
                <p className="text-sm text-[--muted-fg]">No assets yet.</p>
                <Button size="sm" className="mt-4" onClick={openCreate}>
                  <Plus size={13} /> Add your first asset
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset, i) => (
                    <motion.tr
                      key={asset._id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.2 }}
                      className="border-b border-[--border] hover:bg-[--muted]/30 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          {asset.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={asset.imageUrl}
                              alt={asset.name}
                              className="h-8 w-8 shrink-0 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[--muted]">
                              <Package size={13} className="text-[--muted-fg]" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-foreground">{asset.name}</p>
                            {asset.description && (
                              <p className="text-xs text-[--muted-fg] truncate max-w-[180px]">{asset.description}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-[--muted-fg]">{asset.category?.name ?? "—"}</TableCell>
                      <TableCell><ConditionBadge condition={asset.condition} /></TableCell>
                      <TableCell>
                        <span className={cn(
                          "text-sm font-medium",
                          asset.availableQuantity === 0 ? "text-red-400" : "text-foreground"
                        )}>
                          {asset.availableQuantity}
                        </span>
                        <span className="text-xs text-[--muted-fg]">/{asset.totalQuantity}</span>
                      </TableCell>
                      <TableCell><AssetStatusBadge status={asset.status} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => openEdit(asset)} title="Edit">
                            <Pencil size={13} />
                          </Button>
                          <Button
                            variant="ghost" size="icon-sm"
                            className="text-[--muted-fg] hover:text-red-400"
                            onClick={() => setDeleteId(asset._id)} title="Delete"
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} title={editId ? "Edit Asset" : "Add Asset"} size="xl">
        <div className="space-y-4">
          {/* Row 1: Name + Category */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Name *"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="e.g. MacBook Pro 14in"
            />
            <Select
              label="Category *"
              value={form.categoryId}
              onChange={(e) => setField("categoryId", e.target.value)}
              placeholder="Select category"
              options={categoryOptions}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[--muted-fg]">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={2}
              placeholder="Optional — describe what this asset is used for"
              className="w-full resize-none rounded-lg border border-[--border] bg-[--input] px-3 py-2 text-sm text-foreground placeholder:text-[--muted-fg] focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--ring]"
            />
          </div>

          {/* Row 2: Qty + Condition + Status */}
          <div className="grid gap-4 grid-cols-3">
            <Input
              label="Total Quantity *"
              type="number"
              min={1}
              value={form.totalQuantity}
              onChange={(e) => setField("totalQuantity", e.target.value)}
              placeholder="1"
            />
            <Select
              label="Condition *"
              value={form.condition}
              onChange={(e) => setField("condition", e.target.value as AssetCondition)}
              placeholder="Select condition"
              options={CONDITION_OPTIONS}
            />
            <Select
              label="Status *"
              value={form.status}
              onChange={(e) => setField("status", e.target.value as AssetStatus)}
              placeholder="Select status"
              options={STATUS_OPTIONS}
            />
          </div>

          {/* Image upload */}
          <ImageUploader
            currentUrl={form.imageUrl}
            onUploaded={(url) => setField("imageUrl", url)}
            onClear={() => setField("imageUrl", "")}
          />

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button variant="outline" size="sm" onClick={closeDialog} disabled={saving}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} loading={saving}>
              <Upload size={13} />
              {editId ? "Save Changes" : "Create Asset"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Delete dialog */}
      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete asset"
        description="This permanently removes the asset. Active bookings must be resolved first."
        size="sm"
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>
        </div>
      </Dialog>
    </DashboardLayout>
  );
}
