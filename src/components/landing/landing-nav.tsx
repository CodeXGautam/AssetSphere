"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const NAV = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features",     href: "#features"     },
  { label: "About",        href: "#about"        },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-[--border] bg-[--bg]/90 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 select-none">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[--primary]">
            <Layers size={12} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-[--fg]">
            Asset<span className="text-[--primary]">Sphere</span>
          </span>
        </Link>

        {/* Desktop centre links */}
        <div className="hidden items-center gap-6 md:flex">
          {NAV.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-[--fg-muted] transition-colors hover:text-[--fg]"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop right actions */}
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-lg px-3 py-1.5 text-sm text-[--fg-muted] transition-colors hover:text-[--fg]"
          >
            Sign in
          </Link>
          <Link
            href="/onboard"
            className="rounded-lg bg-[--primary] px-3.5 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Get started
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1.5 md:hidden">
          <ThemeToggle />
          <button onClick={() => setOpen((v) => !v)} className="rounded-lg p-1.5 text-[--fg-muted]">
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-[--border] bg-[--bg] px-5 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm text-[--fg-muted] hover:text-[--fg]"
              >
                {l.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 border-t border-[--border] pt-3 mt-1">
              <Link href="/login" className="text-sm text-[--fg-muted]">Sign in</Link>
              <Link
                href="/onboard"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-[--primary] px-4 text-sm font-medium text-white"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
