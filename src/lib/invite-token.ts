import crypto from "crypto";

/** Generate a cryptographically random invite token */
export function generateInviteToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/** Default TTL: 48 hours from now */
export function inviteExpiry(): Date {
  return new Date(Date.now() + 48 * 60 * 60 * 1000);
}
