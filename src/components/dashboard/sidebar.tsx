"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard, Package, BookOpen, Bell,
  ClipboardList, ShieldCheck, Tags, Layers, Users, Building2, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SUPERADMIN_NAV = [
  { label: "Dashboard",    href: "/dashboard",        icon: LayoutDashboard },
  { label: "Org Requests", href: "/superadmin/orgs",  icon: Building2 },
  { label: "Assets",       href: "/admin/assets",      icon: Package },
  { label: "Categories",   href: "/admin/categories",  icon: Tags },
  { label: "Bookings",     href: "/admin/bookings",    icon: ClipboardList },
  { label: "Members",      href: "/admin/members",     icon: Users },
  { label: "Audit Logs",   href: "/admin/audit-logs",  icon: ShieldCheck },
];

const ADMIN_NAV = [
  { label: "Dashboard",  href: "/dashboard",        icon: LayoutDashboard },
  { label: "Assets",     href: "/admin/assets",      icon: Package },
  { label: "Categories", href: "/admin/categories",  icon: Tags },
  { label: "Bookings",   href: "/admin/bookings",    icon: ClipboardList },
  { label: "Members",    href: "/admin/members",     icon: Users },
  { label: "Audit Logs", href: "/admin/audit-logs",  icon: ShieldCheck },
];

const USER_NAV = [
  { label: "Dashboard",     href: "/dashboard",     icon: LayoutDashboard },
  { label: "Browse Assets", href: "/assets",        icon: Package },
  { label: "My Bookings",   href: "/bookings",      icon: BookOpen },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.isSuperAdmin === true;
  const isOrgAdmin   = session?.user?.orgRole === "ORG_ADMIN";

  const nav = isSuperAdmin ? SUPERADMIN_NAV : isOrgAdmin ? ADMIN_NAV : USER_NAV;
  const roleLabel = isSuperAdmin ? "Super Admin" : isOrgAdmin ? "Org Admin" : "Member";

  const sidebarContent = (
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-[--border] bg-[--card]">
      {/* Brand */}
      <div className="flex h-12 items-center justify-between border-b border-[--border] px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[--primary]">
            <Layers size={13} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-foreground">AssetSphere</span>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onMobileClose}
          className="rounded-md p-1 text-[--muted-fg] transition-colors hover:bg-[--muted] hover:text-foreground md:hidden"
          aria-label="Close menu"
        >
          <X size={15} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {nav.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-[--primary]/10 text-[--primary] font-medium"
                  : "text-[--muted-fg] hover:bg-[--muted] hover:text-foreground"
              )}
            >
              <Icon size={15} className="shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Role tag */}
      <div className="border-t border-[--border] px-4 py-3">
        <p className="text-[10px] uppercase tracking-wider text-[--muted-fg]">
          {roleLabel}
        </p>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <div className="hidden md:flex h-screen">
        {sidebarContent}
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={onMobileClose}
            aria-hidden
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 h-full md:hidden">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}