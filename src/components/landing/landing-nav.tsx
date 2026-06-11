"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Layers, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Theme, getTheme, setTheme } from "@/lib/theme";

const NAV = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features",     href: "#features"     },
  { label: "About",        href: "#about"        },
];

export function LandingNav() {
  const [scrolled,   setScrolled]   = useState(false);
  const [open,       setOpen]       = useState(false);
  const [theme,      setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    setThemeState(getTheme());
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeState(next);
  }

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
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="rounded-lg p-1.5 text-[--fg-muted] transition-colors hover:bg-[--surface] hover:text-[--fg]"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
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
          <button onClick={toggle} className="rounded-lg p-1.5 text-[--fg-muted]">
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
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
              <Link href="/login"   className="text-sm text-[--fg-muted]">Sign in</Link>
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
