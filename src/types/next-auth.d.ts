import type { OrgRole } from "@/types";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id:           string;
      orgId:        string | null;
      orgRole:      OrgRole | null;
      isSuperAdmin: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    orgId:        string | null;
    orgRole:      OrgRole | null;
    isSuperAdmin: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?:           string;
    orgId?:        string | null;
    orgRole?:      OrgRole | null;
    isSuperAdmin?: boolean;
  }
}
