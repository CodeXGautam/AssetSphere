"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard, Package, BookOpen, Bell,
  ClipboardList, ShieldCheck, Tags, Layers, Users, Building2,
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

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.isSuperAdmin === true;
  const isOrgAdmin   = session?.user?.orgRole === "ORG_ADMIN";

  const nav = isSuperAdmin ? SUPERADMIN_NAV : isOrgAdmin ? ADMIN_NAV : USER_NAV;

  const roleLabel = isSuperAdmin ? "Super Admin" : isOrgAdmin ? "Org Admin" : "Member";

  return (
    <aside className="flex h-screen w-[220px] shrink-0 flex-col border-r border-[--border] bg-[--card]">
      {/* Brand */}
      <div className="flex h-12 items-center gap-2.5 border-b border-[--border] px-4">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[--primary]">
          <Layers size={13} className="text-white" />
        </div>
        <span className="text-sm font-semibold text-foreground">AssetSphere</span>
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
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
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
}
