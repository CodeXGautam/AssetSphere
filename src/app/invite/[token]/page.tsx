"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Layers, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InviteInfo {
  email:   string;
  orgName: string;
  token:   string;
}

type PageState = "loading" | "ready" | "invalid" | "submitting" | "done" | "error";

function Field({ label, type = "text", value, onChange, error, readOnly, placeholder }: {
  label: string; type?: string; value: string;
  onChange?: (v: string) => void; error?: string; readOnly?: boolean; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-[--muted-fg]">{label}</label>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={cn(
          "h-9 w-full rounded-lg border bg-[--input] px-3 text-sm text-foreground",
          "placeholder:text-[--muted-fg] transition-colors",
          readOnly ? "cursor-not-allowed opacity-60 bg-[--muted]" : "focus:border-[--primary] focus:outline-none focus:ring-2 focus:ring-[--ring]",
          error ? "border-red-500/50" : "border-[--border]"
        )}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const router    = useRouter();

  const [state,    setState]    = useState<PageState>("loading");
  const [invite,   setInvite]   = useState<InviteInfo | null>(null);
  const [name,     setName]     = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [errors,   setErrors]   = useState<{ name?: string; password?: string; confirm?: string }>({});
  const [errMsg,   setErrMsg]   = useState("");

  useEffect(() => {
    async function validate() {
      const res  = await fetch(`/api/invite/${token}`);
      const data = await res.json();
      if (!res.ok) {
        setErrMsg(data.error ?? "Invalid invite link.");
        setState("invalid");
        return;
      }
      setInvite(data);
      setState("ready");
    }
    validate();
  }, [token]);

  async function handleAccept(ev: React.FormEvent) {
    ev.preventDefault();
    const e: typeof errors = {};
    if (name.trim().length < 2)     e.name     = "Name must be at least 2 characters.";
    if (password.length < 8)        e.password = "Password must be at least 8 characters.";
    if (password !== confirm)       e.confirm  = "Passwords do not match.";
    if (Object.keys(e).length) { setErrors(e); return; }

    setState("submitting");
    setErrMsg("");

    const res  = await fetch(`/api/invite/${token}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setErrMsg(data.error ?? "Something went wrong.");
      setState("error");
      return;
    }

    setState("done");
  }

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[--background]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[--primary] border-t-transparent" />
      </div>
    );
  }

  if (state === "invalid" || state === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[--background] px-4">
        <div className="text-center">
          <XCircle size={40} className="mx-auto mb-3 text-red-400" />
          <h1 className="text-base font-semibold text-foreground">Invalid invite</h1>
          <p className="mt-1 text-sm text-[--muted-fg]">{errMsg}</p>
          <Button className="mt-6" onClick={() => router.push("/login")}>Go to sign in</Button>
        </div>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[--background] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">You are in!</h1>
          <p className="mt-2 text-sm text-[--muted-fg]">
            Your account has been created. Sign in to access{" "}
            <strong className="text-foreground">{invite?.orgName}</strong>.
          </p>
          <Button className="mt-6" onClick={() => router.push("/login")}>Sign in now</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[--background] px-4 py-12">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-0 h-[50vh] w-[60vw] -translate-x-1/2 rounded-full bg-[--primary]/8 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[--primary]">
            <Layers size={18} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-foreground">
              Join {invite?.orgName}
            </h1>
            <p className="mt-1 text-sm text-[--muted-fg]">
              Set up your account to accept the invitation.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[--border] bg-[--card] p-6">
          <form onSubmit={handleAccept} className="space-y-4">
            <Field
              label="Email"
              type="email"
              value={invite?.email ?? ""}
              readOnly
            />
            <Field
              label="Your full name *"
              value={name}
              onChange={setName}
              error={errors.name}
              placeholder="Jane Doe"
            />
            <Field
              label="Password *"
              type="password"
              value={password}
              onChange={setPassword}
              error={errors.password}
              placeholder="Min 8 characters"
            />
            <Field
              label="Confirm password *"
              type="password"
              value={confirm}
              onChange={setConfirm}
              error={errors.confirm}
              placeholder="Repeat password"
            />

            {errMsg && (
              <p className="text-xs text-red-400">{errMsg}</p>
            )}

            <Button type="submit" loading={state === "submitting"} className="w-full">
              Accept invitation
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
