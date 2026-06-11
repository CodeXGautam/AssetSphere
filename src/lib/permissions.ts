import type { OrgRole } from "@/types";

/** Platform-level superadmin — full access to everything */
export function isSuperAdmin(flag?: boolean): boolean {
  return flag === true;
}

/** Org-level admin — full write within their org */
export function isOrgAdmin(orgRole?: OrgRole | null): boolean {
  return orgRole === "ORG_ADMIN";
}

/** Any authenticated org member (includes ORG_ADMIN) */
export function isOrgMember(orgRole?: OrgRole | null): boolean {
  return orgRole === "ORG_ADMIN" || orgRole === "MEMBER";
}

/** Can manage org assets/categories (superadmin OR org admin) */
export function canManageAssets(flag?: boolean, orgRole?: OrgRole | null): boolean {
  return isSuperAdmin(flag) || isOrgAdmin(orgRole);
}

// Legacy aliases kept for compatibility with existing route handlers
export function isAdmin(role?: string): boolean {
  return role === "ADMIN";
}

export function requireAdmin(role?: string): boolean {
  return isAdmin(role);
}
