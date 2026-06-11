import type { NextAuthConfig } from "next-auth";
import type { OrgRole } from "@/types";

/**
 * Edge-safe auth config.
 * Used by middleware (Edge Runtime) -- NO Mongoose/bcryptjs imports here.
 */
export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge:   24 * 60 * 60, // 24 hours
  },

  pages: {
    signIn: "/login",
    error:  "/login",
  },

  providers: [],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id           = user.id;
        token.orgId        = (user as { orgId?: string | null }).orgId ?? null;
        token.orgRole      = (user as { orgRole?: OrgRole | null }).orgRole ?? null;
        token.isSuperAdmin = (user as { isSuperAdmin?: boolean }).isSuperAdmin ?? false;
      }
      return token;
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id           = (token.id as string) ?? token.sub ?? "";
        session.user.orgId        = (token.orgId as string | null)   ?? null;
        session.user.orgRole      = (token.orgRole as OrgRole | null) ?? null;
        session.user.isSuperAdmin = (token.isSuperAdmin as boolean)   ?? false;
      }
      return session;
    },
  },
};
