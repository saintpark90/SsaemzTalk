import { NextRequest, NextResponse } from "next/server";
import { MembershipRole } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getApiUser, getApprovedMembership } from "@/lib/auth-helpers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ loanId: string }> }
) {
  const user = await getApiUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await getApprovedMembership(user.id);
  if (!membership) {
    return NextResponse.json({ error: "No approved membership" }, { status: 403 });
  }

  const { loanId } = await params;
  const body = await req.json().catch(() => null);
  const status = String(body?.status ?? "");

  if (status !== "RETURNED") {
    return NextResponse.json({ error: "Only RETURNED supported" }, { status: 400 });
  }

  const loan = await prisma.materialLoan.findUnique({
    where: { id: loanId },
    include: { material: true },
  });

  if (!loan || loan.material.companyId !== membership.companyId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const canReturn =
    loan.userId === user.id || membership.role === MembershipRole.ADMIN;
  if (!canReturn) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (loan.status === "RETURNED") {
    return NextResponse.json({ loan });
  }

  const [updated] = await prisma.$transaction([
    prisma.materialLoan.update({
      where: { id: loanId },
      data: { status: "RETURNED", returnedAt: new Date() },
      include: { user: { select: { id: true, name: true } } },
    }),
    prisma.material.update({
      where: { id: loan.materialId },
      data: { availableQty: { increment: loan.quantity } },
    }),
  ]);

  return NextResponse.json({ loan: updated });
}
