"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, LayoutDashboard, Package, BookOpen,
  ClipboardList, ShieldCheck, Bell, Tags, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ALL_ACTIONS = [
  { label: "Dashboard",        href: "/dashboard",        icon: LayoutDashboard, admin: false },
  { label: "Browse Assets",    href: "/assets",           icon: Package,         admin: false },
  { label: "My Bookings",      href: "/bookings",         icon: BookOpen,        admin: false },
  { label: "Notifications",    href: "/notifications",    icon: Bell,            admin: false },
  { label: "Manage Assets",    href: "/admin/assets",     icon: Package,         admin: true  },
  { label: "Categories",       href: "/admin/categories", icon: Tags,            admin: true  },
  { label: "All Bookings",     href: "/admin/bookings",   icon: ClipboardList,   admin: true  },
  { label: "Audit Logs",       href: "/admin/audit-logs", icon: ShieldCheck,     admin: true  },
];

export function CommandPalette() {
  const [open, setOpen]         = useState(false);
  const [query, setQuery]       = useState("");
  const [selected, setSelected] = useState(0);
  const router                  = useRouter();
  const { data: session }       = useSession();
  const isAdmin = session?.user?.orgRole === "ORG_ADMIN" || session?.user?.isSuperAdmin;

  const actions = ALL_ACTIONS.filter(
    (a) =>
      (isAdmin || !a.admin) &&
      a.label.toLowerCase().includes(query.toLowerCase())
  );

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const inInput =
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement;

      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        if (inInput) return;
        e.preventDefault();
        setOpen((v) => !v);
        setSelected(0);
      }
      if (e.key === "Escape") setOpen(false);

      if (open) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelected((s) => Math.min(s + 1, actions.length - 1));
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelected((s) => Math.max(s - 1, 0));
        }
        if (e.key === "Enter" && actions[selected]) {
          navigate(actions[selected].href);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, selected, actions, navigate]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-[0_25px_80px_rgba(0,0,0,0.7)]"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-zinc-800/60 px-4 py-3">
              <Search size={15} className="shrink-0 text-zinc-500" />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelected(0);
                }}
                placeholder="Search pages and actions..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-zinc-600 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  <X size={14} />
                </button>
              )}
              <kbd className="rounded border border-zinc-700/60 bg-zinc-800/60 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="py-1.5">
              {actions.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-zinc-600">
                  No results found
                </p>
              ) : (
                actions.map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.href + action.label}
                      onClick={() => navigate(action.href)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                        i === selected
                          ? "bg-indigo-500/15 text-indigo-300"
                          : "text-zinc-300 hover:bg-zinc-800/60"
                      )}
                      onMouseEnter={() => setSelected(i)}
                    >
                      <Icon size={15} className="shrink-0 text-zinc-500" />
                      {action.label}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer hints */}
            <div className="border-t border-zinc-800/60 px-4 py-2">
              <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                <span><kbd className="font-mono">Up/Down</kbd> navigate</span>
                <span><kbd className="font-mono">Enter</kbd> open</span>
                <span><kbd className="font-mono">Esc</kbd> close</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
