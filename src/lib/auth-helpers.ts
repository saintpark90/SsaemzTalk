import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { MembershipRole, MembershipStatus } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export async function getApiUser(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!token?.id) return null;
  return {
    id: String(token.id),
    email: token.email ? String(token.email) : "",
    membership: token.membership ?? null,
  };
}

export async function getApprovedMembership(userId: string) {
  return prisma.membership.findFirst({
    where: { userId, status: MembershipStatus.APPROVED },
    include: { company: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function assertAdmin(userId: string, companyId: string) {
  return prisma.membership.findFirst({
    where: {
      userId,
      companyId,
      role: MembershipRole.ADMIN,
      status: MembershipStatus.APPROVED,
    },
  });
}
