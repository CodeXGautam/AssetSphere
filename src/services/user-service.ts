import bcryptjs from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/user";
import type { OrgRole } from "@/types";

const SALT_ROUNDS = 10;

export interface UserProfile {
  id:           string;
  name:         string;
  email:        string;
  orgId:        string | null;
  orgRole:      OrgRole | null;
  isSuperAdmin: boolean;
}

function toProfile(u: {
  _id: unknown;
  name: string;
  email: string;
  orgId?: unknown;
  orgRole?: string | null;
  isSuperAdmin?: boolean;
}): UserProfile {
  return {
    id:           String(u._id),
    name:         u.name,
    email:        u.email,
    orgId:        u.orgId ? String(u.orgId) : null,
    orgRole:      (u.orgRole as OrgRole | null) ?? null,
    isSuperAdmin: u.isSuperAdmin ?? false,
  };
}

export const userService = {
  async createUser({
    name,
    email,
    password,
    orgId        = null,
    orgRole      = null,
    isSuperAdmin = false,
  }: {
    name:         string;
    email:        string;
    password:     string;
    orgId?:       string | null;
    orgRole?:     OrgRole | null;
    isSuperAdmin?: boolean;
  }): Promise<UserProfile> {
    await connectToDatabase();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new Error("Email already in use.");

    const passwordHash = await bcryptjs.hash(password, SALT_ROUNDS);
    const user = await User.create({
      name,
      email:        email.toLowerCase(),
      passwordHash,
      orgId:        orgId ?? null,
      orgRole:      orgRole ?? null,
      isSuperAdmin,
    });

    return toProfile(user);
  },

  async verifyCredentials({ email, password }: { email: string; password: string }): Promise<UserProfile | null> {
    await connectToDatabase();

    // Use mongoose Document (not lean) so schema defaults are applied to missing fields
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return null;

    const valid = await bcryptjs.compare(password, user.passwordHash as string);
    if (!valid) return null;

    // Explicitly build the profile — don't rely on schema defaults for missing DB fields
    return {
      id:           user._id.toString(),
      name:         user.name as string,
      email:        user.email as string,
      orgId:        user.orgId ? String(user.orgId) : null,
      orgRole:      (user.orgRole as OrgRole | null) ?? null,
      // Explicitly read isSuperAdmin — if field missing in old doc, get() returns undefined → default false
      isSuperAdmin: user.get("isSuperAdmin") === true,
    };
  },

  async findById(id: string): Promise<UserProfile | null> {
    await connectToDatabase();
    const user = await User.findById(id);
    if (!user) return null;
    return toProfile(user);
  },

  async updateOrgRole(userId: string, orgRole: OrgRole): Promise<UserProfile | null> {
    await connectToDatabase();
    const user = await User.findByIdAndUpdate(userId, { orgRole }, { new: true });
    if (!user) return null;
    return toProfile(user);
  },
};
