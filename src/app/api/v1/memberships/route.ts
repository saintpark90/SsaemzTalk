import { NextRequest, NextResponse } from "next/server";
import { MembershipRole, MembershipStatus } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = req.nextUrl.searchParams.get("status");
  const companyId = req.nextUrl.searchParams.get("companyId");

  const adminMembership = await prisma.membership.findFirst({
    where: {
      userId: user.id,
      role: MembershipRole.ADMIN,
      status: MembershipStatus.APPROVED,
      ...(companyId ? { companyId } : {}),
    },
  });

  if (!adminMembership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const memberships = await prisma.membership.findMany({
    where: {
      companyId: adminMembership.companyId,
      ...(status ? { status } : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ memberships });
}

export async function POST(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const companyId = body?.companyId as string | undefined;
  if (!companyId) {
    return NextResponse.json({ error: "companyId required" }, { status: 400 });
  }

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const existing = await prisma.membership.findUnique({
    where: { userId_companyId: { userId: user.id, companyId } },
  });

  if (existing?.status === MembershipStatus.APPROVED) {
    return NextResponse.json({ error: "Already a member" }, { status: 409 });
  }

  if (existing?.status === MembershipStatus.PENDING) {
    return NextResponse.json({ membership: existing });
  }

  const membership = existing
    ? await prisma.membership.update({
        where: { id: existing.id },
        data: { status: MembershipStatus.PENDING, role: MembershipRole.TEACHER },
      })
    : await prisma.membership.create({
        data: {
          userId: user.id,
          companyId,
          role: MembershipRole.TEACHER,
          status: MembershipStatus.PENDING,
        },
      });

  return NextResponse.json({ membership }, { status: 201 });
}
