"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { loginSchema, registerSchema } from "@/validators/auth";
import { cn } from "@/lib/utils";
import Link from "next/link";

type FormMode = "login" | "register";

type LoginValues   = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

interface AuthFormProps {
  mode: FormMode;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const schema = mode === "login" ? loginSchema : registerSchema;

  const form = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: LoginValues | RegisterValues) {
    setError(null);
    setLoading(true);
    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? "Registration failed");
          setLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {mode === "register" && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[--muted-fg]">Full name</label>
          <div className="relative">
            <User size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[--muted-fg]" />
            <input
              {...form.register("name")}
              placeholder="Your full name"
              className={cn(
                "h-10 w-full rounded-xl border bg-[--input] pl-9 pr-3 text-sm text-foreground",
                "placeholder:text-[--muted-fg] transition-all",
                "border-[--border] focus:border-[--primary] focus:bg-[--bg-subtle]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring]",
                form.formState.errors.name && "border-red-500/60"
              )}
            />
          </div>
          {form.formState.errors.name && (
            <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
          )}
        </div>
      )}

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[--muted-fg]">Email address</label>
        <div className="relative">
          <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[--muted-fg]" />
          <input
            {...form.register("email")}
            type="email"
            placeholder="you@company.com"
            className={cn(
              "h-10 w-full rounded-xl border bg-[--input] pl-9 pr-3 text-sm text-foreground",
              "placeholder:text-[--muted-fg] transition-all",
              "border-[--border] focus:border-[--primary] focus:bg-[--bg-subtle]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring]",
              form.formState.errors.email && "border-red-500/60"
            )}
          />
        </div>
        {form.formState.errors.email && (
          <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[--muted-fg]">Password</label>
        <div className="relative">
          <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[--muted-fg]" />
          <input
            {...form.register("password")}
            type={showPassword ? "text" : "password"}
            placeholder={mode === "register" ? "At least 8 characters" : "Your password"}
            className={cn(
              "h-10 w-full rounded-xl border bg-[--input] pl-9 pr-10 text-sm text-foreground",
              "placeholder:text-[--muted-fg] transition-all",
              "border-[--border] focus:border-[--primary] focus:bg-[--bg-subtle]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring]",
              form.formState.errors.password && "border-red-500/60"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[--muted-fg] hover:text-foreground"
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
        )}
      </div>

      {/* Server error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500"
        >
          {error}
        </motion.div>
      )}

      <Button
        type="submit"
        loading={loading}
        className="w-full rounded-xl h-10"
      >
        {mode === "register" ? "Create account" : "Sign in"}
        <ArrowRight size={15} />
      </Button>

      <p className="text-center text-sm text-[--muted-fg]">
        {mode === "login" ? (
          <>
            New to AssetSphere?{" "}
            <Link href="/register" className="text-[--primary] hover:underline font-medium">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have access?{" "}
            <Link href="/login" className="text-[--primary] hover:underline font-medium">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

export function AuthPageShell({ mode }: { mode: FormMode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[--bg] px-4">
      {/* Theme toggle — top-right */}
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[60vh] w-[60vw] -translate-x-1/2 rounded-full bg-[--primary]/8 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-[40vh] w-[40vw] rounded-full bg-violet-600/8 blur-[100px]" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[--primary] shadow-[0_0_24px_rgba(99,102,241,0.35)]">
            <Layers size={20} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-foreground">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1 text-sm text-[--muted-fg]">
              {mode === "login"
                ? "Sign in to your AssetSphere workspace"
                : "Join AssetSphere and start managing assets"}
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[--border] bg-[--card] p-6 shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
          <AuthForm mode={mode} />
        </div>
      </motion.div>
    </div>
  );
}
