import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string;
      role?: Role;
      mitraId?: number | null;
      mitraNama?: string | null;
      cabangId?: number | null;
      cabangNama?: string | null;
      cabangKode?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    username?: string;
    role?: Role;
    mitraId?: number | null;
    mitraNama?: string | null;
    cabangId?: number | null;
    cabangNama?: string | null;
    cabangKode?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string;
    role?: Role;
    mitraId?: number | null;
    mitraNama?: string | null;
    cabangId?: number | null;
    cabangNama?: string | null;
    cabangKode?: string | null;
  }
}
