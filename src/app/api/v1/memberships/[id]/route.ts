import { NextRequest, NextResponse } from "next/server";
import { MembershipStatus } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { assertAdmin, getApiUser } from "@/lib/auth-helpers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const status = body?.status as string | undefined;

  if (
    status !== MembershipStatus.APPROVED &&
    status !== MembershipStatus.REJECTED
  ) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const membership = await prisma.membership.findUnique({ where: { id } });
  if (!membership) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const admin = await assertAdmin(user.id, membership.companyId);
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.membership.update({
    where: { id },
    data: { status },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({ membership: updated });
}
