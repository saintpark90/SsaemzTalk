import { NextRequest, NextResponse } from "next/server";
import { MembershipRole } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getApiUser, getApprovedMembership } from "@/lib/auth-helpers";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(_req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await getApprovedMembership(user.id);
  if (!membership) {
    return NextResponse.json({ error: "No approved membership" }, { status: 403 });
  }

  const { id } = await params;
  const schedule = await prisma.schedule.findFirst({
    where: { id, companyId: membership.companyId },
  });
  if (!schedule) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const canDelete =
    schedule.teacherId === user.id ||
    schedule.createdById === user.id ||
    membership.role === MembershipRole.ADMIN;

  if (!canDelete) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.schedule.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
