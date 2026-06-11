"use client";

import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

const TITLES: Record<string, string> = {
  "/dashboard":         "Dashboard",
  "/assets":            "Browse Assets",
  "/bookings":          "My Bookings",
  "/notifications":     "Notifications",
  "/admin/assets":      "Asset Management",
  "/admin/categories":  "Categories",
  "/admin/bookings":    "Booking Approvals",
  "/admin/members":     "Members",
  "/admin/audit-logs":  "Audit Logs",
  "/superadmin/orgs":   "Organisation Requests",
};

function getTitle(p: string) {
  for (const [path, title] of Object.entries(TITLES)) {
    if (p === path || p.startsWith(path + "/")) return title;
  }
  return "AssetSphere";
}

export function Topbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-[--border] bg-[--card] px-5">
      <h1 className="text-sm font-medium text-foreground">{getTitle(pathname)}</h1>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Avatar name={session?.user?.name} size="sm" />
          <div className="hidden flex-col md:flex">
            <span className="text-xs font-medium leading-none text-foreground">
              {session?.user?.name ?? "User"}
            </span>
            <span className="mt-0.5 text-[10px] leading-none text-[--muted-fg]">
              {session?.user?.isSuperAdmin
                ? "Super Admin"
                : session?.user?.orgRole === "ORG_ADMIN"
                ? "Org Admin"
                : session?.user?.email}
            </span>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-md p-1.5 text-[--muted-fg] transition-colors hover:bg-[--muted] hover:text-foreground"
          title="Sign out"
        >
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}
