"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, CheckCircle2, Layers, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FormState {
  orgName:      string;
  orgEmail:     string;
  founderName:  string;
  founderEmail: string;
  password:     string;
  confirm:      string;
}

const EMPTY: FormState = {
  orgName: "", orgEmail: "", founderName: "",
  founderEmail: "", password: "", confirm: "",
};

type Status = "idle" | "loading" | "success" | "error";

function Field({
  label, type = "text", value, onChange, error, placeholder,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; error?: string; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-[--muted-fg]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-9 w-full rounded-lg border bg-[--input] px-3 text-sm text-foreground",
          "placeholder:text-[--muted-fg] transition-colors",
          "focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--ring]",
          error ? "border-red-500/50" : "border-[--border]"
        )}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export default function OnboardPage() {
  const [form,   setForm]   = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [msg,    setMsg]    = useState("");

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (form.orgName.trim().length < 2)         e.orgName      = "Organisation name must be at least 2 characters.";
    if (!form.orgEmail.includes("@"))            e.orgEmail     = "Enter a valid official email.";
    if (form.founderName.trim().length < 2)      e.founderName  = "Your name must be at least 2 characters.";
    if (!form.founderEmail.includes("@"))        e.founderEmail = "Enter a valid email.";
    if (form.password.length < 8)                e.password     = "Password must be at least 8 characters.";
    if (form.password !== form.confirm)          e.confirm      = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    setMsg("");

    try {
      const res = await fetch("/api/orgs", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgName:      form.orgName.trim(),
          orgEmail:     form.orgEmail.trim(),
          founderName:  form.founderName.trim(),
          founderEmail: form.founderEmail.trim(),
          password:     form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(typeof data.error === "string" ? data.error : "Something went wrong.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[--background] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Application submitted!</h1>
          <p className="mt-2 text-sm text-[--muted-fg]">
            Your organisation request has been sent for review. You will receive an email once it is approved.
          </p>
          <Link href="/login">
            <Button className="mt-6">Back to sign in</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[--background] px-4 py-12">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[50vh] w-[60vw] -translate-x-1/2 rounded-full bg-[--primary]/8 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[--primary]">
            <Layers size={18} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-foreground">Create your organisation</h1>
            <p className="mt-1 text-sm text-[--muted-fg]">
              Fill in the details below. Our team will review and approve your request.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[--border] bg-[--card] p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Org section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 size={13} className="text-[--muted-fg]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[--muted-fg]">
                  Organisation
                </span>
              </div>
              <Field
                label="Organisation name *"
                value={form.orgName}
                onChange={(v) => set("orgName", v)}
                error={errors.orgName}
                placeholder="Acme Corp"
              />
              <Field
                label="Official organisation email *"
                type="email"
                value={form.orgEmail}
                onChange={(v) => set("orgEmail", v)}
                error={errors.orgEmail}
                placeholder="contact@acmecorp.com"
              />
            </div>

            <div className="h-px bg-[--border]" />

            {/* Founder section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[--muted-fg]">
                  Your account
                </span>
              </div>
              <Field
                label="Your full name *"
                value={form.founderName}
                onChange={(v) => set("founderName", v)}
                error={errors.founderName}
                placeholder="Jane Doe"
              />
              <Field
                label="Your email *"
                type="email"
                value={form.founderEmail}
                onChange={(v) => set("founderEmail", v)}
                error={errors.founderEmail}
                placeholder="jane@acmecorp.com"
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Password *"
                  type="password"
                  value={form.password}
                  onChange={(v) => set("password", v)}
                  error={errors.password}
                  placeholder="Min 8 chars"
                />
                <Field
                  label="Confirm password *"
                  type="password"
                  value={form.confirm}
                  onChange={(v) => set("confirm", v)}
                  error={errors.confirm}
                  placeholder="Repeat password"
                />
              </div>
            </div>

            {status === "error" && msg && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-red-400"
              >
                {msg}
              </motion.p>
            )}

            <Button
              type="submit"
              loading={status === "loading"}
              className="w-full"
            >
              Submit application
              <ArrowRight size={14} />
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-[--muted-fg]">
          Already have an account?{" "}
          <Link href="/login" className="text-[--primary] hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
