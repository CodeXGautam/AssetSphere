import Link from "next/link";
import { Layers } from "lucide-react";

const LINKS = {
  Platform: [
    { label: "How it works", href: "#how-it-works" },
    { label: "Features",     href: "#features"     },
    { label: "For who",      href: "#about"        },
  ],
  Account: [
    { label: "Create organisation", href: "/onboard"   },
    { label: "Sign in",             href: "/login"     },
    { label: "Register",            href: "/register"  },
  ],
};

export function LandingFooter() {
  return (
    <footer className="border-t border-[--border] bg-[--bg-subtle]">
      <div className="mx-auto max-w-6xl px-5 py-12 md:px-8">
        <div className="grid gap-10 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[--primary]">
                <Layers size={12} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-[--fg]">AssetSphere</span>
            </Link>
            <p className="mt-3 max-w-[200px] text-xs leading-relaxed text-[--fg-muted]">
              Shared resource management for modern organisations.
            </p>
          </div>

          {/* Nav columns */}
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[--fg-subtle]">
                {group}
              </p>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-[--fg-muted] transition-colors hover:text-[--fg]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-[--border] pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-[--fg-subtle]">
            &copy; {new Date().getFullYear()} AssetSphere. All rights reserved.
          </p>
          <p className="text-xs text-[--fg-subtle]">
            Open for any team that needs resource management.
          </p>
        </div>
      </div>
    </footer>
  );
}
