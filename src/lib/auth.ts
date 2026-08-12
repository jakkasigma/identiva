import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "./prisma";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { username: parsed.data.username },
          include: { mitra: true, cabang: true },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: String(user.id),
          name: user.username,
          username: user.username,
          role: user.role,
          mitraId: user.mitraId,
          mitraNama: user.mitra?.nama ?? null,
          cabangId: user.cabangId ?? null,
          cabangNama: user.cabang?.nama ?? null,
          cabangKode: user.cabang?.kode ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
        token.role = user.role;
        token.mitraId = user.mitraId;
        token.mitraNama = user.mitraNama;
        token.cabangId = user.cabangId;
        token.cabangNama = user.cabangNama;
        token.cabangKode = user.cabangKode;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub ?? "";
      session.user.username = token.username as string | undefined;
      session.user.role = token.role as typeof session.user.role;
      session.user.mitraId = token.mitraId as number | null | undefined;
      session.user.mitraNama = token.mitraNama as string | null | undefined;
      session.user.cabangId = token.cabangId as number | null | undefined;
      session.user.cabangNama = token.cabangNama as string | null | undefined;
      session.user.cabangKode = token.cabangKode as string | null | undefined;
      return session;
    },
  },
});
