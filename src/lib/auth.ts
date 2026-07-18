import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { MembershipStatus } from "@/lib/constants";
import type { SessionMembership } from "@/types/next-auth";

async function loadMembership(userId: string): Promise<SessionMembership> {
  const approved = await prisma.membership.findFirst({
    where: { userId, status: MembershipStatus.APPROVED },
    include: { company: true },
    orderBy: { updatedAt: "desc" },
  });

  const selected =
    approved ??
    (await prisma.membership.findFirst({
      where: { userId, status: MembershipStatus.PENDING },
      include: { company: true },
      orderBy: { updatedAt: "desc" },
    }));

  if (!selected) return null;

  return {
    id: selected.id,
    companyId: selected.companyId,
    companyName: selected.company.name,
    role: selected.role as NonNullable<SessionMembership>["role"],
    status: selected.status as NonNullable<SessionMembership>["status"],
  };
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    // Phase 2: Kakao / Google / Naver OAuth providers
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      if (token.id) {
        token.membership = await loadMembership(token.id);
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: (token.email as string) || session.user?.email || "",
        name: (token.name as string) || session.user?.name || "",
        image: session.user?.image,
      };
      session.membership = token.membership ?? null;
      return session;
    },
  },
};
