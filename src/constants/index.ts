export const ROLES = ["ADMIN", "USER"] as const;

export const ORG_ROLES = ["ORG_ADMIN", "MEMBER"] as const;

export const BOOKING_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "ISSUED",
  "RETURNED",
  "OVERDUE",
] as const;

export const ASSET_STATUSES = ["ACTIVE", "MAINTENANCE", "RETIRED"] as const;

export const ASSET_CONDITIONS = [
  "EXCELLENT",
  "GOOD",
  "FAIR",
  "NEEDS_REPAIR",
] as const;

/** Invite token TTL in milliseconds (48 hours) */
export const INVITE_TTL_MS = 48 * 60 * 60 * 1000;
