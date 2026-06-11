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
          <label className="text-sm font-medium text-zinc-300">Full name</label>
          <div className="relative">
            <User size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              {...form.register("name")}
              placeholder="Your full name"
              className={cn(
                "h-10 w-full rounded-xl border bg-zinc-900/60 pl-9 pr-3 text-sm text-foreground",
                "placeholder:text-zinc-600 transition-all",
                "border-zinc-800 focus:border-indigo-500/60 focus:bg-zinc-900",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30",
                form.formState.errors.name && "border-red-500/60"
              )}
            />
          </div>
          {form.formState.errors.name && (
            <p className="text-xs text-red-400">{form.formState.errors.name.message}</p>
          )}
        </div>
      )}

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-300">Email address</label>
        <div className="relative">
          <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            {...form.register("email")}
            type="email"
            placeholder="you@company.com"
            className={cn(
              "h-10 w-full rounded-xl border bg-zinc-900/60 pl-9 pr-3 text-sm text-foreground",
              "placeholder:text-zinc-600 transition-all",
              "border-zinc-800 focus:border-indigo-500/60 focus:bg-zinc-900",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30",
              form.formState.errors.email && "border-red-500/60"
            )}
          />
        </div>
        {form.formState.errors.email && (
          <p className="text-xs text-red-400">{form.formState.errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-300">Password</label>
        <div className="relative">
          <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            {...form.register("password")}
            type={showPassword ? "text" : "password"}
            placeholder={mode === "register" ? "At least 8 characters" : "Your password"}
            className={cn(
              "h-10 w-full rounded-xl border bg-zinc-900/60 pl-9 pr-10 text-sm text-foreground",
              "placeholder:text-zinc-600 transition-all",
              "border-zinc-800 focus:border-indigo-500/60 focus:bg-zinc-900",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30",
              form.formState.errors.password && "border-red-500/60"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="text-xs text-red-400">{form.formState.errors.password.message}</p>
        )}
      </div>

      {/* Server error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </motion.div>
      )}

      <Button
        type="submit"
        loading={loading}
        className="w-full rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 h-10"
      >
        {mode === "register" ? "Create account" : "Sign in"}
        <ArrowRight size={15} />
      </Button>

      <p className="text-center text-sm text-zinc-500">
        {mode === "login" ? (
          <>
            New to AssetSphere?{" "}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have access?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[60vh] w-[60vw] -translate-x-1/2 rounded-full bg-indigo-600/8 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-[40vh] w-[40vw] rounded-full bg-violet-600/8 blur-[100px]" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
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
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 shadow-[0_0_24px_rgba(99,102,241,0.4)]">
            <Layers size={20} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-foreground">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {mode === "login"
                ? "Sign in to your AssetSphere workspace"
                : "Join AssetSphere and start managing assets"}
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-sm shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
          <AuthForm mode={mode} />
        </div>
      </motion.div>
    </div>
  );
}
